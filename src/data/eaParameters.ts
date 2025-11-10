// EA Parameters Data Structure
export interface Parameter {
  name: string;
  type: string;
  desc: string;
}

export interface ParameterSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  parameters: Parameter[];
}

export const eaParameterSections: ParameterSection[] = [
  {
    id: 'license',
    title: '🔐 LICENSE & BASIC SETUP',
    icon: 'Key',
    color: 'yellow',
    parameters: [
      { name: 'InpLicenseKey', type: 'string', desc: 'Chiave di licenza (formato: FOS-XXXX-YYYY o FURY-MASTER-2025-KEY)' },
      { name: 'MagicNumber', type: 'int | default: 20250115', desc: 'Numero univoco per identificare i trade dell\'EA' }
    ]
  },
  {
    id: 'systems',
    title: '✅ ENABLE/DISABLE SYSTEMS',
    icon: 'Zap',
    color: 'green',
    parameters: [
      { name: 'Enable_VolumeProfile', type: 'bool', desc: 'Attiva analisi Volume Profile (POC, VAH, VAL)' },
      { name: 'Enable_EnhancedFVG', type: 'bool', desc: 'Attiva rilevamento Fair Value Gaps' },
      { name: 'Enable_LiquiditySweep', type: 'bool', desc: 'Attiva strategia Liquidity Sweep (sweep su FVG/VP)' },
      { name: 'Enable_SmartExit', type: 'bool', desc: 'Chiude anticipatamente se RSI overbought/oversold' },
      { name: 'Enable_TimeFilter', type: 'bool', desc: 'Abilita filtro orario' },
      { name: 'Enable_NewsFilter', type: 'bool', desc: 'Blocca trading durante news importanti' },
      { name: 'Enable_Randomization', type: 'bool', desc: 'Varia leggermente lot/TP/SL per evitare pattern ripetitivi' }
    ]
  },
  {
    id: 'lotsize',
    title: '💰 LOT SIZE',
    icon: 'DollarSign',
    color: 'blue',
    parameters: [
      { name: 'LotMode', type: 'enum', desc: 'Come calcolare il lotto: FixedLot = Lotto fisso | PercentRisk = % del capitale' },
      { name: 'Fixed_LotSize', type: 'double | default: 0.1', desc: 'Lotto fisso (es: 0.1) se LotMode = FixedLot' },
      { name: 'Risk_Percent', type: 'double | default: 1.0', desc: '% di rischio per trade (es: 1.0 = 1% del balance)' },
      { name: 'MaxOpenPositions', type: 'int | default: 3', desc: 'Numero massimo posizioni contemporanee' }
    ]
  },
  {
    id: 'tpsl',
    title: '🎯 TAKE PROFIT & STOP LOSS',
    icon: 'Target',
    color: 'red',
    parameters: [
      { name: 'TP_Mode', type: 'enum', desc: 'Modalità Take Profit: SINGLE_TP o MULTI_TP (50%/30%/20%)' },
      { name: 'RR_Ratio', type: 'double | default: 2.0', desc: 'Risk:Reward per SINGLE TP (es: 2.0 = 1:2)' },
      { name: 'RR_TP1', type: 'double | default: 1.0', desc: 'Risk:Reward per TP1 (default: 1.0 = 1:1)' },
      { name: 'RR_TP2', type: 'double | default: 2.0', desc: 'Risk:Reward per TP2 (default: 2.0 = 1:2)' },
      { name: 'RR_TP3', type: 'double | default: 3.0', desc: 'Risk:Reward per TP3 (default: 3.0 = 1:3)' },
      { name: 'TP_Percent_1', type: 'double | default: 50', desc: '% di lotto da chiudere a TP1' },
      { name: 'TP_Percent_2', type: 'double | default: 30', desc: '% di lotto da chiudere a TP2' },
      { name: 'TP_Percent_3', type: 'double | default: 20', desc: '% di lotto da chiudere a TP3' },
      { name: 'StopLoss_ATR_Multi', type: 'double | default: 1.5', desc: 'Moltiplicatore ATR per calcolare stop loss' }
    ]
  },
  {
    id: 'breakeven',
    title: '🛡️ BREAKEVEN & TRAILING',
    icon: 'TrendingUp',
    color: 'purple',
    parameters: [
      { name: 'Enable_Breakeven', type: 'bool', desc: 'Sposta SL a breakeven quando trade in profitto' },
      { name: 'Breakeven_OnlyAfterTP1', type: 'bool', desc: 'Breakeven solo dopo aver chiuso TP1' },
      { name: 'Breakeven_Profit_Percent', type: 'double | default: 50', desc: 'Profitto % necessario per attivare breakeven' },
      { name: 'Enable_TrailingStop', type: 'bool', desc: 'Attiva trailing stop dinamico basato su ATR' },
      { name: 'TrailingStop_Start_RR', type: 'double | default: 1.2', desc: 'R:R minimo per attivare trailing' },
      { name: 'TrailingStop_ATR_Multi', type: 'double | default: 2.5', desc: 'Distanza trailing in multipli di ATR' }
    ]
  },
  {
    id: 'risk',
    title: '⚠️ RISK MANAGEMENT',
    icon: 'Shield',
    color: 'orange',
    parameters: [
      { name: 'Enable_DailyLossLimit', type: 'bool', desc: 'Blocca trading se perdi X% in un giorno' },
      { name: 'MaxDailyLossPercent', type: 'double | default: 5.0', desc: '% massima perdita giornaliera' },
      { name: 'Enable_DailyProfitTarget', type: 'bool', desc: 'Chiude tutto quando raggiungi profitto giornaliero' },
      { name: 'DailyProfitDollars', type: 'double | default: 500', desc: 'Target profitto in dollari' },
      { name: 'Enable_EquityProtection', type: 'bool', desc: 'Chiude tutto se drawdown floating > X%' },
      { name: 'MaxEquityDrawdownPercent', type: 'double | default: 10.0', desc: 'Drawdown floating massimo' },
      { name: 'MaxAllowedSpreadPips', type: 'double | default: 2.0', desc: 'Non entra se spread > X pips' }
    ]
  },
  {
    id: 'timefilter',
    title: '⏰ TIME FILTER',
    icon: 'Calendar',
    color: 'cyan',
    parameters: [
      { name: 'Trading_Start_Time', type: 'string', desc: 'Orario inizio trading (es: "08:00")' },
      { name: 'Trading_End_Time', type: 'string', desc: 'Orario fine trading (es: "22:00")' },
      { name: 'Enable_Monday', type: 'bool', desc: 'Attiva trading lunedì' },
      { name: 'Enable_Tuesday', type: 'bool', desc: 'Attiva trading martedì' },
      { name: 'Enable_Wednesday', type: 'bool', desc: 'Attiva trading mercoledì' },
      { name: 'Enable_Thursday', type: 'bool', desc: 'Attiva trading giovedì' },
      { name: 'Enable_Friday', type: 'bool', desc: 'Attiva trading venerdì' },
      { name: 'Close_All_On_TimeEnd', type: 'bool', desc: 'Chiude tutte le posizioni a fine orario' },
      { name: 'Cooldown_Minutes', type: 'int | default: 30', desc: 'Minuti prima della chiusura in cui non entra' }
    ]
  },
  {
    id: 'newsfilter',
    title: '📰 NEWS FILTER',
    icon: 'Newspaper',
    color: 'pink',
    parameters: [
      { name: 'BeforeNewsStop', type: 'int | default: 15', desc: 'Minuti PRIMA della news in cui blocca trading' },
      { name: 'AfterNewsStop', type: 'int | default: 15', desc: 'Minuti DOPO la news in cui blocca trading' },
      { name: 'NewsHigh', type: 'bool', desc: 'Filtra news HIGH impact' },
      { name: 'NewsMedium', type: 'bool', desc: 'Filtra news MEDIUM impact' },
      { name: 'NewsLow', type: 'bool', desc: 'Filtra news LOW impact' },
      { name: 'NewsSymb', type: 'string', desc: 'Valute da monitorare (es: "USD,EUR,GBP")' },
      { name: 'offset', type: 'int | default: 2', desc: 'Offset GMT del tuo broker' },
      { name: 'DrawLines', type: 'bool', desc: 'Disegna zone news sul grafico' }
    ]
  },
  {
    id: 'advanced',
    title: '🔧 ADVANCED SETTINGS',
    icon: 'Sliders',
    color: 'indigo',
    parameters: [
      { name: 'VP_Update_Hours', type: 'int | default: 4', desc: 'Ogni quante ore ricalcolare Volume Profile' },
      { name: 'FVG_MinSizePips', type: 'double | default: 10', desc: 'FVG minimo valido in pips' },
      { name: 'FVG_MaxSizePips', type: 'double | default: 30', desc: 'FVG massimo valido in pips' },
      { name: 'H1_ADX_MinLevel', type: 'double | default: 20', desc: 'ADX minimo per confermare trend' },
      { name: 'SmartExit_RSI_OB', type: 'double | default: 75', desc: 'RSI overbought per Smart Exit' },
      { name: 'SmartExit_RSI_OS', type: 'double | default: 25', desc: 'RSI oversold per Smart Exit' },
      { name: 'Randomization_Intensity', type: 'int | default: 2', desc: 'Intensità randomizzazione (1-3)' },
      { name: 'Randomize_LotSize', type: 'bool', desc: 'Varia leggermente il lotto' },
      { name: 'Max_LotSize_Variation_Percent', type: 'double | default: 5', desc: '% massima variazione lotto' },
      { name: 'Randomize_TPLevels', type: 'bool', desc: 'Varia leggermente i TP' },
      { name: 'Max_TP_Variation_Pips', type: 'double | default: 3', desc: 'Variazione TP in pips' },
      { name: 'Randomize_SLLevels', type: 'bool', desc: 'Varia leggermente lo SL' },
      { name: 'Max_SL_Variation_Pips', type: 'double | default: 2', desc: 'Variazione SL in pips' }
    ]
  },
  {
    id: 'htf',
    title: '📈 HIGHER TIMEFRAME FILTER',
    icon: 'BarChart3',
    color: 'teal',
    parameters: [
      { name: 'Enable_HTF_Filter', type: 'bool', desc: 'Filtra trade basandosi su timeframe superiore' },
      { name: 'HTF_Timeframe_Minutes', type: 'int', desc: 'Timeframe HTF: 60=H1 | 240=H4 | 1440=D1' },
      { name: 'HTF_Strict_Mode', type: 'bool', desc: 'TRUE: entra solo CON il trend | FALSE: evita solo CONTRO-trend' }
    ]
  },
  {
    id: 'liquidity',
    title: '🎯 LIQUIDITY GRAB ZONES',
    icon: 'Layers',
    color: 'violet',
    parameters: [
      { name: 'Enable_LiquidityGrab', type: 'bool', desc: 'Attiva sistema rettangoli Liquidity Grab' },
      { name: 'Max_Rectangles', type: 'int | default: 3', desc: 'Numero massimo rettangoli attivi' },
      { name: 'Rectangle_MaxHeight_Pips', type: 'double | default: 30', desc: 'Altezza massima rettangolo in pips' },
      { name: 'Grab_RequiresConfirmation', type: 'bool', desc: 'Richiede conferma con 2a candela' },
      { name: 'Draw_Rectangles_OnChart', type: 'bool', desc: 'Disegna rettangoli sul grafico' },
      { name: 'Rectangle_Color_Buy', type: 'color | default: Blue', desc: 'Colore rettangoli BUY' },
      { name: 'Rectangle_Color_Sell', type: 'color | default: Red', desc: 'Colore rettangoli SELL' },
      { name: 'Grab_Lookback_Bars', type: 'int | default: 50', desc: 'Barre indietro per cercare swing' },
      { name: 'Grab_MinDistance_Pips', type: 'double | default: 10', desc: 'Distanza minima tra rettangoli' }
    ]
  },
  {
    id: 'volumeprofile',
    title: '📊 VOLUME PROFILE SETTINGS',
    icon: 'BarChart3',
    color: 'emerald',
    parameters: [
      { name: 'VP_Period_Hours', type: 'int | default: 24', desc: 'Periodo Volume Profile in ore' },
      { name: 'VP_Resolution', type: 'int | default: 50', desc: 'Numero livelli di prezzo' },
      { name: 'VP_UseTickVolume', type: 'bool', desc: 'Usa tick volume (TRUE) o real volume (FALSE)' },
      { name: 'VP_Draw_OnChart', type: 'bool', desc: 'Disegna profilo su grafico' },
      { name: 'VP_Color_POC', type: 'color | default: Yellow', desc: 'Colore linea POC' },
      { name: 'VP_Color_VAH', type: 'color | default: Blue', desc: 'Colore linea VAH' },
      { name: 'VP_Color_VAL', type: 'color | default: Blue', desc: 'Colore linea VAL' },
      { name: 'VP_Color_Profile', type: 'color | default: Gray', desc: 'Colore istogramma' },
      { name: 'VP_Update_Minutes', type: 'int | default: 60', desc: 'Frequenza aggiornamento VP' }
    ]
  }
];
