# Remote HTTPS MCP (default)

Hosted Streamable HTTP endpoint — **default install path** for Cursor / Grok Bot.  
电脑或云端助手默认走这条；本地 stdio 见 `.mcp.stdio.json` 与 README。

## URL

```
https://kankanplayer.com/api/bot-mcp/v1/mcp
```

The official root is `kankanplayer.com`. Do not use `api.kankanplayer.com`.

## Auth

```
Authorization: Bearer kkp_<your-key>
```

Generate the key on the 看看播放器 account page after an admin enables Grok Bot.  
Never put the key in the URL or commit it here.

## Protocol (v1)

- MCP Streamable HTTP (single POST endpoint)
- Response: `application/json` (stateless; no SSE session / `MCP-Session-Id`)
- `GET` / `DELETE` → `405`

## Default Cursor / plugin install

Root `mcp.json` and `.mcp.json` both default to remote. Cursor Plugins substitute `${KANKAN_PLAYER_MCP_API_KEY}` from the plugin **variables** card (Plugins → Configure). Do not hard-code a real key.

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

Manual `~/.cursor/mcp.json` (non-plugin) can use env interpolation instead:

```json
{
  "mcpServers": {
    "kankan-player": {
      "url": "https://kankanplayer.com/api/bot-mcp/v1/mcp",
      "headers": {
        "Authorization": "Bearer ${env:KANKAN_PLAYER_MCP_API_KEY}"
      }
    }
  }
}
```

Or paste `Bearer kkp_…` once into `headers` (never commit that file).

## Optional stdio fallback

Local Claude Desktop / Cursor can still run the Node shell via `.mcp.stdio.json` (`npx` + `KANKAN_PLAYER_MCP_API_KEY`). Remote does **not** go through this Node process. Both call the official API.

## What it controls

Logged-in 看看播放器 windows on a computer, or the Android / iOS app, for the same account. It does not replace the Windows local loopback plugin.
