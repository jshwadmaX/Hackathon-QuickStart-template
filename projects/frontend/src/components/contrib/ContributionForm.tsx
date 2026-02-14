// src/components/contrib/ContributionForm.tsx
import React, { useState, useRef } from 'react'

export interface ProofFile {
  name: string
  size: number
  type: string
  dataUrl: string
}

export interface ContributionFormData {
  task: string
  hours: number
  links: string[]
  files: ProofFile[]
}

interface ContributionFormProps {
  onSubmit: (data: ContributionFormData) => void
  loading?: boolean
}

const ContributionForm: React.FC<ContributionFormProps> = ({ onSubmit, loading }) => {
  const [task, setTask] = useState('')
  const [hours, setHours] = useState('')
  const [links, setLinks] = useState<string[]>([''])
  const [files, setFiles] = useState<ProofFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Link helpers ────────────────────────────────────────────────────────────
  const addLink = () => setLinks([...links, ''])
  const removeLink = (i: number) => setLinks(links.filter((_, idx) => idx !== i))
  const updateLink = (i: number, val: string) => {
    const updated = [...links]
    updated[i] = val
    setLinks(updated)
  }

  // ── File helpers ─────────────────────────────────────────────────────────────
  const processFiles = (rawFiles: FileList | null) => {
    if (!rawFiles) return
    Array.from(rawFiles).forEach((file) => {
      // 10 MB limit
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large (max 10 MB)`)
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        setFiles((prev) => [
          ...prev,
          {
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: e.target?.result as string,
          },
        ])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (i: number) => setFiles(files.filter((_, idx) => idx !== i))

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type === 'application/pdf') return '📄'
    if (type.includes('word')) return '📝'
    if (type.includes('zip') || type.includes('rar')) return '📦'
    return '📎'
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!task || !hours) return
    onSubmit({
      task,
      hours: Number(hours),
      links: links.filter((l) => l.trim() !== ''),
      files,
    })
    setTask('')
    setHours('')
    setLinks([''])
    setFiles([])
  }

  const hasProof = files.length > 0 || links.some((l) => l.trim() !== '')
  const canSubmit = task.trim() !== '' && hours !== '' && !loading

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Log Your Contribution
        </h3>
        <p className="text-blue-200 text-xs mt-0.5">Add proof to make it verifiable on-chain</p>
      </div>

      <div className="p-6 space-y-5">

        {/* Task Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Task Description <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g., Built prototype circuit"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm"
          />
        </div>

        {/* Hours Worked */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Hours Worked <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="e.g., 5"
            min="0"
            step="0.5"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm"
          />
        </div>

        {/* ── PROOF SECTION ─────────────────────────────────────────────── */}
        <div className="border-t border-gray-100 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm font-bold text-gray-700">Proof of Work</span>
            <span className="text-xs text-gray-400 font-normal">(optional but recommended)</span>
          </div>

          {/* Links */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              🔗 Links (GitHub, Drive, Figma, etc.)
            </label>
            <div className="space-y-2">
              {links.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => updateLink(i, e.target.value)}
                    placeholder="https://github.com/..."
                    className="flex-1 px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm"
                  />
                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLink(i)}
                      className="px-3 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all text-lg leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addLink}
              className="mt-2 flex items-center gap-1.5 text-indigo-500 hover:text-indigo-700 text-xs font-semibold transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add another link
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              📎 Files (screenshots, reports, PDFs)
            </label>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                processFiles(e.dataTransfer.files)
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all
                ${dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/40'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => processFiles(e.target.files)}
                accept="image/*,.pdf,.doc,.docx,.zip,.txt"
              />
              <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-blue-500">Click to upload</span> or drag & drop
              </p>
              <p className="text-xs text-gray-400 mt-1">Images, PDFs, Docs — max 10 MB each</p>
            </div>

            {/* Uploaded files list */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-xl">{getFileIcon(file.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                    </div>
                    {/* Preview thumbnail for images */}
                    {file.type.startsWith('image/') && (
                      <img
                        src={file.dataUrl}
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Proof badge */}
        {hasProof && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
            <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-green-700 font-medium">
              Proof attached — {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : ''}
              {files.length > 0 && links.filter(l => l.trim()).length > 0 ? ' + ' : ''}
              {links.filter(l => l.trim()).length > 0 ? `${links.filter(l => l.trim()).length} link${links.filter(l => l.trim()).length > 1 ? 's' : ''}` : ''}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 px-6 rounded-xl
            hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
            transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5 text-sm tracking-wide"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Logging to Blockchain...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              📝 Log Contribution
              {hasProof && <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">+ Proof</span>}
            </span>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          💡 Permanently recorded on Algorand blockchain
        </p>
      </div>
    </div>
  )
}

export default ContributionForm
