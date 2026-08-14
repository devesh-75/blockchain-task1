# The Praise Board — Decentralized Supporter Wall for Ifeoma

> **Live Deployed Sepolia Contract Address**: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`  
> **Network**: Ethereum Sepolia Testnet (`chainId: 11155111`)

---

## Story & Problem Statement

Ifeoma has kept her city's bus timetables online for three years because official transit PDFs go stale without warning. Over 9,000 commuters rely on her website every morning before leaving home. Traditional tipping platforms take a cut, demand complex tax paperwork, or refuse to onboard users from her region.

**The Praise Board** provides the simplest, zero-intermediary solution: a Web3 application where commuters connect their wallet, send a small ETH tip with a short note, and watch their name and message appear immediately on an immutable live wall of supporters.

No platform sits in the middle taking a cut or censoring who is allowed to give.

---

## Key Features

1. **Direct Smart Contract Tipping**:
   - `tip(string note)` / `sendTip(string note)`: Sends ETH directly to the contract along with a note (1 to 280 characters).
   - Validates non-zero tip value and character limits on-chain.
   - Emits `TipReceived(address donor, uint256 amount, string note, uint256 timestamp)` event.

2. **Immutable On-Chain Supporter Wall**:
   - `getTips()` / `getAllTips()` / `getTipCount()`: Reads all recorded tips directly from contract storage.
   - Live updates using Ethers.js provider and contract event listeners.

3. **Owner-Only Fund Withdrawal**:
   - `withdraw()` / `withdrawFunds()`: Restricted strictly to `owner` (Ifeoma) using custom error `Unauthorized()`.
   - Transfers 100% of accumulated ETH balance to Ifeoma's wallet and emits `Withdrawn(owner, amount)`.

4. **Commuter UX & Error Handling**:
   - Network auto-detection and one-click Sepolia switching (`wallet_switchEthereumChain`).
   - Friendly feedback for user rejection, note length limit, wrong network, or failed transactions.
   - Confetti celebration upon confirmed on-chain tip!

---

## 10 Scored Hardhat Unit Tests

The test suite in `test/PraiseBoard.test.js` covers 10 scored test cases:

1. **Deploy & Owner Setup**: Verifies deployer address is set as contract owner (Ifeoma).
2. **Valid Tip Execution**: Confirms ETH tip + valid note increases contract balance and tip count.
3. **Tip Struct Attributes**: Validates correct storage of `donor`, `amount`, `note`, and `timestamp`.
4. **Event Emission**: Ensures `TipReceived` is emitted with exact arguments.
5. **Zero ETH Rejection**: Reverts zero ETH tips with `InvalidAmount()` custom error.
6. **Empty Note Rejection**: Reverts empty note strings with `NoteEmpty()` custom error.
7. **Excessive Note Length Rejection**: Reverts notes exceeding 280 characters with `NoteTooLong(length, max)`.
8. **Multi-Supporter Aggregation**: Verifies `getTips()`, `getAllTips()`, and `getTipCount()` track multiple donors accurately.
9. **Owner Fund Withdrawal**: Tests `withdraw()`, verifying full balance transfer to owner and `Withdrawn` event emission.
10. **Unauthorized Withdrawal Revert**: Ensures non-owner withdrawal attempts revert with `Unauthorized()`.

---

## Quick Start & Local Setup

### Prerequisites
- Node.js `v22` (or `v20.12+`)
- MetaMask or any EIP-1193 Web3 browser wallet

### Installation
```bash
# Clone and navigate to project directory
cd praise-board

# Install dependencies
npm install
```

### Run Tests
```bash
npx hardhat test
```

### Compile Smart Contract
```bash
npx hardhat compile
```

### Deploy to Sepolia Testnet
Set your `.env` file:
```env
SEPOLIA_RPC_URL="https://rpc.sepolia.org" # or QuickNode endpoint
PRIVATE_KEY="0xYourBurnerWalletPrivateKey"
```
Run deploy script:
```bash
npm run deploy:sepolia
```

### Run Frontend Web App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture Diagram

```
[ Commuter Browser ]
        │
        ├── 1. Connect Wallet (MetaMask / Sepolia Chain ID 11155111)
        │
        ├── 2. tip("Thank you Ifeoma!") + 0.005 ETH
        ▼
[ PraiseBoard Smart Contract ] (Sepolia Testnet)
   ├── Store Tip { donor, amount, note, timestamp }
   ├── Emit TipReceived event
   └── Accumulate ETH in contract vault
        │
        ├── 3. Read live wall via getTips() & event listener
        ▼
[ Live Wall of Supporters ] ──► (Instant Trustworthy Display)
        │
        └── 4. withdraw() (Only Owner / Ifeoma)
```
