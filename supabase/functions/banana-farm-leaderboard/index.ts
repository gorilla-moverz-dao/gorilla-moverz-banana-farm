import { aptos } from "../_shared/aptos-client.ts";
import { supabaseClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/webserver-functions.ts";
import { json, serve } from "https://deno.land/x/sift@0.6.0/mod.ts";

serve({
  "/banana-farm-leaderboard": leaderboard,
});

export const MODULE_ADDRESS = "8256914013a64dc4e17a4113095ad8e6971f79ffcd78a442f4fd2005394dd52a";
export const BANANA_CONTRACT_ADDRESS = "0xf291cc3cddf441b40bc78260ee3d031b3de6dd9d0ec1ac67712035d3144d3ca3";
export const EXCLUDE_LEADERBOARD = [
  "0x" + MODULE_ADDRESS,
  "0xf61ecd11706e1d124aacd8638971af00b55aa303bcf8b54054c0c3fc31071a3f",
];

interface LeaderboardEntry {
  asset_type: string;
  owner_address: string;
  amount: string;
  discord_user_name?: string;
}

async function leaderboard(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const response = (
    await aptos.queryIndexer<{ current_fungible_asset_balances: LeaderboardEntry[] }>({
      query: {
        query: `
query GetLeaderboard($asset_type: String, $exclude: [String!]) {
  current_fungible_asset_balances(
    where: { asset_type: { _eq: $asset_type }, _and: { owner_address: { _nin: $exclude } } }
    order_by: { amount: desc }
    limit: 100
    ) {
      asset_type
      owner_address
      amount
        }
      }`,
        variables: {
          asset_type: BANANA_CONTRACT_ADDRESS,
          exclude: EXCLUDE_LEADERBOARD,
        },
      },
    })
  ).current_fungible_asset_balances;

  const addresses = response.map((item) => item.owner_address);

  const { data, error } = await supabaseClient
    .from("banana_farm_allowlist")
    .select("*")
    .in("wallet_address", addresses);

  if (error) {
    return json(
      { error: error.message },
      {
        headers: corsHeaders,
        status: 500,
      },
    );
  }

  if (data === null) {
    return new Response("Not found", { status: 404 });
  }

  response.forEach((item) => {
    const user = data.find((user) => user.wallet_address === item.owner_address);
    item.discord_user_name = user?.discord_user_name;
  });

  return json(response, {
    headers: corsHeaders,
  });
}
