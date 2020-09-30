// ==UserScript==
// @name         autoClickOnEmpresaFacil
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Clica de maneira automatica nos botões "exibir conteudo" após consulta de um procolo no EMPRESA FACIL
// @author       pereiratiaggo
// @match        https://www.empresafacil.pr.gov.br/sigfacil/processo/acompanhar/co_protocolo/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    $('a.bt-saiba.refresh-box').click();

    var delay = 1000 * 60 * 15; //ms * seg * min -> 1000 * 60 * 15 = 900000ms = 15min
    setTimeout(function () {
        location.reload();
    }, delay);
})();