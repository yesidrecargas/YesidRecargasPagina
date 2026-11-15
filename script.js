const CONFIG = {
  whatsapp: "573136895221",
  paquetes: [
    { diamantes: 110,  precio: 3200, popular: false },
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

let idJugadorValidado = "";
let paqueteSeleccionado = null; 
let timeoutConfirmar; 
let isOnlineNow = false; // Variable global para saber si estamos en horario

// ==========================================
// FUNCIÓN AUTOMÁTICA DE ESTADO (EN LÍNEA/OFFLINE)
// ==========================================
function actualizarEstadoYesid() {
  const horaColombia = new Date().toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    hour: 'numeric',
    hour12: false
  });
  
  const hora = parseInt(horaColombia, 10); 
  
  // 🕒 HORARIO CONFIGURADO: 10:00 AM a 10:00 PM
  const horaInicio = 10;  
  const horaFin = 22;     
  
  const statusText = document.getElementById("statusText");
  const statusDot = document.getElementById("statusDot");
  const statusIndicator = document.getElementById("statusIndicator");
  
  const floatingBadge = document.getElementById("floatingBadge");
  const floatingDot = document.getElementById("floatingDot");
  const floatingText = document.getElementById("floatingText");
  
  const chatConnStatus = document.getElementById("chatConnStatus");
  const chatConnText = document.getElementById("chatConnText");
  
  if (hora >= horaInicio && hora < horaFin) {
    isOnlineNow = true; // Guardamos que SÍ estamos online

    if(statusText) statusText.textContent = "Yesid esta Online - Puedes Recargar";
    if(statusIndicator) statusIndicator.classList.remove("offline-indicator");
    if(statusDot) statusDot.classList.remove("offline-dot");

    if(floatingText) floatingText.textContent = "Online";
    if(floatingBadge) floatingBadge.classList.remove("offline-badge");
    if(floatingDot) floatingDot.classList.remove("offline-dot");

    if(chatConnText) chatConnText.textContent = "Conectado👍";
    if(chatConnStatus) chatConnStatus.classList.remove("offline-chat-conn");

  } else {
    isOnlineNow = false; // Guardamos que estamos OFFLINE

    if(statusText) statusText.textContent = "Yesid esta offline - Intenta despues de 10:00 a.m";
    if(statusIndicator) statusIndicator.classList.add("offline-indicator");
    if(statusDot) statusDot.classList.add("offline-dot");

    if(floatingText) floatingText.textContent = "Offline";
    if(floatingBadge) floatingBadge.classList.add("offline-badge");
    if(floatingDot) floatingDot.classList.add("offline-dot");

    if(chatConnText) chatConnText.textContent = "Desconectado😴";
    if(chatConnStatus) chatConnStatus.classList.add("offline-chat-conn");
  }
}

setInterval(actualizarEstadoYesid, 60000);

// ==========================================
// FUNCIONES DE LA PÁGINA
// ==========================================

function bloquearScroll() {
  document.documentElement.classList.add("modal-open");
  
  document.body.classList.add("modal-open");
}
function desbloquearScroll() {
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
}

const modalTerminos = document.getElementById("modalTerminos");
const modalPago = document.getElementById("modalPago");
const modalAdvertenciaID = document.getElementById("modalAdvertenciaID");

function abrirModalTerminos(e) {
  e.preventDefault();
  modalTerminos.classList.add("active");
  bloquearScroll();
}
function cerrarModalTerminos() {
  modalTerminos.classList.remove("active");
  desbloquearScroll();
}
function cerrarModalPago() {
  modalPago.classList.remove("active");
  desbloquearScroll();
}

window.addEventListener("click", (e) => {
  if (e.target === modalTerminos) cerrarModalTerminos();
  if (e.target === modalPago) cerrarModalPago();
  if (e.target === modalAdvertenciaID) cerrarModalAdvertenciaID();
  
  const selectorAsunto = document.getElementById("chatSubjectDropdown");
  const btnAsunto = document.getElementById("chatSubjectBtn");
  if (selectorAsunto && selectorAsunto.classList.contains("show") && !selectorAsunto.contains(e.target) && !btnAsunto.contains(e.target)) {
    selectorAsunto.classList.remove("show");
  }
});

const chatWindow = document.getElementById("chatWindow");
const chatInput = document.getElementById("chatInput");
const chatBody = document.getElementById("chatBody");
const chatSubjectBtn = document.getElementById("chatSubjectBtn");
const chatSubjectDropdown = document.getElementById("chatSubjectDropdown");

let dudaCliente = ""; 
let asuntoCliente = ""; 

function toggleChat() {
  if (chatWindow.classList.contains("active")) {
    chatWindow.classList.remove("active");
    document.body.classList.remove("chat-open");
    desbloquearScroll();
  } else {
    chatWindow.classList.add("active");
    document.body.classList.add("chat-open");
    bloquearScroll();
    setTimeout(() => { chatBody.scrollTop = chatBody.scrollHeight; }, 100);
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
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    enviarSoporte();
  }
}

function obtenerHora() {
  return new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
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
  chatInput.style.height = "auto";

  const msgUser = document.createElement("div");
  msgUser.className = "chat-msg user";
  msgUser.innerHTML = `
    <span class="chat-sender">Tú</span>
    <div style="word-break: break-word; overflow-wrap: anywhere;">${duda}</div>
    <span class="chat-time">${obtenerHora()}</span>
  `;
  chatBody.appendChild(msgUser);
  chatBody.scrollTop = chatBody.scrollHeight;

  setTimeout(() => {
    const msgBot = document.createElement("div");
    msgBot.className = "chat-msg bot";
    
    // 👇 LÓGICA DEL MENSAJE DEL BOT SEGÚN EL ESTADO 👇
    let textoRespuesta = "";
    
    if (isOnlineNow) {
      textoRespuesta = `¡Mensaje recibido! 📩<br>Para enviármelo a mi WhatsApp y responderte rápido, haz clic en el botón de abajo:`;
    } else {
      textoRespuesta = `¡Mensaje recibido! 📩<br>Actualmente estoy fuera de línea 😴. Puedes enviar el mensaje a mi WhatsApp y te responderé mañana a partir de las <b>10:00 a.m.</b>`;
    }

    msgBot.innerHTML = `
      <span class="chat-sender">Yesid Bot</span>
      <div>${textoRespuesta}</div>
      <button class="btn-chat-wa" onclick="irAWhatsAppSoporte()">
        <svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.2-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.5-.9-2.1-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
        Abrir WhatsApp
      </button>
      <span class="chat-time">${obtenerHora()}</span>
    `;
    chatBody.appendChild(msgBot);
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 500);
}

function irAWhatsAppSoporte() {
  const mensaje = `*${asuntoCliente}*\n\n${dudaCliente}`;
  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
  chatWindow.classList.remove("active");
  document.body.classList.remove("chat-open");
  desbloquearScroll();
}

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
const idHelpText = document.getElementById("idHelpText");

inputId.addEventListener("input", () => {
  if (idJugadorValidado !== "") {
    idJugadorValidado = "";
    msgSuccess.style.display = "none";
    btnVerificar.style.display = "block";
    idHelpText.style.display = "block";
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
    btnVerificar.innerHTML = 'Verificar ID';
    btnVerificar.disabled = false;

    document.getElementById("textoIdAdvertencia").textContent = idValue;
    modalAdvertenciaID.classList.add("active");
    bloquearScroll();

    const btnConfirmar = document.getElementById("btnConfirmarAdvertencia");
    let timeLeft = 5;
    
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = `Espera (${timeLeft}s)...`;
    btnConfirmar.className = "btn btn-disabled btn-lg";
    btnConfirmar.style.width = "100%";
    btnConfirmar.style.marginBottom = "15px";

    clearInterval(timeoutConfirmar);
    timeoutConfirmar = setInterval(() => {
      timeLeft--;
      if (timeLeft > 0) {
        btnConfirmar.textContent = `Espera (${timeLeft}s)...`;
      } else {
        clearInterval(timeoutConfirmar);
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = "Confirmar";
        btnConfirmar.className = "btn btn-success btn-lg";
      }
    }, 1000);

  }, 1000); 
}

function confirmarAdvertenciaID() {
  const idValue = inputId.value.trim();
  idJugadorValidado = idValue;
  
  modalAdvertenciaID.classList.remove("active");
  desbloquearScroll();
  clearInterval(timeoutConfirmar);

  idHelpText.style.display = "none";
  msgSuccess.style.display = "flex";

  document.getElementById("precios").scrollIntoView({ behavior: "smooth" });
}

function cerrarModalAdvertenciaID() {
  modalAdvertenciaID.classList.remove("active");
  desbloquearScroll();
  clearInterval(timeoutConfirmar);
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

function initYear() {
  document.getElementById("year").textContent = new Date().getFullYear();
}

chatInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
  if (this.scrollHeight > 100) {
    this.style.overflowY = 'auto';
    this.style.height = '100px';
  } else {
    this.style.overflowY = 'hidden';
  }
});

document.addEventListener("DOMContentLoaded", () => {
  renderPaquetes();
  initHeaderScroll();
  initYear();
  actualizarEstadoYesid();
});
