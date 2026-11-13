---
locale: zh-CN
---
# Search1API

通过 [Search1API](https://s1.dev/?utm_source=newapi&utm_medium=plugin) 为用户提供网页搜索、新闻搜索、网页读取、地图、站点链接、热门话题、结构化抽取和整站抓取，由网关统一计费。

## 渠道设置

- 渠道类型选任务插件 (61)，并绑定 Search1API 插件。
- 密钥填 [Search1API 控制台](https://app.s1.dev/?utm_source=newapi&utm_medium=plugin) 里创建的 API Key。新账号自带免费积分，可以直接测试。
- API 地址留空时使用 `https://api.search1api.com`。
- 如果上游是另一台 New API 网关，渠道类型选 New API (60)，填写该网关的地址和它的令牌。上游网关也需要安装 Search1API 插件。
- 把下表中的模型加到渠道里。每个接口是一个独立模型，可以分别定价、分组和授权。

## 模型与接口

请求使用 Search1API 自己的路径和 JSON 请求体，参见 [API 文档](https://s1.dev/docs)。每个路径也可以加上 `/search1api` 前缀访问，例如 `POST /search1api/search`。

| 接口 | 模型 | 用途 |
| --- | --- | --- |
| `POST /search` | `search1api-search` | 网页搜索，可同时读取排名靠前的结果页面 |
| `POST /news` | `search1api-news` | 新闻搜索 |
| `POST /crawl` | `search1api-crawl` | 把网页读取为干净的正文 |
| `POST /ask` | `search1api-ask` | 搜索并回答问题，附带引用来源 |
| `POST /maps` | `search1api-maps` | Google 地图地点 |
| `POST /sitemap` | `search1api-sitemap` | 列出网站的链接 |
| `POST /trending` | `search1api-trending` | 平台热门话题 |
| `POST /extract` | `search1api-extract` | 按 JSON Schema 从网页抽取结构化数据 |
| `POST /deepcrawl` | `search1api-deepcrawl` | 发起整站抓取 |

`/search`、`/news` 和 `/crawl` 也接受最多 50 个请求组成的 JSON 数组。
整站抓取返回任务 ID。客户端轮询 `GET /deepcrawl/status/{task_id}`，直到 `status` 为 `completed`。页面默认打包成 Markdown 文件的 ZIP，通过 `zipUrl` 下载；请求里带 `"format": "json"` 时，页面以 `pages` 字段直接出现在状态响应里。

Search1API 官方 SDK 和 `search1api-mcp` 都可以经网关使用：把它们的 base URL 设为 `https://your-gateway.example.com/search1api`，API Key 填网关令牌。

## 计费

每个模型只有一个价格字段：“Search1API 积分单价”。每次请求按 Search1API 对它扣除的积分计费：

- `/search` 和 `/news`：每个查询 1 积分，`crawl_results` 每读取一个结果页面再加 1 积分。
- `/crawl`：每个 URL 1 积分。
- `/ask`：5 积分。`/maps`：每页 3 积分。`/extract`：10 积分。`/deepcrawl`：每次发起 20 积分，查询状态免费。
- `/sitemap` 和 `/trending`：1 积分。

网关先按请求可能的最高积分预扣，再按 Search1API 报告的实际积分结算，没读取成功的页面不收费。失败的请求不收费。经由上游 New API 网关时拿不到实际扣费，按预扣数结算。例如 `tier("credits", u("credits") * 0.004)` 表示每积分 0.004 美元。

## 示例

```bash
curl https://your-gateway.example.com/search \
  -H "Authorization: Bearer sk-..." \
  -H "Content-Type: application/json" \
  -d '{"query": "latest AI chip export rules", "max_results": 5, "crawl_results": 2}'
```

## 限制

- 请求体必须是 JSON。Search1API 返回的错误按 Search1API 的格式交给客户端。
- 本插件不提供截图接口和 Search1API 的兼容接口。
- 请求受网关超时限制。包含大量页面读取的大批量请求可能超过一分钟。
