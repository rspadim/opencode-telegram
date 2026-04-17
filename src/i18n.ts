export type TranslateVars = Record<
  string,
  string | number | boolean | null | undefined
>;
export type Translator = (key: string, vars?: TranslateVars) => string;

type Dictionary = Record<string, string>;
type LocaleMap = Record<string, Dictionary>;

const MESSAGES: LocaleMap = {
  en: {
    untitledSession: "Untitled session",
    unknownFolder: "unknown-folder",
    unknownProject: "Unnamed project",
    unknownValue: "unknown",
    noLinkedTopics: "No linked topics yet.",
    noSessions: "No sessions found.",
    noProjects: "No projects found.",
    noProviders: "No providers configured.",
    noTodos: "No todo items for this session.",
    noDiff: "No diff entries for this session.",
    noLiveStatus: "OpenCode sessions: no live status",
    noChildSessions: "No child sessions found.",
    noTranscriptContent: "No transcript content found for this session.",
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
    childSessions: "Child sessions: {value}",
    statusTitle: "telegram-opencode status",
    topicHelpTitle: "telegram-opencode topic help",
    generalHelpTitle: "telegram-opencode general help",
    topicHelpIntro1: "This topic can be linked to one OpenCode session.",
    topicHelpIntro2:
      "Plain messages in a linked topic are forwarded to OpenCode.",
    topicHelpIntro3:
      "Photos, documents, audio, voice notes and videos are also forwarded.",
    generalHelpIntro1:
      "Use the general chat to create and inspect OpenCode sessions.",
    generalHelpIntro2: "General-chat commands must explicitly mention the bot.",
    generalHelpIntro3: "Use forum topics to talk to a specific linked session.",
    commands: "Commands:",
    examples: "Examples:",
    unknownCommand: "Unknown command. Use /help.",
    topicNotLinked: "This topic is not linked to any OpenCode session.",
    topicNotLinkedYet:
      "This topic is not linked yet. Use /link <session-id> or create one from general with /newtopic.",
    topicUnlinked: "Topic unlinked from the OpenCode session.",
    linkUsage: "Usage: /link <session-id>",
    sessionUsage: "Usage: /session <session-id>",
    renameUsage: "Usage: /rename <new title>",
    linkedTopicToSession: "Linked this topic to session {sessionId}.",
    abortRequested: "Abort requested for session {sessionId}.",
    archivedSession: "Archived session {sessionId}.",
    deletedSession: "Deleted session {sessionId}.",
    renamedSession: "Session renamed to: {title}",
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
    attachmentSkipped:
      "Attachment skipped because it exceeds {limit} bytes: {filename}",
    helpTopicStatus: "/status - show the linked session for this topic",
    helpTopicTodo: "/todo - show the OpenCode todo list for this session",
    helpTopicDiff: "/diff - show the current diff summary for this session",
    helpTopicAbort: "/abort - request abort for the running session",
    helpTopicFork: "/fork - fork the current OpenCode session into a new topic",
    helpTopicShare: "/share - generate a share link for the current session",
    helpTopicArchive: "/archive - archive the current session",
    helpTopicRename: "/rename <new title> - rename the current session",
    helpTopicChildren: "/children - list child sessions created from this one",
    helpTopicDelete:
      "/delete - delete the current session and unlink this topic",
    helpTopicDownload:
      "/download - export the recent session transcript as a file",
    helpTopicLink:
      "/link <session-id> - link this topic to an existing OpenCode session",
    helpTopicUnlink: "/unlink - remove the current topic/session mapping",
    helpTopicHelp: "/help - show this help message",
    helpGeneralNewtopic:
      "{mention} /newtopic <title> - create a new OpenCode session and matching Telegram topic",
    helpGeneralListtopics:
      "{mention} /listtopics - show saved topic/session mappings",
    helpGeneralStatus:
      "{mention} /status - show bridge and OpenCode runtime status",
    helpGeneralSessions:
      "{mention} /sessions [limit] - list recent OpenCode sessions",
    helpGeneralSession:
      "{mention} /session <session-id> - inspect one OpenCode session",
    helpGeneralProject:
      "{mention} /project - show the current OpenCode project",
    helpGeneralProjects:
      "{mention} /projects [limit] - list known OpenCode projects",
    helpGeneralProviders:
      "{mention} /providers - list configured providers and defaults",
    helpGeneralHelp: "{mention} /help - show this help message",
    helpExample1: "{mention} /newtopic investigate payment bug",
    helpExample2: "{mention} /newtopic summarize audit notes",
    lifecycle: "telegram-opencode {state}",
    openCodeBase: "OpenCode: {value}",
    time: "Time: {value}",
  },
};

for (const locale of ["pt-BR", "es", "fr", "ru", "zh", "de"]) {
  MESSAGES[locale] = { ...MESSAGES.en };
}

MESSAGES["pt-BR"] = {
  ...MESSAGES.en,
  untitledSession: "Sessao sem titulo",
  unknownFolder: "pasta-desconhecida",
  unknownProject: "Projeto sem nome",
  unknownValue: "desconhecido",
  noLinkedTopics: "Nenhum topic vinculado ainda.",
  noSessions: "Nenhuma sessao encontrada.",
  noProjects: "Nenhum projeto encontrado.",
  noProviders: "Nenhum provider configurado.",
  noTodos: "Nenhum item de todo para esta sessao.",
  noDiff: "Nenhum diff para esta sessao.",
  noLiveStatus: "Sessoes OpenCode: sem status ao vivo",
  noChildSessions: "Nenhuma sessao filha encontrada.",
  noTranscriptContent:
    "Nenhum conteudo de transcricao encontrado para esta sessao.",
  finishedStep: "OpenCode terminou uma etapa.",
  project: "Projeto: {value}",
  projectId: "ID do projeto: {value}",
  session: "Sessao: {value}",
  sessionId: "ID da sessao: {value}",
  directory: "Diretorio: {value}",
  created: "Criado: {value}",
  updated: "Atualizado: {value}",
  parent: "Pai: {value}",
  threadId: "ID do topico: {value}",
  openCodeStatus: "Status do OpenCode: {value}",
  topicMappings: "Mapeamentos de topics: {value}",
  telegramOffset: "Offset do Telegram: {value}",
  linkedTopics: "Topics vinculados: {value}",
  recentSessions: "Sessoes recentes: {value}",
  projects: "Projetos: {value}",
  openCodeSessionsSummary: "Sessoes OpenCode: {value}",
  providers: "Providers: {value}",
  todoItems: "Itens de todo: {value}",
  diffFiles: "Arquivos com diff: {value}",
  childSessions: "Sessoes filhas: {value}",
  statusTitle: "status do telegram-opencode",
  topicHelpTitle: "ajuda do topic do telegram-opencode",
  generalHelpTitle: "ajuda geral do telegram-opencode",
  topicHelpIntro1: "Este topic pode ser vinculado a uma sessao do OpenCode.",
  topicHelpIntro2:
    "Mensagens normais em um topic vinculado sao encaminhadas ao OpenCode.",
  topicHelpIntro3:
    "Fotos, documentos, audios, notas de voz e videos tambem sao encaminhados.",
  generalHelpIntro1:
    "Use o chat geral para criar e inspecionar sessoes do OpenCode.",
  generalHelpIntro2:
    "Comandos no chat geral devem mencionar o bot explicitamente.",
  generalHelpIntro3:
    "Use forum topics para conversar com uma sessao vinculada especifica.",
  commands: "Comandos:",
  examples: "Exemplos:",
  unknownCommand: "Comando desconhecido. Use /help.",
  topicNotLinked: "Este topic nao esta vinculado a nenhuma sessao do OpenCode.",
  topicNotLinkedYet:
    "Este topic ainda nao esta vinculado. Use /link <session-id> ou crie um no geral com /newtopic.",
  topicUnlinked: "Topic desvinculado da sessao do OpenCode.",
  linkUsage: "Uso: /link <session-id>",
  sessionUsage: "Uso: /session <session-id>",
  renameUsage: "Uso: /rename <novo titulo>",
  linkedTopicToSession: "Este topic foi vinculado a sessao {sessionId}.",
  abortRequested: "Abort solicitado para a sessao {sessionId}.",
  archivedSession: "Sessao {sessionId} arquivada.",
  deletedSession: "Sessao {sessionId} removida.",
  renamedSession: "Sessao renomeada para: {title}",
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
  attachmentSkipped: "Anexo ignorado porque excede {limit} bytes: {filename}",
  helpTopicStatus: "/status - mostra a sessao vinculada a este topic",
  helpTopicTodo: "/todo - mostra a lista de todo desta sessao",
  helpTopicDiff: "/diff - mostra o resumo atual de diff desta sessao",
  helpTopicAbort: "/abort - solicita abortar a sessao em execucao",
  helpTopicFork: "/fork - deriva a sessao atual do OpenCode para um novo topic",
  helpTopicShare:
    "/share - gera um link de compartilhamento para a sessao atual",
  helpTopicArchive: "/archive - arquiva a sessao atual",
  helpTopicRename: "/rename <novo titulo> - renomeia a sessao atual",
  helpTopicChildren: "/children - lista sessoes filhas criadas a partir desta",
  helpTopicDelete: "/delete - remove a sessao atual e desvincula este topic",
  helpTopicDownload:
    "/download - exporta a transcricao recente da sessao como arquivo",
  helpTopicLink:
    "/link <session-id> - vincula este topic a uma sessao existente do OpenCode",
  helpTopicUnlink: "/unlink - remove o mapeamento atual topic/sessao",
  helpTopicHelp: "/help - mostra esta ajuda",
  helpGeneralNewtopic:
    "{mention} /newtopic <titulo> - cria uma nova sessao do OpenCode e o topic correspondente no Telegram",
  helpGeneralListtopics:
    "{mention} /listtopics - mostra os mapeamentos salvos de topic/sessao",
  helpGeneralStatus:
    "{mention} /status - mostra o status da ponte e do runtime OpenCode",
  helpGeneralSessions:
    "{mention} /sessions [limit] - lista sessoes recentes do OpenCode",
  helpGeneralSession:
    "{mention} /session <session-id> - inspeciona uma sessao do OpenCode",
  helpGeneralProject: "{mention} /project - mostra o projeto atual do OpenCode",
  helpGeneralProjects:
    "{mention} /projects [limit] - lista projetos conhecidos do OpenCode",
  helpGeneralProviders:
    "{mention} /providers - lista providers configurados e padroes",
  helpGeneralHelp: "{mention} /help - mostra esta ajuda",
  helpExample1: "{mention} /newtopic investigar bug de pagamento",
  helpExample2: "{mention} /newtopic resumir notas de auditoria",
  lifecycle: "telegram-opencode {state}",
  openCodeBase: "OpenCode: {value}",
  time: "Hora: {value}",
};

MESSAGES.es = {
  ...MESSAGES.en,
  untitledSession: "Sesion sin titulo",
  unknownFolder: "carpeta-desconocida",
  unknownProject: "Proyecto sin nombre",
  unknownValue: "desconocido",
  noLinkedTopics: "Todavia no hay topics vinculados.",
  noSessions: "No se encontraron sesiones.",
  noProjects: "No se encontraron proyectos.",
  noProviders: "No hay proveedores configurados.",
  noTodos: "No hay tareas para esta sesion.",
  noDiff: "No hay cambios para esta sesion.",
  noLiveStatus: "Sesiones de OpenCode: sin estado en vivo",
  noChildSessions: "No se encontraron sesiones hijas.",
  noTranscriptContent:
    "No se encontro contenido de transcripcion para esta sesion.",
  finishedStep: "OpenCode termino un paso.",
  project: "Proyecto: {value}",
  projectId: "ID del proyecto: {value}",
  session: "Sesion: {value}",
  sessionId: "ID de la sesion: {value}",
  directory: "Directorio: {value}",
  created: "Creado: {value}",
  updated: "Actualizado: {value}",
  parent: "Padre: {value}",
  threadId: "ID del hilo: {value}",
  openCodeStatus: "Estado de OpenCode: {value}",
  topicMappings: "Mapeos de topics: {value}",
  telegramOffset: "Offset de Telegram: {value}",
  linkedTopics: "Topics vinculados: {value}",
  recentSessions: "Sesiones recientes: {value}",
  projects: "Proyectos: {value}",
  openCodeSessionsSummary: "Sesiones de OpenCode: {value}",
  providers: "Proveedores: {value}",
  todoItems: "Tareas: {value}",
  diffFiles: "Archivos con cambios: {value}",
  childSessions: "Sesiones hijas: {value}",
  statusTitle: "estado de telegram-opencode",
  topicHelpTitle: "ayuda del topic de telegram-opencode",
  generalHelpTitle: "ayuda general de telegram-opencode",
  topicHelpIntro1: "Este topic puede vincularse a una sesion de OpenCode.",
  topicHelpIntro2:
    "Los mensajes normales en un topic vinculado se envian a OpenCode.",
  topicHelpIntro3:
    "Las fotos, documentos, audios, notas de voz y videos tambien se envian.",
  generalHelpIntro1:
    "Usa el chat general para crear e inspeccionar sesiones de OpenCode.",
  generalHelpIntro2:
    "Los comandos del chat general deben mencionar explicitamente al bot.",
  generalHelpIntro3:
    "Usa los forum topics para hablar con una sesion vinculada.",
  commands: "Comandos:",
  examples: "Ejemplos:",
  unknownCommand: "Comando desconocido. Usa /help.",
  topicNotLinked: "Este topic no esta vinculado a ninguna sesion de OpenCode.",
  topicNotLinkedYet:
    "Este topic aun no esta vinculado. Usa /link <session-id> o crea uno desde el general con /newtopic.",
  topicUnlinked: "Topic desvinculado de la sesion de OpenCode.",
  linkUsage: "Uso: /link <session-id>",
  sessionUsage: "Uso: /session <session-id>",
  renameUsage: "Uso: /rename <nuevo titulo>",
  linkedTopicToSession: "Este topic se vinculo a la sesion {sessionId}.",
  abortRequested: "Se solicito abortar la sesion {sessionId}.",
  archivedSession: "Sesion {sessionId} archivada.",
  deletedSession: "Sesion {sessionId} eliminada.",
  renamedSession: "Sesion renombrada a: {title}",
  sessionShared: "Sesion compartida.",
  shareUrl: "URL compartida: {url}",
  nothingToForward: "No hay nada que reenviar en este mensaje.",
  forwardedToSession: "Enviado a la sesion {sessionId} de OpenCode.",
  createdSession: "Sesion creada: {title}",
  topicCreated: "Topic creado: {name}",
  postedToGeneral: "Enviado al chat general",
  topicLinkedLine1: "Este topic esta vinculado a una sesion de OpenCode.",
  topicLinkedLine2: "Envia mensajes aqui para reenviarlos a OpenCode.",
  sessionLinkedShort: "Sesion vinculada.",
  forkedSession: "Sesion derivada: {title}",
  attachmentSkipped: "Archivo omitido porque supera {limit} bytes: {filename}",
  helpTopicStatus: "/status - muestra la sesion vinculada a este topic",
  helpTopicTodo: "/todo - muestra la lista de tareas de esta sesion",
  helpTopicDiff: "/diff - muestra el resumen actual de cambios",
  helpTopicAbort: "/abort - solicita abortar la sesion en ejecucion",
  helpTopicFork: "/fork - deriva la sesion actual en un nuevo topic",
  helpTopicShare: "/share - genera un enlace compartido para la sesion actual",
  helpTopicArchive: "/archive - archiva la sesion actual",
  helpTopicRename:
    "/rename <nuevo titulo> - cambia el titulo de la sesion actual",
  helpTopicChildren: "/children - lista las sesiones hijas creadas desde esta",
  helpTopicDelete: "/delete - elimina la sesion actual y desvincula este topic",
  helpTopicDownload:
    "/download - exporta la transcripcion reciente de la sesion como archivo",
  helpTopicLink:
    "/link <session-id> - vincula este topic a una sesion existente",
  helpTopicUnlink: "/unlink - elimina el mapeo actual topic/sesion",
  helpTopicHelp: "/help - muestra este mensaje de ayuda",
  helpGeneralNewtopic:
    "{mention} /newtopic <titulo> - crea una nueva sesion de OpenCode y su topic de Telegram",
  helpGeneralListtopics:
    "{mention} /listtopics - muestra los mapeos guardados de topic/sesion",
  helpGeneralStatus:
    "{mention} /status - muestra el estado del bridge y de OpenCode",
  helpGeneralSessions:
    "{mention} /sessions [limit] - lista sesiones recientes de OpenCode",
  helpGeneralSession:
    "{mention} /session <session-id> - inspecciona una sesion de OpenCode",
  helpGeneralProject:
    "{mention} /project - muestra el proyecto actual de OpenCode",
  helpGeneralProjects:
    "{mention} /projects [limit] - lista proyectos conocidos de OpenCode",
  helpGeneralProviders:
    "{mention} /providers - lista proveedores configurados y valores por defecto",
  helpGeneralHelp: "{mention} /help - muestra este mensaje de ayuda",
  helpExample1: "{mention} /newtopic investigar error de pago",
  helpExample2: "{mention} /newtopic resumir notas de auditoria",
  lifecycle: "telegram-opencode {state}",
  openCodeBase: "OpenCode: {value}",
  time: "Hora: {value}",
};

MESSAGES.fr = {
  ...MESSAGES.en,
  renameUsage: "Usage : /rename <nouveau titre>",
  deletedSession: "Session {sessionId} supprimee.",
  renamedSession: "Session renommee en : {title}",
  noChildSessions: "Aucune session enfant trouvee.",
  childSessions: "Sessions enfants : {value}",
  noTranscriptContent:
    "Aucun contenu de transcription trouve pour cette session.",
  helpTopicRename: "/rename <nouveau titre> - renommer la session courante",
  helpTopicChildren:
    "/children - lister les sessions enfants creees depuis celle-ci",
  helpTopicDelete:
    "/delete - supprimer la session courante et dissocier ce topic",
  helpTopicDownload:
    "/download - exporter la transcription recente de la session dans un fichier",
};

MESSAGES.ru = {
  ...MESSAGES.en,
  renameUsage: "Использование: /rename <новое название>",
  deletedSession: "Сессия {sessionId} удалена.",
  renamedSession: "Сессия переименована в: {title}",
  noChildSessions: "Дочерние сессии не найдены.",
  childSessions: "Дочерние сессии: {value}",
  noTranscriptContent: "Для этой сессии не найдено содержимое расшифровки.",
  helpTopicRename: "/rename <новое название> - переименовать текущую сессию",
  helpTopicChildren: "/children - показать дочерние сессии, созданные из этой",
  helpTopicDelete: "/delete - удалить текущую сессию и отвязать этот topic",
  helpTopicDownload:
    "/download - экспортировать недавнюю расшифровку сессии в файл",
};

MESSAGES.zh = {
  ...MESSAGES.en,
  renameUsage: "用法：/rename <新标题>",
  deletedSession: "已删除会话 {sessionId}。",
  renamedSession: "会话已重命名为：{title}",
  noChildSessions: "未找到子会话。",
  childSessions: "子会话：{value}",
  noTranscriptContent: "此会话没有可导出的转录内容。",
  helpTopicRename: "/rename <新标题> - 重命名当前会话",
  helpTopicChildren: "/children - 列出从当前会话创建的子会话",
  helpTopicDelete: "/delete - 删除当前会话并解除此主题关联",
  helpTopicDownload: "/download - 将最近的会话转录导出为文件",
};

MESSAGES.de = {
  ...MESSAGES.en,
  renameUsage: "Verwendung: /rename <neuer Titel>",
  deletedSession: "Sitzung {sessionId} geloescht.",
  renamedSession: "Sitzung umbenannt in: {title}",
  noChildSessions: "Keine untergeordneten Sitzungen gefunden.",
  childSessions: "Untergeordnete Sitzungen: {value}",
  noTranscriptContent: "Kein Transkriptinhalt fuer diese Sitzung gefunden.",
  helpTopicRename: "/rename <neuer Titel> - die aktuelle Sitzung umbenennen",
  helpTopicChildren:
    "/children - untergeordnete Sitzungen aus dieser Sitzung auflisten",
  helpTopicDelete:
    "/delete - die aktuelle Sitzung loeschen und dieses Topic trennen",
  helpTopicDownload:
    "/download - das aktuelle Sitzungsprotokoll als Datei exportieren",
};

export function createTranslator(locale: string): Translator {
  const normalized = normalizeLocale(locale);
  const dict = MESSAGES[normalized] || MESSAGES.en;

  return function t(key: string, vars: TranslateVars = {}): string {
    const template = dict[key] || MESSAGES.en[key] || key;
    return String(template).replace(/\{(\w+)\}/g, (_, name: string) =>
      String(vars[name] ?? `{${name}}`)
    );
  };
}

function normalizeLocale(locale: string): string {
  const value = String(locale || "en").trim();
  if (!value) return "en";
  const lowered = value.toLowerCase();
  if (lowered === "pt-br" || lowered === "pt_br" || lowered === "pt")
    return "pt-BR";
  if (lowered.startsWith("es")) return "es";
  if (lowered.startsWith("fr")) return "fr";
  if (lowered.startsWith("ru")) return "ru";
  if (lowered.startsWith("zh")) return "zh";
  if (lowered.startsWith("de")) return "de";
  return "en";
}
