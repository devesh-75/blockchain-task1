import React, { useState } from "react";
import { MessageSquare, ShieldCheck, Search, Clock, Award, Sparkles } from "lucide-react";
import { formatAddress, formatEth, formatTimestamp } from "../utils/contract";

export default function LiveWall({ tips, isLoading }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTips = tips.filter((t) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.note.toLowerCase().includes(term) ||
      t.donor.toLowerCase().includes(term)
    );
  });

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white font-heading">
              Live Wall of Supporters
            </h2>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {tips.length} total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Trustworthy record read directly from the PraiseBoard smart contract on Ethereum Sepolia.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes or address..."
            className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs"
          />
        </div>
      </div>

      {/* Supporter Cards List */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400">Loading live on-chain supporter wall...</p>
        </div>
      ) : filteredTips.length === 0 ? (
        <div className="py-16 text-center space-y-3 glass-panel rounded-2xl border border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-300">
            {searchTerm ? "No notes matching your search" : "No tips on the wall yet"}
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm
              ? "Try searching for a different keyword or wallet address."
              : "Be the very first commuter to send a tip and leave a note on Ifeoma's Praise Board!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTips.map((tip, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-amber-500/5 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top line: Donor address & Tip amount badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Generative Avatar Icon */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-inner">
                      {tip.donor.substring(2, 4).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                          {formatAddress(tip.donor)}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" title="Verified On-Chain Record" />
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(tip.timestamp)}
                      </span>
                    </div>
                  </div>

                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold text-xs px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {formatEth(tip.amount)} ETH
                  </span>
                </div>

                {/* Note message */}
                <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/40 rounded-xl p-3 border border-slate-800/50 italic">
                  "{tip.note}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/40 mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Award className="w-3.5 h-3.5" /> Direct Commuter Supporter
                </span>
                <a
                  href={`https://sepolia.etherscan.io/address/${tip.donor}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-200 transition-colors font-mono"
                >
                  View Donor
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
