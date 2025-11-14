// ==UserScript==
// @name         Chessigma Floating Clock (puzzles)
// @namespace    https://chessigma.com/
// @version      1.0
// @description  Cronômetro movível para Chessigma puzzles: auto-start, stop on success/fail, history (localStorage), bottom-left layout.
// @match        https://www.chessigma.com/puzzles*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // --- CONFIG ---
  const STORAGE_KEY = 'chessigma_puzzle_clock_history';
  const MAX_HISTORY = 10;

  // --- util ---
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
  const nowStamp = () => new Date().toLocaleString('pt-BR', { hour12: false });
  const pad2 = n => String(n).padStart(2,'0');
  const formatTime = sec => `${pad2(Math.floor(sec/60))}:${pad2(sec%60)}`;

  // --- create UI ---
  function createContainer() {
    if (document.getElementById('chessigmaFloatingClock')) return null;

    const c = document.createElement('div');
    c.id = 'chessigmaFloatingClock';
    Object.assign(c.style, {
      position: 'fixed',
      left: '20px',
      bottom: '20px',
      background: 'rgba(0,0,0,0.9)',
      color: '#0f0',
      fontFamily: 'monospace',
      fontSize: '16px',
      padding: '12px',
      borderRadius: '8px',
      zIndex: 999999,
      width: '340px',
      boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
      userSelect: 'none',
    });

    c.innerHTML = `
      <div id="c_head" style="text-align:left;">
        <div id="puzzleTitle" style="color:#0f0;margin-bottom:6px;font-weight:bold;">Quebra-cabeça</div>
        <div id="currentTime" style="margin-bottom:4px">Atual: 00:00</div>
        <div id="lastTime" style="cursor:pointer;text-decoration:underline;margin-bottom:6px">Última: 00:00</div>
      </div>
      <div id="historyList" style="display:none; max-height:160px; overflow:auto; font-size:13px; text-align:left; border-top:1px solid rgba(0,255,0,0.15); padding-top:6px;"></div>
      <div style="display:flex; gap:8px; margin-top:8px;">
        <button id="btnStart" style="flex:1; padding:8px; border-radius:6px; font-weight:bold; cursor:pointer; background:#0f0; color:#000">▶️ Iniciar</button>
        <button id="btnPause" style="flex:1; padding:8px; border-radius:6px; font-weight:bold; cursor:pointer; background:#ff0; color:#000; display:none">⏸ Pausar</button>
        <button id="btnStop" style="flex:1; padding:8px; border-radius:6px; font-weight:bold; cursor:pointer; background:#f00; color:#000; display:none">⏹ Parar</button>
      </div>
      <button id="btnClear" style="width:100%; margin-top:8px; padding:8px; border-radius:6px; background:#444; color:#fff; font-weight:bold; cursor:pointer">🧹 Limpar histórico</button>
    `;
    document.body.appendChild(c);
    return c;
  }

  // --- state ---
  let timer = null;
  let seconds = 0;
  let running = false;
  let history = loadHistory();
  let historyVisible = false;

  // --- DOM / elements ---
  const container = createContainer();
  if (!container) return;
  const currentTimeEl = $('#currentTime', container);
  const lastTimeEl = $('#lastTime', container);
  const historyListEl = $('#historyList', container);
  const puzzleTitleEl = $('#puzzleTitle', container);
  const btnStart = $('#btnStart', container);
  const btnPause = $('#btnPause', container);
  const btnStop = $('#btnStop', container);
  const btnClear = $('#btnClear', container);

  renderHistoryUI();
  attachUIEvents();
  makeDraggable(container);

  // --- helpers to extract puzzle title on Chessigma ---
  function getPuzzleTitle() {
    // try common places; adapt if site changes
    // 1) find title inside puzzle area:
    let t = null;
    // Chessigma shows little textual title sometimes in header; try some selectors:
    t = document.querySelector('.puzzle-title')?.innerText?.trim();
    if (t) return t;
    // fallback: document title (strip " - Chessigma" if present)
    t = document.title || '';
    t = t.replace(/\s*-\s*Chessigma.*$/i,'').trim();
    if (t) return t || 'Quebra-cabeça';
    return 'Quebra-cabeça';
  }

  function addHistoryEntry(entry) {
    history.unshift(entry);
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    renderHistoryUI();
  }

  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function renderHistoryUI() {
    historyListEl.innerHTML = '';
    if (history.length === 0) {
      historyListEl.innerHTML = '<div style="opacity:0.7">Sem histórico</div>';
    } else {
      history.forEach((h, i) => {
        const d = document.createElement('div');
        d.style.padding = '4px 0';
        d.textContent = `${i+1}. ${h.puzzle} — ${h.stamp} — ${h.time}`;
        historyListEl.appendChild(d);
      });
    }
    lastTimeEl.textContent = history[0] ? `Última: ${history[0].time}` : 'Última: 00:00';
    puzzleTitleEl.textContent = getPuzzleTitle();
  }

  // --- clock controls ---
  function tick() {
    seconds++;
    currentTimeEl.textContent = `Atual: ${formatTime(seconds)}`;
  }

  function startClock(autoStart=true) {
    if (running) return;
    // reset seconds only if autoStart==true (new puzzle) or clock was not previously started
    if (autoStart) seconds = 0;
    timer = setInterval(tick, 1000);
    running = true;
    btnStart.style.display = 'none';
    btnPause.style.display = 'inline-block';
    btnStop.style.display = 'inline-block';
    puzzleTitleEl.textContent = getPuzzleTitle();
  }

  function pauseClock() {
    if (!running) return;
    clearInterval(timer);
    timer = null;
    running = false;
    btnPause.style.display = 'none';
    btnStart.style.display = 'inline-block';
    btnStart.textContent = '▶️ Retomar';
  }

  function stopClock(save=true) {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    if (save && seconds > 0) {
      const entry = {
        puzzle: getPuzzleTitle(),
        time: formatTime(seconds),
        stamp: nowStamp()
      };
      addHistoryEntry(entry);
    }
    seconds = 0;
    running = false;
    currentTimeEl.textContent = 'Atual: 00:00';
    btnStart.style.display = 'inline-block';
    btnStart.textContent = '▶️ Iniciar';
    btnPause.style.display = 'none';
    btnStop.style.display = 'none';
  }

  // --- UI events ---
  function attachUIEvents() {
    btnStart.addEventListener('click', () => startClock(false));
    btnPause.addEventListener('click', pauseClock);
    btnStop.addEventListener('click', () => stopClock(true));
    btnClear.addEventListener('click', () => {
      if (confirm('Apagar todo o histórico?')) {
        history = [];
        localStorage.removeItem(STORAGE_KEY);
        renderHistoryUI();
      }
    });
    lastTimeEl.addEventListener('click', () => {
      historyVisible = !historyVisible;
      historyListEl.style.display = historyVisible ? 'block' : 'none';
    });
  }

  // --- drag ---
  function makeDraggable(el) {
    let dragging = false, offsetX = 0, offsetY = 0;
    el.addEventListener('mousedown', (e) => {
      // ignore if clicking on controls
      if (e.target.closest('button') || e.target.tagName === 'A') return;
      dragging = true;
      offsetX = e.clientX - el.getBoundingClientRect().left;
      offsetY = e.clientY - el.getBoundingClientRect().top;
      el.style.transition = 'none';
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      el.style.left = `${e.clientX - offsetX}px`;
      el.style.top = `${e.clientY - offsetY}px`;
      el.style.bottom = 'auto';
      el.style.right = 'auto';
    });
    document.addEventListener('mouseup', () => dragging = false);
  }

  // --- detection of puzzle events ---
  // Success: Next button becomes enabled/visible (text "Next" or "Next →")
  // Fail: message area contains "Try again" or similar text (we check common english message and fallback to visual red X)
  let lastNextVisible = false;
  let lastFailVisible = false;

  function isNextButtonVisible() {
    // Try button with "Next" in text, or disabled state
    // Chessigma has a "Next" button on the bottom control panel (see screenshot)
    const btnCandidates = $$('button, a');
    for (const b of btnCandidates) {
      const text = (b.innerText || '').trim();
      if (!text) continue;
      if (/^Next\b|Next\s*→|Próximo|Próximo\s*→/i.test(text)) {
        // ensure it's visible and not disabled
        const style = getComputedStyle(b);
        if (style && style.display !== 'none' && style.visibility !== 'hidden' && b.offsetParent !== null) {
          // some sites use disabled attribute; treat disabled as not visible
          if (b.disabled || b.getAttribute('aria-disabled') === 'true') return false;
          return b;
        }
      }
    }
    return false;
  }

  function isFailMessageVisible() {
    // Look for a message box with "Try again" or "that's not the one" etc.
    // Also check for visible elements with "Try again" text
    const textCandidates = $$('div,span,p');
    for (const t of textCandidates) {
      const txt = (t.innerText || '').trim();
      if (!txt) continue;
      if (/try again|not the one|that's not the one|try again!/i.test(txt)) return t;
      // portuguese fallback
      if (/tente novamente|não é essa/i.test(txt)) return t;
    }
    return false;
  }

  // Attach click watcher for Next button to auto-start new puzzle when user clicks it.
  function attachNextClickWatcher(nextBtn) {
    if (!nextBtn) return;
    nextBtn.addEventListener('click', () => {
      // small timeout to let new puzzle load
      setTimeout(() => {
        // reset & start new clock automatically
        stopClock(false); // reset without saving (previous should have been saved when Next first appeared)
        startClock(true);
      }, 250);
    }, { once: false });
  }

  // Core observer: light-weight, checks visibility flags
  const observer = new MutationObserver(muts => {
    try {
      const nextBtn = isNextButtonVisible();
      const nextVisible = !!nextBtn;
      const failEl = isFailMessageVisible();
      const failVisible = !!failEl;

      // If Next appears now but wasn't visible previously => puzzle just resolved (success)
      if (nextVisible && !lastNextVisible) {
        // stop and save
        stopClock(true);
        // attach click to start next puzzle when user clicks Next (if they do)
        attachNextClickWatcher(nextBtn);
      }

      // If Next disappears after being visible (user clicked Next and new puzzle loaded) -> start new automatically
      if (!nextVisible && lastNextVisible) {
        // new puzzle likely loaded -> start
        setTimeout(() => {
          // update title and start
          puzzleTitleEl.textContent = getPuzzleTitle();
          startClock(true);
        }, 300);
      }

      // If fail appears and wasn't present before -> stop and save
      if (failVisible && !lastFailVisible) {
        stopClock(true);
      }

      // If fail disappears after being present (user retries) -> restart clock
      if (!failVisible && lastFailVisible) {
        setTimeout(() => startClock(true), 200);
      }

      lastNextVisible = nextVisible;
      lastFailVisible = failVisible;

    } catch (e) {
      // swallow errors to avoid breaking page
      // console.error('clock observer error', e);
    }
  });

  // Start observer on body (subtree), but keep light touch
  observer.observe(document.body, { childList: true, subtree: true });

  // Auto-start on initial load (if on puzzle page)
  setTimeout(() => {
    puzzleTitleEl.textContent = getPuzzleTitle();
    startClock(true);
  }, 600);

  // Clean up on unload (safety)
  window.addEventListener('beforeunload', () => {
    if (timer) clearInterval(timer);
  });

})();
