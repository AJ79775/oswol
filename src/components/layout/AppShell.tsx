'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import ExplainMovePanel from '@/components/ai/ExplainMovePanel'
import { onExplainMove } from '@/lib/explainEvents'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [explainSymbol, setExplainSymbol] = useState<string | undefined>()
  const [explainChangePct, setExplainChangePct] = useState(0)
  const [explainOpen, setExplainOpen] = useState(false)

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    document.documentElement.setAttribute('data-theme', newDark ? 'night' : 'day')
  }

  const openExplain = (symbol?: string, changePct?: number) => {
    setExplainSymbol(symbol)
    setExplainChangePct(changePct ?? 0)
    setExplainOpen(true)
  }

  // Listen for custom events from child components
  useEffect(() => {
    const unsubscribe = onExplainMove((symbol, changePct) => {
      openExplain(symbol, changePct)
    })
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-0)]">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <Topbar
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenExplain={openExplain}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[var(--bg-0)]">
          {children}
        </main>
      </div>

      {/* Global ExplainMovePanel */}
      <ExplainMovePanel
        open={explainOpen}
        onClose={() => setExplainOpen(false)}
        symbol={explainSymbol}
        changePct={explainChangePct}
      />
    </div>
  )
}
