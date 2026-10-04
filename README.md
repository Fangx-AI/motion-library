# Motion Library

为动态设计与交互开发查找参考：看作品，读作者公开的约束，查看实现代码。

**[浏览 441 件作品 →](https://fangx-ai.github.io/motion-library/)** · [52 条作者提示词](https://fangx-ai.github.io/motion-library/?type=prompt) · [25 件附源码作品](https://fangx-ai.github.io/motion-library/?type=code)

[![网站真实首页：Aceternity Hero 与 Clearwater 作品](docs/images/library-overview.jpg)](https://fangx-ai.github.io/motion-library/)

## 从三个案例开始

### [Clearwater · 浅水与交互涟漪](https://fangx-ai.github.io/motion-library/?work=2102786378282987591)

**作者**：[Aurélien / @Aurelien\_Gz](https://x.com/Aurelien_Gz)\
**值得看**：点击涟漪与折射焦散如何共同呈现浅水质感；可把演示与单文件 WebGL2 实现对照阅读。\
**可得资料**：[交互演示](https://aureliengmz.github.io/clearwater/) · [作者源码（MIT）](https://github.com/Aureliengmz/clearwater) · [上游编目与制作建议](https://github.com/guanmo-ai/awesome-ai-motion/blob/2ff3da3f72385c7944f53faac253f2a6f5bbf936/cases/2102786378282987591.md)

演示需浏览器支持 WebGL2。公开创作说明提到视频参考，完整实际提示词未取得；上游制作建议是编辑整理。

### [像素巫师 · 施法循环](https://fangx-ai.github.io/motion-library/?work=2102476258948927543)

**作者**：[Majid Manzarpour / @majidmanzarpour](https://x.com/majidmanzarpour)\
**值得看**：128×96 逻辑画布、整数缩放与固定色板如何形成像素风；角色状态和粒子池被写成了明确的规格。\
**可得资料**：[本站阅读规格原文](https://fangx-ai.github.io/motion-library/?work=2102476258948927543) · [作者公开的 Canvas 2D 指令](https://x.com/majidmanzarpour/status/2102476499387383834)

### [一个形状串起整套 UI](https://fangx-ai.github.io/motion-library/?work=2103273003555402193)

**作者**：[zero / @twoclipping](https://x.com/twoclipping)\
**值得看**：同一形状如何在按钮、播放器与图表间连续变形；120 BPM 节拍和弹簧响应把镜头、拖动与转场联系起来。\
**可得资料**：[本站阅读模板原文](https://fangx-ai.github.io/motion-library/?work=2103273003555402193) · [作者公开的节奏与视觉约束](https://x.com/twoclipping/status/2103273003555402193)

模板会先询问 UI 状态、配色和音乐输入。公开指令与本站收录资料不代表完整制作对话；以上案例未由本站独立复现。

## 收录范围

数据基于 **2026-10-03** 快照，编目来源是 [观默 / Awesome AI Motion](https://github.com/guanmo-ai/awesome-ai-motion)。52 条作者原文正文与 76 条任务描述分开标记；19 条中文译文是辅助阅读，只有来源链接的条目不计入正文。附源码不等于允许自由复用，许可以原项目为准。

视频引用外部媒体；播放失败时可打开作者原帖。来源、统计与标记规则见 [SOURCE.md](SOURCE.md) 和 [资料说明](docs/SOURCES.md)。

<details>
<summary>本地运行与开发</summary>

在 Node.js 24 下验证。以下命令启动静态网站；无需登录或模型 API Key。

```bash
git clone https://github.com/Fangx-AI/motion-library.git
cd motion-library
npm ci
npm run build
npm start
```

打开 [localhost:4188](http://127.0.0.1:4188)。推送 main 后由 GitHub Actions 发布到 GitHub Pages。

[页面与交互](src/library.tsx) · [筛选逻辑](src/library-model.ts) · [界面样式](src/library.css) · [作品数据](dist/works.json)

</details>

## 维护与许可

界面直接采用 [Aceternity UI](https://ui.aceternity.com/) 的免费 Hero 页面块与官方组件。完整来源、原始文件 hash 和功能适配见 [设计来源](DESIGN-SOURCES.md)。本站接入作品与资料；原始编目归上游，作品归原作者。

补充作品、资料纠错、失效链接或移除请求，请提交 [本站 Issue](https://github.com/Fangx-AI/motion-library/issues/new)，附作品链接与相关来源。

本站原创代码按 [MIT](LICENSE) 使用；第三方作品、提示词、媒体与组件不包含在该授权内，见 [第三方内容与许可](THIRD_PARTY.md)。
