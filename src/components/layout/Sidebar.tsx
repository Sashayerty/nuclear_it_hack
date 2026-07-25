import React from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setActiveTab, type ActiveTab } from '../../store/slices/dashboardSlice'
import { logout } from '../../store/slices/authSlice'

const ICONS: Record<string, (active: boolean) => React.ReactNode> = {
  dashboard: (active) => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={active ? '#ffffff' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  datasets: (active) => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={active ? '#ffffff' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  ),
  report: (active) => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={active ? '#ffffff' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  admin: (active) => (
    <img
      src="/images/menu.svg"
      alt="Меню"
      className={`w-5 h-5 object-contain transition-all ${
        active ? 'brightness-0 invert' : 'brightness-0 invert opacity-50 group-hover:opacity-100'
      }`}
    />
  ),
  auth: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-2-2l2 2" />
      <path d="M15.5 7.5l3 3" />
      <circle cx="7.5" cy="16.5" r="4.5" />
      <path d="M10.7 13.3L19 5" />
    </svg>
  ),
  logout: () => (
    <img
      src="/images/logout.svg"
      alt="Выйти"
      className="w-5 h-5 object-contain brightness-0 invert opacity-50 group-hover:opacity-100 transition-all"
    />
  )
}

export const Sidebar = () => {
  const dispatch = useAppDispatch()
  const activeTab = useAppSelector((state) => state.dashboard.activeTab)
  const auth = useAppSelector((state) => state.auth)

  const navItems: { id: ActiveTab; label: string; iconKey: string }[] =
    auth.role === 'admin'
      ? [{ id: 'admin', label: 'Панель администратора', iconKey: 'admin' }]
      : [
          { id: 'dashboard', label: 'Дашборд', iconKey: 'dashboard' },
          { id: 'datasets', label: 'Датасеты', iconKey: 'datasets' },
          { id: 'report', label: 'Отчёт аналитики', iconKey: 'report' }
        ]

  return (
    <aside className="w-16 md:w-20 bg-[#18191c] text-slate-400 flex flex-col items-center justify-between py-6 shrink-0 border-r border-slate-800/60 sticky top-0 h-screen select-none">
      <div className="flex flex-col items-center gap-8 w-full">
        <nav className="flex flex-col items-center gap-3 w-full px-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            const iconFn = ICONS[item.iconKey]
            return (
              <button
                key={item.id}
                onClick={() => dispatch(setActiveTab(item.id))}
                title={item.label}
                className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-200 relative group ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {iconFn ? iconFn(isActive) : null}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-3 w-full px-2">
        <button
          onClick={() => dispatch(logout())}
          title="Выйти из системы"
          className="h-10 w-10 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors"
        >
          {ICONS.logout(false)}
        </button>
      </div>
    </aside>
  )
}
