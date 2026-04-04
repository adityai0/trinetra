export type RiskLevel = 'low' | 'medium' | 'high';

export interface EventLog {
  _id: string;
  personId: number;
  riskLevel: RiskLevel;
  timestamp: string;
  message: string;
}
