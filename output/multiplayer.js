// ========== 1. 引入 @poki/netlib ==========
// 使用 CDN 动态加载，无需 npm
const script = document.createElement('script');
script.src = 'https://unpkg.com/@poki/netlib@0.2.0/dist/netlib.umd.js';
script.onload = init;
document.head.appendChild(script);

let netlib, room, isHost = false;
let localKeys = {};        // 当前本地按下的键
let remoteKeys = {};       // 远端传来的键
let isSyncing = false;     // 是否正在同步（客机禁止本地键盘）

// ========== 2. 初始化联机 ==========
function init() {
  netlib = window.NetLib;
  
  // 通过 URL 参数决定角色：?host=1 为主机，否则为客机
  const urlParams = new URLSearchParams(window.location.search);
  isHost = urlParams.has('host');
  
  // 创建 UI 按钮（如果不存在）
  const container = document.createElement('div');
  container.id = 'mp-controls';
  container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;background:rgba(0,0,0,0.7);padding:15px;border-radius:10px;color:#fff;font-family:sans-serif;';
  
  if (!isHost) {
    // 客机显示输入框和加入按钮
    container.innerHTML = `
      <div style="display:flex;gap:8px;align-items:center;">
        <input id="roomInput" placeholder="输入房间码" style="padding:5px;border-radius:4px;border:none;">
        <button id="joinBtn" style="padding:5px 12px;border:none;border-radius:4px;background:#4CAF50;color:#fff;cursor:pointer;">加入</button>
      </div>
      <div id="status" style="margin-top:8px;font-size:12px;">等待连接...</div>
    `;
    document.body.appendChild(container);
    
    document.getElementById('joinBtn').onclick = () => {
      const code = document.getElementById('roomInput').value.trim();
      if (code) joinRoom(code);
    };
  } else {
    // 主机显示“创建房间”按钮
    container.innerHTML = `
      <button id="createBtn" style="padding:8px 16px;border:none;border-radius:4px;background:#2196F3;color:#fff;cursor:pointer;">🏠 创建房间</button>
      <div id="status" style="margin-top:8px;font-size:12px;">等待创建...</div>
    `;
    document.body.appendChild(container);
    
    document.getElementById('createBtn').onclick = createRoom;
  }
}

// ========== 3. 创建房间（主机） ==========
async function createRoom() {
  try {
    room = await netlib.host({
      gameName: 'FireboyWatergirl',
      maxPlayers: 2
    });
    isHost = true;
    const inviteCode = room.getInviteCode();
    document.getElementById('status').innerHTML = `✅ 房间已创建<br>📌 邀请码：<strong style="color:#FFD700;">${inviteCode}</strong><br>等待客机加入...`;
    
    // 监听客机加入
    room.on('peerConnected', () => {
      document.getElementById('status').innerHTML += '<br>👫 客机已加入，开始游戏！';
      startGameSync();
    });
    
    // 监听数据
    room.on('data', (data) => {
      if (data.type === 'keys') {
        remoteKeys = data.keys;
      }
    });
  } catch (e) {
    document.getElementById('status').innerHTML = '❌ 创建失败：' + e.message;
  }
}

// ========== 4. 加入房间（客机） ==========
async function joinRoom(inviteCode) {
  try {
    room = await netlib.join({
      gameName: 'FireboyWatergirl',
      inviteCode: inviteCode
    });
    isSyncing = true;  // 客机启用同步模式（禁止本地键盘）
    document.getElementById('status').innerHTML = '✅ 已加入房间，等待主机...';
    
    // 监听主机数据
    room.on('data', (data) => {
      if (data.type === 'keys') {
        remoteKeys = data.keys;
        // 模拟按键事件
        simulateKeys(remoteKeys);
      }
    });
    
    // 通知主机已准备好
    room.send({ type: 'ready' });
  } catch (e) {
    document.getElementById('status').innerHTML = '❌ 加入失败：' + e.message;
  }
}

// ========== 5. 主机开始同步 ==========
function startGameSync() {
  // 主机也要拦截本地键盘，但只发送，不影响本地控制（因为本地本来就能控制）
  // 但为了同步，主机需要将自己的按键发过去
  document.addEventListener('keydown', (e) => {
    if (isHost) {
      localKeys[e.key] = true;
      sendKeys();
    }
  });
  document.addEventListener('keyup', (e) => {
    if (isHost) {
      localKeys[e.key] = false;
      sendKeys();
    }
  });
}

function sendKeys() {
  if (room) {
    room.send({ type: 'keys', keys: localKeys });
  }
}

// ========== 6. 客机模拟键盘事件 ==========
function simulateKeys(keysObj) {
  // 先清除所有之前模拟的按键（避免按键卡住）
  // 这里简单的做法：对每个键，如果当前状态与上次不同，则触发事件
  // 更健壮：维护一个映射，对比变化
  const activeKeys = Object.keys(keysObj).filter(k => keysObj[k]);
  const inactiveKeys = Object.keys(keysObj).filter(k => !keysObj[k]);
  
  // 触发 keydown 和 keyup
  activeKeys.forEach(key => {
    if (!remoteKeys[key]) { // 如果之前不是按下状态
      const event = new KeyboardEvent('keydown', { key, bubbles: true });
      document.dispatchEvent(event);
      remoteKeys[key] = true;
    }
  });
  inactiveKeys.forEach(key => {
    if (remoteKeys[key]) {
      const event = new KeyboardEvent('keyup', { key, bubbles: true });
      document.dispatchEvent(event);
      remoteKeys[key] = false;
    }
  });
}

// ========== 7. 客机阻止本地键盘干扰 ==========
if (!isHost) {
  document.addEventListener('keydown', (e) => {
    if (isSyncing) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);
  document.addEventListener('keyup', (e) => {
    if (isSyncing) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);
}
