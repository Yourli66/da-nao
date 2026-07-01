import dayjs from 'dayjs'
import QuickCapture from '../components/QuickCapture'
import TaskCard from '../components/TaskCard'
import type { Task } from '../db/types'
import { getQuadrant } from '../db/types'

export default function TodayPage({
  tasks,
  onRefresh,
}: {
  tasks: Task[]
  onRefresh: () => void
}) {
  const activeTasks = tasks.filter((t) => !t.completed)
  const todayCompleted = tasks.filter(
    (t) => t.completed && t.completedAt && dayjs(t.completedAt).isSame(dayjs(), 'day')
  )

  const doNow = activeTasks.filter((t) => getQuadrant(t) === 'do')
  const planDo = activeTasks.filter((t) => getQuadrant(t) === 'plan')
  const quick = activeTasks.filter((t) => getQuadrant(t) === 'delegate')

  const total = activeTasks.length
  const done = todayCompleted.length

  return (
    <div>
      <header className="px-4 pt-12 pb-2">
        <h1 className="text-2xl font-bold text-text">
          今日焦点
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          {dayjs().format('M月D日 dddd')} · 已完成 {done} 项，剩余 {total} 项
        </p>
      </header>

      <QuickCapture onAdded={onRefresh} />

      {doNow.length > 0 && (
        <section className="px-4 mt-2">
          <h2 className="text-xs font-semibold text-do uppercase tracking-wider mb-2">
            立即做 ({doNow.length})
          </h2>
          <div className="space-y-2">
            {doNow.map((t) => (
              <TaskCard key={t.id} task={t} onChanged={onRefresh} />
            ))}
          </div>
        </section>
      )}

      {quick.length > 0 && (
        <section className="px-4 mt-4">
          <h2 className="text-xs font-semibold text-delegate uppercase tracking-wider mb-2">
            快速处理 ({quick.length})
          </h2>
          <div className="space-y-2">
            {quick.map((t) => (
              <TaskCard key={t.id} task={t} onChanged={onRefresh} />
            ))}
          </div>
        </section>
      )}

      {planDo.length > 0 && (
        <section className="px-4 mt-4">
          <h2 className="text-xs font-semibold text-plan uppercase tracking-wider mb-2">
            计划推进 ({planDo.length})
          </h2>
          <div className="space-y-2">
            {planDo.map((t) => (
              <TaskCard key={t.id} task={t} onChanged={onRefresh} />
            ))}
          </div>
        </section>
      )}

      {todayCompleted.length > 0 && (
        <section className="px-4 mt-4">
          <h2 className="text-xs font-semibold text-success uppercase tracking-wider mb-2">
            今日已完成 ({todayCompleted.length})
          </h2>
          <div className="space-y-2">
            {todayCompleted.map((t) => (
              <TaskCard key={t.id} task={t} onChanged={onRefresh} />
            ))}
          </div>
        </section>
      )}

      {total === 0 && done === 0 && (
        <div className="px-4 py-16 text-center text-text-tertiary text-sm">
          今天还没有任务，先添加一些吧
        </div>
      )}
    </div>
  )
}
