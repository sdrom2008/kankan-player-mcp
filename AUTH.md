# Auth / 鉴权

## Grok Bot — remote HTTPS (default)

1. Add MCP server URL `https://kankanplayer.com/api/bot-mcp/v1/mcp` (or install this repo — root `mcp.json` already points there).
2. When the secure card / plugin variables ask, paste your `kkp_` key.
3. Keep 看看播放器 open and logged in on the computer or phone you want to control.

在看看播放器官网账号页生成 `kkp_` 密钥，填进安全卡或插件变量。默认走远程 HTTPS。

## Remote HTTPS MCP (default)

Endpoint: `https://kankanplayer.com/api/bot-mcp/v1/mcp`

- Transport: MCP Streamable HTTP, v1 **stateless JSON** (no long SSE, no `MCP-Session-Id`)
- Auth: `Authorization: Bearer kkp_…` (also accepts `X-Api-Key`)
- Put the key only in the host secure card / plugin variable / `headers` — never in the URL, chat plaintext, or this repo
- OAuth is **not** required for v1

Plugin / repo default (`mcp.json`):

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

Optional stdio: copy `.mcp.stdio.json` (`npx` + env). See README.

## 远程 HTTPS MCP（默认）

端点：`https://kankanplayer.com/api/bot-mcp/v1/mcp`

- 传输：Streamable HTTP；v1 **无状态 JSON**（无长 SSE / Session）
- 鉴权：`Authorization: Bearer kkp_…`（兼容 `X-Api-Key`）
- 密钥只进安全卡 / 插件变量 / headers；禁止进 URL、聊天明文、本仓
- v1 不做 OAuth

可选本机 stdio：见 `.mcp.stdio.json`。

## English

1. Sign in to [看看播放器](https://kankanplayer.com/account.html).
2. If **云端控制** says an admin has to open it first, ask the admin to enable Grok Bot for this account.
3. Generate a key. Plaintext is shown once. It starts with `kkp_`.
4. Configure the MCP client:
   - **Remote (default):** plugin variable / header `Authorization: Bearer kkp_…`
   - **stdio (optional):** `KANKAN_PLAYER_MCP_API_KEY=kkp_...`
   - Optional `KANKAN_PLAYER_MCP_BASE_URL` for stdio only (default `https://kankanplayer.com/api/bot-mcp/v1`)
   - Optional `KANKAN_PLAYER_MCP_ALLOWED_HOST_SUFFIX` (default `kankanplayer.com`; must be `kankanplayer.com` or a subdomain)
5. Open the desktop or phone player and stay logged in to the same account.

Revoke a key on the same account page if it was shared or lost. Prefer rotating a key after sharing it with a new device. Never commit keys.

## 中文

1. 登录 [看看播放器官网账号页](https://kankanplayer.com/account.html)。
2. 若「云端控制」提示需要管理员先打开，请管理员为这个账号打开 Grok Bot。
3. 生成密钥。完整内容只显示一次，开头是 `kkp_`。
4. 把密钥填进助手的安全卡、插件变量，或本机 stdio 的环境变量 `KANKAN_PLAYER_MCP_API_KEY`。
5. 打开电脑或手机上的看看播放器，并登录同一个账号。

不用了就在账号页作废。不要把密钥写进仓库或网址。
