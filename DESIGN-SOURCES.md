# 界面组件来源

本项目按用户指定的 [Aceternity UI](https://ui.aceternity.com/) 公开组件设计与适配，保留以下来源。公开源码取得于 2026-10-03 与 2026-10-04；没有使用付费模板或 Pro 素材。

| 官方来源 | 本仓库对应文件 |
| :--- | :--- |
| [Bento Grid](https://ui.aceternity.com/components/bento-grid) | [bento-grid.tsx](src/components/ui/bento-grid.tsx) |
| [Resizable Navbar](https://ui.aceternity.com/components/resizable-navbar) | [resizable-navbar.tsx](src/components/ui/resizable-navbar.tsx) |
| [Card Hover Effect](https://ui.aceternity.com/components/card-hover-effect) | [gallery-hover-effect.tsx](src/components/ui/gallery-hover-effect.tsx) |
| [Tabs](https://ui.aceternity.com/components/tabs) | [category-tabs.tsx](src/components/ui/category-tabs.tsx) |
| [Animated Modal](https://ui.aceternity.com/components/animated-modal) | [animated-dialog.tsx](src/components/ui/animated-dialog.tsx) |

组件适配为作品入口、分类筛选与资料详情；作品数据、资料标记和浏览逻辑见 [library.tsx](src/library.tsx) 与 [library-model.ts](src/library-model.ts)。是否用于当前页面以实际组件调用为准。原示例中的 Spotlight、Hover Border Gradient 已从活动界面移除。

原生 `dialog` 提供详情焦点约束、Escape 与关闭行为；外部媒体、资源入口和作者署名属于本站的作品展示逻辑。

组件作者保留其权利，使用按 [Aceternity 官方条款](https://ui.aceternity.com/licence)及各组件说明；本站 [MIT 许可](LICENSE)仅适用于本站原创部分，不把第三方组件统一改许可。内容来源与媒体权利另见 [SOURCE.md](SOURCE.md) 和 [THIRD_PARTY.md](THIRD_PARTY.md)。
