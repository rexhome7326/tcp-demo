const express = require('express');
const TcpClientService = require('../services/TcpClientService');
const routes = express.Router();

let totalRequestCount = 0;
let processedRequestCount = 0;
let remaingRequestCount = 0;

// 假設這是 client 打的 api
routes.get( '/api/showtime', (req, res, next) => {
	totalRequestCount++;
	
	const tcpClientService = new TcpClientService('127.0.0.1', 5000);

	tcpClientService.send(req.query)
		.then((result) => {
			res.status(result.code).json(result);
			processedRequestCount++;
			remaingRequestCount = totalRequestCount - processedRequestCount;
		})
		.catch((error) => {
			res.status(error.code).json(error);
			processedRequestCount++;
			remaingRequestCount = totalRequestCount - processedRequestCount;
		});
});

// 顯示頁面用
routes.get( '*', (req, res, next) => {
	res.render('index.ejs');
});

// 給 index.js 取得數據的方法
exports.getTotalRequestCount = () => totalRequestCount;
exports.getProcessedRequestCount = () => processedRequestCount;
exports.getRemaingRequestCount = () => remaingRequestCount;
exports.resetRequestCount = () => {
	totalRequestCount = 0;
	processedRequestCount = 0;
	remaingRequestCount = 0;
};
exports.routes = routes;

