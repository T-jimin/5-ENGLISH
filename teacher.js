// Teacher Dashboard Controller: Vocabulary CRUD, Flashcards Printing, and CSV/JSON Import-Export

import { dbManager } from './db.js';
import { audioSynth } from './audio-synth.js';

export class TeacherModule {
  constructor(appController) {
    this.app = appController;
    this.wordsList = [];
    this.activeCategoryFilter = 'ALL';
  }

  async init() {
    await this.refreshWordList();
    this.bindEvents();
  }

  async refreshWordList() {
    this.wordsList = await dbManager.getWords();
    this.renderWordsTable();
    this.renderCategoryOptions();
  }

  renderCategoryOptions() {
    const categories = ['ALL', ...new Set(this.wordsList.map(w => w.category || '기타'))];
    const select = document.getElementById('teacher-category-filter');
    if (!select) return;

    select.innerHTML = categories.map(cat => 
      `<option value="${cat}">${cat === 'ALL' ? '📦 전체 카테고리 (' + this.wordsList.length + '개)' : cat}</option>`
    ).join('');
  }

  renderWordsTable() {
    const tableBody = document.getElementById('teacher-words-tbody');
    const wordCountSpan = document.getElementById('teacher-word-count');
    if (!tableBody) return;

    let filtered = this.wordsList;
    if (this.activeCategoryFilter && this.activeCategoryFilter !== 'ALL') {
      filtered = filtered.filter(w => w.category === this.activeCategoryFilter);
    }

    const searchInput = document.getElementById('teacher-search-input');
    if (searchInput && searchInput.value.trim()) {
      const q = searchInput.value.trim().toLowerCase();
      filtered = filtered.filter(w => 
        w.word.toLowerCase().includes(q) || 
        w.meaning.includes(q) || 
        (w.category && w.category.includes(q))
      );
    }

    if (wordCountSpan) {
      wordCountSpan.textContent = `${filtered.length} / 총 ${this.wordsList.length} 단어`;
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-muted">
            ⛏️ 등록된 단어가 없습니다. 새 단어를 추가해 보세요!
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map((item, idx) => `
      <tr class="mc-table-row">
        <td><span class="mc-badge-stone">${idx + 1}</span></td>
        <td>
          <div class="word-primary">
            <strong class="mc-text-gold">${this.escapeHtml(item.word)}</strong>
            <button class="mc-btn-icon btn-tts-mini" data-word="${this.escapeHtml(item.word)}" title="발음 듣기">🔊</button>
          </div>
          <small class="text-muted">${item.phonetic ? '/' + this.escapeHtml(item.phonetic) + '/' : ''}</small>
        </td>
        <td><span class="mc-text-emerald">${this.escapeHtml(item.meaning)}</span></td>
        <td><span class="mc-badge-wood">${this.escapeHtml(item.category || '기타')}</span></td>
        <td><small class="mc-example-text">"${this.escapeHtml(item.example || '-')}"</small></td>
        <td>
          <div class="action-btns">
            <button class="mc-btn mc-btn-danger btn-delete-word" data-id="${item.id}" title="삭제">🗑️ 삭제</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  bindEvents() {
    // Category Filter
    const catSelect = document.getElementById('teacher-category-filter');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        this.activeCategoryFilter = e.target.value;
        this.renderWordsTable();
      });
    }

    // Search Input
    const searchInput = document.getElementById('teacher-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.renderWordsTable());
    }

    // Add Word Form
    const addForm = document.getElementById('teacher-add-word-form');
    if (addForm) {
      addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const wordInput = document.getElementById('new-word-input');
        const meaningInput = document.getElementById('new-meaning-input');
        const categoryInput = document.getElementById('new-category-input');
        const phoneticInput = document.getElementById('new-phonetic-input');
        const exampleInput = document.getElementById('new-example-input');

        if (!wordInput.value.trim() || !meaningInput.value.trim()) {
          alert('영어 단어와 뜻은 필수 입력사항입니다.');
          return;
        }

        const newWordObj = {
          word: wordInput.value.trim(),
          meaning: meaningInput.value.trim(),
          category: categoryInput.value.trim() || '기타',
          phonetic: phoneticInput.value.trim() || '',
          example: exampleInput.value.trim() || ''
        };

        await dbManager.addWord(newWordObj);
        audioSynth.playCoin();
        this.app.showToast('✅ 새 영어 단어가 추가되었습니다!');

        // Reset inputs
        wordInput.value = '';
        meaningInput.value = '';
        phoneticInput.value = '';
        exampleInput.value = '';

        await this.refreshWordList();
      });
    }

    // Table click listener for TTS and Delete
    const tableBody = document.getElementById('teacher-words-tbody');
    if (tableBody) {
      tableBody.addEventListener('click', async (e) => {
        const ttsBtn = e.target.closest('.btn-tts-mini');
        if (ttsBtn) {
          const word = ttsBtn.dataset.word;
          audioSynth.speak(word);
          return;
        }

        const delBtn = e.target.closest('.btn-delete-word');
        if (delBtn) {
          const id = delBtn.dataset.id;
          if (confirm('이 단어를 삭제하시겠습니까?')) {
            await dbManager.deleteWord(id);
            audioSynth.playBlockHit();
            this.app.showToast('🗑️ 단어가 삭제되었습니다.');
            await this.refreshWordList();
          }
        }
      });
    }

    // Reset Default Words
    const resetBtn = document.getElementById('btn-reset-default-words');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        if (confirm('초등 5학년 기본 필수 단어장(35개)으로 단어 목록을 초기화하시겠습니까?')) {
          await dbManager.resetToDefaultWords();
          audioSynth.playSuccess();
          this.app.showToast('🔄 5학년 기본 단어장으로 복원되었습니다.');
          await this.refreshWordList();
        }
      });
    }

    // Printable Flashcards Button
    const printBtn = document.getElementById('btn-print-flashcards');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        this.openPrintableFlashcards();
      });
    }

    // Export JSON
    const exportBtn = document.getElementById('btn-export-words');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.wordsList, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `craftvoca_5th_words_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      });
    }
  }

  openPrintableFlashcards() {
    const printWin = window.open('', '_blank');
    const cardsHtml = this.wordsList.map(w => `
      <div style="border:3px solid #5a5a5a; border-radius:8px; padding:15px; width:220px; height:140px; margin:10px; display:inline-block; vertical-align:top; background:#f5f2eb; box-shadow:3px 3px 0 #333; font-family:sans-serif; text-align:center;">
        <h2 style="margin:5px 0; color:#1a237e; font-size:22px;">${this.escapeHtml(w.word)}</h2>
        <p style="margin:2px 0; color:#666; font-size:12px;">/${this.escapeHtml(w.phonetic || '')}/</p>
        <hr style="border:0; border-top:1px dashed #ccc; margin:8px 0;">
        <h3 style="margin:5px 0; color:#2e7d32; font-size:18px;">${this.escapeHtml(w.meaning)}</h3>
        <p style="margin:4px 0; color:#777; font-size:11px; font-style:italic;">${this.escapeHtml(w.example || '')}</p>
      </div>
    `).join('');

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>크래프트 보카 - 초등 5학년 영어 단어 카드 인쇄</title>
        <style>
          body { font-family: 'Malgun Gothic', sans-serif; padding: 20px; background: #fff; }
          .header { text-align: center; margin-bottom: 20px; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📖 초등학교 5학년 영어 단어 플래시카드 (${this.wordsList.length}개)</h1>
          <button class="no-print" onclick="window.print()" style="padding:10px 20px; font-size:16px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer;">🖨️ 인쇄하기</button>
        </div>
        <div style="display:flex; flex-wrap:wrap; justify-content:center;">
          ${cardsHtml}
        </div>
      </body>
      </html>
    `);
    printWin.document.close();
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }
}
