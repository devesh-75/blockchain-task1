import React from "react";
import { AlertCircle, ArrowRight } from "lucide-react";

export default function NetworkAlert({ onSwitchNetwork }) {
  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border-y border-amber-500/30 px-4 py-3 text-center">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-3 text-sm text-slate-200">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
        <span>
          Your browser wallet is connected to an unsupported network. Please switch to <strong className="text-white">Ethereum Sepolia Testnet</strong> to send a tip to Ifeoma.
        </span>
        <button
          onClick={onSwitchNetwork}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <span>Switch Network</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
