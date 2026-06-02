const STORAGE_KEY = "long_distance_love_app_v1";
const BACKUP_KEY = `${STORAGE_KEY}_backup_before_upgrade`;
const WEATHER_CACHE_MS = 20 * 60 * 1000;

const navItems = [
  { id: "home", label: "首页", title: "首页", icon: "home" },
  { id: "messages", label: "留言", title: "留言板", icon: "message" },
  { id: "daily", label: "日常", title: "日常分享", icon: "sun" },
  { id: "wishes", label: "心愿", title: "心愿清单", icon: "star" },
  { id: "memories", label: "回忆", title: "回忆时间线", icon: "clock" },
  { id: "settings", label: "设置", title: "设置", icon: "settings" },
];

const defaultState = {
  profile: {
    personA: "你",
    personB: "对方",
    cityA: "上海",
    cityB: "北京",
    startDate: "2024-05-20",
    nextMeetDate: "2026-07-12",
    accessCode: "5201314",
    weatherA: { condition: "多云", temp: 26, humidity: 68, wind: "东南风 3 级", updatedAt: "" },
    weatherB: { condition: "晴", temp: 29, humidity: 42, wind: "西南风 2 级", updatedAt: "" },
  },
  messages: [
    {
      id: crypto.randomUUID(),
      author: "对方",
      content: "今天路过一家小店，看到一只很适合你的杯子。等下次见面，我们一起去挑。",
      imageData: "",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
  ],
  posts: [
    {
      id: crypto.randomUUID(),
      author: "你",
      content: "今天下班路上的云很好看，突然觉得下一次见面又近了一点。",
      mood: "期待",
      imageData: "",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    },
  ],
  wishes: [
    {
      id: crypto.randomUUID(),
      title: "一起去海边看日出",
      description: "不用赶时间，带一杯热咖啡，等天慢慢亮起来。",
      status: "pending",
      createdBy: "你",
      imageData: "",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      completedAt: "",
    },
  ],
  memories: [
    {
      id: crypto.randomUUID(),
      title: "第一次认真规划未来",
      content: "那天聊了很久，也把很多不确定说清楚了。",
      memoryDate: "2025-10-01",
      imageData: "",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    },
  ],
};

let state = loadState();
normalizeLegacyState();
let currentView = "home";
let messageFilter = "all";

const iconPaths = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h14v-9.5"/><path d="M9.5 20v-6h5v6"/>',
  message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
  star: '<path d="m12 3 2.7 5.47 6.03.88-4.36 4.25 1.03 6-5.4-2.84L6.6 19.6l1.03-6-4.36-4.25 6.03-.88Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  settings: '<path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9 4.6a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.2a1.6 1.6 0 0 0-1.5 1Z"/>',
  heart: '<path d="M12 21s-7.2-4.4-9.2-9.2C1.3 8.2 3.5 4.5 7.1 4.5c2 0 3.4 1 4.1 2.1.7-1.1 2.1-2.1 4.1-2.1 3.6 0 5.8 3.7 4.3 7.3C17.6 16.6 12 21 12 21Z"/>',
  calendar: '<path d="M8 2v4M16 2v4M3 10h18"/><path d="M5 4h14a2 2 0 0 1 2 2v15H3V6a2 2 0 0 1 2-2Z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 16h10l1-16"/><path d="M10 11v6M14 11v6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
};

function svgIcon(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] || iconPaths.heart}</svg>`;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(defaultState);
  try {
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      profile: { ...structuredClone(defaultState.profile), ...(parsed.profile || {}) },
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeLegacyState() {
  const rawBeforeMigration = localStorage.getItem(STORAGE_KEY);
  if (state.profile.personB === "TA") state.profile.personB = "对方";
  ["messages", "posts"].forEach((collection) => {
    state[collection] = state[collection].map((item) => ({
      ...item,
      author: item.author === "TA" ? state.profile.personB : item.author,
      imageData: item.imageData || "",
    }));
  });
  state.wishes = state.wishes.map((item) => ({
    ...item,
    createdBy: item.createdBy === "TA" ? state.profile.personB : item.createdBy,
    imageData: item.imageData || "",
  }));
  state.memories = state.memories.map((item) => ({ ...item, imageData: item.imageData || "" }));
  const rawAfterMigration = JSON.stringify(state);
  if (rawBeforeMigration && rawBeforeMigration !== rawAfterMigration) {
    if (!localStorage.getItem(BACKUP_KEY)) localStorage.setItem(BACKUP_KEY, rawBeforeMigration);
    saveState();
  }
}

function formatDate(dateInput) {
  if (!dateInput) return "未设置";
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric" }).format(new Date(dateInput));
}

function formatTime(dateInput) {
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(dateInput));
}

function splitDate(dateInput) {
  const fallback = new Date().toISOString().slice(0, 10);
  const [year, month, day] = String(dateInput || fallback).split("-").map(Number);
  return { year, month, day };
}

function composeDate(data, prefix) {
  const year = Number(data[`${prefix}Year`]);
  const month = Number(data[`${prefix}Month`]);
  const maxDay = new Date(year, month, 0).getDate();
  const day = Math.min(Number(data[`${prefix}Day`]), maxDay);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function dateSelector(prefix, label, value) {
  const { year, month, day } = splitDate(value);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 91 }, (_, index) => currentYear - 70 + index);
  const months = Array.from({ length: 12 }, (_, index) => index + 1);
  const days = Array.from({ length: 31 }, (_, index) => index + 1);
  return `
    <fieldset class="date-field">
      <legend>${label}</legend>
      <div class="date-selects">
        <select name="${prefix}Year" aria-label="${label}年份">
          ${years.map((item) => `<option value="${item}" ${item === year ? "selected" : ""}>${item} 年</option>`).join("")}
        </select>
        <select name="${prefix}Month" aria-label="${label}月份">
          ${months.map((item) => `<option value="${item}" ${item === month ? "selected" : ""}>${item} 月</option>`).join("")}
        </select>
        <select name="${prefix}Day" aria-label="${label}日期">
          ${days.map((item) => `<option value="${item}" ${item === day ? "selected" : ""}>${item} 日</option>`).join("")}
        </select>
      </div>
    </fieldset>
  `;
}

function daysBetween(from, to = new Date()) {
  const start = new Date(from);
  const end = new Date(to);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end - start) / 86400000);
}

function relationshipDays() {
  return Math.max(1, daysBetween(state.profile.startDate) + 1);
}

function meetCountdown() {
  const days = daysBetween(new Date(), state.profile.nextMeetDate);
  if (Number.isNaN(days)) return { label: "未设置", sub: "去设置页填上下次见面的日子" };
  if (days > 0) return { label: `${days} 天`, sub: `下次见面：${formatDate(state.profile.nextMeetDate)}` };
  if (days === 0) return { label: "今天", sub: "今天就是见面的日子" };
  return { label: "已过期", sub: "可以更新下一次见面日期" };
}

function newest(items) {
  return [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
}

function renderNav() {
  document.querySelector("#navList").innerHTML = navItems
    .map(
      (item) => `
        <button class="nav-item ${item.id === currentView ? "is-active" : ""}" type="button" data-view="${item.id}" aria-label="${item.label}">
          ${svgIcon(item.icon)}
          <span class="nav-label">${item.label}</span>
        </button>
      `
    )
    .join("");
}

function switchView(view) {
  currentView = view;
  document.querySelectorAll(".view").forEach((el) => el.classList.remove("is-active"));
  document.querySelector(`#view-${view}`).classList.add("is-active");
  document.querySelector("#pageTitle").textContent = navItems.find((item) => item.id === view).title;
  renderNav();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderHome() {
  const latestMessage = newest(state.messages);
  const latestPost = newest(state.posts);
  const latestWish = newest(state.wishes);
  const latestMemory = newest(state.memories);
  const countdown = meetCountdown();

  document.querySelector("#view-home").innerHTML = `
    <div class="hero-panel">
      <div class="hero-copy">
        <p class="eyebrow">${state.profile.cityA} / ${state.profile.cityB}</p>
        <h3>${state.profile.personA} 和 ${state.profile.personB}，已经一起走过 ${relationshipDays()} 天</h3>
        <p>今天也把两座城市放在同一个页面里。天气、想念、计划和回忆都在这里慢慢积累。</p>
      </div>
      <img class="cat-mascot" src="./assets/city-cat.svg" alt="双城记原创白猫插画" />
    </div>

    <div class="grid three">
      <article class="card card-pad metric">
        <div class="metric-icon">${svgIcon("heart")}</div>
        <div>
          <strong>${relationshipDays()}</strong>
          <span>在一起的天数</span>
          <p class="muted">从 ${formatDate(state.profile.startDate)} 开始</p>
        </div>
      </article>
      <article class="card card-pad metric">
        <div class="metric-icon">${svgIcon("calendar")}</div>
        <div>
          <strong>${countdown.label}</strong>
          <span>距离下次见面</span>
          <p class="muted">${countdown.sub}</p>
        </div>
      </article>
      <article class="card card-pad metric">
        <div class="metric-icon">${svgIcon("star")}</div>
        <div>
          <strong>${state.wishes.filter((wish) => wish.status === "done").length}</strong>
          <span>已经实现的心愿</span>
          <p class="muted">${state.wishes.length} 个心愿正在清单里</p>
        </div>
      </article>
    </div>

    <div class="section-head">
      <h3>两座城市的今天</h3>
      <button class="button secondary" type="button" data-action="go-settings">${svgIcon("settings")}编辑</button>
    </div>
    <div class="grid two">
      ${renderWeather(state.profile.personA, state.profile.cityA, state.profile.weatherA)}
      ${renderWeather(state.profile.personB, state.profile.cityB, state.profile.weatherB)}
    </div>

    <div class="section-head">
      <h3>最近发生</h3>
    </div>
    <div class="grid two">
      ${previewCard("最近留言", latestMessage?.content, latestMessage ? `${latestMessage.author} · ${formatTime(latestMessage.createdAt)}` : "还没有留言", "messages")}
      ${previewCard("最近日常", latestPost?.content, latestPost ? `${latestPost.author} · ${latestPost.mood}` : "还没有日常", "daily")}
      ${previewCard("最近心愿", latestWish?.title, latestWish ? statusLabel(latestWish.status) : "还没有心愿", "wishes")}
      ${previewCard("最近回忆", latestMemory?.title, latestMemory ? formatDate(latestMemory.memoryDate) : "还没有回忆", "memories")}
    </div>
  `;
}

function renderWeather(person, city, weather) {
  return `
    <article class="card card-pad weather-card">
      <div class="weather-head">
        <div>
          <p class="eyebrow">${person}</p>
          <h3>${city}</h3>
        </div>
        <div class="temp">${weather.temp}°</div>
      </div>
      <div class="weather-details">
        <span class="pill">${weather.condition}</span>
        <span class="pill">湿度 ${weather.humidity}%</span>
        <span class="pill">${weather.wind}</span>
      </div>
    </article>
  `;
}

function previewCard(title, content, meta, target) {
  return `
    <article class="card card-pad">
      <p class="eyebrow">${title}</p>
      <p class="item-content">${escapeHtml(content || "还没有内容，去写下第一条吧。")}</p>
      <div class="item-meta">
        <span>${escapeHtml(meta)}</span>
        <button class="button secondary" type="button" data-action="go" data-target="${target}">查看</button>
      </div>
    </article>
  `;
}

function renderMessages() {
  const messages = [...state.messages]
    .filter((item) => messageFilter === "all" || item.author === state.profile[messageFilter])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  document.querySelector("#view-messages").innerHTML = `
    <div class="grid two">
      <article class="card card-pad">
        <h3>写给对方</h3>
        <form class="form" id="messageForm">
          <div class="form-row">
            <label for="messageAuthor">发送人</label>
            <select id="messageAuthor" name="author">
              <option>${state.profile.personA}</option>
              <option>${state.profile.personB}</option>
            </select>
          </div>
          <div class="form-row">
            <label for="messageContent">留言</label>
            <textarea id="messageContent" name="content" placeholder="写一句今天想让对方看到的话" required></textarea>
          </div>
          <div class="form-row">
            <label for="messageImage">照片</label>
            <input id="messageImage" name="image" type="file" accept="image/*" />
          </div>
          <button class="button" type="submit">${svgIcon("plus")}发布留言</button>
        </form>
      </article>
      <article class="card card-pad">
        <h3>小提示</h3>
        <p class="muted">留言会保存在当前浏览器里。后续接入数据库后，可以让两个人在不同设备上同步看到。</p>
      </article>
    </div>
    <div class="section-head">
      <h3>留言列表</h3>
    </div>
    <div class="tabs">
      ${filterButton("all", "全部", messageFilter)}
      ${filterButton("personA", state.profile.personA, messageFilter)}
      ${filterButton("personB", state.profile.personB, messageFilter)}
    </div>
    <div class="feed">
      ${messages.length ? messages.map(renderMessageItem).join("") : emptyState("还没有符合条件的留言")}
    </div>
  `;
}

function filterButton(value, label, activeValue) {
  return `<button class="tab ${value === activeValue ? "is-active" : ""}" type="button" data-action="filter-message" data-filter="${value}">${label}</button>`;
}

function renderMessageItem(item) {
  return `
    <article class="card feed-item">
      <div class="item-meta">
        <strong>${escapeHtml(item.author)}</strong>
        <span>${formatTime(item.createdAt)}</span>
      </div>
      <p class="item-content">${escapeHtml(item.content)}</p>
      ${renderImage(item.imageData, "留言照片")}
      <div class="item-actions">
        <button class="icon-button" type="button" aria-label="删除留言" data-action="delete-message" data-id="${item.id}">${svgIcon("trash")}</button>
      </div>
    </article>
  `;
}

function renderDaily() {
  const posts = [...state.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  document.querySelector("#view-daily").innerHTML = `
    <article class="card card-pad">
      <h3>分享今天</h3>
      <form class="form" id="postForm">
        <div class="form-grid">
          <div class="form-row">
            <label for="postAuthor">发布人</label>
            <select id="postAuthor" name="author">
              <option>${state.profile.personA}</option>
              <option>${state.profile.personB}</option>
            </select>
          </div>
          <div class="form-row">
            <label for="postMood">心情</label>
            <select id="postMood" name="mood">
              <option>开心</option>
              <option>想你</option>
              <option>普通</option>
              <option>疲惫</option>
              <option>期待</option>
              <option>委屈</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <label for="postContent">日常</label>
          <textarea id="postContent" name="content" placeholder="今天有什么想分享的小事？" required></textarea>
        </div>
        <div class="form-row">
          <label for="postImage">图片</label>
          <input id="postImage" name="image" type="file" accept="image/*" />
        </div>
        <button class="button" type="submit">${svgIcon("plus")}发布日常</button>
      </form>
    </article>
    <div class="section-head">
      <h3>日常记录</h3>
    </div>
    <div class="feed">
      ${posts.length ? posts.map(renderPostItem).join("") : emptyState("还没有日常")}
    </div>
  `;
}

function renderPostItem(item) {
  return `
    <article class="card feed-item">
      <div class="item-meta">
        <strong>${escapeHtml(item.author)}</strong>
        <span>${formatTime(item.createdAt)}</span>
      </div>
      <span class="pill">${escapeHtml(item.mood)}</span>
      <p class="item-content">${escapeHtml(item.content)}</p>
      ${renderImage(item.imageData, "日常照片")}
      <div class="item-actions">
        <button class="icon-button" type="button" aria-label="删除日常" data-action="delete-post" data-id="${item.id}">${svgIcon("trash")}</button>
      </div>
    </article>
  `;
}

function renderWishes() {
  const columns = [
    ["pending", "未开始"],
    ["doing", "进行中"],
    ["done", "已实现"],
  ];
  document.querySelector("#view-wishes").innerHTML = `
    <article class="card card-pad">
      <h3>许一个心愿</h3>
      <form class="form" id="wishForm">
        <div class="form-grid">
          <div class="form-row">
            <label for="wishTitle">心愿</label>
            <input id="wishTitle" name="title" placeholder="一起去..." required />
          </div>
          <div class="form-row">
            <label for="wishAuthor">许愿人</label>
            <select id="wishAuthor" name="createdBy">
              <option>${state.profile.personA}</option>
              <option>${state.profile.personB}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <label for="wishDescription">描述</label>
          <textarea id="wishDescription" name="description" placeholder="写一点这个心愿为什么重要"></textarea>
        </div>
        <div class="form-row">
          <label for="wishImage">照片</label>
          <input id="wishImage" name="image" type="file" accept="image/*" />
        </div>
        <button class="button" type="submit">${svgIcon("plus")}添加心愿</button>
      </form>
    </article>
    <div class="section-head">
      <h3>清单</h3>
    </div>
    <div class="wish-board">
      ${columns
        .map(([status, label]) => {
          const wishes = state.wishes.filter((wish) => wish.status === status);
          return `
            <section class="card wish-column">
              <h3>${label}</h3>
              ${wishes.length ? wishes.map(renderWishItem).join("") : `<p class="muted">这里还空着</p>`}
            </section>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderWishItem(item) {
  return `
    <article class="card feed-item">
      <div class="item-meta">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.createdBy)}</span>
      </div>
      <p class="item-content">${escapeHtml(item.description || "没有补充描述")}</p>
      ${renderImage(item.imageData, "心愿照片")}
      <select data-action="update-wish" data-id="${item.id}" aria-label="更新心愿状态">
        <option value="pending" ${item.status === "pending" ? "selected" : ""}>未开始</option>
        <option value="doing" ${item.status === "doing" ? "selected" : ""}>进行中</option>
        <option value="done" ${item.status === "done" ? "selected" : ""}>已实现</option>
      </select>
      <div class="item-actions">
        <button class="icon-button" type="button" aria-label="删除心愿" data-action="delete-wish" data-id="${item.id}">${svgIcon("trash")}</button>
      </div>
    </article>
  `;
}

function renderMemories() {
  const memories = [...state.memories].sort((a, b) => new Date(b.memoryDate) - new Date(a.memoryDate));
  const today = new Date().toISOString().slice(0, 10);
  document.querySelector("#view-memories").innerHTML = `
    <article class="card card-pad">
      <h3>保存一段回忆</h3>
      <form class="form" id="memoryForm">
        <div class="form-grid">
          <div class="form-row">
            <label for="memoryTitle">标题</label>
            <input id="memoryTitle" name="title" placeholder="那天..." required />
          </div>
          ${dateSelector("memoryDate", "回忆日期", today)}
        </div>
        <div class="form-row">
          <label for="memoryContent">内容</label>
          <textarea id="memoryContent" name="content" placeholder="这段回忆里有什么？" required></textarea>
        </div>
        <div class="form-row">
          <label for="memoryImage">图片</label>
          <input id="memoryImage" name="image" type="file" accept="image/*" />
        </div>
        <button class="button" type="submit">${svgIcon("plus")}添加回忆</button>
      </form>
    </article>
    <div class="section-head">
      <h3>时间线</h3>
    </div>
    <div class="timeline">
      ${memories.length ? memories.map(renderMemoryItem).join("") : emptyState("还没有回忆")}
    </div>
  `;
}

function renderMemoryItem(item) {
  return `
    <article class="timeline-item">
      <div class="timeline-date">${formatDate(item.memoryDate)}</div>
      <div class="card feed-item">
        <div class="item-meta">
          <strong>${escapeHtml(item.title)}</strong>
          <button class="icon-button" type="button" aria-label="删除回忆" data-action="delete-memory" data-id="${item.id}">${svgIcon("trash")}</button>
        </div>
        <p class="item-content">${escapeHtml(item.content)}</p>
        ${renderImage(item.imageData, "回忆照片")}
      </div>
    </article>
  `;
}

function renderImage(imageData, alt) {
  if (!imageData) return "";
  return `
    <a class="image-preview" href="${imageData}" target="_blank" rel="noreferrer" aria-label="查看大图">
      <img src="${imageData}" alt="${alt}" />
    </a>
  `;
}

function renderSettings() {
  const profile = state.profile;
  document.querySelector("#view-settings").innerHTML = `
    <article class="card card-pad">
      <h3>基础设置</h3>
      <form class="form" id="settingsForm">
        <div class="form-grid">
          <div class="form-row">
            <label for="personA">你的昵称</label>
            <input id="personA" name="personA" value="${escapeAttr(profile.personA)}" required />
          </div>
          <div class="form-row">
            <label for="personB">对方昵称</label>
            <input id="personB" name="personB" value="${escapeAttr(profile.personB)}" required />
          </div>
          <div class="form-row">
            <label for="cityA">你的城市</label>
            <input id="cityA" name="cityA" value="${escapeAttr(profile.cityA)}" required />
          </div>
          <div class="form-row">
            <label for="cityB">对方城市</label>
            <input id="cityB" name="cityB" value="${escapeAttr(profile.cityB)}" required />
          </div>
          ${dateSelector("startDate", "在一起日期", profile.startDate)}
          ${dateSelector("nextMeetDate", "下次见面日期", profile.nextMeetDate)}
        </div>
        <div class="form-grid three">
          <div class="form-row">
            <label for="accessCode">访问密码</label>
            <input id="accessCode" name="accessCode" type="password" value="${escapeAttr(profile.accessCode)}" minlength="4" required />
          </div>
        </div>
        <div class="sync-note">
          <strong>共享状态</strong>
          <span>当前版本的数据保存在本机浏览器。每条内容已经记录发布人；接入数据库后，对方登录同一个空间就能看到。</span>
        </div>
        <div class="sync-note">
          <strong>数据保护</strong>
          <span>升级时会尽量保留原有设置和内容。若你之前用过不同打开方式或端口，浏览器会把它当成另一个数据空间。</span>
          <div class="button-row">
            <button class="button secondary" type="button" data-action="export-data">导出当前数据</button>
            ${localStorage.getItem(BACKUP_KEY) ? `<button class="button secondary" type="button" data-action="restore-backup">恢复升级前备份</button>` : ""}
          </div>
        </div>
        <div class="button-row">
          <button class="button" type="submit">保存设置</button>
        </div>
      </form>
    </article>
  `;
}

function render() {
  document.querySelector("#todayLabel").textContent = new Intl.DateTimeFormat("zh-CN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
  renderHome();
  renderMessages();
  renderDaily();
  renderWishes();
  renderMemories();
  renderSettings();
  renderNav();
}

function statusLabel(status) {
  return { pending: "未开始", doing: "进行中", done: "已实现" }[status] || status;
}

function weatherCodeLabel(code) {
  const labels = {
    0: "晴",
    1: "大部晴朗",
    2: "少云",
    3: "阴",
    45: "有雾",
    48: "雾凇",
    51: "小毛毛雨",
    53: "毛毛雨",
    55: "大毛毛雨",
    61: "小雨",
    63: "中雨",
    65: "大雨",
    71: "小雪",
    73: "中雪",
    75: "大雪",
    80: "阵雨",
    81: "强阵雨",
    82: "暴阵雨",
    95: "雷雨",
  };
  return labels[code] || "天气变化中";
}

function translateWeatherText(text) {
  const normalized = String(text || "").trim().toLowerCase();
  const labels = {
    sunny: "晴",
    clear: "晴",
    "partly cloudy": "少云",
    cloudy: "多云",
    overcast: "阴",
    mist: "薄雾",
    fog: "有雾",
    "patchy rain nearby": "附近有雨",
    "light rain": "小雨",
    "moderate rain": "中雨",
    "heavy rain": "大雨",
    "light drizzle": "小毛毛雨",
    "thundery outbreaks nearby": "附近有雷雨",
  };
  return labels[normalized] || text || "天气变化中";
}

function windDirection(degrees) {
  const directions = ["北风", "东北风", "东风", "东南风", "南风", "西南风", "西风", "西北风"];
  return directions[Math.round(degrees / 45) % 8];
}

async function fetchCityWeather(city) {
  try {
    const wttrUrl = `https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=zh`;
    const wttrResponse = await fetch(wttrUrl);
    if (!wttrResponse.ok) throw new Error("wttr 查询失败");
    const wttrData = await wttrResponse.json();
    const current = wttrData.current_condition?.[0];
    if (!current) throw new Error("wttr 没有当前天气");
    const condition = current.lang_zh?.[0]?.value || current.weatherDesc?.[0]?.value;
    return {
      condition: translateWeatherText(condition),
      temp: Number(current.temp_C),
      humidity: Number(current.humidity),
      wind: `${windDirection(Number(current.winddirDegree))} ${Number(current.windspeedKmph)} km/h`,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return fetchOpenMeteoWeather(city);
  }
}

async function fetchOpenMeteoWeather(city) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`;
  const geoResponse = await fetch(geoUrl);
  if (!geoResponse.ok) throw new Error("城市查询失败");
  const geoData = await geoResponse.json();
  const place = geoData.results?.[0];
  if (!place) throw new Error(`没有找到城市：${city}`);

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`;
  const weatherResponse = await fetch(weatherUrl);
  if (!weatherResponse.ok) throw new Error("天气查询失败");
  const weatherData = await weatherResponse.json();
  const current = weatherData.current;

  return {
    condition: weatherCodeLabel(current.weather_code),
    temp: Math.round(current.temperature_2m),
    humidity: Math.round(current.relative_humidity_2m),
    wind: `${windDirection(current.wind_direction_10m)} ${Math.round(current.wind_speed_10m)} km/h`,
    updatedAt: new Date().toISOString(),
  };
}

async function updateWeather(force = false) {
  const now = Date.now();
  const pairs = [
    ["weatherA", state.profile.cityA],
    ["weatherB", state.profile.cityB],
  ];
  const jobs = pairs.map(async ([key, city]) => {
    const lastUpdated = state.profile[key]?.updatedAt ? new Date(state.profile[key].updatedAt).getTime() : 0;
    if (!force && lastUpdated && now - lastUpdated < WEATHER_CACHE_MS) return false;
    state.profile[key] = await fetchCityWeather(city);
    return true;
  });

  try {
    const results = await Promise.all(jobs);
    if (results.some(Boolean)) {
      saveState();
      render();
    }
  } catch (error) {
    return error;
  }
}

function emptyState(text) {
  return `<div class="empty">${text}</div>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function formDataObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function readImage(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSide = 1400;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.onerror = () => {
        showToast("这张图片读取失败");
        resolve("");
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-view], [data-action]");
  if (!target) return;

  if (target.dataset.view) {
    switchView(target.dataset.view);
    return;
  }

  const action = target.dataset.action;
  if (action === "go-settings") switchView("settings");
  if (action === "go") switchView(target.dataset.target);
  if (action === "refresh-weather") updateWeather(true);
  if (action === "export-data") exportData();
  if (action === "restore-backup") restoreBackup();
  if (action === "filter-message") {
    messageFilter = target.dataset.filter;
    renderMessages();
  }
  if (action === "delete-message") removeItem("messages", target.dataset.id, "留言已删除");
  if (action === "delete-post") removeItem("posts", target.dataset.id, "日常已删除");
  if (action === "delete-wish") removeItem("wishes", target.dataset.id, "心愿已删除");
  if (action === "delete-memory") removeItem("memories", target.dataset.id, "回忆已删除");
});

document.addEventListener("change", (event) => {
  const target = event.target.closest('[data-action="update-wish"]');
  if (!target) return;
  const wish = state.wishes.find((item) => item.id === target.dataset.id);
  if (!wish) return;
  wish.status = target.value;
  wish.completedAt = target.value === "done" ? new Date().toISOString() : "";
  if (target.value === "done") {
    state.memories.unshift({
      id: crypto.randomUUID(),
      title: `实现心愿：${wish.title}`,
      content: wish.description || "这个心愿已经实现了。",
      memoryDate: new Date().toISOString().slice(0, 10),
      imageData: wish.imageData || "",
      createdAt: new Date().toISOString(),
    });
  }
  saveState();
  render();
  showToast("心愿状态已更新");
});

document.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  const data = formDataObject(form);

  if (form.id === "messageForm") {
    const imageData = await readImage(form.elements.image.files[0]);
    state.messages.unshift({
      id: crypto.randomUUID(),
      author: data.author,
      content: data.content.trim(),
      imageData,
      createdAt: new Date().toISOString(),
    });
    saveAndRefresh("留言已发布");
  }

  if (form.id === "postForm") {
    const imageData = await readImage(form.elements.image.files[0]);
    state.posts.unshift({
      id: crypto.randomUUID(),
      author: data.author,
      content: data.content.trim(),
      mood: data.mood,
      imageData,
      createdAt: new Date().toISOString(),
    });
    saveAndRefresh("日常已发布");
  }

  if (form.id === "wishForm") {
    const imageData = await readImage(form.elements.image.files[0]);
    state.wishes.unshift({
      id: crypto.randomUUID(),
      title: data.title.trim(),
      description: data.description.trim(),
      status: "pending",
      createdBy: data.createdBy,
      imageData,
      createdAt: new Date().toISOString(),
      completedAt: "",
    });
    saveAndRefresh("心愿已添加");
  }

  if (form.id === "memoryForm") {
    const imageData = await readImage(form.elements.image.files[0]);
    state.memories.unshift({
      id: crypto.randomUUID(),
      title: data.title.trim(),
      content: data.content.trim(),
      memoryDate: composeDate(data, "memoryDate"),
      imageData,
      createdAt: new Date().toISOString(),
    });
    saveAndRefresh("回忆已保存");
  }

  if (form.id === "settingsForm") {
    state.profile = {
      personA: data.personA.trim(),
      personB: data.personB.trim(),
      cityA: data.cityA.trim(),
      cityB: data.cityB.trim(),
      startDate: composeDate(data, "startDate"),
      nextMeetDate: composeDate(data, "nextMeetDate"),
      accessCode: data.accessCode.trim(),
      weatherA: state.profile.weatherA,
      weatherB: state.profile.weatherB,
    };
    saveAndRefresh("设置已保存");
    updateWeather(true);
  }
});

document.querySelector("#quickSettings").addEventListener("click", () => switchView("settings"));
document.querySelector("#unlockForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = event.target.elements.unlockCode;
  if (input.value === state.profile.accessCode) {
    sessionStorage.setItem(`${STORAGE_KEY}_unlocked`, "true");
    document.querySelector("#lockScreen").hidden = true;
    showToast("欢迎回来");
    return;
  }
  input.value = "";
  input.focus();
  showToast("密码不对");
});

function saveAndRefresh(message) {
  saveState();
  render();
  showToast(message);
}

function exportData() {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `双城记数据备份-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("数据备份已导出");
}

function restoreBackup() {
  const backup = localStorage.getItem(BACKUP_KEY);
  if (!backup) {
    showToast("没有找到升级前备份");
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, backup);
    state = loadState();
    normalizeLegacyState();
    render();
    showToast("已恢复升级前备份");
  } catch {
    showToast("备份恢复失败");
  }
}

function removeItem(collection, id, message) {
  state[collection] = state[collection].filter((item) => item.id !== id);
  saveAndRefresh(message);
}

function applyAccessGate() {
  const unlocked = sessionStorage.getItem(`${STORAGE_KEY}_unlocked`) === "true";
  document.querySelector("#lockScreen").hidden = unlocked;
  if (!unlocked) {
    setTimeout(() => document.querySelector("#unlockCode").focus(), 0);
  }
}

render();
applyAccessGate();
updateWeather(false);
