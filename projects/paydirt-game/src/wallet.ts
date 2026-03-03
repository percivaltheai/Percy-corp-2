// Wallet Configuration for PAYDIRT
// Supports: MetaMask, WalletConnect, Coinbase Wallet, Rainbow, Trust, and more

import { http, createConfig } from 'wagmi'
import { mainnet, base } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// WalletConnect project ID (get free at https://cloud.walletconnect.com)
const walletConnectProjectId = 'YOUR_PROJECT_ID' // Replace or use env

export const config = createConfig({
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    walletConnect({
      projectId: walletConnectProjectId,
    }),
    coinbaseWallet({
      appName: 'PAYDIRT',
      appIconUrl: '/icon.png',
    }),
  ],
})

// Token gate check
export const TOKEN_GATE_MINIMUM = 50_000_000n * 10n ** 18n // 50M CLAWKER
export const CLAWKER_ADDRESS = '0x27D6Fd4aF3E19D4BBDF35755EDe6Df6614ef8B07' // Base mainnet
