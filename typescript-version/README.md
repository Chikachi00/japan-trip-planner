# TypeScript 版本

这是一个 Vite + TypeScript 的最小版本。

## 运行

```bash
cd typescript-version
npm install
npm run dev
```

## 说明

- `src/main.ts` 定义了 `Spot` 类型
- DOM 查询使用了泛型，例如 `querySelector<HTMLSelectElement>`
- 收藏数据保存到 `localStorage`
- 地点数据来自 `spots.json`
