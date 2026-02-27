# CampusHealth（大学生健康自救助手）

> 微信小程序原生 + 微信云开发（CloudBase）MVP。
>
> 功能：记录睡眠 / 情绪、首页看板、7天趋势、我的统计与免责声明。

## 1. 项目目录

```text
.
├── README.md
├── project.config.json
├── miniprogram/
│   ├── app.js
│   ├── app.json
│   ├── app.wxss
│   ├── sitemap.json
│   ├── utils/
│   │   └── date.js
│   └── pages/
│       ├── home/
│       │   ├── home.js
│       │   ├── home.json
│       │   ├── home.wxml
│       │   └── home.wxss
│       ├── sleep/
│       │   ├── sleep.js
│       │   ├── sleep.json
│       │   ├── sleep.wxml
│       │   └── sleep.wxss
│       ├── mood/
│       │   ├── mood.js
│       │   ├── mood.json
│       │   ├── mood.wxml
│       │   └── mood.wxss
│       ├── trend/
│       │   ├── trend.js
│       │   ├── trend.json
│       │   ├── trend.wxml
│       │   └── trend.wxss
│       └── me/
│           ├── me.js
│           ├── me.json
│           ├── me.wxml
│           └── me.wxss
└── cloudfunctions/
    ├── upsertSleep/
    │   ├── index.js
    │   └── package.json
    ├── upsertMood/
    │   ├── index.js
    │   └── package.json
    ├── getTodaySummary/
    │   ├── index.js
    │   └── package.json
    └── getWeeklyStats/
        ├── index.js
        └── package.json
```

## 2. 云开发部署步骤（从 0 到 1）

1. **创建云开发环境**
   - 打开微信开发者工具，导入项目目录。
   - 点击工具栏【云开发】→ 开通环境，得到环境 ID（例如 `campushealth-xxxxxx`）。

2. **替换环境 ID**
   - 修改 `miniprogram/app.js` 中 `env: 'your-cloud-env-id'` 为真实环境 ID。

3. **创建数据库集合**
   - `sleep_records`
   - `mood_records`

4. **设置数据库权限**
   - 两个集合都设置为：**仅创建者可读写**。
   - 本项目云函数查询都附带 `_openid` 过滤，保证仅访问当前用户数据。

5. **部署云函数**
   - 在开发者工具左侧 cloudfunctions 下，对每个函数执行：
     - 右键 `上传并部署：云端安装依赖`
   - 需要部署的函数：
     - `upsertSleep`
     - `upsertMood`
     - `getTodaySummary`
     - `getWeeklyStats`

6. **本地预览与内测**
   - 编译小程序。
   - 首次进入首页应可看到空状态引导。
   - 分别去“睡眠”“情绪”页面提交记录后，返回首页和趋势页验证展示。

## 3. 关键规则说明

- 每天最多一条睡眠记录：按 `date + _openid` upsert。
- 睡眠跨天：`wakeTime < sleepTime` 时按次日计算时长。
- `date` 定义：以“起床当天”作为日期。
- 每天最多一条情绪记录：按 `date + _openid` upsert。
- 连续打卡 streak：从今天往前，某天只要 sleep 或 mood 有其一记录即算打卡，遇到缺失即停止。
- 7天趋势：无记录使用 `null`，前端显示空状态或“无”。

## 4. 合规与文案

本项目严格避免医疗化表述，仅提供行为建议。

免责声明已放在“我的页”：

> 本产品仅用于健康记录与行为建议，不提供医疗诊断或治疗建议。
