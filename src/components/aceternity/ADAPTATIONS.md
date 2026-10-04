# Aceternity 原子组件的业务适配

这些组件直接复制自 Aceternity 的公开 registry。组件的原有视觉类、配色、圆角、阴影和动画参数保留；以下改动用于本项目的状态集成、长原文阅读及可访问性。

## 官方源文件

| 本地文件 | 官方 registry | 官方源文件 SHA-256 |
| --- | --- | --- |
| `input.tsx` | [input](https://ui.aceternity.com/registry/input.json) | `07d015c40c7ea00c108df95dc80d50c52c74aafe900ec48f7ed33058ade5fe6e` |
| `label.tsx` | [label](https://ui.aceternity.com/registry/label.json) | `0e7dbd95b199d23704af5c4b5517fabc1595ef3dea448b9a0158654d1765ac4b` |
| `tabs.tsx` | [tabs](https://ui.aceternity.com/registry/tabs.json) | `0d34660aeb2d49d912b1216343bf7a86edf6dc2e0eb097ad53c30068e6950a71` |
| `stateful-button.tsx` | [stateful-button](https://ui.aceternity.com/registry/stateful-button.json) | `b19e3cee5986e376b9bffb740b77747ffd3c149d150c9e36b73c395ba7cb2ef9` |
| `code-block.tsx` | [code-block](https://ui.aceternity.com/registry/code-block.json) | `3715eb017b80e5c019db8d60a22c1d0e72390cc6c17ec958bd9358548a19b076` |
| `animated-modal.tsx` | [animated-modal](https://ui.aceternity.com/registry/animated-modal.json) | `9d4166aa1229b45725c62bbde513a7198639df9365253c9e7be604b00bf1ea20` |
| `use-outside-click.tsx` | [use-outside-click](https://ui.aceternity.com/registry/use-outside-click.json) | `6c6bcad82c0fc7fc993935f651985ef4f6bd631c24ff5e87d25e5a31a60802e4` |

## 逐项说明

- `input.tsx`、`label.tsx`：只把 `@/lib/utils` 导入改为本项目的相对路径。官方视觉与行为保留。Input 保留标准的 `value`、`onChange`、`ref`；Label 仍采用 Radix Label。
- `stateful-button.tsx`：导入路径适配之外，在加载动画、业务回调与成功动画之间检查动画 scope 是否仍在文档内。筛选改变或分页结束导致按钮卸载时，不再启动后续动画；只有 scope 已断开且异常确实属于动画取消或 Motion 的 `No valid elements provided.` 时停止该次状态动画。业务回调错误及其他动画错误继续向外抛出，不显示虚假的成功。官方全部视觉类、加载/成功图标及动画参数保留。
- `tabs.tsx`：增加 `value` / `onValueChange` 受控接口，让类别、资料类型、排序与 URL 同步；增加 `navigationOnly`，筛选栏直接使用官方导航行，不渲染重复的叠层内容；增加 `ariaLabel`、`aria-pressed` 和 `type="button"`。用稳定的 `value` 作 key，数量变化不移除当前按钮。每行使用独立的动画 layout ID，避免三个筛选栏的 pill 相互跳转。默认完整 Tabs 内容与原动画参数仍保留。
- `animated-modal.tsx`：Modal / ModalProvider 增加 `open` / `onOpenChange` / `defaultOpen`，接入现有详情及浏览器历史。ModalBody 增加 dialog 语义与名称、Escape、Tab 焦点约束、打开时聚焦和关闭时焦点恢复；完整恢复打开之前的 body overflow。关闭按钮增加可访问名称。ModalContent 接受标准 HTML div 属性，允许将 `id` 绑定到实际滚动容器，切换作品时可正确回到顶部；原有类与布局不变。直接复用官方 outside-click hook，去除源文件末尾的重复实现。
- `animated-modal.tsx` 的 overlay：把官方 `bg-black bg-opacity-50` 转写为 Tailwind 4 等价的 `bg-black/50`；避免已移除的 opacity utility 变成完全黑色遮罩。透明度维持官方的 50%。其余容器、内容、页脚、旋转和弹簧动画的视觉参数未重设。
- `code-block.tsx`：保留官方 slate 容器、atomDark 主题、字体和工具栏。本站仅展示 `text` 原文，采用同一依赖的 `PrismLight` 导出，不加载完整语法集合；atomDark 从对应 ESM 单主题文件导入，主题对象不变，也不打包其他主题。修复原示例启用 tabs 后不显示复制按钮的问题。默认复制当前 tab 的内容，按钮明确说明当前复制对象，并报告真实的成功或失败；`copyText` 可将复制固定为作者原文，`copyLabel` 可提供明确名称。反馈计时器在卸载时清理。可选 `showLineNumbers` 默认保持官方的 `true`，纯文本可关闭行号。长行使用 `pre-wrap` / `overflow-wrap`，不设置内部高度限制；原文仍完整呈现，复制得到未改写的文本。避免无内容时渲染字符串 `undefined`。
- `use-outside-click.tsx`：保留原有监听行为，只为 React 19 的可空 ref 与原生 MouseEvent / TouchEvent 补齐类型。

## 集成接口

```tsx
<Tabs
  tabs={[{ title: "全部作品", value: "all" }]}
  value={mode}
  onValueChange={setMode}
  navigationOnly
  ariaLabel="按资料类型筛选"
/>

<Modal open={Boolean(active)} onOpenChange={(open) => { if (!open) close(); }}>
  <ModalBody aria-labelledby="detail-title">
    <ModalContent className="min-h-0 overflow-y-auto">...</ModalContent>
    <ModalFooter>...</ModalFooter>
  </ModalBody>
</Modal>

<CodeBlock
  language="text"
  filename="author-prompt.txt"
  code={authorOriginal}
  copyLabel="复制作者原文"
  showLineNumbers={false}
/>
```

`ModalContent` 的滚动类由使用方提供，只处理长资料与视口高度，不改变组件主题。ModalBody 采用 `role="dialog"` 的官方 motion 容器，使用方应查询 `[role="dialog"][aria-modal="true"]`。

新增依赖：`@radix-ui/react-label`、`react-syntax-highlighter`，均为对应官方组件的依赖；没有新增自定义主题。
