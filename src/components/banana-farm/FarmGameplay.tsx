import { Box, Button, Flex, Heading, Image, Link, ListItem, UnorderedList } from "@chakra-ui/react";
import BoxBlurred from "../BoxBlurred";
import { NavLink } from "react-router-dom";

function FarmGameplay() {
  return (
    <Flex direction={{ base: "column", md: "row" }} gap={4}>
      <Box flex={2}>
        <Link href="https://www.youtube.com/watch?v=C_ahuRpoStU" isExternal>
          <Image rounded={8} src="https://img.youtube.com/vi/C_ahuRpoStU/0.jpg" alt="Banana Farm Gameplay" />

          <Button size="sm" colorScheme="green" marginTop={4}>
            View How To Video
          </Button>
        </Link>
      </Box>

      <Box flex={3}>
        <BoxBlurred padding={4}>
          <Heading size="md">Gameplay</Heading>
          <UnorderedList>
            <ListItem>In order to farm bananas, you need to mint a "Banana Farmer" NFTs. (1 mint per Wallet)</ListItem>
            <ListItem>
              The NFT mint requires being on the allowlist. To be on the allowlist, you have to submit your Wallet
              address with the Discord bot.
            </ListItem>
            <ListItem>You can then start to farm bananas.</ListItem>
            <ListItem>
              There is a timeout that needs to be awaited to farm again more bananas. The timeout can change from time
              to time.
            </ListItem>
            <ListItem>
              Bananas get bad if they are not farmed early. The earlier you farm bananas after the timeout, the more
              bananas you get.
            </ListItem>
            <ListItem>The leaderboard is based on the amount of bananas a wallet owns</ListItem>
            <ListItem>You can also mint partner NFTs to get more bananas (boost) each time you farm.</ListItem>
          </UnorderedList>

          <NavLink to="/farm">
            <Button colorScheme="green" marginTop={4}>
              Farm Bananas
            </Button>
          </NavLink>
        </BoxBlurred>
      </Box>
    </Flex>
  );
}

export default FarmGameplay;
