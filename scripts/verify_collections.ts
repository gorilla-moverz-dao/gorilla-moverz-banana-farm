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
      name: "Gorilla Moverz Community Collection",
      address: "0x625f987cf0e5529997f1602b53ef8ad99dd8ec3b5f8dfffa31ccf4848bfe119b" as `0x${string}`,
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
