// src/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'

import ContribChain from "./components/ContribChain";
import Account from "./components/Account";
import ConnectWallet from "./components/ConnectWallet";

const Home: React.FC = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [contribChainModal, setContribChainModal] = useState<boolean>(false)

  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ContribChain
            </span>
          </div>

          <button
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-md
              ${activeAddress
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white'
              }`}
            onClick={toggleWalletModal}
          >
            {activeAddress
              ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}`
              : 'Connect Wallet'}
          </button>
        </div>
      </header>

      {/* HERO */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">

          <h1 className="text-5xl font-extrabold mb-6 text-gray-800">
            Decentralized Group Contribution Platform
          </h1>

          <p className="text-xl text-gray-600 mb-10">
            Track student contributions on Algorand with transparent, immutable records.
          </p>

          <button
            onClick={() => setContribChainModal(true)}
            disabled={!activeAddress}
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50"
          >
            Launch ContribChain
          </button>
        </div>
      </div>

      {/* MAIN FEATURE CARD */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-2xl p-8 shadow-xl">

          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            What ContribChain Does
          </h2>

          {/* DESCRIPTION */}
          <p className="text-blue-100 mb-6 leading-relaxed bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-xl">
            Track group project contributions with immutable blockchain records.
            AI-powered chatbot provides conflict resolution, stress management, and task optimization.
          </p>

          {/* FEATURE CARDS */}
          <div className="grid md:grid-cols-3 gap-6">

            <div className="p-4 border rounded-xl">
              <h3 className="font-bold mb-2">Immutable Records</h3>
              <p className="text-sm text-gray-600">
                Every contribution stored on Algorand blockchain
              </p>
            </div>

            <div className="p-4 border rounded-xl">
              <h3 className="font-bold mb-2">Fair Grading</h3>
              <p className="text-sm text-gray-600">
                Professors evaluate based on real proof
              </p>
            </div>

            <div className="p-4 border rounded-xl">
              <h3 className="font-bold mb-2">Fraud Detection</h3>
              <p className="text-sm text-gray-600">
                Identify free riders in teams
              </p>
            </div>

          </div>

          {/* EXTRA FEATURES */}
          <div className="mt-6 flex flex-col gap-3 text-sm text-gray-700">

            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
              AI team coordinator chatbot
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Automated fair grading (A+ to F)
            </div>

          </div>

        </div>
      </div>

      {/* MODALS */}
      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      <ContribChain openModal={contribChainModal} closeModal={() => setContribChainModal(false)} />

    </div>
  )
}

export default Home
