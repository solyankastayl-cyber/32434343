/**
 * LiquidityRenderer
 * =================
 * Renders limited liquidity data (eq highs/lows, sweeps)
 */

import React from 'react';
import styled from 'styled-components';

const LiquidityInfo = styled.div`
  position: absolute;
  bottom: 100px;
  left: 12px;
  padding: 8px 12px;
  background: rgba(245, 158, 11, 0.9);
  border-radius: 6px;
  font-size: 10px;
  color: #fff;
  z-index: 5;
  backdrop-filter: blur(4px);
  
  .title { font-weight: 700; margin-bottom: 4px; }
  .item { 
    font-size: 9px; 
    opacity: 0.9;
    padding: 2px 0;
  }
`;

export const LiquidityRenderer = ({ liquidity }) => {
  if (!liquidity) return null;

  const { eq, sweeps, bsl, ssl } = liquidity;
  const hasEq = eq && eq.length > 0;
  const hasSweeps = sweeps && sweeps.length > 0;

  if (!hasEq && !hasSweeps && !bsl && !ssl) return null;

  return (
    <LiquidityInfo data-testid="liquidity-renderer">
      <div className="title">Liquidity</div>
      {bsl && <div className="item">BSL: ${bsl.toFixed(2)}</div>}
      {ssl && <div className="item">SSL: ${ssl.toFixed(2)}</div>}
      {hasEq && eq.slice(0, 2).map((e, i) => (
        <div key={i} className="item">
          EQ {e.type || 'Level'}: ${(e.price || 0).toFixed(2)}
        </div>
      ))}
      {hasSweeps && sweeps.map((s, i) => (
        <div key={i} className="item" style={{ color: '#fef3c7' }}>
          Sweep: {s.direction || 'N/A'}
        </div>
      ))}
    </LiquidityInfo>
  );
};

export default LiquidityRenderer;
