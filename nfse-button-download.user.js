// ==UserScript==
// @name         Baixar XMLs e PDFs NFS-e (um por vez)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Baixa XMLs e PDFs em lote com barra de progresso
// @match        https://www.nfse.gov.br/EmissorNacional/Notas/Emitidas*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function criaBotao(texto, cor) {
        const btn = document.createElement("button");
        btn.textContent = texto;
        btn.style = `
            position: fixed;
            bottom: 30px;
            right: ${texto.includes("PDF") ? "230px" : "30px"};
            z-index: 99999;
            padding: 15px 25px;
            background: ${cor};
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
        return btn;
    }

    // Botão XML
    const btnXML = criaBotao("⬇️ Baixar XMLs", "#28a745");

    // Botão PDF
    const btnPDF = criaBotao("⬇️ Baixar PDFs", "#007bff");

    // Painel de progresso
    const panel = document.createElement("div");
    panel.style = `
        position: fixed;
        bottom: 100px;
        right: 30px;
        width: 320px;
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

    function baixar(url, nome) {
        const a = document.createElement("a");
        a.href = url;
        a.download = nome;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    async function baixarLista(links, tipo, botao) {
        if (links.length === 0) {
            alert(`Nenhum ${tipo} encontrado.`);
            return;
        }

        botao.disabled = true;
        botao.textContent = "⏳ Baixando...";
        botao.style.background = "#ffc107";

        panel.style.display = "block";
        status.textContent = "Preparando...";

        for (let [i, url] of links.entries()) {
            const nomeBase = url.split("/").pop();
            const nome = nomeBase + (tipo === "XML" ? ".xml" : ".pdf");

            status.textContent = `Baixando (${i+1}/${links.length}): ${nome}`;
            bar.style.width = Math.round(((i+1) / links.length) * 100) + "%";

            baixar(url, nome);

            await new Promise(r => setTimeout(r, 1000));
        }

        status.textContent = "✅ Downloads iniciados!";
        botao.textContent = "✔️ Concluído";
        botao.style.background = "#17a2b8";

        setTimeout(() => {
            botao.disabled = false;
            botao.textContent = tipo === "XML" ? "⬇️ Baixar XMLs" : "⬇️ Baixar PDFs";
            botao.style.background = tipo === "XML" ? "#28a745" : "#007bff";
            panel.style.display = "none";
            bar.style.width = "0%";
        }, 3500);
    }

    btnXML.onclick = () => {
        const links = [...document.querySelectorAll('a[href*="/Notas/Download/NFSe/"]')].map(a => a.href);
        baixarLista(links, "XML", btnXML);
    };

    btnPDF.onclick = () => {
        const links = [...document.querySelectorAll('a[href*="/Notas/Download/DANFSe/"]')].map(a => a.href);
        baixarLista(links, "PDF", btnPDF);
    };

})();
