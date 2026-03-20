# TA Engine — PRD

## Status: 85% READY

## What Works (Backend)

### Render Plan V2 — All Layers
```
✅ MARKET STATE
   trend: uptrend (weak)
   wyckoff: markup

✅ STRUCTURE (max 4 swings)
   4 swings: HL, HH, HH, LL
   bias: neutral

✅ LEVELS (max 5)
   3 levels: 2 resistance, 1 support

✅ INDICATORS (smart selection)
   Trending → EMA 20/50 + RSI
   Ranging → BBands + RSI
   High Volatility → VWAP + ATR

✅ PATTERNS
   has_figure: false (честно)
   reason: Market in channel/range mode

✅ LIQUIDITY
   BSL: 2 zones (71372, 74034)
   SSL: 2 zones (68877, 66490)
   Sweeps: 1 (SSL @ 68877)

✅ EXECUTION
   status: no_trade
   reason: unified setup invalid
```

### 6 Timeframes — ISOLATED
```
4H:   uptrend   | 4 swings | 3 levels | EMA+RSI | 2 BSL, 2 SSL
1D:   downtrend | 4 swings | 3 levels
7D:   downtrend | 4 swings | 2 levels
30D:  downtrend | 4 swings | 3 levels
180D: downtrend | 4 swings | 3 levels
1Y:   downtrend | 4 swings | 3 levels
```

### Pattern Engine
- 4 validators: Triangle, Channel, DoublePattern, HeadShoulders
- Channels filtered as market_state (correct)
- Real patterns (double_top, triangle) shown when detected
- has_figure: false = honest "no pattern"

### Liquidity Engine
- BSL/SSL from pools
- Sweeps with direction + description
- Max 2 BSL, 2 SSL for readability

## What's Left

### Frontend Integration
- [ ] Render swings on chart (HH green, LL red)
- [ ] Render levels as horizontal lines
- [ ] Render BSL/SSL zones
- [ ] Show execution badge always

### Pattern Detection
- When real pattern exists → show on chart
- Currently: no active patterns (market in range)

## Files Modified
- `render_plan_engine_v2.py` — all layers, smart indicators, liquidity fix
- `per_tf_builder.py` — render_plan integration
- `ResearchViewNew.jsx` — TF switching, data flow

## Next Tasks
1. Frontend: render structure/levels/liquidity на графике
2. Test with asset that HAS pattern (ETH wedge, etc.)
3. Visual validation when preview restores
