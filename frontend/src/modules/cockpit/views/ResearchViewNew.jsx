/**
 * ResearchView — Technical Analysis Research Terminal
 * ====================================================
 * 
 * Uses Setup API to display:
 * 1. Full-width chart with patterns, levels, bias
 * 2. Pattern Activation Layer
 * 3. Deep Analysis Blocks
 * 4. Save Idea functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  Search, 
  RefreshCw, 
  Share2, 
  Camera, 
  Bookmark,
  Loader2,
  AlertTriangle,
  ChevronDown,
  BarChart2,
  LineChart,
  Eye,
  EyeOff,
  Settings2,
  Triangle,
  Layers,
  TrendingUp,
  Target
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TA VISUALIZATION — RenderPlan + Renderers (moved from Chart Lab)
// ═══════════════════════════════════════════════════════════════
import { useRenderPlan } from '../../../store/marketStore';
import { RenderPlanOverlay } from '../renderers';

import ResearchChart from '../components/ResearchChart';
import PatternActivationLayer from '../components/PatternActivationLayer';
import DeepAnalysisBlocks from '../components/DeepAnalysisBlocks';
import MarketContextBar from '../components/MarketContextBar';
import ScenariosBlock from '../components/ScenariosBlock';
import PatternsBlock from '../components/PatternsBlock';
import ConfidenceExplanation from '../components/ConfidenceExplanation';
import ExplanationPanel from '../components/ExplanationPanel';
import IndicatorPanes from '../components/IndicatorPanes';
import ConfluenceMatrix from '../components/ConfluenceMatrix';
import IndicatorSelector from '../components/IndicatorSelector';
import ViewModeSelector from '../components/ViewModeSelector';
import TAContextPanel from '../components/TAContextPanel';
import RenderPlanReasons from '../components/RenderPlanReasons';
import TACompositionPanel from '../components/TACompositionPanel';
import UnifiedSetupPanel from '../components/UnifiedSetupPanel';
import MTFHeaderPanel from '../components/MTFHeaderPanel';
import ExecutionPanel from '../components/ExecutionPanel';
import { 
  computeVisibility, 
  getLayerLimits, 
  applyLimits, 
  getLayerStyle,
  LAYER_PRIORITY,
  VISUAL_PRIORITY 
} from '../engine/GraphVisibilityEngine';
import setupService from '../../../services/setupService';
import { buildNarrative, NarrativeSummary } from '../../../components/chart-engine/narrative';

// ============================================
// STYLED COMPONENTS
// ============================================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8fafc;
  overflow-y: auto;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #ffffff;
  border-bottom: 1px solid #eef1f5;
  flex-wrap: wrap;
  gap: 12px;
`;

const ControlsLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ControlsRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SearchWrapper = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  width: 160px;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: 0.5px;
  
  &:focus {
    outline: none;
    border-color: #05A584;
    background: #ffffff;
  }
  
  &::placeholder {
    color: #94a3b8;
    font-weight: 500;
  }
`;

const SymbolDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
`;

const SymbolOption = styled.button`
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  border: none;
  background: ${({ $active }) => $active ? '#f0f9ff' : 'transparent'};
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
  cursor: pointer;
  
  &:hover {
    background: #f8fafc;
  }
`;

const TfGroup = styled.div`
  display: flex;
  gap: 2px;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
`;

const TfButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  background: ${({ $active }) => $active ? '#ffffff' : 'transparent'};
  color: ${({ $active }) => $active ? '#0f172a' : '#64748b'};
  cursor: pointer;
  box-shadow: ${({ $active }) => $active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'};
  transition: all 0.15s ease;
  
  &:hover {
    color: #0f172a;
  }
`;

const ChartTypeGroup = styled.div`
  display: flex;
  gap: 2px;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
`;

const ChartTypeBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  background: ${({ $active }) => $active ? '#ffffff' : 'transparent'};
  color: ${({ $active }) => $active ? '#0f172a' : '#64748b'};
  cursor: pointer;
  box-shadow: ${({ $active }) => $active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'};
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  &:hover {
    color: #0f172a;
  }
`;

const ViewModeWrapper = styled.div`
  position: relative;
`;

const ViewModeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
  
  &:hover {
    border-color: #cbd5e1;
  }
  
  svg {
    width: 14px;
    height: 14px;
    color: #94a3b8;
  }
`;

const ViewModeDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  min-width: 140px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
  overflow: hidden;
`;

const ViewModeOption = styled.button`
  display: block;
  width: 100%;
  padding: 10px 14px;
  background: ${({ $active }) => $active ? '#f8fafc' : '#ffffff'};
  border: none;
  text-align: left;
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? '600' : '500'};
  color: #0f172a;
  cursor: pointer;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  
  svg {
    width: 14px;
    height: 14px;
  }
  
  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.primary {
    background: #3b82f6;
    border-color: #3b82f6;
    color: #ffffff;
    
    &:hover {
      background: #2563eb;
    }
  }
  
  &.loading svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LayerToggles = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px;
  background: #f1f5f9;
  border-radius: 8px;
`;

const LayerToggleBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  border: none;
  background: ${({ $active }) => $active ? '#ffffff' : 'transparent'};
  color: ${({ $active, $color }) => $active ? $color : '#94a3b8'};
  cursor: pointer;
  box-shadow: ${({ $active }) => $active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'};
  transition: all 0.15s ease;
  
  &:hover {
    color: ${({ $color }) => $color};
  }
  
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ $active, $color }) => $active ? $color : '#cbd5e1'};
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ChartSection = styled.div`
  background: #ffffff;
  border: 1px solid #eef1f5;
  border-radius: 12px;
  overflow: hidden;
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
  
  svg {
    flex-shrink: 0;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  z-index: 10;
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const SuccessToast = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 20px;
  background: #05A584;
  color: #ffffff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(5, 165, 132, 0.3);
  z-index: 1000;
  animation: slideIn 0.3s ease;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DebugPanel = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 16px 20px;
  margin: 16px 0;
  font-family: 'Gilroy', 'Inter', -apple-system, sans-serif;
  
  .debug-title {
    font-weight: 700;
    font-size: 11px;
    color: #64748b;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .debug-row {
    display: flex;
    gap: 32px;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .debug-label {
    min-width: 100px;
    font-size: 12px;
    font-weight: 500;
    color: #94a3b8;
  }
  
  .debug-value {
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    
    &.bullish { color: #05A584; }
    &.bearish { color: #ef4444; }
    &.neutral { color: #64748b; }
  }
`;

// New Decision Layer UI Components
const BottomGrid = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
  
  & > * {
    flex: 1;
    min-width: 0;
  }
  
  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const SubChartControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  padding: 8px 12px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
`;

const ControlDivider = styled.div`
  width: 1px;
  height: 20px;
  background: #e2e8f0;
  margin: 0 4px;
`;

const CollapsibleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  background: ${({ $active }) => $active ? '#0f172a' : 'transparent'};
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  color: ${({ $active }) => $active ? '#ffffff' : '#64748b'};
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    color: ${({ $active }) => $active ? '#ffffff' : '#0f172a'};
    background: ${({ $active }) => $active ? '#0f172a' : 'rgba(15, 23, 42, 0.05)'};
  }
  
  svg {
    width: 13px;
    height: 13px;
  }
`;

const BottomSection = styled.div`
  margin-top: 12px;
`;

// ============================================
// CONSTANTS
// ============================================

const SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT',
  'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT',
  'LINKUSDT', 'UNIUSDT', 'ATOMUSDT', 'LTCUSDT', 'ETCUSDT',
  'FILUSDT', 'APTUSDT', 'ARBUSDT', 'OPUSDT', 'NEARUSDT',
  'INJUSDT', 'SUIUSDT', 'AAVEUSDT', 'MKRUSDT', 'CRVUSDT',
  'TONUSDT', 'SEIUSDT', 'TIAUSDT', 'JUPUSDT', 'WIFUSDT'
];
const TIMEFRAMES = ['4H', '1D', '7D', '30D', '180D', '1Y'];
const MTF_TIMEFRAMES = ['1D', '4H', '1H']; // Available MTF timeframes

// ============================================
// COMPONENT
// ============================================

const ResearchView = () => {
  // ═══════════════════════════════════════════════════════════════
  // RESEARCH STATE — TA-specific (isolated from Chart Lab)
  // ═══════════════════════════════════════════════════════════════
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('1D');
  const [selectedTF, setSelectedTF] = useState('4H');
  const [chartType, setChartType] = useState('candles');
  const [viewMode, setViewMode] = useState('auto');
  const [showViewModeDropdown, setShowViewModeDropdown] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  
  // ═══════════════════════════════════════════════════════════════
  // TA OVERLAY STATE — moved from Chart Lab (RESEARCH EXCLUSIVE)
  // ═══════════════════════════════════════════════════════════════
  const [showTAOverlay, setShowTAOverlay] = useState(true);
  
  // Hook into global render plan store for TA visualization
  const { renderPlan: globalRenderPlan, loading: renderPlanLoading, refresh: refreshRenderPlan } = useRenderPlan();
  
  // Collapsible panels state — toggles overlay visibility on chart
  const [showFibonacciOverlay, setShowFibonacciOverlay] = useState(true);
  const [showPatternOverlay, setShowPatternOverlay] = useState(true);
  
  // Data - NEW: MTF data structure
  const [tfMap, setTfMap] = useState({});
  const [mtfContext, setMtfContext] = useState(null);
  const [setupData, setSetupData] = useState(null);
  const [candles, setCandles] = useState([]);
  
  // Active elements for pattern activation
  const [activeElements, setActiveElements] = useState({});
  
  // Active pattern for switching between primary/alternatives
  const [activePatternId, setActivePatternId] = useState('primary');
  
  // Layer visibility toggles
  const [layerVisibility, setLayerVisibility] = useState({
    patterns: true,
    levels: true,
    baseLayer: true,
    structure: false,
    targets: true,
  });
  
  // Indicator selection state (max 2 overlays, max 2 panes)
  const [selectedOverlays, setSelectedOverlays] = useState(['ema_20', 'ema_50']);
  const [selectedPanes, setSelectedPanes] = useState(['rsi', 'macd']);

  // Fetch MTF data from per-timeframe pipeline
  const fetchSetup = useCallback(async () => {
    console.log('[MTF] Starting fetch...');
    setLoading(true);
    setError(null);
    
    try {
      // Extract base symbol (BTC from BTCUSDT)
      const baseSymbol = symbol.replace('USDT', '');
      
      // Use relative URL - proxy handles routing to backend
      const url = `/api/ta-engine/mtf/${baseSymbol}?timeframes=${selectedTF}`;
      console.log('[MTF] Fetching:', url);
      
      // Add timeout controller - increased to 35s for MTF endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);
      
      // Fetch MTF data
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      console.log('[MTF] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch MTF analysis');
      }
      
      const data = await response.json();
      console.log('[MTF] Data received, tf_map keys:', Object.keys(data.tf_map || {}));
      
      // Store MTF data
      setTfMap(prev => ({
        ...prev,
        ...data.tf_map
      }));
      setMtfContext(data.mtf_context || null);
      
      // Set active TF data as setupData for compatibility
      const activeTFData = data.tf_map?.[selectedTF] || {};
      setSetupData(activeTFData);
      setCandles(activeTFData.candles || []);
      setActivePatternId('primary');
      
      console.log('[MTF] Loaded tf_map:', Object.keys(data.tf_map || {}));
      console.log('[MTF] Active TF:', selectedTF, 'candles:', activeTFData.candles?.length);
      
    } catch (err) {
      if (err.name === 'AbortError') {
        console.error('[MTF] Fetch timeout');
        setError('Analysis timeout - please try again');
      } else {
        console.error('[MTF] Fetch error:', err);
        setError(err.message || 'Failed to load analysis');
      }
    } finally {
      setLoading(false);
      console.log('[MTF] Fetch complete');
    }
  }, [symbol, selectedTF]);

  // Update setupData when selectedTF changes
  useEffect(() => {
    if (tfMap[selectedTF]) {
      const tfData = tfMap[selectedTF];
      setSetupData(tfData);
      setCandles(tfData.candles || []);
      console.log('[MTF] Switched to TF:', selectedTF, 'data keys:', Object.keys(tfData));
    }
  }, [selectedTF, tfMap]);

  // Initial load
  useEffect(() => {
    fetchSetup();
  }, [fetchSetup]);

  // Handle symbol change
  const handleSymbolSelect = (s) => {
    setSymbol(s);
    setSearchQuery('');
    setShowDropdown(false);
  };

  // Handle search - filter and show first 5
  const filteredSymbols = searchQuery
    ? SYMBOLS.filter(s => 
        s.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.replace('USDT', '').toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : SYMBOLS.slice(0, 5);

  // Toggle element visibility
  const handleToggleElement = (elementKey) => {
    setActiveElements(prev => ({
      ...prev,
      [elementKey]: !prev[elementKey]
    }));
  };

  // Save idea
  const handleSaveIdea = async () => {
    try {
      setLoading(true);
      const result = await setupService.createIdea(symbol, timeframe);
      
      if (result.ok) {
        setToast(`Idea saved: ${result.idea.idea_id}`);
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setError('Failed to save idea');
    } finally {
      setLoading(false);
    }
  };

  // Share (placeholder)
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${symbol} Technical Analysis`,
        text: `${setupData?.technical_bias?.toUpperCase()} bias with ${Math.round((setupData?.bias_confidence || 0) * 100)}% confidence`,
        url: window.location.href,
      });
    }
  };

  // Derived data - Map backend v2 format to component format
  // v2 returns: { primary_pattern, alternative_patterns, decision, scenarios, confidence_explanation, ... }
  
  // Get pattern based on activePatternId
  const primaryPattern = setupData?.primary_pattern;
  const alternativePatterns = setupData?.alternative_patterns || [];
  
  // Determine which pattern to display on chart
  const getActivePattern = () => {
    if (activePatternId === 'primary') return primaryPattern;
    const altIndex = parseInt(activePatternId.replace('alt-', ''));
    return alternativePatterns[altIndex] || primaryPattern;
  };
  
  const pattern = getActivePattern();
  
  // LEVELS — use from render_plan (max 5, ranked by strength)
  const levels = React.useMemo(() => {
    const rpLevels = setupData?.render_plan?.levels;
    if (rpLevels?.length) {
      // Convert to format ResearchChart expects
      return rpLevels.map(l => ({
        price: l.price,
        type: l.type, // support/resistance
        strength: l.strength,
        source: l.source,
      }));
    }
    return setupData?.levels || [];
  }, [setupData?.render_plan?.levels, setupData?.levels]);
  
  const structure = setupData?.structure;
  const setup = setupData?.setup;
  
  // New v2 data
  const decision = setupData?.decision;
  const scenarios = setupData?.scenarios || [];
  const confidenceExplanation = setupData?.confidence_explanation || {};
  
  // EXPLANATION — Human-readable analysis from Explanation Engine V1
  const explanation = setupData?.explanation || null;
  
  // TRADE SETUP — Execution-ready entry/stop/targets
  const tradeSetup = setupData?.trade_setup || null;
  
  // BASE LAYER — always visible
  const baseLayer = setupData?.base_layer || null;
  
  // Structure context from V2 engine (rich data)
  const structureContext = setupData?.structure_context || null;
  
  // STRUCTURE VISUALIZATION — pivot points, BOS/CHOCH, trendlines
  const structureVisualization = setupData?.structure_visualization || null;
  
  // CHART STRUCTURE — build from render_plan.structure for chart rendering
  // Format: { labels: [{time, price, label, type}], breaks: [...], legs: [...] }
  const chartStructure = React.useMemo(() => {
    const rpStructure = setupData?.render_plan?.structure;
    if (!rpStructure?.swings?.length) return null;
    
    // Convert swings to labels format that ResearchChart expects
    const labels = rpStructure.swings.map(s => ({
      time: s.time,
      price: s.price,
      label: s.type, // HH/HL/LH/LL
      type: s.type?.includes('H') && s.type !== 'HL' ? 'high' : 'low',
    }));
    
    // Build breaks from BOS/CHOCH
    const breaks = [];
    if (rpStructure.bos) {
      breaks.push({
        time: rpStructure.bos.time,
        level: rpStructure.bos.price,
        type: 'bos',
        direction: rpStructure.bos.direction,
      });
    }
    if (rpStructure.choch) {
      breaks.push({
        time: rpStructure.choch.time,
        level: rpStructure.choch.price,
        type: 'choch',
        direction: rpStructure.choch.direction,
      });
    }
    
    return { labels, breaks, legs: [] };
  }, [setupData?.render_plan?.structure]);
  
  // TA CONTEXT — unified contributions from all TA sources
  const taContext = setupData?.ta_context || null;
  
  // RENDER PLAN — brain → chart mapping (from VisualMappingEngine)
  const renderPlan = setupData?.render_plan || null;
  
  // TA COMPOSITION — complete technical setup view (NEW!)
  const taComposition = setupData?.ta_composition || null;
  
  // ═══════════════════════════════════════════════════════════════
  // MARKET MECHANICS — POI, Liquidity, Sweeps, CHOCH Validation
  // ═══════════════════════════════════════════════════════════════
  const poi = setupData?.poi || null;
  const liquidity = setupData?.liquidity || null;
  const chochValidation = setupData?.choch_validation || null;
  const displacement = setupData?.displacement || null;
  
  // ═══════════════════════════════════════════════════════════════
  // EXECUTION & CHAIN — NEW from per-TF pipeline
  // ═══════════════════════════════════════════════════════════════
  const execution = setupData?.execution || null;
  const chainMap = setupData?.chain_map || [];
  const unifiedSetupData = setupData?.unified_setup || null;
  const fib = setupData?.fib || null;
  
  // Handle pattern click (switch between primary/alternatives)
  const handlePatternClick = (patternId) => {
    setActivePatternId(patternId);
  };
  
  // Handle scenario click (highlight corresponding pattern)
  const handleScenarioClick = (scenario) => {
    // Map scenario to pattern
    if (scenario.pattern) {
      const altIndex = alternativePatterns.findIndex(p => p.type === scenario.pattern);
      if (altIndex >= 0) {
        setActivePatternId(`alt-${altIndex}`);
      } else if (primaryPattern?.type === scenario.pattern) {
        setActivePatternId('primary');
      }
    }
  };
  
  // Map structure to array format for PatternActivationLayer
  const structureArray = structure ? [
    ...Array(structure.hh || 0).fill({ type: 'HH' }),
    ...Array(structure.hl || 0).fill({ type: 'HL' }),
    ...Array(structure.lh || 0).fill({ type: 'LH' }),
    ...Array(structure.ll || 0).fill({ type: 'LL' }),
  ] : [];
  
  // Build unified setup object for all components
  const unifiedSetup = setupData ? {
    // Pattern as array (for PatternActivationLayer)
    patterns: pattern ? [{
      type: pattern.type,
      confidence: pattern.confidence,
      direction: setup?.direction,
      points: pattern.points,
    }] : [],
    
    // Single pattern object (for ResearchChart)
    pattern: pattern,
    
    // Levels array
    levels: levels,
    
    // Structure as array
    structure: structureArray,
    
    // Setup details
    direction: setup?.direction,
    confidence: setup?.confidence,
    trigger: setup?.trigger,
    invalidation: setup?.invalidation,
    targets: setup?.targets || [],
    
    // Empty arrays for missing data (to avoid "No X detected")
    indicators: [],
    conflicts: [],
    
    // Market context
    market_regime: structure?.trend,
    asset: symbol,
    timeframe: timeframe,
  } : null;
  
  const technicalBias = setup?.direction || 'neutral';
  const biasConfidence = setup?.confidence || 0;

  // ═══════════════════════════════════════════════════════════════
  // GRAPH VISIBILITY ENGINE — Intelligent layer prioritization
  // ═══════════════════════════════════════════════════════════════
  const currentPrice = candles?.length > 0 ? candles[candles.length - 1]?.close : null;
  
  const visibilityContext = {
    setup: setupData?.setup,
    pattern_primary: setupData?.primary_pattern,
    pattern_alternative: setupData?.alternative_patterns?.[0],
    poi: poi,
    liquidity: liquidity,
    fib: setupData?.fibonacci,
    indicators: setupData?.indicators,
    choch: chochValidation,
    displacement: displacement,
    structure_context: structureContext || structure,
    current_price: currentPrice,
  };
  
  const layerVisibilityComputed = computeVisibility(visibilityContext, viewMode, renderPlan);
  console.log('[Visibility] viewMode:', viewMode, 'renderPlan:', renderPlan);
  console.log('[Visibility] computed:', layerVisibilityComputed);
  console.log('[Visibility] context keys with data:', Object.keys(visibilityContext).filter(k => visibilityContext[k]));
  const limits = getLayerLimits(viewMode);
  
  // Apply limits to data with price-based prioritization
  const limitedPOI = poi ? {
    ...poi,
    zones: applyLimits(poi.zones, 'poi_zones', limits, currentPrice),
  } : null;
  
  const limitedLiquidity = liquidity ? {
    ...liquidity,
    equal_highs: applyLimits(liquidity.equal_highs, 'liquidity_levels', limits, currentPrice),
    equal_lows: applyLimits(liquidity.equal_lows, 'liquidity_levels', limits, currentPrice),
  } : null;

  // Get visual styles for layers
  const poiStyle = getLayerStyle('poi');
  const liquidityStyle = getLayerStyle('liquidity');
  const patternStyle = getLayerStyle('pattern_primary');
  const fibStyle = getLayerStyle('fib');

  // Determine what to show based on view mode and layer toggles
  const showPatterns = viewMode !== 'clean' && layerVisibility.patterns;
  const showLevels = layerVisibility.levels;
  const showStructure = layerVisibility.structure;
  const showIndicators = viewMode === 'manual';

  // Toggle layer visibility
  const toggleLayer = (layer) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  return (
    <Container data-testid="research-view">
      {/* Top Control Bar */}
      <TopBar>
        <ControlsLeft>
          {/* Search Asset */}
          <SearchWrapper>
            <SearchInput
              type="text"
              placeholder="Search"
              value={showDropdown ? searchQuery : (searchQuery || '')}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              data-testid="asset-search"
            />
            {showDropdown && filteredSymbols.length > 0 && (
              <SymbolDropdown>
                {filteredSymbols.map(s => (
                  <SymbolOption
                    key={s}
                    $active={s === symbol}
                    onMouseDown={() => handleSymbolSelect(s)}
                  >
                    {s.replace('USDT', '')}
                  </SymbolOption>
                ))}
              </SymbolDropdown>
            )}
          </SearchWrapper>

          {/* MTF Timeframe Selector */}
          <TfGroup>
            {MTF_TIMEFRAMES.map(tf => (
              <TfButton
                key={tf}
                $active={selectedTF === tf}
                onClick={() => setSelectedTF(tf)}
                data-testid={`tf-${tf}`}
              >
                {tf}
              </TfButton>
            ))}
          </TfGroup>

          {/* Chart Type */}
          <ChartTypeGroup>
            <ChartTypeBtn
              $active={chartType === 'candles'}
              onClick={() => setChartType('candles')}
              title="Candles"
            >
              <BarChart2 />
            </ChartTypeBtn>
            <ChartTypeBtn
              $active={chartType === 'line'}
              onClick={() => setChartType('line')}
              title="Line"
            >
              <LineChart />
            </ChartTypeBtn>
          </ChartTypeGroup>

          {/* Layer Toggles */}
          <LayerToggles>
            <LayerToggleBtn 
              $active={layerVisibility.baseLayer} 
              $color="#22c55e"
              onClick={() => toggleLayer('baseLayer')}
              title="Show/Hide Base Layer (Levels + Trendlines)"
            >
              <span className="dot" /> Base
            </LayerToggleBtn>
            <LayerToggleBtn 
              $active={layerVisibility.patterns} 
              $color="#3b82f6"
              onClick={() => toggleLayer('patterns')}
              title="Show/Hide Patterns"
            >
              <span className="dot" /> Patterns
            </LayerToggleBtn>
            <LayerToggleBtn 
              $active={layerVisibility.levels} 
              $color="#05A584"
              onClick={() => toggleLayer('levels')}
              title="Show/Hide Levels"
            >
              <span className="dot" /> Levels
            </LayerToggleBtn>
          </LayerToggles>
        </ControlsLeft>
      </TopBar>

      {/* Main Content */}
      <MainContent>
        {/* Error Banner */}
        {error && (
          <ErrorBanner>
            <AlertTriangle size={18} />
            {error}
          </ErrorBanner>
        )}

        {/* MARKET CONTEXT BAR - Decision Summary */}
        <MarketContextBar decision={decision} mtfContext={mtfContext} />

        {/* MTF HEADER — Multi-Timeframe Context */}
        {mtfContext && (
          <MTFHeaderPanel
            mtfOrchestration={mtfContext}
            currentTF={selectedTF}
            onTimeframeClick={(tf) => setSelectedTF(tf)}
          />
        )}

        {/* TA BRAIN — Unified TA Context from all sources */}
        <TAContextPanel taContext={taContext} />

        {/* Chart Section with Primary Insight Overlay */}
        <ChartSection style={{ position: 'relative' }}>
          <ResearchChart
            candles={candles}
            pattern={pattern}
            levels={levels}
            setup={setup}
            structure={structureContext || structure}
            baseLayer={baseLayer}
            structureVisualization={structureVisualization}
            chartStructure={chartStructure}
            tradeSetup={tradeSetup}
            // Market Mechanics - use limited data based on visibility
            poi={layerVisibilityComputed.poi ? (poi || limitedPOI) : null}
            liquidity={layerVisibilityComputed.liquidity ? (liquidity || limitedLiquidity) : null}
            chochValidation={layerVisibilityComputed.choch ? chochValidation : null}
            displacement={layerVisibilityComputed.displacement ? displacement : null}
            // NEW: Execution layer from per-TF pipeline
            execution={execution}
            chainMap={chainMap}
            chartType={chartType}
            height={420}
            showLevels={layerVisibility.levels}
            showPattern={layerVisibility.patterns && layerVisibilityComputed.pattern_primary}
            showBaseLayer={layerVisibility.baseLayer}
            showStructure={false}
            showTargets={false}
            showExecutionOverlay={execution?.valid || layerVisibilityComputed.trade_setup}
            // Market Mechanics toggles - controlled by visibility engine
            showMarketMechanics={viewMode !== 'classic'}
            showPOI={layerVisibilityComputed.poi}
            showLiquidity={layerVisibilityComputed.liquidity}
            showSweeps={layerVisibilityComputed.sweep_markers}
            showCHOCH={layerVisibilityComputed.choch}
            showNarrative={viewMode !== 'minimal'}
            decision={decision}
            // Indicator Overlays - filtered by selection and mode
            // Indicator Overlays - driven by render_plan (brain) in auto mode
            indicatorOverlays={
              layerVisibilityComputed.indicators_overlay
                ? (setupData?.indicators?.overlays || [])
                    .filter(o => {
                      // In auto/smart/classic mode: use render_plan overlays
                      if (renderPlan && viewMode !== 'manual') {
                        return (renderPlan.overlays || []).includes(o.id);
                      }
                      // In manual mode: use user selection
                      return selectedOverlays.includes(o.id);
                    })
                    .slice(0, limits.overlays)
                : []
            }
            // Pattern Engine V2 - use primary_pattern from API
            patternV2={{ primary_pattern: setupData?.primary_pattern, alternative_patterns: setupData?.alternative_patterns }}
            // Fibonacci - use from per-TF pipeline
            fibonacci={fib || setupData?.fibonacci}
            // Toggle overlays visibility via buttons
            showFibonacciOverlay={showFibonacciOverlay}
            showPatternOverlay={showPatternOverlay}
          />
          {loading && (
            <LoadingOverlay>
              <Loader2 size={24} color="#3b82f6" />
              <span style={{ color: '#64748b', fontSize: 13 }}>Analyzing {symbol}...</span>
            </LoadingOverlay>
          )}
          
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* RENDER PLAN OVERLAY — TA visualization (moved from Chart Lab) */}
          {/* This is the ONLY place for TA renderers per product rules */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {showTAOverlay && (globalRenderPlan || renderPlan) && (
            <RenderPlanOverlay 
              renderPlan={globalRenderPlan || renderPlan}
              onChainStepClick={(step) => console.log('[Research/TA] Step clicked:', step)}
            />
          )}
          
        </ChartSection>
        
        {/* Sub-chart controls: View mode + Indicators + Fibonacci + Pattern toggle buttons */}
        {!loading && (
          <SubChartControls data-testid="sub-chart-controls">
            <ViewModeSelector
              mode={viewMode}
              onChange={setViewMode}
            />
            <ControlDivider />
            <IndicatorSelector
              selectedOverlays={selectedOverlays}
              selectedPanes={selectedPanes}
              onOverlaysChange={setSelectedOverlays}
              onPanesChange={setSelectedPanes}
            />
            <ControlDivider />
            <CollapsibleButton
              $active={showFibonacciOverlay}
              onClick={() => setShowFibonacciOverlay(!showFibonacciOverlay)}
              data-testid="fibonacci-toggle-btn"
            >
              <RefreshCw size={13} />
              Fibonacci
            </CollapsibleButton>
            <CollapsibleButton
              $active={showPatternOverlay}
              onClick={() => setShowPatternOverlay(!showPatternOverlay)}
              data-testid="pattern-toggle-btn"
            >
              <Triangle size={13} />
              Pattern
            </CollapsibleButton>
            <ControlDivider />
            {/* TA OVERLAY TOGGLE — exclusive to Research */}
            <CollapsibleButton
              $active={showTAOverlay}
              onClick={() => setShowTAOverlay(!showTAOverlay)}
              data-testid="ta-overlay-toggle-btn"
              style={{ 
                background: showTAOverlay ? '#3b82f620' : '#fff', 
                borderColor: showTAOverlay ? '#3b82f6' : '#e2e8f0', 
                color: showTAOverlay ? '#3b82f6' : '#94a3b8' 
              }}
            >
              <Layers size={13} />
              TA Overlay
            </CollapsibleButton>
          </SubChartControls>
        )}
        
        {/* NARRATIVE SUMMARY — Market Story Chain (includes Why reasoning) */}
        {!loading && decision && (
          <NarrativeSummary
            narrative={buildNarrative({
              liquidity,
              displacement,
              chochValidation,
              poi,
              decision,
              tradeSetup,
            })}
            decision={decision}
          />
        )}

        {/* UNIFIED SETUP + EXECUTION GRID */}
        {(setupData?.unified_setup || setupData?.execution_plan) && (
          <BottomGrid>
            {/* Left: Unified Setup — Validation Chain */}
            <UnifiedSetupPanel unifiedSetup={setupData.unified_setup} />
            
            {/* Right: Execution Plan — Prop-Trader Execution */}
            <ExecutionPanel executionPlan={setupData.execution_plan} />
          </BottomGrid>
        )}

        {/* PATTERNS + SCENARIOS GRID - NEW */}
        <BottomGrid>
          {/* Left: TA Composition — TECHNICAL SETUP VIEW */}
          <TACompositionPanel composition={taComposition} />
          
          {/* Right: Scenarios */}
          <ScenariosBlock
            scenarios={scenarios}
            onScenarioClick={handleScenarioClick}
          />
        </BottomGrid>
        
        {/* PATTERNS BLOCK — Below main grid */}
        <BottomSection>
          <PatternsBlock
            primaryPattern={primaryPattern}
            alternativePatterns={alternativePatterns}
            activePatternId={activePatternId}
            onPatternClick={handlePatternClick}
          />
        </BottomSection>

        {/* EXPLANATION PANEL — System Explanation (from Explanation Engine V1) */}
        <ExplanationPanel explanation={explanation} />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* INDICATOR VISUALIZATION LAYER — Controlled by Visibility Engine */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {layerVisibilityComputed.indicators_panes && setupData?.indicators?.panes?.length > 0 && (
          <BottomSection>
            <IndicatorPanes 
              indicators={setupData.indicators}
              visiblePanes={
                renderPlan && viewMode !== 'manual'
                  ? (renderPlan.panes || []).slice(0, limits.panes)
                  : selectedPanes.slice(0, limits.panes)
              }
              paneHeight={80}
            />
          </BottomSection>
        )}
        
        {/* CONFLUENCE MATRIX — Hidden in minimal mode */}
        {viewMode !== 'minimal' && setupData?.confluence && (
          <BottomSection>
            <ConfluenceMatrix confluence={setupData.confluence} />
          </BottomSection>
        )}

        {/* CONFIDENCE EXPLANATION - NEW */}
        <BottomSection>
          <ConfidenceExplanation explanation={confidenceExplanation} />
        </BottomSection>

        {/* Pattern Activation Layer */}
        <PatternActivationLayer
          setup={unifiedSetup}
          activeElements={activeElements}
          onToggleElement={handleToggleElement}
        />

        {/* Deep Analysis Blocks */}
        <DeepAnalysisBlocks
          setup={unifiedSetup}
          technicalBias={technicalBias}
          biasConfidence={biasConfidence}
        />
      </MainContent>

      {/* Toast */}
      {toast && <SuccessToast>{toast}</SuccessToast>}
    </Container>
  );
};

export default ResearchView;
