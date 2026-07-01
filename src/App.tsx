import { useState, useEffect, useCallback } from 'react'
import Layout, { type TabId } from './components/Layout'
import InboxPage from './pages/InboxPage'
import TodayPage from './pages/TodayPage'
import MatrixPage from './pages/MatrixPage'
import ReviewPage from './pages/ReviewPage'
import { getAllTasks } from './db'
import type { Task } from './db/types'

export default function App() {
  const [tab, setTab] = useState<TabId>('today')
  const [tasks, setTasks] = useState<Task[]>([])

  const refresh = useCallback(async () => {
    const all = await getAllTasks()
    setTasks(all.sort((a, b) => b.createdAt - a.createdAt))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <Layout activeTab={tab} onTabChange={setTab}>
      {tab === 'inbox' && <InboxPage tasks={tasks} onRefresh={refresh} />}
      {tab === 'today' && <TodayPage tasks={tasks} onRefresh={refresh} />}
      {tab === 'matrix' && <MatrixPage tasks={tasks} onRefresh={refresh} />}
      {tab === 'review' && <ReviewPage tasks={tasks} onRefresh={refresh} />}
    </Layout>
  )
}
