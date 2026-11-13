---
changelogVersion: 1
plugin: "fatwang2_search1api"
version: "1.0.0"
locale: "zh-CN"
---
# Changelog

## [1.0.0]

### Added

- 通过网关调用 Search1API，使用它自己的路径和 JSON 请求体：`POST /search`、`/news`、`/crawl`、`/ask`、`/maps`、`/sitemap`、`/trending`、`/extract` 和 `/deepcrawl`，每个路径也可以加 `/search1api` 前缀访问。
- 每个接口是一个独立模型，从 `search1api-search` 到 `search1api-deepcrawl`，管理员可以分别定价、分组和授权。
- 用 `GET /deepcrawl/status/{task_id}` 查询整站抓取的进度。
- 每个模型设置一个 Search1API 积分单价。每次请求按 Search1API 实际扣除的积分计费；失败的请求和没读取成功的页面不收费。
- 可以直接连接 Search1API，也可以经由另一台安装了本插件的 New API 网关连接。
- 把 Search1API 官方 SDK 和 `search1api-mcp` 的 base URL 设为网关上的 `/search1api`，即可经网关使用。
