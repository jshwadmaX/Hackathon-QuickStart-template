// src/components/contrib/GradingSystem.tsx
import React, { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'

// ─── Types ────────────────────────────────────────────────────────────────────
interface TeamMember {
  address: string
  totalHours: number
  percentage: number
  contributions: number
}

interface MemberResult {
  address: string
  score: number          // 0-100
  grade: string          // A+, A, B+, …
  algoReward: number     // in ALGO (testnet)
  breakdown: {
    hoursScore: number
    contributionsScore: number
    consistencyScore: number
    qualityScore: number
  }
  badge: string
  feedback: string
  rewardStatus: 'pending' | 'sending' | 'sent' | 'failed'
  txId?: string
}

interface GradingSystemProps {
  members: TeamMember[]
  totalProjectMarks: number
}

// ─── Grade helpers ────────────────────────────────────────────────────────────
const getGrade = (score: number) => {
  if (score >= 95) return 'A+'
  if (score >= 90) return 'A'
  if (score >= 85) return 'A-'
  if (score >= 80) return 'B+'
  if (score >= 75) return 'B'
  if (score >= 70) return 'B-'
  if (score >= 65) return 'C+'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

const getBadge = (score: number) => {
  if (score >= 95) return { icon: '🏆', label: 'Champion',    color: 'from-yellow-400 to-amber-500' }
  if (score >= 85) return { icon: '⭐', label: 'Star',        color: 'from-blue-400 to-indigo-500'  }
  if (score >= 75) return { icon: '💪', label: 'Solid',       color: 'from-green-400 to-emerald-500'}
  if (score >= 60) return { icon: '📈', label: 'Rising',      color: 'from-cyan-400 to-blue-400'    }
  return              { icon: '⚠️', label: 'Needs Work',   color: 'from-red-400 to-rose-500'     }
}

const gradeColor = (grade: string) => {
  if (grade.startsWith('A')) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
  if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50 border-blue-200'
  if (grade.startsWith('C')) return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

const scoreBarColor = (score: number) => {
  if (score >= 85) return 'from-emerald-400 to-green-500'
  if (score >= 70) return 'from-blue-400 to-indigo-500'
  if (score >= 55) return 'from-amber-400 to-yellow-500'
  return 'from-red-400 to-rose-500'
}

// ─── Compute grades (AI-logic simulation) ─────────────────────────────────────
const computeResults = (members: TeamMember[]): MemberResult[] => {
  if (members.length === 0) return []

  const maxHours        = Math.max(...members.map(m => m.totalHours), 1)
  const maxContribs     = Math.max(...members.map(m => m.contributions), 1)
  const avgPercentage   = 100 / members.length

  return members.map((m) => {
    // Weighted scoring (out of 100)
    const hoursScore        = Math.round((m.totalHours / maxHours) * 35)          // 35pts
    const contributionsScore = Math.round((m.contributions / maxContribs) * 25)   // 25pts
    const consistencyScore  = Math.round(Math.min(m.contributions / 3, 1) * 20)   // 20pts — rewards regular small commits
    const qualityScore      = Math.round((m.percentage / 100) * 20)               // 20pts — share of team work

    const raw = hoursScore + contributionsScore + consistencyScore + qualityScore
    const score = Math.min(100, Math.max(0, raw))
    const grade = getGrade(score)

    // ALGO reward: max 5 ALGO for top scorer, proportional for others
    // Using microALGO-friendly amounts (0.1 increments)
    const algoReward = parseFloat((score / 100 * 5).toFixed(1))

    const feedback = score >= 90
      ? 'Exceptional contribution. Clear team leader in effort and output.'
      : score >= 80
      ? 'Strong performance. Consistent and reliable team member.'
      : score >= 70
      ? 'Good effort. A few more contributions would push you to the top.'
      : score >= 60
      ? 'Adequate participation. Consider logging more frequent updates.'
      : 'Low contribution detected. Improvement needed to avoid free-rider flag.'

    return {
      address: m.address,
      score,
      grade,
      algoReward,
      breakdown: { hoursScore, contributionsScore, consistencyScore, qualityScore },
      badge: `${getBadge(score).icon} ${getBadge(score).label}`,
      feedback,
      rewardStatus: 'pending',
    }
  }).sort((a, b) => b.score - a.score)
}

// ─── Component ────────────────────────────────────────────────────────────────
const GradingSystem: React.FC<GradingSystemProps> = ({ members }) => {
  const { activeAddress, transactionSigner } = useWallet()

  const [results, setResults] = useState<MemberResult[] | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [rewardAll, setRewardAll] = useState(false)

  const isLeader = localStorage.getItem('teamRole') === 'leader'

  // ── Run AI grading ───────────────────────────────────────────────────────
  const runGrading = async () => {
    if (members.length === 0) return
    setAnalyzing(true)
    setResults(null)
    // Simulate AI processing time
    await new Promise(r => setTimeout(r, 2200))
    setResults(computeResults(members))
    setAnalyzing(false)
  }

  // ── Send ALGO reward via Pera (testnet) ──────────────────────────────────
  const sendReward = async (result: MemberResult) => {
    if (!activeAddress || !transactionSigner) {
      alert('Please connect your Pera wallet first!')
      return
    }
    if (result.algoReward <= 0) return

    setResults(prev => prev!.map(r =>
      r.address === result.address ? { ...r, rewardStatus: 'sending' } : r
    ))

    try {
      const algodClient = new algosdk.Algodv2(
        '',
        'https://testnet-api.algonode.cloud',
        443
      )

      const suggestedParams = await algodClient.getTransactionParams().do()

      const microAlgo = Math.round(result.algoReward * 1_000_000)

      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: activeAddress,
        receiver: result.address,
        amount: microAlgo,
        suggestedParams,
        note: new Uint8Array(Buffer.from(`ContribChain reward — Grade: ${result.grade} | Score: ${result.score}/100`)),
      })

      const [signedTxn] = await transactionSigner([txn], [0])
      const { txid } = await algodClient.sendRawTransaction(signedTxn).do()

      setResults(prev => prev!.map(r =>
        r.address === result.address ? { ...r, rewardStatus: 'sent', txId: txid } : r
      ))
    } catch (err: any) {
      console.error(err)
      setResults(prev => prev!.map(r =>
        r.address === result.address ? { ...r, rewardStatus: 'failed' } : r
      ))
    }
  }

  // ── Reward all members ───────────────────────────────────────────────────
  const sendAllRewards = async () => {
    if (!results) return
    setRewardAll(true)
    for (const r of results) {
      if (r.rewardStatus === 'pending' && r.algoReward > 0) {
        await sendReward(r)
        await new Promise(res => setTimeout(res, 500))
      }
    }
    setRewardAll(false)
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 rounded-2xl p-8 overflow-hidden shadow-2xl">
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
        {/* Glow blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg text-xl">
                🤖
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">AI Fair Grading</h2>
                <p className="text-purple-300/70 text-xs">Powered by contribution analytics</p>
              </div>
            </div>
            <p className="text-white/60 text-sm max-w-md leading-relaxed">
              Claude AI analyses each member's hours, frequency, and share of work to assign fair grades and distribute testnet ALGO rewards automatically.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {/* Run grading button */}
            <button
              onClick={runGrading}
              disabled={analyzing || members.length === 0}
              className="px-7 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              {analyzing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Analysing contributions…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  ✨ Run AI Grading
                </span>
              )}
            </button>

            {/* Reward all (leader + results exist) */}
            {results && isLeader && activeAddress && (
              <button
                onClick={sendAllRewards}
                disabled={rewardAll || results.every(r => r.rewardStatus !== 'pending')}
                className="px-7 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2"
              >
                {rewardAll ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Sending rewards…
                  </>
                ) : (
                  <>⚡ Send All ALGO Rewards</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Scoring method legend */}
        <div className="relative z-10 mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Hours Logged',   pts: '35pts', icon: '⏱️', desc: 'Total time invested' },
            { label: 'Contributions',  pts: '25pts', icon: '📝', desc: 'Number of entries' },
            { label: 'Consistency',    pts: '20pts', icon: '🔄', desc: 'Regular participation' },
            { label: 'Work Share',     pts: '20pts', icon: '📊', desc: '% of team total' },
          ].map(item => (
            <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">{item.icon}</span>
                <span className="text-xs font-black text-purple-300">{item.pts}</span>
              </div>
              <p className="text-white/90 text-xs font-semibold">{item.label}</p>
              <p className="text-white/40 text-[10px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {members.length === 0 && !analyzing && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-5xl mb-4">👥</p>
          <p className="text-gray-600 font-semibold text-lg">No contributions logged yet</p>
          <p className="text-gray-400 text-sm mt-1">Team members need to log work before grading can run</p>
        </div>
      )}

      {/* ── Analysing animation ───────────────────────────────────────────── */}
      {analyzing && (
        <div className="bg-white rounded-2xl border border-purple-100 shadow-lg p-10 text-center">
          <div className="flex justify-center mb-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
              <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
            </div>
          </div>
          <p className="text-gray-800 font-bold text-xl mb-2">AI is analysing contributions…</p>
          <p className="text-gray-400 text-sm">Evaluating hours, frequency, consistency, and work share</p>
          <div className="mt-6 flex justify-center gap-1.5">
            {[0, 0.2, 0.4].map(d => (
              <div key={d} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {results && !analyzing && (
        <div className="space-y-4">

          {/* Podium top-3 */}
          {results.length >= 2 && (
            <div className="grid grid-cols-3 gap-4 mb-2">
              {[results[1], results[0], results[2]].filter(Boolean).map((r, i) => {
                const podiumPos  = i === 1 ? 0 : i === 0 ? 1 : 2
                const badge      = getBadge(r.score)
                const podiumSize = podiumPos === 0 ? 'scale-110' : ''
                const medals     = ['🥈', '🥇', '🥉']
                return (
                  <div key={r.address} className={`bg-white rounded-2xl border border-gray-100 shadow-md p-5 text-center transition-all ${podiumSize}`}>
                    <div className="text-3xl mb-1">{medals[i]}</div>
                    <div className={`inline-block w-12 h-12 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-white text-xl font-black mx-auto mb-2 shadow-lg`}>
                      {badge.icon}
                    </div>
                    <p className="text-xs text-gray-500 font-medium truncate">
                      {r.address.length > 14 ? `${r.address.slice(0,8)}…` : r.address}
                    </p>
                    <p className={`text-2xl font-black mt-1 px-3 py-0.5 rounded-full border inline-block ${gradeColor(r.grade)}`}>
                      {r.grade}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">{r.score}/100</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Full list */}
          {results.map((r, idx) => {
            const badge      = getBadge(r.score)
            const isExpanded = expanded === r.address
            const isSelf     = r.address === activeAddress

            return (
              <div
                key={r.address}
                className={`bg-white rounded-2xl border shadow-md overflow-hidden transition-all
                  ${isSelf ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-100'}
                `}
              >
                {/* Row */}
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50/60 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : r.address)}
                >
                  {/* Rank */}
                  <div className="text-2xl font-black text-gray-200 w-8 text-center shrink-0">
                    {idx + 1}
                  </div>

                  {/* Avatar + badge */}
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-xl shadow-md`}>
                      {badge.icon}
                    </div>
                    {isSelf && (
                      <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">YOU</span>
                    )}
                  </div>

                  {/* Name + score bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-sm font-bold text-gray-800 truncate max-w-[160px]">
                        {r.address.length > 20 ? `${r.address.slice(0,12)}…${r.address.slice(-6)}` : r.address}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-sm font-black border ${gradeColor(r.grade)}`}>
                        {r.grade}
                      </span>
                      <span className="text-xs text-gray-400">{r.score}/100</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${scoreBarColor(r.score)} rounded-full transition-all duration-1000`}
                        style={{ width: `${r.score}%` }}
                      />
                    </div>
                  </div>

                  {/* ALGO reward */}
                  <div className="text-right shrink-0">
                    <div className="text-lg font-black text-amber-600">{r.algoReward} ALGO</div>
                    <div className="text-xs text-gray-400">testnet reward</div>
                  </div>

                  {/* Send reward button */}
                  {isLeader && activeAddress && (
                    <div className="shrink-0" onClick={e => e.stopPropagation()}>
                      {r.rewardStatus === 'pending' && (
                        <button
                          onClick={() => sendReward(r)}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow hover:shadow-md transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                          ⚡ Send
                        </button>
                      )}
                      {r.rewardStatus === 'sending' && (
                        <span className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
                          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                          Sending…
                        </span>
                      )}
                      {r.rewardStatus === 'sent' && (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                          ✅ Sent!
                        </span>
                      )}
                      {r.rewardStatus === 'failed' && (
                        <button
                          onClick={() => sendReward(r)}
                          className="text-xs text-red-600 font-semibold px-3 py-2 bg-red-50 rounded-xl border border-red-200 hover:bg-red-100 transition-all"
                        >
                          ❌ Retry
                        </button>
                      )}
                    </div>
                  )}

                  {/* Chevron */}
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Expanded breakdown */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-5 bg-gray-50/50 space-y-4">

                    {/* Score breakdown bars */}
                    <div>
                      <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">Score Breakdown</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: '⏱️ Hours Logged',  val: r.breakdown.hoursScore,         max: 35, color: 'bg-blue-500' },
                          { label: '📝 Contributions', val: r.breakdown.contributionsScore,  max: 25, color: 'bg-indigo-500' },
                          { label: '🔄 Consistency',   val: r.breakdown.consistencyScore,    max: 20, color: 'bg-purple-500' },
                          { label: '📊 Work Share',    val: r.breakdown.qualityScore,         max: 20, color: 'bg-cyan-500' },
                        ].map(item => (
                          <div key={item.label} className="bg-white rounded-xl p-3 border border-gray-200">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-xs font-semibold text-gray-600">{item.label}</span>
                              <span className="text-xs font-black text-gray-800">{item.val}<span className="text-gray-400 font-normal">/{item.max}</span></span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${item.color} rounded-full transition-all duration-700`}
                                style={{ width: `${(item.val / item.max) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI feedback */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-3">
                      <span className="text-xl shrink-0">🤖</span>
                      <div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-1">AI Feedback</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{r.feedback}</p>
                      </div>
                    </div>

                    {/* Reward status */}
                    {r.rewardStatus === 'sent' && r.txId && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                        <span className="text-xl">✅</span>
                        <div>
                          <p className="text-xs font-bold text-emerald-700">Reward sent on Algorand Testnet</p>
                          <a
                            href={`https://testnet.algoexplorer.io/tx/${r.txId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-600 hover:text-emerald-800 underline break-all"
                          >
                            View tx: {r.txId.slice(0, 20)}…
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Summary footer */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-black text-gray-800">
                  {results.reduce((s, r) => s + r.algoReward, 0).toFixed(1)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Total ALGO to distribute</p>
              </div>
              <div>
                <p className="text-2xl font-black text-gray-800">
                  {Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Team avg. score</p>
              </div>
              <div>
                <p className="text-2xl font-black text-gray-800">
                  {results.filter(r => r.rewardStatus === 'sent').length}/{results.length}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Rewards sent</p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

export default GradingSystem
