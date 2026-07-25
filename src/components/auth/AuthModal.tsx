import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setAuthModalOpen } from '../../store/slices/authSlice'

export const AuthModal = () => {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.auth.isAuthModalOpen)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700 shadow-2xl text-center space-y-4">
        <h3 className="text-lg font-bold text-white">Требуется авторизация</h3>
        <p className="text-xs text-slate-400">Пожалуйста, войдите под аккаунтом вашей организации</p>
        <button
          onClick={() => dispatch(setAuthModalOpen(false))}
          className="px-4 py-2 bg-sky-600 text-white font-semibold text-xs rounded-xl"
        >
          Закрыть
        </button>
      </div>
    </div>
  )
}
