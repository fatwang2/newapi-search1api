// Search1API: https://s1.dev/docs
//
// Each Search1API endpoint is one model, so administrators can price, group
// and grant them separately. Clients call the gateway with Search1API's own
// paths and request bodies (POST /search, /news, /crawl, ...), which is what
// the official SDKs, CLI and MCP server send, so pointing their base URL at
// the gateway (or at /search1api on it) is enough.
//
// Billing is in Search1API credits. Submission reserves the most a request
// can cost, from the same rules the Search1API gateway reserves with; the
// response's x-search1api-credits header then reports what was actually
// charged (fewer credits when a page read in a search or batch crawl fails).
// Without the header the reservation stands.
//
// Every endpoint answers in the same response except /deepcrawl, which
// returns a task id that GET /deepcrawl/status/{task_id} polls.

const ENDPOINTS = {
  search: { model: "search1api-search", path: "/search", batch: true },
  news: { model: "search1api-news", path: "/news", batch: true },
  crawl: { model: "search1api-crawl", path: "/crawl", batch: true },
  ask: { model: "search1api-ask", path: "/ask", credits: 5 },
  maps: { model: "search1api-maps", path: "/maps", credits: 3 },
  sitemap: { model: "search1api-sitemap", path: "/sitemap", credits: 1 },
  trending: { model: "search1api-trending", path: "/trending", credits: 1 },
  extract: { model: "search1api-extract", path: "/extract", credits: 10 },
  deepcrawl: { model: "search1api-deepcrawl", path: "/deepcrawl", credits: 20 },
};
// Search1API rejects larger batches and caps max_results and crawl_results.
const MAX_BATCH_ITEMS = 50;
const MAX_RESULTS = 50;
const DEFAULT_MAX_RESULTS = 5;
// Highest charge one request can carry: a full batch of searches that each
// read every result page.
const MAX_CREDITS = MAX_BATCH_ITEMS * (1 + MAX_RESULTS);
const CREDITS_HEADER = "x-search1api-credits";
const USER_AGENT = "search1api-newapi-plugin/1.0.2";

// The manifest is a plain JSON literal so marketplaces can read it without
// running the plugin. Each endpoint is served at Search1API's path and again
// under /search1api, so clients can use either the gateway root or
// {gateway}/search1api as their Search1API base URL.
export const meta = {
  "apiVersion": 1,
  "key": "fatwang2_search1api",
  "name": "Search1API",
  "version": "1.0.2",
  "sortPriority": 80,
  "icon": "text:S",
  "author": {
    "name": "SuperAgents",
    "url": "https://github.com/superagents-lab"
  },
  "website": "https://s1.dev/?utm_source=newapi&utm_medium=plugin",
  "description": {
    "en": "Web search, news, page reading and maps for AI apps, priced per Search1API credit",
    "zh": "为 AI 应用提供网页搜索、新闻、网页读取和地图，按 Search1API 积分定价"
  },
  "baseUrl": "https://api.search1api.com",
  "auth": "api_key",
  "keyHint": {
    "en": "Search1API API key",
    "zh": "Search1API 的 API Key"
  },
  "models": [
    "search1api-search",
    "search1api-news",
    "search1api-crawl",
    "search1api-ask",
    "search1api-maps",
    "search1api-sitemap",
    "search1api-trending",
    "search1api-extract",
    "search1api-deepcrawl"
  ],
  "upstreams": [
    "vendor",
    "new_api"
  ],
  "fetchMode": "per_task",
  "routes": [
    {
      "method": "POST",
      "path": "/search",
      "type": "submit",
      "decode": "decode_search",
      "render": "renderResult",
      "retainResult": false
    },
    {
      "method": "POST",
      "path": "/search1api/search",
      "type": "submit",
      "decode": "decode_search",
      "render": "renderResult",
      "retainResult": false
    },
    {
      "method": "POST",
      "path": "/news",
      "type": "submit",
      "decode": "decode_news",
      "render": "renderResult",
      "retainResult": false
    },
    {
      "method": "POST",
      "path": "/search1api/news",
      "type": "submit",
      "decode": "decode_news",
      "render": "renderResult",
      "retainResult": false
    },
    {
      "method": "POST",
      "path": "/crawl",
      "type": "submit",
      "decode": "decode_crawl",
      "render": "renderResult",
      "retainResult": false
    },
    {
      "method": "POST",
      "path": "/search1api/crawl",
      "type": "submit",
      "decode": "decode_crawl",
      "render": "renderResult",
      "retainResult": false
    },
    {
      "method": "POST",
      "path": "/ask",
      "type": "submit",
      "decode": "decode_ask",
      "render": "renderResult",
      "retainResult": false
    },
    {
      "method": "POST",
      "path": "/search1api/ask",
      "type": "submit",
      "decode": "decode_ask",
      "render": "renderResult",
      "retainResult": false
    },
    {
      "method": "POST",
      "path": "/maps",
      "type": "submit",
      "decode": "decode_maps",
      "render": "renderResult",
      "retainResult": false
    },
    {
      "method": "POST",
      "path": "/search1api/maps",
      "type": "submit",
      "decode": "decode_maps",
      "render": "renderResult",
      "retainResult": false
    },
    {
      "method": "POST",
      "path": "/sitemap",
      "type": "submit",
      "decode": "decode_sitemap",
      "render": "renderResult",
      "retainResult": false
    },
    {
      "method": "POST",
      "path": "/search1api/sitemap",
      "type": "submit",
      "decode": "decode_sitemap",
      "render": "renderResult",
      "retainResult": false
    },
    {
      "method": "POST",
      "path": "/trending",
      "type": "submit",
      "decode": "decode_trending",
      "render": "renderResult",
      "retainResult": false
    },
    {
      "method": "POST",
      "path": "/search1api/trending",
      "type": "submit",
      "decode": "decode_trending",
      "render": "renderResult",
      "retainResult": false
    },
    {
      "method": "POST",
      "path": "/extract",
      "type": "submit",
      "decode": "decode_extract",
      "render": "renderResult",
      "retainResult": false
    },
    {
      "method": "POST",
      "path": "/search1api/extract",
      "type": "submit",
      "decode": "decode_extract",
      "render": "renderResult",
      "retainResult": false
    },
    {
      "method": "POST",
      "path": "/deepcrawl",
      "type": "submit",
      "decode": "decode_deepcrawl",
      "render": "renderDeepcrawlStarted"
    },
    {
      "method": "POST",
      "path": "/search1api/deepcrawl",
      "type": "submit",
      "decode": "decode_deepcrawl",
      "render": "renderDeepcrawlStarted"
    },
    {
      "method": "GET",
      "path": "/deepcrawl/status/:task_id",
      "type": "query",
      "render": "renderDeepcrawlStatus"
    },
    {
      "method": "GET",
      "path": "/search1api/deepcrawl/status/:task_id",
      "type": "query",
      "render": "renderDeepcrawlStatus"
    }
  ],
  "usageSchema": {
    "credits": {
      "type": "number",
      "unit": "credit",
      "description": {
        "en": "Search1API credit unit price",
        "zh": "Search1API 积分单价"
      }
    }
  },
  "usageExamples": [
    {
      "label": "search",
      "facts": {
        "credits": 1
      }
    },
    {
      "label": "search · crawl_results 3",
      "facts": {
        "credits": 4
      }
    },
    {
      "label": "maps",
      "facts": {
        "credits": 3
      }
    },
    {
      "label": "deepcrawl",
      "facts": {
        "credits": 20
      }
    }
  ]
};

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// Search1API accepts integers and canonical integer strings ("10").
function integerLike(value, fallback) {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    const parsed = parseInt(trimmed, 10);
    if (!isNaN(parsed) && String(parsed) === trimmed) return parsed;
  }
  return fallback;
}

function actionOf(ctx) {
  const action = String(ctx.action || "").toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(ENDPOINTS, action)) throw new Error("Unsupported Search1API endpoint " + ctx.action);
  return action;
}

// The body every endpoint takes: one object, or for /search, /news and /crawl
// also a batch array of objects.
function validateBody(action, body) {
  const endpoint = ENDPOINTS[action];
  if (Array.isArray(body)) {
    if (!endpoint.batch) throw new Error(endpoint.path + " takes one JSON object, not an array");
    if (body.length === 0) throw new Error("A batch request needs at least one item");
    if (body.length > MAX_BATCH_ITEMS) throw new Error("Batch requests can contain at most " + MAX_BATCH_ITEMS + " items");
    for (const item of body) {
      if (!isObject(item)) throw new Error("Each batch item must be a JSON object");
    }
    return body;
  }
  if (!isObject(body)) throw new Error("Request body must be a JSON object");
  return body;
}

// The most a /search or /news item can cost: 1 plus the result pages it reads,
// which Search1API caps at max_results (default 5, at most 50).
function searchItemCredits(item) {
  const maxResults = Math.min(MAX_RESULTS, Math.max(1, integerLike(item.max_results, DEFAULT_MAX_RESULTS)));
  const crawlResults = Math.min(maxResults, Math.max(0, integerLike(item.crawl_results, 0)));
  return 1 + crawlResults;
}

function reservedCredits(action, body) {
  const items = Array.isArray(body) ? body : [body];
  if (action === "search" || action === "news") {
    return items.reduce(function (total, item) {
      return total + searchItemCredits(item);
    }, 0);
  }
  if (action === "crawl") return items.length;
  return ENDPOINTS[action].credits;
}

function headerValue(headers, name) {
  const wanted = name.toLowerCase();
  const keys = Object.keys(headers || {});
  for (const key of keys) {
    if (key.toLowerCase() === wanted) return headers[key];
  }
  return undefined;
}

// The credits Search1API charged, from its response header. A value outside
// the possible range is an error rather than a free or inflated request.
function chargedCredits(headers) {
  const raw = headerValue(headers, CREDITS_HEADER);
  if (raw === undefined || raw === null || raw === "") return null;
  const credits = integerLike(raw, NaN);
  if (!Number.isInteger(credits) || credits < 0 || credits > MAX_CREDITS) throw new Error("Search1API reported an invalid credit charge");
  return credits;
}

function validCredits(value) {
  return Number.isInteger(value) && value >= 0 && value <= MAX_CREDITS;
}

function baseUrl(ctx) {
  let url = String(ctx.baseUrl || "").replace(/\/+$/, "");
  // An upstream New API gateway serves this plugin under its own prefix.
  if (ctx.upstream && ctx.upstream.kind === "new_api") url += "/search1api";
  return url;
}

function headers(ctx) {
  return {
    Authorization: "Bearer " + ctx.apiKey,
    Accept: "application/json",
    "User-Agent": USER_AGENT,
  };
}

export function buildSubmitRequest(ctx) {
  const action = actionOf(ctx);
  const body = validateBody(action, ctx.requestBody);
  const requestHeaders = headers(ctx);
  requestHeaders["Content-Type"] = "application/json";
  return { url: baseUrl(ctx) + ENDPOINTS[action].path, method: "POST", headers: requestHeaders, body: body };
}

export function parseSubmitResponse(ctx, response) {
  const action = actionOf(ctx);
  const body = response.body;
  if (!isObject(body) && !Array.isArray(body)) throw new Error("Search1API returned a response that is not JSON");
  const charged = chargedCredits(response.headers);
  const credits = charged === null ? reservedCredits(action, ctx.requestBody) : charged;

  if (action === "deepcrawl") {
    const taskId = isObject(body) && typeof body.taskId === "string" ? body.taskId.trim() : "";
    if (!taskId) throw new Error("Search1API did not return a deep crawl task id");
    return { taskId: taskId, taskData: body, state: { credits: credits } };
  }

  if (!ctx.publicTaskId) throw new Error("Missing gateway request ID");
  return {
    taskId: ctx.publicTaskId,
    taskData: { credits: credits, response: body },
    immediate: { status: "SUCCESS", progress: "100%" },
  };
}

export function extractUsage(ctx) {
  const action = actionOf(ctx);
  const body = validateBody(action, ctx.requestBody);
  if (ctx.usagePurpose === "billing_ratios") return null;
  return { credits: reservedCredits(action, body) };
}

export function extractUsageOnComplete(task, result, data) {
  // Same-response endpoints carry the charge in their data; a deep crawl
  // keeps the charge of its start request in the task state.
  const credits = String(task.action || "").toLowerCase() === "deepcrawl" ? task.state && task.state.credits : data && data.credits;
  // Throwing keeps the reservation; a missing charge is never billed as zero.
  if (!validCredits(credits)) throw new Error("Search1API credit usage is missing");
  return { credits: credits };
}

export function buildQueryRequest(ctx) {
  if (String(ctx.action || "").toLowerCase() !== "deepcrawl") throw new Error("Only deep crawl tasks can be queried");
  const taskId = String(ctx.taskId || "").trim();
  if (!taskId) throw new Error("Missing deep crawl task id");
  return {
    url: baseUrl(ctx) + "/deepcrawl/status/" + encodeURIComponent(taskId),
    method: "GET",
    headers: headers(ctx),
  };
}

// Deep crawl states: queued, processing, completed, failed.
export function parseTaskResult(ctx, body) {
  if (!isObject(body) || typeof body.status !== "string") return { status: "UNKNOWN", reason: "Unrecognized Search1API deep crawl response" };
  switch (body.status) {
    case "queued":
      return { status: "QUEUED" };
    case "processing":
      return { status: "IN_PROGRESS" };
    case "completed":
      return { status: "SUCCESS", progress: "100%", url: typeof body.zipUrl === "string" ? body.zipUrl : undefined };
    case "failed":
      return { status: "FAILURE", reason: typeof body.message === "string" && body.message ? body.message : "Deep crawl failed" };
    case "not_found":
      return { status: "FAILURE", reason: "Deep crawl task not found" };
    default:
      return { status: "UNKNOWN", reason: "Unrecognized Search1API deep crawl status" };
  }
}

function decoder(action) {
  return function (ctx) {
    if (!ctx.body || ctx.body.kind !== "json") throw new Error("JSON body required");
    return {
      kind: "submit",
      model: ENDPOINTS[action].model,
      action: action,
      requestBody: validateBody(action, ctx.body.value),
    };
  };
}

export const native = {
  decode_search: decoder("search"),
  decode_news: decoder("news"),
  decode_crawl: decoder("crawl"),
  decode_ask: decoder("ask"),
  decode_maps: decoder("maps"),
  decode_sitemap: decoder("sitemap"),
  decode_trending: decoder("trending"),
  decode_extract: decoder("extract"),
  decode_deepcrawl: decoder("deepcrawl"),
  // Search1API's own response, unchanged.
  renderResult: function (ctx, task) {
    return task.data.response;
  },
  // Search1API answers a deep crawl start with 202 and the task id.
  renderDeepcrawlStarted: function (ctx, task) {
    return { __status: 202, __body: { taskId: task.task_id, status: "queued" } };
  },
  renderDeepcrawlStatus: function (ctx, task) {
    const data = isObject(task.data) ? task.data : {};
    if (task.status === "FAILURE" && data.status !== "failed") {
      return { taskId: task.task_id, status: "failed", message: task.fail_reason || "Deep crawl failed" };
    }
    const view = Object.assign({}, data);
    view.taskId = task.task_id;
    if (typeof view.status !== "string") view.status = "queued";
    return view;
  },
  // A Search1API error reaches the client in Search1API's own shape.
  error: function (ctx, error) {
    try {
      const body = JSON.parse(error.message);
      if (isObject(body) && typeof body.message === "string") return body;
    } catch (parseError) {
      // Gateway errors are sentences, not Search1API JSON.
    }
    return { error: error.code || "request_failed", message: error.message, ok: false };
  },
};
