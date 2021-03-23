const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://localhost',
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