---
name: kankan-player-connect
description: >-
  Connect 看看播放器 cloud MCP (remote HTTPS default) with a kkp_ account key.
  Use when installing the plugin, adding the MCP URL, filling the secure/variables
  card, fixing 401/403 auth, or the user asks how to let Grok or Cursor control
  看看播放器 through an account.
---

# Connect 看看播放器 cloud MCP

## Default: remote HTTPS

1. Endpoint: `https://kankanplayer.com/api/bot-mcp/v1/mcp`
2. Auth header: `Authorization: Bearer kkp_…` (also accepts `X-Api-Key`)
3. Install this repo (`mcp.json` already remote) or paste the URL into Grok Bot or Cursor MCP settings
4. Key source: 看看播放器 website → account page → **云端控制** → generate. An admin must enable Grok Bot first. Prefix `kkp_`. Plaintext once.
5. Put the key only in plugin **variables** (`KANKAN_PLAYER_MCP_API_KEY`), the Grok secure card, or headers. Never URL query, chat plaintext, README, or git.
6. v1 is **stateless JSON** (no SSE session / OAuth).
7. The official host is `kankanplayer.com`, not `api.kankanplayer.com`.

## Smoke after connect

1. Call `account_status` — expect the account to be allowed, and a list of which players are listening.
2. Open 看看播放器 on the computer or phone and stay logged in.
3. Call `player_status`. Then hand off to pause, skip, seek, or play.

This cloud path is account → logged-in players.

## Common failures

| Symptom | Likely cause | What to tell the user |
|---------|--------------|---------------------------|
| 401 密钥无效 / 密钥已作废 | Bad, missing, or revoked key | Generate a new key on the account page and paste it again |
| 403 这个账号的 Grok Bot 已关闭 | Admin has not enabled Grok Bot | Ask an admin to turn it on, then generate a key |
| Tool waits, no result | Player is closed or not logged in | Open 看看播放器 on the computer or phone and stay signed in |
| Wanted to control this PC, but nothing happens | Player is closed or not logged in | Open 看看播放器 on this computer, stay signed in, and use this cloud connector |

## Optional stdio

Only if they need a local Node process (e.g. Claude Desktop): copy `.mcp.stdio.json` or `npx -y github:sdrom2008/kankan-player-mcp` with env `KANKAN_PLAYER_MCP_API_KEY`. Prefer remote for Grok Bot / Cursor Plugins.
