# Fireboy and Watergirl - Play Online

森林冰火人全系列 (1-6) 在线游玩

> **[Play Online / 在线玩](https://waterfire.p.wyf9.top/)**

## About

HTML5 version of the Fireboy and Watergirl game series (1-6), deployed as a static site. Supports both desktop keyboard and mobile touch controls.

基于 HTML5 的森林冰火人游戏全系列在线版，支持桌面键盘和移动端触屏操作。

## Games

| # | Name | Temple |
|---|------|--------|
| 1 | Forest Temple | 森林神庙 |
| 2 | Light Temple | 光明神庙 |
| 3 | Ice Temple | 寒冰圣殿 |
| 4 | Crystal Temple | 水晶殿 |
| 5 | Elements | 元素 |
| 6 | Fairy Tales | 童话 |

## Controls

**Desktop:**

| Character | Jump | Left | Right |
|-----------|------|------|-------|
| Watergirl | W | A | D |
| Fireboy | Arrow Up | Arrow Left | Arrow Right |

**Mobile:** Virtual D-pad buttons appear automatically on touch devices.

## Project Structure

```
index.html              # Main game selection page
games/
  lib/
    require.js          # Shared module loader
    touch-controls.js   # Mobile touch controls
  sw.js                 # Service Worker (shared asset redirect)
  shared-assets/        # Deduplicated common assets
  1-forest-temple/      # Game 1
  2-light-temple/       # Game 2
  3-ice-temple/         # Game 3
  4-crystal-temple/     # Game 4
  5-elements/           # Game 5
  6-fairy-tales/        # Game 6
tools/                  # Build & utility scripts
  restore-assets.sh     # Restore per-game asset copies (remove SW dependency)
  *.py                  # HAR extraction scripts
img/                    # Main page assets
```

## Shared Assets & Service Worker

Identical assets across games (audio, sprites, fonts, etc.) are stored once in `games/shared-assets/` to reduce repository size. A Service Worker (`games/sw.js`) transparently redirects asset requests to the shared location.

To restore standalone per-game copies and remove the Service Worker:

```bash
bash tools/restore-assets.sh
```

## Source Repositories

This project is based on game resources from:

- [1224HuangJin/Fireboy-and-Watergirl](https://github.com/1224HuangJin/Fireboy-and-Watergirl) - Game deployment & portal page
- [yezhiyi9670/fireboy-and-watergirl-grabber](https://github.com/yezhiyi9670/fireboy-and-watergirl-grabber) - Original HAR grabber scripts

See [README.original.md](README.original.md) for the original README.

## Disclaimer

This project is for non-commercial educational and testing purposes only. All game assets belong to their respective owners.

本项目仅供非商业性学习与研究使用。所有游戏资源版权归原作者所有。

## License

[MIT](LICENSE)
