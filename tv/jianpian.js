var HOST = "https://h5.jianpianips1.com";
var IMG = "https://img.ztfgh.com";

function getPic(p) {
    return (p && p.startsWith('http')) ? p : IMG + (p.startsWith('/') ? '' : '/') + p;
}

function home(f) {
    return JSON.stringify({
        class: [
            {type_id:"1",type_name:"电影"},{type_id:"2",type_name:"电视剧"},
            {type_id:"3",type_name:"动漫"},{type_id:"4",type_name:"综艺"},
            {type_id:"67",type_name:"短剧"},{type_id:"50",type_name:"纪录片"}
        ]
    });
}

function homeVod() {
    var r = JSON.parse(req(HOST + "/api/dyTag/hand_data?category_id=88").content);
    var list = [];
    for (var k in r.data) {
        r.data[k].forEach(function(i) {
            list.push({vod_id:i.id,vod_name:i.title,vod_pic:getPic(i.path||i.tvimg),vod_remarks:i.mask});
        });
    }
    return JSON.stringify({list:list});
}

function category(tid, pg) {
    var r = JSON.parse(req(HOST+"/api/crumb/list?fcate_pid="+tid+"&page="+pg).content);
    return JSON.stringify({
        page:pg, list: r.data.map(function(i){
            return {vod_id:i.id,vod_name:i.title,vod_pic:getPic(i.path||i.tvimg),vod_remarks:i.mask}
        })
    });
}

function detail(id) {
    var v = JSON.parse(req(HOST+"/api/video/detailv2?id="+id).content).data;
    var from = [], urls = [];
    v.source_list_source.forEach(function(s) {
        if (s.name.includes('FTP') || s.name.includes('VIP')) return;
        from.push(s.name);
        urls.push(s.source_list.map(function(it){return it.source_name+"$"+it.url}).join("#"));
    });
    return JSON.stringify({list:[{
        vod_id:v.id,vod_name:v.title,vod_pic:getPic(v.tvimg),
        vod_content:v.description,vod_play_from:from.join("$$$"),vod_play_url:urls.join("$$$")
    }]});
}

function search(wd) {
    var r = JSON.parse(req(HOST+"/api/v2/search/videoV2?key=keyword="+encodeURIComponent(wd)).content);
    return JSON.stringify({list: r.data.map(function(i){
        return {vod_id:i.id,vod_name:i.title,vod_pic:getPic(i.path||i.tvimg),vod_remarks:i.mask}
    })});
}

function play(flag, id) {
    return JSON.stringify({parse:1, url:id});
}

export default { home, homeVod, category, detail, search, play };
