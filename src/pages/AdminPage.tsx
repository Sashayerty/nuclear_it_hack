import { useState, useEffect, type FormEvent } from 'react'
import { apiService } from '../api/client'
import type { Organization } from '../api/types'

export const AdminPage = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgPassword, setNewOrgPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newOrgAvatar, setNewOrgAvatar] = useState<string | null>(null)
  const [searchQuery] = useState('')
  const [perPage, setPerPage] = useState<number>(5)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadOrganizations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiService.getAdminOrganizations()
      setOrganizations(data)
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (detail) {
        setError(typeof detail === 'string' ? detail : JSON.stringify(detail))
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Сервер недоступен. Убедитесь, что бэкенд запущен (http://localhost:8000).')
      } else {
        setError(err.message || 'Не удалось загрузить список организаций')
      }
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
    setIsSubmitting(true)
    try {
      const created = await apiService.createOrganization(newOrgName, newOrgPassword)
      if (newOrgAvatar) {
        try {
          localStorage.setItem(`org_avatar_${created.id}`, newOrgAvatar)
          localStorage.setItem(`org_avatar_${created.name}`, newOrgAvatar)
        } catch (e) {
          console.error('Failed to save avatar to localStorage', e)
        }
      }
      setOrganizations([created, ...organizations])
      setSuccess(`Организация "${created.name}" успешно создана`)
      setNewOrgName('')
      setNewOrgPassword('')
      setNewOrgAvatar(null)
      setIsModalOpen(false)
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        setError(detail)
      } else if (Array.isArray(detail)) {
        const msg = detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
        setError(msg || 'Ошибка при создании организации')
      } else {
        setError(err.message || 'Ошибка при создании организации')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteOrg = async (id: number, name: string) => {
    if (!confirm(`Удалить организацию "${name}"?`)) return

    try {
      await apiService.deleteOrganization(id)
      localStorage.removeItem(`org_avatar_${id}`)
      localStorage.removeItem(`org_avatar_${name}`)
      setOrganizations(organizations.filter((o) => o.id !== id))
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Нельзя удалить организацию с привязанными данными')
    }
  }

  const filteredOrgs = organizations.filter((o) =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredOrgs.length / perPage) || 1
  const paginatedOrgs = filteredOrgs.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  )

  const getOrgAvatar = (id: number, name: string): string | null => {
    return localStorage.getItem(`org_avatar_${id}`) || localStorage.getItem(`org_avatar_${name}`)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-4 pb-2 font-sans text-slate-800 selection:bg-[#10c885] selection:text-white w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl font-medium text-black tracking-tight">
            Организации
          </h1>

        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setError(null)
              setSuccess(null)
              setNewOrgAvatar(null)
              setIsModalOpen(true)
            }}
            title="Добавить новую организацию"
            className="h-8 rounded-[5px] px-3 bg-black text-white font-regular text-[13px] flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            Добавить организацию
          </button>
        </div>
      </div>

      <div className="rounded-[9px] overflow-x-auto">
        <table className="w-full min-w-[500px] bg-[#E2E3E7]/63 text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-4 py-2.5 text-left font-semibold text-black/30 uppercase">
                <div className="flex items-center gap-1">
                  Название
                  <span className="flex flex-col ml-0.5">
                    <button type="button" className="text-[6px] leading-none text-black/20 cursor-default">▲</button>
                    <button type="button" className="text-[6px] leading-none text-black/20 cursor-default">▼</button>
                  </span>
                </div>
              </th>
              <th className="px-4 py-2.5 text-left font-semibold text-black/30 uppercase">
                <div className="flex items-center gap-1">
                  ID
                  <span className="flex flex-col ml-0.5">
                    <button type="button" className="text-[6px] leading-none text-black/20 cursor-default">▲</button>
                    <button type="button" className="text-[6px] leading-none text-black/20 cursor-default">▼</button>
                  </span>
                </div>
              </th>
              <th className="px-4 py-2.5 text-left font-semibold text-black/30 uppercase">
                <div className="flex items-center gap-1">
                  Статус
                  <span className="flex flex-col ml-0.5">
                    <button type="button" className="text-[6px] leading-none text-black/20 cursor-default">▲</button>
                    <button type="button" className="text-[6px] leading-none text-black/20 cursor-default">▼</button>
                  </span>
                </div>
              </th>
              <th className="px-4 py-2.5 text-left font-semibold text-black/30 uppercase">
                <div className="flex items-center gap-1">
                  Дата создания
                  <span className="flex flex-col ml-0.5">
                    <button type="button" className="text-[6px] leading-none text-black/20 cursor-default">▲</button>
                    <button type="button" className="text-[6px] leading-none text-black/20 cursor-default">▼</button>
                  </span>
                </div>
              </th>
              <th className="px-4 py-2.5 text-right font-semibold text-black/30 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs font-medium text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-7 h-7 border-2 border-[#10c885] border-t-transparent rounded-full animate-spin" />
                    <span>Загрузка списка организаций...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs font-medium text-rose-600">
                  <div className="flex flex-col items-center gap-3">
                    <span>{error}</span>
                    <button
                      onClick={loadOrganizations}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md font-semibold cursor-pointer transition-colors"
                    >
                      Повторить попытку
                    </button>
                  </div>
                </td>
              </tr>
            ) : paginatedOrgs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs font-medium text-slate-400">
                  Организации не найдены
                </td>
              </tr>
            ) : (
              paginatedOrgs.map((org) => (
                <tr key={org.id} className="border-b bg-[#F2F2F2] border-black/7 last:border-b-0 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {getOrgAvatar(org.id, org.name) ? (
                        <img
                          src={getOrgAvatar(org.id, org.name)!}
                          alt={org.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-[10px] font-bold shrink-0">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-black">{org.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-black/40">
                    {String(org.id).padStart(2, '0')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-black font-medium">
                      Норма
                    </span>
                  </td>
                  <td className="px-4 py-3 text-black font-medium">
                    {formatDate(org.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteOrg(org.id, org.name)}
                      className="text-rose-500 hover:text-rose-700 text-xs font-black transition-colors cursor-pointer"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-[12px] p-4 max-w-[440px] w-full shadow-2xl relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-base font-bold text-black">
                Создать организацию
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-black/30 hover:text-black/20 transition-colors p-1 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Логотип организации
                </label>
                <label
                  htmlFor="avatar-upload"
                  className="border border-slate-200 rounded-[8px] p-5 text-center cursor-pointer hover:border-slate-300 transition-colors flex flex-col items-center justify-center gap-1.5 bg-white block"
                >
                  {newOrgAvatar ? (
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={newOrgAvatar}
                        alt="Preview"
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <span className="text-xs text-black/30 font-medium">Файл выбран (нажмите для замены)</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-slate-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94a3 3 0 114.243 4.243L8.587 18.315a1.5 1.5 0 01-2.122-2.122l8.835-8.836" />
                      </svg>
                      <span className="text-sm text-black/30 font-normal">Прикрепите файл</span>
                    </>
                  )}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setNewOrgAvatar(reader.result as string)
                        }
                        reader.readAsDataURL(file)
                      } else {
                        setNewOrgAvatar(null)
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Название организации
                </label>
                <input
                  type="text"
                  required
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Название"
                  className="w-full border border-slate-200 rounded-[8px] px-3.5 py-2.5 text-sm text-black placeholder:text-black/30 outline-none focus:border-[#10B981] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Пароль
                </label>
                <input
                  type="password"
                  required
                  value={newOrgPassword}
                  onChange={(e) => setNewOrgPassword(e.target.value)}
                  placeholder="********"
                  className="w-full border border-slate-200 rounded-[8px] px-3.5 py-2.5 text-sm text-black placeholder:text-black/30 outline-none focus:border-[#10B981] transition-all"
                />
              </div>

              <div className="pt-4 mt-5 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 bg-[#10B981] hover:bg-[#0e9f6e] active:bg-[#059669] text-white font-semibold text-sm rounded-[6px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Создать</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
