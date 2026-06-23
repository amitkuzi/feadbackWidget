/** Status of a feedback item in its lifecycle. */
export type FeedbackStatus = "open" | "done";

/**
 * Payload built by the widget at submit time. The store is responsible for
 * persisting it (and typically stamping `status: "open"` + a created timestamp).
 */
export interface FeedbackInput {
  /** The free-text comment from the reporter. */
  message: string;
  /** Optional category chosen from the widget's `categories` prop. */
  category?: string;
  /** Reporter display name, if known/provided. */
  reporterName?: string;
  /** Reporter email, if known/provided. */
  reporterEmail?: string;
  /** App tag so a single store can serve multiple projects. */
  project?: string;
  /** Full URL the feedback was filed from. */
  url: string;
  /** Pathname only, for quick grouping. */
  pathname: string;
  /** Reporter's user agent string. */
  userAgent: string;
  /** Viewport size at submit time. */
  viewport: { w: number; h: number };
  /** Arbitrary extra fields the consumer wants attached. */
  metadata?: Record<string, unknown>;
}

/** A persisted feedback item as read back by the inbox. */
export interface FeedbackDoc extends FeedbackInput {
  id: string;
  status: FeedbackStatus;
  /** ISO string (adapters normalise their native timestamp to this). */
  createdAt?: string;
}

/**
 * Storage adapter contract. The widget needs only `submit`; the inbox uses the
 * optional read/write methods. Implement this against any backend (Firestore,
 * Supabase, a REST API, …) and pass it to the components.
 */
export interface FeedbackStore {
  /** Persist a new feedback item; resolves with its new id. */
  submit(input: FeedbackInput): Promise<string>;

  /**
   * Live-subscribe to feedback (newest first). Returns an unsubscribe fn.
   * Required by `<FeedbackInbox>`.
   */
  subscribe?(
    opts: { project?: string },
    cb: (items: FeedbackDoc[]) => void,
    onError?: (err: unknown) => void
  ): () => void;

  /** One-shot fetch (newest first). Optional alternative to `subscribe`. */
  list?(opts: { project?: string }): Promise<FeedbackDoc[]>;

  /** Patch an item (currently just its status). */
  update?(id: string, patch: { status: FeedbackStatus }): Promise<void>;

  /** Delete an item. */
  remove?(id: string): Promise<void>;
}
