// ==UserScript==
// @name         Lichess Floating Clock (full auto + puzzle title)
// @namespace    https://lichess.org/
// @version      3.0
// @description  Cronômetro movível com histórico, pausa, auto reset, nome do exercício e quebra-cabeça
// @match        https://lichess.org/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function createClock() {
        if (document.getElementById("floatingClockContainer")) return;

        const container = document.createElement("div");
        container.id = "floatingClockContainer";
        Object.assign(container.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "rgba(0,0,0,0.85)",
            color: "#0f0",
            fontSize: "18px",
            padding: "10px 20px",
            borderRadius: "10px",
            zIndex: "9999",
            fontFamily: "monospace",
            cursor: "move",
            userSelect: "none",
            width: "360px",
            textAlign: "center",
            boxShadow: "0 0 8px rgba(0,0,0,0.5)"
        });

        const currentTime = document.createElement("div");
        currentTime.id = "currentTime";
        currentTime.textContent = "Atual: 00:00";
        currentTime.style.marginBottom = "5px";

        const lastTime = document.createElement("div");
        lastTime.id = "lastTime";
        lastTime.textContent = "Última: 00:00";
        lastTime.style.cursor = "pointer";
        lastTime.style.textDecoration = "underline";

        container.appendChild(currentTime);
        container.appendChild(lastTime);

        const historyDiv = document.createElement("div");
        historyDiv.id = "historyDiv";
        historyDiv.style.display = "none";
        historyDiv.style.marginTop = "5px";
        historyDiv.style.fontSize = "15px";
        historyDiv.style.textAlign = "left";
        historyDiv.style.maxHeight = "250px";
        historyDiv.style.overflowY = "auto";
        historyDiv.style.borderTop = "1px solid #0f0";
        historyDiv.style.paddingTop = "5px";
        container.appendChild(historyDiv);

        const buttonsDiv = document.createElement("div");
        buttonsDiv.style.display = "flex";
        buttonsDiv.style.gap = "10px";
        buttonsDiv.style.justifyContent = "center";
        buttonsDiv.style.marginTop = "10px";
        container.appendChild(buttonsDiv);

        const btnStart = document.createElement("button");
        const btnPause = document.createElement("button");
        const btnStop = document.createElement("button");
        const btnClear = document.createElement("button");

        function styleButton(btn, color) {
            Object.assign(btn.style, {
                flex: "1",
                background: color,
                color: "#000",
                border: "none",
                borderRadius: "6px",
                padding: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "15px"
            });
        }

        btnStart.textContent = "▶️ Iniciar";
        styleButton(btnStart, "#0f0");
        btnPause.textContent = "⏸ Pausar";
        styleButton(btnPause, "#ff0");
        btnPause.style.display = "none";
        btnStop.textContent = "⏹ Parar";
        styleButton(btnStop, "#f00");
        btnStop.style.display = "none";
        btnClear.textContent = "🧹 Limpar histórico";
        Object.assign(btnClear.style, {
            width: "100%",
            background: "#555",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            marginTop: "10px"
        });

        buttonsDiv.appendChild(btnStart);
        buttonsDiv.appendChild(btnPause);
        buttonsDiv.appendChild(btnStop);
        container.appendChild(btnClear);

        document.body.appendChild(container);

        // variáveis
        let timer = null;
        let seconds = 0;
        let running = false;
        let wasRetryVisible = false;
        let wasSuccessVisible = false;
        let history = loadHistory();

        function formatTime(sec) {
            const min = String(Math.floor(sec / 60)).padStart(2, "0");
            const s = String(sec % 60).padStart(2, "0");
            return `${min}:${s}`;
        }

        function getTimeStamp() {
            const now = new Date();
            return now.toLocaleTimeString("pt-BR", { hour12: false });
        }

        function getExerciseName() {
            return (
                document.querySelector(".ps__chapter.active h3")?.innerText ||
                "Desconhecido"
            );
        }

        function getPuzzleTitle() {
            const meta = document.querySelector(".puzzle__side__metas p");
            if (!meta) return "Quebra-cabeça desconhecido";
            const prefix = meta.childNodes[0]?.textContent?.trim() || "Quebra-cabeça";
            const id = meta.querySelector("a")?.innerText || "#???";
            return `${prefix} ${id}`;
        }

        function updateClock() {
            seconds++;
            currentTime.textContent = `Atual: ${formatTime(seconds)}`;
        }

        function startClock() {
            if (!running) {
                seconds = 0;
                timer = setInterval(updateClock, 1000);
                running = true;
                btnStart.style.display = "none";
                btnPause.style.display = "block";
                btnStop.style.display = "block";
            }
        }

        function pauseClock() {
            if (running) {
                clearInterval(timer);
                running = false;
                btnStart.textContent = "▶️ Retomar";
                btnStart.style.display = "block";
                btnPause.style.display = "none";
            }
        }

        function stopClock(save = true) {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
            if (save && seconds > 0) {
                const entry = {
                    puzzle: getPuzzleTitle(),
                    exercise: getExerciseName(),
                    time: formatTime(seconds),
                    stamp: getTimeStamp()
                };
                addToHistory(entry);
                lastTime.textContent = `Última: ${entry.time}`;
            }
            seconds = 0;
            running = false;
            currentTime.textContent = "Atual: 00:00";
            btnStart.textContent = "▶️ Iniciar";
            btnStart.style.display = "block";
            btnPause.style.display = "none";
            btnStop.style.display = "none";
        }

        function resetClock() {
            stopClock(false);
        }

        function addToHistory(entry) {
            history.unshift(entry);
            if (history.length > 10) history = history.slice(0, 10);
            localStorage.setItem("lichess_history", JSON.stringify(history));
            renderHistory();
        }

        function loadHistory() {
            try {
                return JSON.parse(localStorage.getItem("lichess_history")) || [];
            } catch {
                return [];
            }
        }

        function renderHistory() {
            historyDiv.innerHTML = "";
            history.forEach((item, i) => {
                const div = document.createElement("div");
                div.textContent = `${i + 1}. ${item.puzzle} — ${item.exercise} — ${item.stamp} — ${item.time}`;
                historyDiv.appendChild(div);
            });
        }

        renderHistory();

        // toggle histórico
        let historyVisible = false;
        lastTime.addEventListener("click", () => {
            historyVisible = !historyVisible;
            historyDiv.style.display = historyVisible ? "block" : "none";
        });

        // eventos botões
        btnStart.addEventListener("click", startClock);
        btnPause.addEventListener("click", pauseClock);
        btnStop.addEventListener("click", () => stopClock(true));
        btnClear.addEventListener("click", () => {
            if (confirm("Apagar todo o histórico?")) {
                history = [];
                localStorage.removeItem("lichess_history");
                renderHistory();
            }
        });

        // arrastar painel
        let offsetX, offsetY, dragging = false;
        container.addEventListener("mousedown", (e) => {
            if (["BUTTON", "DIV"].includes(e.target.tagName) && e.target !== container) return;
            dragging = true;
            offsetX = e.clientX - container.getBoundingClientRect().left;
            offsetY = e.clientY - container.getBoundingClientRect().top;
        });

        document.addEventListener("mousemove", (e) => {
            if (!dragging) return;
            container.style.left = `${e.clientX - offsetX}px`;
            container.style.top = `${e.clientY - offsetY}px`;
            container.style.bottom = "auto";
            container.style.right = "auto";
        });

        document.addEventListener("mouseup", () => dragging = false);

        // observador automático
        const observer = new MutationObserver(() => {
            const retry = document.querySelector('.analyse__underboard a.feedback.loss');
            const success = document.querySelector('.analyse__underboard a.feedback.win');
            const vote = document.querySelector('.vote.vote-up');
            const retryVisible = !!retry;
            const successVisible = !!success;
            const voteVisible = !!vote;

            if (retryVisible && !wasRetryVisible) resetClock();
            if (!retryVisible && wasRetryVisible) startClock();
            if (successVisible && !wasSuccessVisible) stopClock(true);
            if (voteVisible) stopClock(true);

            wasRetryVisible = retryVisible;
            wasSuccessVisible = successVisible;
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    const initObserver = new MutationObserver(() => {
        if (document.body && !document.getElementById("floatingClockContainer")) {
            createClock();
        }
    });
    initObserver.observe(document, { childList: true, subtree: true });
})();
