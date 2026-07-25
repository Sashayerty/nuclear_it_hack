import matplotlib.pyplot as plt
import numpy as np

plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['JetBrainsMono NF', 'JetBrainsMono Nerd Font', 'JetBrains Mono', 'sans-serif']

nord0  = '#2e3440'
nord2  = '#434c5e'
nord3  = '#4c566a'
nord4  = '#d8dee9'
nord6  = '#eceff4'

nord9  = '#81a1c1'
nord10 = '#5e81ac'
nord11 = '#bf616a'
nord14 = '#a3be8c'

data = [
    5.82, 6.14, 5.67, 6.21, 5.93, 6.48, 5.45, 6.02, 5.88, 6.33,
    23.41, 22.18, 24.07, 25.31, 23.76, 24.62, 22.95, 26.33, 24.11, 23.84,
    103.21, 98.76, 107.45, 104.32, 97.88, 106.27, 99.34, 103.67,
    116.43, 118.29
]

x = np.arange(1, 31)

median_val = 13.78
mean_val = 34.42
p95_val = 113.63

bar_colors = [nord10] * 28 + [nord11] * 2

fig, ax0 = plt.subplots(figsize=(15, 6), facecolor=nord6)
ax0.set_facecolor(nord6)

ax0.bar(x, data, color=bar_colors, edgecolor=nord6, width=0.7)

ax0.axhline(y=median_val, color=nord14, linestyle='--', linewidth=1.5, alpha=0.9)
ax0.axhline(y=mean_val, color=nord9, linestyle='--', linewidth=1.5, alpha=0.9)
ax0.axhline(y=p95_val, color=nord11, linestyle='--', linewidth=1.5, alpha=0.9)

ax0.text(0.5, median_val + 2, f'Медиана (P50) = {median_val}'.replace('.', ',') + ' с',
         color=nord14, fontweight='bold', fontsize=11, ha='left')
ax0.text(0.5, mean_val + 2, f'Среднее = {mean_val}'.replace('.', ',') + ' с',
         color=nord9, fontweight='bold', fontsize=11, ha='left')
ax0.text(0.5, p95_val + 2, f'95-й процентиль (P95) = {p95_val}'.replace('.', ',') + ' с',
         color=nord11, fontweight='bold', fontsize=11, ha='left')

ax0.set_title('Время отклика полного анализа (30 запросов)', fontweight='bold', fontsize=16, pad=20, color=nord0)
ax0.set_xlabel('Номер запроса', fontweight='bold', fontsize=12, color=nord2)
ax0.set_xlim(0, 31)
ax0.set_ylim(0, 145)

ax0.set_axisbelow(True)
ax0.grid(axis='y', color=nord4, linestyle='-', linewidth=1)

ax0.spines['top'].set_visible(False)
ax0.spines['right'].set_visible(False)
ax0.spines['left'].set_color(nord3)
ax0.spines['bottom'].set_color(nord3)

ax0.set_xticks([])
ax0.tick_params(axis='y', colors=nord2)

plt.tight_layout()

plt.savefig('nord_analysis_time_clean.png', dpi=600, bbox_inches='tight', facecolor=fig.get_facecolor())

plt.show()
