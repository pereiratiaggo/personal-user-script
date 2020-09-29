// ==UserScript==
// @name         autoClickOnEmpresaFacil
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Clica de maneira automatica nos botões "exibir conteudo" após consulta de um procolo no EMPRESA FACIL
// @author       pereiratiaggo
// @match        https://www.empresafacil.pr.gov.br/sigfacil/processo/acompanhar/co_protocolo/PRP2047947317
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    $('a.bt-saiba.refresh-box').click();
})();