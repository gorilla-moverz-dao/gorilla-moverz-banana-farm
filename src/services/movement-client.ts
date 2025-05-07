import { createSurfClient } from "@thalalabs/surf";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { NETWORK, FULL_NODE, FULL_NODE_READ_ONLY, INDEXER_URL } from "../constants";
import { ABI as bananaFarmABI } from "./banana_farm.ts";
import { ABI as launchpadABI } from "./launchpad.ts";
import { ABI as bananaABI } from "./banana.ts";

const aptosConfig = new AptosConfig({
  network: NETWORK,
  fullnode: FULL_NODE,
  indexer: INDEXER_URL,
});
const aptosClient = new Aptos(aptosConfig);

const aptosReadOnlyClient = new Aptos(
  new AptosConfig({
    network: NETWORK,
    fullnode: FULL_NODE_READ_ONLY,
    indexer: INDEXER_URL,
  }),
);

const bananaFarmClient = createSurfClient(aptosClient).useABI(bananaFarmABI);
const bananaFarmViewClient = createSurfClient(aptosReadOnlyClient).useABI(bananaFarmABI).view;
const launchpadClient = createSurfClient(aptosClient).useABI(launchpadABI);
const launchpadViewClient = createSurfClient(aptosReadOnlyClient).useABI(launchpadABI).view;
const bananaClient = createSurfClient(aptosClient).useABI(bananaABI);

export {
  aptosClient,
  aptosReadOnlyClient,
  bananaFarmClient,
  bananaFarmViewClient,
  launchpadClient,
  launchpadViewClient,
  launchpadABI,
  bananaFarmABI,
  bananaClient,
};
