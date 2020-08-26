// ==UserScript==
// @name         dataTable on EmpregadorWEB
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Active dataTable on Empregador WEB (MTE website)
// @author       pereiratiaggo
// @match        https://sd.maisemprego.mte.gov.br/sdweb/empregadorweb/restrito/requerimentoemergencial/consultar.jsf
// @match        https://sd.maisemprego.mte.gov.br/sdweb/empregadorweb/restrito/selecionar_empresa.jsf
// @grant        none
// @require      https://code.jquery.com/jquery-3.5.1.js
// @require      http://cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js

// ==/UserScript==

(function() {
    $('#ResultadoPesqRequerimentoEmergencial table').dataTable({
        "order":     [[ 0, "desc" ],[ 1, "asc" ]],
        "paging":    false,
        "info":      false,
        "searching": false,
    });
    $('table#listaProcuracaoPJSelecionarTable').dataTable({
        "order":     [[ 2, "asc" ]],
        "paging":    false,
        "info":      false,
        "searching": false,
    });
})();

