import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const queryLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    return (await ctx.db.query("leaderboard").order("desc").take(100)).map((player) => ({
      discord_user_name: player.discord_user_name,
      banana_count: player.banana_count,
      wallet_address: player.wallet_address,
    }));
  },
});

export const upsertLeaderboardEntry = internalMutation({
  args: {
    wallet_address: v.string(),
    banana_count: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("leaderboard")
      .filter((q) => q.eq(q.field("wallet_address"), args.wallet_address))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        banana_count: args.banana_count,
      });
    } else {
      const bananaFarmerGuildId = "1248584514494529657";
      const allowlist = await ctx.db
        .query("allowlist")
        .withIndex("by_guild_and_wallet", (q) =>
          q.eq("guild_id", bananaFarmerGuildId).eq("wallet_address", args.wallet_address),
        )
        .first();

      if (!allowlist) {
        throw new Error("Wallet address not found in allowlist");
      }
      await ctx.db.insert("leaderboard", {
        wallet_address: args.wallet_address,
        banana_count: args.banana_count,
        discord_user_id: allowlist.discord_user_id,
        discord_user_name: allowlist.discord_user_name,
      });
    }
  },
});
