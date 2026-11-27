export type UpcomingItem = { type: string; due: string };

// Parses Claude's "**Type:** due ..." bullets into items.
export function parseUpcoming(reply: string): UpcomingItem[] {
  return [...reply.matchAll(/\*\*(.+?):?\*\*:?\s*([^*]*)/g)]
    .map(([, type, due]) => ({
      type: type.replace(/:$/, "").trim(),
      due: due.replace(/(^[\s:-]+|[\s-]+$)/g, ""),
    }))
    .filter((i) => i.type && i.due);
}
