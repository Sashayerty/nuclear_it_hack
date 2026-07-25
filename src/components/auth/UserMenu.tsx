import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'

export const UserMenu = () => {
  const dispatch = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)

  return (
    <div className="flex items-center gap-3">
      <div className="text-xs font-semibold text-slate-200">
        {auth.role === 'admin' ? `Admin: ${auth.adminLogin}` : auth.orgName || 'Гость'}
      </div>
      {auth.isAuthenticated && (
        <button
          onClick={() => dispatch(logout())}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
        >
          Выйти
        </button>
      )}
    </div>
  )
}
