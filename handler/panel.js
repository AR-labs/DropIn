var jqtmpl = require("../libs/jqtpl.js"),
	qs = require("querystring"),
	asset = require("./assets"),
	qs = require("querystring"),
	downloads = require("../tables").downloads,
	settings = require("../settings.js"),
	dlManager = require("../downloadManager"),
	panelTemplate;

asset.getAsset("/templates/panel.html", function(data){
	panelTemplate = jqtmpl.template("panel", data);
});

var DL_STATUS = exports.DL_STATUS = {
	"PENDING"	 : 0,
	"DOWNLOADING": 1,
	"UPLOADING"  : 2,
	"SUCCESS"	 : 3,
	"FAILURE"	 : 4
}

exports.handleReq = function(request, response, pathParts){
	var dropclient = request.session.data.client
	if(!dropclient){
		response.writeHead(302, { 'Location': '/'});
		response.end();
		return;
	}
	
	if(request.method === "POST"){
		var body = "";
		request.on("data", function (data) { body += data; });
		request.on("end", function () {
			var query = qs.parse(body);
			if(pathParts[1] === "add"){
				download = downloads.build({
					url : query.link,
					filename: query.filename,
		    		uid : request.session.data.uid,
		    		status: DL_STATUS.PENDING,
		    		oauthKey: request.session.data.accToken,
		    		oauthSecret:request.session.data.accSecret
		    	});
		    	download.setUser(request.session.data.dbObj);
		    	download.save().on("success", function(){
		    		response.writeHead(302, { "Location": "/panel" });
		    		response.end();
		    	});
		    	setTimeout(dlManager.checkForDownloads, 10);
				return;
			}
		});
		return;
	}
	
	if(pathParts[1] === "delete" || pathParts[1] === "retry"){
		downloads.find({ where : ["id=?",pathParts[2]] }).on("success", function(dl){
			if(!dl || dl.length === 0)
				return assets.show404(response);
			
			if(pathParts[1] === "delete"){
			    if(dl.status > 1)
			    	dl.destroy();
			}
			else 
				dl.status = 0;
			
			dl.save().on("success", function(){
		        response.writeHead(302, { "Location": "/panel" });
		        response.end();
		    });
		});
		return;
	}
	
	if(pathParts[1] === "clean")
		return downloads.findAll({ where : "status > 2" }).on("success", function(elems){
			elems.forEach(function(dl, i){
				dl.destroy();
			});
			downloads.sync().on("success", function(){
				response.writeHead(302, { "Location": "/panel" });
		        response.end();
			});
		});
	
	
	downloads.findAll({ where : { uid : request.session.data.uid }, sort: "desc" }).on("success",
	  function(downloads){
		response.writeHead(200, {"ContentType": "text/html"});
		response.end(jqtmpl.tmpl(panelTemplate, {
			downloads:downloads,
			email : request.session.data.dbObj.email
		}));
	}).on("failure", console.log);
}