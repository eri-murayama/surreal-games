/* ============================================
   ゲロゲーロ学園 - Age Gate Logic
   ============================================ */

(function() {
  'use strict';

  const ageLabels = {
    baby: { emoji: '👶', label: 'おちびさん' },
    toddler: { emoji: '🧒', label: 'ちびっこ' },
    kid: { emoji: '🎒', label: 'しょうがくせい' },
    adult: { emoji: '🧠', label: 'おとな' },
    all: { emoji: '🌈', label: 'ぜんぶ' }
  };

  function getStoredAge() {
    try {
      return localStorage.getItem('gero-age');
    } catch (e) {
      return null;
    }
  }

  function setStoredAge(age) {
    try {
      localStorage.setItem('gero-age', age);
    } catch (e) {}
  }

  function clearStoredAge() {
    try {
      localStorage.removeItem('gero-age');
    } catch (e) {}
  }

  function filterByAge(age) {
    const cards = document.querySelectorAll('.game-card');
    const activeSubject = document.querySelector('.filter-btn.active');
    const subject = activeSubject ? activeSubject.dataset.subject : 'all';

    cards.forEach((card) => {
      const cardAge = card.dataset.age;
      const cardSubject = card.dataset.subject;
      const matchSubject = subject === 'all' || cardSubject === subject;
      const matchAge = age === 'all' || cardAge === age;

      if (matchSubject && matchAge) {
        card.style.display = '';
        card.style.opacity = '1';
      } else {
        card.style.display = 'none';
      }
    });
  }

  function updateAgeButton(age) {
    const btn = document.getElementById('ageChangeBtn');
    const info = ageLabels[age] || ageLabels.all;
    if (!btn) return;

    document.getElementById('ageBtnEmoji').textContent = info.emoji;
    document.getElementById('ageBtnLabel').textContent = info.label;
    btn.style.display = 'flex';
    btn.setAttribute('aria-label', 'ねんれいをかえる: ' + info.label);
  }

  function syncSoundButton() {
    const soundToggle = document.getElementById('soundToggle');
    if (!soundToggle || !window.geroAudio) return;

    const isMuted = !!window.geroAudio.isMuted;
    soundToggle.textContent = isMuted ? '🔇' : '🔊';
    soundToggle.setAttribute('aria-pressed', isMuted ? 'true' : 'false');
    soundToggle.setAttribute('aria-label', isMuted ? 'おとをオンにする' : 'おとをオフにする');
  }

  function enterSite(age) {
    if (window.geroAudio) {
      geroAudio.init();
      geroAudio.playCelebration();
    }

    setStoredAge(age);

    const entrance = document.getElementById('entrance');
    entrance.classList.add('hide');
    setTimeout(() => {
      entrance.style.display = 'none';
      entrance.setAttribute('aria-hidden', 'true');
    }, 800);

    filterByAge(age);
    updateAgeButton(age);

    if (window.geroAudio && !window.geroAudio.isMuted) {
      setTimeout(() => {
        geroAudio.startBGM(100, 'C');
      }, 1000);
    }
  }

  function reopenAgeGate() {
    clearStoredAge();
    const entrance = document.getElementById('entrance');
    entrance.style.display = '';
    entrance.classList.remove('hide');
    entrance.setAttribute('aria-hidden', 'false');
    document.getElementById('ageChangeBtn').style.display = 'none';

    document.querySelectorAll('.game-card').forEach((card) => {
      card.style.display = '';
      card.style.opacity = '1';
      card.style.order = '0';
    });

    if (window.geroAudio) {
      geroAudio.stopBGM();
    }
  }

  function bindAgeButtons() {
    document.querySelectorAll('.age-btn[data-age]').forEach((btn) => {
      btn.addEventListener('click', () => enterSite(btn.dataset.age));
    });

    const ageChangeBtn = document.getElementById('ageChangeBtn');
    if (ageChangeBtn) {
      ageChangeBtn.addEventListener('click', reopenAgeGate);
    }
  }

  function initSavedAge() {
    const savedAge = getStoredAge();
    if (!savedAge) return;

    const entrance = document.getElementById('entrance');
    if (entrance) {
      entrance.style.display = 'none';
      entrance.setAttribute('aria-hidden', 'true');
    }

    filterByAge(savedAge);
    updateAgeButton(savedAge);
  }

  function initSoundToggle() {
    const soundToggle = document.getElementById('soundToggle');
    if (!soundToggle || !window.geroAudio) return;

    syncSoundButton();

    soundToggle.addEventListener('click', () => {
      geroAudio.init();
      geroAudio.toggleMute();
      syncSoundButton();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindAgeButtons();
    initSavedAge();
    initSoundToggle();
  });

  window.filterByAge = filterByAge;
  window.enterSite = enterSite;
  window.reopenAgeGate = reopenAgeGate;
})();
