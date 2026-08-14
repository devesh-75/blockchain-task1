import React from "react";
import { Lock, ArrowDownRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { formatEth, formatAddress } from "../utils/contract";

export default function OwnerVault({
  ownerAddress,
  contractBalance,
  onWithdraw,
  isWithdrawing,
  withdrawStatus,
}) {
  return (
    <div className="glass-panel border-amber-500/30 bg-gradient-to-r from-slate-900/90 via-amber-950/20 to-slate-900/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white font-heading">
                Ifeoma's Owner Vault Panel
              </h3>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                Owner Authenticated
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Only the contract owner ({formatAddress(ownerAddress)}) is permitted to withdraw accumulated commuter tips.
            </p>
          </div>
        </div>

        <button
          onClick={onWithdraw}
          disabled={isWithdrawing || parseFloat(contractBalance) <= 0}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-heading shrink-0"
        >
          {isWithdrawing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Withdrawing...</span>
            </>
          ) : (
            <>
              <ArrowDownRight className="w-4 h-4 stroke-[3]" />
              <span>Withdraw {formatEth(contractBalance)} ETH</span>
            </>
          )}
        </button>
      </div>

      {withdrawStatus.success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Successfully withdrew accumulated tips to your owner wallet!</span>
        </div>
      )}

      {withdrawStatus.error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Withdrawal failed: {withdrawStatus.error}</span>
        </div>
      )}
    </div>
  );
}
