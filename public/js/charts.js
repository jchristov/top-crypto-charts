
function genLinks(data) {

    //console.log(data);
    var mcc = 'https://www.multicoincharts.com/?';
    var tv = '';

    for(var i = 0; i < data.length; i++) {

        var exchange = data[i]['exchange'];
        var market = data[i]['market'];
        var base = data[i]['base'];

        var symbol = exchange.concat(':', market, base);

        mcc = mcc.concat('chart=', symbol);
        tv = tv.concat(symbol);

        if(i != data.length-1)
        {
            mcc = mcc.concat('&');
            tv = tv.concat(',');
        }

    }

    $("#mcc").html(mcc);
    $("#tv").html(tv);
}

function openMCC() {
    window.open($("#mcc").text(), '_blank');
}

function downloadTV() {
    
    var filename = "watchlist.txt"
    var text = $("#tv").text();

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
    $temp.remove();
}

function getTVPreview(symbol) {

    new TradingView.widget(
    {
        "symbol": symbol,
        "interval": "60",
        "timezone": "Etc/UTC",
        "theme": "Light",
        "style": "1",
        "locale": "uk",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": false,
        "container_id": "tradingview_9c53c"
    });
}