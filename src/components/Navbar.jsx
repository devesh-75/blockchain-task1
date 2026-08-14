import React from "react";
import { Bus, Wallet, ShieldCheck, AlertTriangle, ExternalLink } from "lucide-react";
import { formatAddress, SEPOLIA_CHAIN_ID_DEC } from "../utils/contract";

export default function Navbar({
  account,
  chainId,
  isConnecting,
  onConnect,
  onSwitchNetwork,
  contractAddress,
}) {
  const isSepolia = chainId === SEPOLIA_CHAIN_ID_DEC || chainId === 11155111;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Context */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <Bus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white font-heading">
                The Praise Board
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Direct commuter support for Ifeoma's city bus timetables
            </p>
          </div>
        </div>

        {/* Account & Network Status */}
        <div className="flex items-center gap-3">
          {/* Network Indicator */}
          {account ? (
            isSepolia ? (
              <div className="flex items-center gap-1.5 text-xs bg-slate-900/80 border border-slate-700/60 px-3 py-1.5 rounded-lg text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium text-slate-200">Sepolia Testnet</span>
              </div>
            ) : (
              <button
                onClick={onSwitchNetwork}
                className="flex items-center gap-1.5 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                <span>Wrong Network</span>
              </button>
            )
          ) : null}

          {/* Connect Wallet Button */}
          {account ? (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
              <span className="font-mono text-sm font-semibold text-amber-300">
                {formatAddress(account)}
              </span>
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-amber-500/20 active:scale-95 disabled:opacity-50 text-sm"
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
            </button>
          )}

          {/* Etherscan Contract Link */}
          {contractAddress && (
            <a
              href={`https://sepolia.etherscan.io/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors p-2"
              title="View Smart Contract on Etherscan"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
