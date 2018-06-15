const io = require('socket.io');
const server = require('./server.js').server;
const getCurrentConnectionCount = require('./server').getCurrentConnectionCount;
const getCurrentRequestRate = require('./server').getCurrentRequestRate;
const getOngoingRequestCount = require('./server').getOngoingRequestCount;
const getProcessedRequestCount = require('./server').getProcessedRequestCount;
const getRemaingRequestCount = require('./server').getRemaingRequestCount;
const resetRequestCount = require('./server').resetRequestCount;

process.title = 'tcpServer';

const socketServer = io.listen(server);

// 與 web socket 建立連線時 
socketServer.sockets.on('connection', function(socket) {
  console.log('connected');
  
  // 重置所有數據
  resetRequestCount();
  
  // 一秒發送一次
  setInterval(function() {
  	let currentConnectionCount = getCurrentConnectionCount();
		let currentRequestRate = getCurrentRequestRate();
		let ongoingRequestCount = getOngoingRequestCount();
		let processedRequestCount = getProcessedRequestCount();
		let remaingRequestCount = getRemaingRequestCount();
  	
    socket.emit('message', {
      'currentConnectionCount': currentConnectionCount >= 0 ? currentConnectionCount : 0,
      'currentRequestRate': currentRequestRate >= 0 ? currentRequestRate : 0,
      'ongoingRequestCount': ongoingRequestCount >= 0 ? ongoingRequestCount : 0,
      'processedRequestCount': processedRequestCount >= 0 ? processedRequestCount : 0,
      'remaingRequestCount': remaingRequestCount >= 0 ? remaingRequestCount : 0,
    });
  }, 1000);
});