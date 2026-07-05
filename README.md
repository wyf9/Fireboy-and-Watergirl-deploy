# 🎮 Fireboy and Watergirl Batch Grabber & Play Online
# 森林冰火人全系列批量抓取与在线游玩

This repository is an upgraded, batch-processing version of the original H5 game grabber. It enables you to download the game assets completely offline, and also provides direct online play via GitHub Pages!

本仓库是基于原版 H5 游戏抓取脚本的**批量升级版**。它不仅支持一键抓取全系列素材，还通过 GitHub Pages 提供了**全系列直接在线游玩**的无缝体验！

> [!warning]
> 
> **⚠️ DISCLAIMER / 免责声明:** 
>
> This project is for nonprofit testing and educational purposes only.
>
> 本项目仅供非营利性学习与研究使用。
>
> ---
> The content in this repository, including but not limited to: optimized versions of `.py` files, are all upgraded by AI.
>
> 本存储库内的内容，包括但不限于：`.py` 文件的优化版，皆由AI升级。
>
> 
> 并且，**本存储库以MIT 开源协议发布** | And, **This repository is released under the MIT open source license**

---

## ⚡ Direct Play Links / 在线直接游玩地址

Click the links below to play **Games A to F** directly in your browser:

点击下方链接，并选择关卡即可在浏览器中直接畅玩 **森林冰火人 1-6 代全系列**：

*   🔥 🌍 **[Play Game / 开始游戏](https://1224HuangJin.github.io/Fireboy-and-Watergirl/)**

---

## 📦 What's in this Repository? / 仓库里有什么？

This repository contains both the automation tools and the complete offline game clients:

本仓库既包含自动化抓取工具，也包含已经抓取完成、解包成功的全系列游戏成品：

1.  **`output/` (The Game Clients / 游戏成品):** 
    *   Contains subfolders `A/` to `F/`. Each folder is a complete, standalone HTML5 game client (including `gameIndex.html`, textures, and audio).
    *   包含 `A/` 到 `F/` 子文件夹。每个文件夹都是一套完整的独立 H5 游戏客户端（包含完整的图片、音效、关卡数据）。
2.  **`1.unpack_har.py` & `2.grab_files.py` (The Core Tools / 核心脚本):**
    *   The powerful automation engine that parses HAR network logs and batch-downloads thousands of assets with smart-resume support.
    *   功能强大的自动化引擎。支持解析 HAR 网络日志，一键批量抓取成千上万的游戏素材，并支持断点续传。
3.  `common.py`: Path and template configuration. / 统一的路径与模板配置中心。
4.  `tiled-atlasses/`: Tileset texture assets used for editing or custom map creation via **Tiled**. / 用于通过 Tiled 编辑器修改或自定义游戏地图的图集素材。
5.  `index.html`: The gorgeous web portal page for selecting games. / 精美的游戏选关传送门主页。

---

## 👥 Source & Changes / 源仓库与改动

* **Original Soucre**:
    * [yezhiyi9670/fireboy-and-watergirl-grabber](https://github.com/yezhiyi9670/fireboy-and-watergirl-grabber/)

*   **Upgrades in this Repo / 本仓库的改动:** 
    *   Refactored from single-game processing into an automated loop for all 6 games (`A` through `F`). (从原本只能处理单部游戏，重构为 A-F 全系列自动化循环处理)。
    *   Added static file paths to decouple it from individual session configurations, enabling direct web deployment like GitHub Pages. (优化了静态文件路径结构，使其解耦，从而能够直接部署在 GitHub Pages 等静态托管平台上)。

---

# ORIGINAL README:

This is a simple script that grabs the resources and levels of the H5-based Fireboy and Watergirl game from a certain online source, enabling you to play it offline and edit the levels.

> DISCLAIMER: This script is for nonprofit testing and educational purposes only. The author is not responsible for potential commercial and legal risks caused by abusing this script or files grabbed using it.

Usage:

1. Open a new tab in your browser, open DevTools (normally by pressing `F12`), and then visit the game page.
2. Navigate into each temple, and then an arbitrary level in that temple. This makes sure that all common resources are loaded. You do not have to play the game - just navigate in and out.
3. Switch to the Network panel of DevTools. Right click, and select 'Save all to HAR'. Save the HAR file into the `har` directory.
4. Open `common.py` and set `grab_url` `har_path` properly.
5. Run `1.unpack_har.py`.
6. Inspect `data/resource-list.json` manually to make sure things work.
7. Run `2.grab_files.py` and wait. This grabs all resource files from the online source.
8. The results will be found in the `output` directory.

Note that the `gameIndex.html` will likely not work if directly opened in the browser. Make sure to serve it through a local webserver. A simple way of doing this is using `npx serve`.

The level files can be edited using [Tiled](https://github.com/mapeditor/tiled). If you decide to use it, be notified that:

1. Tiled may need additional tileset atlasses to properly render the levels. You can use [the ones in this repository](./tiled-atlasses/) if you don't want to draw your own ones.
2. Please use the `json1.dll` plugin instead of `json.dll` (except for Fireboy and Watergirl 6 Fairy Tales). The latter will emit a newer json format which does not work with the game.
