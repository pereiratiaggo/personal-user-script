// ==UserScript==
// @name         Baixar XMLs, PDFs e Copiar Tabela NFS-e
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Baixa XMLs e PDFs em lote ignorando canceladas e copia tabela para Excel
// @match        https://www.nfse.gov.br/EmissorNacional/Notas/Emitidas*
// @match        https://www.nfse.gov.br/EmissorNacional/Notas/Recebidas*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function criaBotao(texto, cor, dx = 30) {
        const btn = document.createElement("button");
        btn.textContent = texto;
        btn.style = `
            position: fixed;
            bottom: 30px;
            right: ${dx}px;
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

    const btnXML   = criaBotao("⬇️ Baixar XMLs", "#28a745", 30);
    const btnPDF   = criaBotao("⬇️ Baixar PDFs", "#007bff", 230);
    const btnExcel = criaBotao("📋 Copiar p/ Excel", "#6f42c1", 430);

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
            await new Promise(r => setTimeout(r, 800));
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

    // -----------------------
    // FILTRO PARA IGNORAR CANCELADAS
    // -----------------------

    function pegaLinks(tipo) {
        const linhas = [...document.querySelectorAll("table tbody tr")];

        return linhas
            .filter(l => !l.querySelector('img[src*="tb-cancelada.svg"]'))
            .map(l => l.querySelector(
                tipo === "XML"
                    ? 'a[href*="/Notas/Download/NFSe/"]'
                    : 'a[href*="/Notas/Download/DANFSe/"]'
            ))
            .filter(a => a)
            .map(a => a.href);
    }

    btnXML.onclick = () => {
        const links = pegaLinks("XML");
        baixarLista(links, "XML", btnXML);
    };

    btnPDF.onclick = () => {
        const links = pegaLinks("PDF");
        baixarLista(links, "PDF", btnPDF);
    };

    // -----------------------
    // COPIAR TABELA PARA EXCEL
    // -----------------------

    function copiarTabelaExcel() {
        const tabela = document.querySelector("table");
        if (!tabela) {
            alert("Nenhuma tabela encontrada.");
            return;
        }

        let linhas = [];

        tabela.querySelectorAll("tr").forEach(tr => {
            const cols = [...tr.querySelectorAll("th, td")].map(td =>
                td.innerText.replace(/\s+/g, " ").trim()
            );
            linhas.push(cols.join("\t"));
        });

        const texto = linhas.join("\n");

        navigator.clipboard.writeText(texto).then(() => {
            btnExcel.textContent = "✔ Copiado!";
            btnExcel.style.background = "#28a745";

            setTimeout(() => {
                btnExcel.textContent = "📋 Copiar p/ Excel";
                btnExcel.style.background = "#6f42c1";
            }, 2000);
        });
    }

    btnExcel.onclick = copiarTabelaExcel;

})();
