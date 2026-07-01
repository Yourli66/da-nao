import { useState, useEffect, useCallback } from 'react'
import Layout, { type TabId } from './components/Layout'
import SyncSetup from './components/SyncSetup'
import InboxPage from './pages/InboxPage'
import TodayPage from './pages/TodayPage'
import MatrixPage from './pages/MatrixPage'
import ReviewPage from './pages/ReviewPage'
import { getAllTasks } from './db'
import type { Task } from './db/types'

export default function App() {
  const [tab, setTab] = useState<TabId>('today')
  const [tasks, setTasks] = useState<Task[]>([])
  const [ready, setReady] = useState(false)

  const hasUserId = !!localStorage.getItem('da-nao-user-id')

  const refresh = useCallback(async () => {
    const all = await getAllTasks()
    setTasks(all.sort((a, b) => b.createdAt - a.createdAt))
  }, [])

  useEffect(() => {
    if (hasUserId || ready) {
      refresh()
    }
  }, [hasUserId, ready, refresh])

  if (!hasUserId && !ready) {
    return <SyncSetup onDone={() => setReady(true)} />
  }

  return (
    <Layout activeTab={tab} onTabChange={setTab}>
      {tab === 'inbox' && <InboxPage tasks={tasks} onRefresh={refresh} />}
      {tab === 'today' && <TodayPage tasks={tasks} onRefresh={refresh} />}
      {tab === 'matrix' && <MatrixPage tasks={tasks} onRefresh={refresh} />}
      {tab === 'review' && <ReviewPage tasks={tasks} onRefresh={refresh} />}
    </Layout>
  )
}
