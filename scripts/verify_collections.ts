import { bananaFarmClient, bananaFarmViewClient } from "../src/services/movement-client";
import { getSigner } from "./aptos-helper";

const moveDir = "move/";
const aptosYml = moveDir + ".aptos/config.yaml";

async function main() {
  const admin = getSigner(aptosYml);

  console.log("Getting verified collections...");
  const collections = await bananaFarmViewClient.get_verified_collections({
    functionArguments: [],
    typeArguments: [],
  });
  console.log(collections);

  console.log("Verifying collections...");

  const collectionsToVerify = [
    {
      name: "Movement Commemorative NFT",
      address: "0xf2fd6807b62db99d202abd3151d754179627c51914d1b46297779e4ddfd1a437" as `0x${string}`,
    },
  ];

  for (const collection of collectionsToVerify) {
    await bananaFarmClient.entry.add_verified_collection({
      account: admin,
      functionArguments: [collection.address],
      typeArguments: [],
    });
  }
}

main().catch((e) => console.error(e));
