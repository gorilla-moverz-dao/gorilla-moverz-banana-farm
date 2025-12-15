import { v } from "convex/values";
import { query } from "./_generated/server";

export const queryCollections = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("collections").collect();
  },
});

export const queryCollection = query({
  args: {
    collectionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("collections")
      .filter((q) => q.eq(q.field("collection_address"), args.collectionId))
      .first();
  },
});
