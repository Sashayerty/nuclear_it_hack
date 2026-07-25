interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  trend?: string
  trendType?: 'positive' | 'negative' | 'warning' | 'neutral'
  badge?: string
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = 'neutral',
  badge
}: StatCardProps) => {
  const trendColorClass = {
    positive: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    negative: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    neutral: 'text-slate-400 bg-slate-800 border-slate-700'
  }[trendType]

  return (
    <div className="glass-card rounded-[6px] p-5 relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <span className="text-2xl p-2 rounded-[6px] bg-slate-800/80 border border-slate-700/60">
          {icon}
        </span>
      </div>

      <div className="my-3">
        <div className="text-3xl font-extrabold text-white tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>

      {(trend || badge) && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-1">
          {trend && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-[6px] border ${trendColorClass}`}>
              {trend}
            </span>
          )}
          {badge && (
            <span className="text-[10px] uppercase font-bold text-[#22b24c] bg-[#22b24c]/10 px-2 py-0.5 rounded-[6px] border border-[#22b24c]/20">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
