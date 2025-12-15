import type { AvailableWallets } from "@aptos-labs/wallet-adapter-react";
import { AptosWalletAdapterProvider, useWallet } from "@aptos-labs/wallet-adapter-react";
import { type PropsWithChildren, useEffect, useRef } from "react";

const WALLET_STORAGE_KEY = "AptosWalletName";

/**
 * Workaround for Nightly wallet autoconnect issue.
 * Nightly is pushed to the wallets list with a delay, so we need to:
 * 1. Check if localStorage has a saved wallet name
 * 2. Wait for that wallet to appear in the wallets list
 * 3. Manually reconnect when it appears
 */
const WalletAutoconnectFix = ({ children }: PropsWithChildren) => {
  const { wallets, connected, connect } = useWallet();
  const hasAttemptedReconnect = useRef(false);

  useEffect(() => {
    // Only attempt reconnect once
    if (hasAttemptedReconnect.current || connected) {
      return;
    }

    const savedWalletName = localStorage.getItem(WALLET_STORAGE_KEY);
    if (!savedWalletName) {
      return;
    }

    const targetWallet = wallets.find((w) => w.name === savedWalletName);
    if (targetWallet) {
      hasAttemptedReconnect.current = true;
      connect(targetWallet.name);
    }
  }, [wallets, connected, connect]);

  return <>{children}</>;
};

export const WalletProvider = ({ children }: PropsWithChildren) => {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      optInWallets={["Nightly", "Razor Wallet" as AvailableWallets, "Leap Wallet" as AvailableWallets]}
      key={"vb"}
      onError={(error) => {
        console.log("wallet error", error);
      }}
    >
      <WalletAutoconnectFix>{children}</WalletAutoconnectFix>
    </AptosWalletAdapterProvider>
  );
};
