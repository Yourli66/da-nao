import { useState } from 'react'
import { Check, Trash2, ChevronDown, ChevronUp, Plus, AlertTriangle, ArrowRight, X } from 'lucide-react'
import dayjs from 'dayjs'
import type { Task, Subtask } from '../db/types'
import { getQuadrant, QUADRANT_META } from '../db/types'
import { updateTask, deleteTask } from '../db'

export default function TaskCard({
  task,
  onChanged,
  showQuadrant = false,
}: {
  task: Task
  onChanged: () => void
  showQuadrant?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [newSubtask, setNewSubtask] = useState('')
  const [editingNextAction, setEditingNextAction] = useState(false)
  const [editingBlocker, setEditingBlocker] = useState(false)
  const [nextActionDraft, setNextActionDraft] = useState('')
  const [blockerDraft, setBlockerDraft] = useState('')
  const quadrant = getQuadrant(task)
  const meta = QUADRANT_META[quadrant]

  const doneCount = task.subtasks.filter((s) => s.done).length
  const totalCount = task.subtasks.length
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const toggleComplete = async () => {
    await updateTask({
      ...task,
      completed: !task.completed,
      completedAt: !task.completed ? Date.now() : undefined,
    })
    onChanged()
  }

  const handleDelete = async () => {
    await deleteTask(task.id)
    onChanged()
  }

  const setQuadrant = async (important: boolean, urgent: boolean) => {
    await updateTask({ ...task, important, urgent })
    onChanged()
  }

  const addSubtask = async () => {
    const title = newSubtask.trim()
    if (!title) return
    const sub: Subtask = { id: crypto.randomUUID(), title, done: false }
    await updateTask({ ...task, subtasks: [...task.subtasks, sub] })
    setNewSubtask('')
    onChanged()
  }

  const toggleSubtask = async (id: string) => {
    const subtasks = task.subtasks.map((s) =>
      s.id === id ? { ...s, done: !s.done } : s
    )
    await updateTask({ ...task, subtasks })
    onChanged()
  }

  const removeSubtask = async (id: string) => {
    const subtasks = task.subtasks.filter((s) => s.id !== id)
    await updateTask({ ...task, subtasks })
    onChanged()
  }

  const saveNextAction = async () => {
    await updateTask({ ...task, nextAction: nextActionDraft.trim() || undefined })
    setEditingNextAction(false)
    onChanged()
  }

  const saveBlocker = async () => {
    await updateTask({ ...task, blocker: blockerDraft.trim() || undefined })
    setEditingBlocker(false)
    onChanged()
  }

  const quadrants = [
    { important: true, urgent: true, label: '重要且紧急', color: '#EF4444' },
    { important: true, urgent: false, label: '重要不紧急', color: '#3B82F6' },
    { important: false, urgent: true, label: '紧急不重要', color: '#F59E0B' },
    { important: false, urgent: false, label: '不重要不紧急', color: '#6B7280' },
  ]

  return (
    <div className="bg-bg-card rounded-xl border border-border px-3 py-2.5 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleComplete}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
            task.completed
              ? 'bg-success border-success'
              : 'border-text-tertiary'
          }`}
        >
          {task.completed && <Check size={12} className="text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <span
            className={`text-sm ${task.completed ? 'line-through text-text-tertiary' : 'text-text'}`}
          >
            {task.title}
          </span>
          {totalCount > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex-1 h-1.5 bg-bg-input rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[9px] text-text-tertiary shrink-0">
                {doneCount}/{totalCount}
              </span>
            </div>
          )}
        </div>

        {task.blocker && !expanded && (
          <AlertTriangle size={14} className="text-delegate shrink-0" />
        )}

        <span className="text-[10px] text-text-tertiary shrink-0">
          {task.category === 'work' ? '工作' : '生活'}
        </span>

        {showQuadrant && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full text-white shrink-0"
            style={{ backgroundColor: meta.color }}
          >
            {meta.label}
          </span>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-text-tertiary shrink-0"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-border space-y-3">
          {/* 下一步行动 */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <ArrowRight size={12} className="text-primary" />
              <span className="text-[10px] font-semibold text-primary">下一步行动</span>
            </div>
            {editingNextAction ? (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={nextActionDraft}
                  onChange={(e) => setNextActionDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) saveNextAction() }}
                  placeholder="当下最具体的一个动作..."
                  autoFocus
                  className="flex-1 text-xs bg-bg-input rounded-lg px-2 py-1.5 outline-none text-text"
                />
                <button onClick={saveNextAction} className="text-xs text-primary px-2">保存</button>
              </div>
            ) : (
              <button
                onClick={() => { setNextActionDraft(task.nextAction ?? ''); setEditingNextAction(true) }}
                className={`text-xs w-full text-left px-2 py-1.5 rounded-lg ${
                  task.nextAction
                    ? 'bg-primary/5 text-text'
                    : 'bg-bg-input text-text-tertiary'
                }`}
              >
                {task.nextAction || '点击设置下一步...'}
              </button>
            )}
          </div>

          {/* 卡点 */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle size={12} className="text-delegate" />
              <span className="text-[10px] font-semibold text-delegate">卡点</span>
            </div>
            {editingBlocker ? (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={blockerDraft}
                  onChange={(e) => setBlockerDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) saveBlocker() }}
                  placeholder="被什么卡住了？"
                  autoFocus
                  className="flex-1 text-xs bg-bg-input rounded-lg px-2 py-1.5 outline-none text-text"
                />
                <button onClick={saveBlocker} className="text-xs text-primary px-2">保存</button>
              </div>
            ) : (
              <button
                onClick={() => { setBlockerDraft(task.blocker ?? ''); setEditingBlocker(true) }}
                className={`text-xs w-full text-left px-2 py-1.5 rounded-lg ${
                  task.blocker
                    ? 'bg-delegate/10 text-delegate border border-delegate/20'
                    : 'bg-bg-input text-text-tertiary'
                }`}
              >
                {task.blocker || '没有卡点'}
              </button>
            )}
          </div>

          {/* 子步骤 */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Check size={12} className="text-success" />
              <span className="text-[10px] font-semibold text-success">
                拆解步骤 {totalCount > 0 && `(${doneCount}/${totalCount})`}
              </span>
            </div>
            {task.subtasks.length > 0 && (
              <div className="space-y-1 mb-1.5">
                {task.subtasks.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-1.5 group">
                    <button
                      onClick={() => toggleSubtask(sub.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        sub.done
                          ? 'bg-success border-success'
                          : 'border-text-tertiary'
                      }`}
                    >
                      {sub.done && <Check size={10} className="text-white" />}
                    </button>
                    <span
                      className={`text-xs flex-1 ${sub.done ? 'line-through text-text-tertiary' : 'text-text'}`}
                    >
                      {sub.title}
                    </span>
                    <button
                      onClick={() => removeSubtask(sub.id)}
                      className="opacity-0 group-hover:opacity-100 text-text-tertiary"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) addSubtask() }}
                placeholder="添加步骤..."
                className="flex-1 text-xs bg-bg-input rounded-lg px-2 py-1.5 outline-none text-text placeholder:text-text-tertiary"
              />
              <button
                onClick={addSubtask}
                disabled={!newSubtask.trim()}
                className="w-7 h-7 rounded-lg bg-success/10 text-success flex items-center justify-center disabled:opacity-30"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* 四象限 */}
          <div>
            <p className="text-[10px] text-text-tertiary mb-1">分类到：</p>
            <div className="grid grid-cols-2 gap-1.5">
              {quadrants.map((q) => {
                const isActive = task.important === q.important && task.urgent === q.urgent
                return (
                  <button
                    key={q.label}
                    onClick={() => setQuadrant(q.important, q.urgent)}
                    className="text-xs px-2 py-1.5 rounded-lg transition-colors text-left"
                    style={{
                      backgroundColor: isActive ? q.color : undefined,
                      color: isActive ? 'white' : q.color,
                      border: `1.5px solid ${isActive ? q.color : q.color + '40'}`,
                    }}
                  >
                    {q.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 底部信息 */}
          <div className="flex items-center">
            <p className="text-[10px] text-text-tertiary">
              创建于 {dayjs(task.createdAt).format('MM/DD HH:mm')}
              {task.completedAt &&
                ` · 完成于 ${dayjs(task.completedAt).format('MM/DD HH:mm')}`}
            </p>
            <button
              onClick={handleDelete}
              className="text-[10px] px-2 py-0.5 rounded-full text-do flex items-center gap-0.5 ml-auto"
            >
              <Trash2 size={10} />
              删除
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
