# @amitkuzi/feedback-widget

A tiny, **storage-agnostic** React feedback widget + admin inbox. Drop it into any
app so clients/testers can leave comments on any page; you collect them as tasks.

- `<FeedbackWidget>` — a floating button + form for reporters.
- `<FeedbackInbox>` — an admin list to read items and mark them done.
- Bring your own backend via a small `FeedbackStore` adapter. A **Firestore**
  adapter ships in the box; `firebase` is an *optional* peer dependency.
- No CSS framework needed — styles are self-contained inline styles. RTL aware.

## Install

```bash
npm install @amitkuzi/feedback-widget
# only if you use the Firestore adapter:
npm install firebase
```

Peer deps: `react >=18`, `react-dom >=18`, and (optional) `firebase >=10`.

## Quick start (Firestore)

```tsx
"use client";
import { useMemo } from "react";
import { FeedbackWidget } from "@amitkuzi/feedback-widget";
import { createFirestoreStore } from "@amitkuzi/feedback-widget/firestore";
import { db } from "@/lib/firebase"; // your own Firestore instance

export function Feedback() {
  const store = useMemo(
    () => createFirestoreStore({ db, collectionName: "feedback" }),
    []
  );
  return <FeedbackWidget store={store} project="my-app" />;
}
```

### Admin inbox

```tsx
"use client";
import { FeedbackInbox } from "@amitkuzi/feedback-widget";
import { createFirestoreStore } from "@amitkuzi/feedback-widget/firestore";
import { db } from "@/lib/firebase";

const store = createFirestoreStore({ db });
export default function Page() {
  // protect this route yourself (auth check / middleware)
  return <FeedbackInbox store={store} project="my-app" />;
}
```

### Firestore security rules

```
match /feedback/{id} {
  allow create: if request.auth != null
    && request.resource.data.message is string
    && request.resource.data.message.size() > 0
    && request.resource.data.message.size() < 5000
    && request.resource.data.status == "open";
  allow read, update, delete: if request.auth != null
    && request.auth.token.email in ['you@example.com'];
}
```

## Bring your own backend

Implement the `FeedbackStore` interface against anything (Supabase, REST, …):

```ts
import type { FeedbackStore } from "@amitkuzi/feedback-widget";

export function createRestStore(baseUrl: string): FeedbackStore {
  return {
    async submit(input) {
      const res = await fetch(`${baseUrl}/feedback`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const { id } = await res.json();
      return id;
    },
    // optional: subscribe / list / update / remove for the inbox
  };
}
```

Only `submit` is required for the widget. `<FeedbackInbox>` additionally uses
`subscribe` (or `list`) and `update`/`remove`.

## Props

### `<FeedbackWidget>`
| prop | type | default | notes |
|---|---|---|---|
| `store` | `FeedbackStore` | — | required |
| `project` | `string` | — | tag so one store serves many apps |
| `reporter` | `{ name?; email? }` | — | prefill/attach reporter identity |
| `categories` | `string[]` | — | shows a select when provided |
| `position` | `"bottom-right" \| "bottom-left"` | `"bottom-right"` | |
| `dir` | `"ltr" \| "rtl"` | auto from `document.dir` | |
| `enabled` | `boolean` | `true` | set false to render nothing (env gating) |
| `metadata` | `Record<string, unknown>` | — | extra fields on every submission |
| `buttonLabel` / `title` | `string` | | UI copy |
| `onSubmitted` | `(id: string) => void` | — | success callback |

### `<FeedbackInbox>`
| prop | type | default |
|---|---|---|
| `store` | `FeedbackStore` | — |
| `project` | `string` | — |
| `title` | `string` | `"Feedback"` |

## License

MIT
