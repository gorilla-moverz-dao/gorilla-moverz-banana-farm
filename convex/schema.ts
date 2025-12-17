import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  collections: defineTable({
    name: v.string(),
    slug: v.string(),
    collection_address: v.string(),
    discord_link: v.string(),
    discord_guild_id: v.string(),
    help_text: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_discord_guild_id", ["discord_guild_id"]),
  allowlist: defineTable({
    discord_user_id: v.string(),
    discord_user_name: v.string(),
    wallet_address: v.string(),
    guild_id: v.string(),
    deleted: v.boolean(),
  })
    .index("by_guild_and_user", ["guild_id", "discord_user_id", "deleted"])
    .index("by_guild_and_wallet", ["guild_id", "wallet_address", "deleted"]),
  nfts: defineTable({
    slug: v.string(),
    nft_number: v.number(),
    image: v.string(),
  }).index("by_slug_and_number", { fields: ["slug", "nft_number"] }),
  leaderboard: defineTable({
    discord_user_id: v.string(),
    discord_user_name: v.string(),
    wallet_address: v.string(),
    banana_count: v.number(),
  }).index("by_banana_count", { fields: ["banana_count"] }),
});
