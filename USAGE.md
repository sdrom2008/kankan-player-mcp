# Usage

## After the key is in place

1. Call `account_status`. If this fails, the key is wrong, revoked, or Grok Bot is still closed for the account.
2. Make sure the computer or phone player is open and logged in to the same account.
3. Call `player_status` or `player_playlist`.
4. Then pause, resume, skip, seek, set volume, or play.

If a control tool says it is still waiting, the player did not pick up the command in time. Open the app, stay logged in, and try again. Commands expire in two minutes.

## Target

| Value | Who can pick it up |
|-------|--------------------|
| `any` (default) | The first logged-in player that polls |
| `windows` | The desktop player |
| `android` / `ios` | That phone app |
| `phone` | Android or iOS, not the desktop player |

## Play

`player_play` needs a list index, a name already in the list, or an `http(s)` address in `source`. Magnet links are rejected by the API.

## Stdio

The optional Node process calls the same official API. Set `KANKAN_PLAYER_MCP_API_KEY`. See README and AUTH.md.
