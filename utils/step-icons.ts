import path from "path";

// utils/step-icons.ts
export type StepKind =
  | "START"
  | "END"
  | "PASS"
  | "SUCCESS"
  | "FAIL"
  | "WARN"
  | "INFO"
  | "NAVIGATE"
  | "OPEN"
  | "CLICK"
  | "TYPE"
  | "SELECT"
  | "TOGGLE"
  | "CONFIGURE"
  | "CONTINUE"
  | "WAIT"
  | "ASSERT"
  | "VERIFY"
  | "SAVE"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "SCROLL"
  | "FILTER"
  | "CODEBLOCK"
  | "WEBHOOK"
  | "PATH"
  | "CONNECTION"
  | "MAPPING"
  | "TOOLS"
  | "CHECKBOX"
  | "UNCHECKBOX";

export const ICON: Record<StepKind, string> = {
  // meta
  START: "🚀 🚀 🚀 🚀 🚀",
  END: "🏁 🏁 🏁 🏁 🏁",
  PASS: "🟢",
  SUCCESS: "🏆✅🏆✅",
  FAIL: "❌",
  WARN: "⚠️",
  INFO: "ℹ️",

  // navigation / flow
  NAVIGATE: "🧭",
  OPEN: "🪟",
  CONTINUE: "⏭️",
  WAIT: "⏳",

  // user actions
  CLICK: "🖱️",
  TYPE: "⌨️",
  SELECT: "☑️",
  TOGGLE: "🎚️",
  CONFIGURE: "⚙️",
  CHECKBOX: "☑️",
  UNCHECKBOX: "⬜",

  // validations
  ASSERT: "🔍",
  VERIFY: "🔎", // ✅ Added verify

  // persistence
  SAVE: "💾",
  CREATE: "➕",
  UPDATE: "🔄",
  DELETE: "🗑️",
  SCROLL: "⬇️",

  // domain-specific
  FILTER: "🧪",
  TOOLS: "🧰",
  CONNECTION: "🔌",
  MAPPING: "🧷",
  CODEBLOCK: "📦",
  PATH: "🔀",
  WEBHOOK: "🪝", // mapped webhook emoji
};

// Formats a message with the icon, keeping your existing logStep signature.
export function withIcon(kind: StepKind, msg: string) {
  return `${ICON[kind]} ${msg}`;
}

// utils/step-icons.ts

// ... existing StepKind, ICON, withIcon ...

export const step = {
  start: (t: string) => withIcon("START", `Starting test: ${t}`),
  end: (t: string) => withIcon("END", `Finished test: ${t}`),
  pass: (t: string) => withIcon("PASS", `Step Finished: ${t}`),
  success: (t: string) => withIcon("SUCCESS", `Test Passed: ${t}`),
  fail: (t: string) => withIcon("FAIL", `Test Failed: ${t}`),

  // common actions
  navigate: (msg: string) => withIcon("NAVIGATE", msg),
  open: (msg: string) => withIcon("OPEN", msg),
  click: (msg: string) => withIcon("CLICK", msg),
  type: (msg: string) => withIcon("TYPE", msg),
  select: (msg: string) => withIcon("SELECT", msg),
  toggle: (msg: string) => withIcon("TOGGLE", msg),
  configure: (msg: string) => withIcon("CONFIGURE", msg),
  continue: (msg: string) => withIcon("CONTINUE", msg),
  wait: (msg: string) => withIcon("WAIT", msg),
  check: (msg: string) => withIcon("CHECKBOX", msg),
  uncheck: (msg: string) => withIcon("UNCHECKBOX", msg),
  scroll: (msg: string) => withIcon("SCROLL", msg),

  // checks & persistence
  assert: (msg: string) => withIcon("ASSERT", msg),
  verify: (msg: string) => withIcon("VERIFY", `Verify: ${msg}`), // ✅ Added verify
  save: (msg: string) => withIcon("SAVE", msg),
  create: (msg: string) => withIcon("CREATE", msg),
  update: (msg: string) => withIcon("UPDATE", msg),
  del: (msg: string) => withIcon("DELETE", msg),

  // Tools
  filter: (msg: string) => withIcon("FILTER", msg),
  codeblock: (msg: string) => withIcon("CODEBLOCK", msg),
  webhook: (msg: string) => withIcon("WEBHOOK", msg),
  path: (msg: string) => withIcon("PATH", msg),
  tools: (msg: string) => withIcon("TOOLS", msg),
  connection: (msg: string) => withIcon("CONNECTION", msg),
  mapping: (msg: string) => withIcon("MAPPING", msg),

  // misc
  info: (msg: string) => withIcon("INFO", msg),
  warn: (msg: string) => withIcon("WARN", msg),
};
