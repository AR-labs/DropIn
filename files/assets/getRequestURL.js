var parseQueryString = function(qs){
	var ret = {};
	var parts = qs.split("&"), elems;
	for(var i = 0; i < parts.length; i++){
		elems = parts[i].split("=");
		if(elems.length === 2){
			ret[elems[0]] = elems[1];
		}
	}
	return ret;
}

var yqlCatch = function(query){
	var prog = document.getElementById("login"), tokens;
	//set progress to progressing
	prog.setAttribute("class","progressing");
	
	//check if tokens exist, if not: set progress to fail
	try	{		tokens = parseQueryString(query.query.results.result); }
	catch(e){	prog.setAttribute("class","fail"); }
	if(!tokens)	prog.setAttribute("class","fail");
	
	//send secret to server
	var s = document.createElement("script");
	s.src = "/save/secret/" + tokens["oauth_token_secret"];
	document.getElementsByTagName("head")[0].appendChild(s);
		
	//generate url
	prog.setAttribute("href","http://www.dropbox.com/0/oauth/authorize?oauth_token="
			+ tokens["oauth_token"] + "&oauth_callback=" + callbackUri);
	
	prog.setAttribute("class","");
}

var callbackUri = callbackUri = (function(url){
	url = url.split("/");
    var ret = [];
    for(var i=0, j=url.length-1; i<j;i++){
    	ret.push(url[i]);
    }
    return ret.join("/");
})(document.location.href) + "/login";

/*'http://query.yahooapis.com/v1/public/yql'
	+'?format=json&env='+encodeURIComponent("store://2Udlg4FFUu8YaioGbHacqs")
    +'&callback=yqlCatch';
*/
var query = "http://query.yahooapis.com/v1/public/yql?format=json&env=store%3A%2F%2F2Udlg4FFUu8YaioGbHacqs&callback=yqlCatch&q=" + 
encodeURIComponent('select * from oauth where method="POST" and uri="http://api.dropbox.com/0/oauth/request_token" and callbackUri="' + callbackUri + '"');

var s = document.createElement("script");
s.src = query;
document.getElementsByTagName("head")[0].appendChild(s);