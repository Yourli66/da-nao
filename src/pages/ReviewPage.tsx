import { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task } from '../db/types'
import { getQuadrant, QUADRANT_META, type Quadrant } from '../db/types'
import { deleteTask } from '../db'

type ViewMode = 'week' | 'month'

export default function ReviewPage({
  tasks,
  onRefresh,
}: {
  tasks: Task[]
  onRefresh: () => void
}) {
  const [mode, setMode] = useState<ViewMode>('week')
  const [offset, setOffset] = useState(0)

  const anchor = useMemo(() => {
    if (mode === 'week') return dayjs().subtract(offset * 7, 'day')
    return dayjs().subtract(offset, 'month')
  }, [mode, offset])

  const rangeStart = useMemo(() => {
    if (mode === 'week') return anchor.subtract(6, 'day').startOf('day')
    return anchor.startOf('month')
  }, [mode, anchor])

  const rangeEnd = useMemo(() => {
    if (mode === 'week') return anchor.endOf('day')
    return anchor.endOf('month')
  }, [mode, anchor])

  const rangeLabel = useMemo(() => {
    if (mode === 'week') {
      if (offset === 0) return '最近 7 天'
      return `${rangeStart.format('M/D')} - ${rangeEnd.format('M/D')}`
    }
    return anchor.format('YYYY年M月')
  }, [mode, offset, rangeStart, rangeEnd, anchor])

  const inRange = (ts: number) => {
    const d = dayjs(ts)
    return d.isAfter(rangeStart.subtract(1, 'ms')) && d.isBefore(rangeEnd.add(1, 'ms'))
  }

  const rangeCompleted = tasks.filter((t) => t.completedAt && inRange(t.completedAt))
  const rangeAdded = tasks.filter((t) => inRange(t.createdAt))

  const bars = useMemo(() => {
    const days: { date: string; dayLabel: string; completed: number; added: number }[] = []
    if (mode === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = anchor.subtract(i, 'day')
        const dateStr = d.format('YYYY-MM-DD')
        const completed = tasks.filter(
          (t) => t.completedAt && dayjs(t.completedAt).format('YYYY-MM-DD') === dateStr
        ).length
        const added = tasks.filter(
          (t) => dayjs(t.createdAt).format('YYYY-MM-DD') === dateStr
        ).length
        days.push({ date: dateStr, dayLabel: d.format('M/D'), completed, added })
      }
    } else {
      const daysInMonth = anchor.daysInMonth()
      for (let i = 1; i <= daysInMonth; i++) {
        const d = anchor.date(i)
        const dateStr = d.format('YYYY-MM-DD')
        const completed = tasks.filter(
          (t) => t.completedAt && dayjs(t.completedAt).format('YYYY-MM-DD') === dateStr
        ).length
        const added = tasks.filter(
          (t) => dayjs(t.createdAt).format('YYYY-MM-DD') === dateStr
        ).length
        days.push({ date: dateStr, dayLabel: String(i), completed, added })
      }
    }
    return days
  }, [tasks, mode, anchor])

  const maxBar = Math.max(...bars.map((d) => Math.max(d.completed, d.added)), 1)

  const total = tasks.length
  const completedCount = tasks.filter((t) => t.completed).length
  const activeCount = total - completedCount

  const quadrantCounts: Record<Quadrant, number> = { do: 0, plan: 0, delegate: 0, drop: 0 }
  for (const t of tasks.filter((t) => !t.completed)) {
    quadrantCounts[getQuadrant(t)]++
  }

  const completedTasks = rangeCompleted.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))

  const clearCompleted = async () => {
    const toDelete = tasks.filter((t) => t.completed)
    for (const t of toDelete) {
      await deleteTask(t.id)
    }
    onRefresh()
  }

  const isCurrentPeriod = offset === 0

  return (
    <div>
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-text">复盘</h1>
      </header>

      <section className="px-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-bg-card rounded-xl border border-border p-3 text-center">
            <div className="text-2xl font-bold text-primary">{activeCount}</div>
            <div className="text-[10px] text-text-secondary">进行中</div>
          </div>
          <div className="bg-bg-card rounded-xl border border-border p-3 text-center">
            <div className="text-2xl font-bold text-success">{completedCount}</div>
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
        {/* 模式切换 + 日期导航 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex bg-bg-input rounded-lg p-0.5">
            <button
              onClick={() => { setMode('week'); setOffset(0) }}
              className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                mode === 'week' ? 'bg-bg-card text-text shadow-sm' : 'text-text-secondary'
              }`}
            >
              周
            </button>
            <button
              onClick={() => { setMode('month'); setOffset(0) }}
              className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                mode === 'month' ? 'bg-bg-card text-text shadow-sm' : 'text-text-secondary'
              }`}
            >
              月
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setOffset(offset + 1)}
              className="w-6 h-6 flex items-center justify-center rounded-full text-text-secondary active:bg-bg-input"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-text-secondary min-w-[80px] text-center">
              {rangeLabel}
            </span>
            <button
              onClick={() => setOffset(Math.max(0, offset - 1))}
              disabled={isCurrentPeriod}
              className="w-6 h-6 flex items-center justify-center rounded-full text-text-secondary active:bg-bg-input disabled:opacity-20"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 期间统计 */}
        <div className="flex gap-3 mb-2">
          <span className="text-[10px] text-text-secondary">
            本期完成 <span className="font-bold text-success">{rangeCompleted.length}</span>
          </span>
          <span className="text-[10px] text-text-secondary">
            本期新增 <span className="font-bold text-primary">{rangeAdded.length}</span>
          </span>
        </div>

        {/* 柱状图 */}
        <div className="bg-bg-card rounded-xl border border-border p-3">
          <div className={`flex items-end gap-px h-24 ${mode === 'month' ? 'overflow-x-auto' : ''}`}>
            {bars.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 min-w-[8px]">
                <div className="w-full flex flex-col gap-px">
                  <div
                    className="w-full bg-success rounded-t-sm"
                    style={{ height: `${(d.completed / maxBar) * 60}px` }}
                  />
                  <div
                    className="w-full bg-primary-light rounded-b-sm"
                    style={{ height: `${(d.added / maxBar) * 60}px` }}
                  />
                </div>
                <span className={`text-text-tertiary ${mode === 'month' ? 'text-[7px]' : 'text-[9px]'}`}>
                  {mode === 'month' ? (Number(d.dayLabel) % 5 === 1 ? d.dayLabel : '') : d.dayLabel}
                </span>
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
              本期已完成 ({completedTasks.length})
            </h2>
            <button
              onClick={clearCompleted}
              className="text-[10px] text-do"
            >
              清空全部已完成
            </button>
          </div>
          <div className="space-y-1.5">
            {completedTasks.slice(0, 30).map((t) => (
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

      {completedTasks.length === 0 && (
        <div className="px-4 py-8 text-center text-text-tertiary text-sm">
          本期没有完成的任务
        </div>
      )}
    </div>
  )
}
