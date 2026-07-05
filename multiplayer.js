// ============================================================
// 使用 PeerJS 实现 P2P 联机（基于房间码）
// 主机：URL 加 ?host=1  客机：正常打开，输入房间码加入
// ============================================================

// 加载 PeerJS 库（CDN）
(function loadPeerJS() {
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/peerjs@1.5.1/dist/peerjs.min.js';
  script.onload = () => {
    console.log('PeerJS loaded, initializing...');
    initMultiplayer();
  };
  document.head.appendChild(script);
})();

let peer, conn, isHost = false;
let roomCode = '';
let localKeys = {};
let remoteKeys = {};

function initMultiplayer() {
  const urlParams = new URLSearchParams(window.location.search);
  isHost = urlParams.has('host');

  // 创建 UI 容器
  const container = document.createElement('div');
  container.id = 'mp-ui';
  container.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    background: rgba(0,0,0,0.8); padding: 16px 20px; border-radius: 12px;
    color: #fff; font-family: sans-serif; font-size: 14px;
    min-width: 180px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    pointer-events: auto;
  `;
  document.body.appendChild(container);

  if (isHost) {
    // ---------- 主机模式 ----------
    container.innerHTML = `
      <div style="font-weight:bold;margin-bottom:8px;">🔥 主机模式</div>
      <button id="createBtn" style="padding:6px 16px;border:none;border-radius:6px;background:#4CAF50;color:#fff;cursor:pointer;font-size:14px;">创建房间</button>
      <div id="status" style="margin-top:8px;font-size:12px;color:#aaa;">点击创建</div>
    `;
    document.getElementById('createBtn').onclick = createRoom;
  } else {
    // ---------- 客机模式 ----------
    container.innerHTML = `
      <div style="font-weight:bold;margin-bottom:8px;">💧 客机模式</div>
      <input id="roomInput" placeholder="输入房间码" style="padding:4px 8px;border-radius:4px;border:none;width:100px;margin-bottom:6px;">
      <br>
      <button id="joinBtn" style="padding:6px 16px;border:none;border-radius:6px;background:#2196F3;color:#fff;cursor:pointer;font-size:14px;">加入房间</button>
      <div id="status" style="margin-top:8px;font-size:12px;color:#aaa;">等待加入</div>
    `;
    document.getElementById('joinBtn').onclick = () => {
      const code = document.getElementById('roomInput').value.trim();
      if (code) joinRoom(code);
    };
  }
}

// ---------- 主机创建房间 ----------
function createRoom() {
  const status = document.getElementById('status');
  // 每个 Peer 需要唯一 ID，我们随机生成一个
  const randomId = 'host-' + Math.random().toString(36).substr(2, 6);
  peer = new Peer(randomId, {
    debug: 2,
    // 使用免费的信令服务器（默认即可）
  });

  peer.on('open', (id) => {
    // 房间码就是自己的 Peer ID
    roomCode = id;
    status.innerHTML = `✅ 房间已创建<br>📌 房间码：<strong style="color:#FFD700;">${roomCode}</strong><br>等待客机连接...`;
    // 监听连接
    peer.on('connection', (incomingConn) => {
      conn = incomingConn;
      conn.on('open', () => {
        status.innerHTML += '<br>👫 客机已加入！';
        startHostSync();
      });
      conn.on('data', (data) => {
        if (data.type === 'keys') {
          remoteKeys = data.keys;
          simulateKeys(remoteKeys);
        }
      });
      conn.on('close', () => {
        status.innerHTML += '<br>❌ 客机已断开';
      });
    });
  });

  peer.on('error', (err) => {
    status.innerHTML = '❌ 创建失败：' + err.message;
    console.error(err);
  });
}

// ---------- 客机加入房间 ----------
function joinRoom(code) {
  const status = document.getElementById('status');
  // 客机也生成自己的 Peer ID
  const randomId = 'guest-' + Math.random().toString(36).substr(2, 6);
  peer = new Peer(randomId, { debug: 2 });

  peer.on('open', () => {
    conn = peer.connect(code, { reliable: true });
    conn.on('open', () => {
      status.innerHTML = '✅ 已连接到主机！';
      // 客机阻止本地键盘（由主机控制？我们改为客机发送自己的按键）
      // 但游戏本身是双人同屏，联机时我们让客机控制水女孩（WASD），主机控制火人（方向键）
      // 因此客机只发送 WASD 给主机，主机发送方向键给客机
      startGuestSync();
    });
    conn.on('data', (data) => {
      if (data.type === 'keys') {
        remoteKeys = data.keys;
        simulateKeys(remoteKeys);
      }
    });
    conn.on('close', () => {
      status.innerHTML = '❌ 与主机断开连接';
    });
  });

  peer.on('error', (err) => {
    status.innerHTML = '❌ 加入失败：' + err.message;
    console.error(err);
  });
}

// ---------- 主机发送方向键（火人） ----------
function startHostSync() {
  // 主机只监听方向键（ArrowUp, ArrowDown, ArrowLeft, ArrowRight）
  const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  document.addEventListener('keydown', (e) => {
    if (allowedKeys.includes(e.key)) {
      localKeys[e.key] = true;
      sendKeys();
    }
  });
  document.addEventListener('keyup', (e) => {
    if (allowedKeys.includes(e.key)) {
      localKeys[e.key] = false;
      sendKeys();
    }
  });
  // 初始发送一次
  sendKeys();
}

function sendKeys() {
  if (conn && conn.open) {
    conn.send({ type: 'keys', keys: localKeys });
  }
}

// ---------- 客机发送 WASD（水女孩） ----------
function startGuestSync() {
  const allowedKeys = ['w', 'W', 'a', 'A', 's', 'S', 'd', 'D'];
  document.addEventListener('keydown', (e) => {
    if (allowedKeys.includes(e.key)) {
      localKeys[e.key] = true;
      sendKeys();
    }
  });
  document.addEventListener('keyup', (e) => {
    if (allowedKeys.includes(e.key)) {
      localKeys[e.key] = false;
      sendKeys();
    }
  });
  // 初始发送
  sendKeys();
}

// ---------- 模拟按键事件（客机收到主机的方向键，主机收到客机的 WASD） ----------
function simulateKeys(keysObj) {
  // 维护一个全局按键状态，避免重复触发
  if (!window._simulatedState) window._simulatedState = {};
  const state = window._simulatedState;

  // 遍历所有键，触发变化
  const allKeys = Object.keys(keysObj);
  // 先处理 keydown（按下）
  allKeys.forEach(key => {
    if (keysObj[key] && !state[key]) {
      // 按键从未按下变为按下 -> keydown
      const event = new KeyboardEvent('keydown', { key, bubbles: true });
      document.dispatchEvent(event);
      state[key] = true;
    }
  });
  // 再处理 keyup（释放）
  Object.keys(state).forEach(key => {
    if (!keysObj[key] && state[key]) {
      const event = new KeyboardEvent('keyup', { key, bubbles: true });
      document.dispatchEvent(event);
      state[key] = false;
    }
  });
}

// ---------- 客机阻止自己的键盘干扰（只发送我们需要的） ----------
// 我们在事件监听中只处理特定键，无需全局阻止，因为游戏本身有本地控制，
// 我们只通过 simulateKeys 来模拟，所以客机本地按键会被我们的监听截获并发送，
// 但也会同时触发游戏，为避免干扰，我们需要阻止客机本地按键对游戏的影响。
// 简单做法：客机模式下，阻止所有键盘事件冒泡到游戏，只由我们的监听处理。
if (!isHost) {
  document.addEventListener('keydown', (e) => {
    e.stopPropagation();
    e.preventDefault();
  }, true);
  document.addEventListener('keyup', (e) => {
    e.stopPropagation();
    e.preventDefault();
  }, true);
}
