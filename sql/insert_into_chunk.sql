use marketsdb;

INSERT INTO  market_chunks 
    (
        candle,
        symbol, 
        open, 
        high, 
        low, 
        close, 
        volume, 
        btc_volume
    )
SELECT 
    '15m',
    T4.symbol, 
    T4.open, 
    T4.high, 
    T4.low, 
    T4.close, 
    T4.volume, 
    T4.btc_volume
FROM
(
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
                WHERE
                    start_time > (UNIX_TIMESTAMP() - (60*15))
                GROUP BY 
                    symbol
            )
    ) AS T1
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
        start_time > (UNIX_TIMESTAMP() - (60*15))
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
    ) AS T3
    ON 
        T2.symbol = T3.symbol
) AS T4
ON DUPLICATE KEY UPDATE 
    open = T4.open,
    high = T4.high,
    low = T4.low,
    close = T4.close,
    volume = T4.volume,
    btc_volume = T4.btc_volume;