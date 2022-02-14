module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'http://192.168.11.28:8081/ipfs/', //服务端地址
                ws: true,  //如果要代理 websockets，配置这个参数
                changeOrigin: true, // 允许跨域
                pathRewrite: {
                    '^/api': ''   // 标识替换，使用 '/api' 代替真实的接口地址
                }
            }
        }
    }
}