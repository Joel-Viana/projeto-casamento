/* =========================
   Configuração do casamento
   ========================= */
const WEDDING = {
  // Data do casamento (troque para a sua)
  dateISO: "2026-06-20T19:00:00-03:00", // formato ISO com timezone
  // LocalStorage keys (fixas)
  storageKeys: {
    rsvp: "wedding_rsvp",
    gifts: "wedding_gifts",
    theme: "wedding_theme",
  },
};

/* =========================
   Base de dados (mock)
   - Troque por seu JSON real
   ========================= */
const DATA = {
  convidados: [
    "Selecione seu nome", // placeholder (não usa como item real)
    "Ana Silva",
    "Bruno Oliveira",
    "Carlos Souza",
    "Daniela Lima",
    "Eduardo Santos",
    "Fernanda Rocha",
    "Gabriel Pereira",
    "Helena Costa",
  ],
  presentes: [
    { id: "p1", nome: "Jogo de toalhas", categoria: "casa", faixa: "R$ 80–150" },
    { id: "p2", nome: "Airfryer", categoria: "cozinha", faixa: "R$ 300–600" },
    { id: "p3", nome: "Jogo de panelas", categoria: "cozinha", faixa: "R$ 250–500" },
    { id: "p4", nome: "Lençol casal", categoria: "quarto", faixa: "R$ 90–200" },
    { id: "p5", nome: "Kit organização", categoria: "casa", faixa: "R$ 50–120" },
    { id: "p6", nome: "Aparelho de jantar", categoria: "cozinha", faixa: "R$ 200–500" },
  ],
};

/* =========================
   Helpers
   ========================= */
const $ = (sel) => document.querySelector(sel); // seleciona 1 elemento
const $$ = (sel) => Array.from(document.querySelectorAll(sel)); // seleciona lista

function formatDateBR(date) {
  // Formata data/hora pt-BR
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function now() {
  return new Date();
}

function safeJSONParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/* =========================
   Modal simples (A11y)
   ========================= */
const modal = {
  el: $("#modal"),
  text: $("#modalText"),
  ok: $("#modalOk"),
  open(message) {
    this.text.textContent = message; // define texto do modal
    this.el.setAttribute("aria-hidden", "false"); // mostra modal
    this.ok.focus(); // foco no botão OK (acessibilidade)
  },
  close() {
    this.el.setAttribute("aria-hidden", "true"); // esconde modal
  },
};

modal.ok.addEventListener("click", () => modal.close()); // fecha no OK
$("#modal").addEventListener("click", (e) => {
  if (e.target?.dataset?.close === "true") modal.close(); // fecha no overlay
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.el.getAttribute("aria-hidden") === "false") {
    modal.close(); // fecha com ESC
  }
});

/* =========================
   Countdown
   ========================= */
const weddingDate = new Date(WEDDING.dateISO); // data alvo

function updateWeddingDateText() {
  $("#weddingDateText").textContent = formatDateBR(weddingDate); // escreve a data no hero
}

function updateCountdown() {
  const diff = weddingDate.getTime() - now().getTime(); // diferença em ms

  if (diff <= 0) {
    $("#cdDays").textContent = "0";
    $("#cdHours").textContent = "0";
    $("#cdMin").textContent = "0";
    $("#cdSec").textContent = "0";
    return;
  }

  const totalSeconds = Math.floor(diff / 1000); // ms -> s
  const days = Math.floor(totalSeconds / 86400); // 86400 = s em 1 dia
  const hours = Math.floor((totalSeconds % 86400) / 3600); // resto do dia -> horas
  const minutes = Math.floor((totalSeconds % 3600) / 60); // resto da hora -> minutos
  const seconds = totalSeconds % 60; // resto -> segundos

  $("#cdDays").textContent = String(days);
  $("#cdHours").textContent = String(hours).padStart(2, "0");
  $("#cdMin").textContent = String(minutes).padStart(2, "0");
  $("#cdSec").textContent = String(seconds).padStart(2, "0");
}

/* =========================
   RSVP
   ========================= */
const rsvp = {
  nomeEl: $("#convidado"),
  buscaEl: $("#buscaConvidado"),
  savedEl: $("#rsvpSaved"),
  resNome: $("#resNome"),
  resStatus: $("#resStatus"),
  resData: $("#resData"),

  state: {
    nome: "",
    status: "",
    updatedAt: "",
  },

  load() {
    const raw = localStorage.getItem(WEDDING.storageKeys.rsvp); // lê do storage
    const data = safeJSONParse(raw, null); // parse seguro
    if (data?.nome) this.state = data; // carrega se válido
  },

  save() {
    localStorage.setItem(WEDDING.storageKeys.rsvp, JSON.stringify(this.state)); // salva
    this.renderSummary(); // atualiza painel
    this.savedEl.textContent = "Salvo ✅"; // feedback
    setTimeout(() => (this.savedEl.textContent = ""), 1500); // limpa feedback
  },

  renderSummary() {
    this.resNome.textContent = this.state.nome || "—";
    this.resStatus.textContent = this.state.status || "—";
    this.resData.textContent = this.state.updatedAt || "—";
  },

  setStatus(status) {
    if (!this.state.nome) {
      modal.open("Escolha seu nome antes de confirmar."); // validação
      return;
    }
    this.state.status = status; // define status
    this.state.updatedAt = formatDateBR(now()); // carimba data
    this.save(); // persiste
    modal.open(`Status atualizado: ${status}`); // feedback
  },
};

function populateGuests() {
  // Remove tudo e recria com base nos dados
  rsvp.nomeEl.innerHTML = `<option value="">Selecione seu nome</option>`; // placeholder
  DATA.convidados
    .filter((n) => n !== "Selecione seu nome")
    .forEach((nome) => {
      const opt = document.createElement("option"); // cria option
      opt.value = nome; // value
      opt.textContent = nome; // label
      rsvp.nomeEl.appendChild(opt); // adiciona no select
    });
}

function applyGuestFromState() {
  if (rsvp.state.nome) {
    rsvp.nomeEl.value = rsvp.state.nome; // seleciona automaticamente
  }
  rsvp.renderSummary(); // atualiza resumo
}

function filterGuestSelect(query) {
  // Busca simples: filtra options pelo texto
  const q = query.trim().toLowerCase(); // normaliza
  const options = Array.from(rsvp.nomeEl.options); // pega options

  options.forEach((opt) => {
    if (opt.value === "") return; // não mexe no placeholder
    const visible = opt.textContent.toLowerCase().includes(q); // contém?
    opt.hidden = !visible; // esconde/mostra
  });
}

/* Botões RSVP */
$("#btnSim").addEventListener("click", () => rsvp.setStatus("Vou ✅"));
$("#btnTalvez").addEventListener("click", () => rsvp.setStatus("Talvez 🤔"));
$("#btnNao").addEventListener("click", () => rsvp.setStatus("Não vou ❌"));

/* Select + busca */
rsvp.nomeEl.addEventListener("change", () => {
  rsvp.state.nome = rsvp.nomeEl.value; // define nome
  if (!rsvp.state.updatedAt) rsvp.state.updatedAt = formatDateBR(now()); // primeira data
  rsvp.save(); // salva
});

rsvp.buscaEl.addEventListener("input", () => {
  filterGuestSelect(rsvp.buscaEl.value); // filtra options
});

/* Panel ações */
$("#btnEditar").addEventListener("click", () => {
  // foco no select para facilitar
  rsvp.nomeEl.focus();
});

$("#btnLimpar").addEventListener("click", () => {
  rsvp.state = { nome: "", status: "", updatedAt: "" }; // zera estado
  localStorage.removeItem(WEDDING.storageKeys.rsvp); // remove storage
  rsvp.nomeEl.value = ""; // limpa select
  rsvp.buscaEl.value = ""; // limpa busca
  filterGuestSelect(""); // mostra tudo
  rsvp.renderSummary(); // atualiza
  modal.open("Dados de confirmação limpos.");
});

/* Abrir RSVP via botão da topbar */
$("#btnAbrirRSVP").addEventListener("click", () => {
  document.querySelector("#rsvp")?.scrollIntoView({ behavior: "smooth" }); // rola até RSVP
});

/* =========================
   Gifts (presentes)
   ========================= */
const gifts = {
  grid: $("#giftGrid"),
  search: $("#giftSearch"),
  filter: $("#giftFilter"),

  picked: new Set(), // ids marcados

  load() {
    const raw = localStorage.getItem(WEDDING.storageKeys.gifts); // storage
    const arr = safeJSONParse(raw, []); // parse
    this.picked = new Set(arr); // reidrata
  },

  save() {
    localStorage.setItem(WEDDING.storageKeys.gifts, JSON.stringify([...this.picked])); // persiste
  },

  toggle(id) {
    if (this.picked.has(id)) this.picked.delete(id);
    else this.picked.add(id);
    this.save();
    this.render();
  },

  getFiltered() {
    const q = this.search.value.trim().toLowerCase();
    const cat = this.filter.value;

    return DATA.presentes.filter((p) => {
      const matchText = p.nome.toLowerCase().includes(q);
      const matchCat = cat === "all" ? true : p.categoria === cat;
      return matchText && matchCat;
    });
  },

  render() {
    const list = this.getFiltered(); // filtra
    this.grid.innerHTML = ""; // limpa

    if (list.length === 0) {
      this.grid.innerHTML = `<p style="color: rgba(241,236,234,0.75)">Nada encontrado.</p>`;
      return;
    }

    list.forEach((p) => {
      const card = document.createElement("article"); // card
      card.className = "gift"; // classe

      const picked = this.picked.has(p.id); // marcado?
      const badge = picked ? `<span class="badge">Marcado ✅</span>` : `<span class="badge">Disponível</span>`;

      card.innerHTML = `
        <h3 class="gift__title">${p.nome}</h3>
        <p class="gift__meta">${badge} • Categoria: <strong>${p.categoria}</strong></p>
        <p class="gift__meta">Faixa: <strong>${p.faixa}</strong></p>
        <div class="gift__actions">
          <button class="btn btn--secondary" type="button" data-pick="${p.id}">
            ${picked ? "Desmarcar" : "Vou comprar"}
          </button>
        </div>
      `;

      this.grid.appendChild(card); // adiciona
    });

    // Delegate click (um listener, vários botões)
    this.grid.querySelectorAll("[data-pick]").forEach((btn) => {
      btn.addEventListener("click", () => this.toggle(btn.dataset.pick));
    });
  },
};

$("#btnResetGifts").addEventListener("click", () => {
  gifts.picked.clear(); // limpa set
  localStorage.removeItem(WEDDING.storageKeys.gifts); // limpa storage
  gifts.render(); // atualiza
  modal.open("Presentes resetados.");
});

gifts.search.addEventListener("input", () => gifts.render());
gifts.filter.addEventListener("change", () => gifts.render());

/* Copiar PIX */
$("#btnCopyPix").addEventListener("click", async () => {
  const key = $("#pixKey").textContent.trim(); // pega chave
  try {
    await navigator.clipboard.writeText(key); // copia
    modal.open("PIX copiado ✅");
  } catch {
    modal.open("Não consegui copiar automaticamente. Selecione e copie manualmente.");
  }
});

/* =========================
   Tema (dark/auto simples)
   ========================= */
function applyTheme(theme) {
  // theme: "dark" | "light"
  document.documentElement.dataset.theme = theme; // data-attribute
  localStorage.setItem(WEDDING.storageKeys.theme, theme); // salva
  $("#btnTheme").textContent = theme === "dark" ? "🌙" : "☀️"; // ícone
}

function initTheme() {
  const saved = localStorage.getItem(WEDDING.storageKeys.theme); // lê
  if (saved === "light" || saved === "dark") applyTheme(saved);
  else applyTheme("dark"); // default
}

$("#btnTheme").addEventListener("click", () => {
  const current = document.documentElement.dataset.theme || "dark";
  applyTheme(current === "dark" ? "light" : "dark");
});

/* =========================
   Scrollspy simples (marca link ativo)
   ========================= */
function initScrollSpy() {
  const links = $$(".nav__link"); // links
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const obs = new IntersectionObserver(
    (entries) => {
      const visible = entries.find((e) => e.isIntersecting);
      if (!visible) return;

      links.forEach((a) => a.classList.remove("is-active"));
      const id = `#${visible.target.id}`;
      const active = links.find((a) => a.getAttribute("href") === id);
      active?.classList.add("is-active");
    },
    { root: null, threshold: 0.45 }
  );

  sections.forEach((sec) => obs.observe(sec));
}

/* =========================
   Boot
   ========================= */
function init() {
  updateWeddingDateText(); // escreve data no hero
  updateCountdown(); // primeira atualização
  setInterval(updateCountdown, 1000); // atualiza todo segundo

  initTheme(); // tema
  initScrollSpy(); // seção ativa

  populateGuests(); // convidados
  rsvp.load(); // carrega rsvp
  applyGuestFromState(); // aplica no UI

  gifts.load(); // carrega gifts
  gifts.render(); // render gifts
}

init();
