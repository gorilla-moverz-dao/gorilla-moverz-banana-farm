import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { query } from "./_generated/server";
import { v } from "convex/values";

// Discord interaction types
const DiscordCommandType = {
  Ping: 1,
  ApplicationCommand: 2,
} as const;

interface DiscordPostData {
  id: string;
  application_id: string;
  token: string;
  type: number;
  data: {
    options: { name: string; value: string }[];
  };
  guild_id: string;
  member: {
    user: {
      id: string;
      username: string;
    };
  };
}

// Helper to convert hex string to Uint8Array
function hexToUint8Array(hex: string): Uint8Array {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((val) => parseInt(val, 16)));
}

// Verify Discord signature
async function verifySignature(
  signature: string,
  timestamp: string,
  body: string,
  publicKey: string,
): Promise<boolean> {
  // Import tweetnacl dynamically (Convex supports this)
  const naclModule = await import("tweetnacl");
  // Handle both ESM default export and CommonJS module structure
  const nacl = naclModule.default || naclModule;
  const message = new TextEncoder().encode(timestamp + body);
  return nacl.sign.detached.verify(message, hexToUint8Array(signature), hexToUint8Array(publicKey));
}

// Create Discord response helper
function createDiscordResponse(message: string, isError: boolean = false): Response {
  return new Response(
    JSON.stringify({
      type: 4,
      data: {
        content: `\`\`\`ansi\n${isError ? "\u001b[31m" : ""}${message}\`\`\``,
        flags: 64,
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

// Create deferred response (type 5)
function createDeferredResponse(): Response {
  return new Response(
    JSON.stringify({
      type: 5,
      flags: 64,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

// Query to get collection by guild_id
export const getCollectionByGuildId = query({
  args: { guildId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("collections")
      .filter((q) => q.eq(q.field("discord_guild_id"), args.guildId))
      .first();
  },
});

// Query to check for duplicate player entries
export const checkDuplicatePlayer = query({
  args: {
    guildId: v.string(),
    column: v.union(v.literal("discord_user_id"), v.literal("wallet_address")),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("players")
      .filter((q) =>
        q.and(
          q.eq(q.field("guild_id"), args.guildId),
          q.eq(q.field(args.column), args.value),
          q.eq(q.field("deleted"), false),
        ),
      );
    return await query.first();
  },
});

// Main HTTP handler for Discord NFT allowlist
export const discordNftAllowlistHandler = httpAction(async (ctx, request) => {
  // Validate request method and headers
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const signature = request.headers.get("X-Signature-Ed25519");
  const timestamp = request.headers.get("X-Signature-Timestamp");

  if (!signature || !timestamp) {
    return new Response(JSON.stringify({ error: "Missing required headers" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.text();

  // Verify Discord signature
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) {
    console.error("DISCORD_PUBLIC_KEY not configured");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const valid = await verifySignature(signature, timestamp, body, publicKey);
  if (!valid) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const post: DiscordPostData = JSON.parse(body);
  const { type = 0, data = { options: [] } } = post;

  // Handle ping (type 1)
  if (type === DiscordCommandType.Ping) {
    return new Response(JSON.stringify({ type: 1 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Handle application command (type 2)
  if (type === DiscordCommandType.ApplicationCommand) {
    // Get collection by guild_id
    const collection = await ctx.runQuery(api.discordAllowlist.getCollectionByGuildId, {
      guildId: post.guild_id,
    });

    if (!collection) {
      return createDiscordResponse("This server is not allowed to interact with this bot.", true);
    }

    const address = data.options.find((option) => option.name === "address")?.value as string;

    if (!address) {
      return createDiscordResponse("Address not provided", true);
    }

    // TODO: Validate the address against Aptos/Movement network
    // This would require an action to make external API calls
    // For now, we skip this validation

    try {
      // Check for duplicate discord user
      const existingByUser = await ctx.runQuery(api.discordAllowlist.checkDuplicatePlayer, {
        guildId: post.guild_id,
        column: "discord_user_id",
        value: post.member.user.id,
      });

      if (existingByUser) {
        return createDiscordResponse(`User already submitted a wallet address: ${existingByUser.wallet_address}`, true);
      }

      // Check for duplicate wallet address
      const existingByWallet = await ctx.runQuery(api.discordAllowlist.checkDuplicatePlayer, {
        guildId: post.guild_id,
        column: "wallet_address",
        value: address,
      });

      if (existingByWallet) {
        return createDiscordResponse(`Wallet address already submitted: ${existingByWallet.wallet_address}`, true);
      }

      // TODO: Forward request for delayed update of message
      // The original implementation forwarded to nft-allowlist for async processing
      // because Discord requires response within 3 seconds.
      // Implement this using a Convex action or scheduled function:
      // - Validate wallet address against blockchain
      // - Insert player record into database
      // - Send follow-up Discord message via webhook

      // Return deferred response to Discord
      return createDeferredResponse();
    } catch (ex) {
      console.error(ex);
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return createDiscordResponse(errorMessage, true);
    }
  }

  // Invalid request type
  return new Response(JSON.stringify({ error: "bad request" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
});
