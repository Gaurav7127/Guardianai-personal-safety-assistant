import { EMERGENCY_CONTACTS, RAPID_ACTIONS, GUIDES_DATA } from '../constants';
import { GuideSection, SafetyContact, EmergencyAction, Message, TrustedContact, FakeCallConfig } from '../types';

const KEYS = {
  GUIDES: 'guardian_guides',
  CONTACTS: 'guardian_contacts',
  ACTIONS: 'guardian_actions',
  CHAT: 'guardian_chat_history',
  TRUSTED_CONTACTS: 'guardian_trusted_contacts',
  SOS_CODE_WORD: 'guardian_sos_code_word',
  FAKE_CALL_CONFIG: 'guardian_fake_call_config'
};

// Initialize storage with default data (simulating a sync/download)
export const initializeOfflineData = () => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(KEYS.GUIDES)) {
    localStorage.setItem(KEYS.GUIDES, JSON.stringify(GUIDES_DATA));
  }
  if (!localStorage.getItem(KEYS.CONTACTS)) {
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify(EMERGENCY_CONTACTS));
  }
  if (!localStorage.getItem(KEYS.ACTIONS)) {
    localStorage.setItem(KEYS.ACTIONS, JSON.stringify(RAPID_ACTIONS));
  }
};

export const getStoredGuides = (): GuideSection[] => {
  try {
    const data = localStorage.getItem(KEYS.GUIDES);
    return data ? JSON.parse(data) : GUIDES_DATA;
  } catch { return GUIDES_DATA; }
};

export const getStoredContacts = (): SafetyContact[] => {
  try {
    const data = localStorage.getItem(KEYS.CONTACTS);
    return data ? JSON.parse(data) : EMERGENCY_CONTACTS;
  } catch { return EMERGENCY_CONTACTS; }
};

export const getStoredActions = (): EmergencyAction[] => {
  try {
    const data = localStorage.getItem(KEYS.ACTIONS);
    return data ? JSON.parse(data) : RAPID_ACTIONS;
  } catch { return RAPID_ACTIONS; }
};

export const saveChatHistory = (messages: Message[]) => {
  try {
    localStorage.setItem(KEYS.CHAT, JSON.stringify(messages));
  } catch (e) { console.error("Failed to save chat", e); }
};

export const getChatHistory = (): Message[] | null => {
  try {
    const data = localStorage.getItem(KEYS.CHAT);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
};

// Trusted Contacts Methods
export const getTrustedContacts = (): TrustedContact[] => {
  try {
    const data = localStorage.getItem(KEYS.TRUSTED_CONTACTS);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

export const addTrustedContact = (contact: TrustedContact): TrustedContact[] => {
  try {
    const current = getTrustedContacts();
    const updated = [...current, contact];
    localStorage.setItem(KEYS.TRUSTED_CONTACTS, JSON.stringify(updated));
    return updated;
  } catch { return []; }
};

export const removeTrustedContact = (id: string): TrustedContact[] => {
  try {
    const current = getTrustedContacts();
    const updated = current.filter(c => c.id !== id);
    localStorage.setItem(KEYS.TRUSTED_CONTACTS, JSON.stringify(updated));
    return updated;
  } catch { return []; }
};

// Voice SOS Code Word
export const getSOSCodeWord = (): string => {
  try {
    return localStorage.getItem(KEYS.SOS_CODE_WORD) || 'help';
  } catch { return 'help'; }
};

export const saveSOSCodeWord = (word: string) => {
  try {
    localStorage.setItem(KEYS.SOS_CODE_WORD, word.toLowerCase().trim());
  } catch (e) { console.error("Failed to save code word", e); }
};

// Fake Call Config
export const getFakeCallConfig = (): FakeCallConfig => {
    try {
        const data = localStorage.getItem(KEYS.FAKE_CALL_CONFIG);
        return data ? JSON.parse(data) : { scriptId: 'mom', delaySeconds: 5 };
    } catch { return { scriptId: 'mom', delaySeconds: 5 }; }
};

export const saveFakeCallConfig = (config: FakeCallConfig) => {
    try {
        localStorage.setItem(KEYS.FAKE_CALL_CONFIG, JSON.stringify(config));
    } catch(e) { console.error("Failed to save fake call config", e); }
};