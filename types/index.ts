export type ZoneType = 'restricted' | 'warning' | 'safe';

export type DrawMode = 'none' | 'rectangle' | 'polygon';

export interface Point2D {
  x: number;
  y: number;
}

export interface Detection {
  id: string;
  personId: string;
  riskScore: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  trajectory: Point2D[];
}

export interface Alert {
  id: string;
  personId: string;
  riskScore: number;
  timestamp: string;
  explanation: string;
}

export interface EventItem {
  id: string;
  timestamp: string;
  riskScore: number;
  thumbnailUrl: string;
  personId: string;
  description: string;
  videoUrl?: string;
}

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  points: [number, number][];
  color: string;
}

export interface EventFilter {
  minRisk: number;
  maxRisk: number;
  from?: string;
  to?: string;
}

export interface ApiResponse<T> {
  data: T;
  source: 'api' | 'mock';
}

export interface CameraOption {
  id: string;
  label: string;
}
