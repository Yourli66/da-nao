import { useState, useEffect, useCallback } from 'react'
import { supabase } from './db/supabase'
import type { Session } from '@supabase/supabase-js'
import Layout, { type TabId } from './components/Layout'
import AuthPage from './components/AuthPage'
import InboxPage from './pages/InboxPage'
import TodayPage from './pages/TodayPage'
import MatrixPage from './pages/MatrixPage'
import ReviewPage from './pages/ReviewPage'
import { getAllTasks } from './db'
import type { Task } from './db/types'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabId>('today')
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const refresh = useCallback(async () => {
    const all = await getAllTasks()
    setTasks(all.sort((a, b) => b.createdAt - a.createdAt))
  }, [])

  useEffect(() => {
    if (session) refresh()
  }, [session, refresh])

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-bg">
        <div className="text-text-secondary text-sm">加载中...</div>
      </div>
    )
  }

  if (!session) {
    return <AuthPage onAuthed={refresh} />
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
