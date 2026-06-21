// ============================================================
// GOLDEN GOOSE V16 — PART 4: TASKS + GIVEAWAY (350 LINES)
// ============================================================

/* ==================== TASK CONFIG ==================== */
export const TASK_CONFIG = {
  MAX_TASKS_PER_DAY: 10,
  TASK_COOLDOWN: 5000,
  REWARD_MULTIPLIER: 1,
  WALK_REWARD_MULTIPLIER: 1.5,
};

/* ==================== DAILY TASKS ==================== */
export const TASKS = [
  { id: "t1", icon: "🐦", name: "Follow X", reward: 40, link: "https://x.com", type: "social" },
  { id: "t2", icon: "📩", name: "Join Telegram", reward: 50, link: "https://t.me", type: "social" },
  { id: "t3", icon: "🎵", name: "TikTok Like", reward: 40, link: "https://tiktok.com", type: "social" },
  { id: "t4", icon: "▶️", name: "YouTube View", reward: 20, link: "https://youtube.com", type: "social" },
  { id: "t5", icon: "📘", name: "Facebook Follow", reward: 50, link: "https://facebook.com", type: "social" },
];

/* ==================== WALK-TO-EARN TASKS ==================== */
export const WALK_TASKS = [
  { id: "w1", icon: "👟", name: "Sweatcoin Walk", reward: 300, link: "https://sweatco.in", type: "walk" },
  { id: "w2", icon: "🏃", name: "StepN Run", reward: 500, link: "https://stepn.com", type: "walk" },
  { id: "w3", icon: "🚶", name: "Walken Steps", reward: 400, link: "https://walken.io", type: "walk" },
];

/* ==================== GIVEAWAY CONFIG ==================== */
export const GIVEAWAY_CONFIG = {
  DURATION_DAYS: 15,
  BASE_PRIZE: 25,
  MIN_PARTICIPANTS: 1000,
  PER_USER_RATE: 0.025,
  ENTRY_COST: 1, // 1 token
  WINNERS: {
    FIRST: 1,
    FIRST_PERCENT: 0.40,
    SECOND: 2,
    SECOND_PERCENT: 0.20,
    LUCKY: 7,
    LUCKY_PERCENT: 0.05,
  },
};

/* ==================== GET GIVEAWAY PRIZE POOL ==================== */
export const getGiveawayPrizePool = (participants) => {
  if (participants < GIVEAWAY_CONFIG.MIN_PARTICIPANTS) return 0;
  return participants * GIVEAWAY_CONFIG.PER_USER_RATE;
};

/* ==================== GET GIVEAWAY WINNERS ==================== */
export const getGiveawayWinners = (participants) => {
  const pool = getGiveawayPrizePool(participants);
  if (pool === 0) return null;

  // Sort by tokens (highest first)
  const sorted = [...participants].sort((a, b) => b.tokens - a.tokens);

  // First winner (40%)
  const firstWinner = sorted[0];
  const firstPrize = pool * GIVEAWAY_CONFIG.WINNERS.FIRST_PERCENT;

  // Second winners (20% each)
  const secondPool = sorted.slice(1).filter(u => u.tokens <= 20);
  const secondWinners = [];
  for (let i = 0; i < GIVEAWAY_CONFIG.WINNERS.SECOND; i++) {
    if (secondPool.length === 0) break;
    const idx = Math.floor(Math.random() * secondPool.length);
    secondWinners.push(secondPool.splice(idx, 1)[0]);
  }
  const secondPrize = pool * GIVEAWAY_CONFIG.WINNERS.SECOND_PERCENT;

  // Lucky winners (5% each)
  const remaining = sorted.filter(u =>
    u.id !== firstWinner.id &&
    !secondWinners.some(w => w.id === u.id)
  );
  const luckyWinners = [];
  for (let i = 0; i < GIVEAWAY_CONFIG.WINNERS.LUCKY; i++) {
    if (remaining.length === 0) break;
    const idx = Math.floor(Math.random() * remaining.length);
    luckyWinners.push(remaining.splice(idx, 1)[0]);
  }
  const luckyPrize = pool * GIVEAWAY_CONFIG.WINNERS.LUCKY_PERCENT;

  return {
    pool,
    winners: {
      first: firstWinner ? { ...firstWinner, prize: firstPrize } : null,
      second: secondWinners.map(w => ({ ...w, prize: secondPrize })),
      lucky: luckyWinners.map(w => ({ ...w, prize: luckyPrize })),
    },
    totalWinners: 1 + secondWinners.length + luckyWinners.length,
  };
};

/* ==================== TASK STATE ==================== */
export const createTaskState = () => ({
  claimed: {},
  taskCount: 0,
  lastTaskTime: 0,
  totalTasksDone: 0,
  totalRewardsEarned: 0,
});

/* ==================== TASK VALIDATION ==================== */
export const validateTask = (state, config = TASK_CONFIG) => {
  if (state.taskCount >= config.MAX_TASKS_PER_DAY) {
    return { valid: false, reason: "daily_limit", message: "📋 Daily Task Limit Reached" };
  }

  if (state.lastTaskTime && Date.now() - state.lastTaskTime < config.TASK_COOLDOWN) {
    return { valid: false, reason: "cooldown", message: "⏳ Wait before doing another task!" };
  }

  return { valid: true };
};

/* ==================== EXECUTE TASK ==================== */
export const executeTask = (taskId, taskReward, state, setState, callbacks) => {
  const validation = validateTask(state);
  if (!validation.valid) {
    callbacks.onError(validation.message);
    return;
  }

  if (state.claimed[taskId]) {
    callbacks.onError("✅ Already claimed!");
    return;
  }

  // Update state
  setState(prev => ({
    ...prev,
    claimed: { ...prev.claimed, [taskId]: true },
    taskCount: prev.taskCount + 1,
    lastTaskTime: Date.now(),
    totalTasksDone: prev.totalTasksDone + 1,
    totalRewardsEarned: prev.totalRewardsEarned + taskReward,
  }));

  callbacks.onSuccess(taskReward);
};

/* ==================== EXECUTE WALK TASK ==================== */
export const executeWalkTask = (taskId, taskReward, state, setState, callbacks) => {
  const reward = taskReward * TASK_CONFIG.WALK_REWARD_MULTIPLIER;

  setState(prev => ({
    ...prev,
    taskCount: prev.taskCount + 1,
    lastTaskTime: Date.now(),
    totalTasksDone: prev.totalTasksDone + 1,
    totalRewardsEarned: prev.totalRewardsEarned + reward,
  }));

  callbacks.onSuccess(reward);
};

/* ==================== GET TASK STATS ==================== */
export const getTaskStats = (state, config = TASK_CONFIG) => ({
  dailyRemaining: Math.max(0, config.MAX_TASKS_PER_DAY - state.taskCount),
  totalTasksDone: state.totalTasksDone,
  totalRewardsEarned: state.totalRewardsEarned,
  claimedCount: Object.keys(state.claimed).length,
});

/* ==================== TASK AVAILABILITY ==================== */
export const isTaskAvailable = (taskId, state) => {
  return !state.claimed[taskId] && state.taskCount < TASK_CONFIG.MAX_TASKS_PER_DAY;
};

/* ==================== GET TASK BUTTON TEXT ==================== */
export const getTaskButtonText = (taskId, state) => {
  if (state.claimed[taskId]) return "✅ Done";
  if (state.taskCount >= TASK_CONFIG.MAX_TASKS_PER_DAY) return "📋 Daily Limit";
  return "▶️ Start";
};

/* ==================== GIVEAWAY STATE ==================== */
export const createGiveawayState = () => ({
  participants: [],
  entries: {},
  startDate: Date.now(),
  ended: false,
  winners: null,
});

/* ==================== GIVEAWAY VALIDATION ==================== */
export const validateGiveawayEntry = (state, userId) => {
  if (state.ended) return { valid: false, reason: "ended", message: "🏆 Giveaway has ended" };

  const userEntries = state.entries[userId] || 0;
  if (userEntries >= 10) {
    return { valid: false, reason: "max_entries", message: "🏆 Max 10 entries per user" };
  }

  return { valid: true };
};

/* ==================== ENTER GIVEAWAY ==================== */
export const enterGiveaway = (userId, tokens, state, setState, callbacks) => {
  if (tokens < GIVEAWAY_CONFIG.ENTRY_COST) {
    callbacks.onError("❌ Need 1 Token to enter!");
    return;
  }

  const validation = validateGiveawayEntry(state, userId);
  if (!validation.valid) {
    callbacks.onError(validation.message);
    return;
  }

  // Deduct token and add entry
  const newTokens = tokens - GIVEAWAY_CONFIG.ENTRY_COST;

  setState(prev => ({
    ...prev,
    participants: [...prev.participants, { id: userId, tokens: newTokens }],
    entries: {
      ...prev.entries,
      [userId]: (prev.entries[userId] || 0) + 1,
    },
  }));

  callbacks.onSuccess();
  return newTokens;
};

/* ==================== CHECK GIVEAWAY STATUS ==================== */
export const checkGiveawayStatus = (state) => {
  const elapsed = (Date.now() - state.startDate) / (1000 * 60 * 60 * 24);
  const remaining = Math.max(0, GIVEAWAY_CONFIG.DURATION_DAYS - elapsed);

  return {
    active: !state.ended && remaining > 0,
    remainingDays: Math.floor(remaining),
    participants: state.participants.length,
    prizePool: getGiveawayPrizePool(state.participants.length),
    ended: state.ended,
    winners: state.winners,
  };
};

/* ==================== END GIVEAWAY ==================== */
export const endGiveaway = (state, setState) => {
  if (state.ended) return;

  const pool = getGiveawayPrizePool(state.participants.length);
  let winners = null;

  if (pool > 0 && state.participants.length >= GIVEAWAY_CONFIG.MIN_PARTICIPANTS) {
    winners = getGiveawayWinners(state.participants);
  }

  setState(prev => ({
    ...prev,
    ended: true,
    winners: winners,
  }));

  return winners;
};

/* ==================== GIVEAWAY UI HELPERS ==================== */
export const getGiveawayStatusText = (status) => {
  if (status.ended) return "🏆 Giveaway Ended";
  if (!status.active) return "🏆 Giveaway Not Started";
  if (status.remainingDays === 0) return "🏆 Giveaway Ending Today!";
  return `🏆 ${status.remainingDays} Days Left`;
};

export const getGiveawayEntryText = (state, userId) => {
  const entries = state.entries[userId] || 0;
  return `Entries: ${entries}/10`;
};

/* ==================== TASK MESSAGES ==================== */
export const TASK_MESSAGES = {
  welcome: "📋 Complete daily tasks to earn coins!",
  dailyLimit: "📋 Daily Task Limit Reached! Come back tomorrow!",
  cooldown: "⏳ Wait before doing another task!",
  success: "✅ Task complete! +{reward} Coins",
  alreadyClaimed: "✅ Already claimed!",
  walkSuccess: "🚶 Walk task complete! +{reward} Coins",
  referralSuccess: "👥 Referral complete! +200 Coins",
};

/* ==================== EXPORT ==================== */
export default {
  TASK_CONFIG,
  TASKS,
  WALK_TASKS,
  GIVEAWAY_CONFIG,
  getGiveawayPrizePool,
  getGiveawayWinners,
  createTaskState,
  validateTask,
  executeTask,
  executeWalkTask,
  getTaskStats,
  isTaskAvailable,
  getTaskButtonText,
  createGiveawayState,
  validateGiveawayEntry,
  enterGiveaway,
  checkGiveawayStatus,
  endGiveaway,
  getGiveawayStatusText,
  getGiveawayEntryText,
  TASK_MESSAGES,
};
