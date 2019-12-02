'use strict';


var request_body = "";


module.exports = {

  summary: 'the default rule for AnyProxy',

  /**
   *
   *
   * @param {object} requestDetail
   * @param {string} requestDetail.protocol
   * @param {object} requestDetail.requestOptions
   * @param {object} requestDetail.requestData
   * @param {object} requestDetail.response
   * @param {number} requestDetail.response.statusCode
   * @param {object} requestDetail.response.header
   * @param {buffer} requestDetail.response.body
   * @returns
   */
  *beforeSendRequest(requestDetail) {
	//console.log("111111111111:" + requestDetail.body);
	
	
	//微信阅读数
	//post - body
	if (requestDetail.url.indexOf('mp.weixin.qq.com/mp/getappmsgext') >= 0) {
		//请求post
        //HttpPost(newResponse.body.toString(),requestDetail.url, "/xiaohongshu/weixinWz.php");
		
		
		
		request_body = requestDetail.requestData;
	
	}
	
/**
	//requestOptions
		for (var value in requestDetail) {
			console.log("****" + value + "=" + requestDetail[value]);
		}
	*/
	
	if (requestDetail.url.indexOf('mmbiz.qpic.cn') >= 0) {
		
		

	}	
		
	
	
		
		
	

    return null;
  },


  /**
   *
   *
   * @param {object} requestDetail
   * @param {object} responseDetail
   */
  *beforeSendResponse(requestDetail, responseDetail) {
	  
		let newResponse = responseDetail.response
		//微信文章
		if (requestDetail.url.indexOf('mp.weixin.qq.com/s') >= 0) {
			
			console.log("2222222222222:" + requestDetail.url);
			
			//请求post
            HttpPost(newResponse.body.toString(),requestDetail.url, "/xiaohongshu/weixinWz.php");
			
            var newDataStr = '<font color=red>anyproxy已注入<br/>192.168.2.187</font>';
            newResponse.body = newDataStr + " - " + Date.now() + newResponse.body.toString();
			
            return {
                response: newResponse
            }
        }
		
		//阅读数&赞
		if (requestDetail.url.indexOf('mp.weixin.qq.com/mp/getappmsgext') >= 0) {
			//请求post
            HttpPost(newResponse.body.toString(),requestDetail.url + request_body, "/xiaohongshu/weixinWz.php");
		}
		
		
		
    return null;
  },


  /**
   * default to return null
   * the user MUST return a boolean when they do implement the interface in rule
   *
   * @param {any} requestDetail
   * @returns
   */
  *beforeDealHttpsRequest(requestDetail) {
	  
	  	//console.log("3333333333333:" + requestDetail);
		
		
    return null;
  },

  /**
   *
   *
   * @param {any} requestDetail
   * @param {any} error
   * @returns
   */
  *onError(requestDetail, error) {
    return null;
  },


  /**
   *
   *
   * @param {any} requestDetail
   * @param {any} error
   * @returns
   */
  *onConnectError(requestDetail, error) {
    return null;
  },


  /**
   *
   *
   * @param {any} requestDetail
   * @param {any} error
   * @returns
   */
  *onClientSocketError(requestDetail, error) {
    return null;
  },
};




function HttpPost(str,url,path) {//将json发送到服务器，str为json内容，url为历史消息页面地址，path是接收程序的路径和文件名		encodeURIComponent(str),
    var http = require('http');
    var data = {
        //str: encodeURIComponent(str),
		str: str,
        url: encodeURIComponent(url)
    };
    var content = require('querystring').stringify(data);
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

