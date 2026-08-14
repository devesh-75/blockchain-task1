import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import Navbar from "./components/Navbar";
import NetworkAlert from "./components/NetworkAlert";
import Hero from "./components/Hero";
import TipForm from "./components/TipForm";
import LiveWall from "./components/LiveWall";
import OwnerVault from "./components/OwnerVault";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  SEPOLIA_CHAIN_ID_DEC,
  DEFAULT_SEPOLIA_RPC,
} from "./utils/contract";

export default function App() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [tips, setTips] = useState([]);
  const [totalEthRaised, setTotalEthRaised] = useState(0n);
  const [contractBalance, setContractBalance] = useState(0n);
  const [ownerAddress, setOwnerAddress] = useState(null);
  const [isLoadingWall, setIsLoadingWall] = useState(true);

  const [txState, setTxState] = useState("idle"); // idle | wallet | mining | confirmed | error
  const [txHash, setTxHash] = useState(null);
  const [txError, setTxError] = useState(null);

  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState({ success: false, error: null });

  // Get a read-only provider for RPC calls even if wallet is not connected
  const getReadOnlyProvider = useCallback(() => {
    if (window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    return new ethers.JsonRpcProvider(DEFAULT_SEPOLIA_RPC);
  }, []);

  // Fetch contract data (tips, balance, owner)
  const loadContractData = useCallback(async () => {
    try {
      setIsLoadingWall(true);
      const provider = getReadOnlyProvider();

      if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
        setIsLoadingWall(false);
        return;
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Fetch tips
      const rawTips = await contract.getTips();
      const formattedTips = rawTips.map((t) => ({
        donor: t.donor,
        amount: t.amount,
        note: t.note,
        timestamp: t.timestamp,
      })).reverse(); // Most recent first

      setTips(formattedTips);

      // Calculate total ETH raised
      let sum = 0n;
      formattedTips.forEach((t) => {
        sum += BigInt(t.amount);
      });
      setTotalEthRaised(sum);

      // Fetch contract balance
      const balance = await provider.getBalance(CONTRACT_ADDRESS);
      setContractBalance(balance);

      // Fetch contract owner
      const owner = await contract.owner();
      setOwnerAddress(owner);
    } catch (error) {
      console.warn("Failed loading contract state:", error);
    } finally {
      setIsLoadingWall(false);
    }
  }, [getReadOnlyProvider]);

  // Connect Browser Wallet (MetaMask / injected)
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("No Ethereum browser wallet found. Please install MetaMask to tip!");
      return;
    }
    try {
      setIsConnecting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();

      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
    } catch (error) {
      console.error("Wallet connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Switch network to Sepolia
  const switchToSepolia = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
    } catch (switchError) {
      // Chain not added to metamask case
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xaa36a7",
                chainName: "Sepolia Test Network",
                nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://rpc.sepolia.org"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding Sepolia chain:", addError);
        }
      }
    }
  };

  // Listen to account and chain changes in MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });

      window.ethereum.on("chainChanged", (hexChainId) => {
        setChainId(parseInt(hexChainId, 16));
      });
    }

    loadContractData();
  }, [loadContractData]);

  // Subscribe to real-time contract events
  useEffect(() => {
    let contract;
    try {
      if (CONTRACT_ADDRESS && CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        const provider = getReadOnlyProvider();
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        contract.on("TipReceived", (donor, amount, note, timestamp) => {
          console.log("New live TipReceived event:", donor, amount, note, timestamp);
          loadContractData();
        });
      }
    } catch (e) {
      console.warn("Event subscription setup issue:", e);
    }

    return () => {
      if (contract) {
        contract.removeAllListeners("TipReceived");
      }
    };
  }, [getReadOnlyProvider, loadContractData]);

  // Send Tip transaction handler
  const handleSendTip = async (amountEth, noteText) => {
    if (!window.ethereum || !account) return false;
    setTxState("wallet");
    setTxError(null);
    setTxHash(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const valueWei = ethers.parseEther(amountEth);

      // Execute tip transaction
      const tx = await contract.tip(noteText, { value: valueWei });
      setTxState("mining");
      setTxHash(tx.hash);

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        setTxState("confirmed");
        await loadContractData();
        return true;
      } else {
        setTxState("error");
        setTxError("Transaction failed on execution.");
        return false;
      }
    } catch (error) {
      console.error("Tip transaction error:", error);
      setTxState("error");
      if (error.code === "ACTION_REJECTED" || error.code === 4001) {
        setTxError("Transaction prompt rejected by user.");
      } else if (error.reason) {
        setTxError(error.reason);
      } else {
        setTxError(error.message || "Failed to complete tip transaction.");
      }
      return false;
    }
  };

  // Withdraw funds handler (Ifeoma only)
  const handleWithdraw = async () => {
    if (!window.ethereum || !account) return;
    setIsWithdrawing(true);
    setWithdrawStatus({ success: false, error: null });

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.withdraw();
      await tx.wait();

      setWithdrawStatus({ success: true, error: null });
      await loadContractData();
    } catch (error) {
      console.error("Withdrawal error:", error);
      setWithdrawStatus({
        success: false,
        error: error.reason || error.message || "Withdrawal failed.",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const isSepolia = chainId === SEPOLIA_CHAIN_ID_DEC || chainId === 11155111;
  const isOwner = account && ownerAddress && account.toLowerCase() === ownerAddress.toLowerCase();

  return (
    <div className="min-h-screen flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <Navbar
        account={account}
        chainId={chainId}
        isConnecting={isConnecting}
        onConnect={connectWallet}
        onSwitchNetwork={switchToSepolia}
        contractAddress={CONTRACT_ADDRESS}
      />

      {account && !isSepolia && (
        <NetworkAlert onSwitchNetwork={switchToSepolia} />
      )}

      <main className="flex-1 space-y-10 pb-16">
        <Hero
          totalTips={tips.length}
          totalEthRaised={totalEthRaised}
          contractBalance={contractBalance}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Owner Dashboard Panel (If connected as owner) */}
          {isOwner && (
            <OwnerVault
              ownerAddress={ownerAddress}
              contractBalance={contractBalance}
              onWithdraw={handleWithdraw}
              isWithdrawing={isWithdrawing}
              withdrawStatus={withdrawStatus}
            />
          )}

          {/* Form & Supporter Wall Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <TipForm
                account={account}
                chainId={chainId}
                onSendTip={handleSendTip}
                txState={txState}
                txHash={txHash}
                txError={txError}
              />
            </div>

            <div className="lg:col-span-7">
              <LiveWall tips={tips} isLoading={isLoadingWall} />
            </div>
          </div>
        </div>
      </main>

      <footer className="glass-panel border-t border-slate-800/80 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Praise Board — Decentralized Supporter Wall for Ifeoma's Bus Timetables</p>
          <p className="font-mono text-slate-500">
            Contract: {CONTRACT_ADDRESS ? `${CONTRACT_ADDRESS.substring(0, 10)}...` : "Not Deployed"}
          </p>
        </div>
      </footer>
    </div>
  );
}
