// Main Application Router & Controller (Craft Voca)

import { authManager, AVATARS } from './auth.js';
import { isFirebaseActive, STORAGE_KEY_CONFIG } from './firebase-config.js';
import { TeacherModule } from './teacher.js';
import { StudyModule } from './study.js';
import { MiniGameEngine } from './minigames.js';
import { BossRaidEngine } from './boss.js';
import { HallOfFameModule } from './hallOfFame.js';
import { audioSynth } from './audio-synth.js';

class AppController {
  constructor() {
    this.teacherModule = new TeacherModule(this);
    this.studyModule = new StudyModule(this);
    this.miniGameEngine = new MiniGameEngine(this);
    this.bossRaidEngine = new BossRaidEngine(this);
    this.hallOfFameModule = new HallOfFameModule(this);
  }

  async init() {
    this.bindGlobalNavigation();
    this.bindAuthUI();
    this.bindFirebaseConfigModal();
    
    // Subscribe to auth state updates
    authManager.onUserChange((user) => {
      this.renderUserProfile(user);
    });

    // Initialize modules
    await this.teacherModule.init();
    await this.studyModule.init();
    await this.hallOfFameModule.init();

    // Default view: Student Lobby
    this.switchView('student-hub');
    console.log('🎮 Craft Voca App initialized!');
  }

  switchView(viewId) {
    const views = document.querySelectorAll('.app-view');
    views.forEach(v => v.classList.add('d-none'));

    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.remove('d-none');
    }

    // Update active nav links
    const navLinks = document.querySelectorAll('.mc-nav-btn');
    navLinks.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });

    audioSynth.playTick();

    // Specific tab init calls
    if (viewId === 'hall-of-fame') {
      this.hallOfFameModule.render();
    } else if (viewId === 'student-study') {
      this.studyModule.init();
    } else if (viewId === 'teacher') {
      this.teacherModule.refreshWordList();
    }
  }

  bindGlobalNavigation() {
    const navBtns = document.querySelectorAll('[data-view]');
    navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const viewId = btn.dataset.view;
        this.switchView(viewId);
      });
    });

    // Student Hub Action Buttons
    const btnStartStudy = document.getElementById('hub-btn-study');
    if (btnStartStudy) {
      btnStartStudy.onclick = () => this.switchView('student-study');
    }

    // Mini-game buttons
    const btnGameListen = document.getElementById('hub-btn-game-listen');
    if (btnGameListen) {
      btnGameListen.onclick = () => this.miniGameEngine.startListeningGame();
    }

    const btnGameRead = document.getElementById('hub-btn-game-read');
    if (btnGameRead) {
      btnGameRead.onclick = () => this.miniGameEngine.startReadingGame();
    }

    const btnGameWrite = document.getElementById('hub-btn-game-write');
    if (btnGameWrite) {
      btnGameWrite.onclick = () => this.miniGameEngine.startWritingGame();
    }

    // Boss Raid Button
    const btnBoss = document.getElementById('hub-btn-boss');
    if (btnBoss) {
      btnBoss.onclick = () => this.bossRaidEngine.startBossRaid();
    }

    // Sound Mute Toggle
    const muteBtn = document.getElementById('btn-toggle-sound');
    if (muteBtn) {
      muteBtn.onclick = () => {
        audioSynth.muted = !audioSynth.muted;
        muteBtn.textContent = audioSynth.muted ? '🔇 소리 끔' : '🔊 소리 켬';
        this.showToast(audioSynth.muted ? '🔇 효과음이 켜졌습니다/꺼졌습니다.' : '🔊 효과음이 켜졌습니다.');
      };
    }
  }

  bindAuthUI() {
    const btnGoogleLogin = document.getElementById('btn-google-login');
    if (btnGoogleLogin) {
      btnGoogleLogin.onclick = async () => {
        try {
          await authManager.loginWithGoogle();
          this.showToast('🟢 Google 로그인 성공!');
        } catch (err) {
          alert(err.message || 'Google 로그인 중 오류가 발생했습니다.');
        }
      };
    }

    const btnAnonLogin = document.getElementById('btn-anon-login');
    if (btnAnonLogin) {
      btnAnonLogin.onclick = () => {
        const name = prompt('학습자 닉네임을 입력하세요:', authManager.currentUser.displayName || '탐험가');
        if (name) {
          authManager.loginAnonymously(name);
          this.showToast('⛏️ 익명 학습자로 입장하셨습니다!');
        }
      };
    }

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.onclick = async () => {
        await authManager.logout();
        this.showToast('👋 로그아웃 되었습니다.');
      };
    }

    // Avatar Selection Buttons
    const avatarBtns = document.querySelectorAll('.btn-select-avatar');
    avatarBtns.forEach(btn => {
      btn.onclick = () => {
        const avatarId = btn.dataset.avatar;
        authManager.setAvatar(avatarId);
        this.showToast('👤 마인크래프트 캐릭터가 변경되었습니다!');
      };
    });
  }

  renderUserProfile(user) {
    const nameEl = document.getElementById('user-profile-name');
    const goldEl = document.getElementById('user-profile-gold');
    const clearsEl = document.getElementById('user-profile-clears');
    const avatarEl = document.getElementById('user-profile-avatar');
    const fbBadge = document.getElementById('firebase-status-badge');

    const avatarObj = AVATARS.find(a => a.id === user.avatar) || AVATARS[0];

    if (nameEl) nameEl.textContent = user.displayName || '탐험가';
    if (goldEl) goldEl.textContent = (user.gold || 0).toLocaleString();
    if (clearsEl) clearsEl.textContent = (user.clears || 0).toLocaleString();
    if (avatarEl) avatarEl.textContent = avatarObj.icon;

    if (fbBadge) {
      if (isFirebaseActive) {
        fbBadge.className = 'mc-badge-emerald';
        fbBadge.textContent = '🔥 Firebase 실시간 연결됨';
      } else {
        fbBadge.className = 'mc-badge-wood';
        fbBadge.textContent = '💾 로컬 데모 모드 (Firebase 키 미설정)';
      }
    }
  }

  bindFirebaseConfigModal() {
    const btnOpenConfig = document.getElementById('btn-open-firebase-config');
    const modal = document.getElementById('firebase-config-modal');
    const btnSaveConfig = document.getElementById('btn-save-firebase-config');
    const btnCloseModal = document.getElementById('btn-close-firebase-config');

    if (btnOpenConfig && modal) {
      btnOpenConfig.onclick = () => {
        modal.classList.remove('d-none');
      };
    }

    if (btnCloseModal && modal) {
      btnCloseModal.onclick = () => {
        modal.classList.add('d-none');
      };
    }

    if (btnSaveConfig) {
      btnSaveConfig.onclick = () => {
        const apiKey = document.getElementById('fb-api-key').value.trim();
        const projectId = document.getElementById('fb-project-id').value.trim();
        const authDomain = document.getElementById('fb-auth-domain').value.trim();
        const appId = document.getElementById('fb-app-id').value.trim();

        if (!apiKey || !projectId) {
          alert('API Key와 Project ID는 필수 입력값입니다.');
          return;
        }

        const configObj = {
          apiKey,
          authDomain: authDomain || `${projectId}.firebaseapp.com`,
          projectId,
          storageBucket: `${projectId}.appspot.com`,
          messagingSenderId: '123456789',
          appId: appId || '1:123456789:web:abcdef'
        };

        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(configObj));
        alert('🔥 Firebase 설정이 저장되었습니다! 페이지를 새로고침하여 적용합니다.');
        window.location.reload();
      };
    }
  }

  showToast(message) {
    let toast = document.getElementById('mc-global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'mc-global-toast';
      toast.className = 'mc-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
}

// Global App Initialization
document.addEventListener('DOMContentLoaded', () => {
  window.appController = new AppController();
  window.appController.init();
});
