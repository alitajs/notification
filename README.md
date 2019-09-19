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

## Usage

### Config

绝大部分配置可在 [config/config.default.ts](https://github.com/alitajs/notification/blob/master/config/config.default.ts) 中找到，可参考 [Egg - 配置](https://eggjs.org/zh-cn/basics/config.html)。

### Dependencies

- [NodeJS@~10.X.X](https://nodejs.org/dist/latest-v10.x/)
- [Redis](https://redis.io/download)
- [MySQL](https://dev.mysql.com/downloads/mysql/) / [MariaDB](https://downloads.mariadb.org/mariadb)
- Other nodejs modules

首先需要安装 Redis 、 Mysql 或 MariaDB 、 NodeJS 与 npm / yarn ，NodeJS 官方安装包通常会自带 npm ，你也可以使用 yarn 代替 npm 进行后续操作。

> Windows 平台上 `yarn run cov` 无法正常执行，请使用 `npm run cov` 代替。

#### 开发环境

```bash
# Ubuntu
$ git clone https://github.com/alitajs/notification.git
$ cd notification
$ npm install
$ apt-get install nodejs
$ sh ./scripts/install/mariadb.sh
$ sh ./scripts/install/redis.sh
$ npm run start:mysql && npm run start:redis && npm run dev:migrate
$ npm run dev
```

#### 生产环境

```bash
# Ubuntu
$ git clone https://github.com/alitajs/notification.git
$ cd notification
$ npm install --production
$ apt-get install nodejs
$ sh ./scripts/install/mariadb.sh
$ sh ./scripts/install/redis.sh
$ npm run start:mysql && npm run start:redis && npm run start:migrate
$ npm run restart:tsc
```

## Framework

### Database

![image](https://user-images.githubusercontent.com/32428655/65237507-5a722a80-db0d-11e9-9df2-68e25cba36e4.png)
