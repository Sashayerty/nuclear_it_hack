import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './store/hooks'
import type { RootState } from './store'
import { setCategory, setSearchQuery } from './store/slices/filterSlice'
import { addNotification } from './store/slices/appSlice'
import { checkAuthThunk, logoutThunk, setAuthModalOpen } from './store/slices/authSlice'
import { UserMenu } from './components/auth/UserMenu'
import { AuthModal } from './components/auth/AuthModal'
import { tokenStorage } from './utils/tokenStorage'

function App() {
  const dispatch = useAppDispatch()
  const filter = useAppSelector((state: RootState) => state.filter)
  const notifications = useAppSelector((state: RootState) => state.app.notifications)
  const auth = useAppSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(checkAuthThunk())

    const handleUnauthorized = () => {
      dispatch(logoutThunk())
      dispatch(
        addNotification({
          type: 'warning',
          message: 'Сессия истекла. Пожалуйста, войдите снова.',
        })
      )
      dispatch(setAuthModalOpen(true))
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [dispatch])

  const categories = [
    'Генерация текста',
    'Помощь с кодом',
    'Анализ данных / SQL',
    'Объяснение / Обучение',
    'Поиск / Сбор информации',
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="border-b border-slate-800 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sky-400">Промпт-Радар: ИИ Аналитика</h1>
            <p className="text-slate-400 mt-1">Redux Toolkit + React Query + Axios + JWT Auth</p>
          </div>
          <UserMenu />
        </header>

        <section className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg space-y-4">
          <h2 className="text-xl font-semibold text-slate-200">Фильтры (Redux Store State)</h2>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-slate-400 self-center mr-2">Категория:</span>
            <button
              onClick={() => dispatch(setCategory(null))}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter.selectedCategory === null
                  ? 'bg-sky-600 text-white font-medium'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Все
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => dispatch(setCategory(cat))}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filter.selectedCategory === cat
                    ? 'bg-sky-600 text-white font-medium'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-4 items-center pt-2">
            <input
              type="text"
              placeholder="Поиск по промптам..."
              value={filter.searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 flex-1"
            />
            <button
              onClick={() =>
                dispatch(
                  addNotification({
                    type: 'info',
                    message: `Фильтры обновлены: ${filter.selectedCategory || 'Все категории'}`,
                  })
                )
              }
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Уведомление
            </button>
          </div>
        </section>

        <section className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-300">Текущее состояние Redux & JWT Auth</h3>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                auth.isAuthenticated
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              {auth.isAuthenticated ? 'Авторизован' : 'Гость (Не авторизован)'}
            </span>
          </div>
          <pre className="bg-slate-950 p-4 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800">
            {JSON.stringify(
              {
                auth: {
                  isAuthenticated: auth.isAuthenticated,
                  user: auth.user,
                  hasAccessToken: Boolean(tokenStorage.getAccessToken()),
                  hasRefreshToken: Boolean(tokenStorage.getRefreshToken()),
                },
                filter,
                notificationCount: notifications.length,
              },
              null,
              2
            )}
          </pre>
        </section>

        {notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="bg-sky-950 border border-sky-700 text-sky-200 px-4 py-3 rounded-lg text-sm flex justify-between items-center animate-fadeIn"
              >
                <span>{n.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <AuthModal />
    </div>
  )
}

export default App
