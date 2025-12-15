import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { discordNftAllowlistHandler } from "./discordAllowlist";

const http = httpRouter();

// Discord NFT Allowlist endpoint
http.route({
  path: "/discord-nft-allowlist",
  method: "POST",
  handler: discordNftAllowlistHandler,
});

http.route({
  pathPrefix: "/nft/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    // Extract slug and nft_number from path: /nft/{slug}/{nft_number}
    const pathParts = url.pathname.replace("/nft/", "").split("/");
    const slug = pathParts[0];
    const nftNumber = parseInt(pathParts[1], 10);

    if (!slug || isNaN(nftNumber)) {
      return new Response("Invalid path. Expected /nft/{slug}/{nft_number}", {
        status: 400,
      });
    }

    const nft = await ctx.runQuery(api.nfts.getNftBySlugAndNumber, {
      slug,
      nft_number: nftNumber,
    });

    if (!nft) {
      return new Response("Not found", { status: 404 });
    }

    const imageUrl = `https://farm.gorilla-moverz.xyz/nfts/${slug}/images/${nft.image.replace(".png", ".webp")}`;

    // Return NFT metadata as JSON
    return new Response(
      JSON.stringify({
        name: `${nft.collectionName} | #${nft.nft_number}`,
        description: `${nft.collectionName} | #${nft.nft_number}`,
        image: imageUrl,
        attributes: [],
        external_url: "https://farm.gorilla-moverz.xyz",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }),
});

http.route({
  pathPrefix: "/nft/",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

export default http;
