// ============================================================
// GOLDEN GOOSE V16 — PART 3: SPIN SYSTEM (350 LINES)
// ============================================================

/* ==================== SPIN CONFIG ==================== */
export const SPIN_CONFIG = {
  MAX_SPINS_PER_DAY: 25,
  SPIN_COOLDOWN: 1800,
  NEAR_MISS_CHANCE: 0.15,
  JACKPOT_WEIGHT: 0.0000000001,
  AD_REWARD: 1, // 1 ad = 1 spin token
};

/* ==================== SPIN PRIZES ==================== */
export const SPIN_PRIZES = [
  // Small Prizes (60%)
  { label: "💎 10 Coins", value: 10, type: "small", weight: 25 },
  { label: "💎 25 Coins", value: 25, type: "small", weight: 20 },
  { label: "💎 50 Coins", value: 50, type: "small", weight: 15 },

  // Medium Prizes (15%)
  { label: "💎 100 Coins", value: 100, type: "medium", weight: 10 },
  { label: "💎 200 Coins", value: 200, type: "medium", weight: 5 },

  // Large Prizes (4%)
  { label: "💎 500 Coins", value: 500, type: "large", weight: 3 },
  { label: "💎 1000 Coins", value: 1000, type: "large", weight: 1 },

  // USD Prizes (17%)
  { label: "💵 $0.01", value: 1, type: "usd", weight: 10 },
  { label: "💵 $0.05", value: 5, type: "usd", weight: 5 },
  { label: "💵 $0.10", value: 10, type: "usd", weight: 2 },

  // JACKPOT (0.0000000001%)
  { label: "👑 $5.00 JACKPOT", value: 500, type: "jackpot", weight: 0.0000000001 },

  // Special Prizes (5%)
  { label: "🎁 Free Mining", value: "free", type: "special", weight: 3 },
  { label: "🎰 +1 Token", value: "token", type: "special", weight: 2 },

  // Snake (Loss) (5%)
  { label: "🐍 -100 Coins", value: -100, type: "snake", weight: 3 },
  { label: "🐍 Try Again", value: null, type: "snake", weight: 2 },
];

/* ==================== GET RANDOM PRIZE ==================== */
export const getRandomPrize = () => {
  const total = SPIN_PRIZES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of SPIN_PRIZES) {
    r -= p.weight;
    if (r <= 0) return { ...p };
  }
  return SPIN_PRIZES[0];
};

/* ==================== NEAR MISS ==================== */
export const getNearMiss = () => {
  // Near Miss Effect — user almost wins jackpot
  const nearMissMessages = [
    "🎯 Almost! Next time!",
    "🎯 So close! Keep spinning!",
    "🎯 You were this close!",
    "🎯 Almost hit the jackpot!",
    "🎯 One more spin!",
  ];
  return {
    label: nearMissMessages[Math.floor(Math.random() * nearMissMessages.length)],
    value: null,
    nearMiss: true,
  };
};

/* ==================== SPIN STATE ==================== */
export const createSpinState = () => ({
  spinning: false,
  spinCount: 0,
  spinTokens: 0,
  lastSpinTime: 0,
  spinHistory: [],
  totalSpins: 0,
  totalWins: 0,
  totalLosses: 0,
});

/* ==================== SPIN VALIDATION ==================== */
export const validateSpin = (state, config = SPIN_CONFIG) => {
  // Check daily limit
  if (state.spinCount >= config.MAX_SPINS_PER_DAY) {
    return { valid: false, reason: "daily_limit", message: "🎰 Daily Spin Limit Reached" };
  }

  // Check cooldown
  if (state.lastSpinTime && Date.now() - state.lastSpinTime < config.SPIN_COOLDOWN) {
    return { valid: false, reason: "cooldown", message: "⏳ Wait before spinning again!" };
  }

  // Check spin tokens
  if (state.spinTokens < 1) {
    return { valid: false, reason: "no_tokens", message: "📺 Watch an ad to get a Spin Token!" };
  }

  return { valid: true };
};

/* ==================== SPIN EXECUTION ==================== */
export const executeSpin = (state, setState, callbacks) => {
  const validation = validateSpin(state);
  if (!validation.valid) {
    callbacks.onError(validation.message);
    return;
  }

  // Set spinning state
  setState(prev => ({ ...prev, spinning: true }));

  // Simulate spin animation
  setTimeout(() => {
    // Determine if near miss should trigger (15% chance)
    let prize;
    if (Math.random() < SPIN_CONFIG.NEAR_MISS_CHANCE) {
      prize = getNearMiss();
    } else {
      prize = getRandomPrize();
    }

    // Update state
    setState(prev => {
      const newState = {
        ...prev,
        spinning: false,
        spinCount: prev.spinCount + 1,
        spinTokens: prev.spinTokens - 1,
        lastSpinTime: Date.now(),
        spinHistory: [...prev.spinHistory, { prize, time: Date.now() }],
        totalSpins: prev.totalSpins + 1,
      };

      if (prize.value !== null && prize.value !== "free" && prize.value !== "token") {
        newState.totalWins = prev.totalWins + 1;
      } else if (prize.value === null) {
        newState.totalLosses = prev.totalLosses + 1;
      }

      return newState;
    });

    // Callback for result
    callbacks.onResult(prize);

    // Reset spinning after animation
    setTimeout(() => {
      setState(prev => ({ ...prev, spinning: false }));
    }, 500);

  }, SPIN_CONFIG.SPIN_COOLDOWN);
};

/* ==================== WATCH AD ==================== */
export const watchAd = (state, setState, callbacks) => {
  if (state.spinning) {
    callbacks.onError("⏳ Spin in progress...");
    return;
  }

  if (state.spinCount >= SPIN_CONFIG.MAX_SPINS_PER_DAY) {
    callbacks.onError("🎰 Daily Spin Limit Reached");
    return;
  }

  // Simulate ad watching (15 seconds)
  callbacks.onAdStart();

  setTimeout(() => {
    setState(prev => ({
      ...prev,
      spinTokens: prev.spinTokens + SPIN_CONFIG.AD_REWARD,
    }));
    callbacks.onAdComplete();
  }, 15000);
};

/* ==================== GET SPIN STATS ==================== */
export const getSpinStats = (state) => ({
  dailyRemaining: Math.max(0, SPIN_CONFIG.MAX_SPINS_PER_DAY - state.spinCount),
  tokensAvailable: state.spinTokens,
  totalSpins: state.totalSpins,
  totalWins: state.totalWins,
  totalLosses: state.totalLosses,
  winRate: state.totalSpins > 0 ? (state.totalWins / state.totalSpins) * 100 : 0,
  lastSpin: state.spinHistory[state.spinHistory.length - 1] || null,
});

/* ==================== SPIN HISTORY ==================== */
export const getSpinHistory = (state, limit = 10) => {
  return state.spinHistory.slice(-limit).reverse();
};

/* ==================== RESET SPIN ==================== */
export const resetSpin = (state, setState) => {
  setState(prev => ({
    ...prev,
    spinCount: 0,
    spinTokens: 0,
    spinHistory: [],
  }));
};

/* ==================== JACKPOT CHECK ==================== */
export const isJackpotWin = (prize) => {
  return prize && prize.type === "jackpot";
};

/* ==================== PRIZE VALUE ==================== */
export const getPrizeValue = (prize) => {
  if (!prize) return 0;
  if (prize.value === "free") return "Free Mining";
  if (prize.value === "token") return "+1 Token";
  if (prize.value === null) return "Try Again";
  return prize.value;
};

/* ==================== PRIZE LABEL ==================== */
export const getPrizeLabel = (prize) => {
  if (!prize) return "No Prize";
  if (prize.nearMiss) return prize.label;
  return prize.label;
};

/* ==================== SPIN VALIDATION HELPERS ==================== */
export const canSpin = (state) => {
  return (
    !state.spinning &&
    state.spinCount < SPIN_CONFIG.MAX_SPINS_PER_DAY &&
    state.spinTokens > 0 &&
    Date.now() - state.lastSpinTime >= SPIN_CONFIG.SPIN_COOLDOWN
  );
};

export const canWatchAd = (state) => {
  return (
    !state.spinning &&
    state.spinCount < SPIN_CONFIG.MAX_SPINS_PER_DAY
  );
};

/* ==================== SPIN UI HELPERS ==================== */
export const getSpinButtonText = (state) => {
  if (state.spinning) return "🎡 Spinning...";
  if (state.spinCount >= SPIN_CONFIG.MAX_SPINS_PER_DAY) return "🎰 Daily Limit Reached";
  if (state.spinTokens < 1) return "📺 Watch Ad to Spin";
  return "🎰 SPIN NOW";
};

export const getAdButtonText = (state, isWatching) => {
  if (isWatching) return "⏳ Watching...";
  if (state.spinCount >= SPIN_CONFIG.MAX_SPINS_PER_DAY) return "🎰 Daily Limit Reached";
  return "📺 Watch Ad (+1 Spin Token)";
};

/* ==================== SPIN STATS UI ==================== */
export const getSpinStatsDisplay = (state) => {
  const stats = getSpinStats(state);
  return {
    dailyRemaining: `Spins Left: ${stats.dailyRemaining}`,
    tokens: `Tokens: ${stats.tokensAvailable}`,
    totalSpins: `Total Spins: ${stats.totalSpins}`,
    winRate: `Win Rate: ${stats.winRate.toFixed(1)}%`,
  };
};

/* ==================== SPIN EFFECTS ==================== */
export const getSpinEffect = (prize) => {
  if (!prize) return "neutral";
  if (prize.nearMiss) return "excited";
  if (prize.type === "jackpot") return "celebration";
  if (prize.value > 0) return "happy";
  if (prize.value === null) return "sad";
  return "neutral";
};

/* ==================== SPIN SOUND EFFECTS ==================== */
export const getSpinSound = (prize) => {
  if (!prize) return "click";
  if (prize.nearMiss) return "nearmiss";
  if (prize.type === "jackpot") return "jackpot";
  if (prize.value > 0) return "win";
  if (prize.value === null) return "lose";
  return "spin";
};

/* ==================== SPIN ANIMATION ==================== */
export const SPIN_ANIMATION = {
  duration: 1800,
  rotation: 5, // full rotations
  easing: "cubic-bezier(0.17, 0.67, 0.83, 0.67)",
};

/* ==================== SPIN GRADIENTS ==================== */
export const SPIN_COLORS = {
  small: "linear-gradient(135deg, #4caf50, #8bc34a)",
  medium: "linear-gradient(135deg, #2196f3, #03a9f4)",
  large: "linear-gradient(135deg, #ff9800, #ff5722)",
  usd: "linear-gradient(135deg, #00c853, #00e676)",
  jackpot: "linear-gradient(135deg, #ffd700, #ff6d00)",
  special: "linear-gradient(135deg, #9c27b0, #e040fb)",
  snake: "linear-gradient(135deg, #f44336, #d32f2f)",
};

/* ==================== SPIN MESSAGES ==================== */
export const SPIN_MESSAGES = {
  welcome: "🎰 Welcome! Watch an ad to get a free spin!",
  dailyLimit: "🎰 Daily Spin Limit Reached! Come back tomorrow!",
  noTokens: "📺 Watch an ad to earn a Spin Token!",
  spinning: "🎡 Spinning... Good luck!",
  jackpot: "👑 JACKPOT! YOU WON $5!",
  nearMiss: "🎯 Almost! Next time!",
  win: "🎉 You won!",
  lose: "😔 Try again!",
  cooldown: "⏳ Wait a moment before spinning again!",
  tokenEarned: "🎯 +1 Spin Token Earned!",
};

/* ==================== SPIN RULES ==================== */
export const SPIN_RULES = {
  title: "🎰 Spin Rules",
  rules: [
    "• Watch 1 ad = 1 Spin Token",
    "• 25 spins per day maximum",
    "• 1.8 second cooldown between spins",
    "• Jackpot chance: 0.0000000001%",
    "• Win coins, USD, tokens, or free mining",
    "• Near miss effect for excitement",
  ],
};

/* ==================== EXPORT ==================== */
export default {
  SPIN_CONFIG,
  SPIN_PRIZES,
  getRandomPrize,
  getNearMiss,
  createSpinState,
  validateSpin,
  executeSpin,
  watchAd,
  getSpinStats,
  getSpinHistory,
  resetSpin,
  isJackpotWin,
  getPrizeValue,
  getPrizeLabel,
  canSpin,
  canWatchAd,
  getSpinButtonText,
  getAdButtonText,
  getSpinStatsDisplay,
  getSpinEffect,
  getSpinSound,
  SPIN_ANIMATION,
  SPIN_COLORS,
  SPIN_MESSAGES,
  SPIN_RULES,
};
