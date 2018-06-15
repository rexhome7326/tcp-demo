const net = require('net');
const http = require('http');

// 往 api 的 http agent
const agent = new http.Agent({ 
  keepAlive: true, 
  keepAliveMsecs: 600000 , 
  maxSockets:30, 
  maxFreeSockets: 30
});

// header 的長度，與client 端必須一致
const getHeader = (num) => 'length:' + (Array(13).join(0) + num).slice(-13);

// 向 api server 發送請求
const sendRequest = (params) => {
  var options = {
    host: '127.0.0.1',
    port: 3000,
    path: '/?time='+encodeURIComponent(params.time),
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    agent: agent,
  };
  
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      const chunks = [];

      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        const heap = chunks.join('');
        const obj = JSON.parse(heap);
        resolve(obj);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
};

// 向 socket client 返回結果
const sendResponse = (client, data) => {
  const dataBuff =  Buffer.from(JSON.stringify(data));
  const header = getHeader(dataBuff.length);
  
  client.write(header);
  client.write(dataBuff);
};


const TcpServerUtil = {
	initSocket: (socket) => {
		socket.chunksList = [];
		socket.chunksLength = 0;
		socket.name = socket.remoteAddress + ':' + socket.remotePort;
	},
	eventSocketOnData: (socket, settings) => {
		socket.on('data', (chunk) => {
			const content = chunk.toString();
	    
	    if (content.indexOf('length:') === 0){
	      socket.chunksLength = parseInt(content.substring(7,20));
	      socket.chunksList = [chunk.slice(20, chunk.length)];
	    }
	    else {
	      socket.chunksList.push(chunk);
	    }
	    
	    const heap = Buffer.concat(socket.chunksList);
	    
	    if (heap.length >= socket.chunksLength) {
	      try {
	      	settings.startProcess();
	      	
	        const params = JSON.parse(heap.toString()); 
	        
	        sendRequest(params)
	          .then((data) => {
	            // API 返回成功
	            settings.reqSuccess();
	            sendResponse(socket, data);
	          })
	          .catch((err) => {
	            // API 返回錯誤
	            settings.reqFail();
	            sendResponse(socket, {error: err.message, code: 500});
	          })
	        
	      } catch (err) {
	        // JSON parse 返回錯誤
	        settings.reqFail();
	        sendResponse(socket, {error: err.message, code: 500});
	      }
	    }
	  });
	},
	eventSocketOnError: (socket, settings) => {
		socket.on('error', (err) => {
	    settings.errorProcess(err);
	  });
	},
	eventSocketOnEnd: (socket, settings) => {
		socket.on('end', () => {
	    settings.endProcess();
	  });
	}
};

module.exports = TcpServerUtil;