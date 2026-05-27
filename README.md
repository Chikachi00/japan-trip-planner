# 日本旅行规划器

一个适合初学者阅读的原生 HTML/CSS/JS 小项目。

## 功能

- 从 `spots.json` 读取地点数据
- 按城市筛选地点
- 按关键词搜索地点
- 使用 `localStorage` 保存收藏地点

## 运行

因为 `app.js` 会用 `fetch` 读取 `spots.json`，建议使用本地服务器运行。

```bash
python -m http.server 8000
```

打开：

```text
http://localhost:8000
```
