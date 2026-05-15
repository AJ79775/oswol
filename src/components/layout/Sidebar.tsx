'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Zap,
  MessageSquare,
  Map,
  BookMarked,
  Bot,
  Newspaper,
  FileText,
  ChevronRight,
  Command,
  User,
  Users,
  Building2,
  UserCheck,
} from 'lucide-react'

const smartMoneySubNav = [
  { label: 'Politicians', href: '/smart-money/politicians', icon: Users },
  { label: 'Insiders', href: '/smart-money/insiders', icon: UserCheck },
  { label: 'Hedge Funds', href: '/smart-money/funds', icon: Building2 },
]

const navSections = [
  {
    title: 'WORKSPACE',
    items: [
      { label: 'Design Brief', href: '/brief', icon: FileText },
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Markets', href: '/markets', icon: TrendingUp },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { label: 'Smart Money', href: '/smart-money', icon: Zap, badge: 142 },
      { label: 'Social', href: '/social', icon: MessageSquare },
      { label: 'Heat Map', href: '/heatmap', icon: Map },
      { label: 'Watchlist', href: '/watchlist', icon: BookMarked, badge: 5 },
    ],
  },
  {
    title: 'OUTPUT',
    items: [
      { label: 'AI Copilot', href: '/copilot', icon: Bot },
      { label: 'Newsletter', href: '/newsletter', icon: Newspaper },
    ],
  },
]

interface SidebarProps {
  collapsed?: boolean
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="flex flex-col h-full bg-[var(--bg-1)] border-r border-[var(--border)] flex-shrink-0"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border)] h-14">
        <div className="w-7 h-7 flex-shrink-0">
          <Image
            src="/brand/oswol-logo.png"
            alt="Oswol"
            width={28}
            height={28}
            className="object-contain"
          />
        </div>
        {!collapsed && (
          <span
            className="text-[15px] font-semibold tracking-tight text-[var(--ink-hi)]"
            style={{ fontFamily: 'var(--font-sora, sans-serif)' }}
          >
            Oswol
          </span>
        )}
        {!collapsed && (
          <span className="ml-auto text-[10px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded bg-[var(--ai-soft)] text-[var(--ai)]">
            Beta
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="text-[10px] font-semibold tracking-widest uppercase text-[var(--ink-dim)] px-2 mb-1.5">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-2.5 px-2 py-2 rounded-[var(--radius-sm)] text-sm transition-colors group
                        ${isActive
                          ? 'bg-[var(--bg-3)] text-[var(--ink-hi)] font-medium'
                          : 'text-[var(--ink-lo)] hover:bg-[var(--bg-2)] hover:text-[var(--ink-md)]'
                        }
                      `}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 nav-icon ${isActive ? 'text-[var(--ai)]' : 'text-[var(--ink-dim)]'}`}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge !== undefined && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--ai-soft)] text-[var(--ai)] min-w-[20px] text-center">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                    {/* Smart Money sub-nav */}
                    {!collapsed && item.href === '/smart-money' && isActive && (
                      <ul className="mt-0.5 ml-6 space-y-0.5">
                        {smartMoneySubNav.map(sub => {
                          const SubIcon = sub.icon
                          const subActive = pathname === sub.href || pathname.startsWith(sub.href)
                          return (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-sm)] text-[12px] transition-colors ${
                                  subActive
                                    ? 'text-[var(--ai)] font-medium'
                                    : 'text-[var(--ink-dim)] hover:text-[var(--ink-lo)]'
                                }`}
                              >
                                <SubIcon className="w-3 h-3 flex-shrink-0" />
                                <span>{sub.label}</span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-[var(--border)] p-3 space-y-2">
          {/* Ask Copilot button */}
          <button className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--ai-soft)] text-[var(--ai)] text-sm font-medium hover:bg-[rgba(8,145,178,0.15)] transition-colors">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <span>Ask Copilot</span>
            </div>
            <div className="flex items-center gap-0.5 text-[var(--ai)] opacity-60">
              <Command className="w-3 h-3" />
              <span className="text-[11px]">K</span>
            </div>
          </button>

          {/* User chip */}
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-2)] transition-colors cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-[var(--champagne)] flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-[var(--champagne-deep)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[var(--ink-hi)] truncate">Tariq A.</p>
              <p className="text-[10px] text-[var(--ink-dim)] truncate">Pro · ME / GCC</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-dim)] flex-shrink-0" />
          </div>
        </div>
      )}
    </aside>
  )
}
