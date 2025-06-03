import { useQuery } from "@tanstack/react-query";
import useMovement from "../../hooks/useMovement";
import { graphql } from "../../gql";
import useFarmVerifiedCollections from "./useFarmVerifiedCollections";

const query = graphql(`
  query GetCollectionDetails($collectionIds: [String!]) {
    current_collections_v2(where: { collection_id: { _in: $collectionIds } }) {
      collection_id
      collection_name
      description
      creator_address
      uri
      max_supply
      current_supply
      __typename
    }
  }
`);

export function useVerifiedCollectionsDetails() {
  const { graphqlRequest, indexerUrl } = useMovement();
  const { data: verifiedCollections, isLoading: isVerifiedCollectionsLoading } = useFarmVerifiedCollections();

  return useQuery({
    queryKey: ["verified_collections_details", verifiedCollections],
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      try {
        if (!verifiedCollections || verifiedCollections.length === 0) return [];

        const res = await graphqlRequest(indexerUrl, query, {
          collectionIds: verifiedCollections,
        });

        return res.current_collections_v2;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    enabled: !isVerifiedCollectionsLoading && !!verifiedCollections && verifiedCollections.length > 0,
  });
}
