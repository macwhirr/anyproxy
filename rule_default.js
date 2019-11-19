var utils      = require("./util"),
    bodyParser = require("body-parser"),
    path       = require("path"),
    fs         = require("fs"),
    Promise    = require("promise");

var isRootCAFileExists = require("./certMgr.js").isRootCAFileExists(),
    interceptFlag      = false;

var request_body = "";


var localjpg = fs.readFileSync("C://Users/liutianyu/AppData/Roaming/npm/node_modules/anyproxy/lib/1.jpg");

//e.g. [ { keyword: 'aaa', local: '/Users/Stella/061739.pdf' } ]
var mapConfig = [],
    configFile = "mapConfig.json";
function saveMapConfig(content,cb){
    new Promise(function(resolve,reject){
        var anyproxyHome = utils.getAnyProxyHome(),
            mapCfgPath   = path.join(anyproxyHome,configFile);

        if(typeof content == "object"){
            content = JSON.stringify(content);
        }
        resolve({
            path    :mapCfgPath,
            content :content
        });
    })
    .then(function(config){
        return new Promise(function(resolve,reject){
            fs.writeFile(config.path, config.content, function(e){
                if(e){
                    reject(e);
                }else{
                    resolve();
                }
            });
        });
    })
    .catch(function(e){
        cb && cb(e);
    })
    .done(function(){
        cb && cb();
    });
}
function getMapConfig(cb){
    var read = Promise.denodeify(fs.readFile);

    new Promise(function(resolve,reject){
        var anyproxyHome = utils.getAnyProxyHome(),
            mapCfgPath   = path.join(anyproxyHome,configFile);

        resolve(mapCfgPath);
    })
    .then(read)
    .then(function(content){
        return JSON.parse(content);
    })
    .catch(function(e){
        cb && cb(e);
    })
    .done(function(obj){
        cb && cb(null,obj);
    });
}

setTimeout(function(){
    //load saved config file
    getMapConfig(function(err,result){
        if(result){
            mapConfig = result;
        }
    });
},1000);


module.exports = {
    token: Date.now(),
    summary:function(){
        var tip = "the default rule for AnyProxy.";
        if(!isRootCAFileExists){
            tip += "\nRoot CA does not exist, will not intercept any https requests.";
        }
        return tip;
    },

    shouldUseLocalResponse : function(req,reqBody){

		
		//console.log('****************' + req.headers.accept );
		//如果请求为图片，则用本地图片，加快加载速度
        if (/image/i.test(req.headers.accept) && !(/html/.test(req.headers.accept))) {
             return true;
        }

        //intercept all options request
        var simpleUrl = (req.headers.host || "") + (req.url || "");
        mapConfig.map(function(item){
            var key = item.keyword;
            if(simpleUrl.indexOf(key) >= 0){
                req.anyproxy_map_local = item.local;
                return false;
            }
        });


        return !!req.anyproxy_map_local;
    },

    dealLocalResponse : function(req,reqBody,callback){

		
		//console.log('============******' + req.headers.accept +"**");
		//如果请求为图片，则用本地图片，加快加载速度
        if (/image/i.test(req.headers.accept)) {
			callback(200, {'content-type': 'image/jpg'}, localjpg);
        }


        if(req.anyproxy_map_local){
            fs.readFile(req.anyproxy_map_local,function(err,buffer){
                if(err){
                    callback(200, {}, "[AnyProxy failed to load local file] " + err);
                }else{
                    var header = {
                        'Content-Type': utils.contentType(req.anyproxy_map_local)
                    };
                    callback(200, header, buffer);
                }
            });
        }
    },

    replaceRequestProtocol:function(req,protocol){
    },

    replaceRequestOption : function(req,option){
		
		//add
		var newOption = option;
		//这里面的正则可以替换成自己不希望访问的网址特征字符串，这里面的btrace是一个腾讯视频的域名，经过实践发现特别容易导致浏览器崩溃，所以加在里面了，继续添加可以使用|分割。
		if(/google|btrace/i.test(newOption.headers.host)){
			newOption.hostname = "127.0.0.1";//这个ip也可以替换成其他的
			newOption.port  = "80";
		}
		return newOption;

    },

    replaceRequestData: function(req,data){
		
		
		//抖音搜索， - 视频
		if(/aweme\/v1\/search\/item/i.test(req.url)  ){
			console.log('replaceRequestData - data:' + data);
			request_body = data;
		}
		
		//宝宝树app
		if(/api\/mobile_search_new\/search_together/i.test(req.url)  ){
			console.log('replaceRequestData - data:' + data);
			request_body = data;
		}
		
		//快手app
		if(/rest\/n\/search/i.test(req.url)  ){
			console.log('replaceRequestData - data:' + data);
			request_body = data;
		}

		//微信文章，阅读数请求
		if(/mp\/getappmsgext/i.test(req.url)  ){
			console.log('replaceRequestData - data:' + data);
			request_body = data;
		}
		
    },

    replaceResponseStatusCode: function(req,res,statusCode){
    },

    replaceResponseHeader: function(req,res,header){
    },

    // Deprecated
    // replaceServerResData: function(req,res,serverResData){
    //     return serverResData;
    // },

    replaceServerResDataAsync: function(req,res,serverResData,callback){
		
		var host_url = req.headers.host;
		var url_current = req.url;//不包括host
		
		console.log('host:' + host_url);
		console.log('url_current:' + url_current);
		
		
		url_current = host_url + url_current;

		var test = req.headers;
		
		try{
			for(i in test){
				//console.log('1:' + i   );
				//console.log('2:' + test[i]   );
			}
		}catch(err){
			console.log('err:' + err);
		}
		
		
		if(host_url == 'www.xiaohongshu.com'){
			
		}
		
		//直接这样判断就行
		//搜索列表，v是变化的？，最新排序 eg:  /api/sns/v8/search/notes?deviceId=A9B577A9-F31C-4C02-A96F-1235A2C8E182&device_fingerprint=20180921170901f68619003cd7beba93f42bee6996933d01aaaf19b2dd0842&device_fingerprint1=20180921170901f68619003cd7beba93f42bee6996933d01aaaf19b2dd0842&keyword=surface%20pro&keyword_type=top_note&lang=zh&page=1&page_size=20&platform=iOS&search_id=16EF1A4B02DF5A7D34474319C68A9F52&sid=session.1222016942519757636&sign=9eadce655b3ae3b4dffc34243e30bfee&sort=time_descending&source=explore_feed&t=1550126129 
		if(/api\/sns\/v[0-9]+\/search\/notes/i.test(url_current) &&  /sort=time_descending/i.test(url_current)  ){
			//console.log('搜索请求：' + url_current + '###' + serverResData.toString() );
			//HttpPost(serverResData.toString(),url_current, "/xiaohongshu/saveSearchData.php");
			HttpPost(serverResData.toString(),url_current, "/xiaohongshu/xiaohongshuSearchData.php");
		}
		
		//帖子详细页,v是变化的？
		if(/api\/sns\/v[0-9]+\/note/i.test(url_current)){
			console.log('帖子详细页：' + url_current + '###' + serverResData.toString() );
		}
		
		
		//小红书，用户发布笔记页
		if(/api\/sns\/v3\/note\/user/i.test(url_current)){
			HttpPost(serverResData.toString(),url_current, "/xiaohongshu/xiaohongshuUserSaveData.php");
		}
		

		//小红书，微信小程序，用户发布笔记页
		if(/wx_mp_api\/sns\/v1\/note\/user/i.test(url_current)){
			HttpPost(serverResData.toString(),url_current, "/xiaohongshu/xiaohongshuWXUserSaveData.php");
		}

		
		//小红书，话题App，可以再在php页面判断排序问题，www.xiaohongshu.com/fe_api/burdock/v1/page/5cef5138f2bad70001344258/notes?page=1&pageSize=14&sort=time&sid=session.1550469880252218543
		if(/fe_api\/burdock\/v1\/page/i.test(url_current)  ){
			HttpPost(serverResData.toString(),url_current, "/xiaohongshu/xiaohongshuTopicSaveData.php");
		}
		
		//小红书，用户粉丝抓取，暂时是抓取登录用户的
		if(/api\/sns\/v1\/message\/you\/connections/i.test(url_current)){
			HttpPost(serverResData.toString(),url_current, "/xiaohongshu/xiaohongshuUserFansSaveData.php");
		}
		

		//临时抓下haohaozhu.cn-app的数据，文章
		if(/user\/getUserBlank/i.test(url_current)  ){
			//console.log('搜索请求：' + url_current + '###' + serverResData.toString() );
			HttpPost(serverResData.toString(),url_current, "/xiaohongshu/haohaozhuSaveData.php");
		}
		//临时抓下haohaozhu.cn-app的数据，图片
		if(/User\/getusernote/i.test(url_current)  ){
			//console.log('搜索请求：' + url_current + '###' + serverResData.toString() );
			HttpPost(serverResData.toString(),url_current, "/xiaohongshu/haohaozhuTuPianSaveData.php");
		}
		
		//临时抓取抖音app用户作品主页
		if(/aweme\/v1\/aweme\/post/i.test(url_current)  ){
			//console.log('搜索请求：' + url_current + '###' + serverResData.toString() );
			HttpPost(serverResData.toString(),url_current, "/xiaohongshu/douyinUserSaveData.php");
		}
		
		//抖音搜索， - 视频
		if(/aweme\/v1\/search\/item/i.test(url_current)  ){
			//console.log('搜索请求：' + url_current + '###' + serverResData.toString() );
			//用模拟器android的，请求是post的，keyword在request body里边,把request body加到url_current上，让php页面能够获取到keyword
			console.log('request_body：' + request_body );
			HttpPost(serverResData.toString(),url_current + request_body, "/xiaohongshu/douyinVideoSearchData.php");
		}
		
		//抖音话题页aweme/v1/commerce/challenge/aweme    ,  aweme\/v1\/challenge\/aweme
		//if(/aweme\/v1\/commerce\/challenge\/aweme/i.test(url_current)  ){
		if(/aweme\/v1\/challenge\/aweme/i.test(url_current)  ){
			//console.log('搜索请求：' + url_current + '###' + serverResData.toString() );
			console.log('request_body：' + request_body );
			HttpPost(serverResData.toString(),url_current + request_body, "/xiaohongshu/douyinTopicSaveData.php");
		}
		//抖音视频评论, aweme-hl.snssdk.com, /aweme/v2/comment/list/?version_code=5.2.0&pass-region=1&pass-route=1&js_sdk_version=1.8.0.0&app_name=aweme&vid=868B0F55-FD39-45A4-BD08-1A878AF3E77D&app_version=5.2.0&device_id=20376538551&channel=App%20Store&mcc_mnc=&aid=1128&screen_width=750&openudid=31f0551891aab36f8da07f0de0ae9f1001679f0c&os_api=18&ac=WIFI&os_version=11.4&device_platform=iphone&build_number=52007&device_type=iPhone8,1&iid=65422443009&idfa=77231553-686B-44CD-A5F4-6FDDF5D50751&cursor=0&aweme_id=6686660181742390540&count=20&insert_ids=&mas=0143fd74f45616f69e017ed8e8ec473ada53e0ac545bd3d5870a9e&as=a2f58e5c7adaccba5f5523&ts=1557129898
		if(/aweme\/v2\/comment\/list/i.test(url_current)  ){
			//console.log('搜索请求：' + url_current + '###' + serverResData.toString() );
			console.log('request_body：' + request_body );
			HttpPost(serverResData.toString(),url_current + request_body, "/xiaohongshu/douyinVideoComments.php");
		}
		
		//抖音视频评论的回复,aweme/v1/comment/list/reply
		if(/aweme\/v1\/comment\/list\/reply/i.test(url_current)  ){
			//console.log('搜索请求：' + url_current + '###' + serverResData.toString() );
			console.log('request_body：' + request_body );
			HttpPost(serverResData.toString(),url_current + request_body, "/xiaohongshu/douyinVideoCommentsReply.php");
		}
		
		//抖音搜索用户
		if(/aweme\/v1\/discover\/search/i.test(url_current)  ){
			//console.log('搜索请求：' + url_current + '###' + serverResData.toString() );
			console.log('request_body：' + request_body );
			HttpPost(serverResData.toString(),url_current + request_body, "/xiaohongshu/douyinUserSearchData.php");
		}
		
		//抖音用户关注
		if(/aweme\/v1\/user\/following\/list/i.test(url_current)  ){
			//console.log('搜索请求：' + url_current + '###' + serverResData.toString() );
			console.log('request_body：' + request_body );
			HttpPost(serverResData.toString(),url_current + request_body, "/xiaohongshu/douyinUserFocusData.php");
		}
		
		
		//宝宝树app - 搜索，列表没有时间，不能排序
		if(/api\/mobile_search_new\/search_together/i.test(url_current)  ){
			//console.log('搜索请求：' + url_current + '###' + serverResData.toString() );
			console.log('request_body：' + request_body );
			HttpPost(serverResData.toString(),url_current + "&"+request_body, "/xiaohongshu/babytreeSearchData.php");
		}
		
		
		//今天头条文章评论
		if(/article\/v4\/tab_comments/i.test(url_current)  ){
			//console.log('搜索请求：' + url_current + '###' + serverResData.toString() );
			console.log('request_body：' + request_body );
			HttpPost(serverResData.toString(),url_current + "&"+request_body, "/xiaohongshu/toutiaoComments.php");
		}
		///今天头条文章评论的回复
		if(/2\/comment\/v4\/reply_list/i.test(url_current)  ){
			//console.log('搜索请求：' + url_current + '###' + serverResData.toString() );
			console.log('request_body：' + request_body );
			HttpPost(serverResData.toString(),url_current + "&"+request_body, "/xiaohongshu/toutiaoCommentsReply.php");
		}
		
		
		//快手app，搜索用户
		if(/rest\/n\/search\/user/i.test(url_current)  ){
			//console.log('搜索请求：' + url_current + '###' + serverResData.toString() );
			console.log('request_body：' + request_body );
			HttpPost(serverResData.toString(),url_current + "&"+request_body, "/xiaohongshu/kuaishouUserSearchData.php");
		}
		//快手app，用户作品
		if(/rest\/n\/feed\/profile2/i.test(url_current)  ){
			//console.log('搜索请求：' + url_current + '###' + serverResData.toString() );
			console.log('request_body：' + request_body );
			HttpPost(serverResData.toString(),url_current + "&"+request_body, "/xiaohongshu/kuaishouUserData.php");
		}
		
		//快手app，搜索作品/rest/n/search?kpf=IPHONE&net=%E4%B8%AD%E5%9B%BD%E7%94%B5%E4%BF%A1_5&appver=6.6.0.992&kpn=KUAISHOU&mod=iPhone8%2C1&c=a&ud=1410352356&did_gt=1562220363464&ver=6.6&sys=ios11.4&did=C0A15D37-BEC4-40A3-8850-CB8D3E8B7F5F&isp=
		if(/rest\/n\/search\/feed/i.test(url_current)  ){
			//console.log('搜索请求：' + url_current + '###' + serverResData.toString() );
			console.log('request_body：' + request_body );
			HttpPost(serverResData.toString(),url_current + "&"+request_body, "/xiaohongshu/kuaishouSearchData.php");
		}
		
		
		//20191118
		//微信文章
		if(/mp.weixin.qq.com\/s/i.test(url_current)  ){
			//console.log('搜索请求：' + url_current + '###' + serverResData.toString() );
			//console.log('request_body：' + request_body );
			HttpPost(serverResData.toString(),url_current + "&"+request_body, "/xiaohongshu/weixinWz.php");
		}
		//微信，阅读数请求
		if(/mp.weixin.qq.com\/mp\/getappmsgext/i.test(url_current)  ){
			//console.log('搜索请求：' + url_current + '###' + serverResData.toString() );
			console.log('request_body：' + request_body );
			HttpPost(serverResData.toString(),url_current + "&"+request_body, "/xiaohongshu/weixinWz.php");
		}


		if(host_url == 'img.xiaohongshu.com'){
			callback('');//不显示图片
			console.log('ttttttttttttttttttttttttttttt' );
		}else{
			serverResData = serverResData.toString().replace(/ci.xiaohongshu.com/g, "xxxxxx234234.com");//不显示图片
			callback(serverResData);
		}
		
		
        
    },

    pauseBeforeSendingResponse: function(req,res){
    },

    shouldInterceptHttpsReq:function(req){
        return interceptFlag;
    },

    //[beta]
    //fetch entire traffic data
    fetchTrafficData: function(id,info){},

    setInterceptFlag: function(flag){
        interceptFlag = flag && isRootCAFileExists;
    },

    _plugIntoWebinterface: function(app,cb){

        app.get("/filetree",function(req,res){
            try{
                var root = req.query.root || utils.getUserHome() || "/";
                utils.filewalker(root,function(err, info){
                    res.json(info);
                });
            }catch(e){
                res.end(e);
            }
        });

        app.use(bodyParser.json());
        app.get("/getMapConfig",function(req,res){
            res.json(mapConfig);
        });
        app.post("/setMapConfig",function(req,res){
            mapConfig = req.body;
            res.json(mapConfig);

            saveMapConfig(mapConfig);
        });

        cb();
    },

    _getCustomMenu : function(){
        return [
            // {
            //     name:"test",
            //     icon:"uk-icon-lemon-o",
            //     url :"http://anyproxy.io"
            // }
        ];
    }
};




function HttpPost(str,url,path) {//将json发送到服务器，str为json内容，url为历史消息页面地址，path是接收程序的路径和文件名		encodeURIComponent(str),
    var http = require('http');
    var data = {
        //str: encodeURIComponent(str),
		str: str,
        url: encodeURIComponent(url)
    };
    content = require('querystring').stringify(data);
    var options = {
        method: "POST",
        host: "192.168.2.201",//注意没有http://，这是服务器的域名。
        port: 80,
        path: path,//接收程序的路径和文件名
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            "Content-Length": content.length
        }
    };
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
    });
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });
    req.write(content);
    req.end();
}


