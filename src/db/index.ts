import { supabase } from './supabase'
import type { Task } from './types'

// 用浏览器指纹作为简易用户标识，实现多设备同步
function getUserId(): string {
  let id = localStorage.getItem('da-nao-user-id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('da-nao-user-id', id)
  }
  return id
}

// 首次使用时提示输入同步码，或生成新的
export function initUserId(): string {
  return getUserId()
}

export function setUserId(id: string) {
  localStorage.setItem('da-nao-user-id', id)
}

function toDbRow(task: Task, userId: string) {
  return {
    id: task.id,
    title: task.title,
    urgent: task.urgent,
    important: task.important,
    completed: task.completed,
    completed_at: task.completedAt ?? null,
    created_at: task.createdAt,
    due_date: task.dueDate ?? null,
    notes: task.notes ?? null,
    category: task.category,
    user_id: userId,
  }
}

function fromDbRow(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    urgent: row.urgent as boolean,
    important: row.important as boolean,
    completed: row.completed as boolean,
    completedAt: (row.completed_at as number) ?? undefined,
    createdAt: row.created_at as number,
    dueDate: (row.due_date as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    category: row.category as 'work' | 'life',
  }
}

export async function getAllTasks(): Promise<Task[]> {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(fromDbRow)
}

export async function addTask(task: Task): Promise<void> {
  const userId = getUserId()
  const { error } = await supabase.from('tasks').insert(toDbRow(task, userId))
  if (error) throw error
}

export async function updateTask(task: Task): Promise<void> {
  const userId = getUserId()
  const { error } = await supabase
    .from('tasks')
    .update(toDbRow(task, userId))
    .eq('id', task.id)
  if (error) throw error
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}
