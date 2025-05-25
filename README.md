
# Dashboard 配置服务文档（dashboard-config API 版本）

## 📦 简介
该服务提供一个轻量级 **Dashboard 配置 HTTP API + WebSocket 推送**，用于多用户拖拽式仪表盘的配置存储与热刷新。每位用户使用一把 **API‑Key** 即可读写自己的仪表盘，不依赖固定域名，便于 n8n 等自动化平台在分析数据后 **即时更新** 前端展示。

---

## 📁 项目结构
```text
dashboard-config/
├── server/                 # Node.js (Express) 服务
│   ├── routes/
│   │   └── config.js       # /api/config 相关路由
│   ├── controllers/
│   │   └── configController.js
│   ├── models/             # Mongoose 数据模型
│   │   ├── ApiKey.js
│   │   └── Config.js
│   ├── middleware/
│   │   └── apiKey.js
│   ├── ws.js               # WebSocket 服务
│   └── index.js            # 服务入口
├── defaults/
│   └── defaultConfig.json  # 新用户默认仪表盘
├── .env                    # 环境变量示例
└── package.json
```

---

## ⚙️ 安装与启动
```bash
git clone https://github.com/your-org/dashboard-config.git
cd dashboard-config
npm install
cp .env.example .env     # 修改 MONGO_URI / PORT
npm start                # 默认 http://0.0.0.0:3000
```

---

## 🔐 API‑Key 鉴权
**所有请求必须携带 API‑Key**，二选一：  
1. 查询串：`?key=YOUR_API_KEY`  
2. Header：`X-API-Key: YOUR_API_KEY`

若 Key 无效或状态非 `active`，返回 **401 Unauthorized**。

---

## 🔌 API 接口文档

### 1. 读取配置 `/api/config`
```http
GET /api/config?key=APIKEY
```
- **成功响应**
```json
{
  "layout": [["用户总数", "地区分布"], ["每日访问趋势"]],
  "cards": [/* ... */],
  "settings": { "theme": "dark" }
}
```

---

### 2. 覆盖配置 `/api/config`
```http
PUT /api/config?key=APIKEY
Content-Type: application/json
```
- **Body**：完整 Dashboard JSON  
- **成功响应**
```json
{ "ok": true, "updatedAt": "2025-05-25T12:34:56.789Z" }
```

---

### 3. 局部更新 `/api/config/cards`
```http
PATCH /api/config/cards?key=APIKEY
Content-Type: application/json
```
- **Body**：可包含 `cards`、`layout` 任意字段  
- **示例**
```json
{
  "cards": [{
    "id": "sales_today",
    "title": "今日销量",
    "type": "kpi",
    "collection": "sales",
    "query": { "date": "2025-05-25" },
    "aggregation": "sum",
    "field": "amount",
    "size": "small"
  }],
  "layout": [["sales_today"]]
}
```

---

### 4. 重置默认 `/api/config/reset`
```http
POST /api/config/reset?key=APIKEY
```
- **成功响应**
```json
{ "ok": true }
```

---

## 🌐 WebSocket 推送
| 端点 | `wss://<host>/ws?key=<APIKEY>` |
|------|--------------------------------|
| 事件 | `configUpdated`                |
| 载荷 | ```json { "type":"configUpdated", "updatedAt":"2025-05-25T12:34:56Z" } ``` |

前端收到事件后，应重新 `GET /api/config` 以热刷新布局。

---

## 📄 配置 JSON 基础 Schema
```jsonc
{
  "layout": [ ["用户总数", "地区分布"], ["每日访问趋势"] ],
  "cards": [
    {
      "id": "kpi_users",
      "title": "用户总数",
      "type": "kpi",            // kpi | line | bar | pie | table | html
      "collection": "users",
      "query": { "active": true },
      "aggregation": "count",
      "size": "small",
      "refresh_interval": 60
    }
  ],
  "settings": {
    "theme": "dark",
    "language": "zh-CN",
    "time_filter": { "enabled": true, "default_range": "7d" }
  }
}
```

---

## 🤖 在 n8n 中调用
### 读取并追加卡片流程
1. **HTTP Request** (GET) → `http://<host>/api/config?key={{$json.apiKey}}`  
2. **Function** 节点合并新卡片到 `cards/layout`  
3. **HTTP Request** (PATCH)  
   *URL*：`http://<host>/api/config/cards?key={{$json.apiKey}}`  
   *Body*：`{{$json.updatedConfig}}`  

---

## 📋 日志记录
- 所有写操作（PUT / PATCH / reset）写入 `stdout` 并追加到 `logs/app.log`
- WebSocket 每次广播记录：  `[2025-05-25 12:34:56] WS → userId abc123 configUpdated`

---

## 🛠️ 可拓展方向
- ✅ **主题 / 国际化**：`settings.theme / language`  
- ✅ **配置版本回滚**：`dashboard_configs.versions` 内置历史  
- ✅ **API‑Key 速率限制** 与来源域名白名单  
- ✅ **Docker Compose** 一键部署（Mongo + Service）  
- ✅ **Swagger / OpenAPI** 自动生成交互文档  
- ✅ **实时指标推送** 通过同一 WebSocket（新增 `type: metric`）

---

_最后更新：2025‑05‑25_
