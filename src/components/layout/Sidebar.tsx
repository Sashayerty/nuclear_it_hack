import React from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setActiveTab, type ActiveTab } from '../../store/slices/dashboardSlice'
import { logout } from '../../store/slices/authSlice'

const ICONS: Record<string, (active: boolean) => React.ReactNode> = {
  dashboard: (active) => (
    <img
      src="/images/menu-org.svg"
      alt="Дашборд"
      className={`w-5 h-5 object-contain transition-all ${
        active ? 'brightness-0 invert' : 'brightness-0 invert opacity-50 group-hover:opacity-100'
      }`}
    />
  ),
  datasets: (active) => (
    <img
      src="/images/files.svg"
      alt="Датасеты"
      className={`w-5 h-5 object-contain transition-all ${
        active ? 'brightness-0 invert' : 'brightness-0 invert opacity-50 group-hover:opacity-100'
      }`}
    />
  ),
  report: (active) => (
    <img
      src="/images/add-folder.svg"
      alt="Отчёт аналитики"
      className={`w-5 h-5 object-contain transition-all ${
        active ? 'brightness-0 invert' : 'brightness-0 invert opacity-50 group-hover:opacity-100'
      }`}
    />
  ),
  admin: (active) => (
    <img
      src="/images/menu-org.svg"
      alt="Панель администратора"
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

  const orgName = auth.orgName || localStorage.getItem('org_name')
  const orgAvatar = orgName
    ? (localStorage.getItem(`org_avatar_${orgName}`) || localStorage.getItem('org_avatar') || localStorage.getItem('user_avatar'))
    : (localStorage.getItem('org_avatar') || localStorage.getItem('user_avatar'))

  const navItems: { id: ActiveTab; label: string; iconKey: string }[] =
    auth.role === 'admin'
      ? [{ id: 'admin', label: 'Панель администратора', iconKey: 'admin' }]
      : [
        { id: 'dashboard', label: 'Дашборд', iconKey: 'dashboard' },
        { id: 'datasets', label: 'Датасеты', iconKey: 'datasets' },
        { id: 'report', label: 'Отчёт аналитики', iconKey: 'report' }
      ]

  return (
    <aside className="hidden md:flex w-16 md:w-20 bg-[#18191c] text-slate-400 flex-col items-center justify-between py-6 shrink-0 border-r border-slate-800/60 sticky top-0 h-screen select-none">
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
                className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-200 relative group ${isActive
                  ? 'bg-white/10  cursor-pointer text-white shadow-md'
                  : 'text-slate-500 cursor-pointer hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
              >
                {iconFn ? iconFn(isActive) : null}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-3 w-full px-2">
        {orgAvatar ? (
          <img
            src={orgAvatar}
            alt={orgName || 'Логотип'}
            title={orgName || 'Логотип организации'}
            className="w-10 h-10 rounded-full object-cover border border-slate-700/60 shadow-sm shrink-0"
          />
        ) : orgName ? (
          <div
            title={orgName}
            className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0"
          >
            {orgName.charAt(0).toUpperCase()}
          </div>
        ) : null}

        <button
          onClick={() => dispatch(logout())}
          title="Выйти из системы"
          className="h-10 w-10 rounded-xl text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          {ICONS.logout(false)}
        </button>
      </div>
    </aside>
  )
}
