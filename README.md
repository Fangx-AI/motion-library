# Motion Library

中文动效作品与制作资料索引。**441 件作品 · 52 条作者提示词正文 · 25 件作品附源码。**

[浏览作品](https://fangx-ai.github.io/motion-library/) · [直接读提示词](https://fangx-ai.github.io/motion-library/?type=prompt) · [查看源码](https://fangx-ai.github.io/motion-library/?type=code)

![作品库真实界面：作品封面、作者署名、提示词与源码入口](docs/images/gallery-desktop.png)

## 从这几件开始

| 作品                                                                                          | 可查看的制作资料                                      |
| :-------------------------------------------------------------------------------------------- | :---------------------------------------------------- |
| [Clearwater · 交互水面](https://fangx-ai.github.io/motion-library/?work=2102786378282987591)  | 实时水面与涟漪，附源码；原项目 MIT 许可               |
| [像素巫师 · 施法循环](https://fangx-ai.github.io/motion-library/?work=2102476258948927543)    | 完整作者指令：Canvas 2D、像素绘制、角色状态与粒子系统 |
| [一个形状串起整套 UI](https://fangx-ai.github.io/motion-library/?work=2103273003555402193)    | 作者提示词，包含节奏、场景与视觉约束                  |
| [Spiderbench · 城市荡行](https://fangx-ai.github.io/motion-library/?work=2104001664793600012) | 浏览器交互项目源码；许可限制见项目说明                |

## 怎么用

- 搜索作品、作者、模型或提示词正文；按七类作品浏览。
- 切到 **提示词正文**，只看已收录的作者原文，可以直接复制。任务描述和来源链接不混入这 52 条。
- 切到 **源码**，查看制作项目及许可；点击封面观看，视频失效时可打开作者原帖。
- 筛选和作品详情都有可分享的网址。按 / 搜索，按 Esc 关闭详情。

内容为 **2026-10-03** 快照。另有 76 条任务描述、19 条中文译文；公开指令可能缺少素材与修改上下文，不能保证复现。

<details>
<summary>手机界面</summary>

<img src="docs/images/gallery-mobile.png" alt="390px 手机真实界面" width="320">

</details>

## 本地运行

在 Node.js 24 下验证。克隆后执行：

```bash
git clone https://github.com/Fangx-AI/motion-library.git
cd motion-library
npm ci
npm run build
npm start
```

打开 [localhost:4188](http://127.0.0.1:4188)。纯静态页面，无需登录或模型 API Key。推送 main 后，GitHub Actions 自动构建并发布到 Pages。

| 修改内容             | 文件                                         |
| :------------------- | :------------------------------------------- |
| 页面、详情与交互     | [src/library.tsx](src/library.tsx)           |
| 搜索、筛选与浏览顺序 | [src/library-model.ts](src/library-model.ts) |
| 排版与响应式样式     | [src/library.css](src/library.css)           |
| 作品与作者资料       | [dist/works.json](dist/works.json)           |

## 来源与许可

作品编目来自 [观默 / Awesome AI Motion](https://github.com/guanmo-ai/awesome-ai-motion)，保留作者与原帖；封面引用参考库，视频引用外部媒体。参考版本见 [SOURCE.md](SOURCE.md)。

界面基于 [Aceternity UI](https://ui.aceternity.com/) 的公开组件，适配说明见 [DESIGN-SOURCES.md](DESIGN-SOURCES.md)。

原创项目代码使用 [MIT](LICENSE)。第三方作品、素材、提示词和组件按各自许可使用，见 [THIRD_PARTY.md](THIRD_PARTY.md)。公开可见不代表获得转载或商业复用授权。

补充作品请附作者原帖。欢迎 [修正资料或失效链接](https://github.com/Fangx-AI/motion-library/issues)。
