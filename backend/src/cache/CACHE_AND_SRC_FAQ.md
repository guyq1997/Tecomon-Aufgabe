### 缓存与 `src` 目录常见问答（Q&A）

#### 为什么会有 `src` 目录？
- **职责分离**：用来放“源码”（source），与根目录里的配置文件（如 `package.json`、`Dockerfile`）以及构建产物（如 `dist/`、`build/`）分开，结构更清晰。
- **构建与发布**：若使用编译/打包，源码在 `src/`，产物在 `dist/`，便于部署与调试。
- **本仓库情况**：后端将 Express 等业务代码放在 `backend/src`；前端是 Next.js，采用 `pages/` 约定，无需 `src/`。

#### `backend/src/cache/` 是做什么的？
- **作用**：提供一个进程内（in‑process）的 TTL 内存缓存，减少对外部 Open‑Meteo API 的重复请求，降低延迟与调用次数。
- **接口**：`setCache(key, value, ttlMs)` 写入；`getCache(key)` 读取（过期自动失效并删除）；`clearCache()` 清空缓存。
- **使用点**：在天气服务 `getWeatherForLocation` 中先查缓存，命中直接返回；否则访问外部 API，并把结果缓存 5 分钟。

```59:68:/Users/guyuqiang/PKF/Tecomon-Aufgabe-fork/backend/src/services/weatherService.js
const cacheKey = `weather:${location}`;
const cached = getCache(cacheKey);
if (cached) return cached;

const geo = await geocodeLocation(location);
const current = await fetchCurrentWeather(geo.latitude, geo.longitude);
const payload = { location: geo.name, country: geo.country, ...current };

setCache(cacheKey, payload, FIVE_MINUTES_MS);
return payload;
```

#### `cacheStore` 是什么，在哪里？
- **是什么**：一个 `Map`，存放 key → { value, expiresAt } 的缓存条目。
- **在哪里**：定义在 `backend/src/cache/memoryCache.js` 顶部的模块作用域，仅被本模块导出的函数使用。

```1:1:/Users/guyuqiang/PKF/Tecomon-Aufgabe-fork/backend/src/cache/memoryCache.js
const cacheStore = new Map();
```

```9:12:/Users/guyuqiang/PKF/Tecomon-Aufgabe-fork/backend/src/cache/memoryCache.js
export function setCache(key, value, ttlMs) {
  const expiresAt = Date.now() + ttlMs;
  cacheStore.set(key, { value, expiresAt });
}
```

#### 存在浏览器里吗？
- **不在浏览器**。它在后端 Node.js 进程的内存（RAM）里，仅服务器可见；重启会清空；多实例之间不共享。
- 如果需要浏览器侧缓存，可考虑 HTTP 缓存（Cache‑Control/ETag）、Service Worker 的 Cache Storage、`localStorage`/`IndexedDB`、或前端内存缓存（SWR/React Query）。

#### 它到底存在哪里？为什么能避免重复请求？什么是 TTL？
- **存放位置**：服务器进程内存（RAM），以 `Map` 形式保存。
- Map 形式”是指指 JavaScript 的 Map 类型：一种键值对集合（key → value）。
  特点：
  键可以是任意类型（字符串、数字、对象、函数、NaN 等）。
  在这个项目里，cacheStore 用 Map 把键（如 weather:berlin）映射到 { value, expiresAt }。
- **避免重复请求**：请求到来先按地点生成键（如 `weather:berlin`）查缓存；命中且未过期则直接返回；未命中或已过期再访问外部 API，并写回缓存。
- **TTL（Time To Live）**：缓存条目的存活时长，超过即视为过期。在本项目中设置为 5 分钟。过期时读取会删除该条目并触发重新拉取最新数据。

#### 注意事项与扩展
- **非分布式**：这是进程内缓存，多实例/多容器各自维护，彼此不共享。
- **持久化与共享**：若需要跨实例共享、持久化或更精细的逐出策略，请使用 Redis 等外部缓存。

