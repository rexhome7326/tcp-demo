const io = require('socket.io');
const server = require('./server.js').server;
const getTotalRequestCount = require('./routes').getTotalRequestCount;
const getProcessedRequestCount = require('./routes').getProcessedRequestCount;
const getRemaingRequestCount = require('./routes').getRemaingRequestCount;
const resetRequestCount = require('./routes').resetRequestCount;

process.title = 'webServer';

const socketServer = io.listen(server);

// 與 web socket 建立連線時 
socketServer.sockets.on('connection', function(socket) {
  console.log('connected');
  
  // 重置所有數據
  resetRequestCount();
  
  // 一秒發送一次
  setInterval(function() {
  	let totalRequestCount = getTotalRequestCount();
		let processedRequestCount = getProcessedRequestCount();
		let remaingRequestCount = getRemaingRequestCount();
  	
    socket.emit('message', {
      'totalRequestCount': totalRequestCount >= 0 ? totalRequestCount : 0,
      'processedRequestCount': processedRequestCount >= 0 ? processedRequestCount : 0,
      'remaingRequestCount': remaingRequestCount >= 0 ? remaingRequestCount : 0,
    });
  }, 1000);
});