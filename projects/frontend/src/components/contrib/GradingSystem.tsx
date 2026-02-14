import React, { useState } from 'react'

interface TeamMember {
  address: string
  totalHours: number
  percentage: number
  contributions: number
}

interface GradeResult {
  address: string
  contributionPercentage: number
  marks: number
  grade: string
  gradeColor: string
  remarks: string
}

interface GradingSystemProps {
  members: TeamMember[]
  totalProjectMarks: number
}

const GradingSystem: React.FC<GradingSystemProps> = ({ members, totalProjectMarks = 100 }) => {
  const [projectMarks, setProjectMarks] = useState(totalProjectMarks)
  const [showBreakdown, setShowBreakdown] = useState(false)

  // Grade calculation logic
  const calculateGrade = (marks: number): { grade: string; color: string; remarks: string } => {
    if (marks >= 90) {
      return { grade: 'A+', color: 'bg-green-500', remarks: 'Outstanding contribution' }
    } else if (marks >= 80) {
      return { grade: 'A', color: 'bg-green-400', remarks: 'Excellent work' }
    } else if (marks >= 70) {
      return { grade: 'B+', color: 'bg-blue-500', remarks: 'Very good effort' }
    } else if (marks >= 60) {
      return { grade: 'B', color: 'bg-blue-400', remarks: 'Good contribution' }
    } else if (marks >= 50) {
      return { grade: 'C+', color: 'bg-yellow-500', remarks: 'Satisfactory work' }
    } else if (marks >= 40) {
      return { grade: 'C', color: 'bg-yellow-400', remarks: 'Average contribution' }
    } else if (marks >= 30) {
      return { grade: 'D+', color: 'bg-orange-500', remarks: 'Below average' }
    } else if (marks >= 20) {
      return { grade: 'D', color: 'bg-orange-400', remarks: 'Minimal contribution' }
    } else {
      return { grade: 'F', color: 'bg-red-500', remarks: 'Insufficient work' }
    }
  }

  // Calculate individual marks based on contribution percentage
  const calculateMarks = (contributionPercentage: number): number => {
    // Base marks proportional to contribution
    let marks = (contributionPercentage / 100) * projectMarks

    // Bonus for high contributors (encourages going above fair share)
    if (contributionPercentage > 35) {
      marks += 5 // Bonus 5 marks
    }

    // Penalty for very low contributors
    if (contributionPercentage < 15) {
      marks -= 10 // Penalty 10 marks
    }

    // Cap at project marks
    return Math.min(Math.max(Math.round(marks), 0), projectMarks)
  }

  // Generate grade results for all members
  const gradeResults: GradeResult[] = members
    .map((member) => {
      const marks = calculateMarks(member.percentage)
      const gradeInfo = calculateGrade(marks)
      return {
        address: member.address,
        contributionPercentage: member.percentage,
        marks,
        grade: gradeInfo.grade,
        gradeColor: gradeInfo.color,
        remarks: gradeInfo.remarks,
      }
    })
    .sort((a, b) => b.marks - a.marks) // Sort by marks descending

  // Export to CSV for professor
  const exportGrades = () => {
    const csvContent = [
      ['Student Address', 'Contribution %', 'Marks (Out of 100)', 'Grade', 'Remarks'],
      ...gradeResults.map((r) => [
        r.address,
        r.contributionPercentage + '%',
        r.marks,
        r.grade,
        r.remarks,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ContribChain_Grades_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Fair Grading Report</h3>
              <p className="text-green-200 text-sm">Blockchain-verified contribution grades</p>
            </div>
          </div>
          <button
            onClick={exportGrades}
            className="px-4 py-2 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Project Marks Input */}
      <div className="p-6 bg-blue-50 border-b border-blue-100">
        <label className="block text-sm font-semibold text-blue-900 mb-2">
          Total Project Marks (out of 100)
        </label>
        <input
          type="number"
          value={projectMarks}
          onChange={(e) => setProjectMarks(Number(e.target.value))}
          min="0"
          max="100"
          className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"
        />
        <p className="text-xs text-blue-600 mt-2">
          ℹ️ Individual marks will be calculated based on blockchain-verified contribution percentage
        </p>
      </div>

      {/* Grading Methodology Toggle */}
      <div className="p-6 border-b border-gray-100">
        <button
          onClick={() => setShowBreakdown((!showBreakdown))}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-semibold text-gray-800">📖 Grading Methodology</span>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${showBreakdown ? 'rotate-180' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {showBreakdown && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm space-y-3">
            <div>
              <p className="font-semibold text-gray-800 mb-1">🔢 Base Calculation:</p>
              <p className="text-gray-700">
                Individual Marks = (Contribution % / 100) × Total Project Marks
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-800 mb-1">🎁 Bonus (High Contributors):</p>
              <p className="text-gray-700">+5 marks if contribution &gt; 35%</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800 mb-1">⚠️ Penalty (Low Contributors):</p>
              <p className="text-gray-700">-10 marks if contribution &lt; 15%</p>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <p className="font-semibold text-gray-800 mb-2">🎓 Grade Scale:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-12 h-6 bg-green-500 rounded text-white font-bold flex items-center justify-center">
                    A+
                  </span>
                  <span className="text-gray-700">90-100 marks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 h-6 bg-green-400 rounded text-white font-bold flex items-center justify-center">
                    A
                  </span>
                  <span className="text-gray-700">80-89 marks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 h-6 bg-blue-500 rounded text-white font-bold flex items-center justify-center">
                    B+
                  </span>
                  <span className="text-gray-700">70-79 marks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 h-6 bg-blue-400 rounded text-white font-bold flex items-center justify-center">
                    B
                  </span>
                  <span className="text-gray-700">60-69 marks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 h-6 bg-yellow-500 rounded text-white font-bold flex items-center justify-center">
                    C+
                  </span>
                  <span className="text-gray-700">50-59 marks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 h-6 bg-yellow-400 rounded text-white font-bold flex items-center justify-center">
                    C
                  </span>
                  <span className="text-gray-700">40-49 marks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 h-6 bg-orange-500 rounded text-white font-bold flex items-center justify-center">
                    D+
                  </span>
                  <span className="text-gray-700">30-39 marks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 h-6 bg-orange-400 rounded text-white font-bold flex items-center justify-center">
                    D
                  </span>
                  <span className="text-gray-700">20-29 marks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 h-6 bg-red-500 rounded text-white font-bold flex items-center justify-center">
                    F
                  </span>
                  <span className="text-gray-700">&lt; 20 marks</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grade Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Contribution %
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Marks / {projectMarks}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {gradeResults.map((result, index) => (
              <tr key={result.address} className="hover:bg-blue-50 transition-colors">
                {/* Rank */}
                <td className="px-6 py-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                        : index === 1
                        ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700'
                        : index === 2
                        ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {index + 1}
                  </div>
                </td>

                {/* Student */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {result.address.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {result.address.slice(0, 8)}...{result.address.slice(-4)}
                    </span>
                  </div>
                </td>

                {/* Contribution % */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">{result.contributionPercentage}%</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${result.contributionPercentage}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Marks */}
                <td className="px-6 py-4">
                  <span className="text-xl font-bold text-gray-900">{result.marks}</span>
                  <span className="text-sm text-gray-500"> / {projectMarks}</span>
                </td>

                {/* Grade */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-white font-bold text-lg ${result.gradeColor} shadow-md`}
                  >
                    {result.grade}
                  </span>
                </td>

                {/* Remarks */}
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700 italic">{result.remarks}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-blue-50 border-t border-blue-100">
        <div className="flex items-center gap-2 text-sm text-blue-800">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p>
            ✅ All grades are calculated from immutable blockchain contribution records. Export this report for
            professor verification.
          </p>
        </div>
      </div>
    </div>
  )
}

export default GradingSystem
