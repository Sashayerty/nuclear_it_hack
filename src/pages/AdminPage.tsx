import { useState, useEffect, type FormEvent } from 'react'
import { apiService } from '../api/client'
import type { Organization } from '../api/types'

export const AdminPage = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgPassword, setNewOrgPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadOrganizations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiService.getAdminOrganizations()
      setOrganizations(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось загрузить список организаций')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrganizations()
  }, [])

  const handleCreateOrg = async (e: FormEvent) => {
    e.preventDefault()
    if (!newOrgName || !newOrgPassword) return

    setError(null)
    setSuccess(null)
    try {
      const created = await apiService.createOrganization(newOrgName, newOrgPassword)
      setOrganizations([created, ...organizations])
      setSuccess(`Организация "${created.name}" успешно создана`)
      setNewOrgName('')
      setNewOrgPassword('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка при создании организации')
    }
  }

  const handleDeleteOrg = async (id: number, name: string) => {
    if (!confirm(`Удалить организацию "${name}"?`)) return

    try {
      await apiService.deleteOrganization(id)
      setOrganizations(organizations.filter((o) => o.id !== id))
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Нельзя удалить организацию с привязанными данными')
    }
  }

  return (
    <div className="space-y-6 pb-6 font-sans">
      <div>
        <h2 className="text-base font-medium text-slate-900 tracking-tight">
          Панель администратора
        </h2>
        <p className="text-xs font-regular text-slate-500 mt-0.5">
          Управление организациями и доступом к системе
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-[6px] bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-[6px] bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          ✅ {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-[6px] p-6 border border-slate-100 space-y-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-900">Создать новую организацию</h3>

          <form onSubmit={handleCreateOrg} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1.5">
                Название организации
              </label>
              <input
                type="text"
                required
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="ООО АтомИТ"
                className="w-full bg-slate-50 border border-slate-200 rounded-[6px] px-4 py-2.5 text-xs font-regular text-slate-800 focus:outline-none focus:border-[#22b24c]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1.5">
                Пароль
              </label>
              <input
                type="password"
                required
                value={newOrgPassword}
                onChange={(e) => setNewOrgPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-[6px] px-4 py-2.5 text-xs font-regular text-slate-800 focus:outline-none focus:border-[#22b24c]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#22b24c] hover:bg-[#1ea143] text-white font-medium text-xs rounded-[6px] transition-colors"
            >
              Создать аккаунт организации
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[6px] border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-medium text-slate-800 uppercase tracking-wider">
              Зарегистрированные организации ({organizations.length})
            </h3>
            <button
              onClick={loadOrganizations}
              className="text-xs text-[#22b24c] hover:underline font-medium"
            >
              Обновить
            </button>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs font-regular text-slate-400">
              Загрузка списка...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider border-b border-slate-100 font-medium">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">ID</th>
                    <th className="px-5 py-3.5 font-medium">Название</th>
                    <th className="px-5 py-3.5 font-medium">Дата регистрации</th>
                    <th className="px-5 py-3.5 text-right font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {organizations.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-slate-400">#{org.id}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">{org.name}</td>
                      <td className="px-5 py-3.5 font-regular text-slate-500">
                        {org.created_at ? new Date(org.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteOrg(org.id, org.name)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-[6px] text-xs font-medium transition-colors"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
