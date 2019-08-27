# notification

[![Alita](https://img.shields.io/badge/alitajs-notification-blue.svg)](https://github.com/alitajs/notification)
[![Build Status](https://travis-ci.com/alitajs/notification.svg?branch=master)](https://travis-ci.com/alitajs/notification)
[![Coverage Status](https://coveralls.io/repos/github/alitajs/notification/badge.svg?branch=master)](https://coveralls.io/github/alitajs/notification?branch=master)

小而美的通知中心，适用于站内信、评论区等场景。

## Feature

- 类即时通讯应用架构，支持多设备消息同步与漫游
- 支持类群聊模式，可根据实际场景手动切换读写扩散模型
- 支持 MySQL / TableStore (WIP)
- 部分主键常驻 Redis 实现严格自增
- 分会话未读消息数量统计
- 支持已发出消息撤回，可类比自行实现消息内容更新等功能
- 钩子函数拓展业务逻辑，例如写入消息成功后执行发送邮件、消息推送等任务
