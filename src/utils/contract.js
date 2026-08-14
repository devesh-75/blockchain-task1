import { ethers } from "ethers";
import deploymentInfo from "../deployment-info.json";

// Sepolia Chain ID details
export const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex
export const SEPOLIA_CHAIN_ID_DEC = 11155111;

// Default QuickNode / Public Sepolia RPC URL fallback
export const DEFAULT_SEPOLIA_RPC = "https://rpc.sepolia.org";

// Deployed contract address fallback from deployment-info.json if available
export const CONTRACT_ADDRESS = deploymentInfo?.address || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

export const CONTRACT_ABI = [
  "constructor()",
  "event TipReceived(address indexed donor, uint256 amount, string note, uint256 timestamp)",
  "event Withdrawn(address indexed owner, uint256 amount)",
  "function MAX_NOTE_LENGTH() view returns (uint256)",
  "function getAllTips() view returns (tuple(address donor, uint256 amount, string note, uint256 timestamp)[])",
  "function getTipCount() view returns (uint256)",
  "function getTips() view returns (tuple(address donor, uint256 amount, string note, uint256 timestamp)[])",
  "function getTotalTips() view returns (uint256)",
  "function owner() view returns (address)",
  "function sendTip(string note) payable",
  "function tip(string note) payable",
  "function totalEthRaised() view returns (uint256)",
  "function withdraw()",
  "function withdrawFunds()",
  "error InvalidAmount()",
  "error NoteEmpty()",
  "error NoteTooLong(uint256 length, uint256 maxLength)",
  "error Unauthorized()",
  "error WithdrawFailed()"
];

/**
 * Truncates an Ethereum address to 0x1234...5678 format
 */
export function formatAddress(address) {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Formats wei to ETH rounded to 4 decimals
 */
export function formatEth(wei) {
  if (!wei) return "0";
  const formatted = ethers.formatEther(wei);
  return parseFloat(formatted).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

/**
 * Formats epoch timestamp to relative time string (e.g., "5 mins ago", "2 hours ago")
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return "Recently";
  const numSecs = Number(timestamp);
  const nowSecs = Math.floor(Date.now() / 1000);
  const diffSecs = nowSecs - numSecs;

  if (diffSecs < 60) return "Just now";
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
  if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
  return `${Math.floor(diffSecs / 86400)}d ago`;
}
