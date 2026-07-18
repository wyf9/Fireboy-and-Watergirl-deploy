/**
 * Touch Controls for Fireboy & Watergirl
 * Adds virtual D-pad overlays for mobile/touch devices.
 *
 * Watergirl (left side):  W=jump  A=left  D=right
 * Fireboy  (right side):  Up=jump Left=left Right=right
 *
 * Dispatches real KeyboardEvent on window so Phaser picks them up.
 */
(function () {
    'use strict';

    // Only activate on touch-capable devices
    if (!('ontouchstart' in window) && !navigator.maxTouchPoints) return;

    // Key code map (Phaser uses event.keyCode)
    var KEYS = {
        W: 87, A: 65, D: 68,
        UP: 38, LEFT: 37, RIGHT: 39
    };

    // Track pressed state to avoid duplicate events
    var pressed = {};

    function fireKey(code, type) {
        var ev = new KeyboardEvent(type, {
            keyCode: code,
            which: code,
            bubbles: true,
            cancelable: true
        });
        window.dispatchEvent(ev);
    }

    function press(code) {
        if (pressed[code]) return;
        pressed[code] = true;
        fireKey(code, 'keydown');
    }

    function release(code) {
        if (!pressed[code]) return;
        pressed[code] = false;
        fireKey(code, 'keyup');
    }

    // ── Build UI ──

    var css = document.createElement('style');
    css.textContent = [
        '.tc-pad { position:fixed; bottom:12px; z-index:9998; display:flex; gap:6px; pointer-events:none; }',
        '.tc-pad-left  { left:10px;  flex-direction:column; align-items:flex-start; }',
        '.tc-pad-right { right:10px; flex-direction:column; align-items:flex-end; }',
        '.tc-row { display:flex; gap:6px; }',
        '.tc-btn {',
        '  pointer-events:auto; width:52px; height:52px; border-radius:12px;',
        '  background:rgba(255,255,255,0.13); border:1.5px solid rgba(255,255,255,0.25);',
        '  color:rgba(255,255,255,0.6); font:bold 15px/52px sans-serif; text-align:center;',
        '  user-select:none; -webkit-user-select:none; touch-action:none;',
        '  backdrop-filter:blur(2px); -webkit-backdrop-filter:blur(2px);',
        '  transition: background 0.08s;',
        '}',
        '.tc-btn.active { background:rgba(255,255,255,0.32); }',
        '.tc-label {',
        '  color:rgba(255,255,255,0.35); font:bold 11px sans-serif;',
        '  pointer-events:none; margin-bottom:4px; text-align:center; width:100%;',
        '}',
        '.tc-pad-right .tc-label { text-align:right; }',
        /* hide on landscape-wide screens (likely not phone) */
        '@media (min-width:900px) and (hover:hover) { .tc-pad { display:none !important; } }'
    ].join('\n');
    document.head.appendChild(css);

    function makePad(side, label, buttons) {
        var pad = document.createElement('div');
        pad.className = 'tc-pad tc-pad-' + side;

        var lbl = document.createElement('div');
        lbl.className = 'tc-label';
        lbl.textContent = label;
        pad.appendChild(lbl);

        // Jump button row
        var jumpRow = document.createElement('div');
        jumpRow.className = 'tc-row';
        if (side === 'right') {
            jumpRow.style.justifyContent = 'flex-end';
        }
        var jumpBtn = makeBtn(buttons.jump.text, buttons.jump.code);
        jumpRow.appendChild(jumpBtn);
        pad.appendChild(jumpRow);

        // Left / Right row
        var dirRow = document.createElement('div');
        dirRow.className = 'tc-row';
        dirRow.appendChild(makeBtn(buttons.left.text, buttons.left.code));
        dirRow.appendChild(makeBtn(buttons.right.text, buttons.right.code));
        pad.appendChild(dirRow);

        document.body.appendChild(pad);
    }

    function makeBtn(text, code) {
        var btn = document.createElement('div');
        btn.className = 'tc-btn';
        btn.textContent = text;
        btn.setAttribute('data-key', code);

        btn.addEventListener('touchstart', function (e) {
            e.preventDefault();
            btn.classList.add('active');
            press(code);
        }, { passive: false });

        btn.addEventListener('touchend', function (e) {
            e.preventDefault();
            btn.classList.remove('active');
            release(code);
        }, { passive: false });

        btn.addEventListener('touchcancel', function () {
            btn.classList.remove('active');
            release(code);
        });

        // Prevent context menu
        btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });

        return btn;
    }

    // Wait for body to be ready
    function init() {
        makePad('left', 'WATERGIRL', {
            jump:  { text: 'W',  code: KEYS.W },
            left:  { text: 'A',  code: KEYS.A },
            right: { text: 'D',  code: KEYS.D }
        });

        makePad('right', 'FIREBOY', {
            jump:  { text: '\u25B2', code: KEYS.UP },
            left:  { text: '\u25C0', code: KEYS.LEFT },
            right: { text: '\u25B6', code: KEYS.RIGHT }
        });
    }

    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
