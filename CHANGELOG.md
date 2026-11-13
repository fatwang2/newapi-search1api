---
changelogVersion: 1
plugin: "fatwang2_search1api"
version: "1.0.0"
locale: "en"
translations:
  zh-CN: CHANGELOG.zh-CN.md
---
# Changelog

## [1.0.0]

### Added

- Call Search1API through the gateway with its own paths and JSON bodies: `POST /search`, `/news`, `/crawl`, `/ask`, `/maps`, `/sitemap`, `/trending`, `/extract` and `/deepcrawl`, each also under `/search1api`.
- Each endpoint is its own model, from `search1api-search` to `search1api-deepcrawl`, so administrators can price, group and grant them separately.
- Poll deep crawls with `GET /deepcrawl/status/{task_id}`.
- Set one Search1API credit unit price per model. Each request is billed for the credits Search1API charges for it; failed requests and pages that could not be read are not billed.
- Connect directly to Search1API or through another New API gateway with this plugin installed.
- Use the official Search1API SDKs and `search1api-mcp` through the gateway by setting their base URL to `/search1api` on the gateway.
