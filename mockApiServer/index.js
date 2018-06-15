const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const app = express();
const server = http.createServer(app).listen(3000, '127.0.0.1');

process.title = 'mockApiServer';

app.use( cookieParser() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({extended: true}) );
app.get('/', (req, res) => {
	const time = getRandomInt(1,1000) * 10;
	const result = { 
    response: "HI ~ good to see you, now the time is [ " + req.query.time + " ]"
  };
  
  // 拿到的參數跟預計返回的時間
	console.log(req.query, time);
	
	setTimeout(() => {
  	res.json(result);
  }, time);
});

server.on('listening', function onListening(){
	console.log("Api Server startup");
	console.log(server.address());
});
server.on('error', function onError(error){
	if (error.syscall !== 'listen') {
		throw error;
	}

	switch (error.code) {
		case 'EACCES':
			console.error('Port 3000 requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error('Port 3000 is already in use');
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