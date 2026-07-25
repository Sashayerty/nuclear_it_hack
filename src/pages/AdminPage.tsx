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
      setOrganizations([created, ...organizations])
      setSuccess(`Организация "${created.name}" успешно создана`)
      setNewOrgName('')
      setNewOrgPassword('')
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-4 pb-2 font-sans text-slate-800 selection:bg-[#10c885] selection:text-white max-w-7xl mx-auto">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span>⚠️ {error}</span>
            <button
              onClick={loadOrganizations}
              className="underline font-semibold hover:text-rose-900 cursor-pointer ml-2"
            >
              Повторить
            </button>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-700 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-medium flex items-center justify-between shadow-xs">
          <span>✅ {success}</span>
          <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-700 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Организации
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Управление аккаунтами и доступом к данным
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setError(null)
              setSuccess(null)
              setIsModalOpen(true)
            }}
            title="Добавить новую организацию"
            className="h-8 rounded-[5px] px-3 bg-black text-white font-regular text-[13px] flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            Добавить организацию
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="hidden md:grid grid-cols-12 px-4 py-1.5 text-xs font-semibold text-black/30">
          <div className="col-span-4">Организация</div>
          <div className="col-span-3 text-center">Статус</div>
          <div className="col-span-3 text-center">Дата регистрации</div>
          <div className="col-span-2 text-right">Действия</div>
        </div>

        {isLoading ? (
          <div className="py-8 px-4 bg-white rounded-xl border border-slate-100 text-center text-xs font-medium text-slate-400 flex flex-col items-center gap-3 shadow-xs">
            <div className="w-7 h-7 border-2 border-[#10c885] border-t-transparent rounded-full animate-spin" />
            <span>Загрузка списка организаций...</span>
          </div>
        ) : error ? (
          <div className="py-8 px-4 bg-white rounded-xl border border-rose-100 text-center text-xs font-medium text-rose-600 shadow-xs flex flex-col items-center gap-3">
            <span>⚠️ {error}</span>
            <button
              onClick={loadOrganizations}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md font-semibold cursor-pointer transition-colors"
            >
              Повторить попытку
            </button>
          </div>
        ) : paginatedOrgs.length === 0 ? (
          <div className="py-8 px-4 bg-white rounded-xl border border-black/10 text-center text-xs font-medium text-slate-400 shadow-xs">
            Организации не найдены
          </div>
        ) : (
          paginatedOrgs.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-[6px] px-4 py-3 border border-slate-100 transition-all flex flex-col md:grid md:grid-cols-12 items-center gap-4 group"
            >
              <div className="md:col-span-4 w-full">
                <div className="text-base font-bold text-slate-900 transition-colors">
                  {org.name}
                </div>
                <div className="text-xs text-black/30 font-medium mt-0.5">
                  Корпоративный аккаунт • ID: #{org.id}
                </div>
              </div>

              <div className="md:col-span-3 w-full flex md:justify-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 text-black text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Норма
                </span>
              </div>

              <div className="md:col-span-3 w-full flex md:justify-center text-xs font-medium text-black">
                {formatDate(org.created_at)}
              </div>

              <div className="md:col-span-2 w-full flex justify-end">
                <button
                  onClick={() => handleDeleteOrg(org.id, org.name)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-[4px] text-xs font-semibold transition-all cursor-pointer"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span>per page</span>
        </div>

        <div className="flex items-center gap-4">
          <span>
            {filteredOrgs.length === 0
              ? '0 of 0'
              : `${(currentPage - 1) * perPage + 1}-${Math.min(
                currentPage * perPage,
                filteredOrgs.length
              )} of ${filteredOrgs.length}`}
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 text-slate-400 hover:text-slate-900 disabled:opacity-30 cursor-pointer font-bold"
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${page === currentPage
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100'
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2 py-1 text-slate-400 hover:text-slate-900 disabled:opacity-30 cursor-pointer font-bold"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-[20px] p-4 max-w-md w-full shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-[15px] font-medium text-slate-900">
                  Добавить новую организацию
                </h3>
                <h3 className="text-[13px] font-medium text-slate-900/30">
                  Создание аккаунта организации
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer text-base font-bold rounded-xl mr-2 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Название организации"
                  className="w-full bg-black/2 border border-black/10 rounded-[4px] px-4 py-3 text-xs text-black font-medium placeholder-black/30 outline-none focus:border-[#10c885] focus:bg-white transition-all"
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  value={newOrgPassword}
                  onChange={(e) => setNewOrgPassword(e.target.value)}
                  placeholder="Пароль доступа"
                  className="w-full bg-black/2 border border-black/10 rounded-[4px] px-4 py-3 text-xs text-black font-medium placeholder-black/30 outline-none focus:border-[#10c885] focus:bg-white transition-all"
                />
              </div>

              <div className="flex flex-col items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 w-full border border-slate-200 hover:border-slate-300 text-slate-600 font-semibold text-xs rounded-[4px] transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 w-full bg-[#10c885] hover:bg-[#0eb779] active:bg-[#0ca76e] text-white font-semibold text-xs rounded-[4px] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Создать аккаунт</span>
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
