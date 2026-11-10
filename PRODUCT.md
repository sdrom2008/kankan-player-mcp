# Product

看看播放器 cloud MCP is a thin connector. The official API at `https://kankanplayer.com` holds accounts, keys, and the short command queue. This repository only describes how a host should connect.

- Product site: https://kankanplayer.com
- Account page (create / revoke `kkp_` keys): https://kankanplayer.com/account.html
- Remote MCP: https://kankanplayer.com/api/bot-mcp/v1/mcp
- Support: support@kankanplayer.com
- Privacy: privacy@kankanplayer.com

This is not the player source tree. It has no database and no media pipeline.

Cloud control reaches a player that is already open and logged in (Windows, Android, or iOS). Use this connector with a `kkp_` account key; there is no separate local Windows plugin.
