// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Paydirt
 * @dev Old West frontier economy simulation - extraction game
 */
contract Paydirt is Ownable, ReentrancyGuard {
    
    // ============ Constants ============
    uint256 public constant TOKEN_GATE_MINIMUM = 50_000_000 * 1e18; // 50M $CLAWKER
    uint256 public constant STAKE_AMOUNT = 0.0001 ether; // 0.0001 ETH to mine (lower for testing)
    uint256 public constant GRID_SIZE = 10; // 10x10 grid
    uint256 public constant COOLDOWN_SECONDS = 1 minutes;
    
    // ============ Token ============
    IERC20 public clawkerToken;
    address public treasury;
    
    // ============ Game State ============
    mapping(address => uint256) public playerBalances;
    mapping(address => uint256) public totalMined;
    mapping(address => uint256) public lastMineTime;
    
    // Map: grid position -> resource type (0=empty, 1=copper, 2=silver, 3=gold)
    mapping(uint256 => uint8) public tileResources;
    // Map: grid position -> is revealed
    mapping(uint256 => bool) public tileRevealed;
    // Map: grid position -> last mined timestamp
    mapping(uint256 => uint256) public tileLastMined;
    // Map: grid position -> owner (0 = unowned)
    mapping(uint256 => address) public tileOwners;
    
    // ============ Events ============
    event MineExecuted(address indexed player, uint256 tileId, uint8 resource, uint256 reward);
    event TileRevealed(uint256 tileId, uint8 resource, address player);
    event Withdrawal(address indexed player, uint256 amount);
    event TreasuryUpdated(address newTreasury);
    
    // ============ Constructor ============
    constructor(address _clawkerToken, address _treasury) Ownable(msg.sender) {
        require(_clawkerToken != address(0), "Invalid token address");
        clawkerToken = IERC20(_clawkerToken);
        treasury = _treasury;
        _initializeGrid();
    }
    
    // ============ Grid Initialization ============
    function _initializeGrid() internal {
        // Seed the grid with resources
        for (uint256 i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            uint256 seed = uint256(keccak256(abi.encodePacked(i, block.timestamp, block.prevrandao)));
            // Weighted: 40% empty, 35% copper, 15% silver, 10% gold
            uint256 rand = seed % 100;
            if (rand < 40) {
                tileResources[i] = 0; // Empty
            } else if (rand < 75) {
                tileResources[i] = 1; // Copper
            } else if (rand < 90) {
                tileResources[i] = 2; // Silver
            } else {
                tileResources[i] = 3; // Gold
            }
            tileRevealed[i] = false;
            tileOwners[i] = address(0);
        }
    }
    
    // ============ Token Gate ============
    function hasAccess(address _player) public view returns (bool) {
        return clawkerToken.balanceOf(_player) >= TOKEN_GATE_MINIMUM;
    }
    
    function getClawkerBalance(address _player) public view returns (uint256) {
        return clawkerToken.balanceOf(_player);
    }
    
    // ============ Mining ============
    function mine(uint256 tileId) external payable nonReentrant {
        require(hasAccess(msg.sender), "TOKEN_GATE: 50M $CLAWKER required");
        require(tileId < GRID_SIZE * GRID_SIZE, "Invalid tile");
        require(msg.value >= STAKE_AMOUNT, "Stake too low");
        require(block.timestamp >= lastMineTime[msg.sender] + COOLDOWN_SECONDS, "Cooldown active");
        
        // Reveal the tile if not revealed
        if (!tileRevealed[tileId]) {
            uint256 seed = uint256(keccak256(abi.encodePacked(tileId, block.timestamp, msg.sender, block.prevrandao)));
            uint256 rand = seed % 100;
            if (rand < 40) {
                tileResources[tileId] = 0;
            } else if (rand < 75) {
                tileResources[tileId] = 1;
            } else if (rand < 90) {
                tileResources[tileId] = 2;
            } else {
                tileResources[tileId] = 3;
            }
            tileRevealed[tileId] = true;
            emit TileRevealed(tileId, tileResources[tileId], msg.sender);
        }
        
        uint8 resource = tileResources[tileId];
        uint256 reward = 0;
        
        // Calculate reward based on resource type
        if (resource == 1) reward = 0.0001 ether;      // Copper: 1x stake
        else if (resource == 2) reward = 0.0005 ether; // Silver: 5x stake
        else if (resource == 3) reward = 0.001 ether;   // Gold: 10x stake
        
        // Update state
        lastMineTime[msg.sender] = block.timestamp;
        tileLastMined[tileId] = block.timestamp;
        
        if (reward > 0) {
            playerBalances[msg.sender] += reward;
            totalMined[msg.sender] += reward;
            emit MineExecuted(msg.sender, tileId, resource, reward);
        }
        
        // Send stake to treasury
        payable(treasury).transfer(msg.value);
    }
    
    // ============ Withdraw ============
    function withdraw() external nonReentrant {
        uint256 balance = playerBalances[msg.sender];
        require(balance > 0, "No balance");
        
        playerBalances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
        
        emit Withdrawal(msg.sender, balance);
    }
    
    // ============ View Functions ============
    function getGridSize() external pure returns (uint256) {
        return GRID_SIZE;
    }
    
    function getTile(uint256 tileId) external view returns (uint8 resource, bool revealed, uint256 lastMined, address owner) {
        require(tileId < GRID_SIZE * GRID_SIZE, "Invalid tile");
        return (tileResources[tileId], tileRevealed[tileId], tileLastMined[tileId], tileOwners[tileId]);
    }
    
    function getPlayerStats(address _player) external view returns (uint256 balance, uint256 totalMined_) {
        return (playerBalances[_player], totalMined[_player]);
    }
    
    // ============ Admin ============
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }
    
    // ============ Fractals ============
    // 40% chance: nothing
    // 35% chance: copper (0.0001 ETH)
    // 15% chance: silver (0.0005 ETH)  
    // 10% chance: gold (0.001 ETH)
}
