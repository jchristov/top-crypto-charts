
// HTTP REST API

function Get(yourUrl, callback){
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.onreadystatechange = function() { 
        if (Httpreq.readyState == 4 && Httpreq.status == 200)
            callback(JSON.parse(Httpreq.responseText));
    }
    Httpreq.open("GET",yourUrl,true);
    Httpreq.send(null);       
}

// DOM Modifiers

function pBinanceVolumeModifer(data) {
    document.getElementById("pBinanceVolume").innerHTML = data;
}

// HTTP GET Response Handlers

function BinanceVolumeResponseHandler(json) {

    var symbols = ""

    for(var i = 0; i < json.length; i++) {
        var obj = json[i];
    
        console.log(obj["symbol"])
        
        symbols += obj["symbol"]
        symbols += ' '
    }

    

    pBinanceVolumeModifer(symbols)
}

// On CLick Events

function btnBinanceVolumeOnCLick() {

    Get("https://api.binance.com/api/v1/ticker/24hr", BinanceVolumeResponseHandler);
}