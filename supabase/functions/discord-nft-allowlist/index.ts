import { json, serve, validateRequest } from "https://deno.land/x/sift@0.6.0/mod.ts";
import {
  DiscordCommandType,
  DiscordPostData,
  verifySignature,
  createDiscordResponse,
} from "../_shared/discord-functions.ts";
import { supabaseClient } from "../_shared/supabase-client.ts";
import { aptos } from "../_shared/aptos-client.ts";

serve({
  "/discord-nft-allowlist": home,
});

async function home(request: Request) {
  // validateRequest() ensures that a request is of POST method and
  // has the following headers.
  const { error } = await validateRequest(request, {
    POST: {
      headers: ["X-Signature-Ed25519", "X-Signature-Timestamp"],
    },
  });
  if (error) {
    return json({ error: error.message }, { status: error.status });
  }

  // verifySignature() verifies if the request is coming from Discord.
  // When the request's signature is not valid, we return a 401 and this is
  // important as Discord sends invalid requests to test our verification.
  const { valid, body } = await verifySignature(request);
  if (!valid) {
    return json(
      { error: "Invalid request" },
      {
        status: 401,
      },
    );
  }

  const post: DiscordPostData = JSON.parse(body);
  const { type = 0, data = { options: [] } } = post;
  if (type === DiscordCommandType.Ping) {
    return json({
      type: 1, // Type 1 in a response is a Pong interaction response type.
    });
  }

  // Type 2 in a request is an ApplicationCommand interaction.
  // It implies that a user has issued a command.
  if (type === DiscordCommandType.ApplicationCommand) {
    const { data: collection } = await supabaseClient
      .from("banana_farm_collections")
      .select("*")
      .eq("discord_guild_id", post.guild_id)
      .maybeSingle();

    if (!collection) {
      return createDiscordResponse("This server is not allowed to interact with this bot.", true);
    }

    const address = data.options.find((option) => option.name === "address")?.value as string;

    // Validate the address
    try {
      const accountInfo = await aptos.account.getAccountInfo({ accountAddress: address });
      if (!accountInfo) {
        return createDiscordResponse("Address not found", true);
      }
    } catch (ex) {
      console.error(ex);
      return createDiscordResponse(ex.message, true);
    }

    try {
      if (!address) throw new Error("Address not provided");

      await blockMultipleEntries(post.guild_id, "discord_user_id", post.member.user.id);
      await blockMultipleEntries(post.guild_id, "wallet_address", address);

      // Forward request for delayed update of message because response needs to be sent within 3 secs
      const url =
        Deno.env.get("SUPABASE_URL") +
        `/functions/v1/nft-allowlist?collectionId=${collection.collection_address}&address=${address}`;
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Signature-Ed25519": request.headers.get("X-Signature-Ed25519") ?? "",
          "X-Signature-Timestamp": request.headers.get("X-Signature-Timestamp") ?? "",
        },
        body: body,
      });

      // Respond to the initial interaction
      const initialResponse = json({
        type: 5, // Type 5 is a deferred response
        flags: 64,
      });

      return initialResponse;
    } catch (ex) {
      console.log(ex);
      return createDiscordResponse(ex.message, true);
    }
  }

  // We will return a bad request error as a valid Discord request
  // shouldn't reach here.
  return json({ error: "bad request" }, { status: 400 });
}

async function blockMultipleEntries(guild_id: string, column: "discord_user_id" | "wallet_address", value: string) {
  const { data, error } = await supabaseClient
    .from("banana_farm_allowlist")
    .select("*")
    .eq("guild_id", guild_id)
    .eq(column, value)
    .eq("deleted", false)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (data) {
    throw new Error(
      column === "discord_user_id"
        ? "User already submitted a wallet address: " + data.wallet_address
        : "Wallet address already submitted: " + data.wallet_address,
    );
  }
}
