import { ClassroomData, MetricScores, ScoredSeat, Seat, ProfileName } from '../types';
import { PROFILES, PERSONALITY_TITLES, FUNNY_VERDICTS_BEST, FUNNY_VERDICTS_WORST } from '../data/sampleClassroom';

export function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

export function normalize(value: number, minVal: number, maxVal: number, invert = false): number {
  if (maxVal === minVal) return 50.0;
  const clamped = Math.max(Math.min(value, maxVal), minVal);
  let ratio = (clamped - minVal) / (maxVal - minVal);
  if (invert) {
    ratio = 1.0 - ratio;
  }
  return ratio * 100.0;
}

export function calculateMetrics(seat: Seat, classroom: ClassroomData, maxDist: number): MetricScores {
  const { teacher, board, fan, exit: exitDoor, friends, seats } = classroom;
  const occupiedSeats = seats.filter(s => s.occupied && s.id !== seat.id);

  // 1. Board Visibility
  const dBoard = distance(seat, board);
  const distBoardScore = normalize(dBoard, 0, maxDist, true);
  const lateralOffset = Math.abs(seat.x - board.x);
  const offsetPenalty = normalize(lateralOffset, 0, maxDist * 0.6, true);
  const board_visibility = +(0.65 * distBoardScore + 0.35 * offsetPenalty).toFixed(2);

  // 2. Teacher Safety (further is safer)
  const dTeacher = distance(seat, teacher);
  const teacher_safety = +normalize(dTeacher, 0, maxDist, false).toFixed(2);

  // 3. Teacher Visibility (closer is more direct line of sight)
  const teacher_visibility = +normalize(dTeacher, 0, maxDist, true).toFixed(2);

  // 4. Fan Exposure
  const dFan = distance(seat, fan);
  const fan_exposure = +normalize(dFan, 0, maxDist * 0.7, true).toFixed(2);

  // 5. Phone Safety (human shields between teacher and seat)
  let shields = 0;
  occupiedSeats.forEach(occ => {
    if (teacher.y < occ.y && occ.y < seat.y && Math.abs(occ.x - seat.x) < 130) {
      shields++;
    }
  });
  const shieldBoost = Math.min(shields * 9.2, 28.0);
  const phone_safety = +Math.min(100.0, teacher_safety * 0.72 + shieldBoost).toFixed(2);

  // 6. Sleep Potential
  const cornerBonus = (seat.x < 150 || seat.x > 600) && seat.y > 350 ? 12.0 : 0.0;
  const sleep_potential = +Math.min(100.0, 0.48 * teacher_safety + 0.36 * fan_exposure + 0.16 * cornerBonus).toFixed(2);

  // 7. Escape Probability
  const dExit = distance(seat, exitDoor);
  const escape_probability = +normalize(dExit, 0, maxDist * 0.8, true).toFixed(2);

  // 8. Friend Proximity
  let friend_proximity = 50.0;
  if (friends && friends.length > 0) {
    const friendDists = friends.map(f => distance(seat, f));
    const avgDist = friendDists.reduce((a, b) => a + b, 0) / friendDists.length;
    friend_proximity = +normalize(avgDist, 0, maxDist * 0.6, true).toFixed(2);
  }

  // 9. Comfort
  const comfort = +(0.4 * fan_exposure + 0.35 * teacher_safety + 0.25 * escape_probability).toFixed(2);

  // 10. Question Probability (inverse of teacher safety, plus lateral aim)
  let qProb = 100.0 - teacher_safety;
  if (Math.abs(seat.x - teacher.x) < 110) {
    qProb = Math.min(99.2, qProb * 1.25);
  }
  const question_probability = +Math.max(2.14, Math.min(99.45, qProb)).toFixed(2);

  // 11. Teacher Detection Risk
  const teacher_detection_risk = +Math.max(1.85, question_probability * 0.82).toFixed(2);

  // 12. Boredom Risk
  const boredom_risk = +Math.max(4.5, Math.min(95.0, 100.0 - (0.5 * board_visibility + 0.5 * friend_proximity))).toFixed(2);

  return {
    board_visibility,
    teacher_safety,
    teacher_visibility,
    fan_exposure,
    phone_safety,
    sleep_potential,
    escape_probability,
    friend_proximity,
    comfort,
    question_probability,
    teacher_detection_risk,
    boredom_risk
  };
}

export function scoreSeat(seat: Seat, classroom: ClassroomData, profileName: ProfileName): ScoredSeat {
  const profile = PROFILES[profileName] || PROFILES['Balanced Student'];
  const allSeats = classroom.seats;
  const maxX = Math.max(...allSeats.map(s => s.x), 700);
  const maxY = Math.max(...allSeats.map(s => s.y), 600);
  const maxDist = Math.max(500, Math.sqrt(maxX ** 2 + maxY ** 2));

  const metrics = calculateMetrics(seat, classroom, maxDist);

  // Calculate weighted score
  const weights = profile.weights;
  let totalWeight = 0;
  let weightedSum = 0;

  (Object.keys(weights) as Array<keyof MetricScores>).forEach(key => {
    const w = weights[key] ?? 0;
    if (w > 0) {
      totalWeight += w;
      weightedSum += (metrics[key] ?? 50.0) * w;
    }
  });

  const final_score = +(totalWeight > 0 ? weightedSum / totalWeight : 50.0).toFixed(2);
  const pIndex = (seat.id * 7) % PERSONALITY_TITLES.length;
  const personality = PERSONALITY_TITLES[pIndex];

  return {
    seat_id: seat.id,
    x: seat.x,
    y: seat.y,
    label: seat.label || `Seat #${seat.id}`,
    occupied: seat.occupied,
    final_score,
    rank: 0,
    verdict: '',
    medal: '',
    personality,
    metrics
  };
}

export function rankAllSeats(classroom: ClassroomData, profileName: ProfileName): {
  rankedSeats: ScoredSeat[];
  bestSeat: ScoredSeat | null;
  worstSeat: ScoredSeat | null;
} {
  const scored = classroom.seats.map(s => scoreSeat(s, classroom, profileName));

  const available = scored
    .filter(s => !s.occupied)
    .sort((a, b) => b.final_score - a.final_score);

  const occupied = scored
    .filter(s => s.occupied)
    .sort((a, b) => b.final_score - a.final_score);

  available.forEach((s, idx) => {
    const rank = idx + 1;
    s.rank = rank;
    if (rank === 1) {
      s.verdict = 'SIT HERE';
      s.medal = '🥇';
    } else if (rank === 2) {
      s.verdict = 'Very Good';
      s.medal = '🥈';
    } else if (rank === 3) {
      s.verdict = 'Acceptable';
      s.medal = '🥉';
    } else if (rank <= available.length - 2) {
      s.verdict = 'Risky';
      s.medal = `#${rank}`;
    } else {
      s.verdict = 'Why?';
      s.medal = `#${rank}`;
    }
  });

  occupied.forEach((s, idx) => {
    s.rank = available.length + idx + 1;
    s.verdict = 'OCCUPIED';
    s.medal = '⛔';
  });

  const rankedSeats = [...available, ...occupied];
  const bestSeat = available.length > 0 ? { ...available[0] } : null;
  const worstSeat = available.length > 0 ? { ...available[available.length - 1] } : null;

  if (bestSeat) {
    const tmpl = FUNNY_VERDICTS_BEST[bestSeat.seat_id % FUNNY_VERDICTS_BEST.length];
    bestSeat.funny_verdict = tmpl.replace('{id}', String(bestSeat.seat_id));
  }

  if (worstSeat) {
    const tmpl = FUNNY_VERDICTS_WORST[worstSeat.seat_id % FUNNY_VERDICTS_WORST.length];
    worstSeat.funny_verdict = tmpl;
  }

  return { rankedSeats, bestSeat, worstSeat };
}
