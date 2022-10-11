module.exports = function (server) {
  // eslint-disable-next-line global-require
  const io = require('socket.io')(server, { cors: true });
  io.on('connection', (socket) => {
    console.log('连接成功');

    socket.on('browserSend', (data) => {
      console.log('浏览器发的为：', data);

      const test = '服务器发的消息';
      io.emit('serverSend', test);
    });
  });
};
