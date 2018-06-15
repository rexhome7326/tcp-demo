const net = require('net');
const http = require("http");
const tcpServer = net.createServer().listen(5000, '127.0.0.1');
const TcpServerUtil = require('./utils/TcpServerUtil');

// 當前連線數
let currentConnectionCount = 0;
// 當前請求數量
let currentRequestCountForSecond = 0;
// 當前請求速率(s)
let currentRequestRate = 0;
// 總請求素量
let totalRequestCount = 0;
// 正在執行的數量
let ongoingRequestCount = 0;
// 做完的數量
let processedRequestCount = 0;
// 還在等待的數量
let remaingRequestCount = 0;

// sever 最大連線數
tcpServer.maxConnections = 20;

// server 收到 connection 的事件
tcpServer.on('connection', (socket) => {
  currentRequestCountForSecond++;
  totalRequestCount++;
  
  TcpServerUtil.initSocket(socket);
  
  TcpServerUtil.eventSocketOnData(socket, {
    startProcess: () => {
      // 開始執行時，正在執行的數量要加 1
      ongoingRequestCount++;
    },
    reqSuccess: () => {
      // 執行成功後，正在執行的數量要減 1
      ongoingRequestCount--;
    },
    reqFail: () => {
      // 執行失敗後，正在執行的數量要減 1
      ongoingRequestCount--;
    }
  });
  
  TcpServerUtil.eventSocketOnError(socket, {
    errorProcess: (err) => {
      console.log('socket process error', err.message, socket.name);
    }
  });

  TcpServerUtil.eventSocketOnEnd(socket, {
    endProcess: () => {
      // 做完的數量累加
      processedRequestCount++;
      console.log('end of socket', socket.name);
    }
  });
  
  console.log('socket connected', socket.name);
});

// server 啟動後監聽的事件
tcpServer.on('listening', function onListening(){
  console.log("Tcp Server startup");
  console.log("Header length: 13");
  console.log(tcpServer.address());
});

setInterval(() => {
  // 每秒近來多少請求
  currentRequestRate = currentRequestCountForSecond;
  currentRequestCountForSecond = 0;
  
  // 算出還有多少沒做
  remaingRequestCount = totalRequestCount - processedRequestCount;
  
  tcpServer.getConnections(function(error, count) {
    // 取得連線數
    currentConnectionCount = count;
  });
}, 5000);

// 給 web socket的 server 
const httpServer = http.createServer(function(request, response) {}).listen(5001, () => {
  console.log("Http Server startup");
  console.log(httpServer.address());
});

// 給 index.js 取得數據的方法
exports.getCurrentConnectionCount = () => currentConnectionCount;
exports.getCurrentRequestRate = () => currentRequestRate;
exports.getOngoingRequestCount = () => ongoingRequestCount;
exports.getProcessedRequestCount = () => processedRequestCount;
exports.getRemaingRequestCount = () => remaingRequestCount;
exports.resetRequestCount = () => {
  currentConnectionCount = 0;
  currentRequestCountForSecond = 0;
  currentRequestRate = 0;
  totalRequestCount = 0;
  ongoingRequestCount = 0;
  processedRequestCount = 0;
  remaingRequestCount = 0;
};

exports.server = httpServer;