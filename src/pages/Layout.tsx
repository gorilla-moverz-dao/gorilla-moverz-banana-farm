import { Analytics } from "@vercel/analytics/react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  IconButton,
  useDisclosure,
  useMediaQuery,
} from "@chakra-ui/react";
import NavBar from "../components/NavBar";
import BoxBlurred from "../components/BoxBlurred";
import { FiMenu } from "react-icons/fi";
import SocialIcons from "../components/SocialIcons";
import { Helmet } from "react-helmet";

function Layout() {
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Helmet>
        <title>Banana Farm | Gorilla Moverz</title>
        <meta
          name="description"
          content="Banana Farm: The Social Infrastructure project on Movement. We stimulate activity, promote initiatives, and support Movement testnet. Join our community shaping crypto's future. Apes together strong! 🦍🍌"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://farm.gorilla-moverz.xyz/" />
        <meta property="og:title" content="Banana Farm | Gorilla Moverz" />
        <meta
          property="og:description"
          content="Gorilla Moverz: The Social Infrastructure project on Movement. We stimulate activity, promote initiatives, and support testnets. Join our community shaping crypto's future. Apes together strong! 🦍🍌"
        />
        <meta property="og:image" content="https://farm.gorilla-moverz.xyz/images/banana.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {isMobile && (
        <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay />
          <DrawerContent
            style={{
              backdropFilter: "blur(20px)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <DrawerCloseButton />
            <DrawerHeader>Gorilla Moverz</DrawerHeader>
            <DrawerBody>
              <NavBar onClose={onClose} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}

      <Flex direction={"column"}>
        <Flex>
          <NavLink to={"/"}>
            <img
              src="/images/gogo-shake.png"
              width={isMobile ? 120 : 120}
              style={{ paddingLeft: isMobile ? 0 : 20, marginTop: "-20px" }}
              className="logo"
              alt="GOGO logo"
            />
          </NavLink>

          {isMobile ? (
            <Box flex="1" paddingLeft={2} textAlign={"left"}>
              <Heading className="logo-text-mobile" lineHeight={1.1}>
                Gorilla Moverz
              </Heading>
              <Box paddingTop={2} paddingBottom={2}>
                <SocialIcons />
              </Box>
            </Box>
          ) : (
            <Box flex="1" textAlign={"left"}>
              <Heading marginLeft={12} className="logo-text">
                Gorilla Moverz - Banana Farm
              </Heading>
            </Box>
          )}
          {isMobile && (
            <IconButton
              variant="outline"
              style={{
                backdropFilter: "blur(5px)",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
              }}
              onClick={onOpen}
              aria-label="Open menu"
              icon={<FiMenu />}
            />
          )}

          {!isMobile && (
            <Box paddingLeft={isMobile ? 0 : 4} paddingTop={4}>
              <SocialIcons />
            </Box>
          )}
        </Flex>
        <Flex>
          <Box width={"100%"} textAlign={"left"} marginTop={isMobile ? 0 : -2}>
            <BoxBlurred>
              <Box padding={4}>
                <Outlet />
                <Analytics />
              </Box>
            </BoxBlurred>
          </Box>
        </Flex>
      </Flex>
    </>
  );
}

export default Layout;
