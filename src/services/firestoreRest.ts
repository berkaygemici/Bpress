type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } }
  | { timestampValue: string }
  | { nullValue: null };

type FirestoreDocument = {
  name: string;
  fields: Record<string, FirestoreValue>;
  createTime: string;
  updateTime: string;
};

type RunQueryResponse = { document?: FirestoreDocument };

function decodeValue(v: FirestoreValue | undefined): unknown {
  if (!v) return undefined;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("booleanValue" in v) return v.booleanValue;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map((x) => decodeValue(x));
  if ("mapValue" in v) {
    const out: Record<string, unknown> = {};
    const f: Record<string, FirestoreValue> = v.mapValue.fields || {};
    for (const k of Object.keys(f)) out[k] = decodeValue(f[k]);
    return out;
  }
  if ("timestampValue" in v) return v.timestampValue;
  if ("nullValue" in v) return null;
  return undefined;
}

export async function fetchPublishedPostsViaREST(
  limitCount = 20
): Promise<Array<{ id: string; createdAt?: number; [k: string]: unknown }>> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: "posts" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "status" },
          op: "EQUAL",
          value: { stringValue: "published" },
        },
      },
      limit: limitCount,
    },
  };
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) return [];
  const rows: RunQueryResponse[] = await res.json();
  const docs: Array<{ id: string; createdAt?: number; [k: string]: unknown }> = rows
    .map((r) => r.document)
    .filter(Boolean)
    .map((doc) => {
      const id = doc!.name.split("/").pop() as string;
      const decoded: Record<string, unknown> = {};
      for (const k of Object.keys(doc!.fields || {})) decoded[k] = decodeValue(doc!.fields[k]);
      return { id, ...decoded };
    });
  docs.sort((a, b) => ((b.createdAt as number | undefined) || 0) - ((a.createdAt as number | undefined) || 0));
  return docs;
}


