const MESSAGES = {
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
    providers: "Providers: {value}",
    todoItems: "Todo items: {value}",
    diffFiles: "Diff files: {value}",
    statusTitle: "telegram-opencode status",
    topicHelpTitle: "telegram-opencode topic help",
    generalHelpTitle: "telegram-opencode general help",
    topicHelpIntro1: "This topic can be linked to one OpenCode session.",
    topicHelpIntro2: "Plain messages in a linked topic are forwarded to OpenCode.",
    topicHelpIntro3: "Photos, documents, audio, voice notes and videos are also forwarded.",
    generalHelpIntro1: "Use the general chat to create and inspect OpenCode sessions.",
    generalHelpIntro2: "General-chat commands must explicitly mention the bot.",
    generalHelpIntro3: "Use forum topics to talk to a specific linked session.",
    commands: "Commands:",
    examples: "Examples:",
    unknownCommand: "Unknown command. Use /help.",
    topicNotLinked: "This topic is not linked to any OpenCode session.",
    topicNotLinkedYet: "This topic is not linked yet. Use /link <session-id> or create one from general with /newtopic.",
    topicUnlinked: "Topic unlinked from the OpenCode session.",
    linkUsage: "Usage: /link <session-id>",
    sessionUsage: "Usage: /session <session-id>",
    linkedTopicToSession: "Linked this topic to session {sessionId}.",
    abortRequested: "Abort requested for session {sessionId}.",
    archivedSession: "Archived session {sessionId}.",
    sessionShared: "Session shared.",
    shareUrl: "Share URL: {url}",
    nothingToForward: "Nothing to forward from this message.",
    forwardedToSession: "Forwarded to OpenCode session {sessionId}.",
    createdSession: "Created session: {title}",
    topicCreated: "Topic created: {name}",
    postedToGeneral: "Posted to general chat",
    topicLinkedLine1: "This topic is linked to an OpenCode session.",
    topicLinkedLine2: "Send plain messages here to forward them into OpenCode.",
    sessionLinkedShort: "Session linked.",
    forkedSession: "Forked session: {title}",
    attachmentSkipped: "Attachment skipped because it exceeds {limit} bytes: {filename}",
    helpTopicStatus: "/status - show the linked session for this topic",
    helpTopicTodo: "/todo - show the OpenCode todo list for this session",
    helpTopicDiff: "/diff - show the current diff summary for this session",
    helpTopicAbort: "/abort - request abort for the running session",
    helpTopicFork: "/fork - fork the current OpenCode session into a new topic",
    helpTopicShare: "/share - generate a share link for the current session",
    helpTopicArchive: "/archive - archive the current session",
    helpTopicLink: "/link <session-id> - link this topic to an existing OpenCode session",
    helpTopicUnlink: "/unlink - remove the current topic/session mapping",
    helpTopicHelp: "/help - show this help message",
    helpGeneralNewtopic: "{mention} /newtopic <title> - create a new OpenCode session and matching Telegram topic",
    helpGeneralListtopics: "{mention} /listtopics - show saved topic/session mappings",
    helpGeneralStatus: "{mention} /status - show bridge and OpenCode runtime status",
    helpGeneralSessions: "{mention} /sessions [limit] - list recent OpenCode sessions",
    helpGeneralSession: "{mention} /session <session-id> - inspect one OpenCode session",
    helpGeneralProject: "{mention} /project - show the current OpenCode project",
    helpGeneralProjects: "{mention} /projects [limit] - list known OpenCode projects",
    helpGeneralProviders: "{mention} /providers - list configured providers and defaults",
    helpGeneralHelp: "{mention} /help - show this help message",
    helpExample1: "{mention} /newtopic investigate payment bug",
    helpExample2: "{mention} /newtopic summarize audit notes",
    lifecycle: "telegram-opencode {state}",
    openCodeBase: "OpenCode: {value}",
    time: "Time: {value}"
  }
};

for (const locale of ["pt-BR", "es", "fr", "ru", "zh", "de"]) {
  MESSAGES[locale] = { ...MESSAGES.en };
}

MESSAGES["pt-BR"] = {
  ...MESSAGES.en,
  finishedStep: "OpenCode terminou uma etapa.",
  statusTitle: "status do telegram-opencode",
  topicHelpTitle: "ajuda do topic do telegram-opencode",
  generalHelpTitle: "ajuda geral do telegram-opencode",
  unknownCommand: "Comando desconhecido. Use /help.",
  topicNotLinked: "Este topic nao esta vinculado a nenhuma sessao do OpenCode.",
  topicNotLinkedYet: "Este topic ainda nao esta vinculado. Use /link <session-id> ou crie um no geral com /newtopic.",
  topicUnlinked: "Topic desvinculado da sessao do OpenCode.",
  linkUsage: "Uso: /link <session-id>",
  sessionUsage: "Uso: /session <session-id>",
  linkedTopicToSession: "Este topic foi vinculado a sessao {sessionId}.",
  abortRequested: "Abort solicitado para a sessao {sessionId}.",
  archivedSession: "Sessao {sessionId} arquivada.",
  sessionShared: "Sessao compartilhada.",
  shareUrl: "URL de compartilhamento: {url}",
  nothingToForward: "Nada para encaminhar nesta mensagem.",
  forwardedToSession: "Encaminhado para a sessao {sessionId} do OpenCode.",
  createdSession: "Sessao criada: {title}",
  topicCreated: "Topic criado: {name}",
  postedToGeneral: "Enviado no chat geral",
  topicLinkedLine1: "Este topic esta vinculado a uma sessao do OpenCode.",
  topicLinkedLine2: "Envie mensagens aqui para encaminha-las ao OpenCode.",
  sessionLinkedShort: "Sessao vinculada.",
  forkedSession: "Sessao derivada: {title}",
  noLinkedTopics: "Nenhum topic vinculado ainda.",
  noSessions: "Nenhuma sessao encontrada.",
  noProjects: "Nenhum projeto encontrado.",
  noProviders: "Nenhum provider configurado.",
  noTodos: "Nenhum item de todo para esta sessao.",
  noDiff: "Nenhum diff para esta sessao."
};

export function createTranslator(locale) {
  const normalized = normalizeLocale(locale);
  const dict = MESSAGES[normalized] || MESSAGES.en;

  return function t(key, vars = {}) {
    const template = dict[key] || MESSAGES.en[key] || key;
    return String(template).replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`));
  };
}

function normalizeLocale(locale) {
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
