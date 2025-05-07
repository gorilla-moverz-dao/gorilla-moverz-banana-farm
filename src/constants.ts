import { Network } from "@aptos-labs/ts-sdk";

export const SUPRA_API_URL = import.meta.env?.VITE_SUPRA_API_URL;
export const SURPA_ANON_KEY = import.meta.env?.VITE_SUPRA_ANON_KEY;
export const MODULE_ADDRESS = "8008ff07bcb3f2c8848ffd7db1688b7ca08ecc90d63bac7ae76799704b2fc212";
export const FULL_NODE = "https://mainnet.movementnetwork.xyz/v1";
export const FARM_COLLECTION_ID = "0x2fa0ab1ee4f96f9d5762eede2b0321f0fd2a87fabaa408e087186cabb3fa36aa";
export const NETWORK = Network.CUSTOM;
export const NETWORK_NAME = "mainnet";
export const BANANA_CONTRACT_ADDRESS = "0x2a3efbfa6b761ef468c41f0a0ff2e2c4dd200ab06b6eaa9e5711f1c71bb35138";
export const EXCLUDE_LEADERBOARD = [
  "0x" + MODULE_ADDRESS,
  "0x97e0e2b6f91f82741adfae7ed370a5dd5533fbbb4cfd67383f1df1a8db2d3a42",
];
export const SUPPORTED_WALLETS = ["Nightly", "Razor Wallet" /*, "Leap Wallet"*/];
