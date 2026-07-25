import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setActiveTab } from '../store/slices/dashboardSlice'

export const ReportPage = () => {
    const dispatch = useAppDispatch()
    const { currentReport, isReportLoading } = useAppSelector((state) => state.dashboard)
    const [viewMode, setViewMode] = useState<'visual' | 'json'>('json')
    const [copied, setCopied] = useState(false)

    if (isReportLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 font-sans">
                <div className="h-12 w-12 border-4 border-[#10c885] border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center space-y-1">
                    <p className="text-base font-semibold text-slate-800">Формирование отчета ИИ...</p>
                    <p className="text-xs text-slate-500">Обработка векторов в Ollama (gemma2:2b) и подготовка JSON отчета</p>
                </div>
            </div>
        )
    }

    if (!currentReport) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm space-y-4 font-sans">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#10c885] flex items-center justify-center text-2xl font-bold">
                    📄
                </div>
                <div className="space-y-1 max-w-md">
                    <h3 className="text-lg font-bold text-slate-900">Отчёт не выбран</h3>
                    <p className="text-xs text-slate-500">
                        Перейдите в раздел «Датасеты» и откройте аналитический отчёт любого загруженного датасета.
                    </p>
                </div>
                <button
                    onClick={() => dispatch(setActiveTab('datasets'))}
                    className="px-5 py-2.5 bg-[#10c885] hover:bg-[#0eb779] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
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
        <div className="space-y-6 pb-8 font-sans selection:bg-[#10c885] selection:text-white">
            {/* Top Header Card */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-bold text-slate-900">Отчёт анализа: {dataset.name}</h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Завершено • Ollama gemma2:2b
                        </span>
                    </div>
                    <p className="text-xs text-slate-500">
                        ID Анализа: #{analysis.id || 8841} | Записей в логе: {dataset.rows_count || 14250} | Время обработки: ~60 сек
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                        <button
                            onClick={() => setViewMode('json')}
                            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${viewMode === 'json' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Код JSON
                        </button>
                        <button
                            onClick={() => setViewMode('visual')}
                            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${viewMode === 'visual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Визуальный вид
                        </button>
                    </div>

                    <button
                        onClick={() => dispatch(setActiveTab('datasets'))}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    >
                        ← К датасетам
                    </button>
                </div>
            </div>

            {/* Mode Switch Content */}
            {viewMode === 'json' ? (
                <div className="bg-[#18191c] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 bg-[#202226] border-b border-slate-800 text-xs text-slate-300 font-mono">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                            <span className="ml-2 font-sans font-semibold text-slate-200">Full JSON Analysis Report</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopyJson}
                                className="px-3 py-1.5 bg-[#2c2e33] hover:bg-[#383a40] text-slate-200 rounded-lg transition-all font-sans font-semibold cursor-pointer flex items-center gap-1.5"
                            >
                                {copied ? '✓ Скопировано!' : '📋 Копировать JSON'}
                            </button>
                            <button
                                onClick={handleDownloadJson}
                                className="px-3 py-1.5 bg-[#10c885] hover:bg-[#0eb779] text-white rounded-lg transition-all font-sans font-semibold cursor-pointer flex items-center gap-1.5"
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
                            <div key={cIdx} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <h3 className="text-base font-bold text-slate-900">{cat.category_name}</h3>
                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Всего запросов: {cat.total_requests}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {cat.use_cases.map((uc, uIdx) => (
                                        <div key={uIdx} className="p-5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <h4 className="text-sm font-bold text-slate-900 leading-snug">{uc.use_case_name}</h4>
                                                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                                                    {uc.automation_potential || 'Высокий'}
                                                </span>
                                            </div>

                                            <div className="text-xs text-slate-500">
                                                Количество запросов в категории: <strong className="text-slate-800 font-semibold">{uc.queries_count}</strong>
                                            </div>

                                            {uc.pain_points && uc.pain_points.length > 0 && (
                                                <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Проблемы клиентов:</span>
                                                    <ul className="text-xs text-rose-600 list-disc list-inside space-y-1">
                                                        {uc.pain_points.map((p, pIdx) => (
                                                            <li key={pIdx} className="leading-relaxed">{p}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {uc.suggested_actions && uc.suggested_actions.length > 0 && (
                                                <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Рекомендации по автоматизации:</span>
                                                    <ul className="text-xs text-slate-700 list-disc list-inside space-y-1">
                                                        {uc.suggested_actions.map((act, aIdx) => (
                                                            <li key={aIdx} className="leading-relaxed">{act}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {uc.broken_queries && uc.broken_queries.length > 0 && (
                                                <div className="space-y-1.5 pt-2 border-t border-rose-100">
                                                    <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Нетипичные и сломанные запросы:</span>
                                                    <div className="space-y-1.5">
                                                        {uc.broken_queries.map((bq, bIdx) => (
                                                            <div key={bIdx} className="p-2.5 rounded-lg bg-rose-50 border border-rose-200/60 text-xs text-rose-900">
                                                                <div className="font-mono font-semibold">"{bq.query}"</div>
                                                                {bq.reason && <div className="text-[11px] text-rose-600 mt-1">Причина: {bq.reason}</div>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500 font-medium">
                            Данные отчета отсутствуют.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
