import { useState } from "react";

export default function useMetaMask() {
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected! Please install it.");
      return null;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];
      setAccount(address);
      return address;
    } catch (err) {
      console.error("Wallet connection failed", err);
      return null;
    }
  };

  return { account, connectWallet };
}
