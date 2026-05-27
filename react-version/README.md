# React 版本

这是一个不需要构建工具的 React 版本，适合先理解 React 的基本写法。

## 运行

在项目根目录启动本地服务器：

```bash
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000/react-version/
```

## 说明

- 使用 React CDN
- 使用 `useState` 保存城市、关键词和收藏
- 使用 `useEffect` 读取 `spots.json`
- 使用 `localStorage` 保存收藏
