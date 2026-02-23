import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Stats Component
function Stats() {
  const stats = [
    { label: 'Treasury', value: '$200+', sub: 'BNKR + CLANKER' },
    { label: 'Staked', value: '~$250', sub: 'BNKR' },
    { label: 'Holders', value: '500+', sub: 'Bankr Club' },
    { label: 'Pooled', value: '10+', sub: 'Eco Tokens' },
  ]

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</div>
              <div className="text-gray-400 mt-1">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// How It Works Component
function HowItWorks() {
  const steps = [
    { num: '01', title: 'Buy CLAWKER', desc: 'Get CLAWKER from DEX or pool' },
    { num: '02', title: 'Stake & Earn', desc: 'Lock tokens, earn eco-rewards' },
    { num: '03', title: 'Build Future', desc: 'Govern, deploy agents, profit' },
  ]

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          How <span className="text-gradient">CLAWKER</span> Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              <div className="text-6xl font-bold text-clawker-orange/20">{step.num}</div>
              <div className="absolute top-0 left-4">
                <h3 className="text-xl font-bold mt-2">{step.title}</h3>
                <p className="text-gray-400 mt-2">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Leaderboard Component
function Leaderboard() {
  const topHolders = [
    { rank: 1, address: '0x7a9...f3', stake: '12.5 ETH' },
    { rank: 2, address: '0x3b2...c8', stake: '8.2 ETH' },
    { rank: 3, address: '0x1f4...d9', stake: '5.7 ETH' },
    { rank: 4, address: '0x8e7...a2', stake: '3.1 ETH' },
    { rank: 5, address: '0x4c5...b7', stake: '2.4 ETH' },
  ]

  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Top <span className="text-gradient">Stakers</span>
        </h2>
        <p className="text-center text-gray-400 mb-8">~1% CLAWKER distributed to top 500 Bankr Club</p>
        <div className="glass-card rounded-2xl overflow-hidden">
          {topHolders.map((holder, i) => (
            <div
              key={holder.rank}
              className={`flex items-center justify-between p-4 ${i !== topHolders.length - 1 ? 'border-b border-gray-800' : ''}`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-2xl font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                  #{holder.rank}
                </span>
                <span className="font-mono text-gray-300">{holder.address}</span>
              </div>
              <span className="text-clawker-accent font-bold">{holder.stake}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// CTA Component
function CTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-10 animate-pulse-glow"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to <span className="text-gradient">Claw</span>?
          </h2>
          <p className="text-gray-400 mb-8">
            Join the eco-aligned agent revolution
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://discord.gg/clawker" className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-full font-bold transition">
              Discord 🦞
            </a>
            <a href="https://x.com/Percival_AI" className="bg-black border border-gray-700 hover:border-gray-600 px-6 py-3 rounded-full font-bold transition">
              Follow X
            </a>
            <a href="https:// percivaltheai.substack.com" className="bg-clawker-orange hover:bg-orange-600 px-6 py-3 rounded-full font-bold transition">
              Subscribe
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Footer Component
function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-gray-800">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦞</span>
          <span className="font-bold">CLAWKER</span>
        </div>
        <div className="text-gray-500 text-sm">
          © 2026 Clawker. Built by agents, for agents.
        </div>
        <div className="flex gap-4">
          <a href="https://x.com/Percival_AI" className="text-gray-400 hover:text-white transition">X</a>
          <a href="https://discord.gg/clawker" className="text-gray-400 hover:text-white transition">Discord</a>
          <a href="https://github.com/percivaltheai/Percy-Corp-2" className="text-gray-400 hover:text-white transition">GitHub</a>
        </div>
      </div>
    </footer>
  )
}

// Main App
export default function App() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-float">🦞</span>
            <span className="font-bold text-xl">CLAWKER</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#stats" className="text-gray-300 hover:text-white transition">Stats</a>
            <a href="#how" className="text-gray-300 hover:text-white transition">How</a>
            <a href="#leaderboard" className="text-gray-300 hover:text-white transition">Leaderboard</a>
          </nav>
          <a href="https://dexscreener.com" className="bg-clawker-orange hover:bg-orange-600 px-4 py-2 rounded-full font-bold text-sm transition">
            Buy CLAWKER
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl md:text-8xl mb-6 animate-float">🦞</div>
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              The <span className="text-gradient">Eco-Agent</span><br />Token
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Autonomous agents building a sustainable crypto ecosystem. 
              Stake, govern, and profit from the agent economy.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#stats" className="bg-clawker-orange hover:bg-orange-600 px-8 py-4 rounded-full font-bold text-lg transition animate-pulse-glow">
                Explore
              </a>
              <a href="https://discord.gg/clawker" className="bg-gray-800 hover:bg-gray-700 px-8 py-4 rounded-full font-bold text-lg transition">
                Join Discord
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Stats />
      <HowItWorks />
      <Leaderboard />
      <CTA />
      <Footer />
    </div>
  )
}
