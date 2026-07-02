/*
README：https://github.com/yichahucha/surge/tree/master
Forked & enhanced: added cardlist/page/comonitor/fangle/searchall handling
*/

const path1 = "/groups/timeline";
const path2 = "/statuses/unread";
const path3 = "/statuses/extend";
const path4 = "/comments/build_comments";
const path5 = "/photo/recommend_list";
const path6 = "/stories/video_stream";
const path7 = "/statuses/positives/get";
const path8 = "/stories/home_list";
const path9 = "/profile/statuses";
const path10 = "/statuses/friends/timeline";
const path11 = "/service/picfeed";
const path12 = "/fangle/timeline";
const path13 = "/searchall";
const path14 = "/cardlist";
const path15 = "/statuses/video_timeline";
const path16 = "/page";
const path17 = "/statuses/friends_timeline";
const path18 = "/h5/comonitor";

const url = $request.url;
var body = $response.body;

// 广告上报直接拦截
if (url.indexOf(path18) != -1) {
    $done({});
    return;
}

if (
    url.indexOf(path1) != -1 ||
    url.indexOf(path2) != -1 ||
    url.indexOf(path10) != -1 ||
    url.indexOf(path15) != -1 ||
    url.indexOf(path17) != -1
) {
    let obj = JSON.parse(body);
    if (obj.statuses) obj.statuses = filter_timeline_statuses(obj.statuses);
    if (obj.advertises) obj.advertises = [];
    if (obj.ad) obj.ad = [];
    if (obj.num) obj.num = obj.original_num;
    if (obj.trends) obj.trends = [];
    body = JSON.stringify(obj);
}

if (url.indexOf(path3) != -1) {
    let obj = JSON.parse(body);
    if (obj.trend) delete obj.trend;
    body = JSON.stringify(obj);
}

if (url.indexOf(path4) != -1) {
    let obj = JSON.parse(body);
    obj.recommend_max_id = 0;
    if (obj.status) {
        if (obj.top_hot_structs) {
            obj.max_id = obj.top_hot_structs.call_back_struct.max_id;
            delete obj.top_hot_structs;
        }
        if (obj.datas) obj.datas = filter_comments(obj.datas);
    } else {
        obj.datas = [];
    }
    body = JSON.stringify(obj);
}

if (url.indexOf(path5) != -1) {
    let obj = JSON.parse(body);
    obj.data = {};
    body = JSON.stringify(obj);
}

if (url.indexOf(path6) != -1) {
    let obj = JSON.parse(body);
    let segments = obj.segments;
    if (segments && segments.length > 0) {
        let i = segments.length;
        while (i--) {
            const element = segments[i];
            let is_ad = element.is_ad;
            if (is_ad && is_ad == true) segments.splice(i, 1);
        }
    }
    body = JSON.stringify(obj);
}

if (url.indexOf(path7) != -1) {
    let obj = JSON.parse(body);
    if (obj.datas) obj.datas = [];
    body = JSON.stringify(obj);
}

if (url.indexOf(path8) != -1) {
    let obj = JSON.parse(body);
    let segments = obj.segments;
    if (segments && segments.length > 0) {
        let i = segments.length;
        while (i--) {
            const element = segments[i];
            let is_ad = element.is_ad;
            if (is_ad && is_ad == true) segments.splice(i, 1);
        }
    }
    body = JSON.stringify(obj);
}

if (url.indexOf(path9) != -1) {
    let obj = JSON.parse(body);
    if (obj.statuses) obj.statuses = filterAdCard(obj.statuses);
    body = JSON.stringify(obj);
}

if (url.indexOf(path11) != -1) {
    let obj = JSON.parse(body);
    if (obj.data) {
        let i = obj.data.length;
        while (i--) {
            let element = obj.data[i];
            if (element.pic_type && element.pic_type == "ad") obj.data.splice(i, 1);
        }
    }
    body = JSON.stringify(obj);
}

// 新加：cardlist 广告卡片清理
if (url.indexOf(path14) != -1) {
    try {
        let obj = JSON.parse(body);
        if (obj.cards && obj.cards.length > 0) {
            let i = obj.cards.length;
            while (i--) {
                let card = obj.cards[i];
                if (card.card_type && card.card_type == 9) obj.cards.splice(i, 1);
                if (card.itemid && card.promotion) obj.cards.splice(i, 1);
                if (card.ad) obj.cards.splice(i, 1);
            }
        }
        if (obj.ad) obj.ad = [];
        if (obj.advertises) obj.advertises = [];
        body = JSON.stringify(obj);
    } catch(e) {}
}

// 新加：page 广告清理
if (url.indexOf(path16) != -1) {
    try {
        let obj = JSON.parse(body);
        if (obj.cards && obj.cards.length > 0) {
            let i = obj.cards.length;
            while (i--) {
                let card = obj.cards[i];
                if (card.card_type && card.card_type == 9) obj.cards.splice(i, 1);
                if (card.itemid && card.promotion) obj.cards.splice(i, 1);
                if (card.ad) obj.cards.splice(i, 1);
            }
        }
        body = JSON.stringify(obj);
    } catch(e) {}
}

// 新加：searchall 广告清理
if (url.indexOf(path13) != -1) {
    try {
        let obj = JSON.parse(body);
        if (obj.cards && obj.cards.length > 0) {
            let i = obj.cards.length;
            while (i--) {
                let card = obj.cards[i];
                if (card.card_type && card.card_type == 9) obj.cards.splice(i, 1);
            }
        }
        body = JSON.stringify(obj);
    } catch(e) {}
}

// 新加：fangle/timeline 广告清理
if (url.indexOf(path12) != -1) {
    try {
        let obj = JSON.parse(body);
        if (obj.cards && obj.cards.length > 0) {
            let i = obj.cards.length;
            while (i--) {
                let card = obj.cards[i];
                if (card.card_type && card.card_type == 9) obj.cards.splice(i, 1);
            }
        }
        if (obj.ad) obj.ad = [];
        body = JSON.stringify(obj);
    } catch(e) {}
}

$done({body});

function filter_timeline_statuses(statuses) {
    if (statuses && statuses.length > 0) {
        let i = statuses.length;
        while (i--) {
            let element = statuses[i];
            if (element.is_ad) {
                statuses.splice(i, 1);
            } else if (element.ad_state !== undefined) {
                let ad_state = element.ad_state;
                if (ad_state && ad_state != 0) statuses.splice(i, 1);
            }
        }
    }
    return statuses;
}

function filter_comments(datas) {
    if (datas && datas.length > 0) {
        let i = datas.length;
        while (i--) {
            let element = datas[i];
            let type = element.type;
            if (type && type == 5) datas.splice(i, 1);
        }
    }
    return datas;
}

function filterAdCard(statuses) {
    if (statuses && statuses.length > 0) {
        let i = statuses.length;
        while (i--) {
            let element = statuses[i];
            if (element.is_ad) {
                statuses.splice(i, 1);
            } else if (element.ad_state !== undefined) {
                let ad_state = element.ad_state;
                if (ad_state && ad_state != 0) statuses.splice(i, 1);
            }
        }
    }
    return statuses;
}
