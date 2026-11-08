(function() {
  const scriptTag = document.currentScript || document.querySelector("script[src*=\"widget.js\"]");
  const businessId = scriptTag?.getAttribute("data-business-id");

  if (!businessId) {
    console.error("ArqFlow Widget: data-business-id is missing from the script tag.");
    return;
  }

  let baseUrl = "https://arq-flow-website.vercel.app";
  if (scriptTag && scriptTag.src && scriptTag.src.startsWith("http")) {
    try {
      baseUrl = new URL(scriptTag.src).origin;
    } catch (e) {
      console.warn("ArqFlow Widget: Failed to parse script src for baseUrl");
    }
  }

  let sessionId = localStorage.getItem("arqflow_widget_session");
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
  if (!sessionId || !isUUID) {
    sessionId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem("arqflow_widget_session", sessionId);
  }

  let config = {
    color: "#2563eb",
    bot_name: 'المساعد الذكي',
    welcome_message: 'مرحباً بك! كيف يمكنني مساعدتك اليوم؟',
    font_family: "Cairo",
    position: "right",
    logo_url: ""
  };
  let isOpen = false;

  const container = document.createElement("div");
  container.id = "arqflow-widget-container";
  
  const style = document.createElement("style");
  style.innerHTML = `
    @import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Tajawal:wght@400;500;700&family=Almarai:wght@400;700&display=swap");

    #arqflow-widget-container {
      position: fixed;
      bottom: 24px;
      z-index: 999999;
      direction: rtl;
    }
    #arqflow-widget-container.pos-right { right: 24px; }
    #arqflow-widget-container.pos-left { left: 24px; }

    .arqflow-fab {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background-color: var(--widget-color, #2563eb);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .arqflow-fab:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 28px rgba(0,0,0,0.25);
    }
    
    .arqflow-chat-window {
      position: absolute;
      bottom: 85px;
      width: 380px;
      height: 600px;
      max-height: calc(100vh - 120px);
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transform: translateY(20px) scale(0.95);
      transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
      border: 1px solid rgba(0,0,0,0.05);
    }
    #arqflow-widget-container.pos-right .arqflow-chat-window { right: 0; transform-origin: bottom right; }
    #arqflow-widget-container.pos-left .arqflow-chat-window { left: 0; transform-origin: bottom left; }

    .arqflow-chat-window.open {
      opacity: 1;
      pointer-events: all;
      transform: translateY(0) scale(1);
    }
    
    .arqflow-header {
      background: linear-gradient(135deg, var(--widget-color, #2563eb) 0%, var(--widget-color-dark, #1d4ed8) 100%);
      color: white;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: relative;
      z-index: 2;
    }
    .arqflow-header-img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: white;
      object-fit: cover;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .arqflow-header-title {
      font-weight: 700;
      font-size: 18px;
      margin: 0;
      letter-spacing: 0.3px;
    }
    .arqflow-header-status {
      font-size: 13px;
      opacity: 0.9;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
    }
    .arqflow-header-dot {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 0 0 2px rgba(255,255,255,0.2);
    }
    .arqflow-close {
      margin-right: auto;
      background: rgba(255,255,255,0.15);
      border: none;
      color: white;
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .arqflow-close:hover {
      background: rgba(255,255,255,0.3);
    }
    
    .arqflow-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 16px;
      scroll-behavior: smooth;
    }
    .arqflow-messages::-webkit-scrollbar {
      width: 6px;
    }
    .arqflow-messages::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      border-radius: 10px;
    }
    
    @keyframes slideInUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .arqflow-message {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14.5px;
      line-height: 1.5;
      animation: slideInUp 0.3s ease forwards;
      box-shadow: 0 2px 5px rgba(0,0,0,0.04);
      position: relative;
    }
    .arqflow-message.bot {
      background: white;
      color: #1e293b;
      align-self: flex-start;
      border-top-right-radius: 4px;
      border: 1px solid rgba(0,0,0,0.05);
    }
    .arqflow-message.user {
      background: var(--widget-color, #2563eb);
      color: white;
      align-self: flex-end;
      border-top-left-radius: 4px;
    }
    
    .arqflow-input-area {
      padding: 16px;
      background: white;
      border-top: 1px solid rgba(0,0,0,0.05);
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .arqflow-input {
      color: #1e293b !important;
      color: #1e293b !important;
      flex: 1;
      padding: 14px 16px;
      background: #f1f5f9;
      border: 1px solid transparent;
      border-radius: 24px;
      outline: none;
      font-family: inherit;
      font-size: 14px;
      transition: all 0.2s;
    }
    .arqflow-input:focus {
      background: white;
      border-color: var(--widget-color, #2563eb);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    .arqflow-send {
      background: var(--widget-color, #2563eb);
      color: white;
      border: none;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s, background 0.2s;
    }
    .arqflow-send:hover {
      transform: scale(1.05);
    }
    .arqflow-send:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .arqflow-typing {
      display: none;
      align-self: flex-start;
      background: white;
      padding: 12px 16px;
      border-radius: 16px;
      border-top-right-radius: 4px;
      border: 1px solid rgba(0,0,0,0.05);
      box-shadow: 0 2px 5px rgba(0,0,0,0.04);
    }
    .arqflow-typing .dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      background: #94a3b8;
      border-radius: 50%;
      margin: 0 2px;
      animation: typingBounce 1.4s infinite ease-in-out both;
    }
    .arqflow-typing .dot:nth-child(1) { animation-delay: -0.32s; }
    .arqflow-typing .dot:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes typingBounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    
    .arqflow-footer {
      text-align: center;
      padding: 4px 12px 12px;
      font-size: 11px;
      color: #94a3b8;
      background: white;
    }
    .arqflow-footer a {
      color: #94a3b8;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }
    .arqflow-footer a:hover {
      color: var(--widget-color, #2563eb);
    }
    
    @media (max-width: 480px) {
      .arqflow-chat-window {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        bottom: 0;
        right: 0 !important;
        left: 0 !important;
        border-radius: 0;
        transform: translateY(100%);
      }
      .arqflow-chat-window.open {
        transform: translateY(0);
      }
      #arqflow-widget-container {
        bottom: 16px;
        right: 16px;
      }
    }
  `;
  document.head.appendChild(style);

  container.innerHTML = `
    <div class="arqflow-chat-window" id="arqflow-chat-window">
      <div class="arqflow-header" id="arqflow-header">
        <div id="arqflow-avatar-container"></div>
        <div>
          <h3 class="arqflow-header-title" id="arqflow-title">جاري التحميل...</h3>
          <div class="arqflow-header-status"><span class="arqflow-header-dot"></span> متصل الآن</div>
        </div>
        <button class="arqflow-close" id="arqflow-close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="arqflow-messages" id="arqflow-messages">
        <div class="arqflow-typing" id="arqflow-typing">
          <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        </div>
      </div>
      <form class="arqflow-input-area" id="arqflow-form">
        <input type="text" class="arqflow-input" id="arqflow-input" placeholder="اكتب رسالتك هنا..." autocomplete="off">
        <button type="submit" class="arqflow-send" id="arqflow-send">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      
      </form>
      <div class="arqflow-footer">
        صُنع بواسطة <a href="#" target="_blank" id="arqflow-brand-link">Arq Flow</a>
      </div>
    </div>

    <div class="arqflow-fab" id="arqflow-fab">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    </div>
  `;
  document.body.appendChild(container);

  const dom = {
    fab: document.getElementById("arqflow-fab"),
    chatWindow: document.getElementById("arqflow-chat-window"),
    close: document.getElementById("arqflow-close"),
    title: document.getElementById("arqflow-title"),
    avatarContainer: document.getElementById("arqflow-avatar-container"),
    messages: document.getElementById("arqflow-messages"),
    form: document.getElementById("arqflow-form"),
    input: document.getElementById("arqflow-input"),
    send: document.getElementById("arqflow-send"),
    typing: document.getElementById("arqflow-typing")
  };

  function addMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "arqflow-message " + sender;
    msgDiv.textContent = text;
    dom.messages.insertBefore(msgDiv, dom.typing);
    setTimeout(() => { dom.messages.scrollTop = dom.messages.scrollHeight; }, 50);
  }

  function toggle() {
    isOpen = !isOpen;
    if (isOpen) {
      dom.chatWindow.classList.add("open");
      dom.fab.style.transform = "scale(0)";
      dom.fab.style.opacity = "0";
      setTimeout(() => dom.input.focus(), 300);
    } else {
      dom.chatWindow.classList.remove("open");
      dom.fab.style.transform = "scale(1)";
      dom.fab.style.opacity = "1";
    }
  }

  dom.fab.addEventListener("click", toggle);
  dom.close.addEventListener("click", toggle);

  dom.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = dom.input.value.trim();
    if (!text) return;

    dom.input.value = "";
    addMessage(text, "user");
    dom.typing.style.display = "flex";
    dom.send.disabled = true;
    dom.messages.scrollTop = dom.messages.scrollHeight;

    try {
      const res = await fetch(baseUrl + "/api/widget/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: businessId, session_id: sessionId, message: text })
      });
      const data = await res.json();
      dom.typing.style.display = "none";
      if (res.ok && data.reply) { addMessage(data.reply, "bot"); } 
      else { addMessage(data.error || "عفواً، حدث خطأ. الرجاء المحاولة لاحقاً.", "bot"); }
    } catch (err) {
      console.error(err);
      dom.typing.style.display = "none";
      addMessage("عفواً، فشل الاتصال. الرجاء التأكد من الإنترنت.", "bot");
    } finally {
      dom.send.disabled = false;
      dom.input.focus();
    }
  });

  async function loadConfig() {
    try {
      const res = await fetch(baseUrl + "/api/widget/config?business_id=" + businessId);
      if (res.ok) {
        const data = await res.json();
        const apiConfig = data.config || {};
        config.color = apiConfig.color || config.color;
        config.bot_name = apiConfig.bot_name || config.bot_name;
        config.welcome_message = apiConfig.welcome_message || config.welcome_message;
        config.font_family = apiConfig.font_family || config.font_family;
        config.position = apiConfig.position || config.position;
        
        config.logo_url = apiConfig.logo_url || data.logo_url || "";
        
        const brandLink = document.getElementById("arqflow-brand-link");
        if (brandLink) {
          brandLink.href = data.powered_by_url || "https://arqflow.com";
          brandLink.textContent = data.powered_by_name || "Arq Flow";
        }


        container.style.setProperty("--widget-color", config.color);
        container.style.setProperty("--widget-color-dark", config.color); 
        
        let fontStr = "\"Cairo\", sans-serif";
        if (config.font_family === "Tajawal") fontStr = "\"Tajawal\", sans-serif";
        else if (config.font_family === "Almarai") fontStr = "\"Almarai\", sans-serif";
        else if (config.font_family === "system-ui") fontStr = "system-ui, -apple-system, sans-serif";
        
        container.style.fontFamily = fontStr;
        container.classList.add("pos-" + config.position);
        dom.title.textContent = config.bot_name;
        
        if (config.logo_url) {
          dom.avatarContainer.innerHTML = `<img src="${config.logo_url}" class="arqflow-header-img" alt="Logo">`;
        } else {
          dom.avatarContainer.innerHTML = `
            <div class="arqflow-header-img" style="display:flex;align-items:center;justify-content:center;color:var(--widget-color);font-weight:bold;font-size:20px;">
              ${config.bot_name.charAt(0)}
            </div>
          `;
        }

        addMessage(config.welcome_message, "bot");
      } else {
        dom.title.textContent = "شات معطل";
        dom.input.disabled = true;
      }
    } catch (err) {
      console.error("Error loading config", err);
    }
  }

  loadConfig();
})();
