var downloads = require("./tables").downloads,
	DL_STATUS = require("./handler/panel").DL_STATUS,
	settings = require("./settings"),
	url = require("url"),
	fs = require("fs"),
	http = require("http"),
	DropboxClient = require("dropbox").DropboxClient,
	downloadCount = 0,
	maxDLs = 1e2;

//init
downloads.findAll({where: ["status = ? OR status = ?", DL_STATUS.DOWNLOADING, DL_STATUS.UPLOADING]}).on("success", function(dls){
	dls.forEach(addDownload);
	checkForDownloads();
});

var addDownload = exports.addDownload = function(download){
	download.status = DL_STATUS.DOWNLOADING;
	download.save();
	downloadCount++;
	
	//start download
	if(download.url.indexOf("youtube.com/watch") > 0){
		//ytdl
	}
	
	var link = url.parse(download.url),
		client = http.createClient(80, link.host),
		req = client.request("GET", link.href, { 'host': link.host}),
		dropClient, dropConnection, 
		tmpFileName = __dirname + "/tmp/" + download.id + " - " + download.filename;
	
	
	req.addListener('response', function (con) {
		if(con.headers['content-length'] > 375e5){
			//file is to large
			download.status = DL_STATUS.FAILURE;
			download.save();
			return req.abort();
		}
		var file = fs.createWriteStream(tmpFileName, {'flags': 'a'});
		
		con.addListener('data', function (chunk) {
			file.write(chunk, "binary");
		});
		con.addListener('end', function () {
			file.end();
			if(con.statusCode !== 200){
				download.status = DL_STATUS.FAILURE; download.save();
				downloadCount--;
				return;
			}
			
			download.status = DL_STATUS.UPLOADING;
			download.save();
			
			//create a connection to dropbox
			dropClient = new DropboxClient(settings.dropbox.consumer_token,
	 		 						 settings.dropbox.consumer_secret,
	 		 						 download.oauthKey, 
	 		 						 download.oauthSecret);
			
			fs.readFile(tmpFileName, function (err, data) {
				if (err) return cb(err);
					dropClient.put(data.toString("binary"), download.filename, 
					  "DropIn", function(err){
						err && console.log("err", err);
						
						if(err) download.status = DL_STATUS.FAILURE;
						else download.status = DL_STATUS.SUCCESS;
						download.save();
						
						downloadCount--;
						checkForDownloads();
						
						fs.unlink(tmpFileName);
					});
			});
		});
	});
	req.end();
}

var checkForDownloads = exports.checkForDownloads = function(){
	if(downloadCount < maxDLs){
		downloads.findAll({
			where: "status=" + DL_STATUS.PENDING,
			limit: (maxDLs - downloadCount)
		}).on("success",function(dls){
			if(dls.length === 0) return;
			dls.forEach(addDownload);
			checkForDownloads();
		})
	}
}

setInterval(checkForDownloads, 1e3);