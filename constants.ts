
import { SafetyContact, EmergencyAction, GuideSection, FakeCallScript } from './types';

export const EMERGENCY_CONTACTS: SafetyContact[] = [
  { name: "All India Emergency", number: "112", description: "Universal emergency number", icon: "AlertTriangle" },
  { name: "Police", number: "100", description: "Immediate police assistance", icon: "Shield" },
  { name: "Women Helpline", number: "1091", description: "24/7 support for women", icon: "Phone" },
  { name: "Ambulance", number: "102", description: "Medical emergency", icon: "Ambulance" },
  { name: "Fire", number: "101", description: "Fire emergency", icon: "Flame" },
];

export const RAPID_ACTIONS: EmergencyAction[] = [
  { title: "Feeling Unsafe?", action: "Move to a bright, crowded area immediately.", isUrgent: true },
  { title: "Being Followed?", action: "Change direction, enter a shop, call family loudly.", isUrgent: true },
  { title: "SOS Mode", action: "Press Power Button 5 times rapidly.", isUrgent: true },
  { title: "Cab Off-Route?", action: "Tell driver: 'Stop, my friend is here'. Exit safely.", isUrgent: true },
];

export const SAFETY_KNOWLEDGE_BASE = `
You are GuardianAI, a personal AI Safety Assistant for women. Your goal is to provide clear, calm, and actionable advice based STRICTLY on the following knowledge base. 
If a user asks about an emergency, prioritize immediate safety steps (calling 112, moving to safety).
Be empathetic but firm and directive when safety is at risk.

KNOWLEDGE BASE:
1. Personal Safety
Travel: Match vehicle number with app details. Sit behind driver. Keep one headphone in to stay alert. Track route on Google Maps. Share live location.
Cab Safety: If route is wrong, say "Stop here, my friend is nearby" and exit in public spot. If driver asks personal questions, say "My brother is tracking my trip; I’m on a work call."
Public Spaces: Be aware of exits, crowds, lighting. Walk with purpose. Avoid distractions (phone/loud music).
Interacting with Strangers: Don't disclose personal info. Don't accept food/drink. Verify service workers.
Physical Harassment: If touched, move away, shout "Stop!", go to crowd/security.
Digital Safety: Strong passwords, 2FA. Restrict social media visibility. Don't post live location. If harassed online: Screenshot, Block, Report, File Cyber Complaint.

2. Emergency Contacts (India Context)
112 (All India), 100 (Police), 1091 (Women Helpline), 1098 (Child Helpline), 101 (Fire), 102/108 (Ambulance).
SOS Feature: Press power button 5 times to activate SOS mode on most phones.

3. Immediate Actions (Step-by-Step)
Threatened/Unsafe: 1. Move to light/crowd. 2. Call 112. 3. Share location. 4. Speak loudly. 5. Observe exits. 6. Camera ready.
Followed Walking: Change direction -> Enter crowded shop -> Call someone loudly ("I'm reaching in 2 mins").
Followed Online: Screenshot -> Block -> Report -> Cyber Complaint.

4. Self-Defense
Techniques: Palm strike to nose, Knee strike to stomach/groin, Elbow strike to jaw, Heel stomp on foot.
Vulnerable Targets: Eyes, Nose, Throat, Groin, Knees.
When to use: Only when escape is not possible. Use to create distance.
Tools: Keys, pen, pepper spray, safety alarm.

5. Legal Rights (India)
IPC 354A (Sexual Harassment), 354D (Stalking), 509 (Outraging Modesty), 376 (Sexual Assault).
POSH Act 2013: Workplace harassment. Document, contact ICC/HR, file complaint within 3 months.
FIR Rights: Can be filed at any station (Zero FIR). Police cannot refuse serious complaints. Right to privacy. Right to lady officer.

6. Mental Strength
Walk tall, eye contact, assertive voice. Memorize 112. Practice scanning environment. Trust instincts.

7. FAQ
Cab driver personal questions? -> "Brother is tracking me."
Touched in public? -> Shout "Stop!", move to crowd.
FIR without evidence? -> Yes, evidence collected later.
Fastest alert? -> Power button 5 times (SOS).
`;

export const GUIDES_DATA: GuideSection[] = [
  {
    title: "Safe Travel Checklist",
    category: "Travel",
    content: "1. Share Live Location with trusted contacts.\n2. Match Vehicle Number before entering.\n3. Sit behind the driver.\n4. Keep one ear open (don't use both headphones).\n5. Track route on your own Google Maps."
  },
  {
    title: "Digital Safety",
    category: "Online",
    content: "1. Enable Two-Factor Authentication (2FA).\n2. Lock your social media profiles.\n3. Never post live locations (post delayed).\n4. Block and report suspicious accounts immediately.\n5. Screenshot harassment evidence before blocking."
  },
  {
    title: "Workplace Rights (POSH)",
    category: "Legal",
    content: "Under the POSH Act 2013, you have the right to a safe workplace. If harassment occurs: \n\n1. Document incidents with dates/times. \n2. Report to the Internal Complaints Committee (ICC) or HR within 3 months. \n3. You have the right to confidentiality during the inquiry."
  },
  {
    title: "Situational Awareness",
    category: "Mental",
    content: "Always scan your environment. Note exits in new places. Walk with purpose and head up (not looking at phone). Trust your gut instinct—if it feels wrong, it probably is. Practice the 'What If' game to stay prepared."
  },
  {
    title: "Reporting a Crime (FIR)",
    category: "Legal",
    content: "You can file a Zero FIR at ANY police station, regardless of jurisdiction. The police MUST register it for serious offenses. You have the right to record your statement in the presence of a female officer or a family member."
  }
];

export const FAKE_CALL_SCRIPTS: FakeCallScript[] = [
  {
    id: 'mom',
    label: 'Mom (Caring)',
    callerName: 'Mom ❤️',
    callerNumber: 'Mobile',
    audioText: "Hello beta...? Where are you? I’ve been trying to reach you for the last ten minutes... Are you okay? Hmm... okay, listen, come home soon, okay? Your dinner is getting cold. And if you're outside alone, stay on the main road... don’t take any shortcuts. Tell me when you’re close, I’ll stay on call. Haan, haan... I’m here only... just talk to me. Okay good... do one thing — keep your phone in your hand, hmm? Don’t disconnect, I’m here. Say something so I know you're safe...",
    gender: 'female'
  },
  {
    id: 'brother',
    label: 'Brother (Protective)',
    callerName: 'Bhaiya',
    callerNumber: 'Mobile',
    audioText: "Hello? Where are you? I’m nearby only... if someone is bothering you, just tell me. Hmm... okay. Keep walking straight. Don’t go anywhere alone, I’m staying on the call until you reach. If you feel weird or anything looks off, just say 'bhai'. I’ll understand. I’m right here, okay?",
    gender: 'male'
  },
  {
    id: 'sister',
    label: 'Sister (Soft)',
    callerName: 'Didi',
    callerNumber: 'Mobile',
    audioText: "Hey? Are you okay? I just wanted to check... you sounded a bit off earlier. Listen, just stay on call with me, okay? I’m here. Don’t worry about anything — talk to me until you reach. Hmm... that’s good. Stay where there's light... and look around while walking. I’ll stay with you till you reach.",
    gender: 'female'
  },
  {
    id: 'dad',
    label: 'Dad (Strict)',
    callerName: 'Dad',
    callerNumber: 'Mobile',
    audioText: "Hello? Why didn’t you pick up earlier? Anyway, where are you now? Okay. Walk on the main road. Don’t go through those small lanes. Keep the call on. If anyone troubles you, just say my name loudly. I’m coming in the car, two minutes away. Just keep talking.",
    gender: 'male'
  },
  {
    id: 'police',
    label: 'Police Control',
    callerName: 'Police Control Room',
    callerNumber: '100',
    audioText: "This is the Police Control Room. We have tracked your location. A patrol car is being dispatched to your coordinates immediately. Stay on the line.",
    gender: 'male'
  }
];
