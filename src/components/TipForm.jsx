import React, { useState } from "react";
import { Send, Sparkles, CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import confetti from "canvas-confetti";

export default function TipForm({
  account,
  chainId,
  onSendTip,
  txState,
  txHash,
  txError,
}) {
  const [amount, setAmount] = useState("0.005");
  const [note, setNote] = useState("");
  const [preset, setPreset] = useState("0.005");

  const MAX_CHARS = 280;
  const charsRemaining = MAX_CHARS - note.length;
  const isTooLong = charsRemaining < 0;
  const isEmpty = note.trim().length === 0;
  const isInvalidAmount = !amount || parseFloat(amount) <= 0 || isNaN(parseFloat(amount));

  const presets = [
    { label: "☕ 0.001 ETH", value: "0.001" },
    { label: "🚌 0.005 ETH", value: "0.005" },
    { label: "⭐ 0.01 ETH", value: "0.01" },
  ];

  const handleSelectPreset = (val) => {
    setPreset(val);
    setAmount(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) return;
    if (isEmpty || isTooLong || isInvalidAmount) return;

    const success = await onSendTip(amount, note);
    if (success) {
      // Fire celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#10b981", "#3b82f6"],
      });
      setNote("");
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full filter blur-3xl -z-10 pointer-events-none"></div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
            <span>Send a Tip & Note</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Your note will be stored on-chain and added to the live wall immediately.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preset Tip Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
            Select Tip Amount (ETH)
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {presets.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => handleSelectPreset(p.value)}
                className={`py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm transition-all border ${
                  preset === p.value
                    ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20"
                    : "glass-input hover:border-amber-500/50 text-slate-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Custom Amount (ETH)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.0001"
              min="0.0001"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setPreset("custom");
              }}
              placeholder="0.005"
              className="w-full glass-input rounded-xl px-4 py-3 text-sm font-mono focus:ring-0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              ETH
            </span>
          </div>
          {isInvalidAmount && amount !== "" && (
            <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Enter a valid ETH amount greater than 0.
            </p>
          )}
        </div>

        {/* Note Input Textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Supporter Note <span className="text-rose-400">*</span>
            </label>
            <span
              className={`text-xs font-mono font-medium ${
                isTooLong ? "text-rose-400 font-bold" : charsRemaining < 30 ? "text-amber-400" : "text-slate-400"
              }`}
            >
              {charsRemaining} characters left
            </span>
          </div>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Thanks Ifeoma! The 8:15 AM bus schedule update saved my job interview."
            className={`w-full glass-input rounded-xl p-4 text-sm leading-relaxed resize-none ${
              isTooLong ? "border-rose-500 focus:border-rose-500" : ""
            }`}
          ></textarea>
          {isTooLong && (
            <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Note exceeds maximum limit of 280 characters.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!account || isEmpty || isTooLong || isInvalidAmount || txState === "wallet" || txState === "mining"}
          className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-amber-500/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider flex items-center justify-center gap-2 font-heading"
        >
          {txState === "wallet" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Confirming in Wallet...</span>
            </>
          ) : txState === "mining" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
              <span>Mining Transaction on Sepolia...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 fill-slate-950" />
              <span>{account ? "Send Tip & Publish Note" : "Connect Wallet to Tip"}</span>
            </>
          )}
        </button>

        {/* Transaction Feedback Banners */}
        {txState === "confirmed" && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-xs text-emerald-300 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-emerald-200">Transaction Confirmed!</p>
              <p className="text-emerald-300/80">
                Your tip and note have been immutably recorded on Ethereum Sepolia.
              </p>
              {txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-amber-400 hover:underline pt-1"
                >
                  <span>View on Etherscan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {txError && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-xs text-rose-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-200">Transaction Failed</p>
              <p className="text-rose-300/90 mt-0.5">{txError}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
