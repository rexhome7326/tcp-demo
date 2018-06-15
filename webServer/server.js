const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const routes = require('./routes').routes;
const app = express();
const server = http.createServer(app).listen(4000, '127.0.0.1');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use( cookieParser() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({extended: true}) );
app.use( express.static(__dirname + '/public') );
app.use( routes );

server.on('listening', function onListening(){
	console.log("Web Server startup");
	console.log(server.address());
});

server.on('error', function onError(error){
	if (error.syscall !== 'listen') {
		throw error;
	}

	switch (error.code) {
		case 'EACCES':
			console.error('Port 4000 requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error('Port 4000 is already in use');
			process.exit(1);
			break;
		default:
			console.log('Get error');
			console.log(error);
			throw error;
	}
});

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});

exports.server = server;