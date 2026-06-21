// ============================================================
// GOLDEN GOOSE V16 — core.js
// ============================================================

export const CONFIG = {
  FREE_MININGS: 1,
  MINING_COST: 10000,
  MINING_REWARD: 2.00,
  DAY_MS: 24 * 60 * 60 * 1000,
  MAX_BALANCE: 10000000,
  COOLDOWN_MS: 1500,
  EXCHANGE_COIN_TO_USD: 10000,
  EXCHANGE_USD_TO_COIN: 5000,
  VIP_PRICE_ASIA: 1,
  VIP_PRICE_EU: 3,
  VIP_MININGS: 10,
  MIN_WITHDRAWAL: 0.10,
  CHECKIN_REWARD: 10,
  MAX_SPINS: 25,
  GIVEAWAY_DAYS: 15,
  GIVEAWAY_BASE: 25,
  GIVEAWAY_MIN_PARTICIPANTS: 1000,
  GIVEAWAY_PER_USER_RATE: 0.025,
  REFERRAL_REWARD: 200,
};

export const getVIPPrice = (lang) => {
  const EU = ["en","fr","de","it","es","pt","nl","sv","no","da","fi","pl","cs","sk","hu","ro","bg","el","uk","ru"];
  return EU.includes(lang) ? CONFIG.VIP_PRICE_EU : CONFIG.VIP_PRICE_ASIA;
};

export const Storage = {
  get(key) {
    if (typeof window === "undefined") return null;
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
  },
  set(key, value) {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  remove(key) {
    if (typeof window === "undefined") return;
    try { localStorage.removeItem(key); } catch {}
  }
};

export const Guard = {
  init() {
    if (typeof window === "undefined") return;
    console.log("🛡️ GG V16 Guard Active");
    const noop = () => {};
    ['log','warn','error','info','debug','clear'].forEach(m => { console[m] = noop; });
    setInterval(() => { const s = Date.now(); debugger; if (Date.now() - s > 100) { localStorage.clear(); location.reload(); } }, 1000);
    document.addEventListener("contextmenu", e => e.preventDefault());
  }
};

export const AI = {
  status() { return "ACTIVE"; },
  fraudDetect(user) {
    let score = 0;
    if (user.vpnDetected) score += 30;
    if (user.multiDevice) score += 30;
    if (user.actionsPerMin > 30) score += 20;
    if (user.balanceGrowth > 50000) score += 20;
    return { risk: score, action: score > 50 ? "BAN" : score > 30 ? "WARN" : "OK" };
  },
  async checkServers(servers) {
    const results = {};
    for (const s of servers) {
      try { const res = await fetch(s + "/health", { signal: AbortSignal.timeout(3000) }); results[s] = res.ok ? "UP" : "DOWN"; } catch { results[s] = "DOWN"; }
    }
    return results;
  }
};
