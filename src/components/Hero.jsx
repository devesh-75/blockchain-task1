import React from "react";
import { Bus, Users, Shield, Zap, Sparkles } from "lucide-react";
import { formatEth } from "../utils/contract";

export default function Hero({ totalTips, totalEthRaised, contractBalance }) {
  return (
    <section className="relative overflow-hidden pt-8 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Story & Hero Headline */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-amber-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Independent Public Transit Infrastructure</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-heading">
              Support <span className="shimmer-text">Ifeoma's Timetables</span>. <br />
              Direct. Immutable. Transparent.
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              For three years, Ifeoma has kept her city’s bus schedules updated online because official PDFs go stale without warning. 
              Over <strong>9,000 commuters</strong> rely on her site every morning. Tipping platforms take cuts or block accounts—so this page uses a <strong>zero-fee Solidity smart contract</strong>. 
              Your note goes straight onto the live wall of supporters.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs bg-slate-900/60 border border-slate-800 px-3 py-2 rounded-xl text-slate-300">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Zero platform middleman</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-slate-900/60 border border-slate-800 px-3 py-2 rounded-xl text-slate-300">
                <Bus className="w-4 h-4 text-amber-400" />
                <span>Direct Sepolia ETH transfer</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-slate-900/60 border border-slate-800 px-3 py-2 rounded-xl text-slate-300">
                <Zap className="w-4 h-4 text-blue-400" />
                <span>Instant on-chain confirmation</span>
              </div>
            </div>
          </div>

          {/* Stats Display Cards */}
          <div className="lg:col-span-5">
            <div className="glass-panel-glow rounded-3xl p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Commuter Support</h3>
                  <p className="text-2xl sm:text-3xl font-black text-amber-400 font-heading mt-1">
                    {formatEth(totalEthRaised)} <span className="text-base font-semibold text-slate-300">ETH</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Supporters</p>
                  <p className="text-xl font-bold text-white font-heading mt-1">
                    {totalTips} <span className="text-xs font-normal text-slate-400">tips</span>
                  </p>
                </div>

                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Vault Balance</p>
                  <p className="text-xl font-bold text-emerald-400 font-heading mt-1">
                    {formatEth(contractBalance)} <span className="text-xs font-normal text-slate-400">ETH</span>
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/40 rounded-xl p-3.5 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Verified smart contract record. No proprietary server can alter or censor notes.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
