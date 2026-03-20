# TA Engine - Technical Analysis Module PRD

## Problem Statement
Модуль теханализа для GitHub проекта. Перенос render_plan/TA-визуализации из Chart Lab в Research с полной изоляцией.

## Architecture
- **Research** = только ТА: market_state, structure, indicators, patterns, liquidity, execution, render_plan
- **Chart Lab** = только prediction/hypotheses

## What's Been Implemented

### Date: 2026-03-20

1. **Frontend Migration Complete**
   - ChartLabView.jsx: Удалены useRenderPlan, RenderPlanOverlay, showRenderPlan
   - ResearchViewNew.jsx: Добавлены useRenderPlan hook, RenderPlanOverlay, showTAOverlay state, TA toggle кнопка
   - Изоляция состояний между Research и Chart Lab

2. **Backend Fix: Structure Visualization**
   - ta_routes.py: Интегрирован StructureVisualizationBuilder для построения визуальных данных (swings, BOS, CHOCH)
   - render-plan-v2 endpoint теперь возвращает 6 pivot points с HH/HL/LH/LL labels

### Backend Render Plan V2 Status (4H timeframe):
- ✅ market_state: uptrend (weak), wyckoff markup
- ✅ structure: 6 swings с классификацией HH/HL/LH/LL
- ✅ indicators: EMA 20/50, RSI
- ✅ patterns: has_figure=False (честное "No active figure")
- ⚠️ liquidity: bsl/ssl пустые (нет явной ликвидности)
- ✅ execution: no_trade с reason "unified setup invalid"

## Core Requirements
1. Каждый ТФ = изолированный render_plan
2. Max 6 swings, 1 BOS, 1 CHOCH
3. Max 2 indicator overlays, 1 pane
4. Execution ВСЕГДА видимый с reason

## Backlog (P0/P1/P2)

### P0 - Critical
- [ ] Frontend визуализация swings на графике
- [ ] Проверка 6 ТФ (4H, 1D, 7D, 30D, 180D, 1Y)

### P1 - Important
- [ ] Liquidity слой - заполнить bsl/ssl данными
- [ ] BOS/CHOCH detection и визуализация

### P2 - Nice to Have
- [ ] Chain highlighting
- [ ] Alerts
- [ ] localStorage для selectedTF

## Next Tasks
1. Валидация frontend отображения structure swings
2. Проверка изоляции 6 таймфреймов
3. Добавление liquidity detection
