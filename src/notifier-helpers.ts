export type TopicMapping = {
  chatId: string;
  threadId: number;
  title: string;
  topicName: string;
  createdAt: number;
};

export type TopicMap = Record<string, TopicMapping>;

export type MappedThread = TopicMapping & { sessionId: string };

export type TelegramCommand = {
  name: string;
  args: string;
  addressed: boolean;
};

export type PaginationArgs = {
  page: number;
  pageSize: number;
};

export function parseTelegramCommandText(
  text: string,
  botUsername?: string
): TelegramCommand | null {
  const username = String(botUsername || "").trim();
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

export function shouldReplayMessage(options: {
  replayPastMessages: boolean;
  bootstrapped: boolean;
  seen: Record<string, number>;
  messageId: string;
}): boolean {
  if (!options.replayPastMessages && options.seen[options.messageId]) {
    return false;
  }

  if (!options.bootstrapped && !options.replayPastMessages) {
    return false;
  }

  return true;
}

export function findMappingByThreadId(
  threadId: number,
  topicMap: TopicMap
): MappedThread | null {
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

export function topicNameForSession(
  sessionId: string | undefined,
  title: string | undefined,
  untitledSession: string
): string {
  const shortId = truncate(String(sessionId || "session").trim(), 10);
  const clean = String(title || untitledSession)
    .replace(/\s+/g, " ")
    .trim();

  return truncate(`[${shortId}] ${clean || untitledSession}`, 120);
}

export function parsePaginationArgs(
  args: string | undefined,
  options: { defaultPageSize?: number; maxPageSize?: number } = {}
): PaginationArgs | null {
  const defaultPageSize = clampNumber(options.defaultPageSize, 10, 1, 100);
  const maxPageSize = clampNumber(options.maxPageSize, 20, 1, 100);
  const trimmed = String(args || "").trim();

  if (!trimmed) {
    return {
      page: 1,
      pageSize: Math.min(defaultPageSize, maxPageSize),
    };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length > 2) {
    return null;
  }

  const page = Number(parts[0]);
  if (!Number.isInteger(page) || page < 1) {
    return null;
  }

  if (parts.length === 1) {
    return {
      page,
      pageSize: Math.min(defaultPageSize, maxPageSize),
    };
  }

  const pageSize = Number(parts[1]);
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    return null;
  }

  return {
    page,
    pageSize: Math.min(pageSize, maxPageSize),
  };
}

function truncate(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max - 3)}...`;
}

function escapeRegex(value: unknown): string {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function clampNumber(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number
): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(Math.max(Number(value), min), max);
}
