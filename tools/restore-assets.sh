#!/usr/bin/env bash
#
# restore-assets.sh
#
# Copies shared assets back into each game directory and removes
# the Service Worker setup, making every game fully self-contained.
#
# Usage:  bash tools/restore-assets.sh
#
# After running, you can safely delete:
#   - games/shared-assets/
#   - games/sw.js
# And remove the <script>...serviceWorker...</script> block from each game's index.html.

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

SHARED="games/shared-assets"

if [ ! -d "$SHARED" ]; then
    echo "Error: $SHARED not found. Assets may already be restored."
    exit 1
fi

# --- Assets shared across ALL 6 games ---
ALL6_FILES=(
    assets/atlasses/CharAssets.json
    assets/atlasses/CharAssets.png
    assets/atlasses/GroundAssets.json
    assets/atlasses/GroundAssets.png
    assets/atlasses/MenuBackgrounds.json
    assets/atlasses/MenuBackgrounds.png
    assets/atlasses/PreloaderAssets.json
    assets/atlasses/PreloaderAssets.png
    assets/audio/CharToggle1.mp3
    assets/audio/CharToggle2.mp3
    assets/audio/Clock.mp3
    assets/audio/Death.mp3
    assets/audio/Diamond.mp3
    assets/audio/Door.mp3
    assets/audio/EndDiamond.mp3
    assets/audio/EndFail.mp3
    assets/audio/EndPass.mp3
    assets/audio/Freeze.mp3
    assets/audio/IceSteps_fb.mp3
    assets/audio/IceSteps_wg.mp3
    assets/audio/Jump_fb.mp3
    assets/audio/Jump_wg.mp3
    assets/audio/LevelMusic.mp3
    assets/audio/LevelMusicFinish.mp3
    assets/audio/LevelMusicFinish_speed.mp3
    assets/audio/LevelMusic_dark.mp3
    assets/audio/LevelMusic_speed.mp3
    assets/audio/LevelMusicOver.mp3
    assets/audio/Lever.mp3
    assets/audio/LightPusher.mp3
    assets/audio/Melt.mp3
    assets/audio/MenuMusic.mp3
    assets/audio/Platform.mp3
    assets/audio/PortalClose.mp3
    assets/audio/PortalLoop.mp3
    assets/audio/PortalOpen.mp3
    assets/audio/PortalTransport.mp3
    assets/audio/Pusher.mp3
    assets/audio/Slider.mp3
    assets/audio/WaterSteps.mp3
    assets/audio/Wind.mp3
    assets/images/Beam.png
    assets/images/branding/branding_logo_kizi.png
)

ALL6_GAMES=(1-forest-temple 2-light-temple 3-ice-temple 4-crystal-temple 5-elements 6-fairy-tales)

# --- Assets shared across games 1-4 only ---
G1234_FILES=(
    assets/atlasses/MechAssets.json
    assets/atlasses/MechAssets.png
    assets/atlasses/MenuAssets.json
    assets/atlasses/MenuAssets.png
    assets/fonts/chinese/font.fnt
    assets/fonts/chinese/font.png
    assets/tilemaps/tilesets/Ground.json
    assets/tilemaps/tilesets/LargeObjects.json
    assets/tilemaps/tilesets/Objects.json
)

G1234_GAMES=(1-forest-temple 2-light-temple 3-ice-temple 4-crystal-temple)

echo "Restoring shared assets to game directories..."

for f in "${ALL6_FILES[@]}"; do
    for g in "${ALL6_GAMES[@]}"; do
        dest="games/$g/$f"
        mkdir -p "$(dirname "$dest")"
        cp "$SHARED/$f" "$dest"
    done
done

for f in "${G1234_FILES[@]}"; do
    for g in "${G1234_GAMES[@]}"; do
        dest="games/$g/$f"
        mkdir -p "$(dirname "$dest")"
        cp "$SHARED/$f" "$dest"
    done
done

echo "Removing shared-assets directory..."
rm -rf "$SHARED"

echo "Removing Service Worker..."
rm -f games/sw.js

echo "Removing SW registration from game HTML files..."
for g in "${ALL6_GAMES[@]}"; do
    html="games/$g/index.html"
    if [ -f "$html" ]; then
        # Remove the <script>...serviceWorker...</script> block
        sed -i '/<script>/,/<\/script>/{
            /serviceWorker/,/<\/script>/d
            /navigator\.serviceWorker/d
        }' "$html"
        # Clean up any leftover empty <script></script>
        sed -i '/<script>/{N;s/<script>\n    <\/script>//;}' "$html"
    fi
done

echo ""
echo "Done! All assets restored. Each game directory is now self-contained."
echo "You can commit this change to fully remove the SW-based dedup."
