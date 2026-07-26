import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setActiveTab, type ActiveTab } from '../../store/slices/dashboardSlice'
import { logout } from '../../store/slices/authSlice'

export const HeaderBar = () => {
  const dispatch = useAppDispatch()
  const activeTab = useAppSelector((state) => state.dashboard.activeTab)
  const auth = useAppSelector((state) => state.auth)

  const navItems: { id: ActiveTab; label: string }[] =
    auth.role === 'admin'
      ? [{ id: 'admin', label: 'Панель администратора' }]
      : [
        { id: 'dashboard', label: 'Дашборд' },
        { id: 'datasets', label: 'Датасеты' },
        { id: 'report', label: 'Отчёт аналитики' }
      ]

  return (
    <header className="w-full pb-2 md:hidden">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-0.5 max-w-full">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => dispatch(setActiveTab(item.id))}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#18191c] text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          )
        })}

        <button
          onClick={() => dispatch(logout())}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all cursor-pointer"
        >
          Выйти
        </button>
      </div>
    </header>
  )
}
