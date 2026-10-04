# Aceternity 来源核对

[manifest.json](manifest.json) 记录当前网站所用官方设计来源，取得于 **2026-10-04**。

每项包含官方组件说明页、公开 registry URL、下载时 registry 的完整 SHA-256，以及 registry 内每个原始源码文件的 SHA-256。源码文件 hash 根据 registry 中未经修改的 `content` 按 UTF-8、无 BOM 保存后计算；它不同于本站适配后的文件 hash。

官方 registry 会更新。若当前 URL 返回值与记录 hash 不同，只能说明来源已变化，不能据此判定本站的记录错误。

本目录仅公开来源记录，不附独立组件包或原始模板。网站的适配源码位于 [src](../../src)，具体页面映射与改动说明见 [DESIGN-SOURCES.md](../../DESIGN-SOURCES.md)。使用遵循 [Aceternity 官方条款](https://ui.aceternity.com/licence)，本站 MIT 许可不替代第三方条款。