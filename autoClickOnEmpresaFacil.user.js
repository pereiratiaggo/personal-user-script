// ==UserScript==
// @name         autoClickOnEmpresaFacil
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.empresafacil.pr.gov.br/sigfacil/processo/acompanhar/co_protocolo/PRP2047947317
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    $('a.bt-saiba.refresh-box').click();
})();