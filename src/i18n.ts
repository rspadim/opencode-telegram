export type TranslateVars = Record<string, string | number | boolean | null | undefined>;
export type Translator = (key: string, vars?: TranslateVars) => string;

type Dictionary = Record<string, string>;
type LocaleMap = Record<string, Dictionary>;

const MESSAGES: LocaleMap = {
  en: {
    untitledSession: "Untitled session",
    unknownFolder: "unknown-folder",
    unknownProject: "Unnamed project",
    noLinkedTopics: "No linked topics yet.",
    noSessions: "No sessions found.",
    noProjects: "No projects found.",
    noProviders: "No providers configured.",
    noTodos: "No todo items for this session.",
    noDiff: "No diff entries for this session.",
    noLiveStatus: "OpenCode sessions: no live status",
    finishedStep: "OpenCode finished a step.",
    project: "Project: {value}",
    projectId: "Project ID: {value}",
    session: "Session: {value}",
    sessionId: "Session ID: {value}",
    id: "ID: {value}",
    directory: "Directory: {value}",
    created: "Created: {value}",
    updated: "Updated: {value}",
    parent: "Parent: {value}",
    worktree: "Worktree: {value}",
    vcs: "VCS: {value}",
    threadId: "Thread ID: {value}",
    openCodeStatus: "OpenCode status: {value}",
    pid: "PID: {value}",
    topicMappings: "Topic mappings: {value}",
    telegramOffset: "Telegram offset: {value}",
    linkedTopics: "Linked topics: {value}",
    recentSessions: "Recent sessions: {value}",
    projects: "Projects: {value}",
    openCodeSessionsSummary: "OpenCode sessions: {value}",
    providers: "Providers: {value}",
    todoItems: "Todo items: {value}",
    diffFiles: "Diff files: {value}",
    statusTitle: "telegram-opencode status"
  }
};

export function createTranslator(locale: string): Translator {
  const normalized = normalizeLocale(locale);
  const dict = MESSAGES[normalized] || MESSAGES.en;

  return function t(key: string, vars: TranslateVars = {}): string {
    const template = dict[key] || MESSAGES.en[key] || key;
    return String(template).replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
  };
}

function normalizeLocale(locale: string): string {
  const value = String(locale || "en").trim();
  if (!value) return "en";
  const lowered = value.toLowerCase();
  if (lowered === "pt-br" || lowered === "pt_br" || lowered === "pt") return "pt-BR";
  if (lowered.startsWith("es")) return "es";
  if (lowered.startsWith("fr")) return "fr";
  if (lowered.startsWith("ru")) return "ru";
  if (lowered.startsWith("zh")) return "zh";
  if (lowered.startsWith("de")) return "de";
  return "en";
}
