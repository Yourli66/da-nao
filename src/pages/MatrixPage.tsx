import { useState } from 'react'
import TaskCard from '../components/TaskCard'
import CategoryFilter, { type CategoryTab } from '../components/CategoryFilter'
import type { Task } from '../db/types'
import { getQuadrant, QUADRANT_META, type Quadrant } from '../db/types'

export default function MatrixPage({
  tasks,
  onRefresh,
}: {
  tasks: Task[]
  onRefresh: () => void
}) {
  const [cat, setCat] = useState<CategoryTab>('work')

  const workActive = tasks.filter((t) => !t.completed && t.category === 'work')
  const lifeActive = tasks.filter((t) => !t.completed && t.category === 'life')
  const active = cat === 'work' ? workActive : lifeActive

  const grouped: Record<Quadrant, Task[]> = { do: [], plan: [], delegate: [], drop: [] }
  for (const t of active) {
    grouped[getQuadrant(t)].push(t)
  }

  const quadrants: Quadrant[] = ['do', 'plan', 'delegate', 'drop']

  return (
    <div>
      <header className="px-4 pt-12 pb-2">
        <h1 className="text-2xl font-bold text-text">四象限</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          展开任务可调整紧急/重要属性
        </p>
      </header>

      <CategoryFilter
        active={cat}
        onChange={setCat}
        workCount={workActive.length}
        lifeCount={lifeActive.length}
      />

      <div className="px-4 grid grid-cols-2 gap-3 mt-2">
        {quadrants.map((q) => {
          const meta = QUADRANT_META[q]
          return (
            <div
              key={q}
              className="rounded-2xl border-2 p-3 min-h-[140px]"
              style={{ borderColor: meta.color + '40' }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                <h3 className="text-xs font-bold" style={{ color: meta.color }}>
                  {meta.label}
                </h3>
                <span className="text-[10px] text-text-tertiary ml-auto">
                  {grouped[q].length}
                </span>
              </div>
              <p className="text-[10px] text-text-tertiary mb-2">{meta.hint}</p>
              <div className="space-y-1.5">
                {grouped[q].map((t) => (
                  <TaskCard key={t.id} task={t} onChanged={onRefresh} />
                ))}
                {grouped[q].length === 0 && (
                  <p className="text-[10px] text-text-tertiary text-center py-4">空</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
