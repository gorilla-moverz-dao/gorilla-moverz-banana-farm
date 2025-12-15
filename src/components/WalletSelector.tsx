import { Badge, Box, Button, Image, Menu, MenuButton, MenuItem, MenuList, Text, Tooltip } from "@chakra-ui/react";
import { FaChevronDown } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import { SUPPORTED_WALLETS } from "../constants";
import type { AdapterNotDetectedWallet, AdapterWallet } from "@aptos-labs/wallet-adapter-react";
import { groupAndSortWallets, isInstallRequired, truncateAddress, useWallet } from "@aptos-labs/wallet-adapter-react";

export function WalletSelector() {
  const { account, connected, disconnect, wallets = [], network, wallet, connect } = useWallet();
  const { availableWallets } = groupAndSortWallets(wallets);

  const supportedWallets = availableWallets?.filter((w) => SUPPORTED_WALLETS.includes(w.name));

  const getLabel = () => {
    return (
      <>
        {network && <p>Network: {network.name}</p>}
        {wallet && <p>Wallet: {wallet.name}</p>}
      </>
    );
  };

  const buttonText = account?.ansName || truncateAddress(account?.address.toString() ?? "") || "Connect Wallet";

  if (connected) {
    return (
      <Tooltip hasArrow label={getLabel()} bg="gray.700" color="gray.100" aria-label="Wallet information">
        <Button className="wallet-button" onClick={() => disconnect()} rightIcon={<IoIosLogOut />}>
          {buttonText}
        </Button>
      </Tooltip>
    );
  }

  return (
    <>
      <Menu>
        <MenuButton as={Button} rightIcon={<FaChevronDown />}>
          Connect Wallet
        </MenuButton>
        <MenuList>
          {supportedWallets?.length === 0 && (
            <MenuItem>
              <Text>No compatible wallets found</Text>
            </MenuItem>
          )}
          {supportedWallets?.map((wallet) => {
            return walletView(wallet, connect);
          })}
        </MenuList>
      </Menu>
    </>
  );
}

const walletView = (wallet: AdapterWallet | AdapterNotDetectedWallet, connect: (walletName: string) => void) => {
  const installRequired = isInstallRequired(wallet);
  // Access icon property safely - wallet adapter uses 'icon' property
  const iconUrl = (wallet as { icon?: string }).icon || "";

  const handleClick = () => {
    if (installRequired) {
      if ("url" in wallet && wallet.url) {
        window.open(wallet.url, "_blank");
      }
    } else {
      connect(wallet.name);
    }
  };

  return (
    <MenuItem key={wallet.name} onClick={handleClick}>
      <Box
        className="wallet-menu-wrapper"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        <Box className="wallet-name-wrapper" display="flex" alignItems="center">
          {iconUrl && <Image src={iconUrl} width={25} marginRight={2} />}
          <Text className="wallet-selector-text">{wallet.name}</Text>
        </Box>
        {installRequired ? <Badge>Install</Badge> : <Badge>Connect</Badge>}
      </Box>
    </MenuItem>
  );
};
