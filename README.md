# MarginNote Companion

An Obsidian plugin to bridge MarginNote 3 and Obsidian

用于连接 MarginNote 3 和 Obsidian 的 Obsidian 插件

![demo](assets/demo.webp)

## Features 特性

- Import note/selection from MarginNote 3
  - Support backlink to MarginNote
  - Support excerpt pictures imports
  - Support video notes imports ([media-extended](https://github.com/aidenlx/media-extended) required)
- Import note hierarchy tree / toc from PDF
- Multiple ways to quickly insert MarginNote data to Obsidian note
  - Insert note by simply select(in MarginNote)-paste(in Obsidian) (only supported in desktop)
  - Insert note via command: hotkey, mobile toolbar button and/or swipe gesture (configuration required)
  - autopaste: Automatically insert to active note in obsidian on selecting note/PDF text in MarginNote 3
- Template support: specify how the MarginNote 3 note/selection/toc should be inserted
  - via context menu options in editor
  - via command (with `show in command` enabled)
- Import to metadata: convert title-links in MarginNote 3 to `aliases` in Obsidian, and add button to go back to the source MarginNote note

---

- 从 MarginNote 3 导入笔记/选中文本
  - 支持反向链接到 MarginNote
  - 支持摘录图片导入
  - 支持视频笔记导入（需要安装[media-extended](https://github.com/aidenlx/media-extended)）
- 树状导入笔记 / PDF 的目录
- 多种方式快速插入 MarginNote 数据到 Obsidian 笔记
  - 通过简单地（在 MarginNote 中）选择-（在 Obsidian 中）粘贴插入注释（仅在桌面版本支持）
  - 通过命令插入注释：快捷键、移动工具栏按钮和（或）滑动手势（需要自行配置）
  - 自动粘贴：在 MarginNote 3 中选择笔记/PDF 文本时，自动插入 Obsidian 当前活跃的笔记
- 模板支持：指定如何插入 MarginNote 3 的笔记/选择/目录
  - 通过编辑器中的右键菜单选项
  - 通过命令（需要启用对应选项）
- 导入元数据：将 MarginNote 3 中的标题链接转换为 Obsidian 中的`aliases`，并添加返回源 MarginNote 笔记的按钮

## How to use 如何使用

Go to [MarginNote Companion wiki](https://github.com/aidenlx/marginnote-companion/wiki) for more details

前往 [MarginNote Companion wiki](https://github.com/aidenlx/marginnote-companion/wiki) 查看更多使用说明

## Compatibility 兼容性

The required API feature is only available for Obsidian v0.12.5+.

所需的 API 功能需要 Obsidian v0.12.5+.

## Installation 安装

Before installing this plugin:

1. download the latest `.mnaddon` installer from [GitHub Release of obsidian-bridge](https://github.com/aidenlx/obsidian-bridge/releases)
2. follow the [instruction](https://github.com/aidenlx/obsidian-bridge#installation-%E5%AE%89%E8%A3%85) to install and enable obsidian-bridge in MarginNote 3 (it should be a bridge icon at one side of the screen when a notebook/document is opened, click/tap on the icon to enable it)

---

在安装这个插件之前：

1. 从 [obsidian-bridge 的 GitHub Release](https://github.com/aidenlx/obsidian-bridge/releases) 下载最新的`.mnaddon`安装程序
2. 按照[说明](https://github.com/aidenlx/obsidian-bridge#installation-%E5%AE%89%E8%A3%85)在 MarginNote 3 中安装和启用 obsidian-bridge（打开笔记本/文档时在屏幕一侧显示的桥图标，单击图标以启用插件）

### From GitHub

1. Download the latest release `marginnote-companion.zip` from [the Releases section of the GitHub Repository](https://github.com/aidenlx/marginnote-companion/releases)
2. Put the files (`main.js`, `manifest.json`, `styles.css`) in `marginnote-companion.zip` to your vault's plugins folder: `<vault>/.obsidian/plugins/marginnote-companion`
3. Reload Obsidian
4. If prompted about Safe Mode, you can disable safe mode and enable the plugin.
   Otherwise, head to Settings, third-party plugins, make sure safe mode is off and
   enable the plugin from there.

> Note: The `.obsidian` folder may be hidden. On macOS, you should be able to press `Command+Shift+Dot` to show the folder in Finder.

---

1. 从 [此插件 GitHub 仓库的 Releases](https://github.com/aidenlx/marginnote-companion/releases) 下载`marginnote-companion.zip`
2. 把`marginnote-companion.zip`内的三个文件（`main.js`, `manifest.json`, `styles.css`）放在对应 Vault 的插件文件夹下：`<vault>/.obsidian/plugins/marginnote-companion`
3. 重新加载 Obsidian
4. 如果出现有关安全模式的提示，则可以禁用安全模式并启用插件。否则，请转到`设置`→`第三方插件`，确保关闭安全模式，然后从`第三方插件`启用插件

> 注意，`.obsidian`文件夹为隐藏文件夹，在 macOS 的 Finder 下可以按`Command+Shift+.`以显示隐藏文件夹

### From Obsidian

> Not yet available

1. Open `Settings` > `Third-party plugin`
2. Make sure Safe mode is **off**
3. Click `Browse community plugins`
4. Search for this plugin
5. Click `Install`
6. Once installed, close the community plugins window and the patch is ready to use.

---

1. 打开`设置`>`第三方插件`
2. 确保安全模式为`关闭`
3. 点击`浏览社区插件`
4. 搜索此插件
5. 点击`安装`
6. 安装完成后，关闭安装窗口，插件即可使用
