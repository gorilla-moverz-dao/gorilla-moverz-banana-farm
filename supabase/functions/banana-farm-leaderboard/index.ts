import { aptos } from "../_shared/aptos-client.ts";
import { supabaseClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/webserver-functions.ts";
import { json, serve } from "https://deno.land/x/sift@0.6.0/mod.ts";

serve({
  "/banana-farm-leaderboard": leaderboard,
});

export const MODULE_ADDRESS = "8008ff07bcb3f2c8848ffd7db1688b7ca08ecc90d63bac7ae76799704b2fc212";
export const BANANA_CONTRACT_ADDRESS = "0x2a3efbfa6b761ef468c41f0a0ff2e2c4dd200ab06b6eaa9e5711f1c71bb35138";
export const EXCLUDE_LEADERBOARD = [
  "0x" + MODULE_ADDRESS,
  "0x97e0e2b6f91f82741adfae7ed370a5dd5533fbbb4cfd67383f1df1a8db2d3a42",
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
