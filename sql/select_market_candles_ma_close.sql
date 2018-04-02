
use marketsdb;

SELECT 
    T1.symbol,
    T1.volume_ma_open
    T2.volume_ma_close
FROM 
(
    SELECT 
        symbol,
        IFNULL(AVG(btc_volume), 0) as 'volume_ma_open'
    FROM 
        market_candles
        T1
    WHERE
        start_time > ((UNIX_TIMESTAMP() - (60*60)) - (1200)) AND
        start_time < (UNIX_TIMESTAMP() - (60*60))
    GROUP BY
        symbol
) AS T1
INNER JOIN 
(
    SELECT 
        symbol,
        IFNULL(AVG(btc_volume), 0) as 'volume_ma_close'
    FROM 
        market_candles
        T2
    WHERE
        start_time > (UNIX_TIMESTAMP() - 1200)
    GROUP BY
        symbol
) as T2
ON 
    T1.symbol = T2.symbol


/*SELECT 
    symbol,
    IFNULL(AVG(btc_volume), 0) as 'volume_ma_open'
FROM 
    market_candles
WHERE
    start_time > ((UNIX_TIMESTAMP() - (60*60)) - (1200)) AND
    start_time < (UNIX_TIMESTAMP() - (60*60))
GROUP BY
    symbol
AS 
    T1
JOIN 
(
    SELECT 
        symbol,
        IFNULL(AVG(btc_volume), 0) as 'volume_ma_close'
    FROM 
        market_candles
    WHERE
        start_time > (UNIX_TIMESTAMP() - 1200)
    GROUP BY
        symbol
) AS T2

ON T1.symbol = T2.symbol*/