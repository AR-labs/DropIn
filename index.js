var http = require("http"),
	url = require("url"),
	session = require('./libs/session.js/core').magicSession(),
	settings = require('./settings.js');

require("./downloadManager");

var dh = {
	"root" : require("./handler/root.js").handleReq,
	"panel" : require("./handler/panel.js").handleReq,
	"login" : require("./handler/login.js").handleReq,
	"save" : require("./handler/save.js").handleReq,
	"assets" : require("./handler/assets.js").handleReq,
	"er404" : require("./handler/assets.js").show404
};

http.createServer(function(request, response){	
    var pathname = url.parse(request.url).pathname,
    	pathParts = pathname.substring(1).split("/");
    
    if(pathParts[0] !== "" && pathname.substring(pathname.length-1) === "/"){
    	response.writeHead(302, { 
    			'Location': pathname.substring(0, pathname.length-1)
    	});
    	response.end(); return;
    }
    switch(pathParts[0].toLowerCase()){
    	case "" : ;
    	case "imprint.html" : dh.root(request, response, pathParts); break;
    	case "assets" : dh.assets(request, response, pathParts); break;
    	case "panel": dh.panel(request, response, pathParts); break;
    	case "login": dh.login(request, response, pathParts); break;
    	case "auth": dh.login(request, response, pathParts); break;
    	case "logout": dh.login(request, response, pathParts); break;
    	case "save": dh.save(request, response, pathParts); break;
    	case "favicon.ico": dh.assets(request, response, pathParts); break;
    	default : dh.er404(response);
    }
}).listen(settings.app.port);

console.log("Server running at port " + settings.app.port);