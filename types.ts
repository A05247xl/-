export enum TranscriptionStatus {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface ProcessingResult {
  originalText: string;
  organizedText: string;
  timestamp: string;
}

export interface AudioMetadata {
  name: string;
  size: number;
  type: string;
  duration?: number;
}
