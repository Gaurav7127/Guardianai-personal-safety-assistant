
export enum AppView {
  HOME = 'HOME',
  CHAT = 'CHAT',
  EMERGENCY = 'EMERGENCY',
  GUIDES = 'GUIDES',
  TOOLS = 'TOOLS',
  SELF_DEFENSE = 'SELF_DEFENSE'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface SafetyContact {
  name: string;
  number: string;
  description: string;
  icon: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
}

export interface GuideSection {
  title: string;
  content: string;
  category: string;
}

export interface EmergencyAction {
  title: string;
  action: string;
  isUrgent: boolean;
}

export interface FakeCallScript {
  id: string;
  label: string;
  callerName: string;
  callerNumber: string;
  audioText: string;
  gender?: 'male' | 'female';
}

export interface FakeCallConfig {
  scriptId: string;
  delaySeconds: number;
}
