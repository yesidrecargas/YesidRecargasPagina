const CONFIG = {
  whatsapp: "573136895221",
  paquetes: [
    { diamantes: 110,  precio: 2900, popular: false },
    { diamantes: 341,  precio: 10500, popular: false },
    { diamantes: 572,  precio: 16500, popular: true },
    { diamantes: 1166, precio: 28900, popular: false },
    { diamantes: 2398, precio: 56900, popular: false },
    { diamantes: 6160, precio: 137500, popular: false },
    { diamantes: 1738, precio: 42000, precioViejo: 58200, ahorro: "28%", combo: true, popular: false },
    { diamantes: 913,  precio: 24900, precioViejo: 31600, ahorro: "21%", combo: true, popular: false },
    { diamantes: "Semanal", precio: 7900, imagen: "semanal.png" },
    { diamantes: "Mensual", precio: 35900, imagen: "mensual.png" }
  ]
};

const pruebasGaleria = [];

let idJugadorValidado = "";
let paqueteSeleccionado = null; 

function bloquearScroll() {
  document.documentElement.classList.add("modal-open");
  document.body.classList.add("modal-open");
}
function desbloquearScroll() {
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
}

const modalTerminos = document.getElementById("modalTerminos");
const modalGaleria = document.getElementById("modalGaleria");
const modalEventos = document.getElementById("modalEventos");
const modalPago = document.getElementById("modalPago");

function abrirModalTerminos(e) {
  e.preventDefault();
  modalTerminos.classList.add("active");
  bloquearScroll();
}
function cerrarModalTerminos() {
  modalTerminos.classList.remove("active");
  desbloquearScroll();
}
function abrirModalGaleria() {
  renderGaleria();
  modalGaleria.classList.add("active");
  bloquearScroll();
}
function cerrarModalGaleria() {
  modalGaleria.classList.remove("active");
  desbloquearScroll();
}
function abrirModalEventos() {
  modalEventos.classList.add("active");
  bloquearScroll();
}
function cerrarModalEventos() {
  modalEventos.classList.remove("active");
  desbloquearScroll();
}
function cerrarModalPago() {
  modalPago.classList.remove("active");
  desbloquearScroll();
}

window.addEventListener("click", (e) => {
  if (e.target === modalTerminos) cerrarModalTerminos();
  if (e.target === modalGaleria) cerrarModalGaleria();
  if (e.target === modalEventos) cerrarModalEventos();
  if (e.target === modalPago) cerrarModalPago();
  const selectorAsunto = document.getElementById("chatSubjectDropdown");
  const btnAsunto = document.getElementById("chatSubjectBtn");
  if (selectorAsunto.classList.contains("show") && !selectorAsunto.contains(e.target) && !btnAsunto.contains(e.target)) {
    selectorAsunto.classList.remove("show");
  }
});

function renderGaleria() {
  const container = document.getElementById("galleryGrid");
  if (!pruebasGaleria || pruebasGaleria.length === 0) {
    container.innerHTML = `
      <div class="gallery-empty">
        <span class="empty-icon">📸</span>
        <p style="font-weight:700; color:#fff; margin-bottom:5px;">Aún no hay pruebas publicadas</p>
        <p style="font-size:0.9rem;">Las capturas de clientes estarán disponibles muy pronto.</p>
      </div>
    `;
    return;
  }
  container.innerHTML = pruebasGaleria.map(p => `
    <div class="gallery-item">
      <img src="${p.imagen}" class="gallery-img" onerror="this.src='https://via.placeholder.com/200?text=Sin+Foto'">
      <div class="gallery-text">${p.texto}</div>
    </div>
  `).join('');
}

const chatWindow = document.getElementById("chatWindow");
const chatInput = document.getElementById("chatInput");
const chatBody = document.getElementById("chatBody");
const chatSubjectBtn = document.getElementById("chatSubjectBtn");
const chatSubjectDropdown = document.getElementById("chatSubjectDropdown");

let dudaCliente = ""; 
let asuntoCliente = ""; 

function toggleChat() {
  if (chatWindow.style.display === "flex") {
    chatWindow.style.display = "none";
  } else {
    chatWindow.style.display = "flex";
  }
}

function toggleSubjectDropdown(event) {
  event.stopPropagation();
  chatSubjectDropdown.classList.toggle("show");
  chatSubjectBtn.classList.remove("error");
}

function seleccionarAsunto(asunto) {
  asuntoCliente = asunto;
  chatSubjectBtn.innerHTML = `<span>ASUNTO: ${asunto.toUpperCase()}</span><span>▼</span>`;
  chatSubjectBtn.style.color = "#fff";
  chatSubjectBtn.style.borderColor = "var(--neon)";
  chatSubjectBtn.classList.remove("error");
  chatSubjectDropdown.classList.remove("show");
}

function handleChatEnter(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    enviarSoporte();
  }
}

function enviarSoporte() {
  const duda = chatInput.value.trim();
  if (!duda) return;

  if (!asuntoCliente) {
    chatSubjectBtn.classList.add("error");
    chatSubjectBtn.style.animation = "none";
    chatSubjectBtn.offsetHeight; 
    chatSubjectBtn.style.animation = "shake 0.3s";
    return;
  }

  dudaCliente = duda;
  chatInput.value = "";

  const msgUser = document.createElement("div");
  msgUser.className = "chat-msg user";
  msgUser.textContent = `[${asuntoCliente}] ${duda}`;
  chatBody.appendChild(msgUser);
  chatBody.scrollTop = chatBody.scrollHeight;

  setTimeout(() => {
    const msgBot = document.createElement("div");
    msgBot.className = "chat-msg bot";
    msgBot.innerHTML = `
      ¡Mensaje recibido! 📩<br>
      Para enviármelo a mi WhatsApp y responderte rápido, haz clic en el botón de abajo:<br>
      <button class="btn-chat-wa" onclick="irAWhatsAppSoporte()">
        <svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.2-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.5-.9-2.1-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
        Abrir WhatsApp
      </button>
    `;
    chatBody.appendChild(msgBot);
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 500);
}

function irAWhatsAppSoporte() {
  const mensaje = `*${asuntoCliente}*\n\n${dudaCliente}`;
  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
  chatWindow.style.display = "none";
}

function toggleThemeDropdown(event) {
  event.stopPropagation();
  document.getElementById("themeDropdown").classList.toggle("show");
}

function seleccionarTema(tema) {
  const currentTheme = document.body.className.replace('theme-', '') || 'purple';
  if (currentTheme === tema) {
    document.getElementById("themeDropdown").classList.remove("show");
    return;
  }
  const loader = document.getElementById("themeLoader");
  loader.classList.add("active");
  document.getElementById("themeDropdown").classList.remove("show");
  setTimeout(() => {
    document.body.className = ''; 
    if (tema !== 'purple') {
      document.body.classList.add(`theme-${tema}`);
    }
    document.querySelectorAll('.theme-option').forEach(opt => {
      opt.classList.remove('active');
      opt.querySelector('.check').style.display = 'none';
    });
    const opcionActiva = document.querySelector(`.theme-option[data-theme="${tema}"]`);
    opcionActiva.classList.add('active');
    opcionActiva.querySelector('.check').style.display = 'inline';
    localStorage.setItem("yr_theme", tema);
    loader.classList.remove("active");
  }, 800); 
}

const temaGuardado = localStorage.getItem("yr_theme");
if (temaGuardado) {
  document.body.className = temaGuardado !== 'purple' ? `theme-${temaGuardado}` : '';
  setTimeout(() => {
    document.querySelectorAll('.theme-option').forEach(opt => {
      opt.classList.remove('active');
      opt.querySelector('.check').style.display = 'none';
    });
    const opcionActiva = document.querySelector(`.theme-option[data-theme="${temaGuardado}"]`);
    if(opcionActiva) {
      opcionActiva.classList.add('active');
      opcionActiva.querySelector('.check').style.display = 'inline';
    }
  }, 100);
}

window.addEventListener("click", function(e) {
  const selector = document.getElementById("themeSelector");
  if (!selector.contains(e.target)) document.getElementById("themeDropdown").classList.remove("show");
});

const formatNumber = (n) => n.toLocaleString("es-CO");

const diamondSVG = `
  <svg class="diamond-cluster" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <polygon class="dmd-side" points="20,35 35,25 50,45 35,65"/>
    <polygon class="dmd-side-light" points="35,25 50,45 20,35"/>
    <polygon class="dmd-side" points="65,35 80,25 95,45 80,65"/>
    <polygon class="dmd-side-light" points="80,25 95,45 65,35"/>
    <polygon class="dmd-main" points="50,10 75,35 50,75 25,35"/>
    <polygon class="dmd-dark-facet" points="50,10 50,75 25,35"/>
    <polygon class="dmd-light-facet" points="50,10 75,35 50,35"/>
  </svg>
`;

function crearTarjeta(paquete, index) {
  const { diamantes, precio, precioViejo, ahorro, popular, combo, imagen, proximamente } = paquete;
  const clases = `price-card reveal ${popular ? "popular" : ""} ${combo ? "combo" : ""}`;
  
  let etiqueta = "";
  if (popular) etiqueta = '<span class="tag">MÁS VENDIDO</span>';
  else if (combo) etiqueta = '<span class="tag combo-tag">COMBO</span>';

  let precioHtml = "";
  if (precioViejo) precioHtml += `<span class="old-price">$${formatNumber(precioViejo)}</span>`;
  precioHtml += `<p class="price"><b>$${formatNumber(precio)}</b></p>`;

  let mediaHtml = "";
  if (imagen) {
    mediaHtml = `<div class="card-img-wrap"><img src="${imagen}" class="card-img" alt="${diamantes}"></div>`;
  } else {
    mediaHtml = diamondSVG;
  }

  let botonHtml = "";
  if (proximamente) {
    botonHtml = `<button class="btn btn-disabled" disabled>Próximamente</button>`;
  } else {
    const param = typeof diamantes === 'string' ? `'${diamantes}'` : diamantes;
    botonHtml = `<button class="btn btn-primary btn-comprar" onclick="comprarPaquete(${param}, ${precio})">Comprar</button>`;
  }

  return `
    <article class="${clases}" style="--delay:${index * 70}ms">
      ${etiqueta}
      ${mediaHtml}
      <div class="diamonds">${typeof diamantes === 'number' ? formatNumber(diamantes) : diamantes} <small>${typeof diamantes === 'number' ? '💎' : ''}</small></div>
      ${combo ? `<div class="save-badge">AHORRAS ${ahorro}</div>` : ""}
      <div class="price-container">
        ${precioHtml}
      </div>
      ${botonHtml}
    </article>
  `;
}

function renderPaquetes() {
  const grid = document.getElementById("priceGrid");
  if (grid) grid.innerHTML = CONFIG.paquetes.map(crearTarjeta).join("");
}

const inputId = document.getElementById("playerIdInput");
const btnVerificar = document.getElementById("btnVerificar");
const msgSuccess = document.getElementById("successMessage");
const msgError = document.getElementById("errorMessage");
const idContainer = document.getElementById("idContainer");

inputId.addEventListener("input", () => {
  if (idJugadorValidado !== "") {
    idJugadorValidado = "";
    msgSuccess.style.display = "none";
    btnVerificar.style.display = "block";
  }
  inputId.classList.remove("error");
  msgError.style.display = "none";
});

function verificarID() {
  const idValue = inputId.value.trim();
  if (idValue.length < 8 || idValue.length > 11) {
    inputId.classList.add("error");
    msgError.style.display = "flex";
    msgSuccess.style.display = "none";
    idJugadorValidado = "";
    return;
  }
  btnVerificar.innerHTML = '<span class="spinner"></span>';
  btnVerificar.disabled = true;
  inputId.classList.remove("error");
  msgError.style.display = "none";
  setTimeout(() => {
    idJugadorValidado = idValue; 
    msgSuccess.style.display = "flex"; 
    btnVerificar.innerHTML = 'Verificar ID';
    btnVerificar.disabled = false;
  }, 1000); 
}

function comprarPaquete(tituloOId, precio) {
  if (!idJugadorValidado) {
    idContainer.scrollIntoView({ behavior: "smooth", block: "center" });
    inputId.classList.add("error");
    msgError.style.display = "flex";
    inputId.focus();
    setTimeout(() => {
      if (!idJugadorValidado) {
        inputId.classList.remove("error");
        msgError.style.display = "none";
      }
    }, 3000);
    return;
  }
  paqueteSeleccionado = { diamantes: tituloOId, precio };
  document.getElementById("montoCopiar").textContent = `$${formatNumber(precio)}`;
  modalPago.classList.add("active");
  bloquearScroll();
}

function copiarMonto(btn) {
  const texto = document.getElementById("montoCopiar").textContent;
  const textoLimpio = texto.replace(/[$.]/g, ''); 
  navigator.clipboard.writeText(textoLimpio).then(() => {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '¡Copiado!';
    btn.style.background = 'var(--green-ok)';
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = 'var(--neon)';
    }, 2000);
  });
}

function finalizarCompra() {
  const now = new Date();
  const dia = String(now.getDate()).padStart(2, '0');
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  const anio = now.getFullYear();
  let horas = now.getHours();
  const minutos = String(now.getMinutes()).padStart(2, '0');
  const ampm = horas >= 12 ? 'p.m.' : 'a.m.';
  horas = horas % 12;
  horas = horas ? horas : 12;
  const horaFormateada = String(horas).padStart(2, '0');
  const fechaCompleta = `${dia}/${mes}/${anio} ${horaFormateada}:${minutos} ${ampm}`;
  const textoProducto = typeof paqueteSeleccionado.diamantes === 'number' 
    ? `${formatNumber(paqueteSeleccionado.diamantes)} Diamantes` 
    : `Tarjeta ${paqueteSeleccionado.diamantes}`;
  const mensaje = `Hola Yesid, Tengo un pedido:

*ID:* ${idJugadorValidado}
*Producto:* ${textoProducto}
*Precio Total:* $${formatNumber(paqueteSeleccionado.precio)} COP
*Fecha:* ${fechaCompleta}`;
  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
  cerrarModalPago();
}

function initHeaderScroll() {
  const header = document.getElementById("siteHeader");
  window.addEventListener("scroll", () => {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  }, { passive: true });
}

function initReveal() {
  const elementos = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    elementos.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  elementos.forEach((el) => observer.observe(el));
}

function initFaq() {
  const items = document.querySelectorAll(".faq details");
  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      items.forEach((otro) => { if (otro !== item) otro.open = false; });
    });
  });
}

function initYear() {
  document.getElementById("year").textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
  renderPaquetes();
  initHeaderScroll();
  initFaq();
  initYear();
});
