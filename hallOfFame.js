// Hall of Fame Controller: Top 10 Gold Collectors & Top 10 Mini-game Clear Champions

import { dbManager } from './db.js';
import { AVATARS } from './auth.js';
import { audioSynth } from './audio-synth.js';

export class HallOfFameModule {
  constructor(appController) {
    this.app = appController;
    this.activeTab = 'gold'; // 'gold' | 'clears'
  }

  async init() {
    this.bindEvents();
    await this.render();
  }

  async render() {
    const listContainer = document.getElementById('hall-of-fame-list');
    if (!listContainer) return;

    listContainer.innerHTML = `
      <div class="text-center py-4 text-muted">
        ⛏️ 명예의 전당 랭킹 불러오는 중...
      </div>
    `;

    let data = [];
    if (this.activeTab === 'gold') {
      data = await dbManager.getTopGold();
    } else {
      data = await dbManager.getTopClears();
    }

    if (!data || data.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-4 text-muted">
          📜 아직 등록된 랭커가 없습니다. 첫 챔피언이 되어보세요!
        </div>
      `;
      return;
    }

    listContainer.innerHTML = data.map((item, idx) => {
      const avatarObj = AVATARS.find(a => a.id === item.avatar) || AVATARS[0];
      const rankBadge = idx === 0 ? '👑 1위' : idx === 1 ? '🥈 2위' : idx === 2 ? '🥉 3위' : `${idx + 1}위`;
      const rowClass = idx < 3 ? 'mc-rank-top3' : '';

      return `
        <div class="mc-rank-row ${rowClass}">
          <div class="rank-badge">${rankBadge}</div>
          <div class="rank-user">
            <span class="user-avatar-icon">${avatarObj.icon}</span>
            <strong class="user-name">${this.escapeHtml(item.displayName)}</strong>
          </div>
          <div class="rank-val mc-text-gold">
            ${this.activeTab === 'gold' ? `💰 ${(item.gold || 0).toLocaleString()} Gold` : `⛏️ ${(item.clears || 0)}회 클리어`}
          </div>
        </div>
      `;
    }).join('');
  }

  bindEvents() {
    const goldTabBtn = document.getElementById('btn-hall-tab-gold');
    const clearsTabBtn = document.getElementById('btn-hall-tab-clears');

    if (goldTabBtn && clearsTabBtn) {
      goldTabBtn.onclick = async () => {
        this.activeTab = 'gold';
        goldTabBtn.classList.add('active');
        clearsTabBtn.classList.remove('active');
        audioSynth.playTick();
        await this.render();
      };

      clearsTabBtn.onclick = async () => {
        this.activeTab = 'clears';
        clearsTabBtn.classList.add('active');
        goldTabBtn.classList.remove('active');
        audioSynth.playTick();
        await this.render();
      };
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }
}
