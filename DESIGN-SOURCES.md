# 界面设计来源

网站采用用户指定的 [Aceternity UI](https://ui.aceternity.com/) 官方公开组件与免费页面块。首页的结构、字体尺度、颜色、间距、边框、圆角与动效沿用官方示例；作品、文案、链接和资料状态由本站接入。公开来源取得于 **2026-10-04**，未使用付费模板或 Pro 页面块。

这是对现成设计的产品适配，不表示每行程序都由 Aceternity 编写。搜索、筛选、数据读取、媒体加载、深链接和可访问性行为由本站实现。

## 完整页面块

| 网站位置 | 官方来源 | 保留与适配 |
| :--- | :--- | :--- |
| 首页 | [Hero Sections Free · HeroSectionOne](https://ui.aceternity.com/components/hero-sections-free) · [registry](https://ui.aceternity.com/registry/hero-section-demo-1.json) | 保留外框、居中标题、入场动画、双按钮和大幅媒体框；换成实际作品与中文文案。删除块内演示导航，避免与顶部导航重复。 |
| 作品列表 | [Expandable Card · Grid](https://ui.aceternity.com/components/expandable-card) · [registry](https://ui.aceternity.com/registry/expandable-card-demo-grid.json) | 沿用官方 `max-w-2xl` 与两列作品卡结构；替换为 441 件作品数据，入口改为可用键盘操作的按钮。详情使用下列 Animated Modal。 |
| 底部链接 | [HeroSectionOne 内部 Navbar](https://ui.aceternity.com/components/hero-sections-free) · [外框 registry](https://ui.aceternity.com/registry/hero-section-demo-1.json)；[Resizable Navbar](https://ui.aceternity.com/components/resizable-navbar) · [按钮 registry](https://ui.aceternity.com/registry/resizable-navbar.json) | 上下边框行与布局来自 HeroSectionOne 内部 Navbar，按钮复用 Resizable Navbar 的 `NavbarButton`，接入本站来源与反馈链接。它不是 Aceternity Pro Footer block。 |

这些块在 [library.tsx](src/library.tsx) 中接入本站内容。

## 原子组件与示例

| 网站位置 | 官方组件 / 示例 | 本站适配文件与用途 |
| :--- | :--- | :--- |
| 桌面与手机导航 | [Resizable Navbar](https://ui.aceternity.com/components/resizable-navbar) · [组件 registry](https://ui.aceternity.com/registry/resizable-navbar.json) · [demo registry](https://ui.aceternity.com/registry/resizable-navbar-demo.json) | [resizable-navbar.tsx](src/components/ui/resizable-navbar.tsx)：保留官方桌面收缩至 40%、最小 800px 与手机收缩至 90% 的结构和动效，替换品牌、菜单和链接。 |
| 搜索输入 | [Signup Form 的 Input / Label](https://ui.aceternity.com/components/signup-form) · [Input registry](https://ui.aceternity.com/registry/input.json) · [Label registry](https://ui.aceternity.com/registry/label.json) · [demo registry](https://ui.aceternity.com/registry/signup-form-demo.json) | [input.tsx](src/components/aceternity/input.tsx)、[label.tsx](src/components/aceternity/label.tsx)：沿用输入框样式、阴影与悬停效果，用作单行作品搜索；没有接入登录表单。 |
| 资料模式、分类与排序 | [Tabs](https://ui.aceternity.com/components/tabs) · [registry](https://ui.aceternity.com/registry/tabs.json) | [tabs.tsx](src/components/aceternity/tabs.tsx)：保留官方导航按钮与选中背景，为筛选加入受控值及仅导航模式。 |
| 作品详情 | [Animated Modal](https://ui.aceternity.com/components/animated-modal) · [registry](https://ui.aceternity.com/registry/animated-modal.json) | [animated-modal.tsx](src/components/aceternity/animated-modal.tsx)：保留官方弹窗外观与入场动画；接入受控打开、焦点约束、Escape、关闭后焦点恢复及资料滚动。 |
| 点击弹窗外部关闭 | [Expandable Card 的 useOutsideClick](https://ui.aceternity.com/components/expandable-card) · [hook registry](https://ui.aceternity.com/registry/use-outside-click.json) | [use-outside-click.tsx](src/components/aceternity/use-outside-click.tsx)：保留官方外部点击监听，补齐 React 19 与原生事件类型。 |
| 作者指令原文 | [Code Block](https://ui.aceternity.com/components/code-block) · [registry](https://ui.aceternity.com/registry/code-block.json) | [code-block.tsx](src/components/aceternity/code-block.tsx)：使用文本语言展示原文，保留官方文本面板与复制入口；复制作者原文，中文译文另行标记。 |
| 加载更多作品 | [Stateful Button](https://ui.aceternity.com/components/stateful-button) · [registry](https://ui.aceternity.com/registry/stateful-button.json) | [stateful-button.tsx](src/components/aceternity/stateful-button.tsx)：沿用官方按钮及状态动效，接入本站列表分页。 |

## 适配边界

页面不另加一套主题，也不通过自建装饰 CSS 覆盖官方设计。[library.css](src/library.css) 补齐官方 Input 阴影配置、焦点可见性、控件状态、滚动定位、弹窗滚动及用户选择的减弱动画。

原子组件的接口改动与兼容处理另见 [适配记录](src/components/aceternity/ADAPTATIONS.md)，包括 Tailwind 4 遮罩透明度语法、受控筛选、复制反馈及原文换行。

作者署名、实际视频、封面、制作指南、提示词、资料类别与内容版权来自作品编目，不属于 Aceternity。媒体播放器使用浏览器原生控件，媒体加载反馈和素材比例处理属于功能适配。数据与资料判定见 [library-model.ts](src/library-model.ts)，作品来源见 [SOURCE.md](SOURCE.md)。

## 核对原始来源

[来源 manifest](docs/aceternity-reference/manifest.json) 为以上每份 registry 记录完整 URL、完整 SHA-256 与每个原始源码文件的 hash；[核对说明](docs/aceternity-reference/README.md) 解释其计算方法。原始文件保留在开发资料中，本仓库不另行分发独立的组件参考包。

<details>
<summary>2026-10-04 官方 registry 的 SHA-256</summary>

| Registry 名称 | SHA-256 |
| :--- | :--- |
| `hero-section-demo-1` | `f1e5c00080b7f00863633cb83c73db7ba17c3acab8da7629026cb08d447ad45a` |
| `resizable-navbar` | `3294ecb0b3efacc058c190575a1bdacd9084f7b994812d4f3e3879b0ba5440f9` |
| `resizable-navbar-demo` | `616ac73c8c3d3aa4b7468227dba8cb4c0970bf83c387d2c9701db93890e50773` |
| `expandable-card-demo-grid` | `94be5ae18c6f4297e2b4a50dfcd1c62b0d7c0e5999e08d3f395903318428d7bd` |
| `input` | `8e1d9209741a5a8aac7f0d314d2ae4ca2e071a4f6faa595c1df5b0f81845cb53` |
| `label` | `9d4dea1eb3cdbf1a48ab515ba3b06df551296074f126d9831a5d6e2f71bed355` |
| `signup-form-demo` | `4de38d1cd76a0bb64db5b85063590ccc698ceced237d29e8160887637a3f96be` |
| `tabs` | `a0f2d1eb503190ec2e53ee5887a9b33d7c94e3f6d6548f07afd0a79ef0effcaa` |
| `animated-modal` | `141e95b1c01a22c3678be302a2eac5091b3dd0b8ceeebd7a6dbd461861ebf92a` |
| `use-outside-click` | `92c0a8c69abffce33a1ecbe8c9a44e01a8642a4cbb8d5f202047946940316095` |
| `code-block` | `fa45c82d6dd867477213374d837ea75b00d4642ef686edf15cbc4df743d623d2` |
| `stateful-button` | `a56addb268e991c0db018e20dbee7fb00ef9e0a3991053d696e765848c866b66` |

</details>

## 使用条款

组件与示例作者保留其权利，使用遵循 [Aceternity 官方许可与条款](https://ui.aceternity.com/licence)及对应组件说明。本站的 [MIT 许可](LICENSE)仅适用于本站原创部分，不把第三方组件重新授予 MIT 许可。第三方作品与制作资料的权利说明见 [THIRD_PARTY.md](THIRD_PARTY.md)。
