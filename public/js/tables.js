
function genTable(data) {

    var binanceLinkEx = "https://www.binance.com/trade.html?symbol=";
    var bittrexLinkEx = "https://bittrex.com/Market/Index?MarketName=";

    var txt = "";
    txt += "<table class=\"table table-striped table-bordered table-responsive\">";
    txt += "<tr>";
    txt += "<th>Coin</th>";
    txt += "<th>Base Coin</th>";
    txt += "<th>Exchange</th>";
    txt += "<th>Volume</th>";
    txt += "<th>Volume (BTC)</th>";
    txt += "<th>Gain (%)</th>";
    txt += "<th>Volatility (%)</th>";
    txt += "<th>Links</th>";
    txt += "</tr>";
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

        // Volume Column
        txt += "<td>" + data[i].volume + "</td>";

        // Volume BTC Column
        txt += "<td>" + data[i].btc_volume + "</td>";
        
        // Coin price difference Column
        txt += "<td";
        if(parseFloat(data[i].gain) < 0.0) 
            txt += " class=\"text-danger\">" + data[i].gain;
        else if(parseFloat(data[i].gain) > 0.0) 
            txt += " class=\"text-success\">+" + data[i].gain;
        else 
            txt += ">" + data[i].gain;
        txt += "%</td>";

        // Coin volatility difference Column
        txt += "<td>" + data[i].volatility + "%</td>";
        
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
            txt += "\" alt=\"Exchange\" height=\"20\" width=\"20\">";
            txt +="</a>";

            txt += "<a href=\"";
            txt += coinigyLink;
            txt += "\" target=\"_blank\">";
            txt += "<img src=\"/img/coinigy.png\" alt=\"Exchange\" height=\"20\" width=\"20\">";
            txt +="</a>";

            txt += "<a href=\"";
            txt += tradingViewLink;
            txt += "\" target=\"_blank\">";
            txt += "<img src=\"/img/tradingview.png\" alt=\"Exchange\" height=\"20\" width=\"20\">";
            txt +="</a>";
        
        txt += "</td>";

        txt += "</tr>";
    }
    txt += "</table>"        
    document.getElementById("table").innerHTML = txt;
}

function genStatsTable(data) {

    var txt = "";
    txt += "<table id=\"table-statistics\" class=\"table table-striped table-bordered table-responsive tablesorter\">";
    txt += "<thead>";
    txt += "<tr>";
    txt += "<th>Symbol</th>";
    txt += "<th>Price (%)</th>";
    txt += "<th>Volatility (%)</th>";
    txt += "<th>Volume</th>";
    txt += "<th>Volume (BTC)</th>";
    txt += "</tr>";
    txt += "</thead>";
    txt += "<tbody>";
    for (var i in data) {

        var gain = (data[i].close - data[i].open) / data[i].open * 100.0;
        var volatility = (data[i].high - data[i].low) / data[i].low * 100.0;


        txt += "<tr>";

        // Symbol Column
        txt += "<td>" + data[i].symbol + "</td>";

        // Price diff Column
        txt += "<td";
        if(gain < 0.0) 
            txt += " class=\"text-danger\">" + gain.toFixed(2);
        else if(gain > 0.0) 
            txt += " class=\"text-success\">+" + gain.toFixed(2);
        else 
            txt += ">" + gain.toFixed(2);
        txt += "%</td>";

        //txt += "<td>" + gain.toFixed(2); + "%</td>";

        // Volatility Column
        txt += "<td>" + volatility.toFixed(2) + "%</td>";

        // Volume Column
        txt += "<td>" + data[i].volume + "</td>";

        // Volume BTC Column
        txt += "<td>" + data[i].btc_volume + "</td>";

        txt += "</tr>";
    }
    txt += "</tbody>"  
    txt += "</table>"        
    document.getElementById("table").innerHTML = txt;
}