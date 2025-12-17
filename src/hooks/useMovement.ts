import {
  aptosReadOnlyClient,
  bananaFarmABI,
  bananaFarmViewClient,
  launchpadABI,
  launchpadViewClient,
} from "../services/movement-client";
import { AptosApiType } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { request } from "graphql-request";
import { useWalletClient } from "@thalalabs/surf/hooks";
import { MODULE_ADDRESS } from "../constants";

const useMovement = () => {
  const { account } = useWallet();
  const { client: walletClient } = useWalletClient();

  const launchpadClient = walletClient?.useABI({ ...launchpadABI, address: MODULE_ADDRESS });
  const bananaFarmClient = walletClient?.useABI({ ...bananaFarmABI, address: MODULE_ADDRESS });

  const getAccountCoinsData = async () => {
    if (!account?.address) return [];

    const tokens = await aptosReadOnlyClient.getAccountCoinsData({
      accountAddress: account.address,
    });
    return tokens;
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    address: account ? (account.address.toString() as `0x${string}`) : undefined,
    getAccountCoinsData,
    bananaFarmViewClient,
    bananaFarmClient,
    bananaFarmABI,
    launchpadClient,
    launchpadViewClient,
    launchpadABI,
    aptosReadOnlyClient,
    graphqlRequest: request,
    indexerUrl: aptosReadOnlyClient.config.getRequestUrl(AptosApiType.INDEXER),
    truncateAddress,
  };
};

export default useMovement;
