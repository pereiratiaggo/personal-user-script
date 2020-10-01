// ==UserScript==
// @name         dataTable on EmpregadorWEB
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Active dataTable on Empregador WEB (MTE website)
// @author       pereiratiaggo
// @match        http://sd.mte.gov.br/*
// @match        https://sd.mte.gov.br/*
// @match        http://sd.maisemprego.mte.gov.br/*
// @match        https://sd.maisemprego.mte.gov.br/*
// @exclude      https://sd.maisemprego.mte.gov.br/sdweb/empregadorweb/restritoSemCert/home.jsf
// @grant        none
// @require      https://code.jquery.com/jquery-3.5.1.js
// @require      http://cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js

// ==/UserScript==

(function() {
    //Table Empregados
    $('#ResultadoPesqRequerimentoEmergencial table').dataTable({
        "order":     [[ 0, "desc" ],[ 1, "asc" ]],
        "paging":    false,
        "info":      false,
        "searching": false,
    });

    //Table Empresa
    $('table#listaProcuracaoPJSelecionarTable, table#empresasBusca').dataTable({
        "order":     [[ 2, "asc" ]],
        "paging":    false,
        "info":      false,
        "searching": false,
    });
})();
