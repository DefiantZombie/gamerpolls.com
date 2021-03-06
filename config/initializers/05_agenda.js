var nconf = require('nconf');
var Agenda = require('agenda');
var twitch = require('node-twitch-api');
var agenda = new Agenda({
	db: {
		address: nconf.get('MONGO_DB')
	}
});
var Poll = require('../../app/models/poll');
var moment = require('moment');

module.exports = function () {
	var self = this;
	// Remove polls that have been closed for 2+ weeks.
	agenda.define('remove closed polls', function (job, done) {
		Poll.find({
				created: {
					$lte: moment.utc().subtract(14, 'weeks')
				}
			},
			function (err, docs) {
				if (err) {
					return done(err);
				}
				docs.forEach(function (doc) {
					doc.remove(function (err, doc) {
						if (err) {
							return done(err);
						}

						console.log('Poll removed: ' + JSON.stringify({
							_id: doc._id,
							closeTime: doc.closeTime,
							creator: doc.creator.username
						}));
					});
				});
				done();
			}
		);
	});

	agenda.define('check twitch api status', function (job, done) {
		// Twitch API Status
		twitch.api(
			'/', {
				clientID: nconf.get('authkeys:twitchtv:clientID')
			},
			function (err, statusCode, response) {
				if (err) {
					console.log(err);
				}
				if (statusCode !== 200) {
					self.locals.twitchStatus = false;
				}
				else {
					self.locals.twitchStatus = true;
				}

				done();
			}
		);
	});

	agenda.on('ready', function () {
		agenda.every('1 day', 'remove closed polls');
		agenda.every('2 minutes', 'check twitch api status');
		agenda.start();
	});
};
