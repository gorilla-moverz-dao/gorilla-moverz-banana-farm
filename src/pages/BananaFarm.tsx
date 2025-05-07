import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { WalletSelector } from "../components/WalletSelector";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { MODULE_ADDRESS } from "../constants";
import FarmParallax from "../components/banana-farm/FarmParallax";
import useMovement from "../hooks/useMovement";
import { FaAlignJustify } from "react-icons/fa6";

function BananaFarm() {
  const navigate = useNavigate();
  const { address } = useMovement();
  const { isOpen, onClose, onOpen } = useDisclosure();

  const navigationItems = [
    { id: "farm", name: "Banana farm" },
    { id: "partner", name: "Partner NFTs" },
    { id: "leaderboard", name: "Leaderboard" },
    { id: "gameplay", name: "Gameplay" },
  ];

  if (address === "0x" + MODULE_ADDRESS) {
    navigationItems.push({ id: "create", name: "Create collection" });
  }
  const activeNavigation = navigationItems.find((tab) => window.location.pathname.includes(`${tab.id}`));

  useEffect(() => {
    if (address) {
      onOpen();
    }
  }, [address]);

  return (
    <div>
      <Modal size="6xl" isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay style={{ backdropFilter: "blur(5px)" }} />
        <ModalContent height={{ base: "100vh", md: "auto" }} maxHeight={{ base: "100vh", md: "auto" }}>
          <ModalHeader display={{ base: "none", md: "block" }}></ModalHeader>
          <ModalCloseButton display={{ base: "none", md: "block" }} />
          <ModalBody padding={{ base: 3, md: 6 }}>
            <Box zIndex={-1} position="absolute" top={0} left={0} right={0} bottom={0} overflow={"hidden"} rounded={8}>
              <FarmParallax />
            </Box>
            <Flex flexDir="column" minHeight={{ base: "100%", md: 700 }} paddingTop={4}>
              <Flex alignSelf="end" display={{ base: "none", md: "flex" }}>
                <HStack>
                  {navigationItems.map((tab) => (
                    <NavLink key={tab.id} to={tab.id}>
                      {({ isActive }) => (
                        <Button
                          style={{ width: "100%" }}
                          colorScheme={isActive ? "green" : "gray"}
                          backdropFilter={"blur(5px)"}
                          border={"1px solid rgba(255, 255, 255, 0.1)"}
                          textShadow={!isActive ? "1px 1px 1px rgba(0, 0, 0, 0.5)" : ""}
                          onClick={() => {
                            navigate(tab.id);
                          }}
                        >
                          {tab.name}
                        </Button>
                      )}
                    </NavLink>
                  ))}
                </HStack>
              </Flex>

              <Box display={{ base: "block", md: "none" }} alignSelf="end">
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Options"
                    icon={<FaAlignJustify />}
                    variant="outline"
                    colorScheme="green"
                    backdropFilter={"blur(5px)"}
                    border={"1px solid rgba(255, 255, 255, 0.1)"}
                  />
                  <MenuList>
                    {navigationItems.map((tab) => (
                      <MenuItem
                        key={tab.id}
                        onClick={() => {
                          navigate(tab.id);
                        }}
                        bg={window.location.pathname.includes(tab.id) ? "green.500" : "transparent"}
                        color={window.location.pathname.includes(tab.id) ? "white" : "inherit"}
                      >
                        {tab.name}
                      </MenuItem>
                    ))}

                    <MenuItem onClick={onClose}>Close</MenuItem>
                  </MenuList>
                </Menu>
              </Box>

              <Flex padding={2} flexDir={"column"} flex={1}>
                <Heading
                  as="h1"
                  size={"xl"}
                  paddingBottom={{ base: 4, md: 12 }}
                  textAlign={"right"}
                  paddingTop={{ base: 0, md: 4 }}
                  textShadow={"1px 1px 6px rgba(0, 0, 0, 1)"}
                >
                  {activeNavigation?.name}
                </Heading>

                <Box flex={1} position={"relative"}>
                  <Box position={"absolute"} top={0} left={0} right={0} bottom={0} overflow={"auto"}>
                    <Outlet />
                  </Box>
                </Box>
              </Flex>
            </Flex>
          </ModalBody>

          <ModalFooter display={{ base: "none", md: "block" }}></ModalFooter>
        </ModalContent>
      </Modal>

      <Box paddingBottom={4}>
        <Stack direction={{ base: "column", md: "row" }} spacing={4}>
          <img src="/images/bananafarm/banana-farm-logo.png" width={320} />

          <Box>
            {address ? (
              <Box paddingTop={4}>
                <Button onClick={onOpen} colorScheme="green">
                  Open Banana Farm
                </Button>
              </Box>
            ) : (
              <>
                <Text paddingTop={2}>Please connect your wallet to access the Banana Farm</Text>
                <Text paddingTop={2}>Use Razor Wallet or Nightly and connect to the Mainnet</Text>
              </>
            )}

            <Text paddingTop={2}>
              🎬{" "}
              <Link isExternal href="https://www.youtube.com/watch?v=C_ahuRpoStU" target="_blank">
                <b>View How to Video</b>
              </Link>
            </Text>

            <Box paddingTop={4}>
              <WalletSelector />
            </Box>
          </Box>
        </Stack>
      </Box>
    </div>
  );
}

export default BananaFarm;
