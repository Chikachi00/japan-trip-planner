# Japan Trip Planner / 日本旅行规划器

一个从原生前端逐步演进到完整应用的小项目。项目包含多个学习版本，并提供一个整合后的 `final/` 版本，方便对比不同技术栈的实现方式。

## 项目目标

这个仓库不是单一版本 Demo，而是一条循序渐进的练习路线：

- 先用原生 HTML/CSS/JavaScript 实现最小功能
- 再迁移到 React
- 再加入 TypeScript
- 再扩展到 React Native App
- 再加入地图 API
- 最后加入登录、数据库和完整前后端结构

## 目录结构

```text
japan-trip-planner/
├── index.html              原生 HTML/CSS/JS 版本
├── style.css
├── app.js
├── spots.json
├── react-version/          React CDN 版本
├── typescript-version/     Vite + TypeScript 版本
├── react-native-app/       React Native / Expo 版本
├── map-api-version/        Leaflet + OpenStreetMap 地图版本
├── login-db-version/       Node.js 登录和 JSON 数据库版本
└── final/                  合并后的最终版本
```

## Final 合并版

推荐重点看 `final/`。它把前面几个版本的能力整合在一起：

```text
final/
├── backend/      Node.js API，负责登录、地点数据和收藏数据库
├── web-app/      React + TypeScript + Leaflet 地图 Web 应用
├── mobile-app/   React Native / Expo 移动端应用
└── README.md
```

合并版包含：

- 城市筛选
- 关键词搜索
- 地点收藏
- Leaflet 地图标记
- 用户注册和登录
- 服务端保存收藏数据
- Web 端和移动端共用同一个后端 API

## 运行 Final 版本

### 1. 启动后端

```bash
cd final/backend
npm run start
```

后端默认运行在：

```text
http://localhost:3001
```

### 2. 启动 Web App

新开一个终端：

```bash
cd final/web-app
npm install
npm run dev
```

然后按终端提示打开 Vite 地址，通常是：

```text
http://localhost:5173
```

### 3. 启动移动端 App

```bash
cd final/mobile-app
npm install
npm run start
```

如果使用真机 Expo Go，需要把 `final/mobile-app/App.tsx` 中的 API 地址从：

```text
http://localhost:3001
```

改成电脑在局域网中的 IP，例如：

```text
http://192.168.1.10:3001
```

## 运行其他学习版本

### 原生版本

```bash
python -m http.server 8000
```

打开：

```text
http://localhost:8000
```

### React 版本

```bash
python -m http.server 8000
```

打开：

```text
http://localhost:8000/react-version/
```

### TypeScript 版本

```bash
cd typescript-version
npm install
npm run dev
```

### React Native 版本

```bash
cd react-native-app
npm install
npm run start
```

### 地图 API 版本

```bash
python -m http.server 8000
```

打开：

```text
http://localhost:8000/map-api-version/
```

### 登录数据库版本

```bash
cd login-db-version
npm run start
```

打开：

```text
http://localhost:3000
```

## 技术点

- 原生 DOM 操作
- `fetch` 读取 JSON 数据
- `localStorage` 本地收藏
- React 状态管理
- TypeScript 类型定义
- React Native 移动端组件
- Leaflet 地图 API
- Node.js 原生 HTTP 服务
- JSON 文件模拟数据库
- 注册、登录和用户收藏接口

## 学习建议

建议按这个顺序阅读：

1. 根目录原生版本：理解最基础的页面、数据和交互
2. `react-version/`：理解 React 组件和 state
3. `typescript-version/`：理解类型如何约束数据结构
4. `map-api-version/`：理解地图标记和经纬度数据
5. `login-db-version/`：理解前后端 API 和用户数据保存
6. `final/`：看完整项目如何组织

## 说明

这个项目偏学习用途，登录和数据库部分是最小实现，不适合直接作为生产系统使用。真实项目还需要更完整的认证、安全校验、数据库设计、错误处理和部署配置。
