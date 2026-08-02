// Student Vocabulary Study Hub: Flashcards, TTS Audio Preview, and Sentence Practice

import { dbManager } from './db.js';
import { audioSynth } from './audio-synth.js';

export class StudyModule {
  constructor(appController) {
    this.app = appController;
    this.words = [];
    this.currentIndex = 0;
    this.isFlipped = false;
  }

  async init() {
    this.words = await dbManager.getWords();
    if (this.words.length === 0) return;
    this.currentIndex = 0;
    this.isFlipped = false;
    this.renderCard();
    this.bindEvents();
  }

  renderCard() {
    const cardElement = document.getElementById('study-flashcard');
    const wordText = document.getElementById('study-word-text');
    const phoneticText = document.getElementById('study-phonetic-text');
    const meaningText = document.getElementById('study-meaning-text');
    const exampleText = document.getElementById('study-example-text');
    const categoryBadge = document.getElementById('study-category-badge');
    const progressSpan = document.getElementById('study-progress-span');

    if (!cardElement || this.words.length === 0) return;

    const current = this.words[this.currentIndex];

    // Reset flip state
    this.isFlipped = false;
    cardElement.classList.remove('is-flipped');

    wordText.textContent = current.word;
    phoneticText.textContent = current.phonetic ? `/${current.phonetic}/` : '';
    meaningText.textContent = current.meaning;
    exampleText.textContent = current.example ? `"${current.example}"` : '';
    categoryBadge.textContent = current.category || '기타';

    if (progressSpan) {
      progressSpan.textContent = `${this.currentIndex + 1} / ${this.words.length}`;
    }
  }

  nextCard() {
    if (this.words.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.words.length;
    audioSynth.playBlockHit();
    this.renderCard();
  }

  prevCard() {
    if (this.words.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.words.length) % this.words.length;
    audioSynth.playBlockHit();
    this.renderCard();
  }

  shuffleCards() {
    for (let i = this.words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.words[i], this.words[j]] = [this.words[j], this.words[i]];
    }
    this.currentIndex = 0;
    audioSynth.playCoin();
    this.renderCard();
    this.app.showToast('🔀 단어가 랜덤하게 섞였습니다!');
  }

  bindEvents() {
    const cardElement = document.getElementById('study-flashcard');
    if (cardElement) {
      cardElement.onclick = (e) => {
        // Prevent flipping if audio button clicked
        if (e.target.closest('#btn-study-tts')) return;
        this.isFlipped = !this.isFlipped;
        cardElement.classList.toggle('is-flipped', this.isFlipped);
        audioSynth.playTick();
      };
    }

    const ttsBtn = document.getElementById('btn-study-tts');
    if (ttsBtn) {
      ttsBtn.onclick = (e) => {
        e.stopPropagation();
        const current = this.words[this.currentIndex];
        if (current) {
          audioSynth.speak(current.word);
        }
      };
    }

    const nextBtn = document.getElementById('btn-study-next');
    if (nextBtn) nextBtn.onclick = () => this.nextCard();

    const prevBtn = document.getElementById('btn-study-prev');
    if (prevBtn) prevBtn.onclick = () => this.prevCard();

    const shuffleBtn = document.getElementById('btn-study-shuffle');
    if (shuffleBtn) shuffleBtn.onclick = () => this.shuffleCards();

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      const studyTab = document.getElementById('view-student-study');
      if (!studyTab || studyTab.classList.contains('d-none')) return;

      if (e.key === 'ArrowRight') this.nextCard();
      else if (e.key === 'ArrowLeft') this.prevCard();
      else if (e.key === ' ') {
        e.preventDefault();
        const current = this.words[this.currentIndex];
        if (current) audioSynth.speak(current.word);
      }
    });
  }
}
