var request = require('request');
//https://graviex.net:443/api/v2/tickers/sendbtc.json
//var base_url = 'https://www.cryptopia.co.nz/api';
var base_url = 'https://graviex.net:443/api/v2';

/*at    1561511579
ticker  
buy "0.000000411"
sell    "0.00000075"
low "0.000000421"
high    "0.000000918"
last    "0.00000075"
vol "4145.412"
volbtc  "0.0021588225257"
change  -0.18300653594771243
*/
function get_summary(coin, exchange, cryptopia_id, cb) {
    var summary = {};
    request({ uri: base_url + '/tickers/' + 'sendbtc', json: true }, function (error, response, body) {
        if (error) {
            return cb(error, null);
        } else{
            summary['bid'] = parseFloat(body['ticker']['buy']).toFixed(8);
            summary['ask'] = parseFloat(body['ticker']['sell']).toFixed(8);
            summary['volume'] = parseFloat(body['ticker']['vol']);
            summary['high'] = parseFloat(body['ticker']['high']).toFixed(8);
            summary['low'] = parseFloat(body['ticker']['low']).toFixed(8);
            summary['last'] = parseFloat(body['ticker']['last']).toFixed(8);
            summary['change'] = parseFloat(body['ticker']['change']);
            return cb(null, summary);
        }
    });
}
/*
timestamp   1561515794
asks    […]
bids    […]
*/
function get_trades(coin, exchange, crytopia_id, cb) {
    var req_url = base_url + '/trades.json?market=sendbtc';
    request({ uri: req_url, json: true }, function (error, response, body) {
        if (error) {
            return cb(error, null);
        }else{
            var tTrades = body;
            var trades = [];
            for (var i = 0; i < tTrades.length; i++) {
                var Trade = {
                    orderpair: tTrades[i]["market"],
                    ordertype: "",
                    amount: parseFloat(tTrades[i]["volume"]).toFixed(8),
                    price: parseFloat(tTrades[i]["price"]).toFixed(8),
                    //  total: parseFloat(tTrades[i].Total).toFixed(8)
                    // Necessary because API will return 0.00 for small volume transactions
                    total: (parseFloat(tTrades[i]["volume"]).toFixed(8) * parseFloat(tTrades[i]["price"])).toFixed(8),
                    timestamp: tTrades[i].Timestamp
                }
                trades.push(Trade);
            }
            return cb(null, trades);
        }
    });
}
/*
timestamp   1561515794
asks    […]
bids    […]
*/
function get_orders(coin, exchange, cryptopia_id, cb) {
    var req_url = base_url + '/depth.json?market=sendbtc&limit=50';
    request({ uri: req_url, json: true }, function (error, response, body) {
        if (error) {
            return cb(error, null);
        }else{
            var orders = body;
            var buys = [];
            var sells = [];
            if (orders['asks'].length > 0){
                for (var i = 0; i < orders['asks'].length; i++) {
                    var order = {
                        amount: parseFloat(orders['asks'][i][1]).toFixed(8),
                        price: parseFloat(orders['asks'][i][0]).toFixed(8),
                        total: (parseFloat(orders['asks'][i][1]).toFixed(8) * parseFloat(orders['asks'][i][0])).toFixed(8)
                    }
                    buys.push(order);
                }
            }
            if (orders['bids'].length > 0) {
                for (var x = 0; x < orders['bids'].length; x++) {
                    var order = {
                        amount: parseFloat(orders['bids'][x][1]).toFixed(8),
                        price: parseFloat(orders['bids'][x][0]).toFixed(8),
                        total: (parseFloat(orders['bids'][x][1]).toFixed(8) * parseFloat(orders['bids'][x][0])).toFixed(8)
                    }
                    sells.push(order);
                }
            }
            return cb(null, buys, sells);
            
        }
    });
}


module.exports = {
    get_data: function (coin, exchange, cryptopia_id, cb) {
        var error = null;
        get_orders(coin, exchange, cryptopia_id, function (err, buys, sells) {
            if (err) { error = err; }
            get_trades(coin, exchange, cryptopia_id, function (err, trades) {
                if (err) { error = err; }
                get_summary(coin, exchange, cryptopia_id, function (err, stats) {
                    if (err) { error = err; }
                    return cb(error, { buys: buys, sells: sells, chartdata: [], trades: trades, stats: stats });
                });
            });
        });
    }
};