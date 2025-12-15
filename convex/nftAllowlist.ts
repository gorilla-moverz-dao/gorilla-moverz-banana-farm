import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { DISCORD_API_BASE_URL } from "./discordUtils";
import { aptos, getSigner, getAccountAddress } from "./aptos";

// Action to add address to blockchain allowlist
export const addAllowlistAddress = internalAction({
  args: {
    address: v.string(),
    collectionId: v.string(),
  },
  handler: async (_ctx, args) => {
    const signer = getSigner();
    const accountAddress = getAccountAddress();

    // Build and submit transaction
    const transaction = await aptos.transaction.build.simple({
      sender: signer.accountAddress,
      data: {
        function: `${accountAddress}::launchpad::add_allowlist_addresses`,
        functionArguments: [[args.address], args.collectionId],
      },
    });

    const res = await aptos.signAndSubmitTransaction({
      signer,
      transaction,
    });

    console.log("Transaction submitted:", res.hash);

    const transactionResult = await aptos.waitForTransaction({
      transactionHash: res.hash,
    });

    return transactionResult;
  },
});

// Internal action to process allowlist request (scheduled from discordAllowlist)
export const processAllowlistRequest = internalAction({
  args: {
    address: v.string(),
    collectionId: v.string(),
    discordUserId: v.string(),
    discordUserName: v.string(),
    guildId: v.string(),
    applicationId: v.string(),
    interactionToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Call blockchain to add address to allowlist
    let transactionSuccess = false;
    try {
      const transactionResult = await ctx.runAction(internal.nftAllowlist.addAllowlistAddress, {
        address: args.address,
        collectionId: args.collectionId,
      });
      transactionSuccess = transactionResult.success;
    } catch (err) {
      console.error("Blockchain transaction failed:", err);
      transactionSuccess = false;
    }

    let content = "";
    if (transactionSuccess) {
      // Insert player record into database
      await ctx.runMutation(internal.nftAllowlist.insertPlayer, {
        discordUserId: args.discordUserId,
        discordUserName: args.discordUserName,
        walletAddress: args.address,
        guildId: args.guildId,
      });

      content = "Added to allowlist";
    } else {
      content = "Failed";
    }

    // Send follow-up message to Discord
    const followUpResponse = await fetch(
      `${DISCORD_API_BASE_URL}/webhooks/${args.applicationId}/${args.interactionToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          flags: 64,
        }),
      },
    );

    if (!followUpResponse.ok) {
      console.error("Failed to send follow-up message:", await followUpResponse.text());
    }
  },
});

// Internal mutation to insert a player record
export const insertPlayer = internalMutation({
  args: {
    discordUserId: v.string(),
    discordUserName: v.string(),
    walletAddress: v.string(),
    guildId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("players", {
      discord_user_id: args.discordUserId,
      discord_user_name: args.discordUserName,
      wallet_address: args.walletAddress,
      guild_id: args.guildId,
      deleted: false,
    });
  },
});
