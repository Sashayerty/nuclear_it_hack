import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchDashboardThunk, setActiveTab } from '../store/slices/dashboardSlice'

export const DashboardPage = () => {
  const dispatch = useAppDispatch()
  const { dashboard, isLoading } = useAppSelector((state) => state.dashboard)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    dispatch(fetchDashboardThunk())
  }, [dispatch])

  if (isLoading && !dashboard) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#7cb0f8] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-500">Загрузка данных аналитики...</span>
        </div>
      </div>
    )
  }

  const categories = dashboard?.categories || []
  const topUseCases = dashboard?.top_use_cases || []
  const topPainPoints = dashboard?.top_pain_points || []
  const automationCandidates = dashboard?.automation_candidates || []

  const filteredCategories = selectedCategory === 'all'
    ? categories
    : categories.filter(c => c.name.toLowerCase().includes(selectedCategory.toLowerCase()))

  return (
    <div className="space-y-6 pb-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-slate-100 shadow-sm gap-4">
        <button
          onClick={() => dispatch(setActiveTab('datasets'))}
          className="px-4 py-2 bg-[#7cb0f8] hover:bg-[#689fe7] text-white text-xs font-medium rounded-md transition-colors shadow-sm shrink-0"
        >
          + Загрузить датасет
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Всего промптов</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {(dashboard?.total_requests || 0).toLocaleString('ru-RU')}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Обработано датасетов</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {dashboard?.analyzed_datasets ?? 1}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Ошибки & Баги</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-600">
              {dashboard?.broken_queries_count || 0}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Потенциал автоматизации</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {automationCandidates.length}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Распределение промптов по категориям</h3>
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${selectedCategory === 'all'
                    ? 'bg-[#7cb0f8] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Все
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${selectedCategory === cat.name
                      ? 'bg-[#7cb0f8] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {cat.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {filteredCategories.map((cat, idx) => {
                const colors = ['bg-[#7cb0f8]', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500']
                const barColor = colors[idx % colors.length]

                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">{cat.name}</span>
                      <span className="text-slate-500 font-semibold">{cat.requests} зап. ({cat.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Топ сценариев использования (Use Cases)</h3>
              <span className="text-xs text-slate-400">По частоте запросов</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-medium border-b border-slate-100 pb-2">
                    <th className="pb-3 font-medium">Сценарий использования</th>
                    <th className="pb-3 font-medium text-right">Запросов</th>
                    <th className="pb-3 font-medium text-right">Доля</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {topUseCases.map((uc, i) => {
                    const totalReq = dashboard?.total_requests || 1
                    const pct = Math.round((uc.requests / totalReq) * 100)
                    return (
                      <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 font-medium text-slate-800 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px]">
                            {i + 1}
                          </span>
                          {uc.name}
                        </td>
                        <td className="py-3 text-right font-semibold text-slate-900">{uc.requests}</td>
                        <td className="py-3 text-right text-slate-500">{pct}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">

          <div className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Основные проблемы пользователей</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-medium">Критично</span>
            </div>

            <div className="space-y-3">
              {topPainPoints.map((pt, i) => (
                <div key={i} className="p-3 rounded-md bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-xs font-medium text-slate-800">{pt.text}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Упоминаний в промптах:</span>
                    <span className="font-bold text-rose-600">{pt.mentions}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Потенциал автоматизации</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium">Рекомендации</span>
            </div>

            <div className="space-y-3">
              {automationCandidates.map((ac, i) => (
                <div key={i} className="p-3 rounded-md bg-blue-50/50 border border-blue-100 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900">{ac.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                      {ac.automation_potential}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Запросов: <strong className="text-slate-800">{ac.requests}</strong>
                  </div>
                  {(() => {
                    const actions = Array.isArray(ac.suggested_actions)
                      ? ac.suggested_actions
                      : ac.suggested_actions
                      ? [ac.suggested_actions]
                      : []
                    if (actions.length === 0) return null
                    return (
                      <div className="pt-1 border-t border-blue-100/60">
                        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Действие:</div>
                        <ul className="text-[11px] text-slate-700 list-disc list-inside space-y-0.5">
                          {actions.map((act, actIdx) => (
                            <li key={actIdx}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  })()}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
