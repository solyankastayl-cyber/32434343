/**
 * RenderPlanOverlay V2
 * ====================
 * 
 * Master component that renders all 6 layers of render_plan v2.
 * 
 * LAYERS:
 * A. Market State (trend, channel, volatility - as CONTEXT, not pattern)
 * B. Structure (swings, CHOCH, BOS)
 * C. Indicators (overlays, panes)
 * D. Pattern Figures (ONLY real patterns from registry - NO CHANNELS)
 * E. Liquidity (EQH/EQL, sweeps, OB)
 * F. Execution (ALWAYS visible: valid/waiting/no_trade)
 * 
 * RENDER MODES:
 * - figure_mode: Focus on pattern figure
 * - range_mode: Focus on range boundaries (NO pattern card)
 * - structure_mode: Focus on structure
 * 
 * Key principle: 1 graph = 1 setup = 1 story
 */

import React from 'react';
import { MarketStateRenderer } from './MarketStateRenderer';
import { ExecutionRenderer } from './ExecutionRenderer';
import { PatternStatusRenderer } from './PatternStatusRenderer';
import { POIRenderer } from './POIRenderer';
import { StructureRenderer } from './StructureRenderer';
import { LiquidityRenderer } from './LiquidityRenderer';
import { RangeContextRenderer } from './RangeContextRenderer';
import { ChainHighlightRenderer } from './ChainHighlightRenderer';

export const RenderPlanOverlay = ({ renderPlan, onChainStepClick }) => {
  if (!renderPlan) return null;

  const {
    market_state,
    structure,
    indicators,
    patterns,
    liquidity,
    execution,
    poi,
    meta,
    range_context,
    render_mode,
    chain_highlight,
  } = renderPlan;
  
  // Check render mode
  const isRangeMode = render_mode === 'range_mode' || meta?.render_mode === 'range_mode';

  return (
    <>
      {/* Layer A: Market State (context badge, NOT pattern) */}
      <MarketStateRenderer marketState={market_state} />
      
      {/* Layer F: Execution (ALWAYS visible with full context) */}
      <ExecutionRenderer execution={execution} />
      
      {/* Range Context (for range_mode - shows boundaries, triggers) */}
      {isRangeMode && range_context && (
        <RangeContextRenderer 
          rangeContext={range_context}
          marketState={market_state}
        />
      )}
      
      {/* Layer D: Pattern Status (shows pattern OR "No active figure") */}
      {!isRangeMode && (
        <PatternStatusRenderer patterns={patterns} />
      )}
      
      {/* POI - closest zone only */}
      <POIRenderer zones={poi} />
      
      {/* Layer B: Structure - simplified */}
      <StructureRenderer structure={structure} />
      
      {/* Layer E: Liquidity - limited */}
      <LiquidityRenderer liquidity={liquidity} />
      
      {/* Chain Highlight - visual storytelling (if available) */}
      {chain_highlight && chain_highlight.length > 0 && (
        <ChainHighlightRenderer 
          chain={chain_highlight} 
          onStepClick={onChainStepClick}
        />
      )}
    </>
  );
};

export default RenderPlanOverlay;
