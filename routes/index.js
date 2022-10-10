/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const express = require('express');
const md5 = require('blueimp-md5');
const { UserModel } = require('../model/modules');

const router = express.Router();

// 注册
router.post('/register', (req, res) => {
  const { username, password, userType } = req.body;

  UserModel.findOne({ username }, (error, user) => {
    if (user) {
      res.send({ code: 1, msg: '用户已存在' });
      return;
    }

    UserModel.create({ username, userType, password: md5(password) }, (err, saveUser) => {
      const data = {
        username,
        userType,
        _id: saveUser._id,
      };

      res.cookie('user_id', saveUser._id, { maxAge: 1000 * 60 * 60 * 24 });
      res.send({ code: 0, data, msg: '注册成功' });
    });
  });
});

// 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  UserModel.findOne({ username, password: md5(password) }, (error, user) => {
    if (user) {
      res.cookie('user_id', user._id, { maxAge: 1000 * 60 * 60 * 24 });
      const data = user;
      data.password = '*****';
      res.send({ code: 0, data, msg: '登录成功' });
      return;
    }
    res.send({ code: 1, msg: '用户名或密码错误' });
  });
});

// 保存用户信息
router.post('/update', (req, res) => {
  const { user_id } = req.cookies;
  if (!user_id) {
    res.send({ code: 1, msg: '请先登录' });
    return;
  }
  const user = req.body;
  UserModel.findByIdAndUpdate({ _id: user_id }, user, (error, oldUser) => {
    if (!oldUser) {
      res.clearCookie('user_id');
      res.send({ code: 1, msg: '请先登录' });
    } else {
      const { _id, userType, username } = oldUser;
      const data = {
        _id, username, userType, ...user,
      };
      res.send({ code: 0, data, msg: '信息保存成功' });
    }
  });
});

// 获取用户信息-根据cookie里面的 user_id
router.get('/getUserFormCookie', (req, res) => {
  const { user_id } = req.cookies;
  if (!user_id) {
    res.send({ code: 1, msg: '请先登录' });
    return;
  }
  UserModel.findOne({ _id: user_id }, (error, oldUser) => {
    const user = oldUser;
    if (user === null) {
      res.send({ code: 1, msg: '无效cookie' });
      return;
    }
    user.password = '***';
    res.send({ code: 0, data: user });
  });
});

// 获取用户列表
router.get('/userList', (req, res) => {
  const { userType } = req.query;

  UserModel.find({ userType }, (error, users) => {
    if (error) {
      res.send({ code: 1, msg: '服务器开小差了' });
      return;
    }
    res.send({ code: 0, data: users });
  });
});

module.exports = router;
