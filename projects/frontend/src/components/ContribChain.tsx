import React, { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

import ContributionForm from './contrib/ContributionForm'
import StatsCards from './contrib/StatsCards'
import HistoryTable from './contrib/HistoryTable'
import TeamMembers from './contrib/TeamMembers'
import AIAssistant from './contrib/AIAssistant'
// ✅ ADD THIS IMPORT
import GradingSystem from './contrib/GradingSystem'

interface ContribChainProps {
  openModal: boolean
  closeModal: () => void
}

const ContribChain: React.FC<ContribChainProps> = ({ openModal, closeModal }) => {
  const { activeAddress } = useWallet()
  const [loading, setLoading] = useState(false)
  // ✅ UPDATE TAB STATE TO INCLUDE GRADING
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai-chat' | 'grading'>('dashboard')

  const mockContributions = [
    {
      id: '1',
      member: activeAddress || 'ADDR1...',
      task: 'Built prototype circuit',
      hours: 8,
      timestamp: 'Feb 10, 2026',
    },
    {
      id: '2',
      member: 'ADDR2...',
      task: 'Completed literature review',
      hours: 5,
      timestamp: 'Feb 9, 2026',
    },
  ]

  const mockTeamMembers = [
    {
      address: activeAddress || 'ADDR1...',
      totalHours: 13,
      percentage: 52,
      contributions: 3,
    },
    {
      address: 'ADDR2...',
      totalHours: 8,
      percentage: 32,
      contributions: 2,
    },
    {
      address: 'ADDR3...',
      totalHours: 4,
      percentage: 16,
      contributions: 1,
    },
  ]

  const handleLogContribution = async (task: string, hours: number) => {
    setLoading(true)
    console.log('Logging:', { task, hours })
    setTimeout(() => {
      setLoading(false)
      alert('Contribution logged! ✅')
    }, 2000)
  }

  if (!openModal) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl shadow-2xl max-w-7xl w-full p-8 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                ContribChain Dashboard
              </h2>
              <p className="text-gray-600 mt-1">
                Track group project contributions on Algorand blockchain
              </p>
            </div>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ✅ UPDATED TAB NAVIGATION WITH GRADING */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('ai-chat')}
              className={`px-6 py-3 font-semibold transition-all relative whitespace-nowrap ${
                activeTab === 'ai-chat'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🤖 AI Coordinator
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            </button>
            <button
              onClick={() => setActiveTab('grading')}
              className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
                activeTab === 'grading'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🎓 Fair Grading
            </button>
          </div>

          {/* ✅ CONDITIONAL RENDERING WITH GRADING TAB */}
          {activeTab === 'dashboard' && (
            <>
              <StatsCards
                totalContributions={6}
                totalHours={25}
                yourPercentage={52}
                teamSize={3}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                  <ContributionForm onSubmit={handleLogContribution} loading={loading} />
                  <TeamMembers members={mockTeamMembers} />
                </div>

                <div className="lg:col-span-2">
                  <HistoryTable contributions={mockContributions} />
                </div>
              </div>
            </>
          )}

          {activeTab === 'ai-chat' && (
            <AIAssistant
              teamData={{
                members: mockTeamMembers,
                contributions: mockContributions,
              }}
            />
          )}

          {activeTab === 'grading' && (
            <GradingSystem members={mockTeamMembers} totalProjectMarks={100} />
          )}

        </div>
      </div>
    </div>
  )
}

export default ContribChain
