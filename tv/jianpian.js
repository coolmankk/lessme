var HOST = "https://h5.jianpianips1.com";
var IMG_HOST = "https://img.ztfgh.com";

function getPic(path) {
    if (!path) return '';
    if (path.indexOf('http') === 0) return path;
    return IMG_HOST + (path.startsWith('/') ? '' : '/') + path;
}

// 1. 首页分类 (先硬编码，防止请求失败导致页面空白)
function home(filter) {
    var classes = [
        {"type_id": "1", "type_name": "电影"},
        {"type_id": "2", "type_name": "电视剧"},
        {"type_id": "3", "type_name": "动漫"},
        {"type_id": "4", "type_name": "综艺"},
        {"type_id": "67", "type_name": "短剧"},
        {"type_id": "50", "type_name": "纪录片"}
    ];
    return JSON.stringify({ "class": classes });
}

// 2. 首页推荐
function homeVod() {
    try {
        var url = HOST + "/api/dyTag/hand_data?category_id=88";
        var html = req(url, {headers: {"User-Agent": "Mozilla/5.0"}}).content;
        var res = JSON.parse(html);
        var list = [];
        for (var key in res.data) {
            res.data[key].forEach(function(i) {
                list.push({
                    vod_id: i.id.toString(),
                    vod_name: i.title,
                    vod_pic: getPic(i.path || i.tvimg),
                    vod_remarks: i.mask || i.score
                });
            });
        }
        return JSON.stringify({ list: list });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

// 3. 分类列表
function category(tid, pg, filter, extend) {
    try {
        var page = pg || 1;
        var url = HOST + "/api/crumb/list?fcate_pid=" + tid + "&page=" + page;
        var html = req(url, {headers: {"User-Agent": "Mozilla/5.0"}}).content;
        var res = JSON.parse(html);
        var list = [];
        res.data.forEach(function(i) {
            list.push({
                vod_id: i.id.toString(),
                vod_name: i.title,
                vod_pic: getPic(i.path || i.tvimg),
                vod_remarks: i.mask
            });
        });
        return JSON.stringify({
            page: parseInt(page),
            pagecount: 99,
            list: list
        });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

// 4. 详情页
function detail(id) {
    try {
        var url = HOST + "/api/video/detailv2?id=" + id;
        var html = req(url, {headers: {"User-Agent": "Mozilla/5.0"}}).content;
        var v = JSON.parse(html).data;
        var playFrom = [];
        var playUrl = [];
        
        v.source_list_source.forEach(function(source) {
            if (source.name.includes('VIP') || source.name.includes('FTP')) return;
            playFrom.push(source.name);
            var items = source.source_list.map(function(item) {
                return item.source_name + "$" + item.url;
            });
            playUrl.push(items.join("#"));
        });

        var vod = {
            vod_id: v.id.toString(),
            vod_name: v.title,
            vod_pic: getPic(v.tvimg || v.thumbnail),
            vod_remarks: v.mask,
            vod_actor: v.actors ? v.actors.map(function(a){return a.name}).join(' ') : '',
            vod_content: v.description,
            vod_play_from: playFrom.join("$$$"),
            vod_play_url: playUrl.join("$$$")
        };
        return JSON.stringify({ list: [vod] });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

// 5. 搜索
function search(wd, quick) {
    try {
        var url = HOST + "/api/v2/search/videoV2?key=keyword=" + encodeURIComponent(wd);
        var html = req(url, {headers: {"User-Agent": "Mozilla/5.0"}}).content;
        var res = JSON.parse(html);
        var list = [];
        res.data.forEach(function(i) {
            list.push({
                vod_id: i.id.toString(),
                vod_name: i.title,
                vod_pic: getPic(i.path || i.tvimg),
                vod_remarks: i.mask
            });
        });
        return JSON.stringify({ list: list });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

// 6. 播放
function play(flag, id, flags) {
    return JSON.stringify({
        parse: 1,
        url: id
    });
}
