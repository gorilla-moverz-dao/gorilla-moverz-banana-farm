import { useFarmOwnedNFTs } from "./useFarmOwnedNFTs";
import { Box, Flex, Image, Link, Spinner, Text, useToast, IconButton } from "@chakra-ui/react";
import PageTitle from "../PageTitle";
import FarmCollectionMint from "./FarmCollectionMint";
import { useState } from "react";
import Assets from "../Assets";
import useAssets from "../../hooks/useAssets";
import useFarmData from "./useFarmData";
import FarmCountdown from "./FarmCountdown";
import useFarmCollection from "./useFarmCollection";
import BoxBlurred from "../BoxBlurred";
import useBananaFarm from "../../hooks/useBananaFarm";
import { NETWORK_NAME } from "../../constants";
import { FaLink } from "react-icons/fa6";
import useMovement from "../../hooks/useMovement";

interface Props {
  collectionId: `0x${string}`;
  enableFarming: boolean;
}

function FarmerOverview({ collectionId, enableFarming }: Props) {
  const { data: ownedNFTs, isLoading } = useFarmOwnedNFTs();
  const farmerNFT = ownedNFTs?.find((nft) => nft.current_token_data?.collection_id === collectionId);
  const { truncateAddress } = useMovement();

  const { address, farm } = useBananaFarm();
  const { refetch: refetchAssets } = useAssets();
  const toast = useToast();
  const [farming, setFarming] = useState(false);

  const { data: farmed_data, refetch: refetchFarmed } = useFarmData();

  const collection = useFarmCollection(collectionId);

  const farmNFT = async (farmerNFT: `0x${string}`, partnerNFTs: `0x${string}`[]) => {
    try {
      setFarming(true);
      const amount = await farm(farmerNFT, partnerNFTs);
      refetchFarmed();

      toast({
        title: "Success",
        description: "Farmed " + amount + " Banana(s)",
        colorScheme: "green",
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: "Error",
        description: (e as Error).message,
        colorScheme: "red",
        isClosable: true,
      });
    } finally {
      setFarming(false);
    }
    refetchAssets();
  };

  if (isLoading || !collection) return <Spinner />;

  if (!farmerNFT) {
    return (
      <>
        <FarmCollectionMint collectionId={collectionId} />
      </>
    );
  }

  if (!ownedNFTs) return <Spinner />;

  const partnerNFTIds = ownedNFTs
    ?.filter((nft) => nft.current_token_data?.collection_id !== collectionId)
    .reduce((acc: `0x${string}`[], nft) => {
      const collectionId = nft.current_token_data?.collection_id;
      const tokenId = nft.current_token_data?.token_data_id as `0x${string}`;
      if (
        collectionId &&
        !acc.some(
          (id) =>
            ownedNFTs?.find((n) => n.current_token_data?.token_data_id === id)?.current_token_data?.collection_id ===
            collectionId,
        )
      ) {
        acc.push(tokenId);
      }
      return acc;
    }, []);

  return (
    <>
      {farmerNFT && (
        <>
          <Flex direction={{ base: "column", md: "row" }} gap={6}>
            <Box flex={2}>
              {farmerNFT.current_token_data?.token_uri && (
                <Image
                  rounded={8}
                  src={farmerNFT.current_token_data?.token_uri}
                  style={{ boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.8)" }}
                />
              )}
            </Box>

            <Box flex={3}>
              <BoxBlurred padding={4}>
                <PageTitle size="lg" paddingTop={0}>
                  {farmerNFT.current_token_data?.token_name}
                </PageTitle>
                <Text paddingBottom={4}>{farmerNFT.current_token_data?.current_collection?.description}</Text>

                <Assets />

                {enableFarming ? (
                  <>
                    {address && farmed_data && (
                      <Box paddingTop={4}>
                        <FarmCountdown
                          seconds={farmed_data.remainingTime > 0 ? farmed_data.remainingTime : 0}
                          onActivate={() =>
                            farmNFT(farmerNFT.current_token_data?.token_data_id as `0x${string}`, partnerNFTIds)
                          }
                          loading={farming}
                        />
                        <Text paddingTop={2}>
                          <i>
                            Last Farmed:&nbsp;
                            {farmed_data.lastFarmedDate && farmed_data.lastFarmedDate.getDate() > 0
                              ? farmed_data.lastFarmedDate.toLocaleString()
                              : "Never"}
                          </i>
                        </Text>

                        {partnerNFTIds.length > 0 && (
                          <>
                            <Text>You have {partnerNFTIds.length} NFTs that will boost your farm. </Text>
                            <Box paddingTop={2}>
                              <details>
                                <summary style={{ cursor: "pointer", marginBottom: "8px" }}>NFTs</summary>
                                {partnerNFTIds.map((id) => (
                                  <Flex key={id} gap={3} paddingY={1} alignItems="center">
                                    <img
                                      src={
                                        ownedNFTs?.find((nft) => nft.current_token_data?.token_data_id === id)
                                          ?.current_token_data?.token_uri
                                      }
                                      alt={collection.name}
                                      width={100}
                                      height={100}
                                    />
                                    <Link
                                      href={`https://explorer.movementnetwork.xyz/token/${id}?network=${NETWORK_NAME}`}
                                      isExternal
                                    >
                                      <IconButton
                                        size="sm"
                                        icon={<FaLink />}
                                        aria-label="View on explorer"
                                        variant="ghost"
                                      />
                                    </Link>
                                    <Text fontFamily="monospace" fontSize="sm">
                                      {truncateAddress(id)}
                                    </Text>
                                  </Flex>
                                ))}
                              </details>
                            </Box>
                          </>
                        )}
                      </Box>
                    )}
                  </>
                ) : (
                  <Text paddingTop={4}>Farm bananas in the banana farm an enjoy the boost!</Text>
                )}
              </BoxBlurred>
            </Box>
          </Flex>
        </>
      )}
    </>
  );
}

export default FarmerOverview;
