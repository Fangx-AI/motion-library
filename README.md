# Motion Library

中文动效作品与制作资料库。

**441 件作品 · 52 条作者提示词正文 · 25 件作品附源码**

**[浏览作品 →](https://fangx-ai.github.io/motion-library/)** · [作者提示词](https://fangx-ai.github.io/motion-library/?type=prompt) · [制作源码](https://fangx-ai.github.io/motion-library/?type=code)

![网站真实精选区：交互水面、像素巫师与 15 秒动态设计，以及作者提示词和源码入口](docs/images/showcase.png)

## 作品与制作资料

| 作品                                                                                          | 可查看的制作资料                          |
| :-------------------------------------------------------------------------------------------- | :---------------------------------------- |
| [Clearwater · 交互水面](https://fangx-ai.github.io/motion-library/?work=2102786378282987591)  | 实时水面与涟漪源码；原项目 MIT 许可       |
| [像素巫师 · 施法循环](https://fangx-ai.github.io/motion-library/?work=2102476258948927543)    | 作者提示词：Canvas 2D、角色状态、粒子系统 |
| [一个形状串起整套 UI](https://fangx-ai.github.io/motion-library/?work=2103273003555402193)    | 作者提示词：节奏、场景与视觉约束          |
| [Spiderbench · 城市荡行](https://fangx-ai.github.io/motion-library/?work=2104001664793600012) | 浏览器交互项目源码；许可限制见项目说明    |

**资料区分：** 52 条提示词正文均为作者原文，另有 76 条任务描述、19 条中文译文，页面分别标记。仅有来源链接的作品不计入正文。

内容为 **2026-10-03** 快照；公开指令可能缺少素材与修改上下文，不能保证复现。视频失效时，可从详情打开作者原帖。

<details>
<summary>手机界面</summary>

<img src="docs/images/gallery-mobile.png" alt="390px 手机真实界面" width="320">

</details>

## 本地运行

在 Node.js 24 下验证：

```bash
git clone https://github.com/Fangx-AI/motion-library.git
cd motion-library
npm ci
npm run build
npm start
```

打开 [localhost:4188](http://127.0.0.1:4188)。纯静态页面，无需登录或模型 API Key；推送 main 后自动发布到 GitHub Pages。

[页面与交互](src/library.tsx) · [筛选逻辑](src/library-model.ts) · [界面样式](src/library.css) · [作品数据](dist/works.json)

## 来源与许可

作品编目来自 [观默 / Awesome AI Motion](https://github.com/guanmo-ai/awesome-ai-motion)，保留作者与原帖；封面引用参考库，视频引用外部媒体。版本记录见 [SOURCE.md](SOURCE.md)。

界面基于 [Aceternity UI](https://ui.aceternity.com/) 的公开组件，适配说明见 [DESIGN-SOURCES.md](DESIGN-SOURCES.md)。

原创项目代码使用 [MIT](LICENSE)。第三方作品、媒体、提示词和组件按各自许可使用，见 [THIRD_PARTY.md](THIRD_PARTY.md)；公开可见不代表转载或商业复用授权。

补充作品请附作者原帖。欢迎 [修正资料或失效链接](https://github.com/Fangx-AI/motion-library/issues)。
