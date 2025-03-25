import {
  aptosClient,
  bananaFarmABI,
  bananaFarmClient,
  launchpadABI,
  launchpadClient,
} from "../services/movement-client";
import { AptosApiType, InputGenerateTransactionPayloadData, UserTransactionResponse } from "@aptos-labs/ts-sdk";
import { useWallet } from "@razorlabs/razorkit";
import { createEntryPayload } from "@thalalabs/surf";
import { request } from "graphql-request";

const useMovement = () => {
  const { account, signAndSubmitTransaction } = useWallet();

  const signAndAwaitTransaction = async (data: InputGenerateTransactionPayloadData) => {
    const response = await signAndSubmitTransaction({ payload: data });
    if (response.status === "Approved") {
      const transaction = await aptosClient.waitForTransaction({ transactionHash: response.args.hash });
      return transaction as UserTransactionResponse;
    } else {
      console.log("Transaction rejected: ", response);
      throw new Error("Transaction rejected: " + response.status);
    }
  };

  const getAccountCoinsData = async () => {
    if (!account?.address) return [];

    const tokens = await aptosClient.getAccountCoinsData({
      accountAddress: account.address,
    });
    return tokens;
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    address: account ? (account.address.toString() as `0x${string}`) : undefined,
    signAndAwaitTransaction,
    getAccountCoinsData,
    createEntryPayload,
    bananaFarmClient,
    bananaFarmABI,
    launchpadClient,
    launchpadABI,
    aptosClient,
    graphqlRequest: request,
    indexerUrl: aptosClient.config.getRequestUrl(AptosApiType.INDEXER),
    truncateAddress,
  };
};

export default useMovement;
