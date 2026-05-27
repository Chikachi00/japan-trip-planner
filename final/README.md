# Final 日本旅行规划器

这是合并版目录，包含完整 Web、移动端和后端。

## 目录

- `backend/`：Node.js API，负责登录、地点数据和收藏数据库
- `web-app/`：React + TypeScript + Leaflet 地图 Web 应用
- `mobile-app/`：React Native / Expo 移动端应用

## 推荐运行顺序

先启动后端：

```bash
cd final/backend
npm run start
```

再启动 Web：

```bash
cd final/web-app
npm install
npm run dev
```

移动端：

```bash
cd final/mobile-app
npm install
npm run start
```

## 功能合并说明

- 原生版的数据读取、筛选、搜索逻辑被保留
- React 版升级为组件化状态管理
- TypeScript 版加入了 `Spot`、登录和 API 类型
- 地图版加入 Leaflet 和经纬度标记
- 登录数据库版由 `backend/data/db.json` 保存用户收藏
- React Native 版作为移动端独立入口，连接同一个后端 API
