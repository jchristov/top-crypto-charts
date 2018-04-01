use marketsdb;

SELECT 
    symbol, open, high, low, close, volume, btc_volume
 FROM 
    market_chunks
WHERE
    exchange = 'binance' AND
    candle = '5m';
              