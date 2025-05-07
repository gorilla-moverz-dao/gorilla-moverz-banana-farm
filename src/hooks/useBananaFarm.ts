import useMovement from "./useMovement";

const useBananaFarm = () => {
  const { address, signAndAwaitTransaction, createEntryPayload, bananaFarmABI, bananaFarmViewClient } = useMovement();

  const farm = async (nft: `0x${string}`, partnerNfts: `0x${string}`[]) => {
    const response = await signAndAwaitTransaction(
      createEntryPayload(bananaFarmABI, {
        function: "farm",
        functionArguments: [nft, partnerNfts],
        typeArguments: [],
      }),
    );

    const amount =
      response.events?.find((i) => i.type === "0x1::fungible_asset::Deposit")?.data.amount / Math.pow(10, 9);

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
