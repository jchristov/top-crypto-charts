
use marketsdb;

SELECT 
    symbol,
    IFNULL(AVG(btc_volume), 0) as 'volume_ma'
FROM 
    market_candles
WHERE
    start_time > (UNIX_TIMESTAMP() - (60*60))
GROUP BY
    symbol
