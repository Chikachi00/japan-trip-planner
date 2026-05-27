# Japan Trip Planner / 日本旅行规划器

这是一个围绕“日本旅行地点规划”的前端到全栈练习项目。仓库里保留了多个阶段版本，方便从最简单的原生页面一路学习到 React、TypeScript、React Native、地图 API、登录和数据库。

如果你只想看最终成果，直接看 `final/`。如果你想按学习路线理解项目，就从根目录的原生版本开始看。

## 项目能做什么

核心功能包括：

- 从地点数据中读取日本旅行目的地
- 按城市筛选地点
- 按关键词搜索地点
- 收藏想去的地点
- 在地图上显示地点位置
- 注册和登录用户
- 把不同用户的收藏保存到服务端数据库
- 提供 Web 端和 React Native 移动端两个入口

## 版本总览

| 目录 | 技术栈 | 主要目的 | 是否推荐初学者先看 |
| --- | --- | --- | --- |
| 根目录 | HTML/CSS/JavaScript | 最小可用版本，理解 DOM、JSON、筛选、搜索、收藏 | 是 |
| `react-version/` | React CDN | 把原生 DOM 操作迁移成 React state | 是 |
| `typescript-version/` | Vite + TypeScript | 给地点数据和 DOM 操作加入类型 | 是 |
| `react-native-app/` | React Native / Expo | 做一个移动端 App 版本 | 进阶 |
| `map-api-version/` | Leaflet + OpenStreetMap | 给地点加入经纬度并显示地图标记 | 是 |
| `login-db-version/` | Node.js + JSON 数据库 | 加入注册、登录、服务端收藏 | 进阶 |
| `final/` | React + TypeScript + Leaflet + Node.js + React Native | 合并后的完整版本 | 最终重点 |

## 目录结构

```text
japan-trip-planner/
├── index.html
├── style.css
├── app.js
├── spots.json
├── react-version/
├── typescript-version/
├── react-native-app/
├── map-api-version/
├── login-db-version/
└── final/
    ├── backend/
    ├── web-app/
    └── mobile-app/
```

根目录的 `index.html`、`style.css`、`app.js`、`spots.json` 是最早的原生版本。后面的每个文件夹都是在这个基础上做出的一个独立版本。

## Final 合并版

`final/` 是目前最完整的版本，结构如下：

```text
final/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── data/
│       ├── db.json
│       └── spots.json
├── web-app/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── style.css
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── mobile-app/
    ├── App.tsx
    ├── app.json
    ├── package.json
    └── tsconfig.json
```

### Final 版架构

```text
Web App                  Mobile App
React + TypeScript       React Native / Expo
        \                /
         \              /
          v            v
        Backend API, http://localhost:3001
        Node.js server.js
              |
              v
        data/db.json
        data/spots.json
```

### Final 版包含的能力

- `backend/` 提供 API
- `backend/data/spots.json` 保存地点数据
- `backend/data/db.json` 模拟数据库，保存用户和收藏
- `web-app/` 使用 React + TypeScript 写 Web 页面
- `web-app/` 使用 Leaflet 显示地图
- `mobile-app/` 使用 React Native 写移动端界面
- Web 和移动端共用同一套后端 API

## 快速运行 Final Web 版

建议先跑 `final/`，因为它是功能最完整的版本。

### 1. 启动后端

在第一个终端中运行：

```bash
cd final/backend
npm run start
```

看到类似输出即可：

```text
Final backend running at http://localhost:3001
```

后端接口地址是：

```text
http://localhost:3001
```

### 2. 启动 Web App

在第二个终端中运行：

```bash
cd final/web-app
npm install
npm run dev
```

然后打开 Vite 提示的地址，通常是：

```text
http://localhost:5173
```

### 3. 在页面中使用

打开 Web 页面后，可以按这个流程试用：

1. 输入用户名和密码
2. 点击“注册”
3. 再点击“登录”
4. 使用城市下拉框筛选地点
5. 在搜索框输入关键词，例如“寺庙”“夜景”“大阪”
6. 点击地点卡片上的“收藏”
7. 刷新页面后重新登录，收藏会从后端读取

## 运行 Final Mobile App

先保证后端已经启动：

```bash
cd final/backend
npm run start
```

再启动移动端：

```bash
cd final/mobile-app
npm install
npm run start
```

如果使用浏览器预览 Expo Web，可以运行：

```bash
npm run web
```

如果使用真机 Expo Go，需要注意：手机里的 `localhost` 指的是手机自己，不是你的电脑。所以要把 `final/mobile-app/App.tsx` 里的：

```text
http://localhost:3001
```

改成电脑在局域网中的 IP，例如：

```text
http://192.168.1.10:3001
```

## 后端 API 说明

Final 后端默认端口是 `3001`。

| 方法 | 路径 | 作用 | 是否需要登录 |
| --- | --- | --- | --- |
| `GET` | `/api/spots` | 获取所有地点 | 否 |
| `POST` | `/api/register` | 注册用户 | 否 |
| `POST` | `/api/login` | 登录用户并返回 token | 否 |
| `GET` | `/api/me` | 获取当前用户信息 | 是 |
| `GET` | `/api/favorites` | 获取当前用户收藏 | 是 |
| `POST` | `/api/favorites` | 添加收藏 | 是 |
| `DELETE` | `/api/favorites/:spotId` | 删除收藏 | 是 |

登录后，前端会把后端返回的 token 放到请求头里：

```text
Authorization: Bearer <token>
```

### 注册请求示例

```json
{
  "username": "test",
  "password": "123456"
}
```

### 添加收藏请求示例

```json
{
  "spotId": "tokyo-sensoji"
}
```

## 数据结构

### 地点数据

地点数据保存在：

```text
final/backend/data/spots.json
```

单个地点示例：

```json
{
  "id": "tokyo-sensoji",
  "name": "浅草寺",
  "city": "东京",
  "lat": 35.7148,
  "lng": 139.7967,
  "description": "东京很有代表性的古老寺院，附近有热闹的仲见世商店街，适合第一次去东京时安排。"
}
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `id` | 地点唯一标识，收藏功能保存的就是这个值 |
| `name` | 地点名称 |
| `city` | 所属城市 |
| `lat` | 纬度，用于地图标记 |
| `lng` | 经度，用于地图标记 |
| `description` | 地点描述 |

### 用户数据库

用户数据保存在：

```text
final/backend/data/db.json
```

它是一个教学用 JSON 文件数据库，结构大致是：

```json
{
  "users": [
    {
      "id": "用户 id",
      "username": "用户名",
      "salt": "密码盐",
      "passwordHash": "密码哈希",
      "favorites": ["tokyo-sensoji"]
    }
  ]
}
```

注意：这是学习用的最小数据库，不适合直接用于生产环境。

## 运行其他学习版本

### 原生版本

```bash
python -m http.server 8000
```

打开：

```text
http://localhost:8000
```

包含功能：

- 从 `spots.json` 读取地点
- 城市筛选
- 关键词搜索
- 使用 `localStorage` 收藏

### React 版本

```bash
python -m http.server 8000
```

打开：

```text
http://localhost:8000/react-version/
```

重点看：

- `useState`
- `useEffect`
- React 中如何渲染列表
- React 中如何根据输入更新页面

### TypeScript 版本

```bash
cd typescript-version
npm install
npm run dev
```

重点看：

- `Spot` 类型
- `querySelector<HTMLSelectElement>`
- 函数参数类型
- TypeScript 如何提前发现 DOM 可能为 `null`

### React Native 版本

```bash
cd react-native-app
npm install
npm run start
```

重点看：

- `View`
- `Text`
- `TextInput`
- `FlatList`
- `Pressable`
- `AsyncStorage`

### 地图 API 版本

```bash
python -m http.server 8000
```

打开：

```text
http://localhost:8000/map-api-version/
```

重点看：

- Leaflet 如何初始化地图
- 如何用经纬度创建 marker
- 如何根据筛选结果刷新地图标记
- 如何点击地点卡片定位地图

### 登录数据库版本

```bash
cd login-db-version
npm run start
```

打开：

```text
http://localhost:3000
```

重点看：

- 前端如何调用后端 API
- 后端如何注册和登录
- 后端如何用 JSON 文件保存数据
- 前端如何把 token 存到 `localStorage`

## 学习路线建议

推荐按下面顺序学习：

1. 看根目录原生版本，理解最基础的页面、数据和事件
2. 看 `react-version/`，理解 React 为什么可以替代手写 DOM 更新
3. 看 `typescript-version/`，理解类型如何减少错误
4. 看 `map-api-version/`，理解第三方地图 API 的接入方式
5. 看 `login-db-version/`，理解前后端如何通信
6. 看 `react-native-app/`，理解 Web 和移动端开发的区别
7. 最后看 `final/`，理解完整项目如何拆分成前端、后端和移动端

## 常见问题

### 为什么不能直接双击打开 HTML？

因为项目里用到了 `fetch` 读取 JSON 文件。直接双击打开时，浏览器可能会因为本地文件限制阻止读取。建议用本地服务器运行：

```bash
python -m http.server 8000
```

### 为什么 Final Web 要先启动 backend？

因为 Final Web 不再直接读取本地 JSON，而是通过后端 API 获取地点、登录状态和收藏数据。如果后端没启动，Web 页面会请求失败。

### 为什么移动端真机不能用 localhost？

真机里的 `localhost` 指手机自己，不是电脑。后端跑在电脑上，所以真机访问时要用电脑的局域网 IP。

### 登录数据库安全吗？

这里只是学习用的最小实现。虽然密码做了简单 hash 和 salt，但真实生产系统还需要：

- HTTPS
- 更强的密码哈希算法
- token 过期机制
- 数据库权限控制
- 输入校验
- 防止暴力破解
- 更完整的错误处理

## 已验证内容

开发过程中已验证过：

- 原生 JS 文件语法检查
- JSON 文件解析
- TypeScript 版本构建
- React Native TypeScript 检查
- 地图版本基础语法检查
- 登录数据库版本基础 API 行为
- Final Web 构建
- Final Mobile TypeScript 检查
- Final Backend API 基础行为

## 后续可扩展方向

- 加入真实数据库，例如 SQLite、PostgreSQL 或 MongoDB
- 加入路线规划和每日行程安排
- 加入预算、交通方式和营业时间字段
- 加入图片上传或地点封面图
- 加入地图路线连线
- 加入部署配置，例如 Vercel、Render、Railway
- 把登录改成 JWT 或第三方 OAuth

## 说明

这个项目主要用于学习，不是生产级旅行产品。它刻意保留了多个版本，是为了让你能清楚看到同一个需求在不同技术阶段中的实现方式。
