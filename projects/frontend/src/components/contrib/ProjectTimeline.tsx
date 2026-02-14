// src/components/contrib/ProjectTimeline.tsx
import React, { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Task {
  id: string
  title: string
  description: string
  assignedTo: string        // member address / email
  dueDate: string
  estimatedHours: number
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
}

export interface ProjectTimelineData {
  projectName: string
  startDate: string
  endDate: string
  tasks: Task[]
}

interface ProjectTimelineProps {
  isLeader: boolean
  memberAddresses: string[]   // list of team member identifiers
  data: ProjectTimelineData
  onChange: (data: ProjectTimelineData) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const priorityConfig = {
  high:   { label: 'High',   color: 'bg-red-100 text-red-700 border-red-200',       dot: 'bg-red-500' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  low:    { label: 'Low',    color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
}

const statusConfig = {
  'todo':        { label: 'To Do',       color: 'bg-gray-100 text-gray-600 border-gray-200',       bar: 'bg-gray-300',       icon: '⏳' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200',        bar: 'bg-blue-500',       icon: '🔄' },
  'done':        { label: 'Done',        color: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500', icon: '✅' },
}

const blankTask = (): Omit<Task, 'id'> => ({
  title: '',
  description: '',
  assignedTo: '',
  dueDate: '',
  estimatedHours: 1,
  status: 'todo',
  priority: 'medium',
})

const daysLeft = (endDate: string) => {
  if (!endDate) return null
  const diff = new Date(endDate).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const calcProgress = (tasks: Task[]) => {
  if (tasks.length === 0) return 0
  const done = tasks.filter((t) => t.status === 'done').length
  return Math.round((done / tasks.length) * 100)
}

// ─── Modal: Add / Edit Task ───────────────────────────────────────────────────
const TaskModal: React.FC<{
  task: Omit<Task, 'id'>
  memberAddresses: string[]
  onSave: (t: Omit<Task, 'id'>) => void
  onClose: () => void
}> = ({ task: initial, memberAddresses, onSave, onClose }) => {
  const [form, setForm] = useState<Omit<Task, 'id'>>(initial)
  const set = (k: keyof Omit<Task, 'id'>, v: any) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            {initial.title ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-4">

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Task Title *</label>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g., Design system architecture"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="What needs to be done?"
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all resize-none"
            />
          </div>

          {/* Assign + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Assign To *</label>
              <select
                value={form.assignedTo}
                onChange={(e) => set('assignedTo', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm bg-white transition-all"
              >
                <option value="">— Select member —</option>
                {memberAddresses.map((addr) => (
                  <option key={addr} value={addr}>
                    {addr.length > 20 ? `${addr.slice(0, 10)}...${addr.slice(-6)}` : addr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => set('priority', e.target.value as Task['priority'])}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm bg-white transition-all"
              >
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          {/* Due date + Hours row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Due Date *</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => set('dueDate', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Est. Hours</label>
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={form.estimatedHours}
                onChange={(e) => set('estimatedHours', Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm transition-all"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
            <div className="flex gap-2">
              {(['todo', 'in-progress', 'done'] as Task['status'][]).map((s) => (
                <button
                  key={s}
                  onClick={() => set('status', s)}
                  className={`flex-1 py-2 rounded-xl border-2 text-xs font-bold transition-all
                    ${form.status === s
                      ? `${statusConfig[s].color} border-current`
                      : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                >
                  {statusConfig[s].icon} {statusConfig[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!form.title || !form.assignedTo || !form.dueDate) return
                onSave(form)
              }}
              disabled={!form.title || !form.assignedTo || !form.dueDate}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Save Task
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  isLeader,
  memberAddresses,
  data,
  onChange,
}) => {
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState<Task['status'] | 'all'>('all')
  const [editingMeta, setEditingMeta] = useState(false)
  const [metaForm, setMetaForm] = useState({
    projectName: data.projectName,
    startDate: data.startDate,
    endDate: data.endDate,
  })

  const progress = calcProgress(data.tasks)
  const remaining = daysLeft(data.endDate)
  const totalEstHours = data.tasks.reduce((s, t) => s + t.estimatedHours, 0)
  const doneCount = data.tasks.filter((t) => t.status === 'done').length
  const inProgressCount = data.tasks.filter((t) => t.status === 'in-progress').length

  const filteredTasks = filterStatus === 'all'
    ? data.tasks
    : data.tasks.filter((t) => t.status === filterStatus)

  // ── Task CRUD ───────────────────────────────────────────────────────────────
  const addTask = (form: Omit<Task, 'id'>) => {
    onChange({ ...data, tasks: [...data.tasks, { ...form, id: Date.now().toString() }] })
    setShowModal(false)
  }

  const updateTask = (form: Omit<Task, 'id'>) => {
    if (!editingTask) return
    onChange({
      ...data,
      tasks: data.tasks.map((t) => t.id === editingTask.id ? { ...form, id: t.id } : t),
    })
    setEditingTask(null)
  }

  const deleteTask = (id: string) => {
    onChange({ ...data, tasks: data.tasks.filter((t) => t.id !== id) })
  }

  const cycleStatus = (task: Task) => {
    const cycle: Task['status'][] = ['todo', 'in-progress', 'done']
    const next = cycle[(cycle.indexOf(task.status) + 1) % cycle.length]
    onChange({ ...data, tasks: data.tasks.map((t) => t.id === task.id ? { ...t, status: next } : t) })
  }

  const saveMeta = () => {
    onChange({ ...data, ...metaForm })
    setEditingMeta(false)
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Project Header Card ───────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-800 to-blue-900 rounded-2xl p-6 text-white shadow-xl">

        {editingMeta && isLeader ? (
          /* Meta edit form (leader only) */
          <div className="space-y-3">
            <input
              value={metaForm.projectName}
              onChange={(e) => setMetaForm((p) => ({ ...p, projectName: e.target.value }))}
              placeholder="Project name"
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none text-sm focus:bg-white/15 transition-all"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/60 text-xs mb-1">Start Date</label>
                <input type="date" value={metaForm.startDate}
                  onChange={(e) => setMetaForm((p) => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white outline-none text-sm" />
              </div>
              <div>
                <label className="block text-white/60 text-xs mb-1">End Date</label>
                <input type="date" value={metaForm.endDate}
                  onChange={(e) => setMetaForm((p) => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white outline-none text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingMeta(false)} className="px-4 py-2 rounded-xl bg-white/10 text-white/70 text-sm hover:bg-white/20 transition-all">Cancel</button>
              <button onClick={saveMeta} className="px-4 py-2 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-all">Save</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-blue-300 text-xs uppercase tracking-widest mb-1">Project Timeline</p>
                <h3 className="text-2xl font-black text-white">
                  {data.projectName || 'Untitled Project'}
                </h3>
                {data.startDate && data.endDate && (
                  <p className="text-blue-200/70 text-sm mt-1">
                    {new Date(data.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' → '}
                    {new Date(data.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {remaining !== null && (
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                    remaining < 0 ? 'bg-red-500/20 border-red-400/30 text-red-300' :
                    remaining <= 3 ? 'bg-amber-500/20 border-amber-400/30 text-amber-300' :
                    'bg-green-500/20 border-green-400/30 text-green-300'
                  }`}>
                    {remaining < 0 ? `${Math.abs(remaining)}d overdue` : `${remaining}d left`}
                  </span>
                )}
                {isLeader && (
                  <button
                    onClick={() => setEditingMeta(true)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white/70 hover:text-white"
                    title="Edit project details"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-blue-200/80 font-medium">Overall Progress</span>
                <span className="text-white font-bold">{progress}%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[
                { label: 'Total Tasks', val: data.tasks.length, icon: '📋' },
                { label: 'Done', val: doneCount, icon: '✅' },
                { label: 'In Progress', val: inProgressCount, icon: '🔄' },
                { label: 'Est. Hours', val: `${totalEstHours}h`, icon: '⏱️' },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-lg">{s.icon}</p>
                  <p className="text-xl font-black text-white">{s.val}</p>
                  <p className="text-white/50 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Task Section ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">

        {/* Section header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h4 className="font-bold text-gray-800 text-lg">Tasks</h4>
            {/* Filter pills */}
            <div className="flex gap-1.5">
              {(['all', 'todo', 'in-progress', 'done'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                    filterStatus === s
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {s === 'all' ? `All (${data.tasks.length})` : s === 'in-progress' ? `In Progress (${data.tasks.filter(t => t.status === s).length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${data.tasks.filter(t => t.status === s).length})`}
                </button>
              ))}
            </div>
          </div>

          {isLeader && (
            <button
              onClick={() => { setEditingTask(null); setShowModal(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          )}
        </div>

        {/* Task list */}
        <div className="divide-y divide-gray-50">
          {filteredTasks.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-4xl mb-3">
                {isLeader ? '📋' : '👀'}
              </p>
              <p className="text-gray-500 font-medium">
                {isLeader
                  ? 'No tasks yet — click "Add Task" to get started!'
                  : 'No tasks assigned yet. Check back soon!'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const pri = priorityConfig[task.priority]
              const sta = statusConfig[task.status]
              const due = daysLeft(task.dueDate)
              const isOverdue = due !== null && due < 0 && task.status !== 'done'

              return (
                <div
                  key={task.id}
                  className={`px-6 py-4 hover:bg-gray-50/80 transition-colors group ${isOverdue ? 'border-l-4 border-red-400' : ''}`}
                >
                  <div className="flex items-start gap-4">

                    {/* Status toggle button */}
                    <button
                      onClick={() => cycleStatus(task)}
                      title="Click to cycle status"
                      className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all hover:scale-110
                        ${task.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' :
                          task.status === 'in-progress' ? 'bg-blue-500 border-blue-500 text-white' :
                          'border-gray-300 hover:border-blue-400'}`}
                    >
                      {task.status === 'done' && (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {task.status === 'in-progress' && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </button>

                    {/* Task content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`font-semibold text-sm ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {task.title}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${pri.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} />
                          {pri.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${sta.color}`}>
                          {sta.icon} {sta.label}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-gray-500 mb-2 line-clamp-1">{task.description}</p>
                      )}

                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Assignee */}
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white font-bold text-[9px]">
                            {task.assignedTo.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium">
                            {task.assignedTo.length > 20
                              ? `${task.assignedTo.slice(0, 10)}...`
                              : task.assignedTo}
                          </span>
                        </span>

                        {/* Due date */}
                        {task.dueDate && (
                          <span className={`text-xs font-medium flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {isOverdue ? `${Math.abs(due!)}d overdue` : new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}

                        {/* Hours */}
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {task.estimatedHours}h
                        </span>
                      </div>
                    </div>

                    {/* Leader actions */}
                    {isLeader && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => { setEditingTask(task); setShowModal(true) }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title="Edit task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Delete task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Leader hint */}
        {!isLeader && data.tasks.length > 0 && (
          <div className="px-6 py-3 bg-blue-50 border-t border-blue-100 text-xs text-blue-500 text-center">
            💡 Click the circle next to any task to update its status
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {showModal && (
        <TaskModal
          task={editingTask ? { ...editingTask } : blankTask()}
          memberAddresses={memberAddresses}
          onSave={editingTask ? updateTask : addTask}
          onClose={() => { setShowModal(false); setEditingTask(null) }}
        />
      )}
    </div>
  )
}

export default ProjectTimeline
export type { ProjectTimelineProps }
