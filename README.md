# 看看播放器 MCP

Cloud connector for [看看播放器](https://kankanplayer.com).  
云端连接器：通过账号控制已登录的电脑或手机播放器。

This is a thin MCP shell. It is **not** the main player repository, and it has **no local database**. All calls go to the official API at `https://kankanplayer.com`.

**Default install = remote HTTPS** → `https://kankanplayer.com/api/bot-mcp/v1/mcp`  
An optional **stdio** shell (`.mcp.stdio.json` / `npx`) is included for local Claude Desktop. It calls the same official API with the same key.

The logo in `assets/logo.png` is the official 看看播放器 mark from the product website.

Contact: [support@kankanplayer.com](mailto:support@kankanplayer.com)

---

## English

### What this is
A thin [Model Context Protocol](https://modelcontextprotocol.io) surface that lets an assistant pause, resume, skip, seek, change volume, play a link or a list item, and read status on a **logged-in** 看看播放器.

The player itself does the work. The cloud path is:

account → API key → official API → a logged-in **Windows**, **Android**, or **iOS** player that is already open.

Commands live for two minutes. The tool waits a short time for the player to answer.

### What this is not
- Not the main 看看播放器 product repo
- No local database, no media files, no playback engine
- Not the Windows **local** plugin (`%USERPROFILE%\.grok\plugins\kankan-player`), which talks to a loopback control server on the same PC
- This cloud connector does not attach to a window on this computer by itself. The desktop player must be open, logged in to the same account, and have Grok Bot enabled

### Install (recommended) — remote HTTPS

Root `mcp.json` / `.mcp.json` already default to remote. After install, fill the `kkp_` key (plugin **variables** card, Grok secure card, or headers).

```json
{
  "mcpServers": {
    "kankan-player": {
      "url": "https://kankanplayer.com/api/bot-mcp/v1/mcp",
      "headers": {
        "Authorization": "Bearer ${KANKAN_PLAYER_MCP_API_KEY}"
      }
    }
  }
}
```

1. Ask an admin to enable Grok Bot for the account if it is still closed.
2. Sign in at [kankanplayer.com/account.html](https://kankanplayer.com/account.html), open **云端控制**, and generate a key (`kkp_`…). The full key is shown once.
3. Install this GitHub repo or paste the URL into Grok Bot / Cursor MCP settings.
4. Set `KANKAN_PLAYER_MCP_API_KEY` (or paste `Bearer kkp_…` into headers). Never commit a real key.
5. Open 看看播放器 on the computer or phone, and stay logged in.

Auth: `Authorization: Bearer kkp_…` (or `X-Api-Key`). v1 is **stateless JSON** (no SSE session).  
Do **not** put the key in the URL or in this repo.

Manual Cursor user config can use `${env:KANKAN_PLAYER_MCP_API_KEY}` instead of the plugin `${KANKAN_PLAYER_MCP_API_KEY}` placeholder. See [REMOTE.md](./REMOTE.md) and [AUTH.md](./AUTH.md).

The official host is `kankanplayer.com`. Do not point this connector at `api.kankanplayer.com`.

### Optional: stdio (local Claude Desktop / Cursor)

Only if you need a local Node process. Copy [`.mcp.stdio.json`](./.mcp.stdio.json) or:

```bash
npx -y github:sdrom2008/kankan-player-mcp
```

```json
{
  "mcpServers": {
    "kankan-player": {
      "command": "npx",
      "args": ["-y", "github:sdrom2008/kankan-player-mcp"],
      "env": {
        "KANKAN_PLAYER_MCP_API_KEY": "kkp_xxxxxxxx"
      }
    }
  }
}
```

Or clone + `npm install` + `npm run build` and point `command` at `dist/index.js`.

The process reads only `KANKAN_PLAYER_MCP_API_KEY`.  
Optional `KANKAN_PLAYER_MCP_BASE_URL` must be `https` on `kankanplayer.com`. A local API needs `KANKAN_PLAYER_MCP_ALLOW_INSECURE_LOCAL=1` and `http://localhost` or `http://127.0.0.1`.
Optional `KANKAN_PLAYER_MCP_ALLOWED_HOST_SUFFIX` defaults to `kankanplayer.com` and must itself be `kankanplayer.com` or a subdomain of it.

### Tools
| Tool | Purpose |
|------|---------|
| `account_status` | Whether this key can control logged-in players |
| `player_status` | What the player is playing |
| `player_playlist` | Current list |
| `player_pause` / `player_resume` / `player_toggle` / `player_stop` | Playback |
| `player_next` / `player_previous` | Move in the list |
| `player_seek` | Jump or skip, with `seconds` or `delta` |
| `player_volume` | Volume 0–100 |
| `player_play` | Play a list item (`playlistIndex` / `name`) or an `http(s)` link (`source`) |

`target` may be `windows`, `android`, `ios`, `phone`, or `any`. If omitted, the first player that picks up the command handles it. `phone` is phones only.

**Suggested flow:** `account_status` → `player_status` or `player_playlist` → pause, skip, seek, play.

### Auth
See [AUTH.md](./AUTH.md). Keys look like `kkp_` plus hex. This repo never stores account secrets.

### License
MIT

---

## 中文

这是看看播放器的云端连接器，不是播放器主仓库，也不带本地数据库。默认连到正式地址 `https://kankanplayer.com/api/bot-mcp/v1/mcp`。

要控制播放，需要：

1. 管理员先为这个账号打开 Grok Bot。
2. 在官网账号页生成密钥，开头是 `kkp_`，完整内容只显示一次。
3. 把密钥填进助手的安全卡或插件变量，不要写进仓库或网址。
4. 电脑或手机上的看看播放器保持打开，并登录同一个账号。

云端这条路走的是账号，不是本机窗口。Windows 上另外还有一个只连本机播放器的本地插件，和这个仓库不是一回事。

先调用 `account_status`，再查看或控制播放。`target` 可以是 `windows`、`android`、`ios`、`phone` 或 `any`。不写时发给先接到的那一台。
