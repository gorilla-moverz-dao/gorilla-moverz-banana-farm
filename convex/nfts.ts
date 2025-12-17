import { v } from "convex/values";
import { query } from "./_generated/server";

export const getNftBySlugAndNumber = query({
  args: {
    slug: v.string(),
    nft_number: v.number(),
  },
  handler: async (ctx, args) => {
    // Find collection by slug
    const collection = await ctx.db
      .query("collections")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!collection) {
      return null;
    }

    // Find NFT by collection_id and nft_number
    const nft = await ctx.db
      .query("nfts")
      .withIndex("by_slug_and_number", (q) => q.eq("slug", args.slug).eq("nft_number", args.nft_number))
      .first();

    if (!nft) {
      return null;
    }

    return {
      nft_number: nft.nft_number,
      image: nft.image,
      collectionName: collection.name,
    };
  },
});
