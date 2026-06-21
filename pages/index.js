// ============================================================
// GOLDEN GOOSE V16 — Home.js (Main Page)
// ============================================================

import React, { useState, useEffect } from 'react';
import { CONFIG, Storage, Guard, AI } from '../core';
import { T } from '../i18n';
import { SPIN_PRIZES, getRandomPrize } from '../spin';
import { TASKS, WALK_TASKS, getGiveawayPrizePool } from '../tasks';

export default function Home() {
  // ==================== STATE ====================
  const [balance, setBalance] = useState(10000);
  const [usdBalance, setUsdBalance] = useState(0);
  const [isMining, setIsMining] = useState(false);
  const [miningEnd, setMiningEnd] = useState(null);
  const [streak, setStreak] = useState(0);
  const [vip, setVip] = useState(0);
  const [vipMiningLeft, setVipMiningLeft] = useState(0);
  const [freeMinings, setFreeMinings] = useState(CONFIG.FREE_MININGS);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==================== INIT ====================
  useEffect(() => {
    const savedBalance = Storage.get('gg_balance');
    const savedUsd = Storage.get('gg_usd');
    const savedStreak = Storage.get('gg_streak');
    const savedVip = Storage.get('gg_vip');
    const savedVipLeft = Storage.get('gg_vip_left');
    const savedFree = Storage.get('gg_free');

    if (savedBalance) setBalance(savedBalance);
    if (savedUsd) setUsdBalance(savedUsd);
    if (savedStreak) setStreak(savedStreak);
    if (savedVip) setVip(savedVip);
    if (savedVipLeft) setVipMiningLeft(savedVipLeft);
    if (savedFree !== null) setFreeMinings(savedFree);

    const savedEnd = Storage.get('gg_mining_end');
    if (savedEnd && savedEnd > Date.now()) {
      setIsMining(true);
      setMiningEnd(savedEnd);
    }

    // VIP Expire Check
    if (vip > 0 && vipMiningLeft <= 0) {
      setVip(0);
      setVipMiningLeft(0);
      Storage.remove('gg_vip');
      Storage.remove('gg_vip_left');
    }

    setLoading(false);
  }, []);

  // ==================== AUTO SAVE ====================
  useEffect(() => {
    Storage.set('gg_balance', balance);
    Storage.set('gg_usd', usdBalance);
    Storage.set('gg_streak', streak);
    Storage.set('gg_vip', vip);
    Storage.set('gg_vip_left', vipMiningLeft);
    Storage.set('gg_free', freeMinings);
  }, [balance, usdBalance, streak, vip, vipMiningLeft, freeMinings]);

  // ==================== TOAST ====================
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  // ==================== MINING ====================
  const startMining = () => {
    if (isMining) {
      showToast('⏳ Mining already in progress...');
      return;
    }

    // VIP check
    if (vip > 0 && vipMiningLeft <= 0) {
      showToast('💎 VIP Mining limit reached! Renew VIP.');
      return;
    }

    // Free mining check
    if (freeMinings > 0) {
      setFreeMinings(prev => prev - 1);
      setIsMining(true);
      const endTime = Date.now() + CONFIG.DAY_MS;
      setMiningEnd(endTime);
      Storage.set('gg_mining_end', endTime);
      showToast(`🎁 Free Mining started! (${freeMinings - 1} left)`);
      return;
    }

    // Normal mining
    if (balance < CONFIG.MINING_COST) {
      showToast(`❌ Need ${CONFIG.MINING_COST} Coins to mine!`);
      return;
    }

    setBalance(prev => prev - CONFIG.MINING_COST);
    setIsMining(true);
    const endTime = Date.now() + CONFIG.DAY_MS;
    setMiningEnd(endTime);
    Storage.set('gg_mining_end', endTime);
    showToast('⛏️ Mining started! Come back in 24 hours.');
  };

  const claimMining = () => {
    if (!isMining) {
      showToast('❌ No mining in progress.');
      return;
    }

    if (!miningEnd || Date.now() < miningEnd) {
      showToast('⏳ Mining not finished yet!');
      return;
    }

    setIsMining(false);
    setMiningEnd(null);
    Storage.remove('gg_mining_end');

    // Add reward
    setUsdBalance(prev => prev + CONFIG.MINING_REWARD);
    setStreak(prev => prev + 1);

    // VIP mining count
    if (vip > 0) {
      setVipMiningLeft(prev => Math.max(0, prev - 1));
    }

    showToast(`🎉 $${CONFIG.MINING_REWARD} Claimed!`);
  };

  // ==================== TIMER ====================
  const getTimeLeft = () => {
    if (!miningEnd) return '--:--:--';
    const diff = Math.max(0, miningEnd - Date.now());
    const hrs = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const mins = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const isClaimReady = miningEnd && Date.now() >= miningEnd;

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div style={styles.loading}>
        🥚 Golden Goose V16
        <br />
        Loading...
      </div>
    );
  }

  // ==================== UI ====================
  return (
    <div style={styles.container}>
      {/* Toast */}
      {toast && <div style={styles.toast}>{toast}</div>}

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🥚 Golden Goose V16</h1>
        <div style={styles.badges}>
          {vip > 0 && <span style={styles.vipBadge}>💎 VIP</span>}
          <span style={styles.streakBadge}>🔥 {streak} Day Streak</span>
        </div>
      </div>

      {/* Balance */}
      <div style={styles.balanceBox}>
        <div style={styles.balanceItem}>
          <span style={styles.balanceLabel}>🪙 Coins</span>
          <span style={styles.balanceValue}>{balance.toLocaleString()}</span>
        </div>
        <div style={styles.balanceItem}>
          <span style={styles.balanceLabel}>💵 USD</span>
          <span style={styles.balanceValue}>${usdBalance.toFixed(2)}</span>
        </div>
      </div>

      {/* VIP Status */}
      {vip > 0 && (
        <div style={styles.vipStatus}>
          💎 VIP Active — {vipMiningLeft} Mining Left
        </div>
      )}

      {/* Free Mining Status */}
      {freeMinings > 0 && (
        <div style={styles.freeStatus}>
          🎁 Free Mining: {freeMinings} left
        </div>
      )}

      {/* Mining Section */}
      <div style={styles.miningBox}>
        <h3 style={styles.miningTitle}>⛏️ Mining</h3>
        <p style={styles.miningInfo}>
          {isMining ? (
            <>
              Mining in progress...
              <br />
              <span style={styles.timer}>{getTimeLeft()}</span>
            </>
          ) : (
            `Cost: ${CONFIG.MINING_COST} Coins → $${CONFIG.MINING_REWARD}`
          )}
        </p>

        {isMining ? (
          <button
            style={{
              ...styles.claimButton,
              opacity: isClaimReady ? 1 : 0.5,
              cursor: isClaimReady ? 'pointer' : 'not-allowed',
            }}
            onClick={claimMining}
            disabled={!isClaimReady}
          >
            {isClaimReady ? '💎 Claim $2' : '⏳ Mining...'}
          </button>
        ) : (
          <button
            style={styles.mineButton}
            onClick={startMining}
          >
            ⛏️ Start Mining
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(165deg, #0a0a1e 0%, #0d0d28 30%, #050510 60%, #000 100%)',
    color: '#fff',
    padding: '20px',
    fontFamily: "'Segoe UI', 'Noto Sans Myanmar', Arial, sans-serif",
  },
  loading: {
    minHeight: '100vh',
    background: '#0a0a1e',
    color: '#ffd700',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  toast: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(10,10,30,0.95)',
    color: '#ffd700',
    padding: '12px 24px',
    borderRadius: '30px',
    border: '1px solid rgba(255,215,0,0.5)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
    zIndex: '10000',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffd700',
    textShadow: '0 0 30px rgba(255,215,0,0.3)',
  },
  badges: {
    display: 'flex',
    gap: '8px',
  },
  vipBadge: {
    background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
    color: '#000',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  streakBadge: {
    color: '#ff9800',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  balanceBox: {
    display: 'flex',
    justifyContent: 'space-between',
    background: 'rgba(255,255,255,0.05)',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '16px',
  },
  balanceItem: {
    textAlign: 'center',
  },
  balanceLabel: {
    fontSize: '12px',
    color: '#888',
    display: 'block',
  },
  balanceValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ffd700',
  },
  vipStatus: {
    background: 'rgba(255,215,0,0.1)',
    border: '1px solid rgba(255,215,0,0.2)',
    padding: '10px',
    borderRadius: '10px',
    textAlign: 'center',
    marginBottom: '12px',
    color: '#ffd700',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  freeStatus: {
    background: 'rgba(0,200,83,0.1)',
    border: '1px solid rgba(0,200,83,0.2)',
    padding: '10px',
    borderRadius: '10px',
    textAlign: 'center',
    marginBottom: '12px',
    color: '#00e676',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  miningBox: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '16px',
    borderRadius: '12px',
  },
  miningTitle: {
    color: '#ffd700',
    marginBottom: '8px',
  },
  miningInfo: {
    fontSize: '14px',
    color: '#aaa',
    marginBottom: '12px',
  },
  timer: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffd700',
  },
  mineButton: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#000',
    cursor: 'pointer',
  },
  claimButton: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #00c853, #00e676)',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#000',
    cursor: 'pointer',
  },
};
