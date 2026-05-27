# 登录和数据库版本

这是一个最小后端版本，使用 Node.js 原生 `http` 模块实现接口，并用 `data/db.json` 作为演示数据库。

## 运行

```bash
cd login-db-version
npm run start
```

打开：

```text
http://localhost:3000
```

## 功能

- 注册账号
- 登录账号
- 按用户保存收藏
- 收藏数据写入 `data/db.json`
- 前端通过 `fetch` 调用后端 API

## 说明

这是学习用的最小版本，不适合作为真实生产登录系统。真实项目需要更完整的密码策略、数据库、会话过期、HTTPS 和输入校验。
