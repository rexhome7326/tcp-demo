const net = require('net');
const createPool = require('../utils/createPoolUtil');
const getHeader = (num) => 'length:' + (Array(13).join(0) + num).slice(-13);
const poolMap = {}

function TcpClientService(host, port) {
	let connectHost = host;
	let connectPort = port;
	
	let key = connectHost+':'+connectPort;
	
	// 如果 connection pool 沒建立，就先建立 pool
	if (!poolMap[key]) {
		poolMap[key] = createPool({
		  port: connectPort,
		  host: connectHost,
		  options: {
		    min: 0,
		    max: 10
		  }
		});
	}
	
	this.getHost = () => connectHost;
	
	this.getPort = () => connectPort;
}

TcpClientService.TIMEOUT = 5000;

TcpClientService.prototype.send = function (params) {
	let key = this.getHost()+':'+this.getPort();
	let pool = poolMap[key];
	
	return pool.acquire()
  	.then((socket) => {
  		return new Promise ((resolve, reject) => {
  			socket.chunksList = [];
				socket.chunksLength = 0;
				
				// 先清吊掛在這個socket身上前一筆數據的事件
  			socket.removeAllListeners('error');
			  socket.removeAllListeners('data');
			  socket.removeAllListeners('timeout');
			  
			  // socket timeout 時間
				socket.setTimeout(TcpClientService.TIMEOUT);
				
				// socket 取的資料時
				socket.on('data', (chunk) => {
				  let content = chunk.toString();
				  
				  if (content.indexOf('length:') === 0){
			      socket.chunksLength = parseInt(content.substring(7,20));
			      socket.chunksList = [chunk.slice(20, chunk.length)];
			    }
			    else {
			      socket.chunksList.push(chunk);
			    }
			    
			    let heap = Buffer.concat(socket.chunksList);
			 
			    if (heap.length >= socket.chunksLength) {
			    	pool.release(socket);
			      try {
			        const json = JSON.parse(heap.toString());
			        const result = {response: json, code: 200}
			        resolve(result);
			      } catch (err) {
			      	const result = {error: '1:'+err.message, code: 500}
			        reject(result);
			      }
			    }
				});
				
				// socket 連線有問題要幹麻
				socket.on('error', (err) => {
					pool.destroyed(socket);
					const result = {error: '2:'+err.message, code: 500}
			    reject(result);
				});
				
				// socket timeout 要幹麻
				socket.on('timeout', () => {
					pool.destroy(socket);
				  const result = {error: '3:'+'socket timeout', code: 500}
			    reject(result);
				});
				
			  let dataBuff = Buffer.from(JSON.stringify(params));
			  let header = getHeader(dataBuff.length);
			  
			  socket.write(header);
			  socket.write(dataBuff);
  		});
  	})
  	.catch(function(err) {
  		return {error: '4:'+err.message, code: 500};
	  });
};

module.exports = TcpClientService;