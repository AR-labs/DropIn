var cachedRessources = {},
	er404,
    cachingStatusCodes = {
        "caching": 1,
        "err": 2
    },
	fs = require("fs"),
    cacheAsset = function(name, cb){
		cachedRessources[name] = 1; //caching
		fs.readFile(
			  __dirname.substring(0,__dirname.lastIndexOf("/")) 
			  + "/files"
			  + name, 
			function(err, data) {
			  	if(err){ cachedRessources[name] = 2; return; }
			  	cachedRessources[name] = data;
			  	if(typeof cb === "object"){
			  		cb(data);
			  	}
			}
		);
    },
    getAsset = function(name, cb, binary) {
        if (!cachedRessources[name]) {
            cacheAsset(name);
        }
        if (cachedRessources[name] === cachingStatusCodes.caching) {
            setTimeout(function(){getAsset(name, cb, binary);}, 5); // hier fehlte der binary-bool^^
            return;
        }
        if (cachedRessources[name] === cachingStatusCodes.err) {
            return;
        }
        if(binary){
        	cb(cachedRessources[name]);
        }
        else{
        	cb(cachedRessources[name].toString());
        }
    };

getAsset("/html/404.html", function(data){ er404 = data; });

exports.handleReq = function(request, response, pathParts){
	if(pathParts[0] === "favicon.ico") pathParts = ["assets","favicon.ico"]
	getAsset("/" + pathParts.join("/"), function(data){
		if(!data){
			exports.show404(response); return;
		}
		
		if(pathParts[1]) {
			switch(pathParts[1].split(".")[1]){
				case "css" : response.writeHead(200, {"Content-Type": "text/css"}); break;
				case "html": response.writeHead(200, {"Content-Type": "text/html"}); break;
				case "js"  : response.writeHead(200, {"Content-Type": "text/javascript"}); break;
				case "png" : response.writeHead(200, {"Content-Type": "image/png"}); break;
				case "jpg" : response.writeHead(200, {"Content-Type": "image/jpeg"}); break;
				case "jpeg": response.writeHead(200, {"Content-Type": "image/jpg"}); break;
				default	   : response.writeHead(200);
			}
		} else { response.writeHead(200); }
		
		response.end(data, "binary");
	}, true);
}
exports.show404 = function(response){
	response.writeHeader(404);
	response.end(er404); return;
}
exports.getAsset = getAsset;