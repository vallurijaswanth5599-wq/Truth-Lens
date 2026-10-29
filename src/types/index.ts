export type InputType = 'text' | 'url' | 'image' | 'video' | 'document';

export type Recommendation = 
  | 'Safe to Share' 
  | 'Share with Caution' 
  | 'Do Not Share' 
  | 'Requires Expert Review' 
  | 'Insufficient Evidence';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface User {
  id: number;
  email: string;
  full_name?: string;
  avatar_url?: string;
  provider: 'email' | 'google';
  is_superuser?: boolean;
}

export interface Source {
  name: string;
  url: string;
  domain: string;
  reliability: number;
  type: string;
  snippet: string;
  publishedDate?: string;
  relevanceScore?: number;
}

export interface ClaimItem {
  id?: string;
  text: string;
  relationship?: 'SUPPORTS' | 'CONTRADICTS' | 'PARTIALLY_SUPPORTS' | 'PARTIALLY_CONTRADICTS' | 'NEUTRAL' | 'INSUFFICIENT';
  verified: boolean;
  source?: string;
  sourceUrl?: string;
  contradiction?: string;
}

export interface ForensicVector {
  type: 'danger' | 'warning' | 'success' | 'info';
  text: string;
}

export interface MediaForensics {
  imageAnalysisStatus: string;
  fileName: string;
  imageHash: string;
  deepfakeProbability: number;
  artifactScore: number;
  authenticityScore: number;
  confidence: number;
  riskScore: number;
  manipulationDetected: boolean;
  detectedSignatures: string[];
  evidenceList: ForensicVector[];
  forensicConclusion: string;
  exifMetadata: {
    cameraMake: string;
    exifStatus: string;
  };
}

export interface UrlMetrics {
  url: string;
  domain: string;
  isHttps: boolean;
  riskScore: number;
  reputationStatus: string;
  flags: string[];
  recommendation: string;
}

export interface VerificationReport {
  requestId: string;
  timestamp: string;
  executionTimeMs: number;
  input: string;
  inputType: InputType;
  claim: string;
  title: string;
  verdict?: string;
  recommendation: Recommendation;
  credibilityScore: number;
  confidenceScore: number;
  riskScore: number;
  riskLevel: RiskLevel;
  domain: string;
  isHighImpact: boolean;
  explanation: string;
  evidenceSummary: string;
  evidenceFor?: string;
  evidenceAgainst?: string;
  recommendationRationale?: string;
  sourceQualityAssessment?: string;
  claims: ClaimItem[];
  sources: Source[];
  forensics?: MediaForensics;
  urlMetrics?: UrlMetrics;
}

export interface DashboardStats {
  total_verifications: number;
  safe_to_share_count: number;
  share_with_caution_count: number;
  do_not_share_count: number;
  high_risk_flagged: number;
  average_credibility: number;
  domain_breakdown: Record<string, number>;
}
