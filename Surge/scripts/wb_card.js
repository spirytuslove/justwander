
// cardlist/page/comonitor 广告清理
const url = $request.url;
var body = $response.body;

if (url.indexOf("/h5/comonitor") != -1) { $done({}); return; }

try {
    let obj = JSON.parse(body);
    if (obj.cards && obj.cards.length > 0) {
        let i = obj.cards.length;
        while (i--) {
            let c = obj.cards[i];
            if ((c.card_type && c.card_type == 9) || (c.itemid && c.promotion) || c.ad) obj.cards.splice(i,1);
        }
    }
    if (obj.ad) obj.ad = [];
    if (obj.advertises) obj.advertises = [];
    body = JSON.stringify(obj);
} catch(e) {}

$done({body});
