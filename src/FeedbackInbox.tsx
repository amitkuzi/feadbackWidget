"use client";

import { useEffect, useState } from "react";
import type { FeedbackStore, FeedbackDoc } from "./types";
import { styles } from "./styles";

export interface FeedbackInboxProps {
  /** Storage adapter; must implement `subscribe`/`list` and `update`. */
  store: FeedbackStore;
  /** Only show items tagged with this project. */
  project?: string;
  /** Heading. */
  title?: string;
}

export function FeedbackInbox({ store, project, title = "Feedback" }: FeedbackInboxProps) {
  const [items, setItems] = useState<FeedbackDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    if (store.subscribe) {
      unsub = store.subscribe(
        { project },
        (next) => {
          setItems(next);
          setLoading(false);
        },
        (err) => {
          console.error("[feedback-inbox] subscribe failed:", err);
          setError("Could not load feedback.");
          setLoading(false);
        }
      );
    } else if (store.list) {
      store
        .list({ project })
        .then((next) => setItems(next))
        .catch((err) => {
          console.error("[feedback-inbox] list failed:", err);
          setError("Could not load feedback.");
        })
        .finally(() => setLoading(false));
    } else {
      setError("This store does not support reading feedback.");
      setLoading(false);
    }

    return () => unsub?.();
  }, [store, project]);

  async function toggle(item: FeedbackDoc) {
    if (!store.update) return;
    try {
      await store.update(item.id, { status: item.status === "done" ? "open" : "done" });
    } catch (err) {
      console.error("[feedback-inbox] update failed:", err);
    }
  }

  async function remove(item: FeedbackDoc) {
    if (!store.remove) return;
    try {
      await store.remove(item.id);
    } catch (err) {
      console.error("[feedback-inbox] remove failed:", err);
    }
  }

  const openCount = items.filter((i) => i.status !== "done").length;

  return (
    <div style={styles.inbox}>
      <h2 style={styles.title}>
        {title} {!loading && <span style={styles.badge(false)}>{openCount} open</span>}
      </h2>

      {loading && <p style={styles.note}>Loading…</p>}
      {error && <p style={{ ...styles.note, color: "#b91c1c" }}>{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p style={styles.note}>No feedback yet.</p>
      )}

      {items.map((item) => {
        const done = item.status === "done";
        return (
          <div key={item.id} style={styles.card(done)}>
            <p style={styles.cardMsg}>{item.message}</p>
            <div style={styles.meta}>
              <span style={styles.badge(done)}>{done ? "done" : "open"}</span>
              {item.category && <span>{item.category}</span>}
              {item.createdAt && <span>{new Date(item.createdAt).toLocaleString()}</span>}
              {(item.reporterName || item.reporterEmail) && (
                <span>{item.reporterName || item.reporterEmail}</span>
              )}
              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer" style={styles.link}>
                  {item.pathname || item.url}
                </a>
              )}
            </div>
            <div style={styles.row}>
              {store.update && (
                <button type="button" style={styles.submit} onClick={() => toggle(item)}>
                  {done ? "Reopen" : "Mark done"}
                </button>
              )}
              {store.remove && (
                <button type="button" style={styles.ghostBtn} onClick={() => remove(item)}>
                  Delete
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
