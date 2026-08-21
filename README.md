# Wedding Invitation H5

一个移动端优先、可部署的微信婚礼邀请 H5。采用 Next.js App Router、TypeScript、Prisma 与 SQLite；生产环境可将 Prisma datasource 迁移至托管 PostgreSQL。页面在没有微信配置、宾客 Token 或背景音乐时均可正常降级。

## Local Development

```bash
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

打开 `http://localhost:3000`。测试邀请链接：`/i/TEST001`、`TEST002`、`TEST003`。管理后台位于 `/admin`，密码读取 `ADMIN_SECRET`（至少 12 位）。

## Wedding Content

所有新人、日期、时间、酒店、宴会厅、地址、经纬度、邀请语、联系信息、分享文案、音乐与照片清单均在 `src/config/wedding.ts`。将优化后的 AVIF/WebP/JPEG 照片放进 `public/photos/` 并更新配置；Hero 建议提供接近手机比例的 1600–2400px 长边资源。替换 `public/share-cover.svg`（正式微信封面推荐 1.91:1 JPG），音乐放在 `public/audio/wedding.mp3`。音乐缺失时控件会自动隐藏。

## Database & Guest Tokens

开发数据库通过 `DATABASE_URL=file:./dev.db` 隔离。执行 `npm run db:push` 初始化、`npm run db:seed` 写入测试宾客。

### Guest Tokens 与发送工作流

登录 `/admin` 后可逐个添加邀请单位（个人、伴侣或一个家庭），或导入 UTF-8 CSV：

```csv
姓名,邀请人数,分组,备注
王叔叔一家,3,男方亲友,父亲发送
Alex & Emma,2,朋友,新娘发送
```

Token 在服务器端使用密码学随机数自动生成，采用排除易混字符的 8 位大写字母数字，不使用递增 ID。Admin 每行提供“复制链接”“复制文案”“预览”和发送状态切换，并可导出包含专属链接的邀请名单。专属 URL 使用 `/i/TOKEN`，会安全转到个性化邀请；不要公开导出文件或完整名单。

推荐混合发送：亲友私聊使用专属链接，微信群或临时宾客使用无 Token 的通用首页链接。这样既能准确跟踪重要宾客回复，也不要求为群内每个人逐一发送。上线前删除 `TEST00*` 测试宾客及测试 RSVP，并为 testing/production 配置独立数据库。

## WeChat

当前实现按微信 JS-SDK 流程：服务端以 AppID/AppSecret 获取 `access_token` 和 `jsapi_ticket`、缓存 ticket，并对去除 hash 的当前 URL 生成 SHA-1 签名；浏览器仅收到 AppID、nonce、timestamp 和 signature。前端使用 `updateAppMessageShareData`、`updateTimelineShareData` 和 `openLocation`，不使用旧的 `onMenuShare*` 接口。AppSecret 永远只放服务器环境变量。

需在支持 JS-SDK 权限的微信公众号后台配置 **JS 接口安全域名**，并确保该域名下 HTTPS 页面及分享封面可公网访问。`NEXT_PUBLIC_SITE_URL` 必须与当前环境公开 origin 完全一致。未配置公众号、权限不足、签名失败或非微信环境时，分享退化为页面 Open Graph metadata，导航退化为高德地图 URL，页面不会报错。本地 localhost 通常不能完成微信安全域名与真机签名验证。

## Deployment

推荐构建 Docker/Node 运行环境：设置独立的 `DATABASE_URL`、高强度 `ADMIN_SECRET`、`NEXT_PUBLIC_SITE_URL`、可选微信凭证，执行 `npm ci && npm run build && npm start`。必须启用 HTTPS、持久化数据库并在反向代理设置真实客户端 IP。中国大陆节点和域名通常需要 ICP 备案；若时间不足可选择香港节点，但仍需根据当地法规和公众号域名要求确认。应用未绑定任何主机商，迁移只需更换环境变量、数据库和域名。

## Staging with ChatGPT Sites

若工作区提供 ChatGPT Sites / `@Sites`：创建 Site Preview，配置 testing 专用数据库及 `NEXT_PUBLIC_SITE_URL=<preview HTTPS URL>`，保存稳定版本后发布并取得公网 URL。当前执行环境若没有 Sites 发布工具，则需在支持 Sites 的 ChatGPT 会话中连接仓库后执行上述流程。

Staging 主要验证公网资源、metadata、移动端、RSVP、导航和微信 WebView 基础行为；JS 接口安全域名和分享卡片须在正式域名确定后最终验收。将 URL 发送到微信文件传输助手，在 iPhone/Android 完整滚动、提交/修改回执、导航、返回重开、音乐和弱网图片加载。发布生产前删除测试宾客与 RSVP，配置新的 Production DB/secret/site URL，再部署至腾讯云等 Node 环境并绑定 HTTPS 域名，无需重写应用。

## Security notes

RSVP 使用服务端 Zod 校验、honeypot、基础 IP 速率限制；Admin 使用 HttpOnly、SameSite 严格、生产 Secure 的签名 Cookie，CSV 也会再次鉴权。内存限流适合单实例的小规模婚礼；多实例部署应替换为 Redis/边缘限流。日志不输出 RSVP 正文或微信密钥。
