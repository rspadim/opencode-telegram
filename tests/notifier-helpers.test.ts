import { describe, expect, it } from "vitest";
import { createTranslator } from "../src/i18n.ts";
import {
  findMappingByThreadId,
  parseTelegramCommandText,
  shouldReplayMessage,
  topicNameForSession,
} from "../src/notifier-helpers.ts";

describe("createTranslator", () => {
  it("falls back to english locale", () => {
    const t = createTranslator("unknown");
    expect(t("statusTitle")).toBe("telegram-opencode status");
  });

  it("interpolates variables", () => {
    const t = createTranslator("en");
    expect(t("project", { value: "demo" })).toBe("Project: demo");
  });

  it("supports configured pt-BR strings", () => {
    const t = createTranslator("pt-BR");
    expect(t("renameUsage")).toBe("Uso: /rename <novo titulo>");
  });

  it("keeps localized keys available in other locales", () => {
    const t = createTranslator("de");
    expect(t("deletedSession", { sessionId: "ses_1" })).toBe("Sitzung ses_1 geloescht.");
  });
});

describe("parseTelegramCommandText", () => {
  it("parses addressed mention commands", () => {
    expect(parseTelegramCommandText("@demo_bot /newtopic test run", "demo_bot")).toEqual({
      name: "newtopic",
      args: "test run",
      addressed: true,
    });
  });

  it("parses slash commands with bot suffix", () => {
    expect(parseTelegramCommandText("/status@demo_bot", "demo_bot")).toEqual({
      name: "status",
      args: "",
      addressed: true,
    });
  });

  it("rejects commands for a different bot", () => {
    expect(parseTelegramCommandText("/status@other_bot", "demo_bot")).toBeNull();
  });

  it("parses plain slash commands as not addressed", () => {
    expect(parseTelegramCommandText("/status", "demo_bot")).toEqual({
      name: "status",
      args: "",
      addressed: false,
    });
  });
});

describe("shouldReplayMessage", () => {
  it("skips seen messages when replay is disabled", () => {
    expect(shouldReplayMessage({
      replayPastMessages: false,
      bootstrapped: true,
      seen: { a: 1 },
      messageId: "a",
    })).toBe(false);
  });

  it("allows unseen bootstrapped messages", () => {
    expect(shouldReplayMessage({
      replayPastMessages: false,
      bootstrapped: true,
      seen: {},
      messageId: "a",
    })).toBe(true);
  });

  it("allows history replay before bootstrap when enabled", () => {
    expect(shouldReplayMessage({
      replayPastMessages: true,
      bootstrapped: false,
      seen: { a: 1 },
      messageId: "a",
    })).toBe(true);
  });
});

describe("findMappingByThreadId", () => {
  it("finds the mapped session", () => {
    const found = findMappingByThreadId(7, {
      ses_1: {
        chatId: "-1",
        threadId: 7,
        title: "Demo",
        topicName: "[ses_1] Demo",
        createdAt: 1,
      },
    });

    expect(found?.sessionId).toBe("ses_1");
    expect(found?.threadId).toBe(7);
  });

  it("returns null when thread is unmapped", () => {
    expect(findMappingByThreadId(99, {})).toBeNull();
  });
});

describe("topicNameForSession", () => {
  it("builds a prefixed topic name", () => {
    expect(topicNameForSession("ses_1234567890", "My Session", "Untitled session")).toBe("[ses_123...] My Session");
  });

  it("falls back to untitled label", () => {
    expect(topicNameForSession("ses_1", "", "Sessao sem titulo")).toBe("[ses_1] Sessao sem titulo");
  });
});
