import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setActiveTab } from '../store/slices/dashboardSlice'

export const ReportPage = () => {
  const dispatch = useAppDispatch()
  const { currentReport, isReportLoading } = useAppSelector((state) => state.dashboard)
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual')
  const [copied, setCopied] = useState(false)

  if (isReportLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 font-sans">
        <div className="h-10 w-10 border-4 border-[#7cb0f8] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Загрузка отчёта анализа с бэкенда...</p>
      </div>
    )
  }

  if (!currentReport) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-xl border border-slate-100 p-12 text-center shadow-sm space-y-4 font-sans">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-[#7cb0f8] flex items-center justify-center text-xl font-bold">
          📑
        </div>
        <div className="space-y-1 max-w-md">
          <h3 className="text-base font-semibold text-slate-900">Отчёт не выбран</h3>
          <p className="text-xs text-slate-500">
            Перейдите в раздел «Датасеты» и нажмите кнопку «📄 Отчёт» у обработанного датасета, чтобы загрузить аналитический отчёт.
          </p>
        </div>
        <button
          onClick={() => dispatch(setActiveTab('datasets'))}
          className="px-4 py-2 bg-[#7cb0f8] hover:bg-[#689fe7] text-white text-xs font-medium rounded-lg transition-all shadow-sm"
        >
          Перейти к датасетам →
        </button>
      </div>
    )
  }

  const { dataset, analysis, report } = currentReport
  const jsonString = JSON.stringify(currentReport, null, 2)

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report_${dataset.id}_${dataset.name.replace(/\s+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-900">Отчёт анализа: {dataset.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Завершено • AI Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Анализ ID #{analysis.id} | Записей в логе: {dataset.rows_count || '—'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'visual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📊 Визуальный вид
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'json' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Код JSON
            </button>
          </div>

          <button
            onClick={() => dispatch(setActiveTab('datasets'))}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all"
          >
            ← К датасетам
          </button>
        </div>
      </div>

      {/* View Switch */}
      {viewMode === 'json' ? (
        <div className="bg-[#18191c] rounded-xl border border-slate-800 shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3.5 bg-[#202226] border-b border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-mono">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-sans font-semibold text-slate-200">JSON Report</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyJson}
                className="px-3 py-1.5 bg-[#2c2e33] hover:bg-[#383a40] text-slate-200 rounded-md transition-all font-semibold cursor-pointer text-xs"
              >
                {copied ? '✓ Скопировано!' : '📋 Копировать JSON'}
              </button>
              <button
                onClick={handleDownloadJson}
                className="px-3 py-1.5 bg-[#7cb0f8] hover:bg-[#689fe7] text-white rounded-md transition-all font-semibold cursor-pointer text-xs"
              >
                💾 Скачать .json
              </button>
            </div>
          </div>

          <div className="p-6 max-h-[700px] overflow-y-auto font-mono text-xs text-emerald-400 bg-[#141517] leading-relaxed select-all">
            <pre className="whitespace-pre-wrap break-words">{jsonString}</pre>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {report && report.length > 0 ? (
            report.map((cat, cIdx) => (
              <div key={cIdx} className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">{cat.category_name}</h3>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Всего запросов: {cat.total_requests}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {cat.use_cases.map((uc, uIdx) => {
                    const suggestedActionsList = Array.isArray(uc.suggested_actions)
                      ? uc.suggested_actions
                      : uc.suggested_actions
                      ? [uc.suggested_actions]
                      : []

                    return (
                      <div key={uIdx} className="p-5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-3">
                        {/* Header & Badges */}
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{uc.use_case_name}</h4>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                            {uc.automation_potential || 'Высокий'}
                          </span>
                        </div>

                        {/* Description */}
                        {uc.description && (
                          <p className="text-xs text-slate-600 italic bg-white/60 p-2.5 rounded-lg border border-slate-100">
                            "{uc.description}"
                          </p>
                        )}

                        {/* Metadata row */}
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
                          <div>
                            Запросов: <strong className="text-slate-800 font-semibold">{uc.queries_count}</strong>
                          </div>
                          {uc.dominant_department && (
                            <div>
                              Отдел: <strong className="text-slate-800 font-semibold">{uc.dominant_department}</strong>
                            </div>
                          )}
                        </div>

                        {/* Examples */}
                        {uc.examples && uc.examples.length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-slate-200/60">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Примеры запросов:</span>
                            <div className="space-y-1">
                              {uc.examples.map((ex, exIdx) => (
                                <div key={exIdx} className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-100 font-mono">
                                  💬 "{ex}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pain points */}
                        {uc.pain_points && uc.pain_points.length > 0 && (
                          <div className="space-y-1 pt-2 border-t border-slate-200/60">
                            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Проблемы пользователей:</span>
                            <ul className="text-xs text-rose-700 list-disc list-inside space-y-1">
                              {uc.pain_points.map((p, pIdx) => (
                                <li key={pIdx} className="leading-relaxed">{p}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Suggested Actions */}
                        {suggestedActionsList.length > 0 && (
                          <div className="space-y-1 pt-2 border-t border-slate-200/60">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Рекомендации по автоматизации:</span>
                            <ul className="text-xs text-slate-800 list-disc list-inside space-y-1">
                              {suggestedActionsList.map((act, aIdx) => (
                                <li key={aIdx} className="leading-relaxed">{act}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Estimated Savings */}
                        {(uc.estimated_time_saved || uc.estimated_money_saved) && (
                          <div className="p-3 bg-emerald-50/80 border border-emerald-200/60 rounded-lg space-y-1 text-xs text-emerald-900">
                            <div className="font-bold text-[11px] text-emerald-800 uppercase tracking-wider">💰 Эффект от автоматизации:</div>
                            {uc.estimated_time_saved && (
                              <div>⏱️ <strong>Экономия времени:</strong> {uc.estimated_time_saved}</div>
                            )}
                            {uc.estimated_money_saved && (
                              <div>💵 <strong>Экономия средств:</strong> {uc.estimated_money_saved}</div>
                            )}
                          </div>
                        )}

                        {/* Broken queries */}
                        {uc.broken_queries && uc.broken_queries.length > 0 && (
                          <div className="space-y-1 pt-2 border-t border-amber-200/60">
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Нетипичные / сломанные запросы:</span>
                            <div className="space-y-1">
                              {uc.broken_queries.map((bq, bIdx) => {
                                const queryStr = typeof bq === 'string' ? bq : bq.query
                                const reasonStr = typeof bq === 'string' ? null : bq.reason
                                return (
                                  <div key={bIdx} className="p-2 rounded bg-amber-50 border border-amber-200/60 text-xs text-amber-900">
                                    <div className="font-mono font-semibold">"{queryStr}"</div>
                                    {reasonStr && <div className="text-[10px] text-amber-700 mt-0.5">Причина: {reasonStr}</div>}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500 font-medium">
              Данные отчета отсутствуют.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
