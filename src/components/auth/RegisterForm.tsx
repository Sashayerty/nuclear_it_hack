import { useState, type FormEvent } from 'react'

export const RegisterForm = () => {
  const [name, setName] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Название организации</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
        />
      </div>
      <button type="submit" className="w-full py-2 bg-sky-600 text-white font-semibold text-xs rounded-lg">
        Зарегистрировать
      </button>
    </form>
  )
}
