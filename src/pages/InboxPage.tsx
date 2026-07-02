import { useState } from 'react'
import QuickCapture from '../components/QuickCapture'
import TaskCard from '../components/TaskCard'
import CategoryFilter, { type CategoryTab } from '../components/CategoryFilter'
import type { Task } from '../db/types'

export default function InboxPage({
  tasks,
  onRefresh,
}: {
  tasks: Task[]
  onRefresh: () => void
}) {
  const [cat, setCat] = useState<CategoryTab>('work')

  const workTasks = tasks.filter((t) => !t.completed && t.category === 'work')
  const lifeTasks = tasks.filter((t) => !t.completed && t.category === 'life')
  const filtered = cat === 'work' ? workTasks : lifeTasks

  const uncategorized = filtered.filter((t) => !t.important && !t.urgent)
  const categorized = filtered.filter((t) => t.important || t.urgent)

  return (
    <div>
      <header className="px-4 pt-12 pb-2">
        <h1 className="text-2xl font-bold text-text">收集箱</h1>
        <p className="text-sm text-text-secondary mt-0.5">先倒出来，再分类</p>
      </header>

      <CategoryFilter
        active={cat}
        onChange={setCat}
        workCount={workTasks.length}
        lifeCount={lifeTasks.length}
      />

      <QuickCapture onAdded={onRefresh} />

      {uncategorized.length > 0 && (
        <section className="px-4 mt-2">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            待分类 ({uncategorized.length})
          </h2>
          <div className="space-y-2">
            {uncategorized.map((t) => (
              <TaskCard key={t.id} task={t} onChanged={onRefresh} showQuadrant />
            ))}
          </div>
        </section>
      )}

      {categorized.length > 0 && (
        <section className="px-4 mt-4">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            已分类 ({categorized.length})
          </h2>
          <div className="space-y-2">
            {categorized.map((t) => (
              <TaskCard key={t.id} task={t} onChanged={onRefresh} showQuadrant />
            ))}
          </div>
        </section>
      )}

      {uncategorized.length === 0 && categorized.length === 0 && (
        <div className="px-4 py-16 text-center text-text-tertiary text-sm">
          {cat === 'work' ? '工作' : '生活'}收集箱空空 :)
        </div>
      )}
    </div>
  )
}
