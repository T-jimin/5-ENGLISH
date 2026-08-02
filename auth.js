// Auth Manager: Supports Google Login, Anonymous Login, Local Fallback, & Character Skins

import { 
  auth, 
  isFirebaseActive, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut 
} from './firebase-config.js';

const STORAGE_KEY_USER = 'craftvoca_user_profile';

export const AVATARS = [
  { id: 'steve', name: '스티브 (Steve)', icon: '🟩', color: '#5c8e32' },
  { id: 'alex', name: '알렉스 (Alex)', icon: '🟧', color: '#d87f33' },
  { id: 'diamond', name: '다이아 용사 (Diamond)', icon: '💎', color: '#40e0d0' },
  { id: 'creeper', name: '크리퍼 (Creeper)', icon: '🧨', color: '#2e7d32' },
  { id: 'enderman', name: '엔더맨 (Enderman)', icon: '👁️', color: '#7b1fa2' }
];

export class AuthManager {
  constructor() {
    this.currentUser = this.loadLocalUser();
    this.onUserChangeCallbacks = [];
    this.init();
  }

  loadLocalUser() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      uid: 'guest_' + Math.random().toString(36).substr(2, 9),
      displayName: '익명 탐험가',
      avatar: 'steve',
      role: 'student',
      gold: 50,
      clears: 0,
      isAnonymous: true,
      isFirebase: false
    };
  }

  saveLocalUser() {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
    } catch (e) {
      console.error(e);
    }
  }

  init() {
    if (isFirebaseActive && auth) {
      onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          this.currentUser = {
            ...this.currentUser,
            uid: fbUser.uid,
            displayName: fbUser.displayName || this.currentUser.displayName || '탐험가',
            email: fbUser.email || '',
            isAnonymous: fbUser.isAnonymous,
            isFirebase: true
          };
          this.saveLocalUser();
          this.notifyUserChange();
        }
      });
    }
  }

  onUserChange(callback) {
    this.onUserChangeCallbacks.push(callback);
    callback(this.currentUser);
  }

  notifyUserChange() {
    this.onUserChangeCallbacks.forEach(cb => cb(this.currentUser));
  }

  // Google Login
  async loginWithGoogle() {
    if (!isFirebaseActive || !auth) {
      throw new Error('Firebase가 설정되지 않았습니다. [설정] 버튼에서 Firebase 키를 등록하시거나 익명/로컬 모드를 이용해 주세요.');
    }
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    this.currentUser = {
      ...this.currentUser,
      uid: user.uid,
      displayName: user.displayName || '구글 사용자',
      email: user.email,
      isAnonymous: false,
      isFirebase: true
    };
    this.saveLocalUser();
    this.notifyUserChange();
    return this.currentUser;
  }

  // Anonymous Firebase Login
  async loginAnonymously(customNickname = '익명 탐험가') {
    if (isFirebaseActive && auth) {
      const result = await signInAnonymously(auth);
      const user = result.user;
      this.currentUser = {
        ...this.currentUser,
        uid: user.uid,
        displayName: customNickname,
        isAnonymous: true,
        isFirebase: true
      };
    } else {
      this.currentUser = {
        ...this.currentUser,
        displayName: customNickname,
        isAnonymous: true,
        isFirebase: false
      };
    }
    this.saveLocalUser();
    this.notifyUserChange();
    return this.currentUser;
  }

  // Set Local Guest Profile
  setGuestNickname(nickname, avatarId = 'steve') {
    this.currentUser.displayName = nickname || '익명 탐험가';
    this.currentUser.avatar = avatarId;
    this.saveLocalUser();
    this.notifyUserChange();
  }

  // Update Avatar
  setAvatar(avatarId) {
    this.currentUser.avatar = avatarId;
    this.saveLocalUser();
    this.notifyUserChange();
  }

  // Add Gold & Clears
  addStats(goldAmount, clearCount = 1) {
    this.currentUser.gold = (this.currentUser.gold || 0) + goldAmount;
    this.currentUser.clears = (this.currentUser.clears || 0) + clearCount;
    this.saveLocalUser();
    this.notifyUserChange();
  }

  // Deduct Gold for Boss Challenge
  deductGold(amount) {
    if ((this.currentUser.gold || 0) < amount) {
      return false;
    }
    this.currentUser.gold -= amount;
    this.saveLocalUser();
    this.notifyUserChange();
    return true;
  }

  async logout() {
    if (isFirebaseActive && auth) {
      await signOut(auth);
    }
    this.currentUser = {
      uid: 'guest_' + Math.random().toString(36).substr(2, 9),
      displayName: '익명 탐험가',
      avatar: 'steve',
      role: 'student',
      gold: 50,
      clears: 0,
      isAnonymous: true,
      isFirebase: false
    };
    this.saveLocalUser();
    this.notifyUserChange();
  }
}

export const authManager = new AuthManager();
