import { openDB, type DBSchema } from 'idb'
import type { Task } from './types'

interface DaNaoDB extends DBSchema {
  tasks: {
    key: string
    value: Task
    indexes: {
      'by-created': number
      'by-completed': number
    }
  }
}

const dbPromise = openDB<DaNaoDB>('da-nao', 1, {
  upgrade(db) {
    const store = db.createObjectStore('tasks', { keyPath: 'id' })
    store.createIndex('by-created', 'createdAt')
    store.createIndex('by-completed', 'completed')
  },
})

export async function getAllTasks(): Promise<Task[]> {
  const db = await dbPromise
  return db.getAll('tasks')
}

export async function addTask(task: Task): Promise<void> {
  const db = await dbPromise
  await db.put('tasks', task)
}

export async function updateTask(task: Task): Promise<void> {
  const db = await dbPromise
  await db.put('tasks', task)
}

export async function deleteTask(id: string): Promise<void> {
  const db = await dbPromise
  await db.delete('tasks', id)
}
