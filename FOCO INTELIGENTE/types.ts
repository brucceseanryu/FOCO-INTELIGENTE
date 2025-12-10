export enum AppView {
  CONTROL = 'CONTROL',
  CIRCUIT = 'CIRCUIT',
  CODE = 'CODE',
  ASSISTANT = 'ASSISTANT'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ConnectionStatus {
  online: boolean;
  ipAddress: string;
  lastSeen: Date | null;
}

export interface ComponentItem {
  name: string;
  description: string;
  pins: string;
  voltage: string;
}