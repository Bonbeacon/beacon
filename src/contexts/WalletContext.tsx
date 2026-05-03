import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  isCorrectNetwork: boolean;
  switchNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const PHAROS_CHAIN_ID = 1672;
const PHAROS_CHAIN_ID_HEX = `0x${PHAROS_CHAIN_ID.toString(16)}`;

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const checkNetwork = async () => {
    if (!window.ethereum) return false;
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const isCorrect = chainId === PHAROS_CHAIN_ID_HEX;
      setIsCorrectNetwork(isCorrect);
      return isCorrect;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const connect = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or another EVM wallet.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        await checkNetwork();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsCorrectNetwork(false);
  };

  const switchNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: PHAROS_CHAIN_ID_HEX }],
      });
      setIsCorrectNetwork(true);
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: PHAROS_CHAIN_ID_HEX,
                chainName: "Pharos Pacific Ocean Mainnet",
                nativeCurrency: {
                  name: "PROS",
                  symbol: "PROS",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.pharos.xyz"],
                blockExplorerUrls: ["https://pharosscan.xyz"],
              },
            ],
          });
          setIsCorrectNetwork(true);
        } catch (addError) {
          console.error("Error adding network", addError);
        }
      }
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts: any) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          checkNetwork();
        }
      });

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          checkNetwork();
        } else {
          setAddress(null);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        connect,
        disconnect,
        isCorrectNetwork,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
