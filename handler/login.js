var url = require('url'),
	settings = require("../settings"),
	users = require("../tables").users,
	assets = require("./assets"),
	DropboxClient = require("dropbox").DropboxClient,
	OAuth = require("oauth").OAuth,
	oauth = new OAuth(
		"https://api.dropbox.com/0/oauth/request_token",
		"https://api.dropbox.com/0/oauth/access_token",
		settings.dropbox.consumer_token,
		settings.dropbox.consumer_secret,
		"1.0", null, "HMAC-SHA1"
	);

require("./assets").getAsset("/html/login.html", function(data){ page = data; });

exports.handleReq = function(request, response, pathParts){
	if(pathParts[0] === "logout"){
		request.session.data = {};
		response.writeHead(302, { 'Location': '/'});
		response.end(); return;
	}
	if(pathParts[0] === "auth"){
		oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
			if(error) return assets.show404(response);
			request.session.data.oauth_token = oauth_token;
			request.session.data.oauth_token_secret = oauth_token_secret;
			response.writeHead(302, {
				'Location': 'https://www.dropbox.com/0/oauth/authorize?oauth_token='
					+ oauth_token + "&oauth_callback=" + settings.app.url + "/login"
			});
			response.end(); return;
		});
		return;
	}
	
	//pathParts[0] === "login"
	var query = url.parse(request.url, true).query;
	if(!query || !query.oauth_token || query.oauth_token !== request.session.data.oauth_token)
		return assets.show404(response);
	
	oauth.getOAuthAccessToken(request.session.data.oauth_token,
	 request.session.data.oauth_token_secret,
	 function(error, oauth_access_token, oauth_access_token_secret, results2) {
	 	if(error) return assets.show404(response);
	 	request.session.data = {
	 		uid : query.uid,
	 		accToken : oauth_access_token,
	 		accSecret: oauth_access_token_secret,
	 		client : new DropboxClient(settings.dropbox.consumer_token,
	 								   settings.dropbox.consumer_secret,
	 								   oauth_access_token, 
	 								   oauth_access_token_secret)
	 	};
	 	users.find(query.uid).on("success", function(user){
	 		if(user !== null){
	 			request.session.data.dbObj = user;
	 			response.writeHead(302, { 'Location': '/panel'});
				response.end(); return;
	 		}
	 		request.session.data.client.getAccountInfo(function(err, data){
	 			if(err) return assets.show404(response);
	 			request.session.data.dbObj = users.build({
	 				uid  : data.uid,
	 				email: data.email,
	 				apikey:Math.floor(Math.random() * 1e11)
	 			}).save().on("success", function(){
	 				response.writeHead(302, { 'Location': '/panel'});
					response.end(); return;
	 			});
	 		});
	 	}).on("failure", function(err){
	 		response.writeHead(500); resonse.end();
	 		console.log(err);
	 	});;
	 });
};