import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type Firestore,
  type QueryConstraint,
  type DocumentData,
} from "firebase/firestore";
import type {
  FeedbackDoc,
  FeedbackInput,
  FeedbackStore,
  FeedbackStatus,
} from "../types";

export interface FirestoreStoreOptions {
  /** A Firestore instance from the consumer's own Firebase app. */
  db: Firestore;
  /** Collection to store feedback in. Default "feedback". */
  collectionName?: string;
}

function toDoc(id: string, data: DocumentData): FeedbackDoc {
  const created = data.createdAt;
  const createdAt =
    created instanceof Timestamp ? created.toDate().toISOString() : undefined;
  return {
    id,
    message: data.message ?? "",
    category: data.category,
    reporterName: data.reporterName,
    reporterEmail: data.reporterEmail,
    project: data.project,
    url: data.url ?? "",
    pathname: data.pathname ?? "",
    userAgent: data.userAgent ?? "",
    viewport: data.viewport ?? { w: 0, h: 0 },
    metadata: data.metadata,
    status: (data.status as FeedbackStatus) ?? "open",
    createdAt,
  };
}

/** Strip undefined values — Firestore rejects them. */
function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

/**
 * Built-in Firestore adapter. Pass the `db` from your own Firebase app.
 * Requires Firestore security rules permitting create (and admin read/update).
 */
export function createFirestoreStore({
  db,
  collectionName = "feedback",
}: FirestoreStoreOptions): FeedbackStore {
  const col = () => collection(db, collectionName);

  return {
    async submit(input: FeedbackInput): Promise<string> {
      const ref = await addDoc(
        col(),
        clean({
          ...input,
          status: "open" as FeedbackStatus,
          createdAt: serverTimestamp(),
        })
      );
      return ref.id;
    },

    subscribe({ project }, cb, onError) {
      const constraints: QueryConstraint[] = [];
      if (project) constraints.push(where("project", "==", project));
      constraints.push(orderBy("createdAt", "desc"));
      const q = query(col(), ...constraints);
      return onSnapshot(
        q,
        (snap) => cb(snap.docs.map((d) => toDoc(d.id, d.data()))),
        (err) => onError?.(err)
      );
    },

    async list({ project }): Promise<FeedbackDoc[]> {
      const constraints: QueryConstraint[] = [];
      if (project) constraints.push(where("project", "==", project));
      constraints.push(orderBy("createdAt", "desc"));
      const snap = await getDocs(query(col(), ...constraints));
      return snap.docs.map((d) => toDoc(d.id, d.data()));
    },

    async update(id: string, patch: { status: FeedbackStatus }): Promise<void> {
      await updateDoc(doc(db, collectionName, id), { status: patch.status });
    },

    async remove(id: string): Promise<void> {
      await deleteDoc(doc(db, collectionName, id));
    },
  };
}
