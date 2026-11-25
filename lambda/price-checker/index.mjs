import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssm = new SSMClient({});
let db;

/**
 * Returns a Firestore handle authenticated with the Firebase service account.
 *
 * Lambda is just a serverless runtime with no signed-in user, so it needs an
 * identity of its own to talk to Firestore. A Google service account provides
 * that identity for server-side code. Note that firebase-admin authenticates as
 * the service account and bypasses Firestore security rules.
 *
 * The service account JSON is stored (encrypted) in AWS Parameter Store under the
 * name in the SA_PARAM env var, so the key is never committed to the repo. The
 * result is cached in module scope, so a warm Lambda container reuses the same
 * connection and only pays the Parameter Store round trip on a cold start.
 */
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

// A usable price is a finite number greater than zero (rejects NaN, "", 0, negatives).
const isPrice = (p) => Number.isFinite(p) && p > 0;

// Runs findPrice over each node and returns the first price found, or null.
// Used for both arrays and for the child values of an object.
const firstPrice = (nodes) => nodes.map(findPrice).find((p) => p !== null) ?? null;

/**
 * Recursively searches a parsed JSON-LD value for a product price.
 *
 * Stores publish structured data in many shapes: a single object, an array of
 * objects, or an object with an "@graph" array. Rather than handle each shape,
 * this walks the whole tree. At each object it first checks `offers` (which can
 * be one offer or a list) and reads `price`, falling back to `lowPrice` for
 * price ranges. If that finds nothing, it recurses into every child value.
 *
 * Returns the first valid price as a number, or null if there is none.
 */
export function findPrice(node) {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) return firstPrice(node);

  const offerPrice = [node.offers ?? []]
    .flat()
    .map((o) => Number(o?.price ?? o?.lowPrice))
    .find(isPrice);
  return offerPrice ?? firstPrice(Object.values(node));
}

// JSON.parse that returns null instead of throwing. Malformed JSON-LD blocks are
// common on real sites, and one bad block shouldn't stop us checking the others.
const parseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

/**
 * Pulls a price out of a product page's raw HTML.
 *
 * Finds every <script type="application/ld+json"> block with a regex, parses
 * each one, and returns the first price findPrice can locate. Returns null when
 * the page has no JSON-LD or none of it contains a price. Pages that only render
 * prices with JavaScript (no JSON-LD in the HTML) won't work.
 */
export function extractPrice(html) {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  return (
    [...html.matchAll(re)]
      .map((m) => findPrice(parseJson(m[1])))
      .find((p) => p !== null) ?? null
  );
}

/**
 * Checks a single wish list item's link and returns the fields to save on it.
 *
 * Success: `{ currentPrice, lastCheckedAt }`.
 * Failure: `{ priceError, lastCheckedAt }`, where priceError is a short message
 * such as "HTTP 403" or "no price found" (the UI maps these to notices).
 *
 * It never throws, so a single bad link can't break the rest of the run. The
 * request uses a browser-like user-agent (some sites reject unknown clients)
 * and a 10 second timeout so a hung site can't stall the Lambda.
 */
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

/**
 * Lambda entry point, triggered daily by EventBridge Scheduler.
 *
 * Loads every vehicle, checks the price of each wish list item that has a link,
 * and writes the result back onto that item in Firestore. Logs the number of
 * items checked as JSON for CloudWatch.
 */
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