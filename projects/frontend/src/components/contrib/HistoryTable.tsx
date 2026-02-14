// src/components/contrib/HistoryTable.tsx
import React, { useState } from 'react'
import { ProofFile } from './ContributionForm'

export interface Contribution {
  id: string
  member: string
  task: string
  hours: number
  timestamp: string
  links?: string[]
  files?: ProofFile[]
}

interface HistoryTableProps {
  contributions: Contribution[]
}

const HistoryTable: React.FC<HistoryTableProps> = ({ contributions }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [previewFile, setPreviewFile] = useState<ProofFile | null>(null)

  const toggle = (id: string) => setExpandedId(expandedId === id ? null : id)

  const hasProof = (c: Contribution) =>
    (c.links && c.links.length > 0) || (c.files && c.files.length > 0)

  const getLinkLabel = (url: string) => {
    try {
      const host = new URL(url).hostname.replace('www.', '')
      if (host.includes('github')) return { label: 'GitHub', icon: '🐙', color: 'bg-gray-100 text-gray-700 border-gray-200' }
      if (host.includes('drive.google')) return { label: 'Drive', icon: '📁', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' }
      if (host.includes('figma')) return { label: 'Figma', icon: '🎨', color: 'bg-purple-50 text-purple-700 border-purple-200' }
      if (host.includes('notion')) return { label: 'Notion', icon: '📓', color: 'bg-gray-100 text-gray-700 border-gray-200' }
      if (host.includes('youtube') || host.includes('youtu.be')) return { label: 'YouTube', icon: '▶️', color: 'bg-red-50 text-red-700 border-red-200' }
      return { label: host, icon: '🔗', color: 'bg-blue-50 text-blue-700 border-blue-200' }
    } catch {
      return { label: 'Link', icon: '🔗', color: 'bg-blue-50 text-blue-700 border-blue-200' }
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Contribution History
            {contributions.length > 0 && (
              <span className="ml-auto bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {contributions.length}
              </span>
            )}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Task</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Proof</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {contributions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">
                    No contributions yet. Log your first one! 🚀
                  </td>
                </tr>
              ) : (
                contributions.map((contrib) => (
                  <React.Fragment key={contrib.id}>
                    {/* Main row */}
                    <tr
                      className={`hover:bg-blue-50/60 transition-colors ${hasProof(contrib) ? 'cursor-pointer' : ''}`}
                      onClick={() => hasProof(contrib) && toggle(contrib.id)}
                    >
                      {/* Member */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {contrib.member.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {contrib.member.length > 12
                              ? `${contrib.member.slice(0, 8)}...`
                              : contrib.member}
                          </span>
                        </div>
                      </td>

                      {/* Task */}
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-[200px]">
                        <span className="line-clamp-2">{contrib.task}</span>
                      </td>

                      {/* Hours */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          {contrib.hours}h
                        </span>
                      </td>

                      {/* Proof badges */}
                      <td className="px-6 py-4">
                        {hasProof(contrib) ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {contrib.files && contrib.files.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                                📎 {contrib.files.length}
                              </span>
                            )}
                            {contrib.links && contrib.links.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700 border border-cyan-200">
                                🔗 {contrib.links.length}
                              </span>
                            )}
                            <svg
                              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedId === contrib.id ? 'rotate-180' : ''}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300 italic">None</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {contrib.timestamp}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      </td>
                    </tr>

                    {/* Expanded proof row */}
                    {expandedId === contrib.id && hasProof(contrib) && (
                      <tr className="bg-indigo-50/60">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="space-y-3">

                            {/* Links */}
                            {contrib.links && contrib.links.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">🔗 Links</p>
                                <div className="flex flex-wrap gap-2">
                                  {contrib.links.map((url, i) => {
                                    const meta = getLinkLabel(url)
                                    return (
                                      <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border hover:opacity-80 transition-opacity ${meta.color}`}
                                      >
                                        <span>{meta.icon}</span>
                                        <span>{meta.label}</span>
                                        <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                      </a>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Files */}
                            {contrib.files && contrib.files.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">📎 Files</p>
                                <div className="flex flex-wrap gap-2">
                                  {contrib.files.map((file, i) => (
                                    <button
                                      key={i}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (file.type.startsWith('image/')) setPreviewFile(file)
                                      }}
                                      className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                    >
                                      {file.type.startsWith('image/') ? (
                                        <img src={file.dataUrl} alt={file.name} className="w-5 h-5 object-cover rounded" />
                                      ) : (
                                        <span>📄</span>
                                      )}
                                      <span className="max-w-[120px] truncate">{file.name}</span>
                                      <span className="text-gray-400">
                                        {(file.size / 1024).toFixed(0)}KB
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image preview modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-lg z-10"
            >
              ×
            </button>
            <img
              src={previewFile.dataUrl}
              alt={previewFile.name}
              className="w-full rounded-2xl shadow-2xl"
            />
            <p className="text-center text-white/70 text-sm mt-3">{previewFile.name}</p>
          </div>
        </div>
      )}
    </>
  )
}

export default HistoryTable
