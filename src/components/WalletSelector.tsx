import { Badge, Box, Button, Image, Menu, MenuButton, MenuItem, MenuList, Text, Tooltip } from "@chakra-ui/react";
import { FaChevronDown } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import { SUPPORTED_WALLETS } from "../constants";
import { IWallet, useWallet } from "@razorlabs/razorkit";
import useMovement from "../hooks/useMovement";
export function WalletSelector() {
  const { select, disconnect, detectedWallets, configuredWallets, chain, name, account, connected } = useWallet();
  const { truncateAddress } = useMovement();
  const wallets = [...configuredWallets, ...detectedWallets];
  console.log("wallets", wallets);

  const supportedWallets = wallets?.filter((wallet) => SUPPORTED_WALLETS.includes(wallet.name));

  const onWalletSelected = (wallet: string) => {
    select(wallet);
  };

  const getLabel = () => {
    return (
      <>
        {chain && <p>Network: {chain.rpcUrl}</p>}
        {name && <p>Wallet: {name}</p>}
      </>
    );
  };

  const buttonText = account?.label
    ? account?.label
    : account?.address
      ? truncateAddress(account?.address.toString())
      : "Connect Wallet";

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
          {supportedWallets?.map((wallet) => {
            return walletView(wallet, onWalletSelected);
          })}
        </MenuList>
      </Menu>
    </>
  );
}

const walletView = (wallet: IWallet, onWalletSelected: (wallet: string) => void) => {
  const isWalletReady = wallet.installed;
  // The user is on a mobile device
  if (!isWalletReady) {
    const mobileSupport = false; //(wallet as AdapterWallet).de.deeplinkProvider;
    // If the user has a deep linked app, show the wallet
    if (mobileSupport) {
      return (
        <MenuItem key={wallet.name} onClick={() => onWalletSelected(wallet.name)}>
          <div className="wallet-menu-wrapper">
            <div className="wallet-name-wrapper">
              <img src={wallet.iconUrl} width={25} style={{ marginRight: 10 }} />
              <Text className="wallet-selector-text">{wallet.name}</Text>
            </div>
            <Button>
              <Text>Connect</Text>
            </Button>
          </div>
        </MenuItem>
      );
    }
    // Otherwise don't show anything
    return null;
  } else {
    // The user is on a desktop device
    return (
      <MenuItem
        key={wallet.name}
        onClick={
          wallet.installed
            ? () => onWalletSelected(wallet.name)
            : () => window.open(wallet.downloadUrl.browserExtension)
        }
      >
        <Image src={wallet.iconUrl} width={25} marginRight={2} />
        <Box flex={1} paddingRight={4}>
          {wallet.name}
        </Box>
        {wallet.installed ? <Badge>Connect</Badge> : <Badge>Install</Badge>}
      </MenuItem>
    );
  }
};
