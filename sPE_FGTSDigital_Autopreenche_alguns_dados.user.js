// ==UserScript==
// @name         sPE_FGTSDigital_Autopreenche_alguns_dados
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Este script serve para preencher alguns dados e facilitar na hora de gerar a procuração
// @author       pereiratiaggo
// @match        https://spe.sistema.gov.br/procuracao/criar
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gov.br
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let inputs;

    setTimeout(() => {
        inputs = document.getElementsByTagName("input");
        inputs[1].value = inputs[0].value;
    }, 1000);

    setTimeout(() => {
        inputs[3].click();
        inputs[4].value = ""; //CNPJ "00.000.000/0000-00"
        inputs[5].value = ""; //email email@email.com
        inputs[6].value = inputs[5].value;
        inputs[7].value = inputs[6].value;
    }, 1000);
})();
