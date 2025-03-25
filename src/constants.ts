import { Network } from "@aptos-labs/ts-sdk";

export const SUPRA_API_URL = import.meta.env?.VITE_SUPRA_API_URL;
export const SURPA_ANON_KEY = import.meta.env?.VITE_SUPRA_ANON_KEY;
export const MODULE_ADDRESS = "ef88d140bd12edaa47736bb34f7af91c7a6cbb0f5853a0c334e04e451f416522";
export const FULL_NODE = "https://testnet.bardock.movementnetwork.xyz/v1";
export const FARM_COLLECTION_ID = "0x50af18d1e4dfbc0a5be5d213f5b1ad88509d7ecab479305c2a7d232080db891e";
export const NETWORK = Network.CUSTOM;
export const NETWORK_NAME = "bardock+testnet";
export const BANANA_CONTRACT_ADDRESS = "0xf291cc3cddf441b40bc78260ee3d031b3de6dd9d0ec1ac67712035d3144d3ca3";
export const EXCLUDE_LEADERBOARD = [
  "0x" + MODULE_ADDRESS,
  "0xf61ecd11706e1d124aacd8638971af00b55aa303bcf8b54054c0c3fc31071a3f",
];
export const SUPPORTED_WALLETS = ["Nightly", "Razor Wallet" /*, "Leap Wallet"*/];
