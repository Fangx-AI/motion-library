# 公开成品与私有源码

当前网站使用已购的 [Aceternity AI SaaS Template](https://ui.aceternity.com/templates/ai-saas-template)。本仓库发布 Motion Library 网站成品、文档与 [作品索引](../dist/works.json)，供在线浏览与查阅资料；不是付费模板的公开源码仓库。

## 网站与模板

当前页面由私有开发副本构建，公开发布 HTML、压缩后的 CSS 与 JavaScript，以及必要静态资源。Aceternity 付费模板原始源码、本站基于模板的开发适配与模板下载包保留私有，不作为本站公开资源提供。

官方源固定为 `a811327dfdafb4011c230c415d79f4cef05f9ba4`，取得于 2026-10-04。授权与产品适配记录见 [DESIGN-SOURCES.md](../DESIGN-SOURCES.md)。使用与分发遵循 [Aceternity 官方条款](https://ui.aceternity.com/licence)，本站 MIT 许可不覆盖该付费套件，也不向访问者转授模板许可。

仓库中的 `legacy-src/`、`legacy-build.mjs` 与旧 registry 资料属于历史免费版本，不能用于重建当前网站。`build:legacy` 只构建该旧版示例；`npm start` 预览公共 `dist/` 中已构建的成品。

## 作品与制作资料

作品索引包含作者、原帖、分类、媒体地址和取得的公开制作资料；来源版本见 [SOURCE.md](../SOURCE.md)。

封面引用上游固定版本的图片，视频引用作者原帖对应的外部媒体。本仓库不重新托管第三方视频、音轨或成品工程；源码与演示入口指向原项目。

取得的作者公开指令、任务描述和译文可以出现在作品详情中。只保留来源链接的条目不提供本站全文，也不计入作者正文统计。未取得的参考素材、私有对话与制作记录不作为已公开资料承诺。

公开文件不意味着其中所有内容都属于本站原创或获准自由复用。本站原创代码的 [MIT 许可](../LICENSE)与第三方内容权利分开，详见 [THIRD_PARTY.md](../THIRD_PARTY.md)。

资料错误、署名或移除请求请提交 [本站 Issue](https://github.com/Fangx-AI/motion-library/issues/new)，附作品链接及相关来源。
