import { Network } from "@aptos-labs/ts-sdk";

export const SUPRA_API_URL = import.meta.env?.VITE_SUPRA_API_URL;
export const SURPA_ANON_KEY = import.meta.env?.VITE_SUPRA_ANON_KEY;
export const MODULE_ADDRESS = "8256914013a64dc4e17a4113095ad8e6971f79ffcd78a442f4fd2005394dd52a";
export const FULL_NODE = "https://mainnet.movementnetwork.xyz/v1";
export const FARM_COLLECTION_ID = "0x50af18d1e4dfbc0a5be5d213f5b1ad88509d7ecab479305c2a7d232080db891e";
export const NETWORK = Network.CUSTOM;
export const NETWORK_NAME = "mainnet";
export const BANANA_CONTRACT_ADDRESS = "0xf291cc3cddf441b40bc78260ee3d031b3de6dd9d0ec1ac67712035d3144d3ca3";
export const EXCLUDE_LEADERBOARD = [
  "0x" + MODULE_ADDRESS,
  "0xf61ecd11706e1d124aacd8638971af00b55aa303bcf8b54054c0c3fc31071a3f",
];
export const SUPPORTED_WALLETS = ["Nightly", "Razor Wallet" /*, "Leap Wallet"*/];
