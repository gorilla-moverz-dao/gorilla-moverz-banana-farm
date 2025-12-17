import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { query } from "./_generated/server";
import { v } from "convex/values";
import {
  DiscordCommandType,
  DiscordPostData,
  validateDiscordRequest,
  createDiscordResponse,
  createDeferredResponse,
} from "./discordUtils";
import { MOVEMENT_FULLNODE_URL } from "./config";

// Query to get collection by guild_id (uses index)
export const getCollectionByGuildId = query({
  args: { guildId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("collections")
      .withIndex("by_discord_guild_id", (q) => q.eq("discord_guild_id", args.guildId))
      .first();
  },
});

// Query to check for duplicate player by discord user (uses index)
export const checkDuplicateByUser = query({
  args: {
    guildId: v.string(),
    discordUserId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("allowlist")
      .withIndex("by_guild_and_user", (q) =>
        q.eq("guild_id", args.guildId).eq("discord_user_id", args.discordUserId).eq("deleted", false),
      )
      .first();
  },
});

// Query to check for duplicate player by wallet address (uses index)
export const checkDuplicateByWallet = query({
  args: {
    guildId: v.string(),
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("allowlist")
      .withIndex("by_guild_and_wallet", (q) =>
        q.eq("guild_id", args.guildId).eq("wallet_address", args.walletAddress).eq("deleted", false),
      )
      .first();
  },
});

// Main HTTP handler for Discord NFT allowlist
export const discordNftAllowlistHandler = httpAction(async (ctx, request) => {
  // Validate and verify Discord request
  const validation = await validateDiscordRequest(request);
  if (!validation.valid) {
    return validation.error!;
  }

  const post: DiscordPostData = JSON.parse(validation.body);
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

    // Validate the address against Movement network
    try {
      const res = await fetch(`${MOVEMENT_FULLNODE_URL}/accounts/${address}`);
      if (!res.ok) {
        return createDiscordResponse(`Address not found on Movement network`, true);
      }
    } catch (err) {
      console.error("Address validation failed:", err);
      return createDiscordResponse("Failed to validate address", true);
    }

    try {
      // Check for duplicate discord user
      const existingByUser = await ctx.runQuery(api.discordAllowlist.checkDuplicateByUser, {
        guildId: post.guild_id,
        discordUserId: post.member.user.id,
      });

      if (existingByUser) {
        return createDiscordResponse(`User already submitted a wallet address: ${existingByUser.wallet_address}`, true);
      }

      // Check for duplicate wallet address
      const existingByWallet = await ctx.runQuery(api.discordAllowlist.checkDuplicateByWallet, {
        guildId: post.guild_id,
        walletAddress: address,
      });

      if (existingByWallet) {
        return createDiscordResponse(`Wallet address already submitted: ${existingByWallet.wallet_address}`, true);
      }

      // Schedule async processing (blockchain tx, db insert, Discord follow-up)
      // Discord requires response within 3 seconds, so we defer the actual work
      await ctx.scheduler.runAfter(0, internal.nftAllowlist.processAllowlistRequest, {
        address,
        collectionId: collection.collection_address,
        discordUserId: post.member.user.id,
        discordUserName: post.member.user.username,
        guildId: post.guild_id,
        applicationId: post.application_id,
        interactionToken: post.token,
      });

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
