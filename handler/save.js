exports.handleReq = function(request, response, pathParts){
	if(pathParts[1] === "secret"){
		request.session.data["token_secret"] = pathParts[2];
		response.writeHead(200, {"Content-Type": "text/javascript"});
		response.end('console.log("secret saved (' + pathParts[2] + ')")'); return;
	}
};