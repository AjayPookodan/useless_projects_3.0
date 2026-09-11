export interface Point {
  x: number;
  y: number;
}

export interface Seat {
  id: number;
  x: number;
  y: number;
  occupied: boolean;
  label?: string;
  bbox?: [number, number, number, number];
  confidence?: number;
}

export interface Landmark {
  x: number;
  y: number;
  label: string;
}

export interface Friend extends Point {
  id: number;
  name: string;
}

export interface ClassroomData {
  seats: Seat[];
  teacher: Landmark;
  board: Landmark;
  fan: Landmark;
  exit: Landmark;
  friends: Friend[];
}

export interface MetricScores {
  board_visibility: number;
  teacher_safety: number;
  teacher_visibility: number;
  fan_exposure: number;
  phone_safety: number;
  sleep_potential: number;
  escape_probability: number;
  friend_proximity: number;
  comfort: number;
  question_probability: number;
  teacher_detection_risk: number;
  boredom_risk: number;
}

export interface ScoredSeat {
  seat_id: number;
  x: number;
  y: number;
  label: string;
  occupied: boolean;
  final_score: number;
  rank: number;
  verdict: string;
  medal: string;
  personality: string;
  metrics: MetricScores;
  funny_verdict?: string;
}

export type ProfileName =
  | 'Balanced Student'
  | 'Topper'
  | 'Sleeper'
  | 'Phone Addict'
  | 'Backbencher'
  | 'Socializer';

export interface StudentProfile {
  name: ProfileName;
  description: string;
  personality: string;
  icon: string;
  weights: Partial<Record<keyof MetricScores, number>>;
}
