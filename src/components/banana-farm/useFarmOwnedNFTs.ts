import { useQuery } from "@tanstack/react-query";
import useMovement from "../../hooks/useMovement";
import useFarmCollections from "./useFarmCollections";
import { graphql } from "../../gql";
import useFarmVerifiedCollections from "./useFarmVerifiedCollections";

const query = graphql(`
  query GetAccountNfts($address: String, $collectionIds: [String!]) {
    current_token_ownerships_v2(
      where: {
        owner_address: { _eq: $address }
        amount: { _gt: "0" }
        current_token_data: { current_collection: { collection_id: { _in: $collectionIds } } }
      }
    ) {
      current_token_data {
        collection_id
        largest_property_version_v1
        current_collection {
          collection_id
          collection_name
          description
          creator_address
          uri
          __typename
        }
        description
        token_name
        token_data_id
        token_standard
        token_uri
        __typename
      }
      owner_address
      amount
      __typename
    }
  }
`);

export function useFarmOwnedNFTs() {
  const { address, graphqlRequest, indexerUrl } = useMovement();
  const { data: collections, isLoading: isCollectionsLoading } = useFarmCollections();
  const { data: verifiedCollections, isLoading: isVerifiedCollectionsLoading } = useFarmVerifiedCollections();

  return useQuery({
    queryKey: ["owned_nfts", address],
    refetchInterval: 1000 * 60,
    queryFn: async () => {
      try {
        if (!address) return null;

        let collectionIds = collections?.map((collection) => collection.collection_address) ?? [];
        const verifiedCollectionIds = verifiedCollections?.map((collection) => collection[0]) ?? [];

        if (verifiedCollectionIds.length > 0) {
          collectionIds = [...collectionIds, ...verifiedCollectionIds];
        }

        const res = await graphqlRequest(indexerUrl, query, {
          address,
          collectionIds,
        });

        return res.current_token_ownerships_v2;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    // Only run this query when all dependencies are available
    enabled:
      !!address && !isCollectionsLoading && !isVerifiedCollectionsLoading && !!collections && !!verifiedCollections,
  });
}
