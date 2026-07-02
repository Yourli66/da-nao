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

  const setQuadrant = async (important: boolean, urgent: boolean) => {
    await updateTask({ ...task, important, urgent })
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
          <p className="text-[10px] text-text-tertiary mb-1.5">分类到：</p>
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
          <div className="flex items-center mt-2">
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
