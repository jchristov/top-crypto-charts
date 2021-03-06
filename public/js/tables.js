
function genTable(data, sortColmn) {

    var binanceLinkEx = "https://www.binance.com/trade.html?symbol=";
    var bittrexLinkEx = "https://bittrex.com/Market/Index?MarketName=";

    var txt = "";
    txt += "<table id=\"table-topcoins\" class=\"table table-striped table-bordered table-responsive\">";
    
    // Header
    txt += "<thead>";
    txt += "<tr>";
    txt += "<th>Coin</th>";
    txt += "<th>Base</th>";
    txt += "<th>Exchange</th>";
    txt += "<th>Gain (%)</th>";
    txt += "<th>Volatility (%)</th>";
    txt += "<th>Volume</th>";
    txt += "<th>Volume (BTC)</th>";
    txt += "<th>Links</th>";
    txt += "</tr>";
    txt += "</thead>";

    // Body
    txt += "<tbody>";
    for (var i in data) {
        txt += "<tr>";
        
        // Coin Column with Trading view pop up chart
        txt += "<td>"
        txt += "<a href=\"#\" data-toggle=\"modal\" data-target=\"#chartModal\" onclick=\"getTVPreview('";
        txt += data[i].exchange + ":" + data[i].market + data[i].base;
        txt += "');return false;\">";
        txt += data[i].market;
        txt += "</a>";
        txt += "</td>";

        // Base Column
        txt += "<td>" + data[i].base + "</td>";

        // Exchange Column
        txt += "<td>" + data[i].exchange + "</td>";
        
        // Coin price difference Column
        txt += "<td";
        if(parseFloat(data[i].gain) < 0.0) 
            txt += " class=\"text-danger\">" + data[i].gain.toFixed(2);
        else if(parseFloat(data[i].gain) > 0.0) 
            txt += " class=\"text-success\">+" + data[i].gain.toFixed(2);
        else 
            txt += ">" + data[i].gain.toFixed(2);
        txt += "%</td>";

        // Coin volatility difference Column
        txt += "<td>" + data[i].volatility.toFixed(2) + "%</td>";

        // Volume Column
        txt += "<td>" + data[i].volume.toFixed(4) + "</td>";

        // Volume BTC Column
        txt += "<td>" + data[i].btc_volume.toFixed(4) + "</td>";
        
        // Links column
        txt += "<td>";
        
            var exchangelink = "";
            var exchangeImg = "";
            var coinigyLink = "https://www.coinigy.com/main/markets/";
            var tradingViewLink = "https://www.tradingview.com/chart/?symbol=" + data[i].exchange + ":" + data[i].market + data[i].base;;
            if(data[i].exchange == "BINANCE") {
                exchangelink = binanceLinkEx + data[i].market + "_" + data[i].base;
                exchangeImg = "/img/binance.png";
                coinigyLink += "bina/" + data[i].market + "/" + data[i].base;
            } else if(data[i].exchange == "BITTREX") {
                exchangelink = bittrexLinkEx + data[i].base + "-" + data[i].market;
                exchangeImg = "/img/bittrex.png";
                coinigyLink += "btrx/" + data[i].market + "/" + data[i].base;
            }


            txt += "<a href=\"";
            txt += exchangelink;
            txt += "\" target=\"_blank\">";
            txt += "<img src=\"";
            txt += exchangeImg;
            txt += "\" alt=\"Exchange\" height=\"15\" width=\"15\">";
            txt +="</a>";

            txt += "<a href=\"";
            txt += coinigyLink;
            txt += "\" target=\"_blank\">";
            txt += "<img src=\"/img/coinigy.png\" alt=\"Exchange\" height=\"15\" width=\"15\">";
            txt +="</a>";

            txt += "<a href=\"";
            txt += tradingViewLink;
            txt += "\" target=\"_blank\">";
            txt += "<img src=\"/img/tradingview.png\" alt=\"Exchange\" height=\"15\" width=\"15\">";
            txt +="</a>";
        
        txt += "</td>";

        txt += "</tr>";
    }
    txt += "</tbody>";

        // Footer
        txt += "<tfoot>";
        txt += "<tr>";
        txt += "<th>Coin</th>";
        txt += "<th>Base</th>";
        txt += "<th>Exchange</th>";
        txt += "<th>Gain (%)</th>";
        txt += "<th>Volatility (%)</th>";
        txt += "<th>Volume</th>";
        txt += "<th>Volume (BTC)</th>";
        txt += "<th>Links</th>";
        txt += "</tr>";
        txt += "</tfoot>";

    txt += "</table>"    

    document.getElementById("table").innerHTML = txt;


    var sortCol = 3; // default to gain
    if(sortColmn == 0) {
        sortCol = 5;
    } else if(sortColmn == 1) {
        sortCol = 3;
    } else if(sortColmn == 2) {
        sortCol = 4;
    } 

    var table =  $("#table-topcoins").DataTable( {

        paging: false,
        scrollY: 600,
        order: [[ sortCol, 'desc' ]],
        initComplete: function () {

            var columns = [1];
            for(var i = 0; i < columns.length; i++) {
                var column = this.api().column(columns[i]);
                var select = $('<select><option value=""></option></select>')
                    .appendTo( $(column.footer()).empty() )
                    .on( 'change', function () {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );
                        column
                            .search( val ? '^'+val+'$' : '', true, false )
                            .draw();
                    } );
    
                column.data().unique().sort().each( function ( d, j ) {
                    select.append( '<option value="'+d+'">'+d+'</option>' )
                } );
            }
        }
    });

    // Apply the search
    table.columns().every( function () {
        var that = this;

        $( 'input', this.footer() ).on( 'keyup change', function () {
            if ( that.search() !== this.value ) {
                that
                    .search( this.value )
                    .draw();
            }
        } );
    } );
}
