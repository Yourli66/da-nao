export interface Task {
  id: string
  title: string
  urgent: boolean
  important: boolean
  completed: boolean
  completedAt?: number
  createdAt: number
  dueDate?: string
  notes?: string
  category: 'work' | 'life'
}

export type Quadrant = 'do' | 'plan' | 'delegate' | 'drop'

export function getQuadrant(task: Task): Quadrant {
  if (task.important && task.urgent) return 'do'
  if (task.important && !task.urgent) return 'plan'
  if (!task.important && task.urgent) return 'delegate'
  return 'drop'
}

export const QUADRANT_META: Record<Quadrant, { label: string; color: string; hint: string }> = {
  do: { label: '立即做', color: '#EF4444', hint: '重要且紧急' },
  plan: { label: '计划做', color: '#3B82F6', hint: '重要不紧急' },
  delegate: { label: '快速处理', color: '#F59E0B', hint: '紧急不重要' },
  drop: { label: '可以不做', color: '#6B7280', hint: '不重要不紧急' },
}
