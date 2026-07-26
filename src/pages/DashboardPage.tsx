import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchDashboardThunk, setActiveTab } from '../store/slices/dashboardSlice'
import {
  Database, Zap, TrendingUp, UploadCloud, LayoutTemplate,
  Layers, Sparkles, CheckCircle2, ChevronRight, BarChart3, MoreVertical
} from 'lucide-react'

const GaugeCircle = ({ percentage = 0 }: { percentage?: number }) => {
  const radius = 17
  const circumference = 2 * Math.PI * radius
  const displayPercentage = Math.max(0, Math.min(100, Math.round(percentage)))
  const strokeDashoffset = circumference * (1 - displayPercentage / 100)

  return (
    <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
      <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={radius}
          className="stroke-blue-100/70"
          strokeWidth="3.5"
          fill="transparent"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          className="stroke-[#2563eb] transition-all duration-700 ease-out"
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <span className="absolute text-[11px] font-bold text-slate-800">{displayPercentage}%</span>
    </div>
  )
}

export const DashboardPage = () => {
  const dispatch = useAppDispatch()
  const { dashboard, isLoading } = useAppSelector((state) => state.dashboard)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    dispatch(fetchDashboardThunk())
  }, [dispatch])

  if (isLoading && !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center py-24 min-h-[400px]">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="relative w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        <span className="mt-6 text-sm font-semibold tracking-widest text-slate-400 uppercase">Сбор AI-аналитики...</span>
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

  const totalRequests = dashboard?.total_requests || 0
  const brokenCount = dashboard?.broken_queries_count || 0
  const analyzedDatasets = dashboard?.analyzed_datasets || 0
  const tokensUsed = dashboard?.total_tokens_used || 0
  const netRoi = dashboard?.net_roi_rub || 0
  const totalCost = dashboard?.total_cost_rub || 0

  const promptsSuccessPct = totalRequests > 0
    ? Math.max(0, Math.min(100, Math.round(((totalRequests - brokenCount) / totalRequests) * 100)))
    : 0

  const datasetsPct = analyzedDatasets > 0
    ? Math.min(100, Math.round((analyzedDatasets / (analyzedDatasets + (brokenCount ? 1 : 0))) * 100))
    : 0

  const tokensPct = tokensUsed > 0
    ? Math.min(100, Math.round((tokensUsed / (totalRequests > 0 ? totalRequests * 1000 : 50000)) * 100))
    : 0

  const roiPct = totalCost > 0
    ? Math.min(100, Math.round((netRoi / totalCost) * 100))
    : (netRoi > 0 ? 100 : 0)

  const errorsPct = totalRequests > 0
    ? Math.min(100, Math.round((brokenCount / totalRequests) * 100))
    : 0

  const topCards = [
    {
      title: 'Всего промптов',
      value: (dashboard?.total_requests ?? 0).toLocaleString('ru-RU'),
      percentage: promptsSuccessPct
    },
    {
      title: 'Обработано датасетов',
      value: (dashboard?.analyzed_datasets ?? 0).toLocaleString('ru-RU'),
      percentage: datasetsPct
    },
    {
      title: 'Потрачено токенов',
      value: (dashboard?.total_tokens_used ?? 0).toLocaleString('ru-RU'),
      percentage: tokensPct
    },
    {
      title: 'ROI',
      value: (dashboard?.net_roi_rub ?? 0).toLocaleString('ru-RU'),
      percentage: roiPct
    },
    {
      title: 'Ошибки и баги',
      value: (dashboard?.broken_queries_count ?? 0).toLocaleString('ru-RU'),
      percentage: errorsPct
    }
  ]

  return (
    <div className="space-y-6 pb-10 font-sans text-slate-800">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3 ml-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">Аналитика ИИ-помощника</h2>
          </div>
        </div>
        <button
          onClick={() => dispatch(setActiveTab('datasets'))}
          className="group relative flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 shrink-0 overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <UploadCloud size={16} />
          <span>Загрузить датасет</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
        {topCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden min-h-[145px]"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs text-slate-500 font-medium leading-tight">{card.title}</span>
              <button className="text-slate-700 hover:text-slate-900 transition-colors p-0.5 shrink-0 ml-1">
                <MoreVertical size={16} />
              </button>
            </div>

            <div className="flex items-end justify-between mt-4">
              <div>
                <div className="text-3xl font-bold text-slate-900 leading-none mb-1">
                  {card.value}
                </div>
                <div className="text-[12px] text-slate-400 font-normal">
                  За последнее время
                </div>
              </div>
              <GaugeCircle percentage={card.percentage} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[155px]">
              <div>
                <div className="text-xs text-slate-400 font-medium mb-1">Затраты</div>
                <div className="text-sm font-bold text-slate-900 leading-snug">Сколько потрачено на ИИ</div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mt-6">
                {dashboard?.total_cost_rub ? `${dashboard.total_cost_rub.toLocaleString('ru-RU')} ₽` : '0 ₽'}
              </div>
            </div>

            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[155px]">
              <div>
                <div className="text-xs text-slate-400 font-medium mb-1">Время</div>
                <div className="text-sm font-bold text-slate-900 leading-snug">Сэкономлено времени</div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mt-6 flex items-baseline gap-1.5">
                <span>
                  {dashboard?.minutes_saved_net
                    ? Math.round(dashboard.minutes_saved_net / 60)
                    : 0}
                </span>
                <span className="text-base font-medium text-slate-900">часов</span>
              </div>
            </div>

          </div>

          <div className="bg-white rounded-[20px] p-6 border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-indigo-500" size={20} />
                <h3 className="text-base font-bold text-slate-900">Распределение промптов по категориям</h3>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === 'all'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                >
                  Все
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === cat.name
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                  >
                    {cat.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredCategories.map((cat, idx) => {
                const colors = [
                  'from-indigo-500 to-blue-500',
                  'from-emerald-400 to-teal-500',
                  'from-amber-400 to-orange-500',
                  'from-purple-500 to-pink-500',
                  'from-cyan-400 to-blue-500'
                ]
                const gradColor = colors[idx % colors.length]

                return (
                  <div key={cat.name} className="group relative">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-semibold text-slate-700">{cat.name}</span>
                      <span className="text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded-md">{cat.requests} зап. ({cat.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${gradColor} transition-all duration-1000 ease-out group-hover:brightness-110`}
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Layers className="text-indigo-500" size={20} />
                <h3 className="text-base font-bold text-slate-900">Топ сценариев (Use Cases)</h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-slate-400 font-semibold border-b border-slate-100">
                    <th className="pb-3 px-2">Сценарий использования</th>
                    <th className="pb-3 px-2 text-right">Запросов</th>
                    <th className="pb-3 px-2 text-right">Доля</th>
                  </tr>
                </thead>
                <tbody>
                  {topUseCases.map((uc, i) => {
                    const totalReq = dashboard?.total_requests || 1
                    const pct = Math.round((uc.requests / totalReq) * 100)
                    return (
                      <tr key={i} className="group bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <td className="p-3 rounded-l-xl font-medium text-slate-800 flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-600' :
                            i === 1 ? 'bg-slate-200 text-slate-600' :
                              i === 2 ? 'bg-orange-100 text-orange-600' :
                                'bg-white border border-slate-200 text-slate-400'
                            }`}>
                            {i + 1}
                          </span>
                          <span className="line-clamp-2 leading-snug">{uc.name}</span>
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">{uc.requests}</td>
                        <td className="p-3 rounded-r-xl text-right">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-100 rounded-lg text-slate-500 font-semibold text-xs shadow-sm">
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <div className="space-y-6">

          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">Боли пользователей</h3>

            <div className="space-y-4">
              {topPainPoints.length > 0 ? (
                topPainPoints.map((pt, i) => (
                  <div key={i} className={`p-4 rounded-xl space-y-3 ${i === 0 ? 'bg-[#f4f4f6]' : 'bg-[#f4f4f6]/70'}`}>
                    <p className={`text-xs leading-relaxed font-medium ${i === 0 ? 'text-slate-800' : 'text-slate-500'}`}>
                      {pt.text}
                    </p>
                    <div>
                      <span className="inline-block bg-[#fee2e2] text-[#e11d48] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                        Упоминаний - {pt.mentions || 1}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="p-4 rounded-xl bg-[#f4f4f6] space-y-3">
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      Потеря времени на ручной сбор данных (копирование, вставка, переключение между системами).
                    </p>
                    <div>
                      <span className="inline-block bg-[#fee2e2] text-[#e11d48] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                        Упоминаний - 1
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#f4f4f6]/70 space-y-3">
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      Необходимость синтезировать информацию из разрозненных источников (почта, CRM, календари) для принятия решений.
                    </p>
                    <div>
                      <span className="inline-block bg-[#fee2e2]/70 text-[#e11d48]/80 text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                        Упоминаний - 1
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-6 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900">Что автоматизировать?</h3>
              <Sparkles className="text-indigo-500" size={20} />
            </div>

            <div className="space-y-4">
              {automationCandidates.map((ac, i) => {
                const isHigh = ac.automation_potential.toLowerCase().includes('высок') || ac.automation_potential.toLowerCase().includes('high')
                const badgeColor = isHigh ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                const cardColor = isHigh ? 'border-emerald-100 hover:border-emerald-300' : 'border-blue-100 hover:border-blue-300'

                return (
                  <div key={i} className={`p-4 rounded-xl bg-white border shadow-sm transition-all ${cardColor}`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="text-sm font-bold text-slate-900 leading-tight">{ac.name}</span>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md border uppercase tracking-wider shrink-0 ${badgeColor}`}>
                        {ac.automation_potential.split(' ')[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-3">
                      <Database size={14} className="text-slate-400" />
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
                        <div className="pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-2">
                            <CheckCircle2 size={12} /> Действия
                          </div>
                          <ul className="text-xs text-slate-600 space-y-2">
                            {actions.map((act, actIdx) => (
                              <li key={actIdx} className="flex items-start gap-2">
                                <ChevronRight size={14} className="text-slate-300 shrink-0 mt-0.5" />
                                <span className="leading-snug">{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })()}
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
