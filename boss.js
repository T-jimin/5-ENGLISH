// Gamified Ender Dragon Boss Raid Engine (500 Gold Entry Fee, 15s Action Timer, Player Hearts, Rage Mode, Sound FX Fix)

import { dbManager } from './db.js';
import { audioSynth } from './audio-synth.js';
import { authManager } from './auth.js';

export class BossRaidEngine {
  constructor(appController) {
    this.app = appController;
    this.ENTRY_FEE = 500;
    this.bossMaxHp = 100;
    this.bossHp = 100;
    this.playerHearts = 3;
    this.combo = 0;
    this.currentQuestionIndex = 0;
    this.questions = [];
    this.correctCount = 0;
    this.questionTimer = null;
    this.questionTimeLeft = 15; // 15s per question
  }

  async startBossRaid() {
    // Check gold
    if (!authManager.deductGold(this.ENTRY_FEE)) {
      alert(`🐉 보스전에 도전하려면 500 골드가 필요합니다!\n(현재 보유: ${authManager.currentUser.gold || 0} Gold)\n미니게임을 플레이하여 골드를 더 모아보세요!`);
      return;
    }

    const words = await dbManager.getWords();
    if (words.length < 5) {
      alert('단어가 부족합니다. 최소 5개 이상의 단어가 필요합니다.');
      return;
    }

    this.bossHp = 100;
    this.playerHearts = 3;
    this.combo = 0;
    this.correctCount = 0;
    this.currentQuestionIndex = 0;

    // Generate 10 mixed questions
    this.questions = this.generate10Questions(words);

    // Initial Boss Encounter Sound (Dragon roar)
    audioSynth.playBossAttack();
    this.openBossModal();
    this.renderQuestion();
  }

  generate10Questions(words) {
    const questions = [];
    const types = ['listening', 'reading', 'writing'];

    for (let i = 0; i < 10; i++) {
      const type = types[i % 3];
      const target = words[Math.floor(Math.random() * words.length)];

      const options = [target];
      while (options.length < 4) {
        const rand = words[Math.floor(Math.random() * words.length)];
        if (!options.some(o => o.id === rand.id)) {
          options.push(rand);
        }
      }
      options.sort(() => Math.random() - 0.5);

      questions.push({
        num: i + 1,
        type,
        target,
        options
      });
    }

    return questions;
  }

  openBossModal() {
    const modal = document.getElementById('boss-modal');
    modal.classList.remove('d-none');
  }

  closeBossModal() {
    this.stopQuestionTimer();
    const modal = document.getElementById('boss-modal');
    modal.classList.add('d-none');
  }

  startQuestionTimer() {
    this.stopQuestionTimer();
    this.questionTimeLeft = 15;
    const timerEl = document.getElementById('boss-question-timer');
    if (timerEl) timerEl.textContent = `${this.questionTimeLeft}초`;

    this.questionTimer = setInterval(() => {
      this.questionTimeLeft -= 1;
      if (timerEl) timerEl.textContent = `${this.questionTimeLeft}초`;

      if (this.questionTimeLeft <= 5 && this.questionTimeLeft > 0) {
        audioSynth.playTick();
      }

      if (this.questionTimeLeft <= 0) {
        this.stopQuestionTimer();
        this.handleAnswer(false, true); // Timeout count as wrong
      }
    }, 1000);
  }

  stopQuestionTimer() {
    if (this.questionTimer) {
      clearInterval(this.questionTimer);
      this.questionTimer = null;
    }
  }

  renderQuestion() {
    const q = this.questions[this.currentQuestionIndex];
    const container = document.getElementById('boss-question-container');
    const hpBar = document.getElementById('boss-hp-bar');
    const hpText = document.getElementById('boss-hp-text');
    const questionNum = document.getElementById('boss-question-num');
    const heartsEl = document.getElementById('boss-player-hearts');
    const dragonAvatar = document.getElementById('boss-dragon-avatar');
    const modalContent = document.querySelector('#boss-modal .mc-modal-content');

    // Rage Mode (At 50% HP or less)
    const isRage = this.bossHp <= 50;
    if (modalContent) {
      modalContent.classList.toggle('boss-rage-bg', isRage);
    }
    if (dragonAvatar) {
      dragonAvatar.textContent = isRage ? '🐉🔥' : '🐉';
    }

    if (hpBar) hpBar.style.width = `${(this.bossHp / this.bossMaxHp) * 100}%`;
    if (hpText) hpText.textContent = `${this.bossHp} / ${this.bossMaxHp} HP ${isRage ? '⚡ RAGE MODE!' : ''}`;
    if (questionNum) questionNum.textContent = `문제 ${this.currentQuestionIndex + 1} / 10`;
    if (heartsEl) heartsEl.textContent = '💖'.repeat(Math.max(0, this.playerHearts));

    this.startQuestionTimer();

    let contentHtml = '';

    if (q.type === 'listening') {
      contentHtml = `
        <div class="boss-quiz-card text-center">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="mc-badge-stone">🎧 듣기 퀴즈</span>
            <span class="mc-badge-gold">⏱️ 제한시간: <strong id="boss-question-timer">15초</strong></span>
          </div>
          <button id="btn-boss-tts" class="mc-btn mc-btn-gold mc-btn-large my-3">
            🔊 영어 발음 다시 듣기
          </button>
          <p class="text-muted">들리는 영어 발음과 일치하는 뜻을 선택하여 공격하세요!</p>
          <div class="boss-options-grid mt-3">
            ${q.options.map(opt => `
              <button class="mc-btn mc-btn-stone btn-boss-choice" data-id="${opt.id}">
                ${opt.meaning}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    } else if (q.type === 'reading') {
      contentHtml = `
        <div class="boss-quiz-card text-center">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="mc-badge-stone">📖 읽기 퀴즈</span>
            <span class="mc-badge-gold">⏱️ 제한시간: <strong id="boss-question-timer">15초</strong></span>
          </div>
          <h2 class="mc-text-gold display-4 my-3">${q.target.word}</h2>
          <p class="text-muted">올바른 한국어 뜻을 선택하여 크리티컬 공격을 넣으세요!</p>
          <div class="boss-options-grid mt-3">
            ${q.options.map(opt => `
              <button class="mc-btn mc-btn-wood btn-boss-choice" data-id="${opt.id}">
                ${opt.meaning}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    } else { // writing - HORIZONTAL FLEX LAYOUT
      const targetWord = q.target.word.toLowerCase();
      let letters = targetWord.split('');
      const alphabet = 'abcdefghijklmnopqrstuvwxyz';
      letters.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
      letters.sort(() => Math.random() - 0.5);

      let currentInput = [];

      contentHtml = `
        <div class="boss-quiz-card text-center">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="mc-badge-stone">✏️ 쓰기 퀴즈 (가로 입력)</span>
            <span class="mc-badge-gold">⏱️ 제한시간: <strong id="boss-question-timer">15초</strong></span>
          </div>
          <h3 class="mc-text-emerald my-2">"${q.target.meaning}"</h3>
          <p class="text-muted">알파벳을 순서대로 클릭하여 조합하세요!</p>
          
          <!-- Horizontal Target Slots -->
          <div class="boss-spelling-slots my-3">
            ${targetWord.split('').map((_, i) => `<div class="craft-slot" id="boss-slot-${i}"></div>`).join('')}
          </div>

          <!-- Horizontal Letter Tiles -->
          <div class="letter-bank-grid">
            ${letters.map((char, idx) => `
              <button class="mc-letter-block btn-boss-letter" data-char="${char}" data-idx="${idx}">
                ${char.toUpperCase()}
              </button>
            `).join('')}
          </div>

          <div class="mt-3 flex-center gap-2">
            <button id="btn-boss-backspace" class="mc-btn mc-btn-stone mc-btn-sm">⌫ 한 글자 지우기</button>
            <button id="btn-boss-clear" class="mc-btn mc-btn-danger mc-btn-sm">🗑️ 전체 지우기</button>
          </div>
        </div>
      `;

      container.innerHTML = contentHtml;

      const updateBossWritingUI = () => {
        targetWord.split('').forEach((_, idx) => {
          const slot = document.getElementById(`boss-slot-${idx}`);
          if (slot) {
            slot.textContent = currentInput[idx] ? currentInput[idx].toUpperCase() : '';
            slot.classList.toggle('filled', !!currentInput[idx]);
          }
        });
      };

      document.getElementById('btn-boss-backspace').onclick = () => {
        if (currentInput.length > 0) {
          currentInput.pop();
          audioSynth.playTick();
          updateBossWritingUI();
        }
      };

      document.getElementById('btn-boss-clear').onclick = () => {
        currentInput = [];
        audioSynth.playBlockHit();
        updateBossWritingUI();
      };

      const letterBtns = container.querySelectorAll('.btn-boss-letter');
      letterBtns.forEach(btn => {
        btn.onclick = () => {
          if (currentInput.length < targetWord.length) {
            currentInput.push(btn.dataset.char);
            audioSynth.playTick();
            updateBossWritingUI();

            if (currentInput.length === targetWord.length) {
              if (currentInput.join('') === targetWord) {
                this.handleAnswer(true);
              } else {
                this.handleAnswer(false);
              }
            }
          }
        };
      });
      return;
    }

    container.innerHTML = contentHtml;

    // Listening & Reading listeners
    if (q.type === 'listening') {
      audioSynth.speak(q.target.word);
      document.getElementById('btn-boss-tts').onclick = () => audioSynth.speak(q.target.word);
    }

    const choiceBtns = container.querySelectorAll('.btn-boss-choice');
    choiceBtns.forEach(btn => {
      btn.onclick = () => {
        if (btn.dataset.id === q.target.id) {
          this.handleAnswer(true);
        } else {
          this.handleAnswer(false);
        }
      };
    });
  }

  async handleAnswer(isCorrect, isTimeout = false) {
    this.stopQuestionTimer();
    const dragonImg = document.getElementById('boss-dragon-avatar');
    const modalContent = document.querySelector('#boss-modal .mc-modal-content');

    if (isCorrect) {
      this.correctCount += 1;
      this.combo += 1;

      // Calculate Damage: Normal 10 damage, Critical hit 20 damage if combo >= 2
      const damage = this.combo >= 2 ? 20 : 10;
      this.bossHp = Math.max(0, this.bossHp - damage);

      // ✨ EXPLICIT BRIGHT SOUND EFFECT FOR CORRECT ANSWER!
      if (this.combo >= 2) {
        audioSynth.playSuccess(); // Fanfare!
        this.showParticleFx(dragonImg, `💥 CRITICAL HIT! -${damage} HP`, '#ffd700');
      } else {
        audioSynth.playCoin(); // Coin chime!
        this.showParticleFx(dragonImg, `⚔️ HIT! -${damage} HP`, '#00e676');
      }

      if (dragonImg) {
        dragonImg.classList.add('boss-hit-anim');
        setTimeout(() => dragonImg.classList.remove('boss-hit-anim'), 400);
      }
    } else {
      // Wrong answer or Timeout -> Player takes damage!
      this.combo = 0;
      this.playerHearts -= 1;

      // 🛑 EXPLICIT DEFEAT / DRAGON ATTACK SOUND FOR WRONG ANSWER!
      audioSynth.playWrong();
      audioSynth.playBossAttack(); // Dragon roaring screech!

      const heartsEl = document.getElementById('boss-player-hearts');
      if (heartsEl) heartsEl.textContent = '💖'.repeat(Math.max(0, this.playerHearts));

      if (modalContent) {
        modalContent.classList.add('player-shake-anim');
        setTimeout(() => modalContent.classList.remove('player-shake-anim'), 400);
      }

      this.showParticleFx(dragonImg, isTimeout ? '⏱️ 시간 초과! 🐉🔥 브레스 피격!' : '❌ 오답! 🐉🔥 브레스 피격!', '#ff5252');
    }

    this.currentQuestionIndex += 1;

    // Check Win/Loss conditions
    if (this.bossHp <= 0 || this.playerHearts <= 0 || this.currentQuestionIndex >= 10) {
      setTimeout(() => this.endBossRaid(), 800);
    } else {
      setTimeout(() => this.renderQuestion(), 700);
    }
  }

  async endBossRaid() {
    this.stopQuestionTimer();
    const isVictory = this.bossHp <= 0 || (this.playerHearts > 0 && this.correctCount >= 7);
    let rewardGold = 0;

    if (isVictory) {
      rewardGold = 500 + (this.correctCount * 30); // Great bonus gold
      audioSynth.playSuccess();
      authManager.addStats(rewardGold, 1);
    } else {
      audioSynth.playWrong();
    }

    // Submit user score to Firestore / Local Hall of Fame
    await dbManager.submitScore(authManager.currentUser);

    const container = document.getElementById('boss-question-container');
    container.innerHTML = `
      <div class="boss-result-card text-center py-4">
        <h1 class="${isVictory ? 'mc-text-gold' : 'text-danger'} display-3 mb-2">
          ${isVictory ? '🐉🔥 엔더 드래곤 처치 성공!' : '💀 보스전 실패... (체력 다함)'}
        </h1>
        <p class="lead">10문제 중 <strong>${this.correctCount} 문제</strong> 정답!</p>
        <p class="text-muted">보스 남은 체력: ${this.bossHp} HP / 나의 남은 하트: ${'💖'.repeat(Math.max(0, this.playerHearts))}</p>

        ${isVictory ? `
          <div class="reward-box my-4 p-3 mc-box-gold">
            <h2>🏆 전설의 엔더 슬레이어 등극!</h2>
            <h1 class="display-3 text-warning">+${rewardGold} GOLD 획득</h1>
            <p class="text-emerald">명예의 전당 랭킹에 기록이 업데이트되었습니다!</p>
          </div>
        ` : `
          <div class="reward-box my-4 p-3 mc-box-stone">
            <p>미니게임을 더 연습하고 골드를 모아 다시 도전해보세요!</p>
          </div>
        `}

        <div class="d-flex justify-content-center gap-3 mt-4">
          <button id="btn-boss-hall" class="mc-btn mc-btn-gold mc-btn-large">🏆 명예의 전당 확인</button>
          <button id="btn-boss-close" class="mc-btn mc-btn-stone mc-btn-large">🏠 로비로 돌아가기</button>
        </div>
      </div>
    `;

    document.getElementById('btn-boss-hall').onclick = () => {
      this.closeBossModal();
      this.app.switchView('hall-of-fame');
    };

    document.getElementById('btn-boss-close').onclick = () => {
      this.closeBossModal();
    };
  }

  showParticleFx(targetEl, text, color = '#00e676') {
    if (!targetEl) return;
    const popup = document.createElement('div');
    popup.className = 'mc-particle-popup';
    popup.textContent = text;
    popup.style.color = color;

    const rect = targetEl.getBoundingClientRect();
    popup.style.left = `${rect.left + rect.width / 2}px`;
    popup.style.top = `${rect.top}px`;

    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1200);
  }
}
