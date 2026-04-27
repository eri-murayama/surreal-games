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
    } catch (error) {
      return null;
    }
  }

  function setStoredAge(age) {
    try {
      localStorage.setItem('gero-age', age);
    } catch (error) {}
  }

  function clearStoredAge() {
    try {
      localStorage.removeItem('gero-age');
    } catch (error) {}
  }

  function getActiveSubject() {
    return document.querySelector('.filter-btn.active')?.dataset.subject || 'all';
  }

  function notifyCatalogUpdate(age) {
    document.documentElement.dataset.geroAge = age;
    document.dispatchEvent(new CustomEvent('gero:catalog-updated', {
      detail: {
        age,
        subject: getActiveSubject()
      }
    }));
  }

  function filterByAge(age) {
    const cards = document.querySelectorAll('.game-card');
    const subject = getActiveSubject();

    cards.forEach((card) => {
      const matchSubject = subject === 'all' || card.dataset.subject === subject;
      const matchAge = age === 'all' || card.dataset.age === age;

      if (matchSubject && matchAge) {
        card.style.display = '';
        card.style.opacity = '1';
      } else {
        card.style.display = 'none';
      }
    });

    notifyCatalogUpdate(age);
  }

  function updateAgeButton(age) {
    const button = document.getElementById('ageChangeBtn');
    if (!button) return;

    const info = ageLabels[age] || ageLabels.all;
    const emoji = document.getElementById('ageBtnEmoji');
    const label = document.getElementById('ageBtnLabel');

    if (emoji) emoji.textContent = info.emoji;
    if (label) label.textContent = info.label;

    button.style.display = 'flex';
    button.setAttribute('aria-label', `ねんれいを かえる ${info.label}`);
  }

  function syncSoundButton() {
    const soundToggle = document.getElementById('soundToggle');
    if (!soundToggle || !window.geroAudio) return;

    const isMuted = !!window.geroAudio.isMuted;
    soundToggle.textContent = isMuted ? '🔇' : '🔊';
    soundToggle.setAttribute('aria-pressed', isMuted ? 'true' : 'false');
    soundToggle.setAttribute('aria-label', isMuted ? 'おとを オンにする' : 'おとを オフにする');
  }

  function enterSite(age) {
    if (window.geroAudio) {
      window.geroAudio.init();
      window.geroAudio.playCelebration();
    }

    setStoredAge(age);

    const entrance = document.getElementById('entrance');
    if (entrance) {
      entrance.classList.add('hide');
      setTimeout(() => {
        entrance.style.display = 'none';
        entrance.setAttribute('aria-hidden', 'true');
      }, 800);
    }

    filterByAge(age);
    updateAgeButton(age);

    if (window.geroAudio && !window.geroAudio.isMuted) {
      setTimeout(() => {
        window.geroAudio.startBGM(100, 'C');
      }, 1000);
    }
  }

  function reopenAgeGate() {
    clearStoredAge();

    const entrance = document.getElementById('entrance');
    if (entrance) {
      entrance.style.display = '';
      entrance.classList.remove('hide');
      entrance.setAttribute('aria-hidden', 'false');
    }

    const ageChangeButton = document.getElementById('ageChangeBtn');
    if (ageChangeButton) {
      ageChangeButton.style.display = 'none';
    }

    document.querySelectorAll('.game-card').forEach((card) => {
      card.style.display = '';
      card.style.opacity = '1';
      card.style.order = '0';
    });

    notifyCatalogUpdate('all');

    if (window.geroAudio) {
      window.geroAudio.stopBGM();
    }
  }

  function bindAgeButtons() {
    document.querySelectorAll('.age-btn[data-age]').forEach((button) => {
      button.addEventListener('click', () => enterSite(button.dataset.age));
    });

    const ageChangeButton = document.getElementById('ageChangeBtn');
    if (ageChangeButton) {
      ageChangeButton.addEventListener('click', reopenAgeGate);
    }
  }

  function initSavedAge() {
    const savedAge = getStoredAge();
    if (!savedAge) {
      notifyCatalogUpdate('all');
      return;
    }

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
      window.geroAudio.init();
      window.geroAudio.toggleMute();
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
