/**
 * Service Worker - Shared Asset Redirector
 *
 * Redirects requests for shared assets from individual game directories
 * to the single canonical copy in games/shared-assets/.
 *
 * Shared assets are files identical across multiple games.
 * To restore per-game copies and remove this SW, run: tools/restore-assets.sh
 */

// Assets shared across ALL 6 games
var ALL_GAMES = [
    'assets/atlasses/CharAssets.json',
    'assets/atlasses/CharAssets.png',
    'assets/atlasses/GroundAssets.json',
    'assets/atlasses/GroundAssets.png',
    'assets/atlasses/MenuBackgrounds.json',
    'assets/atlasses/MenuBackgrounds.png',
    'assets/atlasses/PreloaderAssets.json',
    'assets/atlasses/PreloaderAssets.png',
    'assets/audio/CharToggle1.mp3',
    'assets/audio/CharToggle2.mp3',
    'assets/audio/Clock.mp3',
    'assets/audio/Death.mp3',
    'assets/audio/Diamond.mp3',
    'assets/audio/Door.mp3',
    'assets/audio/EndDiamond.mp3',
    'assets/audio/EndFail.mp3',
    'assets/audio/EndPass.mp3',
    'assets/audio/Freeze.mp3',
    'assets/audio/IceSteps_fb.mp3',
    'assets/audio/IceSteps_wg.mp3',
    'assets/audio/Jump_fb.mp3',
    'assets/audio/Jump_wg.mp3',
    'assets/audio/LevelMusic.mp3',
    'assets/audio/LevelMusicFinish.mp3',
    'assets/audio/LevelMusicFinish_speed.mp3',
    'assets/audio/LevelMusic_dark.mp3',
    'assets/audio/LevelMusic_speed.mp3',
    'assets/audio/LevelMusicOver.mp3',
    'assets/audio/Lever.mp3',
    'assets/audio/LightPusher.mp3',
    'assets/audio/Melt.mp3',
    'assets/audio/MenuMusic.mp3',
    'assets/audio/Platform.mp3',
    'assets/audio/PortalClose.mp3',
    'assets/audio/PortalLoop.mp3',
    'assets/audio/PortalOpen.mp3',
    'assets/audio/PortalTransport.mp3',
    'assets/audio/Pusher.mp3',
    'assets/audio/Slider.mp3',
    'assets/audio/WaterSteps.mp3',
    'assets/audio/Wind.mp3',
    'assets/images/Beam.png',
    'assets/images/branding/branding_logo_kizi.png'
];

// Assets shared across games 1-4 only
var GAMES_1234 = [
    'assets/atlasses/MechAssets.json',
    'assets/atlasses/MechAssets.png',
    'assets/atlasses/MenuAssets.json',
    'assets/atlasses/MenuAssets.png',
    'assets/fonts/chinese/font.fnt',
    'assets/fonts/chinese/font.png',
    'assets/tilemaps/tilesets/Ground.json',
    'assets/tilemaps/tilesets/LargeObjects.json',
    'assets/tilemaps/tilesets/Objects.json'
];

var GAMES_1234_DIRS = [
    '/games/1-forest-temple/',
    '/games/2-light-temple/',
    '/games/3-ice-temple/',
    '/games/4-crystal-temple/'
];

// Build a Set for fast lookup
var ALL_SET = new Set(ALL_GAMES);
var G1234_SET = new Set(GAMES_1234);

// Game directory pattern: /games/<name>/assets/...
var GAME_DIR_RE = /^(\/games\/[^/]+\/)(assets\/.+)$/;

self.addEventListener('install', function (e) {
    self.skipWaiting();
});

self.addEventListener('activate', function (e) {
    e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (e) {
    var url = new URL(e.request.url);

    // Only handle same-origin requests
    if (url.origin !== self.location.origin) return;

    var match = url.pathname.match(GAME_DIR_RE);
    if (!match) return;

    var gameDir = match[1]; // e.g. /games/1-forest-temple/
    var assetPath = match[2]; // e.g. assets/audio/LevelMusic.mp3

    var shouldRedirect = false;

    if (ALL_SET.has(assetPath)) {
        shouldRedirect = true;
    } else if (G1234_SET.has(assetPath) && GAMES_1234_DIRS.indexOf(gameDir) !== -1) {
        shouldRedirect = true;
    }

    if (shouldRedirect) {
        var newUrl = url.origin + '/games/shared-assets/' + assetPath + url.search;
        e.respondWith(fetch(newUrl, { mode: e.request.mode, credentials: e.request.credentials }));
    }
});
