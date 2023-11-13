// ==UserScript==
// @name         "Não" pensão alimenticia FGTS
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Preenche automaticamente "Não" na opção de pensão alimenticia na comunicação de saida ao FGTS (Geração de Chave)
// @author       You
// @match        https://sicse.caixa.gov.br/sicse/ControladorPrincipalServlet
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gov.br
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("Pensao preenchida com Não automaticamente");
    document.getElementsByName("txtPensao")[0].value = "Não";
})();
