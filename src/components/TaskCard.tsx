import { useState } from 'react'
import { Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import dayjs from 'dayjs'
import type { Task } from '../db/types'
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
  const quadrant = getQuadrant(task)
  const meta = QUADRANT_META[quadrant]

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

  const toggleFlag = async (flag: 'urgent' | 'important') => {
    await updateTask({ ...task, [flag]: !task[flag] })
    onChanged()
  }

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
        </div>

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
        <div className="mt-2 pt-2 border-t border-border">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => toggleFlag('important')}
              className={`text-xs px-2 py-1 rounded-full transition-colors ${
                task.important
                  ? 'bg-plan text-white'
                  : 'bg-bg-input text-text-secondary'
              }`}
            >
              {task.important ? '重要' : '不重要'}
            </button>
            <button
              onClick={() => toggleFlag('urgent')}
              className={`text-xs px-2 py-1 rounded-full transition-colors ${
                task.urgent
                  ? 'bg-do text-white'
                  : 'bg-bg-input text-text-secondary'
              }`}
            >
              {task.urgent ? '紧急' : '不紧急'}
            </button>
            <button
              onClick={handleDelete}
              className="text-xs px-2 py-1 rounded-full bg-bg-input text-do flex items-center gap-1 ml-auto"
            >
              <Trash2 size={12} />
              删除
            </button>
          </div>
          <p className="text-[10px] text-text-tertiary mt-1.5">
            创建于 {dayjs(task.createdAt).format('MM/DD HH:mm')}
            {task.completedAt &&
              ` · 完成于 ${dayjs(task.completedAt).format('MM/DD HH:mm')}`}
          </p>
        </div>
      )}
    </div>
  )
}
