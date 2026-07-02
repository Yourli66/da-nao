import { Briefcase, Home } from 'lucide-react'

export type CategoryTab = 'work' | 'life'

export default function CategoryFilter({
  active,
  onChange,
  workCount,
  lifeCount,
}: {
  active: CategoryTab
  onChange: (tab: CategoryTab) => void
  workCount: number
  lifeCount: number
}) {
  return (
    <div className="flex bg-bg-input rounded-xl p-1 mx-4 mb-2">
      <button
        onClick={() => onChange('work')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          active === 'work' ? 'bg-bg-card text-text shadow-sm' : 'text-text-secondary'
        }`}
      >
        <Briefcase size={14} />
        工作 ({workCount})
      </button>
      <button
        onClick={() => onChange('life')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          active === 'life' ? 'bg-bg-card text-text shadow-sm' : 'text-text-secondary'
        }`}
      >
        <Home size={14} />
        生活 ({lifeCount})
      </button>
    </div>
  )
}
