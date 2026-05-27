# Final Mobile App

这是合并版的 React Native / Expo App。

## 运行

先启动后端：

```bash
cd ../backend
npm run start
```

再启动移动端：

```bash
cd ../mobile-app
npm install
npm run start
```

## 注意

默认 API 地址是：

```text
http://localhost:3001
```

如果你用真机 Expo Go 测试，需要把 `App.tsx` 里的 `API_BASE` 改成电脑在局域网中的 IP，例如：

```text
http://192.168.1.10:3001
```
