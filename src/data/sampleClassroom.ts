import { ClassroomData, StudentProfile } from '../types';

export const DEFAULT_CLASSROOM: ClassroomData = {
  seats: [
    { id: 1, x: 140, y: 280, occupied: false, label: 'Row 1 Left' },
    { id: 2, x: 300, y: 275, occupied: true, label: 'Row 1 Center-Left' },
    { id: 3, x: 460, y: 275, occupied: true, label: 'Row 1 Center-Right' },
    { id: 4, x: 620, y: 280, occupied: false, label: 'Row 1 Right' },
    { id: 5, x: 120, y: 370, occupied: false, label: 'Row 2 Left' },
    { id: 6, x: 290, y: 365, occupied: false, label: 'Row 2 Center-Left' },
    { id: 7, x: 470, y: 365, occupied: false, label: 'Row 2 Center-Right' },
    { id: 8, x: 640, y: 370, occupied: true, label: 'Row 2 Right' },
    { id: 9, x: 100, y: 470, occupied: false, label: 'Row 3 Left' },
    { id: 10, x: 280, y: 465, occupied: true, label: 'Row 3 Center-Left' },
    { id: 11, x: 480, y: 465, occupied: false, label: 'Row 3 Center-Right' },
    { id: 12, x: 660, y: 470, occupied: false, label: 'Row 3 Right' },
    { id: 13, x: 80, y: 570, occupied: false, label: 'Row 4 Back-Left' },
    { id: 14, x: 270, y: 565, occupied: false, label: 'Row 4 Back-Center-L' },
    { id: 15, x: 490, y: 565, occupied: true, label: 'Row 4 Back-Center-R' },
    { id: 16, x: 680, y: 570, occupied: false, label: 'Row 4 Back-Right' }
  ],
  teacher: {
    x: 380,
    y: 140,
    label: 'Professor Podium'
  },
  board: {
    x: 380,
    y: 60,
    label: 'Chalkboard / Screen'
  },
  fan: {
    x: 280,
    y: 90,
    label: 'Ceiling Fan #1'
  },
  exit: {
    x: 60,
    y: 420,
    label: 'Emergency Exit Door'
  },
  friends: [
    { id: 1, x: 620, y: 280, name: 'Alex' },
    { id: 2, x: 120, y: 370, name: 'Sam' }
  ]
};

export const PROFILES: Record<string, StudentProfile> = {
  'Balanced Student': {
    name: 'Balanced Student',
    description: 'Equally values academic access, comfort, and peace of mind.',
    personality: 'The Diplomat',
    icon: '⚖️',
    weights: {
      board_visibility: 0.20,
      teacher_safety: 0.20,
      fan_exposure: 0.15,
      friend_proximity: 0.15,
      escape_probability: 0.15,
      comfort: 0.15
    }
  },
  'Topper': {
    name: 'Topper',
    description: 'Obsessed with chalkboard visibility, eye contact, and front-row academic glory.',
    personality: 'The Front-Row General',
    icon: '🎓',
    weights: {
      board_visibility: 0.40,
      teacher_visibility: 0.25,
      teacher_safety: 0.05,
      fan_exposure: 0.10,
      comfort: 0.10,
      friend_proximity: 0.05,
      escape_probability: 0.05
    }
  },
  'Sleeper': {
    name: 'Sleeper',
    description: 'Requires maximum teacher evasion, corner stealth, and constant ceiling fan breeze.',
    personality: 'The Hibernator',
    icon: '😴',
    weights: {
      teacher_safety: 0.35,
      fan_exposure: 0.25,
      sleep_potential: 0.20,
      escape_probability: 0.10,
      board_visibility: 0.05,
      friend_proximity: 0.05
    }
  },
  'Phone Addict': {
    name: 'Phone Addict',
    description: 'Needs deep human shields, zero teacher line-of-sight, and high screen discretion.',
    personality: 'The Screen Ninja',
    icon: '📱',
    weights: {
      teacher_safety: 0.35,
      phone_safety: 0.35,
      escape_probability: 0.15,
      board_visibility: 0.05,
      fan_exposure: 0.05,
      comfort: 0.05
    }
  },
  'Backbencher': {
    name: 'Backbencher',
    description: 'Max distance from the podium, direct line to the door, and proximity to fellow rebels.',
    personality: 'The Outlaw',
    icon: '😎',
    weights: {
      teacher_safety: 0.30,
      escape_probability: 0.25,
      phone_safety: 0.20,
      friend_proximity: 0.20,
      board_visibility: 0.05
    }
  },
  'Socializer': {
    name: 'Socializer',
    description: 'Surrounded by friends with optimum whisper radius and chatter access.',
    personality: 'The Gossip Catalyst',
    icon: '🗣️',
    weights: {
      friend_proximity: 0.40,
      comfort: 0.20,
      escape_probability: 0.15,
      teacher_safety: 0.15,
      board_visibility: 0.10
    }
  }
};

export const FUNNY_VERDICTS_BEST = [
  'Seat #{id} is statistically suspiciously good.',
  'The AI has determined that this is the least regrettable chair in the room.',
  'Your survival probability is unusually high here.',
  'Teacher interaction probability is within acceptable limits.',
  'Congratulations. You have optimized sitting.',
  'According to our highly questionable mathematics, you should sit here.',
  'This seat provides the optimal balance between education and avoiding education.',
  'Our neural network certifies this chair as an elite refuge.',
  'Positioned with aerospace-grade stealth from the chalkboard.',
  'Maximum ventilation detected. Your grades might suffer, but your posture will thrive.'
];

export const FUNNY_VERDICTS_WORST = [
  "You might as well sit on the teacher's desk.",
  'Sitting here is a legally recognized hazard to your GPA.',
  'Zero airflow, 99.8% eye contact with authority. Run.',
  'This seat exists purely as a psychological punishment.',
  'If you sit here, you will be called on within 4 minutes.',
  'The Bermuda Triangle of the lecture hall.'
];

export const PERSONALITY_TITLES = [
  'The Strategist',
  'The Academic',
  'The Menace',
  'The Regret',
  'The Phantom',
  'The Sleeper Agent',
  'The Human Shield',
  'The Frontline Defender',
  'The Escape Artist',
  'The Neutralist',
  'The Chatterbox',
  'The Lone Wolf'
];
