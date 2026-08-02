// 3 Mini-Games Engine (1-Minute Time Attack each): Listening/Speaking, Reading, Writing

import { dbManager } from './db.js';
import { audioSynth } from './audio-synth.js';
import { authManager } from './auth.js';

export class MiniGameEngine {
  constructor(appController) {
    this.app = appController;
    this.words = [];
    this.currentGame = null; // 'listening' | 'reading' | 'writing'
    this.score = 0;
    this.combo = 0;
    this.timeLeft = 60; // 1-minute time attack
    this.timerId = null;
    this.currentQuestion = null;
  }

  async loadWords() {
    this.words = await dbManager.getWords();
  }

  // --- GAME 1: LISTENING & SPEAKING (듣기말하기 1분 미니게임) ---
  async startListeningGame() {
    await this.loadWords();
    if (this.words.length < 4) {
      alert('단어가 최소 4개 이상 필요합니다. 선생님 페이지에서 단어를 추가해 주세요.');
      return;
    }

    this.currentGame = 'listening';
    this.score = 0;
    this.combo = 0;
    this.timeLeft = 60;

    this.openGameModal('🎧 블록 듣기말하기 (1분 타임어택)');
    this.startTimer();
    this.nextListeningQuestion();
  }

  nextListeningQuestion() {
    if (this.timeLeft <= 0) return;

    // Pick random target word
    const target = this.words[Math.floor(Math.random() * this.words.length)];
    const options = [target];
    
    // Pick 3 random wrong options
    while (options.length < 4) {
      const rand = this.words[Math.floor(Math.random() * this.words.length)];
      if (!options.some(o => o.id === rand.id)) {
        options.push(rand);
      }
    }
    options.sort(() => Math.random() - 0.5);

    this.currentQuestion = { target, options };

    const container = document.getElementById('minigame-content');
    container.innerHTML = `
      <div class="mc-game-panel">
        <div class="audio-prompt-box">
          <button id="btn-replay-audio" class="mc-btn mc-btn-gold mc-btn-large">
            🔊 영어 발음 다시 듣기
          </button>
          <p class="text-muted mt-2">들리는 발음과 일치하는 픽셀 광석 블록을 채굴하세요!</p>
        </div>

        <div class="mc-ore-grid mt-4">
          ${options.map((opt, idx) => `
            <button class="mc-ore-block btn-select-option" data-id="${opt.id}">
              <div class="ore-icon">${['⛏️💎', '⛏️🥇', '⛏️🟢', '⛏️🔴'][idx]}</div>
              <div class="ore-word">${opt.word}</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Play TTS automatically
    audioSynth.speak(target.word);

    // Replay button
    document.getElementById('btn-replay-audio').onclick = () => {
      audioSynth.speak(target.word);
    };

    // Option selection
    const optionBtns = container.querySelectorAll('.btn-select-option');
    optionBtns.forEach(btn => {
      btn.onclick = () => {
        const selectedId = btn.dataset.id;
        if (selectedId === target.id) {
          this.handleCorrectAnswer(btn);
          this.nextListeningQuestion();
        } else {
          this.handleWrongAnswer(btn);
        }
      };
    });
  }

  // --- GAME 2: SPEED PIXEL READING (읽기 1분 미니게임) ---
  async startReadingGame() {
    await this.loadWords();
    if (this.words.length < 4) {
      alert('단어가 최소 4개 이상 필요합니다.');
      return;
    }

    this.currentGame = 'reading';
    this.score = 0;
    this.combo = 0;
    this.timeLeft = 60;

    this.openGameModal('📖 스피드 픽셀 읽기 (1분 타임어택)');
    this.startTimer();
    this.nextReadingQuestion();
  }

  nextReadingQuestion() {
    if (this.timeLeft <= 0) return;

    const target = this.words[Math.floor(Math.random() * this.words.length)];
    const options = [target.meaning];

    while (options.length < 4) {
      const rand = this.words[Math.floor(Math.random() * this.words.length)];
      if (!options.includes(rand.meaning)) {
        options.push(rand.meaning);
      }
    }
    options.sort(() => Math.random() - 0.5);

    this.currentQuestion = { target, options };

    const container = document.getElementById('minigame-content');
    container.innerHTML = `
      <div class="mc-game-panel text-center">
        <div class="mc-monster-card pulse-anim">
          <div class="monster-avatar">👾</div>
          <h2 class="mc-text-gold display-4 my-2">${target.word}</h2>
          <span class="mc-badge-stone">/${target.phonetic || ''}/</span>
        </div>

        <p class="mt-3 text-muted">위 영어 단어에 알맞은 픽셀 한국어 뜻을 선택하세요!</p>

        <div class="mc-reading-grid mt-3">
          ${options.map(meaning => `
            <button class="mc-btn mc-btn-wood btn-meaning-opt" data-meaning="${meaning}">
              ${meaning}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    const btns = container.querySelectorAll('.btn-meaning-opt');
    btns.forEach(btn => {
      btn.onclick = () => {
        if (btn.dataset.meaning === target.meaning) {
          this.handleCorrectAnswer(btn);
          this.nextReadingQuestion();
        } else {
          this.handleWrongAnswer(btn);
        }
      };
    });
  }

  // --- GAME 3: CRAFT SPELLING WRITING (쓰기 1분 미니게임) ---
  async startWritingGame() {
    await this.loadWords();
    if (this.words.length === 0) return;

    this.currentGame = 'writing';
    this.score = 0;
    this.combo = 0;
    this.timeLeft = 60;

    this.openGameModal('✏️ 크래프트 철자 쓰기 (1분 타임어택)');
    this.startTimer();
    this.nextWritingQuestion();
  }

  nextWritingQuestion() {
    if (this.timeLeft <= 0) return;

    const target = this.words[Math.floor(Math.random() * this.words.length)];
    const targetWord = target.word.toLowerCase();
    
    // Scramble letters
    let letters = targetWord.split('');
    // Add 2 extra random noise letters
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < 2; i++) {
      letters.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }
    letters.sort(() => Math.random() - 0.5);

    let currentCrafted = [];

    const container = document.getElementById('minigame-content');
    
    const updateCraftingUI = () => {
      container.innerHTML = `
        <div class="mc-game-panel text-center">
          <div class="craft-prompt-box">
            <span class="mc-badge-wood">${target.category || '단어'}</span>
            <h3 class="mc-text-emerald my-2">"${target.meaning}"</h3>
            <button id="btn-craft-tts" class="mc-btn mc-btn-stone mc-btn-sm">🔊 발음 힌트</button>
          </div>

          <!-- Crafting Output Slots -->
          <div class="crafting-output-slots my-4">
            ${targetWord.split('').map((_, i) => `
              <div class="craft-slot ${currentCrafted[i] ? 'filled' : ''}">
                ${currentCrafted[i] ? currentCrafted[i].toUpperCase() : ''}
              </div>
            `).join('')}
          </div>

          <!-- Letter Block Bank -->
          <div class="letter-bank-grid">
            ${letters.map((char, idx) => `
              <button class="mc-letter-block btn-letter-tile" data-char="${char}" data-idx="${idx}">
                ${char.toUpperCase()}
              </button>
            `).join('')}
          </div>

          <div class="mt-4 flex-center gap-2">
            <button id="btn-backspace-craft" class="mc-btn mc-btn-stone">⌫ 한 글자 지우기</button>
            <button id="btn-clear-craft" class="mc-btn mc-btn-danger">🗑️ 전체 지우기</button>
          </div>
        </div>
      `;

      // Re-bind listeners
      document.getElementById('btn-craft-tts').onclick = () => audioSynth.speak(target.word);

      document.getElementById('btn-backspace-craft').onclick = () => {
        if (currentCrafted.length > 0) {
          currentCrafted.pop();
          audioSynth.playTick();
          updateCraftingUI();
        }
      };

      document.getElementById('btn-clear-craft').onclick = () => {
        currentCrafted = [];
        audioSynth.playBlockHit();
        updateCraftingUI();
      };

      const letterBtns = container.querySelectorAll('.btn-letter-tile');
      letterBtns.forEach(btn => {
        btn.onclick = () => {
          if (currentCrafted.length < targetWord.length) {
            currentCrafted.push(btn.dataset.char);
            audioSynth.playTick();

            if (currentCrafted.length === targetWord.length) {
              const resultStr = currentCrafted.join('');
              if (resultStr === targetWord) {
                this.handleCorrectAnswer(btn);
                this.nextWritingQuestion();
              } else {
                this.handleWrongAnswer(btn);
                currentCrafted = [];
                setTimeout(() => updateCraftingUI(), 400);
              }
            } else {
              updateCraftingUI();
            }
          }
        };
      });
    };

    updateCraftingUI();
  }

  // --- COMMON GAME LOOPS & UTILITIES ---
  handleCorrectAnswer(element) {
    this.combo += 1;
    const gained = 100 + (this.combo * 20);
    this.score += gained;
    audioSynth.playCoin();

    this.updateHeaderStats();
    this.showParticleFx(element, `+${gained} 점 (콤보 x${this.combo})`, '#00e676');
  }

  handleWrongAnswer(element) {
    this.combo = 0;
    audioSynth.playWrong();
    this.updateHeaderStats();
    this.showParticleFx(element, '❌ 틀렸습니다!', '#ff5252');
  }

  updateHeaderStats() {
    const scoreEl = document.getElementById('minigame-score');
    const comboEl = document.getElementById('minigame-combo');
    if (scoreEl) scoreEl.textContent = this.score;
    if (comboEl) comboEl.textContent = `x${this.combo}`;
  }

  startTimer() {
    clearInterval(this.timerId);
    const timerEl = document.getElementById('minigame-timer');

    this.timerId = setInterval(() => {
      this.timeLeft -= 1;
      if (timerEl) timerEl.textContent = `${this.timeLeft}초`;
      
      if (this.timeLeft <= 10 && this.timeLeft > 0) {
        audioSynth.playTick();
        if (timerEl) timerEl.classList.add('text-danger-pulse');
      }

      if (this.timeLeft <= 0) {
        clearInterval(this.timerId);
        this.endGame();
      }
    }, 1000);
  }

  async endGame() {
    // 100 score = 10 gold ratio
    const earnedGold = Math.floor(this.score / 10);
    audioSynth.playSuccess();

    // Award gold and increment clear stats
    authManager.addStats(earnedGold, 1);
    await dbManager.submitScore(authManager.currentUser);

    const container = document.getElementById('minigame-content');
    container.innerHTML = `
      <div class="mc-game-result text-center py-4">
        <h1 class="mc-text-gold display-3 mb-2">🎉 1분 타임어택 종료!</h1>
        <p class="lead">최종 획득 점수: <strong>${this.score} 점</strong></p>

        <div class="reward-box my-4 p-3 mc-box-gold">
          <h3>💰 보상 골드 획득!</h3>
          <h2 class="display-4 text-warning">+${earnedGold} GOLD</h2>
          <p class="text-muted">모은 골드로 보스에게 도전할 수 있습니다!</p>
        </div>

        <div class="d-flex justify-content-center gap-3">
          <button id="btn-game-retry" class="mc-btn mc-btn-gold mc-btn-large">🔄 다시 도전하기</button>
          <button id="btn-game-exit" class="mc-btn mc-btn-stone mc-btn-large">🏠 로비로 이동</button>
        </div>
      </div>
    `;

    document.getElementById('btn-game-retry').onclick = () => {
      if (this.currentGame === 'listening') this.startListeningGame();
      else if (this.currentGame === 'reading') this.startReadingGame();
      else if (this.currentGame === 'writing') this.startWritingGame();
    };

    document.getElementById('btn-game-exit').onclick = () => {
      this.closeGameModal();
    };
  }

  openGameModal(title) {
    const modal = document.getElementById('minigame-modal');
    const titleEl = document.getElementById('minigame-title');
    const scoreEl = document.getElementById('minigame-score');
    const comboEl = document.getElementById('minigame-combo');
    const timerEl = document.getElementById('minigame-timer');

    if (titleEl) titleEl.textContent = title;
    if (scoreEl) scoreEl.textContent = '0';
    if (comboEl) comboEl.textContent = 'x0';
    if (timerEl) {
      timerEl.textContent = '60초';
      timerEl.classList.remove('text-danger-pulse');
    }

    const quitBtn = document.getElementById('btn-minigame-quit');
    if (quitBtn) {
      quitBtn.onclick = () => this.quitGame();
    }

    modal.classList.remove('d-none');
  }

  quitGame() {
    if (confirm('게임을 중간에 종료하시겠습니까?\n(중간 종료 시 획득한 골드는 지급되지 않습니다.)')) {
      audioSynth.playBlockHit();
      this.closeGameModal();
      this.app.showToast('🛑 게임이 중단되었습니다. (골드 미지급)');
    }
  }

  closeGameModal() {
    clearInterval(this.timerId);
    const modal = document.getElementById('minigame-modal');
    modal.classList.add('d-none');
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
    setTimeout(() => popup.remove(), 1000);
  }
}
