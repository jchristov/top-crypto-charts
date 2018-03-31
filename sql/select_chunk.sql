se marketsdb;

SELECT 
    T2.symbol,
    T1.open,
    T2.high,
    T2.low,
    T3.close,
    T2.volume,
    T2.btc_volume
FROM 
(
    SELECT 
        symbol,
        open 
    FROM 
        market_candles 
        T1 
    WHERE 
        start_time IN 
        (
            SELECT 
                MIN(start_time) 
                FROM 
                    market_candles 
                GROUP BY 
                    symbol
        )
) as T1
Inner Join
(
SELECT
    symbol,
    MAX(high) AS 'high', 
    MIN(low) AS 'low', 
    SUM(volume) AS 'volume',
    SUM(btc_volume) AS 'btc_volume'
FROM
    market_candles
  WHERE
    start_time > (UNIX_TIMESTAMP() - 1600)
GROUP BY
    symbol
) AS T2
ON 
    T1.symbol = T2.symbol
INNER JOIN (
    SELECT symbol,
        Close 
    FROM 
        market_candles 
        T1 
    WHERE 
        start_time IN 
        (
            SELECT 
                MAX(start_time) 
            FROM 
                market_candles 
            GROUP BY 
                symbol
        )
) as T3
ON 
    T2.symbol = T3.symbol