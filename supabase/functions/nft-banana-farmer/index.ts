import { supabaseClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/webserver-functions.ts";
import { ConnInfo, PathParams, json, serve } from "https://deno.land/x/sift@0.6.0/mod.ts";

interface BananaFarmerNFTMetadata {
  image: string;
  name: string;
  description: string;
  external_url: string;
  attributes: unknown[];
}

serve({
  "/nft-banana-farmer/:slug/:nft_number": nft,
});

async function nft(req: Request, _connInfo: ConnInfo, params: PathParams) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const nft_number = params?.nft_number ?? "";
  const slug = params?.slug ?? "";

  const { data, error } = await supabaseClient
    .from("banana_farm_nfts")
    .select("*, banana_farm_collections!inner(id, slug, name)")
    .eq("nft_number", nft_number)
    .eq("banana_farm_collections.slug", slug)
    .maybeSingle();

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

  const imageUrl = `https://farm.gorilla-moverz.xyz/nfts/${slug}/images/${data.image}`;

  // Redirect to the image URL
  return Response.redirect(imageUrl, 302);

  const nft: BananaFarmerNFTMetadata = {
    name: `${data.banana_farm_collections.name} | #${data.nft_number}`,
    description: `${data.banana_farm_collections.name} | #${data.nft_number}`,
    image: imageUrl,
    attributes: [],
    external_url: `https://farm.gorilla-moverz.xyz`,
  };

  return json(nft, {
    headers: corsHeaders,
  });
}
