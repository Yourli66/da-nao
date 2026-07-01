import { useState } from 'react'
import { initUserId, setUserId } from '../db'
import { Link, RefreshCw } from 'lucide-react'

export default function SyncSetup({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<'choose' | 'show' | 'input'>('choose')
  const [code, setCode] = useState('')
  const [inputCode, setInputCode] = useState('')

  const handleNew = () => {
    const id = initUserId()
    setCode(id)
    setMode('show')
  }

  const handleSync = () => {
    setMode('input')
  }

  const handleSubmit = () => {
    if (inputCode.trim()) {
      setUserId(inputCode.trim())
      onDone()
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-text mb-1">
          大脑
        </h1>
        <p className="text-sm text-text-secondary text-center mb-8">
          个人指挥中心
        </p>

        {mode === 'choose' && (
          <div className="space-y-3">
            <button
              onClick={handleNew}
              className="w-full flex items-center gap-3 bg-bg-card border border-border rounded-2xl p-4 text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <RefreshCw size={20} className="text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-text">全新开始</div>
                <div className="text-xs text-text-secondary">
                  第一次用，生成同步码
                </div>
              </div>
            </button>
            <button
              onClick={handleSync}
              className="w-full flex items-center gap-3 bg-bg-card border border-border rounded-2xl p-4 text-left"
            >
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <Link size={20} className="text-success" />
              </div>
              <div>
                <div className="text-sm font-semibold text-text">
                  同步已有数据
                </div>
                <div className="text-xs text-text-secondary">
                  输入其他设备上的同步码
                </div>
              </div>
            </button>
          </div>
        )}

        {mode === 'show' && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary text-center">
              这是你的同步码，在其他设备上输入即可同步数据：
            </p>
            <div
              className="bg-bg-card border border-border rounded-xl p-4 text-center font-mono text-xs text-text select-all break-all cursor-pointer"
              onClick={() => navigator.clipboard?.writeText(code)}
            >
              {code}
            </div>
            <p className="text-[10px] text-text-tertiary text-center">
              点击可复制
            </p>
            <button
              onClick={onDone}
              className="w-full bg-primary text-white rounded-xl py-3 text-sm font-semibold"
            >
              开始使用
            </button>
          </div>
        )}

        {mode === 'input' && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary text-center">
              输入你在其他设备上看到的同步码：
            </p>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="粘贴同步码..."
              className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-sm text-text outline-none focus:border-primary"
            />
            <button
              onClick={handleSubmit}
              disabled={!inputCode.trim()}
              className="w-full bg-primary text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-30"
            >
              连接同步
            </button>
            <button
              onClick={() => setMode('choose')}
              className="w-full text-sm text-text-secondary"
            >
              返回
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
