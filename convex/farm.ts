"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { BANANA_CONTRACT_ADDRESS } from "../src/constants";
import { executeGraphQL } from "../src/services/executeGraphQL";
import { graphql } from "../src/gql";

const GET_LEADERBOARD_QUERY = graphql(`
  query GetLeaderboard($asset_type: String, $wallet_address: String!) {
    current_fungible_asset_balances(
      where: { asset_type: { _eq: $asset_type }, _and: { owner_address: { _eq: $wallet_address } } }
      order_by: { amount: desc }
    ) {
      asset_type
      owner_address
      amount
    }
  }
`);

export const updateLeaderboard = action({
  args: {
    wallet_address: v.string(),
  },
  handler: async (ctx, args) => {
    const data = await executeGraphQL(GET_LEADERBOARD_QUERY, {
      asset_type: BANANA_CONTRACT_ADDRESS,
      wallet_address: args.wallet_address,
    });

    const balances = data.current_fungible_asset_balances;

    for (const entry of balances) {
      await ctx.runMutation(internal.leaderboard.upsertLeaderboardEntry, {
        wallet_address: entry.owner_address,
        banana_count: Number(entry.amount) / 1e9,
      });
    }

    return { updated: balances.length };
  },
});
