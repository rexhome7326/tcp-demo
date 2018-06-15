const net = require('net');
const genericPool = require('generic-pool');

module.exports = function createPool(conifg) {
  let options = Object.assign({
    // 舊連線先用
    fifo: true,  
    // 優先順序                           
    priorityRange: 1, 
    // 驗證連線是否可用
    testOnBorrow: true,
    // 練線 timeout 時間
    // acquireTimeoutMillis: 10 * 1000,
    // 自動開啟連線或釋放連線
    autostart: true,
    // 最小連線數
    min: 10,
    // 最大連線數
    max: 0,
  }, conifg.options);
  
  const factory = {
    // 建立連線
    create: function () {
      return new Promise((resolve, reject) => {
        let socket = new net.Socket();
        
        socket.setKeepAlive(true);
        
        socket.connect(conifg.port, conifg.host);
        
        // 連接上
        socket.on('connect', () => {
          console.log('socket_pool', conifg.host, conifg.port, 'connect' );
          resolve(socket);
        });
        
        // 連接關閉
        socket.on('close', (err) => {
          console.log('socket_pool', conifg.host, conifg.port, 'close', err);
        });
        
        // 連接發生錯誤
        socket.on('error', (err) => {
          console.log('socket_pool', conifg.host, conifg.port, 'error', err);
          reject(err);
        });
      });
    },
    // 銷毀連線
    destroy: function (socket) {
      return new Promise((resolve) => {
        socket.destroy();
        resolve();
      });
    },
    // 驗證連線
    validate: function (socket) {
      return new Promise((resolve) => {
        if (socket.destroyed || !socket.readable || !socket.writable) {
          return resolve(false);
        } else {
          return resolve(true);
        }
      });
    }
  };
  
  // pool 管理交給 genericPool
  const pool = genericPool.createPool(factory, options);
  
  // 建立失敗時
  pool.on('factoryCreateError', (err) => {
    const clientResourceRequest = pool._waitingClientsQueue.dequeue();
    if (clientResourceRequest) {
      clientResourceRequest.reject(err);
    }
  });
  
  return pool;
};