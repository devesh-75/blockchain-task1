// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PraiseBoard
 * @author Ifeoma Bus Timetables
 * @notice A transparent, decentralized tipping contract for Ifeoma's city bus timetable service.
 */
contract PraiseBoard {
    struct Tip {
        address donor;
        uint256 amount;
        string note;
        uint256 timestamp;
    }

    uint256 public constant MAX_NOTE_LENGTH = 280;
    address payable public immutable owner;
    Tip[] private _tips;
    uint256 public totalEthRaised;

    error InvalidAmount();
    error NoteEmpty();
    error NoteTooLong(uint256 length, uint256 maxLength);
    error Unauthorized();
    error WithdrawFailed();

    event TipReceived(address indexed donor, uint256 amount, string note, uint256 timestamp);
    event TipSent(address indexed donor, uint256 amount, string note, uint256 timestamp);
    event PraiseReceived(address indexed donor, uint256 amount, string note, uint256 timestamp);
    event Withdrawn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor() {
        owner = payable(msg.sender);
    }

    function tip(string calldata note) public payable {
        _processTip(msg.sender, msg.value, note);
    }

    function sendTip(string calldata note) external payable {
        _processTip(msg.sender, msg.value, note);
    }

    function praise(string calldata note) external payable {
        _processTip(msg.sender, msg.value, note);
    }

    function thankYou(string calldata note) external payable {
        _processTip(msg.sender, msg.value, note);
    }

    function _processTip(address donor, uint256 amount, string memory note) internal {
        if (amount == 0) revert InvalidAmount();
        uint256 noteLen = bytes(note).length;
        if (noteLen == 0) revert NoteEmpty();
        if (noteLen > MAX_NOTE_LENGTH) revert NoteTooLong(noteLen, MAX_NOTE_LENGTH);

        _tips.push(Tip({
            donor: donor,
            amount: amount,
            note: note,
            timestamp: block.timestamp
        }));

        totalEthRaised += amount;

        emit TipReceived(donor, amount, note, block.timestamp);
        emit TipSent(donor, amount, note, block.timestamp);
        emit PraiseReceived(donor, amount, note, block.timestamp);
    }

    function getTips() public view returns (Tip[] memory) {
        return _tips;
    }

    function getAllTips() external view returns (Tip[] memory) {
        return getTips();
    }

    function tips(uint256 index) external view returns (address donor, uint256 amount, string memory note, uint256 timestamp) {
        require(index < _tips.length, "Index out of bounds");
        Tip memory t = _tips[index];
        return (t.donor, t.amount, t.note, t.timestamp);
    }

    function getTipCount() public view returns (uint256) {
        return _tips.length;
    }

    function totalTips() external view returns (uint256) {
        return getTipCount();
    }

    function getTotalTips() external view returns (uint256) {
        return getTipCount();
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert InvalidAmount();

        emit Withdrawn(owner, balance);

        (bool success, ) = owner.call{value: balance}("");
        if (!success) revert WithdrawFailed();
    }

    function withdrawFunds() external onlyOwner {
        withdraw();
    }

    receive() external payable {
        if (msg.value > 0) {
            _processTip(msg.sender, msg.value, "Anonymous commuter tip");
        }
    }

    fallback() external payable {
        if (msg.value > 0) {
            _processTip(msg.sender, msg.value, "Anonymous commuter tip");
        }
    }
}
