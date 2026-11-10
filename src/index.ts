#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { KankanPlayerClient, redactSecrets } from "./client.js";
import { TOOLS } from "./tools.js";

const apiKey = process.env.KANKAN_PLAYER_MCP_API_KEY ?? "";

const server = new Server(
  { name: "kankan-player-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    annotations: tool.annotations,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;
  const tool = TOOLS.find((item) => item.name === name);
  if (!tool) {
    return {
      content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  try {
    const client = new KankanPlayerClient(apiKey);
    const args = (request.params.arguments ?? {}) as Record<string, unknown>;
    const result = await tool.handler(client, args);
    return {
      content: [{ type: "text" as const, text: typeof result === "string" ? result : JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const message = redactSecrets(err instanceof Error ? err.message : String(err), apiKey);
    return {
      content: [{ type: "text" as const, text: message }],
      isError: true,
    };
  }
});

async function main() {
  if (!apiKey.trim()) {
    console.error("KANKAN_PLAYER_MCP_API_KEY is required.");
    process.exit(1);
  }
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(redactSecrets(err instanceof Error ? err.message : String(err), apiKey));
  process.exit(1);
});
