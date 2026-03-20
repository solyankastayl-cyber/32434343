# TA Engine — PRD

## Status: 90% READY

## Frontend Integration Complete

### Data Flow (render_plan → chart)
```
selectedTF → fetch MTF → render_plan
→ chartStructure (from swings) → ResearchChart labels
→ levels → horizontal price lines
→ liquidity → BSL/SSL/sweeps via MarketMechanicsRenderer
→ indicators → EMA 20/50 overlay + RSI pane
→ execution → always visible badge
```

### ResearchViewNew.jsx Changes
- `chartStructure` built from `render_plan.structure.swings`
- `levels` from `render_plan.levels` (max 5)
- `liquidity` converted to MarketMechanicsRenderer format
- `execution` from `render_plan.execution`

### ResearchChart.jsx Changes
- Levels render from props.levels first (render_plan)
- Fallback to baseLayer only if no render_plan levels
- Fixed syntax error (missing `}`)

### Data Contract (4H Timeframe)
```
✅ chartStructure: 4 swings (HL, HH, HH, LL)
✅ levels: 3 (2 resistance, 1 support)
✅ liquidity: 2 BSL + 2 SSL + 1 sweep
✅ indicators: EMA 20/50 + RSI
✅ execution: no_trade + reason
```

### Render Order on Chart
1. Candles
2. Levels (max 5 horizontal lines)
3. Structure (swings with HH/HL/LH/LL labels)
4. Liquidity (BSL/SSL zones)
5. Indicators (EMA overlay + RSI pane)
6. Pattern (only if has_figure=true)
7. Execution (always visible badge)

## What's Left
- Visual validation when preview restores
- Chain highlighting (deferred)
- Pattern geometry (when real pattern exists)

## Files Modified (This Session)
- `render_plan_engine_v2.py` — liquidity layer fix, pattern hint
- `ResearchViewNew.jsx` — liquidity/execution from render_plan
- `ResearchChart.jsx` — levels render, syntax fix
