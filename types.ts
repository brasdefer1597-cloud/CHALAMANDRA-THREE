
export interface DialecticResult {
  thesis: string;
  antithesis: string;
  synthesis: string;
  level: number;
  alignment: number;
  timestamp: string;
  source: 'CLOUD' | 'LOCAL' | 'HYBRID';
}

export enum AnalysisStep {
  IDLE = 'IDLE',
  THESIS = 'THESIS',
  ANTITHESIS = 'ANTITHESIS',
  SYNTHESIS = 'SYNTHESIS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface AnalysisHistoryItem extends DialecticResult {
  id: string;
  originalPrompt: string;
}

export interface MagistralStats {
  totalAnalyses: number;
  localAnalyses: number;
  cloudAnalyses: number;
  achievements: string[];
}

export type AppTab = 'ANALYSIS' | 'VISION' | 'AUDIO' | 'EXPLORE' | 'STATS';

export interface GroundingChunk {
  web?: { uri: string; title: string };
  maps?: { uri: string; title: string };
}
