const { createProxyMiddleware } = require('http-proxy-middleware');

require('dotenv').config();

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_PROXY_TARGET,
      // target: 'https://localhost:5000',
      changeOrigin: true,
      secure: false,
      onProxyReq: (proxyReq, req) => {
        proxyReq.setHeader('Access-Control-Allow-Origin', '*')
        proxyReq.setHeader('Access-Control-Allow-Headers', 'X-Requested-With')
        proxyReq.setHeader('Accept', 'application/json')
      }
    })
  );
};