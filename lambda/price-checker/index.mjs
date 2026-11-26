import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssm = new SSMClient({});
let db;

// Lambda has no signed-in user, so it authenticates to Firestore as a Google service account (key in Parameter Store, cached per container).
async function getDb() {
  if (db) return db;
  const res = await ssm.send(
    new GetParameterCommand({ Name: process.env.SA_PARAM, WithDecryption: true })
  );
  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(res.Parameter.Value)) });
  }
  db = getFirestore();
  return db;
}

// A usable price is a finite number greater than zero.
const isPrice = (p) => Number.isFinite(p) && p > 0;

// Returns the first price findPrice locates in a list of nodes, or null.
const firstPrice = (nodes) => nodes.map(findPrice).find((p) => p !== null) ?? null;

// Walks parsed JSON-LD (any shape, including @graph) for offers.price / lowPrice and returns it, or null.
export function findPrice(node) {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) return firstPrice(node);

  const offerPrice = [node.offers ?? []]
    .flat()
    .map((o) => Number(o?.price ?? o?.lowPrice))
    .find(isPrice);
  return offerPrice ?? firstPrice(Object.values(node));
}

// Malformed JSON-LD blocks are ignored.
const parseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

// Returns the first price found in a page's JSON-LD script blocks, or null.
export function extractPrice(html) {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  return (
    [...html.matchAll(re)]
      .map((m) => findPrice(parseJson(m[1])))
      .find((p) => p !== null) ?? null
  );
}

// Fetches one item's page and returns the price fields to save; never throws.
async function checkItem(item) {
  const now = new Date().toISOString();
  try {
    const res = await fetch(item.link, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; GaragePriceCheck/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const price = extractPrice(await res.text());
    if (price === null) throw new Error("no price found");
    return { currentPrice: price, lastCheckedAt: now };
  } catch (e) {
    return { priceError: String(e.message).slice(0, 100), lastCheckedAt: now };
  }
}

// Daily entry point: checks every wish list item that has a link and saves the result on the vehicle.
export const handler = async () => {
  const db = await getDb();
  const vehicles = await db.collection("vehicles").get();
  let checked = 0;

  // One vehicle at a time; the items within a vehicle are checked in parallel.
  for (const v of vehicles.docs) {
    const withLinks = (v.data().wishlist ?? []).filter((item) => item.link);
    if (!withLinks.length) continue;

    // Parallel fetches mean a vehicle takes as long as its slowest page, not the sum of all.
    const results = new Map(
      await Promise.all(withLinks.map(async (item) => [item.id, await checkItem(item)]))
    );
    checked += withLinks.length;

    // Re-read inside a transaction and merge by item id, so edits made while
    // prices were being fetched are not overwritten.
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(v.ref);
      const current = snap.data().wishlist ?? [];
      const next = current.map((i) => {
        const r = results.get(i.id);
        if (!r) return i;
        const { priceError: _old, ...base } = i; // clear any old error
        return { ...base, ...r };
      });
      tx.update(v.ref, { wishlist: next });
    });
  }

  console.log(JSON.stringify({ checked }));
};