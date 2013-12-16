var express = require('express');
var poweredBy = require('connect-powered-by');
var util = require('util');
var passport = require('passport');
var fs = require('fs');
var path = require('path');

module.exports = function() {
	this.datastore(require('locomotive-mongoose'));

	// Template stuff.
	this.set('views', __dirname + '/../../app/views');
	this.set('view engine', 'html');
	this.engine('html', require('hogan-express'));
	this.format('html', { extension: '.html' });

	var partials = {};
	var layout = fs.readdirSync(__dirname + '/../../app/views/_layout');

	layout.forEach(function (filename) {
		filename = path.basename(filename, '.html');
		partials['layout/' + filename] = '_layout/' + filename
	});

	this.set('layout', 'layout');
	this.set('partials', partials);

	// Middleware.
	this.use(poweredBy(null));
	this.use(express.logger());
	this.use(express.favicon());
	this.use('/js', express.static(__dirname + '/../../node_modules/socket.io/node_modules/socket.io-client/dist'));
	this.use(express.static(__dirname + '/../../public'));
	this.use(express.urlencoded());
	this.use(express.json());
	this.use(express.cookieParser());
	this.use(express.methodOverride());
	this.use(express.session({ secret: 'keyboard cat' }));
	this.use(passport.initialize());
	this.use(passport.session());
	this.use(require(__dirname + '/../../app/libs/locals'));
	this.use(this.router);
};