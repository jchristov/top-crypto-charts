
use marketsdb;

SELECT 
    AVG(btc_volume) as 'average_volume'
FROM 
    market_candles
WHERE
    symbol = 'BINANCE:ADAETH' AND
    start_time > (UNIX_TIMESTAMP() - (60*20))