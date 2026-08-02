// Database Manager: Firestore & LocalStorage Sync Layer for Words & Leaderboards

import { DEFAULT_WORDS } from './words-data.js';
import { 
  db, 
  isFirebaseActive, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from './firebase-config.js';

const STORAGE_KEY_WORDS = 'craftvoca_custom_words';
const STORAGE_KEY_LEADERBOARD_GOLD = 'craftvoca_leaderboard_gold';
const STORAGE_KEY_LEADERBOARD_CLEARS = 'craftvoca_leaderboard_clears';

export class DBManager {
  // Load Words (Default + Teacher Words)
  async getWords() {
    let customWords = [];
    if (isFirebaseActive && db) {
      try {
        const snap = await getDocs(collection(db, 'words'));
        if (!snap.empty) {
          snap.forEach(d => customWords.push({ id: d.id, ...d.data() }));
          return customWords;
        }
      } catch (err) {
        console.warn('Firestore words fetch error, using local storage fallback:', err);
      }
    }

    // Local Storage fallback
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WORDS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }

    // Initialize with default 5th grade words
    localStorage.setItem(STORAGE_KEY_WORDS, JSON.stringify(DEFAULT_WORDS));
    return DEFAULT_WORDS;
  }

  // Save/Add Word
  async addWord(wordObj) {
    const words = await this.getWords();
    const newWord = {
      ...wordObj,
      id: 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)
    };
    words.unshift(newWord);

    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, 'words', newWord.id), newWord);
      } catch (err) {
        console.error('Firestore word add error:', err);
      }
    }
    localStorage.setItem(STORAGE_KEY_WORDS, JSON.stringify(words));
    return newWord;
  }

  // Delete Word
  async deleteWord(id) {
    let words = await this.getWords();
    words = words.filter(w => w.id !== id);

    if (isFirebaseActive && db) {
      try {
        await deleteDoc(doc(db, 'words', id));
      } catch (err) {
        console.error('Firestore word delete error:', err);
      }
    }
    localStorage.setItem(STORAGE_KEY_WORDS, JSON.stringify(words));
    return words;
  }

  // Reset to Default 5th Grade Curriculum Words
  async resetToDefaultWords() {
    if (isFirebaseActive && db) {
      try {
        // Clear existing firestore words
        const snap = await getDocs(collection(db, 'words'));
        snap.forEach(async (d) => {
          await deleteDoc(doc(db, 'words', d.id));
        });
        // Insert defaults
        for (const word of DEFAULT_WORDS) {
          await setDoc(doc(db, 'words', word.id), word);
        }
      } catch (err) {
        console.error(err);
      }
    }
    localStorage.setItem(STORAGE_KEY_WORDS, JSON.stringify(DEFAULT_WORDS));
    return DEFAULT_WORDS;
  }

  // Record Score / Submit to Hall of Fame Leaderboards
  async submitScore(userProfile) {
    const entry = {
      uid: userProfile.uid,
      displayName: userProfile.displayName || '탐험가',
      avatar: userProfile.avatar || 'steve',
      gold: userProfile.gold || 0,
      clears: userProfile.clears || 0,
      timestamp: Date.now()
    };

    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, 'leaderboard', userProfile.uid), entry);
      } catch (err) {
        console.error('Firestore leaderboard submit error:', err);
      }
    }

    // Local Storage sync for top 10 rankings
    this._updateLocalLeaderboard(STORAGE_KEY_LEADERBOARD_GOLD, entry, 'gold');
    this._updateLocalLeaderboard(STORAGE_KEY_LEADERBOARD_CLEARS, entry, 'clears');
  }

  _updateLocalLeaderboard(storageKey, entry, keyField) {
    let list = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) list = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }

    // Check if user exists
    const idx = list.findIndex(item => item.uid === entry.uid || item.displayName === entry.displayName);
    if (idx >= 0) {
      if (entry[keyField] > list[idx][keyField]) {
        list[idx] = entry;
      }
    } else {
      list.push(entry);
    }

    // Sort descending by target field & slice top 10
    list.sort((a, b) => b[keyField] - a[keyField]);
    list = list.slice(0, 10);
    localStorage.setItem(storageKey, JSON.stringify(list));
  }

  // Get Top 10 Gold Leaderboard
  async getTopGold() {
    if (isFirebaseActive && db) {
      try {
        const q = query(collection(db, 'leaderboard'), orderBy('gold', 'desc'), limit(10));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const res = [];
          snap.forEach(d => res.push(d.data()));
          return res;
        }
      } catch (err) {
        console.warn('Firestore leaderboard gold fetch error:', err);
      }
    }

    // Fallback to local
    return this._getLocalLeaderboard(STORAGE_KEY_LEADERBOARD_GOLD, 'gold');
  }

  // Get Top 10 Clears Leaderboard
  async getTopClears() {
    if (isFirebaseActive && db) {
      try {
        const q = query(collection(db, 'leaderboard'), orderBy('clears', 'desc'), limit(10));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const res = [];
          snap.forEach(d => res.push(d.data()));
          return res;
        }
      } catch (err) {
        console.warn('Firestore leaderboard clears fetch error:', err);
      }
    }

    // Fallback to local
    return this._getLocalLeaderboard(STORAGE_KEY_LEADERBOARD_CLEARS, 'clears');
  }

  _getLocalLeaderboard(key, sortField) {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const list = JSON.parse(stored);
        list.sort((a, b) => b[sortField] - a[sortField]);
        return list.slice(0, 10);
      }
    } catch (e) {
      console.error(e);
    }

    // Mock initial data if empty
    const mockData = [
      { displayName: '다이아 챔피언', avatar: 'diamond', gold: 1200, clears: 35 },
      { displayName: '엔더 헌터', avatar: 'enderman', gold: 850, clears: 24 },
      { displayName: '스티브 마스터', avatar: 'steve', gold: 640, clears: 18 },
      { displayName: '알렉스 보카', avatar: 'alex', gold: 490, clears: 14 },
      { displayName: '크리퍼 팡', avatar: 'creeper', gold: 310, clears: 9 }
    ];
    return mockData.slice(0, 10);
  }
}

export const dbManager = new DBManager();
