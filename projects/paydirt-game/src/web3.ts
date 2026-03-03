// Wallet integration for PAYDIRT Game
import { useWallet } from './useWallet'

// Web3 Context Provider
export function Web3Provider({ children }) {
  const { connect, disconnect, address, chainId, isConnected, balance } = useWallet()
  
  return children({
    connect,
    disconnect,
    address,
    chainId,
    isConnected,
    balance,
    hasAccess: balance >= TOKEN_GATE_MINIMUM,
    formatAddress: (addr) => addr ? `${addr.slice(0,6)}...${addr.slice(-4)}` : ''
  })
}

// Token gate UI component
export function ConnectButton({ onConnect, onDisconnect, address, isConnected, hasAccess, balance, formatAddress }) {
  if (isConnected) {
    return `
      <div class="wallet-connected">
        <span class="address">${formatAddress(address)}</span>
        <span class="balance">${balance} CLAWKER</span>
        <span class="access ${hasAccess ? 'has-access' : 'no-access'}">
          ${hasAccess ? '✓ ACCESS' : '✗ NEED 50M'}
        </span>
        <button class="disconnect">Disconnect</button>
      </div>
    `
  }
  
  return `
    <div class="wallet-connect">
      <button class="connect-btn">
        <span class="icon">🔗</span>
        Connect Wallet
      </button>
      <div class="wallet-options" style="display:none">
        <button class="wallet-option metaMask">MetaMask</button>
        <button class="wallet-option walletConnect">WalletConnect</button>
        <button class="wallet-option coinbase">Coinbase</button>
        <button class="wallet-option rainbow">Rainbow</button>
      </div>
    </div>
  `
}

export { TOKEN_GATE_MINIMUM, CLAWKER_ADDRESS }
