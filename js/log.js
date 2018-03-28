function getDate() {

    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

exports.log = function(msg)
{
    console.log(`${getDate()}: ${msg}`);
}