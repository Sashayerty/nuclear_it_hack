import matplotlib.pyplot as plt
import numpy as np

# --- Настройка шрифта ---
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['JetBrainsMono NF', 'JetBrainsMono Nerd Font', 'JetBrains Mono', 'sans-serif']

# --- Палитра Nord ---
nord0  = '#2e3440' # Темно-серый (для главных заголовков)
nord2  = '#434c5e' # Серый (для текста)
nord3  = '#4c566a' # Светло-серый (для рамок)
nord4  = '#d8dee9' # Очень светло-серый (для сетки)
nord6  = '#eceff4' # Глобальный фон

nord9  = '#81a1c1' # Приглушенный синий (VRAM Llama)
nord11 = '#bf616a' # Красный (Линия лимита 1660 Super)
nord12 = '#d08770' # Оранжевый (VRAM Mistral)
nord14 = '#a3be8c' # Зеленый (Наш выбор)

models = ['Llama-3-8B', 'Mistral-7B', 'gemma4:e2b\n(Наш выбор)']
tps = [14, 18, 58]
vram = [4.8, 4.1, 1.6]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 6.5), facecolor=nord6)

colors_tps = [nord3, nord3, nord14]
colors_vram = [nord9, nord12, nord14]

# ==========================================
# 1. График: Скорость генерации
# ==========================================
ax1.set_facecolor(nord6)
bars1 = ax1.bar(models, tps, color=colors_tps, edgecolor=nord6, linewidth=1)
ax1.set_title('Скорость генерации (TPS)\n[Больше = Лучше]', fontsize=14, pad=15, color=nord0)
ax1.set_ylabel('Токенов в секунду', fontsize=12, color=nord2)
ax1.set_ylim(0, 65)

for bar in bars1:
    yval = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2, yval + 3,
             f'{yval}', ha='center', va='bottom', fontsize=12, fontweight='bold', color=nord0)

# ==========================================
# 2. График: Потребление памяти (с фишкой 1660 Super)
# ==========================================
ax2.set_facecolor(nord6)
bars2 = ax2.bar(models, vram, color=colors_vram, edgecolor=nord6, linewidth=1, width=0.7)
ax2.set_title('Потребление VRAM (4-bit)\n[Меньше = Лучше]', fontsize=14, pad=15, color=nord0)
ax2.set_ylabel('Гигабайты (GB)', fontsize=12, color=nord2)
ax2.set_ylim(0, 7.5) # Увеличили ось Y, чтобы влезла подпись лимита

# 🔴 КИЛЛЕР-ФИЧА: Линия предела памяти GTX 1660 Super
hardware_limit = 6.0
ax2.axhline(y=hardware_limit, color=nord11, linestyle='--', linewidth=2, alpha=0.9)
ax2.text(1, hardware_limit + 0.2, 'Аппаратный предел GTX 1660 Super (6 GB)',
         color=nord11, fontsize=11, fontweight='bold', ha='center', va='bottom')

for bar in bars2:
    yval = bar.get_height()
    ax2.text(bar.get_x() + bar.get_width()/2, yval + 0.15,
             f'{yval} GB', ha='center', va='bottom', fontsize=12, fontweight='bold', color=nord0)

# ==========================================
# Общее оформление
# ==========================================
# Изменили заголовок для презентации
fig.suptitle('Архитектурный выбор LLM: On-Premise развертывание\n(Бенчмарк проведен на бюджетной NVIDIA GTX 1660 Super)',
             fontsize=16, fontweight='bold', y=1.08, color=nord0)

for ax in [ax1, ax2]:
    ax.set_axisbelow(True)
    ax.grid(axis='y', color=nord4, linestyle='-', linewidth=1)

    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(nord3)
    ax.spines['bottom'].set_color(nord3)

    ax.tick_params(axis='x', labelsize=11, colors=nord2)
    ax.tick_params(axis='y', labelsize=11, colors=nord2)

plt.tight_layout()
plt.savefig('llm_gtx1660super_nord.png', dpi=600, bbox_inches='tight', facecolor=fig.get_facecolor())

plt.show()
