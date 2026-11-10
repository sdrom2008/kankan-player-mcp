import type { KankanPlayerClient } from "./client.js";

type ToolAnnotations = {
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
};

type ToolDef = {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  annotations?: ToolAnnotations;
  handler: (client: KankanPlayerClient, args: Record<string, unknown>) => Promise<unknown>;
};

const READ: ToolAnnotations = { readOnlyHint: true, destructiveHint: false, openWorldHint: true };
const WRITE: ToolAnnotations = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true };

const TARGET = {
  target: {
    type: "string",
    description: "windows、android、ios、phone 或 any。不写时发给先接到的那一台。",
  },
} as const;

function commandBody(action: string, args: Record<string, unknown>, extra: string[] = []): Record<string, unknown> {
  const body: Record<string, unknown> = { action };
  const target = typeof args.target === "string" ? args.target.trim() : "";
  body.target = target.length === 0 ? "any" : target;
  for (const key of extra) {
    if (args[key] !== undefined && args[key] !== null && args[key] !== "") body[key] = args[key];
  }
  return body;
}

async function postAndWait(client: KankanPlayerClient, body: Record<string, unknown>): Promise<unknown> {
  const posted = await client.post<{ id?: string; message?: string }>("/command", body);
  const id = posted.id;
  if (!id) return posted;

  const started = Date.now();
  while (Date.now() - started < 20_000) {
    const result = await client.get<{ ready?: boolean; ok?: boolean; message?: string }>("/result", { id });
    if (result.ready) {
      return { id, ready: true, ok: result.ok, message: result.message };
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  return {
    id,
    ready: false,
    message: "还在等播放器回应。请确认电脑或手机已登录并打开看看播放器。",
  };
}

export const TOOLS: ToolDef[] = [
  {
    name: "account_status",
    description: "查看这把密钥对应的账号是否可以控制已登录的播放器。",
    annotations: READ,
    inputSchema: { type: "object", properties: {}, required: [] },
    handler: (c) => c.get("/account"),
  },
  {
    name: "player_status",
    description: "查看已登录播放器正在播什么。",
    annotations: READ,
    inputSchema: { type: "object", properties: { ...TARGET } },
    handler: (c, a) => postAndWait(c, commandBody("status", a)),
  },
  {
    name: "player_playlist",
    description: "查看已登录播放器的列表。",
    annotations: READ,
    inputSchema: { type: "object", properties: { ...TARGET } },
    handler: (c, a) => postAndWait(c, commandBody("playlist", a)),
  },
  {
    name: "player_pause",
    description: "暂停已登录的播放器。",
    annotations: WRITE,
    inputSchema: { type: "object", properties: { ...TARGET } },
    handler: (c, a) => postAndWait(c, commandBody("pause", a)),
  },
  {
    name: "player_resume",
    description: "继续播放。",
    annotations: WRITE,
    inputSchema: { type: "object", properties: { ...TARGET } },
    handler: (c, a) => postAndWait(c, commandBody("resume", a)),
  },
  {
    name: "player_toggle",
    description: "在暂停和继续之间切换。",
    annotations: WRITE,
    inputSchema: { type: "object", properties: { ...TARGET } },
    handler: (c, a) => postAndWait(c, commandBody("toggle", a)),
  },
  {
    name: "player_stop",
    description: "停止播放。",
    annotations: WRITE,
    inputSchema: { type: "object", properties: { ...TARGET } },
    handler: (c, a) => postAndWait(c, commandBody("stop", a)),
  },
  {
    name: "player_next",
    description: "播放下一集。",
    annotations: WRITE,
    inputSchema: { type: "object", properties: { ...TARGET } },
    handler: (c, a) => postAndWait(c, commandBody("next", a)),
  },
  {
    name: "player_previous",
    description: "播放上一集。",
    annotations: WRITE,
    inputSchema: { type: "object", properties: { ...TARGET } },
    handler: (c, a) => postAndWait(c, commandBody("previous", a)),
  },
  {
    name: "player_seek",
    description: "跳到指定时间，或快进快退。用 seconds 或 delta，单位是秒。",
    annotations: WRITE,
    inputSchema: {
      type: "object",
      properties: {
        ...TARGET,
        seconds: { type: "number" },
        delta: { type: "number" },
      },
    },
    handler: (c, a) => postAndWait(c, commandBody("seek", a, ["seconds", "delta"])),
  },
  {
    name: "player_volume",
    description: "设置音量，0 到 100。",
    annotations: WRITE,
    inputSchema: {
      type: "object",
      properties: {
        ...TARGET,
        level: { type: "integer", minimum: 0, maximum: 100 },
      },
      required: ["level"],
    },
    handler: (c, a) => postAndWait(c, commandBody("volume", a, ["level"])),
  },
  {
    name: "player_play",
    description: "播放列表里的某一条，或主人给出的网址。用 playlistIndex、name 或 source。",
    annotations: WRITE,
    inputSchema: {
      type: "object",
      properties: {
        ...TARGET,
        source: { type: "string" },
        name: { type: "string" },
        playlistIndex: { type: "integer" },
      },
    },
    handler: (c, a) => postAndWait(c, commandBody("play", a, ["source", "name", "playlistIndex"])),
  },
];
