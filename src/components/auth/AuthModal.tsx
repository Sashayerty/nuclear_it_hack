import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setAuthModalOpen, setAuthModalMode } from '../../store/slices/authSlice'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export const AuthModal: React.FC = () => {
  const dispatch = useAppDispatch()
  const { authModalOpen, authModalMode } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && authModalOpen) {
        dispatch(setAuthModalOpen(false))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [authModalOpen, dispatch])

  if (!authModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => dispatch(setAuthModalOpen(false))}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
          aria-label="Закрыть"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center space-y-1 pt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">
            {authModalMode === 'login' ? 'Вход в Промпт-Радар' : 'Создание аккаунта'}
          </h2>
          <p className="text-xs text-slate-400">
            {authModalMode === 'login'
              ? 'Введите ваши учетные данные для получения JWT токена'
              : 'Заполните форму для регистрации нового пользователя'}
          </p>
        </div>

        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => dispatch(setAuthModalMode('login'))}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              authModalMode === 'login'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Войти
          </button>
          <button
            onClick={() => dispatch(setAuthModalMode('register'))}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              authModalMode === 'register'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Регистрация
          </button>
        </div>

        {authModalMode === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  )
}
