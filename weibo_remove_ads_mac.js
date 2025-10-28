// 微博去广告 Surge Mac+iOS 通用版
// 修改时间：2025/10/28

let body = $response?.body;
let url = $request?.url;
if (!body || !url) $done({});

// 解析 JSON
let obj;
try {
    obj = JSON.parse(body);
} catch (e) {
    console.log("解析失败:", e);
    $done({ body }); // 解析失败直接原样返回
}

// ----------------- 清理函数 -----------------
function cleanExtend(obj) {
    if (!obj) return;
    delete obj.reward_info;
    delete obj.head_cards;
    delete obj.report_data;
    delete obj.snapshot_share_customize_dic;
    delete obj.top_cards;
    delete obj.comment_data;
    delete obj.dynamic_share_items;
    delete obj.trend;
    delete obj.follow_data;
    delete obj.loyal_fans_guide_info;
    delete obj.topic_struct;
    delete obj.extend_info;
    delete obj.common_struct;
    delete obj.tag_struct;
    delete obj.pic_bg_new;
    delete obj.pic_bg_new_dark;
    delete obj.hot_page;
    delete obj.semantic_brand_params;
    delete obj.ad_tag_nature;
    delete obj.buttons;
    delete obj.extra_button_info;
    delete obj.page_info;
    delete obj?.sharecontent?.additional_indication_icon_url;
    delete obj.detail_top_right_button;
    delete obj?.title_source?.flag_img;
    delete obj?.title_source?.right_icon;
    if (obj?.title_source?.show_verified) obj.title_source.show_verified = false;
    delete obj?.header_info?.avatar?.flag_img;
    if (obj?.header_info?.show_verified) obj.header_info.show_verified = false;
    delete obj?.pageinfo?.icon_list;
    delete obj?.pageinfo?.title_more;
}

function cleanUser(user) {
    if (!user) return;
    delete user.icons;
    delete user.avatar_extend_info;
    delete user.mbtype;
    delete user.mbrank;
    delete user.level;
    delete user.type;
    delete user.vvip;
    delete user.svip;
    delete user.verified_type;
}

function cleanComment(item) {
    if (!item) return;
    delete item.comment_bubble;
    delete item.vip_button;
    delete item.pic_bg_new;
    delete item.pic_bg_new_dark;
    delete item.pic_bg_type;
    cleanUser(item.user);
    const comments = item.comments;
    if (Array.isArray(comments)) {
        for (let i = comments.length - 1; i >= 0; i--) {
            if (comments[i]) cleanComment(comments[i]);
        }
    }
}

function removeVipSuffix(data) {
    if (!Array.isArray(data?.screen_name_suffix_new)) return;
    for (const suffix of data.screen_name_suffix_new) {
        if (Array.isArray(suffix.icons)) {
            suffix.icons = suffix.icons.filter(icon => icon?.type === "chaohua");
        }
    }
}

function processCommentArray(array = []) {
    for (let i = array.length - 1; i >= 0; i--) {
        const item = array[i];
        if (
            item?.adType ||
            item?.business_type === "hot" ||
            item?.commentAdType ||
            item?.commentAdSubType ||
            item?.data?.adType ||
            item?.data?.itemid === "ai_summary_entrance_real_show"
        ) {
            array.splice(i, 1);
            continue;
        }
        cleanComment(item);
        if (item.data) cleanComment(item.data);
    }
}

function processFeedArray(array = []) {
    if (!Array.isArray(array)) return;

    const groupItemIds = new Set([
        "card86_card11_cishi",
        "card86_card11",
        "INTEREST_PEOPLE",
        "trend_top_qiehuan",
        "profile_collection",
        "realtime_tag_groug",
    ]);

    const cardItemIds = new Set([
        "finder_channel",
        "finder_window",
        "tongcheng_usertagwords",
        "top_searching",
    ]);

    const keywords = [
        "hot_character",
        "local_hot_band",
        "hot_video",
        "hot_chaohua_list",
        "hot_link_mike",
        "chaohua_discovery_banner",
        "bottom",
        "hot_search",
        "广告",
        "hot_spot_name",
    ];

    for (let i = array.length - 1; i >= 0; i--) {
        const item = array[i];
        const data = item?.data || item?.status;

        if (
            item?.item_category === "hot_ad" ||
            item?.item_category === "trend" ||
            item?.mblogtypename === "广告" ||
            item?.isInsert === false ||
            item?.category === "wboxcard" ||
            data?.mblogtypename === "广告" ||
            data?.ad_state === 1 ||
            data?.card_type === 196 ||
            data?.desc === "相关搜索" ||
            data?.card_ad_style === 1 ||
            data?.is_ad_card === 1 ||
            data?.is_detail === true ||
            data?.card_id === "search_card" ||
            (data?.group && data?.anchorId) ||
            data?.card_type === 227 ||
            (item?.category === "group" && groupItemIds.has(item?.itemId)) ||
            (item?.category === "card" && cardItemIds.has(data?.itemid)) ||
            (item?.itemId && keywords.some(k => String(item.itemId).includes(k))) ||
            (data?.itemid && keywords.some(k => String(data.itemid).includes(k))) ||
            (item?.category === "group" && item?.type === "vertical" && item?.header) ||
            (item?.category === "detail" && item?.type === "trend")
        ) {
            array.splice(i, 1);
            continue;
        }

        if (data) {
            cleanUser(data.user);
            cleanExtend(data);
            removeVipSuffix(data);
        }

        if (Array.isArray(item.items)) {
            processFeedArray(item.items);
        }
    }
}

// ----------------- 接口处理 -----------------
try {
    if (url.includes("statuses/container_detail_comment") || url.includes("statuses/container_detail_mix")) {
        if (Array.isArray(obj.items)) processCommentArray(obj.items);
    } else if (url.includes("statuses/container_detail_forward")) {
        if (obj.items) processFeedArray(obj.items);
    } else if (url.includes("statuses/container_detail")) {
        if (Array.isArray(obj?.pageHeader?.data?.items)) processFeedArray(obj.pageHeader.data.items);
        if (obj?.detailInfo?.status) { cleanUser(obj.detailInfo.status.user); cleanExtend(obj.detailInfo.status); removeVipSuffix(obj.detailInfo.status); }
        if (obj?.detailInfo?.extend) { cleanUser(obj.detailInfo.extend.user); cleanExtend(obj.detailInfo.extend); removeVipSuffix(obj.detailInfo.extend); }
    } else if (url.includes("comments/build_comments")) {
        if (Array.isArray(obj.datas)) processCommentArray(obj.datas);
        if (Array.isArray(obj.root_comments)) processCommentArray(obj.root_comments);
        if (Array.isArray(obj.comments)) processCommentArray(obj.comments);
        if (obj?.rootComment) cleanComment(obj.rootComment);
        if (obj?.status) cleanComment(obj.status);
    } else if (url.includes("statuses/container_timeline") || url.includes("profile/container_timeline")) {
        if (obj?.loadedInfo) delete obj.loadedInfo.headers;
        if (obj.items) processFeedArray(obj.items);
    } else if (url.includes("messageflow/notice")) {
        if (obj.messages) processFeedArray(obj.messages);
    } else if (url.includes("search/finder")) {
        if (Array.isArray(obj?.header?.data?.items)) processFeedArray(obj.header.data.items);
        if (obj?.channelInfo) delete obj.channelInfo.moreChannels;
        if (Array.isArray(obj?.channelInfo?.channels)) {
            const allowedtitles = new Set(['热点','热问','热转','指数']);
            obj.channelInfo.channels = obj.channelInfo.channels.filter(c => allowedtitles.has(c.title));
        }
        const payload = obj.channelInfo?.channels?.find(c=>c?.payload)?.payload;
        if (Array.isArray(payload?.items)) processFeedArray(payload.items);
        if (payload?.loadedInfo?.searchBarContent) delete payload.loadedInfo.searchBarContent;
        if (payload?.loadedInfo?.headerBack?.channelStyleMap) delete payload.loadedInfo.headerBack.channelStyleMap;
    } else if (url.includes("search/container_discover") || url.includes("search/container_timeline")) {
        processFeedArray(obj.items);
        if (obj?.loadedInfo?.searchBarContent) delete obj.loadedInfo.searchBarContent;
        if (obj?.loadedInfo?.theme) delete obj.loadedInfo.theme;
        if (obj?.loadedInfo?.headerBack?.channelStyleMap) delete obj.loadedInfo.headerBack.channelStyleMap;
    } else if (url.includes("2/flowlist") || url.includes("2/statuses/longtext_show_batch")) {
        if (obj?.items) processFeedArray(obj.items);
        if (obj?.longtexts?.data) processFeedArray(obj.longtexts.data);
    } else if (url.includes("searchall")) {
        if (obj.items) processFeedArray(obj.items);
    }
} catch(e) {
    console.log("处理错误:", e);
}

$done({ body: JSON.stringify(obj) });
