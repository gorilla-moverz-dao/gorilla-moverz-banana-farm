import { Aptos, AptosConfig, Account, Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";
import { MOVEMENT_FULLNODE_URL, MOVEMENT_INDEXER_URL } from "./config";

// Initialize Aptos client for Movement network
const aptosConfig = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: MOVEMENT_FULLNODE_URL,
  indexer: MOVEMENT_INDEXER_URL,
});

export const aptos = new Aptos(aptosConfig);

// Create signer from private key environment variable
export function getSigner() {
  const privateKeyHex = process.env.APTOS_PK;
  if (!privateKeyHex) {
    throw new Error("Missing APTOS_PK environment variable");
  }
  const privateKey = new Ed25519PrivateKey(privateKeyHex);
  return Account.fromPrivateKey({ privateKey });
}

export function getAccountAddress() {
  const accountAddress = process.env.ACCOUNT_ADDRESS;
  if (!accountAddress) {
    throw new Error("Missing ACCOUNT_ADDRESS environment variable");
  }
  return accountAddress;
}
