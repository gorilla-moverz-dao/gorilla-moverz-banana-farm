import { Link, useSearchParams } from "react-router-dom";
import useFarmCollections from "./useFarmCollections";
import FarmerOverview from "./FarmOverview";
import { Card, CardBody, Heading, SimpleGrid, Stack, Image, Box, Spinner, Center } from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { useFarmOwnedNFTs } from "./useFarmOwnedNFTs";
import { useVerifiedCollectionsDetails } from "./useVerifiedCollectionsDetails";
import useFarmVerifiedCollections from "./useFarmVerifiedCollections";

function FarmPartners() {
  const { data, error, isLoading: isCollectionsLoading } = useFarmCollections();
  const collections = data?.filter((collection) => collection.slug !== "farmer");
  const [searchParams] = useSearchParams();
  const collectionId = searchParams.get("collectionId");

  const { data: ownedNFTs } = useFarmOwnedNFTs();
  const { isLoading: isVerifiedCollectionsLoading } = useFarmVerifiedCollections();
  const { data: verifiedCollections, isLoading: isVerifiedDetailsLoading } = useVerifiedCollectionsDetails();

  // Wait for all data sources to be ready
  const isLoading = isCollectionsLoading || isVerifiedCollectionsLoading || isVerifiedDetailsLoading;

  if (error) return null;

  if (collectionId) {
    return (
      <div>
        <FarmerOverview collectionId={collectionId as `0x${string}`} enableFarming={false} />
      </div>
    );
  }

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <Center height="200px">
        <Spinner size="xl" />
      </Center>
    );
  }

  const isCollectionOwned = (collectionAddress: string) => {
    return ownedNFTs?.some((nft) => nft.current_token_data?.collection_id === collectionAddress) ?? false;
  };

  // Combine regular collections and verified collections
  const allCollections = [
    ...(collections || []).map((collection) => ({
      id: collection.id,
      name: collection.name,
      collection_address: collection.collection_address,
      slug: collection.slug,
      isVerified: false,
      uri: undefined as string | undefined,
      description: undefined as string | undefined,
    })),
    ...(verifiedCollections || []).map((collection) => ({
      id: collection.collection_id,
      name: collection.collection_name,
      collection_address: collection.collection_id,
      slug: `verified-${collection.collection_id}`,
      isVerified: true,
      description: collection.description,
      uri: collection.uri,
    })),
  ];

  return (
    <div>
      <SimpleGrid spacing={4} columns={{ base: 1, sm: 2, md: 4, lg: 4 }}>
        {allCollections?.map((collection) => {
          const cardContent = (
            <Card key={collection.id} className="gorillaz-card" height="100%">
              <CardBody>
                <Box position="relative">
                  <Image
                    src={
                      collection.isVerified
                        ? collection.uri || "/placeholder-collection.png"
                        : `/nfts/${collection.slug}/collection.png`
                    }
                    fallbackSrc="/placeholder-collection.png"
                  />
                </Box>
                <Stack mt="6" spacing="3">
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                    <Heading size="md" color="green.300" noOfLines={1} flex="1" mr={2}>
                      {collection.name}
                    </Heading>
                    {isCollectionOwned(collection.collection_address) && (
                      <Box flexShrink={0}>
                        <FaCheckCircle
                          color="green"
                          size={24}
                          style={{
                            backgroundColor: "white",
                            borderRadius: "50%",
                            padding: "2px",
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          );

          if (collection.isVerified) {
            return (
              <a
                key={collection.id}
                href={`https://www.tradeport.xyz/movement/collection/${collection.collection_address}?bottomTab=trades&tab=items`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {cardContent}
              </a>
            );
          } else {
            return (
              <Link key={collection.id} to={`./?collectionId=${collection.collection_address}`}>
                {cardContent}
              </Link>
            );
          }
        })}
      </SimpleGrid>
    </div>
  );
}

export default FarmPartners;
