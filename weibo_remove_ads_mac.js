// 微博去广告 Surge Mac+iOS 通用版
// 修改时间：2025/10/28

let body = $response.body;
if (!body) $done({});
let url = $request.url;
let obj;

try {
  obj = JSON.parse(body);
} catch (e) {
  console.log("解析失败:", e);
  $done({});
}

// ----------------- 清理函数 -----------------
function cleanExtend(obj) { /* 原 weibo_remove_ads.js 的 cleanExtend 内容 */ }
function cleanUser(user) { /* 原 cleanUser 内容 */ }
function cleanComment(item) { /* 原 cleanComment 内容 */ }
function removeVipSuffix(data) { /* 原 removeVipSuffix 内容 */ }
function processCommentArray(array = []) { /* 原 processCommentArray 内容 */ }
function processFeedArray(array = []) { /* 原 processFeedArray 内容 */ }

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
