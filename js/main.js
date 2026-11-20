/* ============================================================
 * 《阙下归人》· 入口与界面装配
 * ============================================================ */

'use strict';

window.addEventListener('DOMContentLoaded', () => {
  Engine.init();

  const $ = (id) => document.getElementById(id);

  /* ---------- 标题界面 ---------- */
  $('title-bg').appendChild(buildAsset('bg-title', 'bg'));

  let gender = 'f', starting = false;
  const nameInput = $('player-name'), modeDialog = $('mode-select');
  const updateName = () => { $('btn-start').disabled = !nameInput.value.trim(); };
  nameInput.addEventListener('input', updateName);
  const chooseMode = () => {
    if (!nameInput.value.trim()) { nameInput.focus(); return; }
    AudioFX.unlock(); modeDialog.showModal();
  };
  nameInput.addEventListener('keydown', e => { if(e.key === 'Enter' && !e.isComposing){e.preventDefault();chooseMode();} });
  $('btn-start').addEventListener('click', chooseMode);
  $('mode-cancel').onclick = () => { modeDialog.close(); nameInput.focus(); };
  document.querySelectorAll('.mode-card').forEach(card => card.addEventListener('click', async () => {
    if (starting || !nameInput.value.trim()) return;
    starting = true; const mode = card.dataset.mode;
    modeDialog.close();
    if (!await Progress.confirmNewGame()) { starting = false; return; }
    AudioFX.unlock();
    Engine.player = { name: nameInput.value.trim().slice(0,8), gender };
    Engine.start(mode); starting = false;
  }));
  document.querySelectorAll('.gender-btn').forEach(b => b.addEventListener('click', () => {
    gender = b.dataset.g;
    document.querySelectorAll('.gender-btn').forEach(x => x.classList.toggle('active', x === b));
    AudioFX.click();
  }));
  updateName();
  setTimeout(() => StoryHistory.boot(), 0);

  /* ---------- 结算界面 ---------- */
  $('ending-book').addEventListener('click', () => Engine.openBook());
  $('ending-restart').addEventListener('click', () => location.reload());

  /* ---------- 光照跟随指针 ---------- */
  window.addEventListener('pointermove', (e) => {
    Engine.pointerMove(e.clientX, e.clientY);
  });
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) Engine.pointerMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
});

