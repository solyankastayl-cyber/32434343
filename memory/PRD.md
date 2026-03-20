# TA Engine — PRD

## Problem Statement
Модуль теханализа — wiring render_plan → chart для читаемого TA терминала.

## Architecture
- **Research** = только ТА: structure, levels, indicators, execution, render_plan
- **Chart Lab** = только prediction/hypotheses

## Implemented (2026-03-20)

### Backend

**1. Render Plan V2 — Structure Layer**
- Max 4 swings (приоритет HH/LL над HL/LH)
- Format: `{time, price, type: HH/HL/LH/LL}`
- BOS/CHOCH как события

**2. Render Plan V2 — Levels Layer**
- Max 5 levels, ранжирование по strength
- Sources: supports, resistances, swing HH/LL
- Дедупликация 0.5%

**3. Smart Indicator Selection**
```
Trending (up/down) → EMA 20/50 + RSI
Ranging → BBands + RSI  
High Volatility → VWAP + ATR
```

**4. 6 Timeframes — РАБОТАЮТ**
```
4H:   uptrend   | 4 swings | 3 levels
1D:   downtrend | 4 swings | 3 levels
7D:   downtrend | 4 swings | 2 levels
30D:  downtrend | 4 swings | 3 levels
180D: downtrend | 4 swings | 3 levels
1Y:   downtrend | 4 swings | 3 levels
```

### Frontend

**1. TF Switching**
- `selectedTF` триггерит fetch или использует cache
- `tfMap` хранит данные для всех загруженных TF
- UI кнопки: 4H, 1D, 7D, 30D, 180D, 1Y

**2. Data Flow**
```
selectedTF → fetch /api/ta-engine/mtf/{symbol}?timeframes={TF}
→ data.tf_map[selectedTF]
→ setSetupData(activeTFData)
→ renderPlan = setupData.render_plan
→ chartStructure from renderPlan.structure.swings
→ levels from renderPlan.levels
→ ResearchChart renders
```

**3. chartStructure Build**
```javascript
chartStructure = {
  labels: swings.map(s => ({time, price, label: s.type})),
  breaks: [bos, choch],
  legs: []
}
```

## Key Files
- `render_plan_engine_v2.py` — limits, smart indicators
- `per_tf_builder.py` — render_plan в MTF
- `ResearchViewNew.jsx` — TF switching, data flow

## Next Tasks
1. Визуальная валидация (когда preview восстановится)
2. Liquidity layer (bsl/ssl detection)
3. Pattern Engine (65 → 1 реальный)
