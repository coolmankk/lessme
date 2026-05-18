var obj = {
    host: "https://h5.jianpianips1.com",
    imgHost: "https://img.ztfgh.com",
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://h5.jianpianips1.com/'
    }
};

function getPic(path) {
    if (!path) return '';
    if (path.indexOf('http') === 0) return path;
    return obj.imgHost + (path.startsWith('/') ? '' : '/') + path;
}

function init(ext) {}

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

function homeVod() {
    var list = [];
    try {
        var res = JSON.parse(request(obj.host + "/api/dyTag/hand_data?category_id=88"));
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
    } catch (e) {}
    return JSON.stringify({ list: list });
}

function category(tid, pg, filter, extend) {
    var page = pg || 1;
    var list = [];
    try {
        var url = obj.host + "/api/crumb/list?fcate_pid=" + tid + "&page=" + page;
        var res = JSON.parse(request(url));
        res.data.forEach(function(i) {
            list.push({
                vod_id: i.id.toString(),
                vod_name: i.title,
                vod_pic: getPic(i.path || i.tvimg),
                vod_remarks: i.mask
            });
        });
    } catch (e) {}
    return JSON.stringify({
        page: page,
        pagecount: 999,
        list: list
    });
}

function detail(id) {
    try {
        var url = obj.host + "/api/video/detailv2?id=" + id;
        var res = JSON.parse(request(url));
        var v = res.data;
        var vod = {
            vod_id: v.id.toString(),
            vod_name: v.title,
            vod_pic: getPic(v.tvimg || v.thumbnail),
            vod_type: v.category,
            vod_year: v.year,
            vod_area: v.area,
            vod_remarks: v.mask,
            vod_actor: v.actors ? v.actors.map(function(a){return a.name}).join(' ') : '',
            vod_content: v.description
        };

        var playFrom = [];
        var playUrl = [];
        v.source_list_source.forEach(function(source) {
            var sn = source.name;
            if (sn.includes('VIP') || sn.includes('FTP')) return;
            playFrom.push(sn);
            var items = source.source_list.map(function(item) {
                return item.source_name + "$" + item.url;
            });
            playUrl.push(items.join("#"));
        });
        vod.vod_play_from = playFrom.join("$$$");
        vod.vod_play_url = playUrl.join("$$$");
        return JSON.stringify({ list: [vod] });
    } catch (e) {}
}

function search(wd, quick) {
    var list = [];
    try {
        var url = obj.host + "/api/v2/search/videoV2?key=keyword=" + encodeURIComponent(wd);
        var res = JSON.parse(request(url));
        res.data.forEach(function(i) {
            list.push({
                vod_id: i.id.toString(),
                vod_name: i.title,
                vod_pic: getPic(i.path || i.tvimg),
                vod_remarks: i.mask
            });
        });
    } catch (e) {}
    return JSON.stringify({ list: list });
}

function play(flag, id, flags) {
    return JSON.stringify({
        parse: 1,
        url: id,
        header: obj.headers
    });
}

// 兼容 TVBox/LunaTV 的请求函数
function request(url) {
    return req(url, { headers: obj.headers }).content;
}
