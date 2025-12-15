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
  }).index("by_slug", ["slug"]),
  players: defineTable({
    discord_user_id: v.string(),
    discord_user_name: v.string(),
    wallet_address: v.string(),
    guild_id: v.string(),
    deleted: v.boolean(),
  }),
  nfts: defineTable({
    collection_id: v.id("collections"),
    nft_number: v.number(),
    image: v.string(),
  }).index("by_collection_and_number", ["collection_id", "nft_number"]),
  leaderboard: defineTable({
    discord_user_id: v.string(),
    discord_user_name: v.string(),
    wallet_address: v.string(),
    banana_count: v.number(),
  }).index("by_banana_count", { fields: ["banana_count"] }),
});
