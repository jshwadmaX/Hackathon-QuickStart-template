// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'

import ConnectWallet from './components/ConnectWallet'
import AppCalls from './components/AppCalls'
import SendAlgo from './components/SendAlgo'
import MintNFT from './components/MintNFT'
import CreateASA from './components/CreateASA'
import AssetOptIn from './components/AssetOptIn'

// ✅ REPLACED BANK WITH CONTRIBCHAIN
import ContribChain from './components/ContribChain'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [appCallsDemoModal, setAppCallsDemoModal] = useState<boolean>(false)
  const [sendAlgoModal, setSendAlgoModal] = useState<boolean>(false)
  const [mintNftModal, setMintNftModal] = useState<boolean>(false)
  const [createAsaModal, setCreateAsaModal] = useState<boolean>(false)
  const [assetOptInModal, setAssetOptInModal] = useState<boolean>(false)

  // ✅ RENAMED BANK MODAL → CONTRIBCHAIN MODAL
  const [contribChainModal, setContribChainModal] = useState<boolean>(false)

  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const toggleAppCallsModal = () => {
    setAppCallsDemoModal(!appCallsDemoModal)
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-teal-400 via-cyan-300 to-sky-400 relative">

      {/* Top-right wallet connect button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          data-test-id="connect-wallet"
          className="btn btn-accent px-5 py-2 text-sm font-medium rounded-full shadow-md"
          onClick={toggleWalletModal}
        >
          {activeAddress ? 'Wallet Connected' : 'Connect Wallet'}
        </button>
      </div>

      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="backdrop-blur-md bg-white/70 rounded-2xl p-8 shadow-xl max-w-5xl w-full">

          <h1 className="text-4xl font-extrabold text-teal-700 mb-6 text-center">
            Algorand Workshop Template
          </h1>

          <p className="text-gray-700 mb-8 text-center">
            Algorand operations in one-place.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* ========== EXISTING CARDS ========== */}

            <div className="card bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Send Algo</h2>
                <p>Send a payment transaction to any address.</p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-outline"
                    disabled={!activeAddress}
                    onClick={() => setSendAlgoModal(true)}
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Mint NFT (ARC-3)</h2>
                <p>Upload to IPFS via Pinata and mint a single NFT.</p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-outline"
                    disabled={!activeAddress}
                    onClick={() => setMintNftModal(true)}
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Create Token (ASA)</h2>
                <p>Mint a fungible ASA with custom supply and decimals.</p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-outline"
                    disabled={!activeAddress}
                    onClick={() => setCreateAsaModal(true)}
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>

            {/* ========== 🟢 NEW CONTRIBCHAIN CARD ========== */}

            <div className="card bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-xl">
              <div className="card-body">
                <h2 className="card-title">ContribChain</h2>
                <p>Track group project contributions on-chain.</p>

                <div className="card-actions justify-end">
                  <button
                    className="btn btn-outline"
                    disabled={!activeAddress}
                    onClick={() => setContribChainModal(true)}
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========== MODALS ========== */}

      <ConnectWallet
        openModal={openWalletModal}
        closeModal={toggleWalletModal}
      />

      <AppCalls
        openModal={appCallsDemoModal}
        setModalState={setAppCallsDemoModal}
      />

      <SendAlgo
        openModal={sendAlgoModal}
        closeModal={() => setSendAlgoModal(false)}
      />

      <MintNFT
        openModal={mintNftModal}
        closeModal={() => setMintNftModal(false)}
      />

      <CreateASA
        openModal={createAsaModal}
        closeModal={() => setCreateAsaModal(false)}
      />

      <AssetOptIn
        openModal={assetOptInModal}
        closeModal={() => setAssetOptInModal(false)}
      />

      {/* ✅ REPLACED BANK WITH CONTRIBCHAIN */}
      <ContribChain
        openModal={contribChainModal}
        closeModal={() => setContribChainModal(false)}
      />

    </div>
  )
}

export default Home

