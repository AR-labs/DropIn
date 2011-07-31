var root, imprint;
require("./assets").getAsset("/html/index.html", function(data){ root = data; });
require("./assets").getAsset("/html/imprint.html", function(data){ imprint = data; });

exports.handleReq = function(request, response, pathParts){
	response.writeHead(200);
	response.end(pathParts[0] === "imprint.html" ? imprint : root);
}