# 地图 API 版本

这是一个使用 Leaflet 和 OpenStreetMap 的地图版本。

## 运行

在项目根目录启动本地服务器：

```bash
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000/map-api-version/
```

## 说明

- `spots.json` 中增加了 `lat` 和 `lng`
- Leaflet 负责创建地图、标记和弹窗
- OpenStreetMap 提供地图瓦片
- 不需要申请 API key
