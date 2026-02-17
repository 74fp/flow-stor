let state = {
  lang: "ar",
  filter: "all",
  subFilter: "all",
  data: null,
  selectedOptionById: {}
};

const els = {
  grid: document.getElementById("grid"),
  langBtn: document.getElementById("langBtn"),
  heroTitle: document.getElementById("heroTitle"),
  heroDesc: document.getElementById("heroDesc"),

  filterAll: document.getElementById("filterAll"),
  filterSubs: document.getElementById("filterSubs"),
  filterNet: document.getElementById("filterNet"),
  filterPlus: document.getElementById("filterPlus"),
  filterDiscord: document.getElementById("filterDiscord"),
  filterGames: document.getElementById("filterGames"),

  subFilters: document.getElementById("subFilters"),

  waTop: document.getElementById("waTop"),
  waBottom: document.getElementById("waBottom"),
  copyLink: document.getElementById("copyLink"),

  footerTitle: document.getElementById("footerTitle"),
  footerText: document.getElementById("footerText"),
  fineprint: document.getElementById("fineprint"),

  modal: document.getElementById("detailsModal"),
  modalClose: document.getElementById("modalClose"),
  modalImg: document.getElementById("modalImg"),
  modalTitle: document.getElementById("modalTitle"),
  modalPrice: document.getElementById("modalPrice"),
  modalAlert: document.getElementById("modalAlert"),
  modalDesc: document.getElementById("modalDesc"),
  modalBuy: document.getElementById("modalBuy"),
  modalCopy: document.getElementById("modalCopy"),

  modalOptions: document.getElementById("modalOptions"),
  optTitle: document.getElementById("optTitle"),
  optList: document.getElementById("optList"),

  modalFields: document.getElementById("modalFields"),
  fieldsTitle: document.getElementById("fieldsTitle"),
  fieldGrid: document.getElementById("fieldGrid")
};

function genOrderId() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `FL-${y}${m}${day}-${rand}`;
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDescToHtml(text) {
  if (!text) return "";
  const safe = escapeHtml(text);
  const lines = safe.split("\n").map(l => l.trim());

  return lines.map(line => {
    if (!line) return `<div class="divider"></div>`;
    if (line === "—" || line === "——" || line === "———") return `<div class="divider"></div>`;
    if (line.startsWith("•")) return `<div class="bullet">${line}</div>`;
    if (/^\d+[\)\.]/.test(line)) return `<div class="num">${line}</div>`;
    return `<div>${line}</div>`;
  }).join("");
}

function isSoldOut(item) {
  return !!item.soldOut;
}

function minOptionPrice(item) {
  const opts = Array.isArray(item.options) ? item.options : [];
  const prices = opts
    .filter(o => !o.soldOut)
    .map(o => Number(o.price))
    .filter(n => Number.isFinite(n) && n > 0);

  if (prices.length) return Math.min(...prices);
  return Number(item.price || 0);
}

function waLinkFor(serviceTitle, detailsText, orderId) {
  const num = (state.data?.brand?.whatsappNumber || "").replace(/\D/g, "");
  const base = `https://wa.me/${num}`;

  const msg =
    state.lang === "ar"
      ? (state.data?.brand?.defaultMessageAr || "السلام عليكم، أبغى أطلب من Flow:")
      : (state.data?.brand?.defaultMessageEn || "Hi, I want to order from Flow:");

  const idLine = state.lang === "ar" ? `\nرقم الطلب: ${orderId}` : `\nOrder ID: ${orderId}`;

  const body = `${msg}\n${serviceTitle}${idLine}${detailsText ? `\n\n${detailsText}` : ""}`;
  return `${base}?text=${encodeURIComponent(body)}`;
}

function subcatLabel(sub, lang) {
  const mapAr = {
    streaming: "منصات المشاهدة",
    ai: "اشتراكات AI",
    online: "ألعاب أونلاين",
    offline: "ألعاب أوفلاين",
    skins: "سكنات وحزم"
  };
  const mapEn = {
    streaming: "Streaming",
    ai: "AI",
    online: "Online Games",
    offline: "Offline Games",
    skins: "Skins & Bundles"
  };
  return lang === "ar" ? (mapAr[sub] || sub) : (mapEn[sub] || sub);
}

function setDirAndLang() {
  const html = document.documentElement;

  if (state.lang === "ar") {
    html.lang = "ar";
    html.dir = "rtl";
    els.langBtn.textContent = "English";

    els.waTop.textContent = "واتساب";
    els.waBottom.textContent = "فتح واتساب";
    els.copyLink.textContent = "نسخ رابط الموقع";

    els.heroTitle.textContent = "خدمات Flow";
    els.heroDesc.textContent = "اختر القسم، ثم اختر الخدمة واطلب مباشرة من واتساب.";

    els.filterAll.textContent = "الكل";
    els.filterSubs.textContent = "اشتراكات";
    els.filterNet.textContent = "شرائح نت";
    els.filterPlus.textContent = "تطبيقات بلس";
    els.filterDiscord.textContent = "ديسكورد";
    els.filterGames.textContent = "الألعاب";

    els.footerTitle.textContent = "التواصل";
    els.footerText.textContent = "اضغط “اطلب الآن” داخل أي خدمة — أو تواصل مباشرة.";

    els.modalBuy.textContent = "الشراء الآن ⚡";
    els.modalCopy.textContent = "نسخ رابط المنتج";
    els.modalAlert.textContent = "مهم جداً قراءة التفاصيل قبل الشراء";
  } else {
    html.lang = "en";
    html.dir = "ltr";
    els.langBtn.textContent = "العربية";

    els.waTop.textContent = "WhatsApp";
    els.waBottom.textContent = "Open WhatsApp";
    els.copyLink.textContent = "Copy site link";

    els.heroTitle.textContent = "Flow Services";
    els.heroDesc.textContent = "Choose a category, pick a service, and order via WhatsApp.";

    els.filterAll.textContent = "All";
    els.filterSubs.textContent = "Subscriptions";
    els.filterNet.textContent = "SIM Data";
    els.filterPlus.textContent = "Plus Apps";
    els.filterDiscord.textContent = "Discord";
    els.filterGames.textContent = "Games";

    els.footerTitle.textContent = "Contact";
    els.footerText.textContent = "Tap “Order now” on any service — or message directly.";

    els.modalBuy.textContent = "Buy now ⚡";
    els.modalCopy.textContent = "Copy product link";
    els.modalAlert.textContent = "Please read details before purchase";
  }

  if (els.fineprint && state.data?.brand) {
    els.fineprint.textContent =
      state.lang === "ar"
        ? (state.data.brand.fineprintAr || "")
        : (state.data.brand.fineprintEn || "");
  }
}

function buildSubFilters() {
  if (!els.subFilters) return;

  if (state.filter === "all") {
    els.subFilters.classList.add("hidden");
    els.subFilters.innerHTML = "";
    state.subFilter = "all";
    return;
  }

  const subs = new Set();
  (state.data?.services || [])
    .filter(s => s.category === state.filter)
    .forEach(s => { if (s.subcategory) subs.add(s.subcategory); });

  const list = Array.from(subs);
  if (!list.length) {
    els.subFilters.classList.add("hidden");
    els.subFilters.innerHTML = "";
    state.subFilter = "all";
    return;
  }

  els.subFilters.classList.remove("hidden");

  const allLabel = state.lang === "ar" ? "الكل" : "All";
  const chips = [
    `<button class="chip ${state.subFilter === "all" ? "active" : ""}" data-sub="all" type="button">${allLabel}</button>`,
    ...list.map(sub => {
      const label = subcatLabel(sub, state.lang);
      const active = state.subFilter === sub ? "active" : "";
      return `<button class="chip ${active}" data-sub="${escapeHtml(sub)}" type="button">${escapeHtml(label)}</button>`;
    })
  ];

  els.subFilters.innerHTML = chips.join("");

  els.subFilters.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      els.subFilters.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      state.subFilter = chip.dataset.sub || "all";
      render();
    });
  });
}

function openModal(item) {
  const title = state.lang === "ar" ? item.titleAr : item.titleEn;
  const desc = state.lang === "ar" ? item.descAr : item.descEn;
  const cur = state.lang === "ar" ? (item.currencyAr || "") : (item.currencyEn || "");

  els.modalTitle.textContent = title;

  const imgUrl = item.image || "";
  els.modalImg.src = imgUrl;
  els.modalImg.alt = title;
  els.modalImg.style.display = imgUrl ? "block" : "none";

  els.modalAlert.textContent =
    state.lang === "ar" ? "مهم جداً قراءة التفاصيل قبل الشراء" : "Please read details before purchase";

  // ✅ نخفي حقول التفعيل دائماً
  els.modalFields.classList.add("hidden");
  els.fieldGrid.innerHTML = "";
  els.fieldsTitle.textContent = "";

  const itemSoldOut = isSoldOut(item);
  const hasOptions = Array.isArray(item.options) && item.options.length > 0;
  const orderId = genOrderId();

  if (hasOptions) {
    els.modalOptions.classList.remove("hidden");
    els.optTitle.textContent = state.lang === "ar"
      ? (item.optionsTitleAr || "اختر خيار:")
      : (item.optionsTitleEn || "Choose an option:");

    const firstAvailable = item.options.find(o => !o.soldOut) || item.options[0];
    const savedKey = state.selectedOptionById[item.id] || firstAvailable.key;

    els.optList.innerHTML = item.options.map(opt => {
      const label = state.lang === "ar" ? opt.labelAr : opt.labelEn;
      const price = Number(opt.price || 0);
      const checked = opt.key === savedKey ? "checked" : "";
      const disabled = opt.soldOut ? "disabled" : "";
      const opacity = opt.soldOut ? "style='opacity:.55;cursor:not-allowed'" : "";
      return `
        <label class="optItem" ${opacity}>
          <div class="optLabel">
            <input type="radio" name="opt_${escapeHtml(item.id)}" value="${escapeHtml(opt.key)}" ${checked} ${disabled}>
            <span>${escapeHtml(label)}</span>
          </div>
          <div class="optPrice">${price} ${escapeHtml(cur)}</div>
        </label>
      `;
    }).join("");

    const apply = () => {
      const picked = els.optList.querySelector(`input[name="opt_${item.id}"]:checked`);
      let pickedKey = picked ? picked.value : firstAvailable.key;

      const pickedOpt = item.options.find(o => o.key === pickedKey) || firstAvailable;
      const finalOpt = pickedOpt.soldOut ? firstAvailable : pickedOpt;

      state.selectedOptionById[item.id] = finalOpt.key;

      const optPrice = Number(finalOpt.price || 0);
      els.modalPrice.textContent = optPrice > 0 ? `${optPrice} ${cur}` : "";

      const optLabel = state.lang === "ar" ? finalOpt.labelAr : finalOpt.labelEn;

      const detailsText = state.lang === "ar"
        ? `تفاصيل الطلب:\n- الخدمة: ${title}\n- الخيار: ${optLabel}\n- السعر: ${optPrice} ${cur}`
        : `Order details:\n- Service: ${title}\n- Option: ${optLabel}\n- Price: ${optPrice} ${cur}`;

      if (itemSoldOut) {
        els.modalBuy.textContent = state.lang === "ar" ? "نفذت الكمية" : "Sold out";
        els.modalBuy.href = "#";
        els.modalBuy.setAttribute("aria-disabled", "true");
        els.modalBuy.style.pointerEvents = "none";
        els.modalBuy.style.opacity = "0.6";
      } else {
        els.modalBuy.textContent = state.lang === "ar" ? "الشراء الآن ⚡" : "Buy now ⚡";
        els.modalBuy.href = waLinkFor(title, detailsText, orderId);
        els.modalBuy.style.pointerEvents = "auto";
        els.modalBuy.style.opacity = "1";
        els.modalBuy.removeAttribute("aria-disabled");
      }
    };

    apply();
    els.optList.querySelectorAll("input[type='radio']").forEach(r => r.addEventListener("change", apply));
  } else {
    els.modalOptions.classList.add("hidden");
    els.optList.innerHTML = "";

    const price = Number(item.price || 0);
    els.modalPrice.textContent = price > 0 ? `${price} ${cur}` : "";

    const detailsText = state.lang === "ar"
      ? `تفاصيل الطلب:\n- الخدمة: ${title}${price > 0 ? `\n- السعر: ${price} ${cur}` : ""}`
      : `Order details:\n- Service: ${title}${price > 0 ? `\n- Price: ${price} ${cur}` : ""}`;

    if (itemSoldOut) {
      els.modalBuy.textContent = state.lang === "ar" ? "نفذت الكمية" : "Sold out";
      els.modalBuy.href = "#";
      els.modalBuy.setAttribute("aria-disabled", "true");
      els.modalBuy.style.pointerEvents = "none";
      els.modalBuy.style.opacity = "0.6";
    } else {
      els.modalBuy.textContent = state.lang === "ar" ? "الشراء الآن ⚡" : "Buy now ⚡";
      els.modalBuy.href = waLinkFor(title, detailsText, orderId);
      els.modalBuy.style.pointerEvents = "auto";
      els.modalBuy.style.opacity = "1";
      els.modalBuy.removeAttribute("aria-disabled");
    }
  }

  els.modalDesc.innerHTML = formatDescToHtml(desc);

  els.modal.classList.remove("hidden");
  els.modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  els.modal.classList.add("hidden");
  els.modal.setAttribute("aria-hidden", "true");
}

function render() {
  if (!state.data) return;

  const genericTitle = state.lang === "ar" ? "استفسار عام" : "General inquiry";
  const genericDetails = state.lang === "ar"
    ? `تفاصيل الطلب:\n- ${genericTitle}`
    : `Order details:\n- ${genericTitle}`;

  const genericLink = waLinkFor(genericTitle, genericDetails, genOrderId());
  els.waTop.href = genericLink;
  els.waBottom.href = genericLink;

  let services = (state.data.services || []);

  if (state.filter !== "all") {
    services = services.filter(s => s.category === state.filter);
  }

  if (state.filter !== "all" && state.subFilter !== "all") {
    services = services.filter(s => (s.subcategory || "") === state.subFilter);
  }

  buildSubFilters();

  els.grid.innerHTML = services.map(s => {
    const title = state.lang === "ar" ? s.titleAr : s.titleEn;
    const tag = state.lang === "ar" ? (s.tagAr || "") : (s.tagEn || "");
    const cur = state.lang === "ar" ? (s.currencyAr || "") : (s.currencyEn || "");

    const itemSoldOut = isSoldOut(s);
    const basePrice = minOptionPrice(s);

    const showPrice = basePrice > 0 ? `${basePrice} ${cur}` : "";

    const orderId = genOrderId();

    const orderBtn = itemSoldOut
      ? `<a class="btn primary" href="#" style="pointer-events:none;opacity:.6">${state.lang === "ar" ? "نفذت الكمية" : "Sold out"}</a>`
      : `<a class="btn primary" href="${waLinkFor(
          title,
          state.lang === "ar"
            ? `تفاصيل الطلب:\n- الخدمة: ${title}${basePrice > 0 ? `\n- السعر: ${basePrice} ${cur}` : ""}`
            : `Order details:\n- Service: ${title}${basePrice > 0 ? `\n- Price: ${basePrice} ${cur}` : ""}`,
          orderId
        )}" target="_blank" rel="noopener">
          ${state.lang === "ar" ? "اطلب الآن" : "Order now"}
        </a>`;

    return `
      <article class="card">
        <div class="thumb">
          <img src="${escapeHtml(s.image || "")}" alt="${escapeHtml(title)}" loading="lazy"
               onerror="this.style.display='none'">
        </div>

        <div class="cardBody">
          <div class="titleRow">
            <h3 class="cardTitle">${escapeHtml(title)}</h3>
            <span class="badge">${escapeHtml(tag)}</span>
          </div>

          <div class="alertBar">
            ${state.lang === "ar" ? "مهم جداً قراءة التفاصيل قبل الشراء" : "Please read details before purchase"}
          </div>

          <div class="priceRow">
            <div class="price">${escapeHtml(showPrice)}</div>
          </div>

          <div class="cardActions">
            <button class="btn ghost detailsBtn" type="button" data-id="${escapeHtml(s.id)}">
              ${state.lang === "ar" ? "التفاصيل" : "Details"}
            </button>
            ${orderBtn}
          </div>
        </div>
      </article>
    `;
  }).join("");

  els.grid.querySelectorAll(".detailsBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const item = (state.data.services || []).find(x => String(x.id) === String(id));
      if (item) openModal(item);
    });
  });
}

async function loadData() {
  try {
    const res = await fetch("./data.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`data.json not found (HTTP ${res.status})`);
    state.data = await res.json();

    setDirAndLang();
    buildSubFilters();
    render();
  } catch (err) {
    console.error(err);
    els.grid.innerHTML = `
      <div style="padding:16px;border:1px solid rgba(255,255,255,.15);border-radius:14px;background:rgba(255,255,255,.03)">
        <b>الموقع شغال لكن data.json مو متقروء.</b><br>
        تأكد ان اسم الملف <code>data.json</code> بنفس مجلد <code>index.html</code> وانه يبدأ بـ { بدون كلمة data.<br>
        افتح Console وشوف الخطأ.
      </div>
    `;
  }
}

function setupFilters() {
  document.querySelectorAll("#mainFilters .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#mainFilters .chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      state.filter = chip.dataset.filter || "all";
      state.subFilter = "all";
      render();
    });
  });
}

function setupLangToggle() {
  els.langBtn.addEventListener("click", () => {
    state.lang = state.lang === "ar" ? "en" : "ar";
    setDirAndLang();
    buildSubFilters();
    render();
  });
}

function setupCopyLink() {
  els.copyLink.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      els.copyLink.textContent = state.lang === "ar" ? "تم النسخ ✅" : "Copied ✅";
      setTimeout(() => {
        els.copyLink.textContent = state.lang === "ar" ? "نسخ رابط الموقع" : "Copy site link";
      }, 1200);
    } catch {
      alert(state.lang === "ar" ? "النسخ غير متاح في هذا المتصفح." : "Copy not available.");
    }
  });
}

els.modalClose.addEventListener("click", closeModal);
els.modal.addEventListener("click", (e) => {
  if (e.target.classList.contains("modalBackdrop")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !els.modal.classList.contains("hidden")) closeModal();
});

els.modalCopy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    els.modalCopy.textContent = state.lang === "ar" ? "تم النسخ ✅" : "Copied ✅";
    setTimeout(() => {
      els.modalCopy.textContent = state.lang === "ar" ? "نسخ رابط المنتج" : "Copy product link";
    }, 1200);
  } catch {
    alert(state.lang === "ar" ? "النسخ غير متاح في هذا المتصفح." : "Copy not available.");
  }
});

window.addEventListener("DOMContentLoaded", () => {
  setupFilters();
  setupLangToggle();
  setupCopyLink();
  loadData();
});
