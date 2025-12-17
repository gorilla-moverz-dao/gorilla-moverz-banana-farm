import { UserTransactionResponse } from "@aptos-labs/ts-sdk";
import useMovement from "./useMovement";
import { useTransaction } from "./useTransaction";

const useBananaFarm = () => {
  const { address, bananaFarmViewClient, bananaFarmClient } = useMovement();
  const { executeTransaction } = useTransaction();

  const farm = async (nft: `0x${string}`, partnerNfts: `0x${string}`[]) => {
    if (!bananaFarmClient) {
      throw new Error("Banana farm client not found");
    }
    const response = await executeTransaction(
      bananaFarmClient.farm({
        arguments: [nft, partnerNfts],
        type_arguments: [],
      }),
    );

    const amount =
      (response.result as UserTransactionResponse).events?.find((i) => i.type === "0x1::fungible_asset::Deposit")?.data
        .amount / Math.pow(10, 9);

    return amount;
  };

  const getTreasuryTimeout = async () => {
    const [response] = await bananaFarmViewClient.get_treasury_timeout({
      typeArguments: [],
      functionArguments: [],
    });
    return parseInt(response);
  };

  const getCollectionAddress = async () => {
    const [response] = await bananaFarmViewClient.collection_address({
      typeArguments: [],
      functionArguments: [],
    });

    return response;
  };

  const getLastFarmed = async () => {
    const [response] = await bananaFarmViewClient.last_farmed({
      typeArguments: [],
      functionArguments: [address!],
    });
    return response;
  };

  return {
    address,
    farm,
    getTreasuryTimeout,
    getCollectionAddress,
    getLastFarmed,
  };
};

export default useBananaFarm;
