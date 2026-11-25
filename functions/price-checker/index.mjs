import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssm = new SSMClient({});
let db;

// Load the service account from Parameter Store once per container.
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

const isPrice = (p) => Number.isFinite(p) && p > 0;
const firstPrice = (nodes) => nodes.map(findPrice).find((p) => p !== null) ?? null;

// Walk JSON-LD (including @graph) looking for offers.price / lowPrice.
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

export function extractPrice(html) {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  return (
    [...html.matchAll(re)]
      .map((m) => findPrice(parseJson(m[1])))
      .find((p) => p !== null) ?? null
  );
}

// Fetch one item's page and return the price fields to save.
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

export const handler = async () => {
  const db = await getDb();
  const vehicles = await db.collection("vehicles").get();
  let checked = 0;

  // One vehicle at a time; the items within a vehicle are checked in parallel.
  for (const v of vehicles.docs) {
    const withLinks = (v.data().wishlist ?? []).filter((item) => item.link);
    if (!withLinks.length) continue;

    // Promise.all starts every fetch at once and waits for the slowest, so a vehicle
    // takes about as long as its slowest page instead of the sum of all of them (the old
    // loop awaited each item in turn, and one 10s timeout delayed every item after it).
    // checkItem never throws, so one failed page can't reject the whole batch.
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