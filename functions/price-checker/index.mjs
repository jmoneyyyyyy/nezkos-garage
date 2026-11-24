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

// Walk JSON-LD (including @graph) looking for offers.price / lowPrice.
function findPrice(node) {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const n of node) {
      const p = findPrice(n);
      if (p !== null) return p;
    }
    return null;
  }
  if (node.offers) {
    for (const o of Array.isArray(node.offers) ? node.offers : [node.offers]) {
      const p = Number(o?.price ?? o?.lowPrice);
      if (Number.isFinite(p) && p > 0) return p;
    }
  }
  for (const v of Object.values(node)) {
    const p = findPrice(v);
    if (p !== null) return p;
  }
  return null;
}

function extractPrice(html) {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const m of html.matchAll(re)) {
    try {
      const p = findPrice(JSON.parse(m[1]));
      if (p !== null) return p;
    } catch {
      // ignore malformed JSON-LD blocks
    }
  }
  return null;
}

// Fetch one item's page and return the price fields to save.
async function checkItem(item) {
  const now = new Date().toISOString();
  try {
    const res = await fetch(item.url, {
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

  for (const v of vehicles.docs) {
    const items = v.data().wishlist ?? [];
    const results = new Map();

    for (const item of items) {
      if (!item.url) continue;
      results.set(item.id, await checkItem(item));
      checked++;
    }
    if (!results.size) continue;

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