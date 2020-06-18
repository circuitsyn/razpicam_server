$(document).ready(function() {

    $(function() { $("#snapBtn").click(function (event) { 
        $.getJSON('/PhotoSnap', { },
    function(data) { }); return false; }); });







});