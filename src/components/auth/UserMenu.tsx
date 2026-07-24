import React, { useState, useRef, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setAuthModalOpen, setAuthModalMode, logoutThunk } from '../../store/slices/authSlice'
import { addNotification } from '../../store/slices/appSlice'

export const UserMenu: React.FC = () => {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    dispatch(logoutThunk())
    setDropdownOpen(false)
    dispatch(
      addNotification({
        type: 'info',
        message: 'Вы успешно вышли из системы',
      })
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            dispatch(setAuthModalMode('login'))
            dispatch(setAuthModalOpen(true))
          }}
          className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-all"
        >
          Войти
        </button>
        <button
          onClick={() => {
            dispatch(setAuthModalMode('register'))
            dispatch(setAuthModalOpen(true))
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 rounded-lg shadow-md hover:shadow-sky-500/20 transition-all"
        >
          Регистрация
        </button>
      </div>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center space-x-3 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-xl px-3 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center font-bold text-white text-sm shadow-sm">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-semibold text-slate-200 leading-tight">{user.name}</div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>JWT Активен</span>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn">
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Профиль пользователя</p>
            <p className="text-sm font-medium text-slate-100 truncate mt-0.5">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            {user.role && (
              <span className="inline-block mt-2 px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider bg-sky-950 text-sky-400 border border-sky-800 rounded">
                {user.role}
              </span>
            )}
          </div>

          <div className="px-2 py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Выйти из аккаунта</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
