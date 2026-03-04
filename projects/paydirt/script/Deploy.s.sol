// Deployment script for Paydirt contract
// Run: forge script script/Deploy.s.sol --rpc-url base_sepolia --private-key $PRIVATE_KEY --broadcast

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Paydirt.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address clawkerToken = 0x18Ba45Eeff98c64AFAc52474d0C6cBa9546eC6F2; // $CLAWKER on Base
        address treasury = msg.sender; // Deployer address
        
        vm.startBroadcast(deployerPrivateKey);
        
        Paydirt paydirt = new Paydirt(clawkerToken, treasury);
        
        console.log("Paydirt deployed at:", address(paydirt));
        
        vm.stopBroadcast();
    }
}
