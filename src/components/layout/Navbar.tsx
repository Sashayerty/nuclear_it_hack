import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setActiveTab, type ActiveTab } from '../../store/slices/dashboardSlice'
import { logout } from '../../store/slices/authSlice'

export const Navbar = () => {
  const dispatch = useAppDispatch()
  const activeTab = useAppSelector((state) => state.dashboard.activeTab)
  const auth = useAppSelector((state) => state.auth)

  const navItems: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'auth', label: 'Авторизация', icon: '🔑' },
    { id: 'dashboard', label: 'Дашборд', icon: '📊' },
    { id: 'datasets', label: 'Датасеты', icon: '📁' },
    { id: 'report', label: 'Отчёт анализа', icon: '📄' },
    { id: 'admin', label: 'Администрирование', icon: '🛡️' }
  ]

  return (
    <header className="glass-panel sticky top-0 z-40 border-b border-slate-800/80 px-4 lg:px-8 py-3.5 mb-6 rounded-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>

            <p className="text-xs text-slate-400">Аналитика и категоризация запросов к ИИ</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-[6px] border border-slate-800/80">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => dispatch(setActiveTab(item.id))}
              className={`flex items-center gap-2 px-4 py-2 rounded-[6px] text-sm font-medium transition-all duration-200 ${activeTab === item.id
                ? 'bg-[#22b24c] text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-200">
              {auth.role === 'admin' ? `Admin: ${auth.adminLogin}` : auth.orgName || 'Организация'}
            </div>
            <div className="text-[10px] text-[#22b24c] font-medium">
              {auth.role === 'admin' ? 'Администратор системы' : 'Корпоративный аккаунт'}
            </div>
          </div>

          <button
            onClick={() => dispatch(logout())}
            className="px-3 py-1.5 rounded-[6px] text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>
    </header>
  )
}
