

exports.compareBySymbol = function (a,b) {
    if (a.symbol < b.symbol)
      return -1;
    if (a.symbol > b.symbol)
      return 1;
    return 0;
}

exports.compareByVolume = function (a,b) {
    if (a.volume < b.volume)
      return 1;
    if (a.volume > b.volume)
      return -1;
    return 0;
}

exports.compareByGain = function (a,b) {
    if (a.gain < b.gain)
      return 1;
    if (a.gain > b.gain)
      return -1;
    return 0;
}

exports.getByBase = function(key, array){
    for (var i=0; i < array.length; i++) {
        if (array[i].base === key) {
            return array[i];
        }
    }
}