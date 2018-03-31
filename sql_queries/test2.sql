
use marketsdb;

SELECT 
    market, base, exchange, volume, btc_volume, gain, volatility
FROM 
    markets
ORDER BY 
    btc_volume DESC 
LIMIT 
    10