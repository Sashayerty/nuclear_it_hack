import { useState, type FormEvent } from 'react'
import { useAppDispatch } from '../../store/hooks'
import { loginOrgThunk } from '../../store/slices/authSlice'

export const LoginForm = () => {
  const dispatch = useAppDispatch()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    dispatch(loginOrgThunk({ name, password }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Организация</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
        />
      </div>
      <button type="submit" className="w-full py-2 bg-sky-600 text-white font-semibold text-xs rounded-lg">
        Войти
      </button>
    </form>
  )
}
