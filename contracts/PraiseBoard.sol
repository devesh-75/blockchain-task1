// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PraiseBoard
 * @dev A transparent, decentralized tipping contract for Ifeoma's transit timetable service.
 * Allows commuters to send ETH tips with short notes directly to the smart contract,
 * creating an immutable on-chain record for the live wall of supporters without intermediaries.
 */
contract PraiseBoard {
    struct Tip {
        address donor;
        uint256 amount;
        string note;
        uint256 timestamp;
    }

    /// @notice Maximum allowed character length for a supporter note
    uint256 public constant MAX_NOTE_LENGTH = 280;

    /// @notice The contract owner (Ifeoma) who has withdrawal rights
    address payable public immutable owner;

    /// @dev Internal storage array for all incoming tips
    Tip[] private _tips;

    /// @notice Total ETH amount collected in tips overall
    uint256 public totalEthRaised;

    // --- Custom Errors ---
    error InvalidAmount();
    error NoteEmpty();
    error NoteTooLong(uint256 length, uint256 maxLength);
    error Unauthorized();
    error WithdrawFailed();

    // --- Events ---
    event TipReceived(address indexed donor, uint256 amount, string note, uint256 timestamp);
    event Withdrawn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor() {
        owner = payable(msg.sender);
    }

    /**
     * @notice Send a tip with a short note attached to support Ifeoma's transit timetables.
     * @param note A message from the commuter (1 to 280 characters).
     */
    function tip(string calldata note) public payable {
        if (msg.value == 0) revert InvalidAmount();
        uint256 noteLen = bytes(note).length;
        if (noteLen == 0) revert NoteEmpty();
        if (noteLen > MAX_NOTE_LENGTH) revert NoteTooLong(noteLen, MAX_NOTE_LENGTH);

        _tips.push(Tip({
            donor: msg.sender,
            amount: msg.value,
            note: note,
            timestamp: block.timestamp
        }));

        totalEthRaised += msg.value;

        emit TipReceived(msg.sender, msg.value, note, block.timestamp);
    }

    /**
     * @notice Alias function for tip() to support alternative interface calls.
     */
    function sendTip(string calldata note) external payable {
        tip(note);
    }

    /**
     * @notice Retrieves all tips stored on-chain.
     * @return Array of Tip structs containing donor, amount, note, and timestamp.
     */
    function getTips() public view returns (Tip[] memory) {
        return _tips;
    }

    /**
     * @notice Alias function for getTips() for compatibility.
     */
    function getAllTips() external view returns (Tip[] memory) {
        return getTips();
    }

    /**
     * @notice Returns the total count of tips received so far.
     */
    function getTipCount() public view returns (uint256) {
        return _tips.length;
    }

    /**
     * @notice Alias function for getTipCount().
     */
    function getTotalTips() external view returns (uint256) {
        return getTipCount();
    }

    /**
     * @notice Allows Ifeoma (contract owner) to withdraw accumulated tip funds.
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert InvalidAmount();

        emit Withdrawn(owner, balance);

        (bool success, ) = owner.call{value: balance}("");
        if (!success) revert WithdrawFailed();
    }

    /**
     * @notice Alias function for withdraw().
     */
    function withdrawFunds() external onlyOwner {
        withdraw();
    }

    /**
     * @notice Fallback to handle direct ETH transfers.
     */
    receive() external payable {
        if (msg.value > 0) {
            _tips.push(Tip({
                donor: msg.sender,
                amount: msg.value,
                note: "Anonymous commuter tip",
                timestamp: block.timestamp
            }));
            totalEthRaised += msg.value;
            emit TipReceived(msg.sender, msg.value, "Anonymous commuter tip", block.timestamp);
        }
    }
}
