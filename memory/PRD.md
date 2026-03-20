# TA Engine - PRD

## Problem Statement
Модуль теханализа — перенос render_plan из Chart Lab в Research + жёсткий wiring render_plan → chart.

## Architecture  
- **Research** = только ТА: market_state, structure, indicators, patterns, liquidity, execution, render_plan
- **Chart Lab** = только prediction/hypotheses

## Implemented (2026-03-20)

### Backend: Render Plan V2
1. **Structure Layer** (max 4 swings)
   - Swings с type HH/HL/LH/LL
   - Приоритизация: HH/LL важнее HL/LH
   - BOS/CHOCH как события

2. **Levels Layer** (max 5 levels)
   - Источники: structure supports/resistances, liquidity, swing HH/LL
   - Ранжирование по strength
   - Дедупликация в пределах 0.5%

3. **Indicators Layer**
   - Max 2 overlays (EMA 20, EMA 50)
   - Max 1 pane (RSI)

4. **Execution Layer**
   - ВСЕГДА виден
   - status + reason + detail

### Frontend Wiring
1. **ResearchViewNew.jsx**:
   - `chartStructure` строится из `render_plan.structure.swings`
   - `levels` берётся из `render_plan.levels`
   - `renderPlan` передаётся в RenderPlanOverlay

2. **per_tf_builder.py**:
   - Добавлен render_plan в MTF response

## Current State (4H Timeframe)
```
✅ Structure: 4 swings (HL, HH, HH, LL)
✅ Levels: 3 (2 resistance, 1 support)
✅ Indicators: EMA 20/50 + RSI
✅ Execution: no_trade + reason
```

## Preview Status
⚠️ Preview Unavailable — инфраструктурная проблема Emergent
✅ Backend работает локально
✅ Frontend компилируется без ошибок

## Next Tasks
1. Визуальная валидация когда preview восстановится
2. Проверка 6 ТФ (1D, 7D, 30D, 180D, 1Y)
3. Улучшение liquidity detection (bsl/ssl пустые)

## Key Files Modified
- `/app/backend/modules/ta_engine/render_plan/render_plan_engine_v2.py` — limits, levels layer
- `/app/backend/modules/ta_engine/per_tf_builder.py` — render_plan в MTF
- `/app/backend/modules/ta_engine/ta_routes.py` — structure_viz integration
- `/app/frontend/src/modules/cockpit/views/ResearchViewNew.jsx` — chartStructure, levels from render_plan
