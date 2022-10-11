const { ChatModel } = require('../model/modules');

module.exports = function (server) {
  // eslint-disable-next-line global-require
  const io = require('socket.io')(server, { cors: true });
  io.on('connection', (socket) => {
    console.log('有一个客户端连接成功~~~~~~');

    socket.on('browserSend', ({ from, to, content }) => {
      console.log('浏览器发的为：', { from, to, content });
      // from_to 与 to_from 保持一致
      const chat_id = [from, to].sort().join('_');
      const createDate = Date.now();

      // 处理数据
      ChatModel.create({
        from, to, content, chat_id, createDate,
      }, (error, chatMsg) => {
        // socket.emit() 向当前客户端发
        // 向所有人法
        io.emit('serverSend', chatMsg);
      });
    });
  });
};
