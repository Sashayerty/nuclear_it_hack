import matplotlib.pyplot as plt
import numpy as np

plt.style.use('bmh')

plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['JetBrainsMono NF', 'JetBrainsMono Nerd Font', 'JetBrains Mono', 'sans-serif']

models = ['Llama-3-8B', 'Mistral-7B', 'gemma4:e2b\n(Наш выбор)']
tps = [32, 41, 115]
vram = [4.8, 4.1, 1.6]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 6))

colors_tps = ['#b0bec5', '#b0bec5', '#4caf50']
colors_vram = ['#ffcc80', '#ffcc80', '#81c784']

bars1 = ax1.bar(models, tps, color=colors_tps, edgecolor='black', linewidth=1)
ax1.set_title('Скорость генерации (TPS)\n[Больше = Лучше]', fontsize=14, pad=15)
ax1.set_ylabel('Токенов в секунду', fontsize=12)
ax1.set_ylim(0, 140)

for bar in bars1:
    yval = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2, yval + 3,
             f'{yval}', ha='center', va='bottom', fontsize=12, fontweight='bold')

bars2 = ax2.bar(models, vram, color=colors_vram, edgecolor='black', linewidth=1)
ax2.set_title('Потребление VRAM (4-bit)\n[Меньше = Лучше]', fontsize=14, pad=15)
ax2.set_ylabel('Гигабайты (GB)', fontsize=12)
ax2.set_ylim(0, 6)

for bar in bars2:
    yval = bar.get_height()
    ax2.text(bar.get_x() + bar.get_width()/2, yval + 0.15,
             f'{yval} GB', ha='center', va='bottom', fontsize=12, fontweight='bold')

fig.suptitle('Архитектурный выбор LLM: Почему мы используем легковесную модель',
             fontsize=16, fontweight='bold', y=1.05)

ax1.tick_params(axis='x', labelsize=11)
ax2.tick_params(axis='x', labelsize=11)

plt.tight_layout()

plt.savefig('llm_comparison.png', dpi=600, bbox_inches='tight')
