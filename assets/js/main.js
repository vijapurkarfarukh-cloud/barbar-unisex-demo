(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* Header: shadow / contrast once we leave the dark hero */
  const header = $("#header");
  const hero = $(".hero");
  const onScroll = () => {
    if (!header) return;
    const past = window.scrollY > 8;
    header.classList.toggle("scrolled", past);
    if (hero) {
      const heroBottom = hero.getBoundingClientRect().bottom;
      header.classList.toggle("on-light", heroBottom <= header.offsetHeight);
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Slide-in side menu */
  const menuBtn = $("#menuBtn");
  const sideMenu = $("#sideMenu");
  const overlay = $("#menuOverlay");
  const menuClose = $("#menuClose");
  const focusableSel = "a[href], button:not([disabled])";

  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    if (sideMenu) sideMenu.setAttribute("aria-hidden", String(!open));
    if (overlay) overlay.hidden = !open;
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    if (open && menuByKey && menuClose) menuClose.focus();
    else if (!open && menuByKey && menuBtn) menuBtn.focus();
    if (!open) menuByKey = false;
  }

  let menuByKey = false;
  if (menuBtn && sideMenu) {
    menuBtn.addEventListener("click", (e) => {
      menuByKey = e.detail === 0;
      setMenu(!document.body.classList.contains("menu-open"));
    });
    if (menuClose) menuClose.addEventListener("click", () => setMenu(false));
    if (overlay) overlay.addEventListener("click", () => setMenu(false));
    sideMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        setMenu(false);
        return;
      }
      if (e.key !== "Tab" || !document.body.classList.contains("menu-open")) return;
      const items = $$(focusableSel, sideMenu);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* Subtle scroll reveal */
  const revealEls = $$(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* Open / closed in Asia/Kolkata */
  function istParts() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    return {
      iso: `${get("year")}-${get("month")}-${get("day")}`,
      mins: Number(get("hour")) * 60 + Number(get("minute")),
    };
  }
  const chip = $("#openChip");
  function updateOpen() {
    if (!chip) return;
    const { mins } = istParts();
    const open = mins >= 8 * 60 + 30 && mins < 22 * 60;
    chip.classList.toggle("closed", !open);
    const label = chip.querySelector(".chip-text");
    if (label) {
      label.textContent = open
        ? "Open now · 8:30 AM – 10:00 PM IST"
        : "Closed now · Opens 8:30 AM IST";
    }
  }
  updateOpen();
  setInterval(updateOpen, 60000);

  /* Phone tabs */
  const tabButtons = $$("[data-tab]");
  const panels = {
    book: $("#tab-book"),
    queue: $("#tab-queue"),
    reminder: $("#tab-reminder"),
  };
  function showTab(name) {
    Object.keys(panels).forEach((key) => {
      if (!panels[key]) return;
      panels[key].hidden = key !== name;
    });
    tabButtons.forEach((btn) => {
      btn.setAttribute("aria-selected", String(btn.getAttribute("data-tab") === name));
    });
  }
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => showTab(btn.getAttribute("data-tab")));
  });
  $$("[data-open-tab]").forEach((btn) => {
    btn.addEventListener("click", () => showTab(btn.getAttribute("data-open-tab")));
  });

  /* Booking wizard — all front-end, nothing is sent */
  const SERVICES = [
    { id: "cut-m", name: "Haircut (men)", price: "₹249" },
    { id: "cut-w", name: "Haircut (women)", price: "₹449" },
    { id: "cut-k", name: "Haircut (kids)", price: "₹199" },
    { id: "beard", name: "Beard trim & shave", price: "₹149" },
    { id: "colour", name: "Hair colour", price: "₹799" },
    { id: "facial", name: "Facial / cleanup", price: "₹599" },
    { id: "makeup", name: "Makeup", price: "₹1,499" },
    { id: "nails", name: "Nail service", price: "₹399" },
  ];
  const STYLISTS = [
    { id: "any", name: "Any available stylist", note: "Sample option" },
    { id: "a", name: "Stylist A", note: "Sample name" },
    { id: "b", name: "Stylist B", note: "Sample name" },
    { id: "c", name: "Stylist C", note: "Sample name" },
  ];
  const TIMES = [
    "9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM",
    "3:00 PM", "4:30 PM", "6:00 PM", "7:30 PM", "9:00 PM",
  ];

  const state = { step: 1, service: null, stylist: null, date: "", slot: "" };
  const serviceList = $("#serviceList");
  const stylistList = $("#stylistList");
  const slotsEl = $("#slots");
  const dateInput = $("#dateInput");
  const stepEls = $$(".wizard-step");
  const stepBars = $$(".steps span");

  if (dateInput) {
    const today = istParts().iso;
    dateInput.min = today;
    dateInput.value = today;
    state.date = today;
    dateInput.addEventListener("change", () => {
      state.date = dateInput.value;
    });
  }

  function renderChoices(root, items, key, labelFn, rightFn) {
    if (!root) return;
    root.innerHTML = "";
    items.forEach((item) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "choice";
      b.setAttribute("aria-pressed", String(state[key] && state[key].id === item.id));
      b.innerHTML =
        "<span><b>" +
        labelFn(item) +
        "</b><small>" +
        (item.note || "Sample price") +
        "</small></span>" +
        (rightFn ? '<span class="price">' + rightFn(item) + "</span>" : "");
      b.addEventListener("click", () => {
        state[key] = item;
        renderChoices(root, items, key, labelFn, rightFn);
      });
      root.appendChild(b);
    });
  }
  renderChoices(serviceList, SERVICES, "service", (s) => s.name, (s) => s.price);
  renderChoices(stylistList, STYLISTS, "stylist", (s) => s.name, () => "");

  if (slotsEl) {
    TIMES.forEach((t) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "slot";
      b.textContent = t;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => {
        state.slot = t;
        $$(".slot", slotsEl).forEach((s) => s.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
      });
      slotsEl.appendChild(b);
    });
  }

  function goStep(n) {
    state.step = n;
    stepEls.forEach((el) => {
      el.hidden = Number(el.getAttribute("data-step")) !== n;
    });
    stepBars.forEach((bar, i) => bar.classList.toggle("on", i < n));
  }

  function flash(msg) {
    const p = $("#wizardHint");
    if (!p) return;
    p.textContent = msg || "Prices and stylists are samples.";
  }

  $("#toStylist") &&
    $("#toStylist").addEventListener("click", () => {
      if (!state.service) return flash("Please choose a service first.");
      flash("");
      goStep(2);
    });
  $("#backService") && $("#backService").addEventListener("click", () => goStep(1));
  $("#toSlot") &&
    $("#toSlot").addEventListener("click", () => {
      if (!state.stylist) return flash("Please choose a stylist first.");
      flash("");
      goStep(3);
    });
  $("#backStylist") && $("#backStylist").addEventListener("click", () => goStep(2));
  $("#toConfirm") &&
    $("#toConfirm").addEventListener("click", () => {
      if (!state.date || !state.slot) return flash("Please pick a date and a time.");
      flash("");
      const rows = {
        Service: state.service.name + " · " + state.service.price + " (sample)",
        Stylist: state.stylist.name + " (sample)",
        When: formatDate(state.date) + " · " + state.slot,
        Code: "DEMO-" + String(Math.floor(1000 + (state.slot.length * 37) % 9000)),
      };
      const box = $("#confirmRows");
      if (box) {
        box.innerHTML = Object.keys(rows)
          .map((k) => "<div><dt>" + k + "</dt><dd>" + rows[k] + "</dd></div>")
          .join("");
      }
      goStep(4);
    });
  $("#resetWizard") &&
    $("#resetWizard").addEventListener("click", () => {
      state.service = state.stylist = null;
      state.slot = "";
      state.date = istParts().iso;
      if (dateInput) dateInput.value = state.date;
      renderChoices(serviceList, SERVICES, "service", (s) => s.name, (s) => s.price);
      renderChoices(stylistList, STYLISTS, "stylist", (s) => s.name, () => "");
      $$(".slot", slotsEl).forEach((s) => s.setAttribute("aria-pressed", "false"));
      flash("");
      goStep(1);
    });
  $("#seeReminder") &&
    $("#seeReminder").addEventListener("click", () => showTab("reminder"));

  function formatDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  /* Live queue — fake, animated */
  const queueState = { serving: 14, you: 16 };

  function renderQueue() {
    const servingEl = $("#qServing");
    const youEl = $("#qYou");
    const aheadEl = $("#qAhead");
    const waitEl = $("#qWait");
    const list = $("#qList");
    if (!servingEl || !list) return;
    const ahead = Math.max(0, queueState.you - queueState.serving);
    servingEl.textContent = "#" + queueState.serving;
    youEl.textContent = "#" + queueState.you;
    if (aheadEl) aheadEl.textContent = ahead === 0 ? "You're next" : ahead + " ahead";
    if (waitEl) waitEl.textContent = ahead === 0 ? "A few minutes" : "About " + ahead * 18 + " min";
    const rows = [
      { n: queueState.serving, label: "Guest (sample)", svc: "Haircut", st: "Now serving", you: false },
      { n: queueState.serving + 1, label: "Guest (sample)", svc: "Beard trim", st: "Next", you: queueState.you === queueState.serving + 1 },
      { n: queueState.you, label: "You (demo)", svc: "Haircut", st: "Your place", you: true },
      { n: queueState.you + 1, label: "Guest (sample)", svc: "Hair colour", st: "Waiting", you: false },
    ].filter((r, i, arr) => arr.findIndex((x) => x.n === r.n) === i);
    list.innerHTML = rows
      .map(
        (r) =>
          '<div class="q-row' +
          (r.you ? " you" : "") +
          '"><span class="tok">#' +
          r.n +
          '</span><span class="who">' +
          r.label +
          " · " +
          r.svc +
          '</span><span class="st">' +
          r.st +
          "</span></div>"
      )
      .join("");
  }
  renderQueue();

  $("#qNext") &&
    $("#qNext").addEventListener("click", () => {
      if (queueState.serving < queueState.you) {
        queueState.serving += 1;
      } else {
        queueState.serving = 14;
        queueState.you = 16;
      }
      renderQueue();
    });
})();
