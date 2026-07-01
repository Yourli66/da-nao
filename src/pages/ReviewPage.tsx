import { useMemo } from 'react'
import dayjs from 'dayjs'
import type { Task } from '../db/types'
import { getQuadrant, QUADRANT_META, type Quadrant } from '../db/types'
import { deleteTask } from '../db'

export default function ReviewPage({
  tasks,
  onRefresh,
}: {
  tasks: Task[]
  onRefresh: () => void
}) {
  const today = dayjs()
  const last7 = useMemo(() => {
    const days: { date: string; completed: number; added: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = today.subtract(i, 'day')
      const dateStr = d.format('YYYY-MM-DD')
      const completed = tasks.filter(
        (t) => t.completedAt && dayjs(t.completedAt).format('YYYY-MM-DD') === dateStr
      ).length
      const added = tasks.filter(
        (t) => dayjs(t.createdAt).format('YYYY-MM-DD') === dateStr
      ).length
      days.push({ date: d.format('M/D'), completed, added })
    }
    return days
  }, [tasks, today])

  const total = tasks.length
  const completed = tasks.filter((t) => t.completed).length
  const active = total - completed

  const quadrantCounts: Record<Quadrant, number> = { do: 0, plan: 0, delegate: 0, drop: 0 }
  for (const t of tasks.filter((t) => !t.completed)) {
    quadrantCounts[getQuadrant(t)]++
  }

  const completedTasks = tasks
    .filter((t) => t.completed)
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))

  const clearCompleted = async () => {
    const toDelete = tasks.filter((t) => t.completed)
    for (const t of toDelete) {
      await deleteTask(t.id)
    }
    onRefresh()
  }

  const maxBar = Math.max(...last7.map((d) => Math.max(d.completed, d.added)), 1)

  return (
    <div>
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-text">复盘</h1>
      </header>

      <section className="px-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-bg-card rounded-xl border border-border p-3 text-center">
            <div className="text-2xl font-bold text-primary">{active}</div>
            <div className="text-[10px] text-text-secondary">进行中</div>
          </div>
          <div className="bg-bg-card rounded-xl border border-border p-3 text-center">
            <div className="text-2xl font-bold text-success">{completed}</div>
            <div className="text-[10px] text-text-secondary">已完成</div>
          </div>
          <div className="bg-bg-card rounded-xl border border-border p-3 text-center">
            <div className="text-2xl font-bold text-text">{total}</div>
            <div className="text-[10px] text-text-secondary">总计</div>
          </div>
        </div>
      </section>

      <section className="px-4 mt-4">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          象限分布
        </h2>
        <div className="flex gap-2">
          {(['do', 'plan', 'delegate', 'drop'] as Quadrant[]).map((q) => (
            <div
              key={q}
              className="flex-1 rounded-lg p-2 text-center text-white text-xs font-bold"
              style={{ backgroundColor: QUADRANT_META[q].color }}
            >
              <div className="text-lg">{quadrantCounts[q]}</div>
              <div className="text-[10px] opacity-80">{QUADRANT_META[q].label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 mt-4">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          最近 7 天
        </h2>
        <div className="bg-bg-card rounded-xl border border-border p-3">
          <div className="flex items-end gap-1 h-24">
            {last7.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex flex-col gap-0.5">
                  <div
                    className="w-full bg-success rounded-t-sm"
                    style={{ height: `${(d.completed / maxBar) * 60}px` }}
                  />
                  <div
                    className="w-full bg-primary-light rounded-b-sm"
                    style={{ height: `${(d.added / maxBar) * 60}px` }}
                  />
                </div>
                <span className="text-[9px] text-text-tertiary">{d.date}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-[10px] text-text-secondary">完成</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary-light" />
              <span className="text-[10px] text-text-secondary">新增</span>
            </div>
          </div>
        </div>
      </section>

      {completedTasks.length > 0 && (
        <section className="px-4 mt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              已完成 ({completedTasks.length})
            </h2>
            <button
              onClick={clearCompleted}
              className="text-[10px] text-do"
            >
              清空已完成
            </button>
          </div>
          <div className="space-y-1.5">
            {completedTasks.slice(0, 20).map((t) => (
              <div
                key={t.id}
                className="bg-bg-card rounded-lg border border-border px-3 py-2 flex items-center gap-2"
              >
                <div className="w-4 h-4 rounded-full bg-success flex items-center justify-center">
                  <span className="text-white text-[10px]">✓</span>
                </div>
                <span className="text-sm text-text-tertiary line-through flex-1">
                  {t.title}
                </span>
                <span className="text-[10px] text-text-tertiary">
                  {t.completedAt ? dayjs(t.completedAt).format('M/D') : ''}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
