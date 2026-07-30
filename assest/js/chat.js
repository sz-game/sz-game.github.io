/* ============================================================
   Live Chat Widget — external file version (overlay name-gate).
   Usage on any page:
     <script type="module" src="chat-widget-v2.js"></script>
   Injects its own CSS + HTML markup into the page, then wires up
   the exact same behavior as the inline version:
   - Chat (messages + composer) is visible immediately on load.
   - Name gate appears as an overlay ONLY when the visitor tries
     to send a message / image / gif / like, then resumes that
     action automatically after they join.
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, doc, getDoc, setDoc, updateDoc, deleteDoc,
  query, orderBy, limit, onSnapshot, serverTimestamp, arrayUnion, arrayRemove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ---------------------------------------------------------
   0) FONT (same as original inline <link> tags)
--------------------------------------------------------- */
if(!document.querySelector('link[data-lc-font]')){
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://fonts.googleapis.com';
  preconnect.setAttribute('data-lc-font', 'true');
  document.head.appendChild(preconnect);

  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
  fontLink.setAttribute('data-lc-font', 'true');
  document.head.appendChild(fontLink);
}

/* ---------------------------------------------------------
   1) INJECT CSS
--------------------------------------------------------- */
const LC_CSS = `
:root{
  --accent: #ffffff;
  --accent-ink: #4A1B0C;
  --dark: #1E2A38;
  --dark-2: #16202B;
  --bubble-me: #FF6B4A;
  --text-light: #E8ECEF;
}
#lc-widget-root *{ box-sizing: border-box; }
#lc-widget-root{ font-family:'Inter',sans-serif; }

#lc-launcher{
  position: fixed; right: 24px; bottom: 34px; z-index: 9998;
  width: 58px; height: 58px; border-radius: 50%;
  background: var(--accent); border: none; cursor: pointer;
  box-shadow: 0 4px 14px rgba(0,0,0,0.35);
  display:flex; align-items:center; justify-content:center;
  transition: transform .15s ease;
}
#lc-launcher:hover{ transform: scale(1.06); }
#lc-launcher svg{ width:26px; height:26px; }
#lc-badge{
  position:absolute; top:-2px; right:-2px; background:#E24B4A; color:#fff;
  font-size:10px; font-weight:600; border-radius:50%; width:18px; height:18px;
  display:none; align-items:center; justify-content:center;
}

#lc-panel{
  position: fixed; right: 24px; bottom: 94px; z-index: 9999;
  width: min(390px, calc(100vw - 32px));
  height: min(660px, calc(100vh - 118px));
  display:none; flex-direction:column;
  background: var(--dark); border-radius: 14px; overflow:hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,0.45);
  transition: all .2s ease;
}
#lc-panel.open{ display:flex; }
#lc-panel.fullscreen{
  right:0; bottom:0; top:0; left:0; width:100%; height:100%; border-radius:0;
}

@media (max-width: 480px){
  #lc-launcher{ right:16px; bottom:16px; width:52px; height:52px; }
  #lc-panel{
    right:0; left:0; bottom:0; top:0; width:100%; height:100%;
    border-radius:0; max-height:none;
  }
}
@media (max-width: 480px) and (min-width: 0px){
  #lc-panel:not(.open){ display:none; }
}

#lc-header{
  padding: 12px 16px; background: var(--dark-2); color: var(--text-light);
  display:flex; align-items:center; justify-content:space-between;
  font-weight:600; font-size:14px; flex-shrink:0;
}
#lc-header .lc-status{ display:flex; align-items:center; gap:6px; }
#lc-header .lc-dot{ width:8px; height:8px; border-radius:50%; background:#4ADE80; }
#lc-header .lc-header-btns{ display:flex; gap:4px; }
#lc-header button{
  background:none; border:none; color:var(--text-light); opacity:.7;
  cursor:pointer; font-size:16px; line-height:1; padding:4px 6px;
}
#lc-header button:hover{ opacity:1; }

#lc-messages{
  flex:1; overflow-y:auto; padding: 14px; display:flex; flex-direction:column; gap:10px;
  position:relative;
  background-color: var(--dark);
  background-image:
    linear-gradient(rgba(22,32,43,0.87), rgba(22,32,43,0.87)),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='none' stroke='%23415066' stroke-width='1.4' opacity='0.6'%3E%3Ccircle cx='20' cy='20' r='9'/%3E%3Cpath d='M45 15h20a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H55l-6 6v-6h-4a6 6 0 0 1-6-6V21a6 6 0 0 1 6-6z'/%3E%3Cpath d='M15 60l6 6 10-10'/%3E%3Ccircle cx='95' cy='55' r='7'/%3E%3Cpath d='M80 90h18a5 5 0 0 0 5-5V75a5 5 0 0 0-5-5H83a5 5 0 0 0-5 5v10l-6 5z'/%3E%3Cpath d='M20 95a8 8 0 1 0 16 0 8 8 0 1 0-16 0z'/%3E%3C/g%3E%3C/svg%3E");
  background-size: cover, 120px 120px;
  background-position: center, 0 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.2) transparent;
}
#lc-messages:empty::after{
  content: 'No messages yet. Be the first to write one.';
  color: rgba(255,255,255,0.6); font-size:12px; text-align:center; display:block; margin-top:20px;
}

.lc-msg-wrap{ display:flex; flex-direction:column; max-width:80%; }
.lc-msg-wrap.me{ align-self:flex-end; align-items:flex-end; }
.lc-msg-wrap.other{ align-self:flex-start; align-items:flex-start; }

.lc-msg{
  padding: 8px 12px; border-radius: 14px; font-size:13px; line-height:1.4;
  word-break: break-word; cursor:pointer; position:relative;
}
.lc-msg.me{ background: var(--bubble-me); color: var(--accent-ink); border-bottom-right-radius:4px; }
.lc-msg.other{ color: #14202b; border-bottom-left-radius:4px; }
.lc-msg .lc-name{ display:block; font-size:10px; font-weight:600; opacity:.75; margin-bottom:2px; }
.lc-msg .lc-mention{ font-weight:700; text-decoration:underline; }
.lc-msg img.lc-img{ max-width:180px; border-radius:8px; display:block; margin-top:4px; }

.lc-quote{
  border-left: 3px solid rgba(0,0,0,0.35); padding: 4px 8px; margin-bottom:6px;
  border-radius: 4px; background: rgba(0,0,0,0.08); font-size:11.5px;
}
.lc-quote.lc-quote-clickable{ cursor:pointer; }
.lc-quote.lc-quote-clickable:hover{ background: rgba(0,0,0,0.16); }
.lc-quote .lc-quote-author{ display:block; font-weight:700; font-size:11px; }
.lc-quote .lc-quote-text{ opacity:.85; }

.lc-msg-wrap.lc-highlight .lc-msg{
  animation: lc-flash 1.3s ease;
}
@keyframes lc-flash{
  0%{ box-shadow: 0 0 0 3px var(--accent); }
  70%{ box-shadow: 0 0 0 3px var(--accent); }
  100%{ box-shadow: 0 0 0 0 rgba(255,107,74,0); }
}

.lc-meta-row{ display:flex; align-items:center; gap:8px; margin-top:2px; font-size:10px; opacity:.6; color: var(--text-light); }
.lc-meta-row .lc-like-btn{ cursor:pointer; background:none; border:none; color:inherit; font-size:11px; padding:0; }
.lc-meta-row .lc-like-btn.liked{ color:#FF6B4A; }
.lc-meta-row .lc-del-btn, .lc-meta-row .lc-reply-btn{ cursor:pointer; background:none; border:none; color:inherit; font-size:10px; padding:0; text-decoration:underline; }
.lc-meta-row .lc-reply-btn:hover, .lc-meta-row .lc-del-btn:hover{ opacity:1; color:var(--accent); }

#lc-jump-bottom{
  position:absolute; bottom:10px; right:14px; background: var(--accent); color: var(--accent-ink);
  border:none; border-radius:16px; padding:5px 12px; font-size:11px; font-weight:600; cursor:pointer;
  display:none; box-shadow:0 2px 8px rgba(0,0,0,.35); z-index:4;
}

#lc-suggest{
  position:absolute; bottom:100%; left:10px; right:10px; background:#2C3B4C; border-radius:8px;
  margin-bottom:6px; max-height:120px; overflow-y:auto; display:none; box-shadow:0 4px 12px rgba(0,0,0,.4); z-index:6;
}
#lc-suggest div{ padding:7px 12px; font-size:13px; color:var(--text-light); cursor:pointer; }
#lc-suggest div:hover{ background:#3A4C60; }

#lc-reply-bar{
  display:none; align-items:center; justify-content:space-between; gap:8px;
  padding:8px 12px; margin:8px 10px 0; background:#2C3B4C; border-radius:8px;
  border-left: 3px solid var(--accent);
}
#lc-reply-bar .lc-reply-info{ font-size:11px; color:var(--text-light); overflow:hidden; }
#lc-reply-bar .lc-reply-info b{ display:block; font-size:11px; }
#lc-reply-bar .lc-reply-info span{ opacity:.7; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:230px; }
#lc-reply-bar button{ background:none; border:none; color:var(--text-light); opacity:.7; cursor:pointer; font-size:16px; }

#lc-form-wrap{ position:relative; background: var(--dark-2); flex-shrink:0; }

#lc-emoji-panel{
  display:none; flex-direction:column; padding: 8px 10px 0;
}
#lc-emoji-tabs{
  display:flex; gap:2px; overflow-x:auto; padding-bottom:8px; flex-shrink:0;
  scrollbar-width: none; border-bottom: 1px solid rgba(255,255,255,0.08);
}
#lc-emoji-tabs::-webkit-scrollbar{ display:none; }
#lc-emoji-tabs .lc-emoji-tab{
  flex-shrink:0; flex:1; background:none; border:none; color:var(--text-light);
  font-size:19px; padding:4px 8px 8px; cursor:pointer; opacity:.5;
  border-bottom: 2px solid transparent; line-height:1;
}
#lc-emoji-tabs .lc-emoji-tab.active{ opacity:1; border-bottom-color: var(--accent); }

#lc-emoji-search-row{ padding: 8px 0; flex-shrink:0; }
#lc-emoji-search{
  width:100%; border-radius:18px; border:none; padding:8px 12px;
  background:#2C3B4C; color:var(--text-light); font-size:12px;
}
#lc-emoji-search::placeholder{ color:rgba(255,255,255,0.4); }

#lc-emoji-scroll{
  max-height:210px; overflow-y:auto; scrollbar-width: thin;
}
#lc-emoji-scroll::-webkit-scrollbar{ width:5px; }
.lc-emoji-section-title{
  position:sticky; top:0; background: var(--dark-2); color: rgba(255,255,255,0.55);
  font-size:11px; font-weight:600; padding:4px 2px; z-index:2;
}
.lc-emoji-section-grid{
  display:grid; grid-template-columns: repeat(8, 1fr); gap:4px; padding-bottom:6px;
}
.lc-emoji-section-grid span{ font-size:19px; text-align:center; cursor:pointer; padding:3px; border-radius:6px; }
.lc-emoji-section-grid span:hover{ background:#2C3B4C; }
#lc-emoji-no-results{
  color: rgba(255,255,255,0.5); font-size:12px; text-align:center; padding:20px 0; display:none;
}

#lc-image-row{ display:none; padding: 8px 10px 0; gap:6px; align-items:center; }
#lc-image-row input[type=text]{
  flex:1; border-radius:8px; border:none; padding:7px 10px; font-size:12px;
  background:#2C3B4C; color:var(--text-light); min-width:0;
}
#lc-image-row button{
  background: var(--accent); color:var(--accent-ink); border:none; border-radius:8px;
  padding:6px 10px; font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap; flex-shrink:0;
}

#lc-gif-panel{ display:none; padding: 8px 10px 0; }
#lc-gif-panel input[type=text]{
  width:100%; border-radius:8px; border:none; padding:7px 10px; font-size:12px;
  background:#2C3B4C; color:var(--text-light); margin-bottom:6px;
}
#lc-gif-results{
  display:grid; grid-template-columns: repeat(3, 1fr); gap:5px; max-height:280px; overflow-y:auto;
  scrollbar-width: thin;
}
#lc-gif-results::-webkit-scrollbar{ width:5px; }
#lc-gif-results img{ width:100%; height:80px; object-fit:cover; border-radius:6px; cursor:pointer; }
#lc-gif-hint{ font-size:11px; color:var(--text-light); opacity:.6; padding-top:2px; }

#lc-form{
  padding: 10px; display:flex; gap:6px; align-items:flex-end; flex-wrap:nowrap;
}
#lc-form input[type=text]{
  flex:1; min-width:0; border-radius:20px; border:none; padding:9px 14px;
  font-family:'Inter',sans-serif; font-size:13px; background:#2C3B4C; color:var(--text-light);
}
#lc-form input[type=text]::placeholder{ color:rgba(255,255,255,0.4); }
#lc-form button{
  background: var(--accent); color:var(--accent-ink); border:none; border-radius:50%;
  width:34px; height:34px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0;
  font-size:15px;
}
#lc-form button:hover{ filter:brightness(1.05); }
#lc-form button.lc-toggle-btn{ background:#2C3B4C; color:var(--text-light); font-size:12px; }

@media (max-width: 360px){
  #lc-form{ flex-wrap:wrap; }
  #lc-form input[type=text]{ order:1; flex-basis:100%; }
}

/* Name gate is an overlay: sits on top of messages/form instead of
   replacing them, so the chat is visible immediately and the name
   prompt only appears when the visitor tries to send something. */
#lc-name-gate{
  position:absolute; inset:0; z-index:20;
  padding: 16px; background: rgba(30,42,56,0.97); display:none; flex-direction:column; gap:10px;
  align-items:center; justify-content:center;
}
#lc-name-gate p{ color:var(--text-light); font-size:13px; margin:0; text-align:center; }
#lc-name-gate input{
  width:100%; border-radius:8px; border:none; padding:9px 12px; font-size:13px;
  background:#2C3B4C; color:var(--text-light);
}
#lc-name-gate button{
  background: var(--accent); color:var(--accent-ink); border:none; border-radius:8px;
  padding:9px; font-weight:600; font-size:13px; cursor:pointer; width:100%;
}
#lc-name-error{
  color:#FF7A6E; font-size:12px; text-align:center; margin:0; display:none;
}
`;

/* ---------------------------------------------------------
   2) INJECT HTML MARKUP
--------------------------------------------------------- */
const LC_HTML = `
<button id="lc-launcher" aria-label="Open chat">
  <svg height="200px" width="200px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 58 58" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path style="fill:#156616;" d="M33.224,10.494H13.776C6.168,10.494,0,16.661,0,24.27v11.345c0,7.608,6.392,13.879,14,13.879h0 v7.446c0,0.503,0.384,0.755,0.74,0.4l1.521-1.521c4.116-4.116,9.699-6.325,15.52-6.325h1.443C40.832,49.494,47,43.223,47,35.615 V24.27C47,16.661,40.832,10.494,33.224,10.494z"></path> <g> <path style="fill:#9BC0EA;" d="M44.224,0.494H24.776c-6.371,0-11.717,4.332-13.292,10.206c0.747-0.125,1.509-0.206,2.292-0.206 h19.448C40.832,10.494,47,16.661,47,24.27v11.345c0,1.259-0.183,2.476-0.5,3.639C52.957,38.061,58,32.37,58,25.615V14.27 C58,6.661,51.832,0.494,44.224,0.494z"></path> </g> <circle style="fill:#FFFFFF;" cx="12" cy="30.494" r="3"></circle> <circle style="fill:#FFFFFF;" cx="24" cy="30.494" r="3"></circle> <circle style="fill:#FFFFFF;" cx="36" cy="30.494" r="3"></circle> </g> </g></svg>
  <span id="lc-badge"></span>
</button>

<div id="lc-panel">
  <div id="lc-header">
    <span class="lc-status"><span class="lc-dot"></span> Live chat</span>
    <div class="lc-header-btns">
      <button id="lc-fullscreen" aria-label="Fullscreen" title="Fullscreen">&#9974;</button>
      <button id="lc-close" aria-label="Close">&times;</button>
    </div>
  </div>

  <div id="lc-name-gate">
    <p>Enter your name to join the chat</p>
    <input type="text" id="lc-name-input" maxlength="20" placeholder="Your name">
    <p id="lc-name-error">That name is already taken. Please pick another one.</p>
    <button id="lc-name-submit">Join</button>
  </div>

  <div id="lc-messages">
    <button id="lc-jump-bottom">&#8595; New messages</button>
  </div>

  <div id="lc-form-wrap">
    <div id="lc-suggest"></div>
    <div id="lc-reply-bar">
      <div class="lc-reply-info"><b id="lc-reply-author"></b><span id="lc-reply-text"></span></div>
      <button id="lc-reply-cancel" aria-label="Cancel">&times;</button>
    </div>

    <div id="lc-emoji-panel">
      <div id="lc-emoji-tabs"></div>
      <div id="lc-emoji-search-row">
        <input type="text" id="lc-emoji-search" placeholder="Search emoji">
      </div>
      <div id="lc-emoji-scroll"></div>
      <div id="lc-emoji-no-results">No emoji found</div>
    </div>

    <div id="lc-image-row">
      <input type="text" id="lc-image-input" placeholder="Paste image link...">
      <button id="lc-image-send">Send link</button>
    </div>

    <div id="lc-gif-panel">
      <input type="text" id="lc-gif-search" placeholder="Search GIFs (e.g. happy, hi, lol)...">
      <div id="lc-gif-results"></div>
      <div id="lc-gif-hint"></div>
    </div>

    <div id="lc-form">
      <button class="lc-toggle-btn" id="lc-emoji-toggle" aria-label="Emoji" title="Emoji">&#128522;</button>
      <button class="lc-toggle-btn" id="lc-img-toggle" aria-label="Send image link" title="Image link">&#128247;</button>
      <button class="lc-toggle-btn" id="lc-gif-toggle" aria-label="Send GIF" title="GIF">GIF</button>
      <input type="text" id="lc-text-input" maxlength="300" placeholder="Type a message... (use @ to tag)">
      <button class="lc-send" id="lc-send-btn" aria-label="Send">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4A1B0C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
  </div>
</div>
`;

const lcStyleTag = document.createElement('style');
lcStyleTag.setAttribute('data-lc-widget', 'true');
lcStyleTag.textContent = LC_CSS;
document.head.appendChild(lcStyleTag);

const lcRoot = document.createElement('div');
lcRoot.id = 'lc-widget-root';
lcRoot.innerHTML = LC_HTML;
document.body.appendChild(lcRoot);

/* ---------------------------------------------------------
   3) FIREBASE CONFIG
--------------------------------------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyDKnJueIviOT1HGEKccWJItk3s8GNckF6I",
  authDomain: "unblockedgame-chat.firebaseapp.com",
  databaseURL: "https://unblockedgame-chat-default-rtdb.firebaseio.com",
  projectId: "unblockedgame-chat",
  storageBucket: "unblockedgame-chat.firebasestorage.app",
  messagingSenderId: "316395679509",
  appId: "1:316395679509:web:6b07fe7216347c8341431c",
  measurementId: "G-YY019HWRCZ"
};

// Your Giphy API key (from developers.giphy.com/dashboard)
const GIPHY_API_KEY = "iakWpXX92v4uxU3R1lO5Vk41OFbSFM5O";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messagesRef = collection(db, "livechat_messages");
const usersRef = collection(db, "livechat_users");

const BANNED = ['fuck','fuc','fck','madarchod','bhosdi','chutiya','gandu','bkl','saala','harami','loda','randi'];
function maskBanned(str){
  let out = str;
  BANNED.forEach(function(word){
    const re = new RegExp(word, 'gi');
    out = out.replace(re, '***');
  });
  return out;
}

const PALETTE = ['#8FD9C4','#7FB8E0','#F4B183','#C9A0DC','#F7D774','#F6989D','#A9D66B','#E0A8D8'];
function colorFor(name){
  let h = 0;
  for(let i=0;i<name.length;i++) h = (h*31 + name.charCodeAt(i)) % 9973;
  return PALETTE[h % PALETTE.length];
}

const EMOJI_CATEGORIES = [
  { name: 'Smileys & People', icon: '\u{1F600}', items: [
    ['\u{1F600}','grinning'], ['\u{1F601}','grin'], ['\u{1F602}','joy laughing crying'], ['\u{1F923}','rofl floor laughing'],
    ['\u{1F60A}','smile blush'], ['\u{1F642}','slight smile'], ['\u{1F609}','wink'], ['\u{1F60D}','heart eyes love'],
    ['\u{1F618}','kiss heart'], ['\u{1F61C}','wink tongue'], ['\u{1F914}','thinking'], ['\u{1F60E}','cool sunglasses'],
    ['\u{1F973}','party celebrate'], ['\u{1F929}','star struck'], ['\u{1F634}','sleep'], ['\u{1F605}','sweat smile'],
    ['\u{1F607}','angel innocent'], ['\u{1F97A}','pleading puppy eyes'], ['\u{1F622}','cry sad'], ['\u{1F62D}','sob crying'],
    ['\u{1F621}','angry mad'], ['\u{1F631}','scream shock'], ['\u{1F917}','hug'], ['\u{1F643}','upside down'],
    ['\u{1F60F}','smirk'], ['\u{1F971}','yawn tired'], ['\u{1F62C}','grimace'], ['\u{1F92F}','mind blown'],
    ['\u{1F975}','hot sweating'], ['\u{1F976}','cold freezing'], ['\u{1F922}','nauseated sick'],
    ['\u{1F44D}','thumbs up like'], ['\u{1F44E}','thumbs down dislike'], ['\u{1F44F}','clap applause'], ['\u{1F64F}','pray thanks please'],
    ['\u{1F4AA}','muscle strong'], ['\u270C\uFE0F','peace victory'], ['\u{1F91D}','handshake deal'], ['\u{1F44C}','ok perfect'],
    ['\u{1F44B}','wave hi bye'], ['\u{1F919}','call me shaka'], ['\u{1F91F}','love you'], ['\u{1F590}\uFE0F','hand five'],
    ['\u{1F44A}','fist bump punch'], ['\u{1F64C}','raise hands celebrate'], ['\u{1F483}','dance woman'], ['\u{1F57A}','dance man'],
    ['\u{1F476}','baby'], ['\u{1F467}','girl'], ['\u{1F466}','boy'], ['\u{1F469}','woman'], ['\u{1F468}','man'], ['\u{1F9D1}','person'],
    ['\u{1F475}','old woman'], ['\u{1F474}','old man'], ['\u{1F9D5}','woman hijab'], ['\u{1F46E}','police officer'],
    ['\u{1F468}\u200D\u2695\uFE0F','doctor'], ['\u{1F469}\u200D\u{1F373}','cook chef'], ['\u{1F9D1}\u200D\u{1F393}','student graduate'], ['\u{1F9D1}\u200D\u{1F4BB}','developer coder']
  ]},
  { name: 'Animals & Nature', icon: '\u{1F43B}', items: [
    ['\u{1F436}','dog'], ['\u{1F431}','cat'], ['\u{1F42D}','mouse'], ['\u{1F439}','hamster'], ['\u{1F430}','rabbit bunny'],
    ['\u{1F98A}','fox'], ['\u{1F43B}','bear'], ['\u{1F43C}','panda'], ['\u{1F428}','koala'], ['\u{1F42F}','tiger'],
    ['\u{1F981}','lion'], ['\u{1F42E}','cow'], ['\u{1F437}','pig'], ['\u{1F438}','frog'], ['\u{1F435}','monkey'],
    ['\u{1F414}','chicken'], ['\u{1F427}','penguin'], ['\u{1F984}','unicorn'], ['\u{1F434}','horse'], ['\u{1F41D}','bee'],
    ['\u{1F98B}','butterfly'], ['\u{1F422}','turtle'], ['\u{1F40D}','snake'], ['\u{1F988}','shark'], ['\u{1F419}','octopus'],
    ['\u{1F980}','crab'], ['\u{1F418}','elephant'], ['\u{1F992}','giraffe'], ['\u{1F42B}','camel'], ['\u{1F989}','owl'],
    ['\u{1F338}','blossom flower'], ['\u{1F33A}','hibiscus flower'], ['\u{1F339}','rose flower'], ['\u{1F33B}','sunflower'],
    ['\u{1F337}','tulip'], ['\u{1F33C}','daisy'], ['\u{1F319}','moon'], ['\u{1F30D}','earth globe'], ['\u2B50','star'],
    ['\u2728','sparkles'], ['\u{1F525}','fire'], ['\u{1F308}','rainbow'], ['\u2600\uFE0F','sun'], ['\u2601\uFE0F','cloud'],
    ['\u2744\uFE0F','snowflake'], ['\u{1F4A7}','droplet water']
  ]},
  { name: 'Food & Drink', icon: '\u2615', items: [
    ['\u{1F34F}','green apple'], ['\u{1F34E}','red apple'], ['\u{1F34C}','banana'], ['\u{1F349}','watermelon'], ['\u{1F347}','grapes'],
    ['\u{1F353}','strawberry'], ['\u{1F352}','cherries'], ['\u{1F351}','peach'], ['\u{1F34D}','pineapple'], ['\u{1F951}','avocado'],
    ['\u{1F355}','pizza'], ['\u{1F354}','burger'], ['\u{1F32D}','hot dog'], ['\u{1F35F}','fries'], ['\u{1F357}','chicken leg'],
    ['\u{1F369}','donut'], ['\u{1F36A}','cookie'], ['\u{1F382}','birthday cake'], ['\u{1F36B}','chocolate'], ['\u{1F37F}','popcorn'],
    ['\u2615','coffee'], ['\u{1F375}','tea'], ['\u{1F37A}','beer'], ['\u{1F377}','wine'], ['\u{1F964}','soda drink'],
    ['\u{1F366}','ice cream'], ['\u{1F370}','cake slice'], ['\u{1F35C}','noodles ramen'], ['\u{1F363}','sushi']
  ]},
  { name: 'Activities', icon: '\u{1F3C0}', items: [
    ['\u26BD','soccer football'], ['\u{1F3C0}','basketball'], ['\u{1F3C8}','american football'], ['\u26BE','baseball'],
    ['\u{1F3BE}','tennis'], ['\u{1F3D0}','volleyball'], ['\u{1F3D3}','ping pong table tennis'], ['\u{1F3F8}','badminton'],
    ['\u{1F3B1}','pool billiards'], ['\u{1F3AE}','video game controller'], ['\u{1F3B2}','dice'], ['\u{1F3AF}','dart target'],
    ['\u{1F3B3}','bowling'], ['\u{1F3C6}','trophy win'], ['\u{1F947}','gold medal'], ['\u{1F3A8}','art paint'],
    ['\u{1F3AC}','movie clapper'], ['\u{1F3A4}','microphone karaoke'], ['\u{1F3A7}','headphones music'], ['\u{1F3B8}','guitar'],
    ['\u{1F389}','party popper'], ['\u{1F38A}','confetti'], ['\u{1F381}','gift present'], ['\u{1F388}','balloon'],
    ['\u{1F3CB}\uFE0F','weightlifting gym'], ['\u{1F6B4}','cycling bike'], ['\u{1F3CA}','swimming'], ['\u26F3','golf'], ['\u{1F3BF}','ski']
  ]},
  { name: 'Travel & Places', icon: '\u{1F697}', items: [
    ['\u{1F697}','car'], ['\u{1F695}','taxi'], ['\u{1F68C}','bus'], ['\u{1F693}','police car'], ['\u{1F691}','ambulance'],
    ['\u{1F692}','fire truck'], ['\u{1F680}','rocket space'], ['\u2708\uFE0F','plane airplane'], ['\u{1F681}','helicopter'],
    ['\u26F5','sailboat'], ['\u{1F6A2}','ship'], ['\u{1F6B2}','bike bicycle'], ['\u{1F3D6}\uFE0F','beach'], ['\u{1F3DD}\uFE0F','island'],
    ['\u{1F3D4}\uFE0F','mountain'], ['\u{1F5FD}','statue of liberty'], ['\u{1F5FC}','tower'], ['\u{1F3F0}','castle'],
    ['\u{1F30B}','volcano'], ['\u{1F305}','sunrise'], ['\u{1F306}','city sunset'], ['\u{1F303}','night city'],
    ['\u{1F6A6}','traffic light'], ['\u{1F5FA}\uFE0F','map'], ['\u26F0\uFE0F','mountain peak'], ['\u{1F3D5}\uFE0F','camping tent'],
    ['\u{1F689}','train station'], ['\u{1F6E3}\uFE0F','road highway']
  ]},
  { name: 'Objects', icon: '\u{1F4A1}', items: [
    ['\u231A','watch'], ['\u{1F4F1}','phone mobile'], ['\u{1F4BB}','laptop computer'], ['\u2328\uFE0F','keyboard'],
    ['\u{1F5A5}\uFE0F','desktop computer'], ['\u{1F4F7}','camera'], ['\u{1F4DE}','telephone'], ['\u{1F50B}','battery'],
    ['\u{1F4A1}','bulb idea light'], ['\u{1F526}','flashlight torch'], ['\u{1F4B0}','money bag'], ['\u{1F48E}','diamond gem'],
    ['\u{1F511}','key'], ['\u{1F512}','lock'], ['\u{1F4CC}','pin'], ['\u{1F4CE}','paperclip'], ['\u2702\uFE0F','scissors'],
    ['\u{1F50D}','magnifying search'], ['\u{1F48A}','pill medicine'], ['\u{1F6D2}','shopping cart'], ['\u{1F4DA}','books'],
    ['\u270F\uFE0F','pencil'], ['\u{1F58A}\uFE0F','pen'], ['\u{1F4C5}','calendar'], ['\u{1F392}','backpack'], ['\u{1F4BC}','briefcase work']
  ]},
  { name: 'Symbols', icon: '\u{1F523}', items: [
    ['\u2764\uFE0F','red heart love'], ['\u{1F9E1}','orange heart'], ['\u{1F49B}','yellow heart'], ['\u{1F49A}','green heart'],
    ['\u{1F499}','blue heart'], ['\u{1F49C}','purple heart'], ['\u{1F5A4}','black heart'], ['\u{1F90D}','white heart'],
    ['\u{1F494}','broken heart'], ['\u2763\uFE0F','heart exclamation'], ['\u{1F495}','two hearts'], ['\u{1F4AF}','hundred perfect'],
    ['\u2705','check done'], ['\u274C','cross wrong'], ['\u2B55','circle'], ['\u2757','exclamation'],
    ['\u2753','question mark'], ['\u267B\uFE0F','recycle'], ['\u26A0\uFE0F','warning'], ['\u{1F525}','fire hot'],
    ['\u2728','sparkles'], ['\u2B50','star'], ['\u{1F534}','red circle'], ['\u{1F7E2}','green circle'],
    ['\u{1F535}','blue circle'], ['\u{1F7E1}','yellow circle'], ['\u{1F4A4}','sleep zzz'], ['\u{1F6AB}','forbidden no']
  ]},
  { name: 'Flags', icon: '\u{1F3C1}', items: [
    ['\u{1F3F3}\uFE0F','white flag surrender'], ['\u{1F3F4}','black flag'], ['\u{1F6A9}','red flag'], ['\u{1F3C1}','checkered flag finish'],
    ['\u{1F1F5}\u{1F1F0}','pakistan'], ['\u{1F1FA}\u{1F1F8}','usa america'], ['\u{1F1EC}\u{1F1E7}','uk britain'], ['\u{1F1EE}\u{1F1F3}','india'],
    ['\u{1F1F8}\u{1F1E6}','saudi arabia'], ['\u{1F1E6}\u{1F1EA}','uae emirates'], ['\u{1F1F9}\u{1F1F7}','turkey'], ['\u{1F1E8}\u{1F1F3}','china'],
    ['\u{1F1EF}\u{1F1F5}','japan'], ['\u{1F1E9}\u{1F1EA}','germany'], ['\u{1F1EB}\u{1F1F7}','france'], ['\u{1F1E8}\u{1F1E6}','canada'],
    ['\u{1F1E6}\u{1F1FA}','australia'], ['\u{1F1E7}\u{1F1E9}','bangladesh'], ['\u{1F1EE}\u{1F1E9}','indonesia']
  ]}
];

/* ---------------------------------------------------------
   4) GRAB ELEMENTS
--------------------------------------------------------- */
const launcher = document.getElementById('lc-launcher');
const badge = document.getElementById('lc-badge');
const panel = document.getElementById('lc-panel');
const closeBtn = document.getElementById('lc-close');
const fullscreenBtn = document.getElementById('lc-fullscreen');
const nameGate = document.getElementById('lc-name-gate');
const nameInput = document.getElementById('lc-name-input');
const nameSubmit = document.getElementById('lc-name-submit');
const nameError = document.getElementById('lc-name-error');
const messagesBox = document.getElementById('lc-messages');
const jumpBottomBtn = document.getElementById('lc-jump-bottom');
const formWrap = document.getElementById('lc-form-wrap');
const textInput = document.getElementById('lc-text-input');
const sendBtn = document.getElementById('lc-send-btn');
const suggestBox = document.getElementById('lc-suggest');

const emojiToggle = document.getElementById('lc-emoji-toggle');
const emojiPanel = document.getElementById('lc-emoji-panel');
const emojiTabs = document.getElementById('lc-emoji-tabs');
const emojiScroll = document.getElementById('lc-emoji-scroll');
const emojiSearchInput = document.getElementById('lc-emoji-search');
const emojiNoResults = document.getElementById('lc-emoji-no-results');

const imgToggle = document.getElementById('lc-img-toggle');
const imageRow = document.getElementById('lc-image-row');
const imageInput = document.getElementById('lc-image-input');
const imageSend = document.getElementById('lc-image-send');

const gifToggle = document.getElementById('lc-gif-toggle');
const gifPanel = document.getElementById('lc-gif-panel');
const gifSearch = document.getElementById('lc-gif-search');
const gifResults = document.getElementById('lc-gif-results');
const gifHint = document.getElementById('lc-gif-hint');

const replyBar = document.getElementById('lc-reply-bar');
const replyAuthorEl = document.getElementById('lc-reply-author');
const replyTextEl = document.getElementById('lc-reply-text');
const replyCancel = document.getElementById('lc-reply-cancel');

let emojiIgnoreScroll = false;

EMOJI_CATEGORIES.forEach(function(cat, idx){
  const tab = document.createElement('button');
  tab.type = 'button';
  tab.className = 'lc-emoji-tab' + (idx === 0 ? ' active' : '');
  tab.textContent = cat.icon;
  tab.title = cat.name;
  tab.dataset.cat = cat.name;
  tab.addEventListener('click', function(){
    emojiSearchInput.value = '';
    renderEmojiSections('');
    const section = emojiScroll.querySelector('[data-section="' + CSS.escape(cat.name) + '"]');
    if(section){
      emojiIgnoreScroll = true;
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveEmojiTab(cat.name);
      setTimeout(function(){ emojiIgnoreScroll = false; }, 500);
    }
  });
  emojiTabs.appendChild(tab);
});

function setActiveEmojiTab(catName){
  emojiTabs.querySelectorAll('.lc-emoji-tab').forEach(function(t){
    t.classList.toggle('active', t.dataset.cat === catName);
  });
}

function renderEmojiSections(filterRaw){
  const filter = filterRaw.trim().toLowerCase();
  emojiScroll.innerHTML = '';
  let anyMatch = false;

  EMOJI_CATEGORIES.forEach(function(cat){
    const matches = filter
      ? cat.items.filter(function(it){ return it[1].indexOf(filter) !== -1; })
      : cat.items;
    if(!matches.length) return;
    anyMatch = true;

    const section = document.createElement('div');
    section.dataset.section = cat.name;

    const title = document.createElement('div');
    title.className = 'lc-emoji-section-title';
    title.textContent = cat.name;
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'lc-emoji-section-grid';
    matches.forEach(function(it){
      const s = document.createElement('span');
      s.textContent = it[0];
      s.title = it[1];
      s.addEventListener('click', function(){
        textInput.value += it[0];
        textInput.focus();
      });
      grid.appendChild(s);
    });
    section.appendChild(grid);
    emojiScroll.appendChild(section);
  });

  emojiNoResults.style.display = anyMatch ? 'none' : 'block';
  if(filter) emojiTabs.querySelectorAll('.lc-emoji-tab').forEach(t => t.classList.remove('active'));
  else setActiveEmojiTab(EMOJI_CATEGORIES[0].name);
}
renderEmojiSections('');

let emojiSearchDebounce = null;
emojiSearchInput.addEventListener('input', function(){
  clearTimeout(emojiSearchDebounce);
  const val = emojiSearchInput.value;
  emojiSearchDebounce = setTimeout(function(){ renderEmojiSections(val); }, 120);
});

emojiScroll.addEventListener('scroll', function(){
  if(emojiIgnoreScroll) return;
  if(emojiSearchInput.value.trim()) return;
  const sections = emojiScroll.querySelectorAll('[data-section]');
  let current = null;
  sections.forEach(function(sec){
    if(sec.offsetTop - emojiScroll.scrollTop <= 28) current = sec;
  });
  if(current) setActiveEmojiTab(current.dataset.section);
});

function hideAllPanels(){
  emojiPanel.style.display = 'none';
  imageRow.style.display = 'none';
  gifPanel.style.display = 'none';
}
emojiToggle.addEventListener('click', function(){
  const showing = emojiPanel.style.display === 'flex';
  hideAllPanels();
  emojiPanel.style.display = showing ? 'none' : 'flex';
});
imgToggle.addEventListener('click', function(){
  const showing = imageRow.style.display === 'flex';
  hideAllPanels();
  imageRow.style.display = showing ? 'none' : 'flex';
  if(!showing) imageInput.focus();
});
gifToggle.addEventListener('click', function(){
  const showing = gifPanel.style.display === 'block';
  hideAllPanels();
  gifPanel.style.display = showing ? 'none' : 'block';
  if(!showing){
    gifSearch.focus();
    if(!gifResults.childElementCount) searchGifs('hi');
  }
});

function makeId(){
  if(window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}
let clientId = localStorage.getItem('lc_client_id');
if(!clientId){
  clientId = makeId();
  localStorage.setItem('lc_client_id', clientId);
}

let myName = localStorage.getItem('lc_username') || '';
let unread = 0;
let panelOpen = true; // chat is visible immediately on page load
let knownUsers = [];
let lastSnapshotDocs = [];
let replyingTo = null; // { author, text, image }

// whatever the visitor was trying to do (send text / image / gif / like)
// when we discovered they don't have a name yet - resumed once they join.
let pendingAction = null;

let highlightedMsgId = null;
let highlightTimeout = null;

let hasUnseenBelow = false;

// Chat (messages + composer) is shown right away for everyone, name or not.
// The name gate only appears on top of it when someone tries to send something.
showChat();
panel.classList.add('open');

launcher.addEventListener('click', function(){
  panelOpen = !panelOpen;
  panel.classList.toggle('open', panelOpen);
  if(panelOpen){
    unread = 0;
    badge.style.display = 'none';
    messagesBox.scrollTop = messagesBox.scrollHeight;
    hasUnseenBelow = false;
  }
});
closeBtn.addEventListener('click', function(){
  panelOpen = false;
  panel.classList.remove('open');
});
fullscreenBtn.addEventListener('click', function(){
  panel.classList.toggle('fullscreen');
});

nameSubmit.addEventListener('click', claimName);
nameInput.addEventListener('keydown', function(e){
  if(e.key === 'Enter') claimName();
});

// Call this before any action that needs a name (sending a message/image/gif,
// liking a message). If the visitor already has a name, it runs immediately;
// otherwise it opens the name gate and remembers the action to run afterwards.
function requireName(action){
  if(myName){ action(); return; }
  pendingAction = action;
  nameError.style.display = 'none';
  nameGate.style.display = 'flex';
  nameInput.focus();
}

async function claimName(){
  const n = nameInput.value.trim();
  if(!n) return;
  nameError.style.display = 'none';
  nameSubmit.disabled = true;
  nameSubmit.textContent = 'Checking...';
  try{
    const existing = await getDoc(doc(usersRef, n));
    if(existing.exists() && existing.data().ownerId && existing.data().ownerId !== clientId){
      nameError.style.display = 'block';
      nameSubmit.disabled = false;
      nameSubmit.textContent = 'Join';
      return;
    }
    await setDoc(doc(usersRef, n), { name: n, ownerId: clientId, lastSeen: serverTimestamp() });
    myName = n;
    localStorage.setItem('lc_username', n);
    nameGate.style.display = 'none';
    nameInput.value = '';
    if(pendingAction){
      const action = pendingAction;
      pendingAction = null;
      action();
    }
  } catch(err){
    nameError.textContent = 'Something went wrong, please try again.';
    nameError.style.display = 'block';
  } finally {
    nameSubmit.disabled = false;
    nameSubmit.textContent = 'Join';
  }
}

function showChat(){
  listenForMessages();
  listenForUsers();
  setInterval(function(){ renderMessages(false); }, 5000); // refresh so the 1-minute delete window updates
}

function listenForUsers(){
  onSnapshot(query(usersRef, orderBy('lastSeen','desc'), limit(50)), function(snap){
    knownUsers = [];
    snap.forEach(function(d){ knownUsers.push(d.id); });
  });
}

function timeNow(ts){
  if(!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date();
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

function renderText(text){
  return text.replace(/(^|\s)(@[a-zA-Z0-9_]+)/g, function(m, pre, tag){
    return pre + '<span class="lc-mention">' + tag + '</span>';
  });
}

function listenForMessages(){
  const q = query(messagesRef, orderBy('ts','asc'), limit(150));
  onSnapshot(q, function(snap){
    lastSnapshotDocs = [];
    snap.forEach(function(d){ lastSnapshotDocs.push({ id: d.id, data: d.data() }); });
    const hasNew = snap.docChanges().some(c => c.type === 'added');
    renderMessages(hasNew);
    if(!panelOpen && hasNew){
      unread++;
      badge.textContent = unread;
      badge.style.display = 'flex';
    }
  });
}

function startReplyTo(m, id){
  replyingTo = { id: id, author: m.author, text: m.text || '', image: m.image || null };
  showReplyBar();
}

function jumpToMessage(targetId){
  highlightedMsgId = targetId;
  if(highlightTimeout) clearTimeout(highlightTimeout);

  const el = document.getElementById('lc-msg-' + targetId);
  if(el){
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('lc-highlight');
  }

  highlightTimeout = setTimeout(function(){
    highlightedMsgId = null;
    const stale = document.getElementById('lc-msg-' + targetId);
    if(stale) stale.classList.remove('lc-highlight');
  }, 1300);
}

function renderMessages(hasNew){
  const distanceFromBottom = messagesBox.scrollHeight - messagesBox.scrollTop - messagesBox.clientHeight;
  const wasNearBottom = distanceFromBottom < 120 || messagesBox.scrollHeight === 0;
  const prevScrollTop = messagesBox.scrollTop;

  messagesBox.innerHTML = '';
  messagesBox.appendChild(jumpBottomBtn);

  lastSnapshotDocs.forEach(function(item){
    const id = item.id;
    const m = item.data;
    const isMe = m.author === myName;

    const wrap = document.createElement('div');
    wrap.className = 'lc-msg-wrap ' + (isMe ? 'me' : 'other');
    wrap.id = 'lc-msg-' + id;
    if(id === highlightedMsgId) wrap.classList.add('lc-highlight');

    const bubble = document.createElement('div');
    bubble.className = 'lc-msg ' + (isMe ? 'me' : 'other');
    if(!isMe) bubble.style.background = colorFor(m.author);

    let inner = '';
    if(m.replyTo){
      const clickable = m.replyTo.id ? ' lc-quote-clickable' : '';
      inner += '<div class="lc-quote' + clickable + '"><span class="lc-quote-author"></span><span class="lc-quote-text"></span></div>';
    }
    if(!isMe) inner += '<span class="lc-name"></span>';
    if(m.text) inner += '<span class="lc-body"></span>';
    if(m.image) inner += '<img class="lc-img" src="' + m.image + '">';
    bubble.innerHTML = inner;

    if(m.replyTo){
      const quoteEl = bubble.querySelector('.lc-quote');
      quoteEl.querySelector('.lc-quote-author').textContent = m.replyTo.author;
      quoteEl.querySelector('.lc-quote-text').textContent = m.replyTo.image ? '\u{1F4F7} GIF' : m.replyTo.text;
      if(m.replyTo.id){
        quoteEl.addEventListener('click', function(ev){
          ev.stopPropagation();
          jumpToMessage(m.replyTo.id);
        });
      }
    }
    if(!isMe) bubble.querySelector('.lc-name').textContent = m.author;
    if(m.text) bubble.querySelector('.lc-body').innerHTML = renderText(m.text);

    bubble.addEventListener('click', function(e){
      if(e.target.tagName === 'IMG') return;
      if(e.target.closest('.lc-quote')) return;
      startReplyTo(m, id);
    });

    wrap.appendChild(bubble);

    const meta = document.createElement('div');
    meta.className = 'lc-meta-row';
    const time = document.createElement('span');
    time.textContent = timeNow(m.ts);
    meta.appendChild(time);

    if(!isMe){
      const likes = m.likes || [];
      const likeBtn = document.createElement('button');
      likeBtn.className = 'lc-like-btn' + (likes.indexOf(myName) !== -1 ? ' liked' : '');
      likeBtn.textContent = '\u2665 ' + likes.length;
      likeBtn.addEventListener('click', function(ev){
        ev.stopPropagation();
        requireName(function(){
          const msgDoc = doc(messagesRef, id);
          const currentLikes = m.likes || [];
          if(currentLikes.indexOf(myName) !== -1){
            updateDoc(msgDoc, { likes: arrayRemove(myName) });
          } else {
            updateDoc(msgDoc, { likes: arrayUnion(myName) });
          }
        });
      });
      meta.appendChild(likeBtn);
    }

    const replyBtn = document.createElement('button');
    replyBtn.className = 'lc-reply-btn';
    replyBtn.textContent = 'reply';
    replyBtn.addEventListener('click', function(ev){
      ev.stopPropagation();
      startReplyTo(m, id);
    });
    meta.appendChild(replyBtn);

    if(isMe && m.ts && m.ts.toMillis && (Date.now() - m.ts.toMillis()) < 60000){
      const delBtn = document.createElement('button');
      delBtn.className = 'lc-del-btn';
      delBtn.textContent = 'delete';
      delBtn.addEventListener('click', function(ev){
        ev.stopPropagation();
        deleteDoc(doc(messagesRef, id));
      });
      meta.appendChild(delBtn);
    }

    wrap.appendChild(meta);
    messagesBox.appendChild(wrap);
  });

  if(wasNearBottom){
    messagesBox.scrollTop = messagesBox.scrollHeight;
    jumpBottomBtn.style.display = 'none';
    hasUnseenBelow = false;
  } else {
    if(hasNew) hasUnseenBelow = true;
    messagesBox.scrollTop = prevScrollTop;
    jumpBottomBtn.style.display = hasUnseenBelow ? 'block' : 'none';
  }
}

jumpBottomBtn.addEventListener('click', function(){
  messagesBox.scrollTop = messagesBox.scrollHeight;
  jumpBottomBtn.style.display = 'none';
  hasUnseenBelow = false;
});

function showReplyBar(){
  replyAuthorEl.textContent = replyingTo.author;
  replyTextEl.textContent = replyingTo.image ? '\u{1F4F7} Photo' : replyingTo.text;
  replyBar.style.display = 'flex';
  textInput.focus();
}
replyCancel.addEventListener('click', function(){
  replyingTo = null;
  replyBar.style.display = 'none';
});

textInput.addEventListener('input', function(){
  const val = textInput.value;
  const atMatch = val.match(/@([a-zA-Z0-9_]*)$/);
  if(atMatch){
    const partial = atMatch[1].toLowerCase();
    const matches = knownUsers.filter(function(u){ return u.toLowerCase().indexOf(partial) === 0 && u !== myName; });
    if(matches.length){
      suggestBox.innerHTML = '';
      matches.slice(0,6).forEach(function(u){
        const opt = document.createElement('div');
        opt.textContent = '@' + u;
        opt.addEventListener('click', function(){
          textInput.value = val.slice(0, atMatch.index) + '@' + u + ' ';
          suggestBox.style.display = 'none';
          textInput.focus();
        });
        suggestBox.appendChild(opt);
      });
      suggestBox.style.display = 'block';
    } else {
      suggestBox.style.display = 'none';
    }
  } else {
    suggestBox.style.display = 'none';
  }
});

imageSend.addEventListener('click', function(){ sendImageMessage(imageInput.value.trim()); imageInput.value=''; imageRow.style.display='none'; });
imageInput.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ sendImageMessage(imageInput.value.trim()); imageInput.value=''; imageRow.style.display='none'; } });

let gifDebounce = null;
gifSearch.addEventListener('input', function(){
  clearTimeout(gifDebounce);
  const q = gifSearch.value.trim();
  gifDebounce = setTimeout(function(){ searchGifs(q || 'hi'); }, 450);
});

async function searchGifs(q){
  if(GIPHY_API_KEY === 'YOUR_GIPHY_API_KEY'){
    gifHint.textContent = 'Add your GIPHY_API_KEY first (free at developers.giphy.com).';
    return;
  }
  gifHint.textContent = 'Searching...';
  try{
    const url = 'https://api.giphy.com/v1/gifs/search?api_key=' + GIPHY_API_KEY +
                '&q=' + encodeURIComponent(q) + '&limit=24&rating=g';
    const res = await fetch(url);
    const data = await res.json();
    gifResults.innerHTML = '';
    (data.data || []).forEach(function(g){
      const thumb = g.images && g.images.fixed_height_small ? g.images.fixed_height_small.url : null;
      const full = g.images && g.images.fixed_height ? g.images.fixed_height.url : thumb;
      if(!thumb) return;
      const img = document.createElement('img');
      img.src = thumb;
      img.addEventListener('click', function(){
        sendImageMessage(full);
        gifPanel.style.display = 'none';
      });
      gifResults.appendChild(img);
    });
    gifHint.textContent = '';
  } catch(err){
    gifHint.textContent = "Couldn't load GIFs, please try again.";
  }
}

// Sending a text message, image link, or gif now goes through requireName()
// first: if the visitor already has a name it sends right away; if not, the
// name gate opens and the send happens automatically right after they join.
async function sendImageMessage(url){
  if(!url) return;
  requireName(async function(){
    const payload = { author: myName, text: '', image: url, likes: [], ts: serverTimestamp() };
    if(replyingTo){ payload.replyTo = replyingTo; replyingTo = null; replyBar.style.display = 'none'; }
    await addDoc(messagesRef, payload);
    await setDoc(doc(usersRef, myName), { name: myName, ownerId: clientId, lastSeen: serverTimestamp() });
  });
}

sendBtn.addEventListener('click', sendMessage);
textInput.addEventListener('keydown', function(e){
  if(e.key === 'Enter' && suggestBox.style.display !== 'block') sendMessage();
});

async function sendMessage(){
  const raw = textInput.value.trim();
  if(!raw) return;
  requireName(async function(){
    const text = maskBanned(raw);
    textInput.value = '';
    suggestBox.style.display = 'none';
    const payload = { author: myName, text: text, image: null, likes: [], ts: serverTimestamp() };
    if(replyingTo){ payload.replyTo = replyingTo; replyingTo = null; replyBar.style.display = 'none'; }
    await addDoc(messagesRef, payload);
    await setDoc(doc(usersRef, myName), { name: myName, ownerId: clientId, lastSeen: serverTimestamp() });
  });
}