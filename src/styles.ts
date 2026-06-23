import type { CSSProperties } from "react";

/**
 * Self-contained inline styles so the package never depends on the host app's
 * CSS framework (Tailwind/Radix/etc.). High z-index keeps it above app chrome.
 */

const ACCENT = "#2563eb";

export const styles = {
  launcher: (position: "bottom-right" | "bottom-left"): CSSProperties => ({
    position: "fixed",
    bottom: 20,
    [position === "bottom-right" ? "right" : "left"]: 20,
    zIndex: 2147483000,
    background: ACCENT,
    color: "#fff",
    border: "none",
    borderRadius: 9999,
    padding: "12px 18px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
    fontFamily: "inherit",
  }),

  panel: (
    position: "bottom-right" | "bottom-left",
    dir: "ltr" | "rtl"
  ): CSSProperties => ({
    position: "fixed",
    bottom: 76,
    [position === "bottom-right" ? "right" : "left"]: 20,
    zIndex: 2147483000,
    width: 340,
    maxWidth: "calc(100vw - 40px)",
    background: "#fff",
    color: "#111827",
    borderRadius: 12,
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    padding: 16,
    boxSizing: "border-box",
    direction: dir,
    fontFamily: "inherit",
    fontSize: 14,
  }),

  title: {
    margin: "0 0 10px",
    fontSize: 16,
    fontWeight: 700,
  } as CSSProperties,

  field: {
    width: "100%",
    boxSizing: "border-box",
    padding: "8px 10px",
    marginBottom: 8,
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "inherit",
  } as CSSProperties,

  textarea: {
    minHeight: 90,
    resize: "vertical",
  } as CSSProperties,

  row: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  } as CSSProperties,

  submit: {
    background: ACCENT,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "9px 16px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  } as CSSProperties,

  ghostBtn: {
    background: "transparent",
    color: "#6b7280",
    border: "none",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  } as CSSProperties,

  note: {
    margin: "8px 0 0",
    fontSize: 12,
    color: "#6b7280",
  } as CSSProperties,

  // ---- Inbox ----
  inbox: {
    fontFamily: "inherit",
    color: "#111827",
  } as CSSProperties,

  card: (done: boolean): CSSProperties => ({
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    background: done ? "#f9fafb" : "#fff",
    opacity: done ? 0.7 : 1,
  }),

  cardMsg: {
    margin: "0 0 8px",
    fontSize: 15,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  } as CSSProperties,

  meta: {
    fontSize: 12,
    color: "#6b7280",
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  } as CSSProperties,

  link: {
    color: ACCENT,
    textDecoration: "none",
    wordBreak: "break-all",
  } as CSSProperties,

  badge: (done: boolean): CSSProperties => ({
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 9999,
    fontSize: 11,
    fontWeight: 600,
    background: done ? "#dcfce7" : "#fef3c7",
    color: done ? "#166534" : "#92400e",
  }),
};
