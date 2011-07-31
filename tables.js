var settings = require("./settings"),
	Sequelize = require("sequelize"),
	sequelize= new Sequelize(settings.db.table, settings.db.user, settings.db.pw, {
		host : settings.db.host,
		port : settings.db.port,
		logging: false
	});

var users = exports.users = sequelize.define("User", {
	uid : { type : Sequelize.INTEGER, primaryKey: true, allowNull: false, unique:true },
	email : Sequelize.STRING,
	apikey: Sequelize.INTEGER
});

var downloads = exports.downloads = sequelize.define("Download", {
	url: 		{ type:Sequelize.STRING, allowNull: false },
	filename:	Sequelize.STRING,
	status: 	Sequelize.INTEGER,
	uid:		Sequelize.INTEGER,
	oauthKey:	Sequelize.STRING,
	oauthSecret:Sequelize.STRING
});

downloads.hasOne(users);

sequelize.sync({force:false});