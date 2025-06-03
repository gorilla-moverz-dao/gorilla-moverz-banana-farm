import { useMemo } from "react";
import { useFarmOwnedNFTs } from "./useFarmOwnedNFTs";

export function useOwnedPartnerNFTs(collectionId: `0x${string}`) {
  const { data: ownedNFTs } = useFarmOwnedNFTs();

  const { ownedPartnerNFTs, ownedPartnerNFTIds } = useMemo(() => {
    if (!ownedNFTs) {
      return { ownedPartnerNFTs: [], ownedPartnerNFTIds: [] };
    }

    const ownedPartnerNFTs = ownedNFTs
      ?.filter((nft) => nft.current_token_data?.collection_id !== collectionId)
      .reduce((acc: typeof ownedNFTs, nft) => {
        const collectionId = nft.current_token_data?.collection_id;
        if (
          collectionId &&
          !acc.some((existingNft) => existingNft.current_token_data?.collection_id === collectionId)
        ) {
          acc.push(nft);
        }
        return acc;
      }, []);

    const ownedPartnerNFTIds =
      ownedPartnerNFTs?.map((nft) => nft.current_token_data?.token_data_id as `0x${string}`) || [];

    return { ownedPartnerNFTs, ownedPartnerNFTIds };
  }, [ownedNFTs, collectionId]);

  return {
    ownedPartnerNFTs,
    ownedPartnerNFTIds,
  };
}
