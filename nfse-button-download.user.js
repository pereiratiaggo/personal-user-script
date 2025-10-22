// ==UserScript==
// @name         Baixar todos os XMLs NFS-e (um por vez)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Faz download automático de todos os XMLs listados na página, um por vez, com barra de progresso
// @match        https://www.nfse.gov.br/EmissorNacional/Notas/Emitidas*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Cria botão fixo no canto inferior direito
    const btn = document.createElement("button");
    btn.textContent = "⬇️  Baixar todos XMLs";
    btn.style = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 99999;
        padding: 15px 25px;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 50px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.2s ease-in-out;
    `;
    btn.onmouseover = () => btn.style.transform = "scale(1.05)";
    btn.onmouseout  = () => btn.style.transform = "scale(1)";
    document.body.appendChild(btn);

    // Cria painel de progresso
    const panel = document.createElement("div");
    panel.style = `
        position: fixed;
        bottom: 100px;
        right: 30px;
        width: 300px;
        background: rgba(0,0,0,0.85);
        color: #fff;
        font-size: 14px;
        padding: 15px;
        border-radius: 10px;
        display: none;
        z-index: 99999;
    `;
    panel.innerHTML = `
        <div id="nfse-status">Preparando...</div>
        <div style="margin-top:10px; background:#333; border-radius:6px; overflow:hidden;">
            <div id="nfse-bar" style="width:0%; height:12px; background:#28a745; transition:width 0.3s;"></div>
        </div>
    `;
    document.body.appendChild(panel);

    const bar = panel.querySelector("#nfse-bar");
    const status = panel.querySelector("#nfse-status");

    // Função para fazer o download de um link
    function baixarArquivo(url, nome) {
        const a = document.createElement("a");
        a.href = url;
        a.download = nome || "";
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    btn.onclick = async () => {
        btn.disabled = true;
        btn.textContent = "⏳ Baixando...";
        btn.style.background = "#ffc107";
        panel.style.display = "block";

        // Coleta os links de download
        const links = [...document.querySelectorAll('a[href*="/Notas/Download/NFSe/"]')].map(a => a.href);
        if (links.length === 0) {
            alert("Nenhum link de download encontrado.");
            btn.disabled = false;
            btn.textContent = "⬇️  Baixar todos XMLs";
            btn.style.background = "#28a745";
            panel.style.display = "none";
            return;
        }

        for (let [i, url] of links.entries()) {
            const nome = url.split('/').pop() + ".xml";
            status.textContent = `Baixando (${i+1}/${links.length}): ${nome}`;
            const progresso = Math.round(((i+1) / links.length) * 100);
            bar.style.width = progresso + "%";

            baixarArquivo(url, nome);

            // Aguarda 1s entre downloads pra não travar
            await new Promise(r => setTimeout(r, 1000));
        }

        status.textContent = "✅ Downloads iniciados!";
        btn.textContent = "✅ Concluído";
        btn.style.background = "#17a2b8";

        setTimeout(() => {
            btn.disabled = false;
            btn.textContent = "⬇️  Baixar todos XMLs";
            btn.style.background = "#28a745";
            panel.style.display = "none";
            bar.style.width = "0%";
        }, 4000);
    };
})();
