/**
 * ConfluenceMatrix Component
 * ==========================
 * Displays indicator confluence analysis.
 * 
 * Shows:
 * - Bullish indicators
 * - Bearish indicators
 * - Neutral indicators
 * - Conflicts
 * - Overall strength meter
 */

import React from 'react';
import styled from 'styled-components';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  Activity
} from 'lucide-react';

// ============================================
// STYLED COMPONENTS
// ============================================

const Container = styled.div`
  background: #ffffff;
  border: 1px solid #eef1f5;
  border-radius: 12px;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #eef1f5;
  
  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    
    svg {
      width: 16px;
      height: 16px;
      color: #3b82f6;
    }
  }
  
  .summary {
    font-size: 12px;
    color: #64748b;
  }
`;

const StrengthMeter = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #eef1f5;
  
  .label {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    min-width: 80px;
  }
  
  .meter {
    flex: 1;
    height: 8px;
    background: #f1f5f9;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
    
    .fill {
      position: absolute;
      height: 100%;
      border-radius: 4px;
      transition: all 0.3s ease;
    }
    
    .fill.bearish {
      left: 0;
      background: linear-gradient(90deg, #ef4444, #fca5a5);
    }
    
    .fill.bullish {
      right: 0;
      background: linear-gradient(90deg, #86efac, #22c55e);
    }
    
    .center-line {
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #64748b;
      transform: translateX(-50%);
    }
  }
  
  .value {
    font-size: 14px;
    font-weight: 700;
    min-width: 60px;
    text-align: right;
    color: ${({ $bias }) => 
      $bias === 'bullish' ? '#22c55e' : 
      $bias === 'bearish' ? '#ef4444' : '#64748b'};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
  background: #eef1f5;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  background: #ffffff;
  padding: 12px;
  
  .column-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
    
    .icon {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.bullish {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }
      &.bearish {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }
      &.neutral {
        background: rgba(100, 116, 139, 0.1);
        color: #64748b;
      }
      
      svg {
        width: 12px;
        height: 12px;
      }
    }
    
    .label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
    }
    
    .count {
      margin-left: auto;
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }
  }
`;

const SignalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SignalItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  background: ${({ $type }) => 
    $type === 'bullish' ? 'rgba(34, 197, 94, 0.05)' : 
    $type === 'bearish' ? 'rgba(239, 68, 68, 0.05)' : '#f8fafc'};
  border-radius: 6px;
  
  .name {
    font-size: 12px;
    font-weight: 500;
    color: #0f172a;
  }
  
  .signal-type {
    font-size: 10px;
    color: #64748b;
  }
  
  .strength {
    font-size: 11px;
    font-weight: 600;
    color: ${({ $type }) => 
      $type === 'bullish' ? '#22c55e' : 
      $type === 'bearish' ? '#ef4444' : '#64748b'};
  }
`;

const ConflictsSection = styled.div`
  padding: 12px 16px;
  background: rgba(245, 158, 11, 0.05);
  border-top: 1px solid #eef1f5;
  
  .conflict-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    
    svg {
      width: 14px;
      height: 14px;
      color: #f59e0b;
    }
    
    .label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: #f59e0b;
    }
  }
  
  .conflict-item {
    font-size: 12px;
    color: #64748b;
    padding: 4px 0;
  }
`;

const EmptyState = styled.div`
  padding: 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
`;

// ============================================
// COMPONENT
// ============================================

const ConfluenceMatrix = ({ confluence }) => {
  if (!confluence) {
    return (
      <Container>
        <Header>
          <div className="title">
            <Activity />
            Indicator Confluence
          </div>
        </Header>
        <EmptyState>No confluence data available</EmptyState>
      </Container>
    );
  }
  
  const { 
    bullish = [], 
    bearish = [], 
    neutral = [], 
    conflicts = [],
    overall_strength = 0,
    overall_bias = 'neutral',
    confidence = 0,
    summary = ''
  } = confluence;
  
  // Calculate meter fill
  const meterWidth = Math.abs(overall_strength) * 50; // 50% max each side
  
  return (
    <Container data-testid="confluence-matrix">
      <Header>
        <div className="title">
          <Activity />
          Indicator Confluence
        </div>
        <div className="summary">{summary}</div>
      </Header>
      
      {/* Strength Meter */}
      <StrengthMeter $bias={overall_bias}>
        <span className="label">Strength</span>
        <div className="meter">
          <div className="center-line" />
          {overall_strength < 0 && (
            <div 
              className="fill bearish" 
              style={{ width: `${meterWidth}%`, right: '50%' }}
            />
          )}
          {overall_strength > 0 && (
            <div 
              className="fill bullish" 
              style={{ width: `${meterWidth}%`, left: '50%' }}
            />
          )}
        </div>
        <span className="value">
          {overall_strength > 0 ? '+' : ''}{(overall_strength * 100).toFixed(0)}%
        </span>
      </StrengthMeter>
      
      {/* Signal Columns */}
      <Grid>
        {/* Bullish */}
        <Column>
          <div className="column-header">
            <div className="icon bullish">
              <TrendingUp />
            </div>
            <span className="label">Bullish</span>
            <span className="count">{bullish.length}</span>
          </div>
          <SignalList>
            {bullish.length === 0 ? (
              <SignalItem $type="neutral">
                <span className="name">No bullish signals</span>
              </SignalItem>
            ) : (
              bullish.slice(0, 5).map((signal, i) => (
                <SignalItem key={i} $type="bullish">
                  <div>
                    <div className="name">{signal.name}</div>
                    <div className="signal-type">{signal.signal_type}</div>
                  </div>
                  <span className="strength">{(signal.strength * 100).toFixed(0)}%</span>
                </SignalItem>
              ))
            )}
          </SignalList>
        </Column>
        
        {/* Bearish */}
        <Column>
          <div className="column-header">
            <div className="icon bearish">
              <TrendingDown />
            </div>
            <span className="label">Bearish</span>
            <span className="count">{bearish.length}</span>
          </div>
          <SignalList>
            {bearish.length === 0 ? (
              <SignalItem $type="neutral">
                <span className="name">No bearish signals</span>
              </SignalItem>
            ) : (
              bearish.slice(0, 5).map((signal, i) => (
                <SignalItem key={i} $type="bearish">
                  <div>
                    <div className="name">{signal.name}</div>
                    <div className="signal-type">{signal.signal_type}</div>
                  </div>
                  <span className="strength">{(signal.strength * 100).toFixed(0)}%</span>
                </SignalItem>
              ))
            )}
          </SignalList>
        </Column>
        
        {/* Neutral */}
        <Column>
          <div className="column-header">
            <div className="icon neutral">
              <Minus />
            </div>
            <span className="label">Neutral</span>
            <span className="count">{neutral.length}</span>
          </div>
          <SignalList>
            {neutral.length === 0 ? (
              <SignalItem $type="neutral">
                <span className="name">No neutral signals</span>
              </SignalItem>
            ) : (
              neutral.slice(0, 5).map((signal, i) => (
                <SignalItem key={i} $type="neutral">
                  <div>
                    <div className="name">{signal.name}</div>
                    <div className="signal-type">{signal.signal_type}</div>
                  </div>
                  <span className="strength">{(signal.strength * 100).toFixed(0)}%</span>
                </SignalItem>
              ))
            )}
          </SignalList>
        </Column>
      </Grid>
      
      {/* Conflicts */}
      {conflicts.length > 0 && (
        <ConflictsSection>
          <div className="conflict-header">
            <AlertTriangle />
            <span className="label">Conflicts Detected</span>
          </div>
          {conflicts.map((conflict, i) => (
            <div key={i} className="conflict-item">
              {conflict.family}: {conflict.note}
            </div>
          ))}
        </ConflictsSection>
      )}
    </Container>
  );
};

export default ConfluenceMatrix;
