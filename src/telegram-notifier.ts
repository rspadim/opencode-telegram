import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createTranslator } from "./i18n.mjs";

type Nullable<T> = T | null;

type LocalConfig = {
  locale?: string;
  telegram?: {
    botToken?: string;
    chatId?: string;
  };
  opencode?: {
    baseUrl?: string;
  };
  runtime?: {
    pollMs?: number;
    sessionLimit?: number;
    messageLimit?: number;
    attachmentSizeLimit?: number;
    replayPastMessages?: boolean;
  };
};

type SessionRecord = {
  id: string;
  title?: string;
  directory?: string;
  projectID?: string;
  parentID?: string;
  worktree?: string;
  vcs?: string;
  name?: string;
  time: {
    created: number;
    updated: number;
  };
};

type MessagePart = {
  type: string;
  text?: string;
  synthetic?: boolean;
  ignored?: boolean;
  mime?: string;
  filename?: string;
  url?: string;
};

type SessionMessage = {
  info: {
    id: string;
    role?: string;
    summary?: boolean;
    time: {
      completed?: number;
    };
  };
  parts: MessagePart[];
};

type NotifierState = {
  bootstrapped: boolean;
  seen: Record<string, number>;
  telegramOffset: number;
};

type TopicMapping = {
  chatId: string;
  threadId: number;
  title: string;
  topicName: string;
  createdAt: number;
};

type TopicMap = Record<string, TopicMapping>;

type NotificationItem = {
  messageId?: string;
  completedAt?: number;
  text?: string;
  sessionId?: string;
  title?: string;
  directory?: string;
  threadId?: number;
};

type TelegramCommand = {
  name: string;
  args: string;
  addressed: boolean;
};

type TelegramMessage = {
  text?: string;
  caption?: string;
  message_thread_id?: number;
  chat?: { id?: string | number };
  from?: {
    id?: string | number;
    is_bot?: boolean;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
  photo?: Array<{ file_id: string; file_size?: number; file_unique_id?: string }>;
  document?: { file_id?: string; file_size?: number; mime_type?: string; file_name?: string; file_unique_id?: string };
  audio?: { file_id?: string; file_size?: number; mime_type?: string; file_name?: string; file_unique_id?: string };
  voice?: { file_id?: string; file_size?: number; mime_type?: string; file_unique_id?: string };
  video?: { file_id?: string; file_size?: number; mime_type?: string; file_name?: string; file_unique_id?: string };
};

type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
};

type RunningServerHandle = {
  url: string;
  close: () => void;
};

type FetchJsonOptions = {
  allowFailure?: boolean;
};

type RequestJsonOptions = {
  method?: string;
  body?: unknown;
};

type TelegramSendPayload = {
  chat_id: string;
  text: string;
  disable_web_page_preview: boolean;
  message_thread_id?: number;
};

type AttachmentItem = {
  fileId: string;
  size?: number;
  mime: string;
  filename: string;
};

type AttachmentExtraction = {
  parts: MessagePart[];
  notes: string[];
};

type MappedThread = TopicMapping & { sessionId: string };

type TelegramBotIdentity = {
  username?: string;
};

type TelegramChatInfo = {
  is_forum?: boolean;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(PROJECT_ROOT, "config.local.json");
const PATH_DELIMITER = path.delimiter;
const NPM_BIN = path.join(
  process.env.APPDATA || path.join(process.env.USERPROFILE || "C:\\Users\\rober", "AppData", "Roaming"),
  "npm",
);
const OPENCODE_BIN = process.env.OPENCODE_BIN || defaultOpencodeBin();
const ENABLE_DESKTOP_NOTIFY = ["1", "true", "yes", "on"].includes(
  String(process.env.OPENCODE_DESKTOP_NOTIFY || "").toLowerCase(),
);

if (process.platform === "win32" && !String(process.env.PATH || "").toLowerCase().includes(NPM_BIN.toLowerCase())) {
  process.env.PATH = `${NPM_BIN}${PATH_DELIMITER}${process.env.PATH || ""}`;
}

const config: LocalConfig = await loadLocalConfig();
const LOCALE = config.locale || process.env.OPENCODE_LOCALE || "en";
const t = createTranslator(LOCALE);
const BOT_TOKEN = process.env.OPENCODE_TELEGRAM_BOT_TOKEN || config.telegram?.botToken;
const CHAT_ID = process.env.OPENCODE_TELEGRAM_CHAT_ID || config.telegram?.chatId;
const BASE_URL = process.env.OPENCODE_BASE_URL || config.opencode?.baseUrl || "http://127.0.0.1:4096";
const POLL_MS = clamp(Number(process.env.OPENCODE_TELEGRAM_POLL_MS || config.runtime?.pollMs || 5000), 2000, 60000);
const SESSION_LIMIT = clamp(Number(process.env.OPENCODE_TELEGRAM_SESSION_LIMIT || config.runtime?.sessionLimit || 25), 1, 100);
const MESSAGE_LIMIT = clamp(Number(process.env.OPENCODE_TELEGRAM_MESSAGE_LIMIT || config.runtime?.messageLimit || 20), 1, 100);
const ATTACHMENT_SIZE_LIMIT = clamp(Number(process.env.OPENCODE_ATTACHMENT_SIZE_LIMIT || config.runtime?.attachmentSizeLimit || 10000000), 1000000, 50000000);
const REPLAY_PAST_MESSAGES = [true, "true", 1, "1", "yes", "on"].includes(
  process.env.OPENCODE_REPLAY_PAST_MESSAGES ?? config.runtime?.replayPastMessages ?? false,
);
const DATA_DIR = path.join(PROJECT_ROOT, "data");
const STATE_PATH = path.join(DATA_DIR, "telegram-notifier.state.json");
const PID_PATH = path.join(DATA_DIR, "telegram-notifier.pid");
const LOCK_PATH = path.join(DATA_DIR, "telegram-notifier.lock");
const TOPIC_MAP_PATH = path.join(DATA_DIR, "telegram-topic-map.json");
const LOG_PATH = path.join(DATA_DIR, "telegram-notifier.log");

if (!BOT_TOKEN || !CHAT_ID) {
  console.error("Missing OPENCODE_TELEGRAM_BOT_TOKEN or OPENCODE_TELEGRAM_CHAT_ID.");
  process.exit(1);
}

let serverHandle: Nullable<RunningServerHandle> = null;
let shuttingDown = false;
await fs.mkdir(DATA_DIR, { recursive: true });
const state: NotifierState = await loadState();
const topicMap: TopicMap = await loadTopicMap();
let chatInfo: Nullable<TelegramChatInfo> = null;
let botInfo: Nullable<TelegramBotIdentity> = null;

await acquireLock();
await writePid();

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const baseUrl = await ensureServer();
console.log(`telegram-notifier connected to ${baseUrl}`);
await notifyLifecycle("started", { baseUrl });

while (!shuttingDown) {
  try {
    await processTelegramUpdates(baseUrl);
    await scanOnce(baseUrl);
  } catch (error) {
    await appendLog("loop-error", { error: formatError(error) });
    console.error(formatError(error));
  }
  await sleep(POLL_MS);
}

async function ensureServer(): Promise<string> {
  let health: Nullable<{ healthy?: boolean } | { ok: false; status: number }> = null;

  try {
    health = await fetchJson(`${BASE_URL}/global/health`, { allowFailure: true });
  } catch {
    health = null;
  }

  if (health && "healthy" in health && health.healthy) {
    return BASE_URL;
  }

  serverHandle = await createOpencodeServer({
    hostname: "127.0.0.1",
    port: Number(new URL(BASE_URL).port || 4096),
    timeout: 10000,
  });

  return serverHandle.url;
}

async function loadLocalConfig(): Promise<LocalConfig> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

async function scanOnce(baseUrl: string): Promise<void> {
  const sessions = await fetchJson<SessionRecord[]>(`${baseUrl}/session?limit=${SESSION_LIMIT}`);
  if (!Array.isArray(sessions)) {
    throw new Error("Unexpected /session response.");
  }

  const notifications: NotificationItem[] = [];

  for (const session of sessions) {
      const messages = await fetchJson<SessionMessage[]>(
        `${baseUrl}/session/${encodeURIComponent(session.id)}/message?limit=${MESSAGE_LIMIT}`,
      );

    if (!Array.isArray(messages)) {
      continue;
    }

    const completedAssistantMessages = messages
      .filter((entry) => entry?.info?.role === "assistant")
      .filter((entry) => entry?.info?.time?.completed)
      .filter((entry) => !entry?.info?.summary)
      .sort((a, b) => Number(a.info.time.completed) - Number(b.info.time.completed));

    for (const entry of completedAssistantMessages) {
      const messageId = entry.info.id;
      const completedAt = Number(entry.info.time.completed);

      if (!messageId || !completedAt || (!REPLAY_PAST_MESSAGES && state.seen[messageId])) {
        continue;
      }

      const text = extractText(entry.parts);
      if (!text) {
        state.seen[messageId] = completedAt;
        continue;
      }

      if (!state.bootstrapped && !REPLAY_PAST_MESSAGES) {
        state.seen[messageId] = completedAt;
        continue;
      }

      notifications.push({
        messageId,
        completedAt,
        text,
        sessionId: session.id,
        title: session.title || t("untitledSession"),
        directory: session.directory || "",
      });
    }
  }

  if (!state.bootstrapped && !REPLAY_PAST_MESSAGES) {
    state.bootstrapped = true;
    pruneSeen();
    await saveState();
    console.log("telegram-notifier bootstrapped");
    return;
  }

  if (!state.bootstrapped && REPLAY_PAST_MESSAGES) {
    state.bootstrapped = true;
  }

  notifications.sort((a, b) => a.completedAt - b.completedAt);

  for (const item of notifications) {
    await sendTelegram(formatTelegramMessage(item), item);
    state.seen[item.messageId] = item.completedAt;
  }

  if (notifications.length > 0) {
    pruneSeen();
    await saveState();
    await saveTopicMap();
    console.log(`telegram-notifier sent ${notifications.length} notification(s)`);
  }
}

function extractText(parts: MessagePart[]): string {
  if (!Array.isArray(parts)) {
    return "";
  }

  const text = parts
    .filter((part) => part?.type === "text")
    .filter((part) => !part?.synthetic && !part?.ignored)
    .map((part) => String(part.text || "").trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();

  return truncate(text.replace(/\s+/g, " "), 700);
}

function formatTelegramMessage(item: NotificationItem): string {
  const folder = item.directory ? path.basename(item.directory) : t("unknownFolder");
  return [
    t("finishedStep"),
    t("project", { value: folder }),
    t("session", { value: truncate(item.title, 80) }),
    "",
    item.text,
  ].join("\n");
}

function formatTopicTelegramMessage(item: NotificationItem): string {
  return item.text;
}

async function sendTelegram(text: string, item?: NotificationItem): Promise<void> {
  const payload: TelegramSendPayload = {
    chat_id: CHAT_ID,
    text,
    disable_web_page_preview: true,
  };

  const threadId = await getThreadIdForItem(item);
  if (threadId && item?.sessionId && text === formatTelegramMessage(item)) {
    payload.text = formatTopicTelegramMessage(item);
  }
  if (threadId) {
    payload.message_thread_id = threadId;
  }

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Telegram request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data?.ok) {
    throw new Error(`Telegram API error: ${JSON.stringify(data)}`);
  }

  await appendLog("telegram-send", {
    threadId: payload.message_thread_id || null,
    text: truncate(text, 200),
  });
  await maybeNotifyDesktop(arguments[1]);
}

async function fetchJson<T = any>(url: string, options: FetchJsonOptions = {}): Promise<T | { ok: false; status: number }> {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    if (options.allowFailure) {
      return { ok: false, status: response.status };
    }
    throw new Error(`Request failed: ${response.status} ${response.statusText} (${url})`);
  }

  return response.json();
}

async function postJson<T = any>(url: string, body: unknown): Promise<T> {
  return requestJson(url, {
    method: "POST",
    body,
  });
}

async function requestJson<T = any>(url: string, options: RequestJsonOptions = {}): Promise<T> {
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText} (${url})`);
  }

  return response.json();
}

async function loadState(): Promise<NotifierState> {
  try {
    const raw = await fs.readFile(STATE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return {
      bootstrapped: Boolean(parsed.bootstrapped),
      seen: typeof parsed.seen === "object" && parsed.seen ? parsed.seen : {},
      telegramOffset: Number.isFinite(parsed.telegramOffset) ? parsed.telegramOffset : 0,
    };
  } catch {
    return {
      bootstrapped: false,
      seen: {},
      telegramOffset: 0,
    };
  }
}

async function loadTopicMap(): Promise<TopicMap> {
  try {
    const raw = await fs.readFile(TOPIC_MAP_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

async function saveTopicMap() {
  await fs.writeFile(TOPIC_MAP_PATH, JSON.stringify(topicMap, null, 2), "utf8");
}

async function saveState() {
  await fs.writeFile(
    STATE_PATH,
    JSON.stringify(
      {
        bootstrapped: state.bootstrapped,
        seen: state.seen,
        telegramOffset: state.telegramOffset,
      },
      null,
      2,
    ),
    "utf8",
  );
}

async function appendLog(event: string, payload: Record<string, unknown> = {}): Promise<void> {
  const line = JSON.stringify({
    time: new Date().toISOString(),
    event,
    ...payload,
  });

  await fs.appendFile(LOG_PATH, `${line}\n`, "utf8").catch(() => {});
}

function pruneSeen() {
  const entries = Object.entries(state.seen)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 500);

  state.seen = Object.fromEntries(entries);
}

async function writePid() {
  await fs.writeFile(PID_PATH, String(process.pid), "utf8");
}

async function acquireLock() {
  try {
    await fs.writeFile(LOCK_PATH, String(process.pid), {
      encoding: "utf8",
      flag: "wx",
    });
    return;
  } catch (error) {
    if (error?.code !== "EEXIST") {
      throw error;
    }
  }

  const existingPid = await readExistingPid(LOCK_PATH);
  if (existingPid && isProcessAlive(existingPid)) {
    console.log(`telegram-notifier already running (PID ${existingPid})`);
    process.exit(0);
  }

  await fs.unlink(LOCK_PATH).catch(() => {});
  await fs.writeFile(LOCK_PATH, String(process.pid), {
    encoding: "utf8",
    flag: "wx",
  });
}

async function readExistingPid(filePath: string): Promise<number | null> {
  try {
    const raw = (await fs.readFile(filePath, "utf8")).trim();
    const pid = Number(raw);
    return Number.isInteger(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function shutdown() {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  try {
    await notifyLifecycle("stopping");
  } catch {
    // ignore
  }
  try {
    await saveState();
  } catch {
    // ignore
  }

  try {
    await fs.unlink(PID_PATH);
  } catch {
    // ignore
  }

  try {
    await fs.unlink(LOCK_PATH);
  } catch {
    // ignore
  }

  try {
    serverHandle?.close();
  } catch {
    // ignore
  }

  process.exit(0);
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

function truncate(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max - 3)}...`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack || error.message;
  }
  return String(error);
}

async function maybeNotifyDesktop(item?: NotificationItem): Promise<void> {
  if (!ENABLE_DESKTOP_NOTIFY || !item) {
    return;
  }

  try {
    const proc = spawn(getDesktopNotifyCommand(), getDesktopNotifyArgs(item), {
      detached: true,
      stdio: "ignore",
    });
    proc.unref();
  } catch {
    // ignore
  }
}

async function processTelegramUpdates(baseUrl: string): Promise<void> {
  const offset = state.telegramOffset > 0 ? state.telegramOffset : undefined;
  const response = await fetchTelegramJson("getUpdates", {
    offset,
    timeout: Math.max(1, Math.floor(POLL_MS / 1000)),
    allowed_updates: ["message"],
  });

  if (!Array.isArray(response)) {
    return;
  }

  let changed = false;

  for (const update of response) {
    state.telegramOffset = Math.max(state.telegramOffset || 0, Number(update.update_id || 0) + 1);
    changed = true;
    await handleTelegramMessage(baseUrl, update.message);
  }

  if (changed) {
    await saveState();
  }
}

async function handleTelegramMessage(baseUrl: string, message?: TelegramMessage): Promise<void> {
  if (!message?.chat?.id || String(message.chat.id) !== String(CHAT_ID)) {
    return;
  }

  if (message.from?.is_bot) {
    return;
  }

  const text = extractTelegramText(message);
  const command = text ? await parseTelegramCommand(text) : null;

  if (!message.message_thread_id) {
    await handleGeneralTelegramMessage(baseUrl, message, command);
    return;
  }

  await handleTopicTelegramMessage(baseUrl, message, command);
}

async function handleGeneralTelegramMessage(baseUrl: string, message: TelegramMessage, command: TelegramCommand | null): Promise<void> {
  if (!command || !command.addressed) {
    return;
  }

  if (command.name === "newtopic") {
    const title = command.args || `New session - ${new Date().toISOString()}`;
    const session = await createSession(baseUrl, title);
    const threadId = await getThreadIdForItem({
      sessionId: session.id,
      title: session.title || title,
      directory: session.directory || "",
    });

    await appendLog("session-created-from-telegram", {
      sessionId: session.id,
      title: session.title || title,
      threadId,
    });

    await sendTelegram(
      [
        t("createdSession", { title: session.title || title }),
        t("sessionId", { value: session.id }),
        threadId ? t("topicCreated", { name: topicMap[session.id]?.topicName || "ok" }) : t("postedToGeneral"),
      ].join("\n"),
    );

    if (threadId) {
      await sendTelegram(
        [
          t("topicLinkedLine1"),
          t("session", { value: session.title || title }),
          t("sessionId", { value: session.id }),
          t("topicLinkedLine2"),
        ].join("\n"),
        {
          sessionId: session.id,
          title: session.title || title,
          directory: session.directory || "",
          text: t("sessionLinkedShort"),
        },
      );
    }

    return;
  }

  if (command.name === "listtopics") {
    await sendTelegram(formatTopicList());
    return;
  }

  if (command.name === "status") {
    await sendTelegram(await formatBridgeStatus(baseUrl));
    return;
  }

  if (command.name === "sessions") {
    await sendTelegram(await formatSessions(baseUrl, command.args));
    return;
  }

  if (command.name === "session") {
    await sendTelegram(await formatSessionDetails(baseUrl, command.args));
    return;
  }

  if (command.name === "project") {
    await sendTelegram(await formatProject(baseUrl));
    return;
  }

  if (command.name === "projects") {
    await sendTelegram(await formatProjects(baseUrl, command.args));
    return;
  }

  if (command.name === "providers") {
    await sendTelegram(await formatProviders(baseUrl));
    return;
  }

  if (command.name === "help") {
    await sendTelegram(await formatHelp());
    return;
  }

  await sendTelegram(t("unknownCommand"));
}

async function handleTopicTelegramMessage(baseUrl: string, message: TelegramMessage, command: TelegramCommand | null): Promise<void> {
  const mapping = findMappingByThreadId(message.message_thread_id);

  if (command) {
    if (command.name === "unlink") {
      if (!mapping) {
        await sendTelegram(t("topicNotLinked"), { threadId: message.message_thread_id });
        return;
      }

      delete topicMap[mapping.sessionId];
      await saveTopicMap();
      await appendLog("topic-unlinked", {
        sessionId: mapping.sessionId,
        threadId: message.message_thread_id,
      });
      await sendTelegram(t("topicUnlinked"), { threadId: message.message_thread_id });
      return;
    }

    if (command.name === "link") {
      const sessionId = command.args.trim();
      if (!sessionId) {
        await sendTelegram(t("linkUsage"), { threadId: message.message_thread_id });
        return;
      }

      const session = await fetchJson(`${baseUrl}/session/${encodeURIComponent(sessionId)}`);
      topicMap[session.id] = {
        chatId: CHAT_ID,
        threadId: message.message_thread_id,
        title: session.title || t("untitledSession"),
        topicName: topicNameForSession(session.id, session.title),
        createdAt: Date.now(),
      };
      await saveTopicMap();
      await appendLog("topic-linked", {
        sessionId: session.id,
        threadId: message.message_thread_id,
      });
      await sendTelegram(t("linkedTopicToSession", { sessionId: session.id }), { threadId: message.message_thread_id });
      return;
    }

    if (command.name === "status") {
      if (!mapping) {
        await sendTelegram(t("topicNotLinked"), { threadId: message.message_thread_id });
        return;
      }

      await sendTelegram(await formatMappedTopicStatus(baseUrl, mapping), { threadId: message.message_thread_id });
      return;
    }

    if (command.name === "todo") {
      if (!mapping) {
        await sendTelegram(t("topicNotLinked"), { threadId: message.message_thread_id });
        return;
      }

      await sendTelegram(await formatTodo(baseUrl, mapping.sessionId), { threadId: message.message_thread_id });
      return;
    }

    if (command.name === "diff") {
      if (!mapping) {
        await sendTelegram(t("topicNotLinked"), { threadId: message.message_thread_id });
        return;
      }

      await sendTelegram(await formatDiff(baseUrl, mapping.sessionId), { threadId: message.message_thread_id });
      return;
    }

    if (command.name === "abort") {
      if (!mapping) {
        await sendTelegram(t("topicNotLinked"), { threadId: message.message_thread_id });
        return;
      }

      await postJson(`${baseUrl}/session/${encodeURIComponent(mapping.sessionId)}/abort`, {});
      await sendTelegram(t("abortRequested", { sessionId: mapping.sessionId }), { threadId: message.message_thread_id });
      return;
    }

    if (command.name === "fork") {
      if (!mapping) {
        await sendTelegram(t("topicNotLinked"), { threadId: message.message_thread_id });
        return;
      }

      const forked = await postJson(`${baseUrl}/session/${encodeURIComponent(mapping.sessionId)}/fork`, {});
      const threadId = await getThreadIdForItem({
        sessionId: forked.id,
        title: forked.title || `Fork of ${mapping.title || mapping.sessionId}`,
        directory: forked.directory || "",
      });
      await sendTelegram(
        [
          t("forkedSession", { title: forked.title || t("untitledSession") }),
          t("sessionId", { value: forked.id }),
          threadId ? t("topicCreated", { name: topicMap[forked.id]?.topicName || "ok" }) : t("postedToGeneral"),
        ].join("\n"),
        { threadId: message.message_thread_id },
      );
      return;
    }

    if (command.name === "share") {
      if (!mapping) {
        await sendTelegram(t("topicNotLinked"), { threadId: message.message_thread_id });
        return;
      }

      const shared = await postJson(`${baseUrl}/session/${encodeURIComponent(mapping.sessionId)}/share`, {});
      await sendTelegram(shared?.share?.url ? t("shareUrl", { url: shared.share.url }) : t("sessionShared"), {
        threadId: message.message_thread_id,
      });
      return;
    }

    if (command.name === "archive") {
      if (!mapping) {
        await sendTelegram(t("topicNotLinked"), { threadId: message.message_thread_id });
        return;
      }

      await requestJson(`${baseUrl}/session/${encodeURIComponent(mapping.sessionId)}`, {
        method: "PATCH",
        body: {
          time: {
            archived: Date.now(),
          },
        },
      });
      await sendTelegram(t("archivedSession", { sessionId: mapping.sessionId }), { threadId: message.message_thread_id });
      return;
    }

    if (command.name === "download") {
      if (!mapping) {
        await sendTelegram(t("topicNotLinked"), { threadId: message.message_thread_id });
        return;
      }

      await sendSessionTranscript(baseUrl, mapping, message.message_thread_id);
      return;
    }

    if (command.name === "help") {
      await sendTelegram(await formatHelp(true), { threadId: message.message_thread_id });
      return;
    }

    await sendTelegram(t("unknownCommand"), { threadId: message.message_thread_id });
    return;
  }

  if (!mapping) {
    await sendTelegram(t("topicNotLinkedYet"), {
      threadId: message.message_thread_id,
    });
    return;
  }

  const parts = await buildOpencodePartsFromTelegramMessage(message);
  if (parts.length === 0) {
    await sendTelegram(t("nothingToForward"), { threadId: message.message_thread_id });
    return;
  }

  await promptSession(baseUrl, mapping.sessionId, parts);
  await appendLog("telegram-forwarded", {
    sessionId: mapping.sessionId,
    threadId: message.message_thread_id,
    text: truncate(extractTelegramText(message), 160),
    partCount: parts.length,
  });
  await sendTelegram(t("forwardedToSession", { sessionId: mapping.sessionId }), { threadId: message.message_thread_id });
}

function extractTelegramText(message: TelegramMessage): string {
  return String(message?.text || message?.caption || "").trim();
}

async function parseTelegramCommand(text: string): Promise<TelegramCommand | null> {
  const bot = await getBotInfo();
  const username = String(bot?.username || "").trim();
  const original = text.trim();
  let normalized = original;
  let addressed = false;

  if (username) {
    const mentionPrefix = new RegExp(`^@${escapeRegex(username)}\\s+`, "i");
    if (mentionPrefix.test(normalized)) {
      normalized = normalized.replace(mentionPrefix, "");
      addressed = true;
    }
  }

  const match = normalized.match(/^\/(\w+)(?:@(\w+))?(?:\s+(.*))?$/i);
  if (!match) {
    return null;
  }

  if (match[2] && username) {
    if (match[2].toLowerCase() !== username.toLowerCase()) {
      return null;
    }
    addressed = true;
  }

  if (!addressed && username && !original.startsWith("/")) {
    return null;
  }

  return {
    name: String(match[1] || "").toLowerCase(),
    args: String(match[3] || "").trim(),
    addressed,
  };
}

async function createSession(baseUrl: string, title: string): Promise<SessionRecord> {
  const session = await postJson(`${baseUrl}/session`, {
    title,
  });

  if (!session?.id) {
    throw new Error(`Unexpected session create response: ${JSON.stringify(session)}`);
  }

  return session;
}

async function promptSession(baseUrl: string, sessionId: string, parts: MessagePart[]): Promise<SessionMessage> {
  const result = await postJson(`${baseUrl}/session/${encodeURIComponent(sessionId)}/message`, {
    parts,
  });

  if (!result?.info?.id) {
    throw new Error(`Unexpected session prompt response: ${JSON.stringify(result)}`);
  }

  return result;
}

async function buildOpencodePartsFromTelegramMessage(message: TelegramMessage): Promise<MessagePart[]> {
  const parts = [];
  const text = extractTelegramText(message);
  const header = formatTelegramAuthor(message);

  if (text) {
    parts.push({
      type: "text",
      text: `${header}\n\n${text}`,
    });
  }

  const attachments = await extractTelegramAttachments(message);
  parts.push(...attachments.parts);

  if (attachments.notes.length > 0) {
    parts.push({
      type: "text",
      text: attachments.notes.join("\n"),
    });
  }

  return parts;
}

function formatTelegramAuthor(message: TelegramMessage): string {
  const name = [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ").trim();
  const username = message.from?.username ? `@${message.from.username}` : null;
  return [`[Telegram]`, name || username || `user-${message.from?.id || "unknown"}`].filter(Boolean).join(" ");
}

async function extractTelegramAttachments(message: TelegramMessage): Promise<AttachmentExtraction> {
  const items = [];

  if (Array.isArray(message.photo) && message.photo.length > 0) {
    const photo = message.photo[message.photo.length - 1];
    items.push({
      fileId: photo.file_id,
      size: photo.file_size,
      mime: "image/jpeg",
      filename: `photo-${photo.file_unique_id || Date.now()}.jpg`,
    });
  }

  if (message.document?.file_id) {
    items.push({
      fileId: message.document.file_id,
      size: message.document.file_size,
      mime: message.document.mime_type || "application/octet-stream",
      filename: message.document.file_name || `document-${message.document.file_unique_id || Date.now()}`,
    });
  }

  if (message.audio?.file_id) {
    items.push({
      fileId: message.audio.file_id,
      size: message.audio.file_size,
      mime: message.audio.mime_type || "audio/mpeg",
      filename: message.audio.file_name || `audio-${message.audio.file_unique_id || Date.now()}.mp3`,
    });
  }

  if (message.voice?.file_id) {
    items.push({
      fileId: message.voice.file_id,
      size: message.voice.file_size,
      mime: message.voice.mime_type || "audio/ogg",
      filename: `voice-${message.voice.file_unique_id || Date.now()}.ogg`,
    });
  }

  if (message.video?.file_id) {
    items.push({
      fileId: message.video.file_id,
      size: message.video.file_size,
      mime: message.video.mime_type || "video/mp4",
      filename: message.video.file_name || `video-${message.video.file_unique_id || Date.now()}.mp4`,
    });
  }

  const parts = [];
  const notes = [];

  for (const item of items) {
    if (Number(item.size || 0) > ATTACHMENT_SIZE_LIMIT) {
      notes.push(t("attachmentSkipped", { limit: ATTACHMENT_SIZE_LIMIT, filename: item.filename }));
      continue;
    }

    const file = await downloadTelegramFile(item.fileId);
    parts.push({
      type: "file",
      mime: item.mime,
      filename: item.filename,
      url: toDataUrl(item.mime, file),
    });
  }

  return { parts, notes };
}

async function downloadTelegramFile(fileId: string): Promise<Buffer> {
  const file = await fetchTelegramJson("getFile", { file_id: fileId });
  if (!file?.file_path) {
    throw new Error(`Telegram file path missing for ${fileId}`);
  }

  const response = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`);
  if (!response.ok) {
    throw new Error(`Telegram file download failed: ${response.status} ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

function toDataUrl(mime: string, buffer: Buffer): string {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function fetchTelegramJson<T = any>(method: string, body: unknown): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Telegram request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data?.ok) {
    throw new Error(`Telegram API error: ${JSON.stringify(data)}`);
  }

  return data.result;
}

async function getThreadIdForItem(item?: NotificationItem): Promise<number | null> {
  if (item?.threadId) {
    return item.threadId;
  }

  if (!item?.sessionId) {
    return null;
  }

  const info = await getChatInfo();
  if (!info?.is_forum) {
    return null;
  }

  const existing = topicMap[item.sessionId];
  if (existing?.threadId) {
    return existing.threadId;
  }

  const name = topicNameForSession(item.sessionId, item.title);
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createForumTopic`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      name,
    }),
  });

  if (!response.ok) {
    throw new Error(`Forum topic request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data?.ok || !data?.result?.message_thread_id) {
    throw new Error(`Telegram forum topic error: ${JSON.stringify(data)}`);
  }

  topicMap[item.sessionId] = {
    chatId: CHAT_ID,
    threadId: data.result.message_thread_id,
    title: item.title,
    topicName: name,
    createdAt: Date.now(),
  };

  await saveTopicMap();
  return data.result.message_thread_id;
}

async function getChatInfo(): Promise<TelegramChatInfo> {
  if (chatInfo) {
    return chatInfo;
  }

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${encodeURIComponent(CHAT_ID)}`);
  if (!response.ok) {
    throw new Error(`Chat lookup failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data?.ok) {
    throw new Error(`Telegram getChat error: ${JSON.stringify(data)}`);
  }

  chatInfo = data.result;
  return chatInfo;
}

async function getBotInfo(): Promise<TelegramBotIdentity> {
  if (botInfo) {
    return botInfo;
  }

  botInfo = await fetchTelegramJson("getMe", {});
  return botInfo;
}

function findMappingByThreadId(threadId: number): MappedThread | null {
  for (const [sessionId, value] of Object.entries(topicMap)) {
    if (Number(value?.threadId) === Number(threadId)) {
      return {
        sessionId,
        ...value,
      };
    }
  }

  return null;
}

function formatTopicList(): string {
  const entries = Object.entries(topicMap);
  if (entries.length === 0) {
    return t("noLinkedTopics");
  }

  return [
    t("linkedTopics", { value: entries.length }),
    ...entries.slice(0, 20).map(([sessionId, value]) => `- ${value.topicName || value.title || sessionId} -> ${sessionId}`),
  ].join("\n");
}

async function formatBridgeStatus(baseUrl: string): Promise<string> {
  const statuses = await fetchJson(`${baseUrl}/session/status`).catch(() => ({}));
  const counts = {};

  for (const value of Object.values(statuses || {})) {
    const key = typeof value === "object" && value && "type" in value ? String((value as { type?: string }).type || "unknown") : "unknown";
    counts[key] = (counts[key] || 0) + 1;
  }

  const statusLine = Object.keys(counts).length === 0
    ? t("noLiveStatus")
    : t("openCodeSessionsSummary", { value: Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(", ") });

  return [
    t("statusTitle"),
    t("pid", { value: process.pid }),
    t("topicMappings", { value: Object.keys(topicMap).length }),
    t("telegramOffset", { value: state.telegramOffset || 0 }),
    statusLine,
  ].join("\n");
}

async function formatHelp(inTopic = false): Promise<string> {
  const bot = await getBotInfo();
  const mention = bot?.username ? `@${bot.username}` : "@bot";

  if (inTopic) {
    return [
      t("topicHelpTitle"),
      "",
      t("topicHelpIntro1"),
      t("topicHelpIntro2"),
      t("topicHelpIntro3"),
      "",
      t("commands"),
      t("helpTopicStatus"),
      t("helpTopicTodo"),
      t("helpTopicDiff"),
      t("helpTopicAbort"),
      t("helpTopicFork"),
      t("helpTopicShare"),
      t("helpTopicArchive"),
      "/download - export the recent session transcript as a file",
      t("helpTopicLink"),
      t("helpTopicUnlink"),
      t("helpTopicHelp"),
    ].join("\n");
  }

  return [
    t("generalHelpTitle"),
    "",
    t("generalHelpIntro1"),
    t("generalHelpIntro2"),
    t("generalHelpIntro3"),
    "",
    t("commands"),
    t("helpGeneralNewtopic", { mention }),
    t("helpGeneralListtopics", { mention }),
    t("helpGeneralStatus", { mention }),
    t("helpGeneralSessions", { mention }),
    t("helpGeneralSession", { mention }),
    t("helpGeneralProject", { mention }),
    t("helpGeneralProjects", { mention }),
    t("helpGeneralProviders", { mention }),
    t("helpGeneralHelp", { mention }),
    "",
    t("examples"),
    t("helpExample1", { mention }),
    t("helpExample2", { mention }),
  ].join("\n");
}

async function formatSessions(baseUrl: string, args?: string): Promise<string> {
  const limit = clamp(Number(args || 10), 1, 20);
  const sessions = await fetchJson(`${baseUrl}/session?limit=${limit}`);
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return t("noSessions");
  }

  return [
    t("recentSessions", { value: sessions.length }),
    ...sessions.map((session) => `- ${truncate(session.title || t("untitledSession"), 48)} | ${session.id} | ${path.basename(session.directory || "") || "unknown"}`),
  ].join("\n");
}

async function formatSessionDetails(baseUrl: string, sessionId?: string): Promise<string> {
  const target = String(sessionId || "").trim();
  if (!target) {
    return t("sessionUsage");
  }

  const session = await fetchJson(`${baseUrl}/session/${encodeURIComponent(target)}`);
  const project = await fetchProjectById(baseUrl, session.projectID).catch(() => null);
  return [
    t("session", { value: session.title || t("untitledSession") }),
    t("id", { value: session.id }),
    session.projectID ? t("projectId", { value: session.projectID }) : null,
    project ? t("project", { value: project.name || project.worktree }) : null,
    t("directory", { value: session.directory || "unknown" }),
    t("created", { value: new Date(session.time.created).toISOString() }),
    t("updated", { value: new Date(session.time.updated).toISOString() }),
    session.parentID ? t("parent", { value: session.parentID }) : null,
  ].filter(Boolean).join("\n");
}

async function formatProject(baseUrl: string): Promise<string> {
  const project = await fetchJson(`${baseUrl}/project/current`);
  return [
    t("project", { value: project.name || t("unknownProject") }),
    t("id", { value: project.id }),
    t("worktree", { value: project.worktree }),
    t("vcs", { value: project.vcs || "none" }),
  ].join("\n");
}

async function formatProjects(baseUrl: string, args?: string): Promise<string> {
  const limit = clamp(Number(args || 10), 1, 20);
  const projects = await fetchJson(`${baseUrl}/project`);
  if (!Array.isArray(projects) || projects.length === 0) {
    return t("noProjects");
  }

  return [
    t("projects", { value: projects.length }),
    ...projects.slice(0, limit).map((project) => `- ${project.name || t("unknownProject")} | ${project.id} | ${project.worktree}`),
  ].join("\n");
}

async function formatProviders(baseUrl: string): Promise<string> {
  const data = await fetchJson(`${baseUrl}/config/providers`);
  const providers = Array.isArray(data?.providers) ? data.providers : [];
  if (providers.length === 0) {
    return t("noProviders");
  }

  return [
    t("providers", { value: providers.length }),
    ...providers.slice(0, 10).map((provider) => {
      const defaultModel = data?.default?.[provider.id];
      return `- ${provider.id} (${Object.keys(provider.models || {}).length} models)${defaultModel ? ` default=${defaultModel}` : ""}`;
    }),
  ].join("\n");
}

async function formatMappedTopicStatus(baseUrl: string, mapping: MappedThread): Promise<string> {
  const statusMap = await fetchJson(`${baseUrl}/session/status`).catch(() => ({}));
  const liveStatus = statusMap?.[mapping.sessionId]?.type || "unknown";
  const session = await fetchJson(`${baseUrl}/session/${encodeURIComponent(mapping.sessionId)}`).catch(() => null);
  const project = session?.projectID ? await fetchProjectById(baseUrl, session.projectID).catch(() => null) : null;
  return [
    t("session", { value: mapping.title || t("untitledSession") }),
    t("sessionId", { value: mapping.sessionId }),
    session?.projectID ? t("projectId", { value: session.projectID }) : null,
    project ? t("project", { value: project.name || project.worktree }) : null,
    t("threadId", { value: mapping.threadId }),
    t("openCodeStatus", { value: liveStatus }),
  ].filter(Boolean).join("\n");
}

async function formatTodo(baseUrl: string, sessionId: string): Promise<string> {
  const todos = await fetchJson(`${baseUrl}/session/${encodeURIComponent(sessionId)}/todo`).catch(() => []);
  if (!Array.isArray(todos) || todos.length === 0) {
    return t("noTodos");
  }

  return [
    t("todoItems", { value: todos.length }),
    ...todos.slice(0, 12).map((todo) => `- [${todo.status}] ${todo.content}`),
  ].join("\n");
}

async function formatDiff(baseUrl: string, sessionId: string): Promise<string> {
  const diff = await fetchJson(`${baseUrl}/session/${encodeURIComponent(sessionId)}/diff`).catch(() => []);
  if (!Array.isArray(diff) || diff.length === 0) {
    return t("noDiff");
  }

  return [
    t("diffFiles", { value: diff.length }),
    ...diff.slice(0, 12).map((entry) => `- ${entry.path || entry.file || "unknown"}`),
  ].join("\n");
}

async function notifyLifecycle(stateLabel: string, extra: Record<string, unknown> = {}): Promise<void> {
  const bits = [
    t("lifecycle", { state: stateLabel }),
    t("pid", { value: process.pid }),
    extra.baseUrl ? t("openCodeBase", { value: extra.baseUrl }) : null,
    t("time", { value: new Date().toISOString() }),
  ].filter(Boolean);

  await sendTelegram(bits.join("\n"));
  await appendLog(`lifecycle-${stateLabel}`, extra);
}

async function sendSessionTranscript(baseUrl: string, mapping: MappedThread, threadId: number): Promise<void> {
  const messages = await fetchJson<SessionMessage[]>(
    `${baseUrl}/session/${encodeURIComponent(mapping.sessionId)}/message?limit=100`,
  );

  if (!Array.isArray(messages) || messages.length === 0) {
    await sendTelegram("No transcript content found for this session.", { threadId });
    return;
  }

  const content = renderSessionTranscript(mapping, messages);
  const fileName = `${sanitizeFileName(mapping.title || mapping.sessionId)}.md`;
  await sendTelegramDocument(fileName, content, threadId);
}

function renderSessionTranscript(mapping: MappedThread, messages: SessionMessage[]): string {
  const blocks = [
    `# ${mapping.title || mapping.sessionId}`,
    `Session ID: ${mapping.sessionId}`,
    "",
  ];

  for (const message of messages) {
    const role = message.info.role || "unknown";
    const text = extractText(message.parts);
    if (!text) {
      continue;
    }
    blocks.push(`## ${role}`);
    blocks.push(text);
    blocks.push("");
  }

  return blocks.join("\n");
}

async function sendTelegramDocument(fileName: string, content: string, threadId: number): Promise<void> {
  const form = new FormData();
  form.set("chat_id", CHAT_ID);
  form.set("message_thread_id", String(threadId));
  form.set("document", new Blob([content], { type: "text/markdown" }), fileName);

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Telegram document request failed: ${response.status} ${response.statusText}`);
  }
}

function sanitizeFileName(value: string): string {
  return String(value || "session")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

async function fetchProjectById(baseUrl: string, projectId?: string): Promise<SessionRecord | null> {
  if (!projectId) {
    return null;
  }

  return fetchJson<SessionRecord>(`${baseUrl}/project/${encodeURIComponent(projectId)}`) as Promise<SessionRecord>;
}

function topicNameForSession(sessionId?: string, title?: string): string {
  const shortId = truncate(String(sessionId || "session").trim(), 10);
  const clean = String(title || t("untitledSession"))
    .replace(/\s+/g, " ")
    .trim();

  return truncate(`[${shortId}] ${clean || t("untitledSession")}`, 120);
}

function defaultOpencodeBin(): string {
  if (process.platform === "win32") {
    return path.join(NPM_BIN, "opencode.cmd");
  }

  return "opencode";
}

function getDesktopNotifyCommand(): string {
  if (process.platform === "darwin") {
    return "osascript";
  }

  return "notify-send";
}

function getDesktopNotifyArgs(item: NotificationItem): string[] {
  const title = `OpenCode: ${truncate(item.title || t("untitledSession"), 60)}`;
  const body = truncate(item.text || "Step completed.", 220);

  if (process.platform === "darwin") {
    return ["-e", `display notification ${toAppleScriptString(body)} with title ${toAppleScriptString(title)}`];
  }

  return [title, body];
}

function toAppleScriptString(value: unknown): string {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function escapeRegex(value: unknown): string {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createOpencodeServer(options: { hostname: string; port: number; timeout: number }): Promise<RunningServerHandle> {
  return new Promise((resolve, reject) => {
    const args = [
      "serve",
      `--hostname=${options.hostname}`,
      `--port=${options.port}`,
    ];

    const proc = spawn(OPENCODE_BIN, args, {
      env: process.env,
      shell: process.platform === "win32",
    });

    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout waiting for server after ${options.timeout}ms`));
    }, options.timeout);

    let output = "";

    proc.stdout?.on("data", (chunk) => {
      output += chunk.toString();
      const lines = output.split(/\r?\n/);
      for (const line of lines) {
        if (!line.startsWith("opencode server listening")) {
          continue;
        }

        const match = line.match(/on\s+(https?:\/\/[^\s]+)/);
        if (!match) {
          continue;
        }

        clearTimeout(timeoutId);
        resolve({
          url: match[1],
          close() {
            proc.kill();
          },
        });
        return;
      }
    });

    proc.stderr?.on("data", (chunk) => {
      output += chunk.toString();
    });

    proc.on("error", (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });

    proc.on("exit", (code) => {
      clearTimeout(timeoutId);
      reject(new Error(`OpenCode server exited with code ${code}. ${output}`.trim()));
    });
  });
}
