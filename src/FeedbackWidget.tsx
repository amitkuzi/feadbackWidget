"use client";

import { useState, type FormEvent } from "react";
import type { FeedbackStore, FeedbackInput } from "./types";
import { styles } from "./styles";

export interface FeedbackWidgetProps {
  /** Storage adapter that persists submitted feedback. */
  store: FeedbackStore;
  /** App tag, attached to each item so one store can serve many projects. */
  project?: string;
  /** Prefilled reporter identity (e.g. the logged-in user). */
  reporter?: { name?: string; email?: string };
  /** Optional category options; shows a select when provided. */
  categories?: string[];
  /** Corner to anchor the launcher button to. Default "bottom-right". */
  position?: "bottom-right" | "bottom-left";
  /** Text direction. Defaults to the document's dir, else "ltr". */
  dir?: "ltr" | "rtl";
  /** When false, renders nothing (use to gate by environment). Default true. */
  enabled?: boolean;
  /** Extra fields attached to every submission. */
  metadata?: Record<string, unknown>;
  /** Label on the launcher button. */
  buttonLabel?: string;
  /** Heading inside the panel. */
  title?: string;
  /** Called with the new item's id after a successful submit. */
  onSubmitted?: (id: string) => void;
}

function resolveDir(dir?: "ltr" | "rtl"): "ltr" | "rtl" {
  if (dir) return dir;
  if (typeof document !== "undefined" && document.dir === "rtl") return "rtl";
  return "ltr";
}

export function FeedbackWidget({
  store,
  project,
  reporter,
  categories,
  position = "bottom-right",
  dir,
  enabled = true,
  metadata,
  buttonLabel = "Feedback",
  title = "Send feedback",
  onSubmitted,
}: FeedbackWidgetProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState(reporter?.name ?? "");
  const [email, setEmail] = useState(reporter?.email ?? "");
  const [category, setCategory] = useState(categories?.[0] ?? "");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!enabled) return null;

  const resolvedDir = resolveDir(dir);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    setError(null);

    const input: FeedbackInput = {
      message: message.trim(),
      category: category || undefined,
      reporterName: name.trim() || undefined,
      reporterEmail: email.trim() || undefined,
      project,
      url: typeof window !== "undefined" ? window.location.href : "",
      pathname: typeof window !== "undefined" ? window.location.pathname : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      viewport: {
        w: typeof window !== "undefined" ? window.innerWidth : 0,
        h: typeof window !== "undefined" ? window.innerHeight : 0,
      },
      metadata,
    };

    try {
      const id = await store.submit(input);
      setDone(true);
      setMessage("");
      onSubmitted?.(id);
    } catch (err) {
      console.error("[feedback-widget] submit failed:", err);
      setError("Could not send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function reset() {
    setOpen(false);
    setDone(false);
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        style={styles.launcher(position)}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {buttonLabel}
      </button>

      {open && (
        <div role="dialog" aria-label={title} style={styles.panel(position, resolvedDir)}>
          {done ? (
            <>
              <h3 style={styles.title}>Thanks! 🎉</h3>
              <p style={styles.note}>Your feedback was sent.</p>
              <div style={styles.row}>
                <button type="button" style={styles.submit} onClick={() => setDone(false)}>
                  Send another
                </button>
                <button type="button" style={styles.ghostBtn} onClick={reset}>
                  Close
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={styles.title}>{title}</h3>

              {categories && categories.length > 0 && (
                <select
                  style={styles.field}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}

              <textarea
                style={{ ...styles.field, ...styles.textarea }}
                placeholder="What's on your mind?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                autoFocus
                required
              />

              {!reporter?.name && (
                <input
                  style={styles.field}
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              {!reporter?.email && (
                <input
                  style={styles.field}
                  type="email"
                  placeholder="Your email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              )}

              {error && <p style={{ ...styles.note, color: "#b91c1c" }}>{error}</p>}

              <div style={styles.row}>
                <button type="submit" style={styles.submit} disabled={sending}>
                  {sending ? "Sending…" : "Send"}
                </button>
                <button type="button" style={styles.ghostBtn} onClick={reset}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}
