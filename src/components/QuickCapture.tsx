import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Task } from '../db/types'
import { addTask } from '../db'

export default function QuickCapture({ onAdded }: { onAdded: () => void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<'work' | 'life'>('work')

  const handleSubmit = async () => {
    const trimmed = title.trim()
    if (!trimmed) return

    const task: Task = {
      id: crypto.randomUUID(),
      title: trimmed,
      urgent: false,
      important: false,
      completed: false,
      createdAt: Date.now(),
      category,
      subtasks: [],
    }

    await addTask(task)
    setTitle('')
    onAdded()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="px-4 py-3">
      <div className="flex gap-2 items-center bg-bg-card rounded-2xl border border-border px-3 py-2 shadow-sm">
        <div className="flex gap-1">
          {(['work', 'life'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-xs px-2 py-1 rounded-full transition-colors ${
                category === c
                  ? 'bg-primary text-white'
                  : 'bg-bg-input text-text-secondary'
              }`}
            >
              {c === 'work' ? '工作' : '生活'}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="脑子里有什么？快记下来..."
          className="flex-1 bg-transparent outline-none text-sm text-text placeholder:text-text-tertiary"
        />
        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-30 transition-opacity shrink-0"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  )
}
