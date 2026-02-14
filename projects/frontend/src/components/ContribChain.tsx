// src/components/ContribChain.tsx
import React, { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

import ContributionForm, { ContributionFormData } from './contrib/ContributionForm'
import StatsCards from './contrib/StatsCards'
import HistoryTable, { Contribution } from './contrib/HistoryTable'
import TeamMembers from './contrib/TeamMembers'
import AIAssistant from './contrib/AIAssistant'
import GradingSystem from './contrib/GradingSystem'
import ProjectTimeline, { ProjectTimelineData } from './contrib/ProjectTimeline'

interface ContribChainProps {
  openModal: boolean
  closeModal: () => void
}

interface TeamMember {
  address: string
  totalHours: number
  percentage: number
  contributions: number
}

const formatDate = () =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const computeTeamMembers = (contributions: Contribution[]): TeamMember[] => {
  const map: Record<string, { totalHours: number; contributions: number }> = {}
  contributions.forEach((c) => {
    if (!map[c.member]) map[c.member] = { totalHours: 0, contributions: 0 }
    map[c.member].totalHours += c.hours
    map[c.member].contributions += 1
  })
  const totalHours = Object.values(map).reduce((sum, m) => sum + m.totalHours, 0)
  return Object.entries(map).map(([address, data]) => ({
    address,
    totalHours: data.totalHours,
    contributions: data.contributions,
    percentage: totalHours > 0 ? Math.round((data.totalHours / totalHours) * 100) : 0,
  }))
}

const ContribChain: React.FC<ContribChainProps> = ({ openModal, closeModal }) => {
  const { activeAddress } = useWallet()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timeline' | 'ai-chat' | 'grading'>('dashboard')
  const [contributions, setContributions] = useState<Contribution[]>([])

  // ── Timeline state ─────────────────────────────────────────────────────────
  const [timelineData, setTimelineData] = useState<ProjectTimelineData>({
    projectName: '',
    startDate: '',
    endDate: '',
    tasks: [],
  })

  // Read role from localStorage (set during TeamSetup)
  const teamRole = localStorage.getItem('teamRole') || 'member'
  const isLeader = teamRole === 'leader'

  const teamMembers = computeTeamMembers(contributions)
  const totalHours = contributions.reduce((sum, c) => sum + c.hours, 0)
  const myAddress = activeAddress || 'Guest'
  const myHours = contributions.filter((c) => c.member === myAddress).reduce((sum, c) => sum + c.hours, 0)
  const myPercentage = totalHours > 0 ? Math.round((myHours / totalHours) * 100) : 0
  const uniqueMembers = new Set(contributions.map((c) => c.member)).size

  // All known member identifiers for task assignment
  const allMemberAddresses = Array.from(
    new Set([
      ...(activeAddress ? [activeAddress] : []),
      ...teamMembers.map((m) => m.address),
    ])
  )

  // Progress stats for dashboard summary
  const timelineTasks = timelineData.tasks
  const doneTasks = timelineTasks.filter((t) => t.status === 'done').length
  const timelineProgress = timelineTasks.length > 0
    ? Math.round((doneTasks / timelineTasks.length) * 100)
    : 0

  const handleLogContribution = async (data: ContributionFormData) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    const newContrib: Contribution = {
      id: Date.now().toString(),
      member: activeAddress || 'Guest',
      task: data.task,
      hours: data.hours,
      timestamp: formatDate(),
      links: data.links,
      files: data.files,
    }
    setContributions((prev) => [newContrib, ...prev])
    setLoading(false)
  }

  if (!openModal) return null

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'timeline',  label: '📅 Timeline', badge: timelineTasks.length > 0 ? `${timelineProgress}%` : null },
    { id: 'ai-chat',   label: '🤖 AI Coordinator', pulse: true },
    { id: 'grading',   label: '🎓 Fair Grading' },
  ] as const

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
              <p className="text-gray-600 mt-1">Track group project contributions on Algorand blockchain</p>
            </div>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 font-semibold transition-all whitespace-nowrap relative flex items-center gap-2 ${
                  activeTab === tab.id
                    ? tab.id === 'timeline' ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : tab.id === 'ai-chat'  ? 'text-purple-600 border-b-2 border-purple-600'
                    : tab.id === 'grading'  ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {'badge' in tab && tab.badge && (
                  <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                    {tab.badge}
                  </span>
                )}
                {'pulse' in tab && tab.pulse && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* ── Dashboard Tab ─────────────────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            <>
              <StatsCards
                totalContributions={contributions.length}
                totalHours={totalHours}
                yourPercentage={myPercentage}
                teamSize={uniqueMembers || (activeAddress ? 1 : 0)}
              />

              {/* Timeline mini-preview on dashboard */}
              {timelineTasks.length > 0 && (
                <div
                  className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => setActiveTab('timeline')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      <span className="font-bold text-gray-800">{timelineData.projectName || 'Project Timeline'}</span>
                      {isLeader && (
                        <span className="px-2 py-0.5 bg-yellow-100 border border-yellow-300 text-yellow-700 text-xs font-bold rounded-full">LEADER</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-indigo-600">{timelineProgress}% complete</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="h-2.5 bg-indigo-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-700"
                      style={{ width: `${timelineProgress}%` }}
                    />
                  </div>
                  <div className="flex gap-4 mt-2.5 text-xs text-gray-500">
                    <span>✅ {doneTasks} done</span>
                    <span>🔄 {timelineTasks.filter(t => t.status === 'in-progress').length} in progress</span>
                    <span>⏳ {timelineTasks.filter(t => t.status === 'todo').length} to do</span>
                    <span className="ml-auto text-indigo-500 font-semibold">View full timeline →</span>
                  </div>
                </div>
              )}

              {/* Empty timeline prompt for leader */}
              {timelineTasks.length === 0 && isLeader && (
                <div
                  className="mb-6 border-2 border-dashed border-indigo-200 rounded-2xl p-5 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-all"
                  onClick={() => setActiveTab('timeline')}
                >
                  <p className="text-2xl mb-1">📅</p>
                  <p className="text-indigo-600 font-semibold text-sm">Set up your project timeline</p>
                  <p className="text-gray-400 text-xs mt-0.5">As team leader, you can create tasks and assign them to members</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                  <ContributionForm onSubmit={handleLogContribution} loading={loading} />
                  <TeamMembers members={teamMembers} />
                </div>
                <div className="lg:col-span-2">
                  <HistoryTable contributions={contributions} />
                </div>
              </div>

              {contributions.length === 0 && (
                <div className="mt-6 text-center py-6 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-blue-500 font-medium">
                    🚀 No contributions yet — fill in the form and click <strong>Log Contribution</strong>!
                  </p>
                </div>
              )}
            </>
          )}

          {/* ── Timeline Tab ──────────────────────────────────────────────── */}
          {activeTab === 'timeline' && (
            <ProjectTimeline
              isLeader={isLeader}
              memberAddresses={allMemberAddresses}
              data={timelineData}
              onChange={setTimelineData}
            />
          )}

          {/* ── AI Chat Tab ───────────────────────────────────────────────── */}
          {activeTab === 'ai-chat' && (
            <AIAssistant teamData={{ members: teamMembers, contributions }} />
          )}

          {/* ── Grading Tab ───────────────────────────────────────────────── */}
          {activeTab === 'grading' && (
            <GradingSystem members={teamMembers} totalProjectMarks={100} />
          )}

        </div>
      </div>
    </div>
  )
}

export default ContribChain
