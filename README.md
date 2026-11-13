---
translations:
  zh-CN: README.zh-CN.md
---
# Search1API

Give your users web search, news search, page reading, maps, site maps, trending topics, structured extraction and whole-site crawls from [Search1API](https://s1.dev/?utm_source=newapi&utm_medium=plugin), billed through your gateway.

## Channel setup

- Choose the Task Plugin (61) channel type and bind the Search1API plugin.
- Paste a Search1API API key from the [Search1API dashboard](https://app.s1.dev/?utm_source=newapi&utm_medium=plugin). New accounts include free credits to test with.
- Leave the API address empty to use `https://api.search1api.com`.
- If the upstream is another New API gateway, choose the New API (60) channel type and enter that gateway's address and token. The upstream gateway needs the Search1API plugin too.
- Add the models below to the channel. Each endpoint is its own model, so you can price, group and grant them separately.

## Models and endpoints

Requests use Search1API's own paths and JSON bodies, as described in the [API reference](https://s1.dev/docs). Every path is also served under `/search1api`, for example `POST /search1api/search`.

| Endpoint | Model | What it does |
| --- | --- | --- |
| `POST /search` | `search1api-search` | Web search, optionally reading the top result pages |
| `POST /news` | `search1api-news` | News search |
| `POST /crawl` | `search1api-crawl` | Read a web page as clean text |
| `POST /ask` | `search1api-ask` | Search and answer a question with cited sources |
| `POST /maps` | `search1api-maps` | Google Maps places |
| `POST /sitemap` | `search1api-sitemap` | List the links of a site |
| `POST /trending` | `search1api-trending` | Trending topics on a platform |
| `POST /extract` | `search1api-extract` | Extract structured data from a page with a JSON schema |
| `POST /deepcrawl` | `search1api-deepcrawl` | Start a crawl of a whole site |

`/search`, `/news` and `/crawl` also accept a JSON array of up to 50 requests.
A deep crawl returns a task id. Clients poll `GET /deepcrawl/status/{task_id}` until `status` is `completed`. The pages come as a ZIP of Markdown files behind `zipUrl`, or with `"format": "json"` in the request as `pages` in the status response.

The official Search1API SDKs and the `search1api-mcp` server work through the gateway: set their base URL to `https://your-gateway.example.com/search1api` and use a gateway token as the API key.

## Billing

Every model has one price field, the Search1API credit unit price. A request costs the credits Search1API charges for it:

- `/search` and `/news`: 1 credit per query, plus 1 for each result page read with `crawl_results`.
- `/crawl`: 1 credit per URL.
- `/ask`: 5 credits. `/maps`: 3 credits per page. `/extract`: 10 credits. `/deepcrawl`: 20 credits per started crawl; status checks are free.
- `/sitemap` and `/trending`: 1 credit.

The gateway reserves the most a request can cost, then settles to the credits Search1API reports for it, so a page that could not be read is not billed. Failed requests are not billed. Through an upstream New API gateway the charge is not reported back, so requests settle at the reserved amount. For example, `tier("credits", u("credits") * 0.004)` charges 0.004 USD per credit.

## Example

```bash
curl https://your-gateway.example.com/search \
  -H "Authorization: Bearer sk-..." \
  -H "Content-Type: application/json" \
  -d '{"query": "latest AI chip export rules", "max_results": 5, "crawl_results": 2}'
```

## Limits

- Bodies must be JSON. Errors from Search1API reach the client in Search1API's format.
- Screenshots and Search1API's compatibility endpoints are not served by this plugin.
- Requests to the gateway have the gateway's timeout. Large batches with many page reads can take more than a minute.
