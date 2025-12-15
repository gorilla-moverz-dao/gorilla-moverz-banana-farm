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
