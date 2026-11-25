
/* =====================================
   YESID RECARGAS - JAVASCRIPT
   SUPABASE + PRECIOS DINÁMICOS
===================================== */

const WHATSAPP_NUMBER = "573136895221";
const QR_IMAGE = "imagenes/QR.png";

/* =====================================
   CONFIGURACIÓN SUPABASE
===================================== */

const SUPABASE_URL = "https://nmksscrtawrnrfxxvwrt.supabase.co";
const SUPABASE_KEY = "sb_publishable_qKC_777XkM_Fof0FdRBTjg_oinF8aUL";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* =====================================
   IMÁGENES DEL CARRUSEL
===================================== */

const carouselImages = [
  "carrusel/agenda1.jpg",
  "carrusel/agenda2.jpg",
  "carrusel/agenda3.jpg",
  "carrusel/agenda4.jpg"
];

/* =====================================
   PRODUCTOS
===================================== */

const products = [
  { id: "110", name: "110 Diamantes", price: 3200, icon: "💎" },
  { id: "341", name: "341 Diamantes", price: 10500, icon: "💎" },
  { id: "572", name: "572 Diamantes", price: 16500, icon: "💎", badge: "MÁS VENDIDO" },
  { id: "1166", name: "1.166 Diamantes", price: 28900, icon: "💎" },
  { id: "2398", name: "2.398 Diamantes", price: 56900, icon: "💎" },
  { id: "6160", name: "6.160 Diamantes", price: 137500, icon: "💎" },
  { id: "semanal", name: "Tarjeta semanal", price: 7900, icon: "🎫" },
  { id: "mensual", name: "Tarjeta mensual", price: 35900, icon: "🎫" }
];

let productsLoaded = false;

/* =====================================
   ELEMENTOS HTML
===================================== */

const playerId = document.getElementById("playerId");
const verifyButton = document.getElementById("verifyButton");
const playerResult = document.getElementById("playerResult");
const productsGrid = document.getElementById("productsGrid");
const homeLogo = document.getElementById("homeLogo");

let verifiedPlayerId = null;
let selectedProduct = null;

/* =====================================
   VOLVER AL INICIO CON EL LOGO
===================================== */

if (homeLogo) {
  homeLogo.addEventListener("click", (event) => {
    event.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

/* =====================================
   FORMATO DE PRECIOS
===================================== */

function formatPrice(price) {
  return "$" + Number(price).toLocaleString("es-CO") + " COP";
}

/* =====================================
   CARGAR PRECIOS DESDE SUPABASE
===================================== */

async function loadStoreProducts() {
  productsLoaded = false;
  renderProducts();

  const { data, error } = await supabaseClient
    .from("productos")
    .select("id, precio");

  if (error) {
    console.error("Error al cargar precios:", error);

    if (productsGrid) {
      productsGrid.innerHTML =
        '<p class="products-error">No se pudieron cargar los precios. Intenta actualizar la página.</p>';
    }

    return;
  }

  const loadedIds = new Set(data.map(item => String(item.id)));

  const allProductsExist = products.every(product =>
    loadedIds.has(product.id)
  );

  if (!allProductsExist) {
    console.error("Faltan productos en la tabla de Supabase.");

    if (productsGrid) {
      productsGrid.innerHTML =
        '<p class="products-error">Los productos no están disponibles en este momento.</p>';
    }

    return;
  }

  data.forEach(item => {
    const product = products.find(
      product => product.id === String(item.id)
    );

    if (product) {
      product.price = Number(item.precio);
    }
  });

  productsLoaded = true;
  renderProducts();

  console.log("Precios cargados correctamente desde Supabase.");
}

/* =====================================
   VISOR DE IMÁGENES
===================================== */

let lightboxIndex = 0;
let lightboxElement = null;
let lightboxImage = null;
let lightboxCounter = null;
let lightboxAutoPlay = null;
let previousScrollPosition = 0;

/* =====================================
   AUTOPLAY DEL VISOR GRANDE
===================================== */

function stopLightboxAutoPlay() {
  clearInterval(lightboxAutoPlay);
  lightboxAutoPlay = null;
}

function startLightboxAutoPlay() {
  stopLightboxAutoPlay();

  if (
    lightboxElement &&
    lightboxElement.classList.contains("active") &&
    carouselImages.length > 1
  ) {
    lightboxAutoPlay = setInterval(() => {
      changeLightboxImage(1);
    }, 4000);
  }
}

/* =====================================
   CREAR VISOR
===================================== */

function createLightbox() {
  if (lightboxElement) return;

  lightboxElement = document.createElement("div");
  lightboxElement.className = "image-lightbox";
  lightboxElement.id = "imageLightbox";

  lightboxElement.innerHTML = `
    <button
      type="button"
      class="lightbox-close"
      id="lightboxClose"
      aria-label="Cerrar visor">
      &times;
    </button>

    <button
      type="button"
      class="lightbox-arrow lightbox-prev"
      id="lightboxPrev"
      aria-label="Imagen anterior">
      &#10094;
    </button>

    <img
      id="lightboxImage"
      src=""
      alt="Imagen ampliada">

    <button
      type="button"
      class="lightbox-arrow lightbox-next"
      id="lightboxNext"
      aria-label="Imagen siguiente">
      &#10095;
    </button>

    <div class="lightbox-counter" id="lightboxCounter"></div>
  `;

  document.body.appendChild(lightboxElement);

  lightboxImage = document.getElementById("lightboxImage");
  lightboxCounter = document.getElementById("lightboxCounter");

  document.getElementById("lightboxClose")
    .addEventListener("click", closeLightbox);

  document.getElementById("lightboxPrev")
    .addEventListener("click", () => {
      changeLightboxImage(-1);
      startLightboxAutoPlay();
    });

  document.getElementById("lightboxNext")
    .addEventListener("click", () => {
      changeLightboxImage(1);
      startLightboxAutoPlay();
    });

  lightboxElement.addEventListener("click", (event) => {
    if (event.target === lightboxElement) {
      closeLightbox();
    }
  });
}

/* =====================================
   ABRIR VISOR
===================================== */

function openLightbox(index) {
  createLightbox();

  lightboxIndex = index;
  updateLightboxImage();

  previousScrollPosition = window.scrollY;

  lightboxElement.classList.add("active");
  document.body.classList.add("lightbox-open");

  // Detener el desplazamiento sin perder la posición.
  document.body.style.position = "fixed";
  document.body.style.top = `-${previousScrollPosition}px`;
  document.body.style.width = "100%";

  // Pausar el carrusel normal.
  stopCarouselAutoPlay();

  // Iniciar cambio automático en pantalla completa.
  startLightboxAutoPlay();

  document.getElementById("lightboxClose").focus();
}

/* =====================================
   CERRAR VISOR
===================================== */

function closeLightbox() {
  if (!lightboxElement) return;

  if (!lightboxElement.classList.contains("active")) return;

  // Detener autoplay del visor.
  stopLightboxAutoPlay();

  lightboxElement.classList.remove("active");
  document.body.classList.remove("lightbox-open");

  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";

  window.scrollTo(0, previousScrollPosition);

  // Reanudar carrusel normal.
  startCarouselAutoPlay();
}

/* =====================================
   CAMBIAR IMAGEN DEL VISOR
===================================== */

function changeLightboxImage(direction) {
  lightboxIndex =
    (lightboxIndex + direction + carouselImages.length) %
    carouselImages.length;

  updateLightboxImage();
}

/* =====================================
   ACTUALIZAR IMAGEN DEL VISOR
===================================== */

function updateLightboxImage() {
  if (!lightboxImage || !lightboxCounter) return;

  lightboxImage.src = carouselImages[lightboxIndex];

  lightboxCounter.textContent =
    `${lightboxIndex + 1} / ${carouselImages.length}`;

  lightboxImage.alt =
    `Imagen destacada ${lightboxIndex + 1}`;
}

/* =====================================
   CARRUSEL DE IMÁGENES
===================================== */

let carouselAutoPlay = null;
let carouselAutoPlayEnabled = false;

function stopCarouselAutoPlay() {
  clearInterval(carouselAutoPlay);
  carouselAutoPlay = null;
}

function startCarouselAutoPlay() {
  stopCarouselAutoPlay();

  if (
    carouselAutoPlayEnabled &&
    carouselImages.length > 1 &&
    (!lightboxElement || !lightboxElement.classList.contains("active"))
  ) {
    carouselAutoPlay = setInterval(() => {
      if (window.carouselNextSlide) {
        window.carouselNextSlide();
      }
    }, 4000);
  }
}

/* =====================================
   INICIAR CARRUSEL
===================================== */

function initCarousel() {
  const track = document.getElementById("carouselTrack");
  const viewport = document.getElementById("carouselViewport");
  const dotsContainer = document.getElementById("carouselDots");
  const prevButton = document.getElementById("carouselPrev");
  const nextButton = document.getElementById("carouselNext");

  if (
    !track ||
    !viewport ||
    !dotsContainer ||
    !prevButton ||
    !nextButton ||
    carouselImages.length === 0
  ) {
    return;
  }

  let currentIndex = 0;
  let startX = 0;
  let movedX = 0;
  let isDragging = false;
  let suppressNextClick = false;

  track.innerHTML = "";
  dotsContainer.innerHTML = "";

  carouselImages.forEach((src, index) => {
    const slide = document.createElement("div");
    slide.className = "carousel-slide";

    const img = document.createElement("img");
    img.src = src;
    img.alt = `Imagen destacada ${index + 1}`;
    img.draggable = false;
    img.loading = index === 0 ? "eager" : "lazy";

    slide.appendChild(img);
    track.appendChild(slide);

    // Abrir imagen al tocarla.
    slide.addEventListener("click", () => {
      if (suppressNextClick) {
        suppressNextClick = false;
        return;
      }

      openLightbox(index);
    });

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `Ir a la imagen ${index + 1}`);

    dot.addEventListener("click", () => {
      goToSlide(index);
      startCarouselAutoPlay();
    });

    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll(".carousel-dot");

  function updateCarousel() {
    track.style.transform =
      `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex =
      (index + carouselImages.length) % carouselImages.length;

    updateCarousel();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  // Permitir que el autoplay use la función del carrusel.
  window.carouselNextSlide = nextSlide;

  carouselAutoPlayEnabled = true;

  nextButton.addEventListener("click", () => {
    nextSlide();
    startCarouselAutoPlay();
  });

  prevButton.addEventListener("click", () => {
    prevSlide();
    startCarouselAutoPlay();
  });

  /* DESLIZAR CON EL DEDO O RATÓN */

  viewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    startX = event.clientX;
    movedX = 0;
    isDragging = true;
    suppressNextClick = false;

    viewport.classList.add("dragging");
    stopCarouselAutoPlay();
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    movedX = event.clientX - startX;
  });

  function endDrag() {
    if (!isDragging) return;

    isDragging = false;
    viewport.classList.remove("dragging");

    if (Math.abs(movedX) > 10) {
      suppressNextClick = true;

      setTimeout(() => {
        suppressNextClick = false;
      }, 300);
    }

    if (movedX < -45) {
      nextSlide();
    } else if (movedX > 45) {
      prevSlide();
    }

    movedX = 0;
    startCarouselAutoPlay();
  }

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("lostpointercapture", endDrag);

  viewport.addEventListener("mouseenter", stopCarouselAutoPlay);
  viewport.addEventListener("mouseleave", startCarouselAutoPlay);

  updateCarousel();
  startCarouselAutoPlay();
}

/* =====================================
   CREAR VENTANA DE PAGO
===================================== */

function createPaymentModal() {
  if (document.getElementById("paymentModal")) return;

  const modal = document.createElement("div");

  modal.id = "paymentModal";
  modal.className = "payment-modal";

  modal.innerHTML = `
    <div class="payment-box">

      <button type="button"
        class="payment-close"
        id="closePayment"
        aria-label="Cerrar ventana">×</button>

      <div class="payment-header">
        <span class="payment-tag">YESID RECARGAS</span>
        <h2>REALIZAR PAGO</h2>
        <p>Escanea el código QR para realizar tu pago.</p>
      </div>

      <div class="payment-qr-container">
        <img src="${QR_IMAGE}"
          alt="Código QR para realizar el pago"
          class="payment-qr">
      </div>

      <div class="payment-details">

        <div class="payment-field">
          <span class="payment-label">TITULAR DE LA CUENTA</span>
          <strong>Miguel Garrido M.</strong>
        </div>

        <div class="payment-field">
          <span class="payment-label">PRODUCTO SELECCIONADO</span>
          <strong id="paymentProduct"></strong>
        </div>

        <div class="payment-field payment-price-field">
          <span class="payment-label">VALOR A PAGAR</span>

          <div class="payment-price-row">
            <strong id="paymentPrice"></strong>

            <button type="button"
              id="copyPaymentPrice"
              class="copy-price-button">COPIAR</button>
          </div>

          <span id="copyMessage" class="copy-message"></span>
        </div>

      </div>

      <button type="button"
        id="sendProofButton"
        class="send-proof-button">
        ENVIAR COMPROBANTE POR WHATSAPP
      </button>

      <p class="payment-note">
        Después de realizar el pago, envía tu comprobante por WhatsApp.
      </p>

    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("closePayment")
    .addEventListener("click", closePaymentModal);

  document.getElementById("copyPaymentPrice")
    .addEventListener("click", copyPaymentPrice);

  document.getElementById("sendProofButton")
    .addEventListener("click", sendProofWhatsApp);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closePaymentModal();
  });
}

/* =====================================
   ABRIR VENTANA DE PAGO
===================================== */

function openPaymentModal(product) {
  selectedProduct = product;

  createPaymentModal();

  document.getElementById("paymentProduct").textContent = product.name;
  document.getElementById("paymentPrice").textContent =
    formatPrice(product.price);

  document.getElementById("copyMessage").textContent = "";

  const modal = document.getElementById("paymentModal");

  modal.classList.add("active");
  document.body.classList.add("payment-open");
}

/* =====================================
   CERRAR VENTANA DE PAGO
===================================== */

function closePaymentModal() {
  const modal = document.getElementById("paymentModal");

  if (!modal) return;

  modal.classList.remove("active");
  document.body.classList.remove("payment-open");
}

/* =====================================
   COPIAR PRECIO
===================================== */

async function copyPaymentPrice() {
  if (!selectedProduct) return;

  const price = formatPrice(selectedProduct.price);
  const message = document.getElementById("copyMessage");

  try {
    await navigator.clipboard.writeText(price);
    message.textContent = "Precio copiado correctamente.";
  } catch (error) {
    const temporaryInput = document.createElement("textarea");

    temporaryInput.value = price;
    document.body.appendChild(temporaryInput);
    temporaryInput.select();

    const copied = document.execCommand("copy");
    temporaryInput.remove();

    message.textContent = copied
      ? "Precio copiado correctamente."
      : "No se pudo copiar el precio.";
  }
}

/* =====================================
   ENVIAR PEDIDO POR WHATSAPP
===================================== */

function sendProofWhatsApp() {
  if (!selectedProduct || !verifiedPlayerId) return;

  const message =
    `Hola, quiero realizar un pedido.\n\n` +
    `# ID: ${verifiedPlayerId}\n` +
    `# Producto: ${selectedProduct.name}\n` +
    `# Total: ${formatPrice(selectedProduct.price)}\n\n` +
    `Quedo atento a las instrucciones de pago por Nequi.`;

  const whatsappURL =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  window.open(whatsappURL, "_blank");
}

/* =====================================
   MOSTRAR PRODUCTOS
===================================== */

function renderProducts() {
  if (!productsGrid) return;

  productsGrid.innerHTML = "";

  products.forEach((product, index) => {
    const card = document.createElement("article");

    card.className = "product-card";

    card.innerHTML = `
      <div class="product-badge-slot">
        ${
          product.badge
            ? `<span class="product-badge">${product.badge}</span>`
            : ""
        }
      </div>

      <div class="product-icon">${product.icon}</div>
      <h3>${product.name}</h3>

      <div class="product-price">
        ${formatPrice(product.price)}
      </div>

      <button type="button"
        class="product-button"
        data-index="${index}"
        ${productsLoaded ? "" : "disabled"}>
        ${productsLoaded ? "COMPRAR" : "CARGANDO..."}
      </button>
    `;

    productsGrid.appendChild(card);
  });
}

/* =====================================
   VERIFICAR ID
===================================== */

if (verifyButton && playerId && playerResult) {
  verifyButton.addEventListener("click", () => {
    const id = playerId.value.trim();

    verifiedPlayerId = null;

    if (!/^\d{8,12}$/.test(id)) {
      playerResult.className = "player-result error";
      playerResult.textContent =
        "✕ Ingresa un ID válido de 8 a 12 dígitos.";
      return;
    }

    verifiedPlayerId = id;

    playerResult.className = "player-result success";
    playerResult.textContent =
      "✓ ID válido. Ya puedes seleccionar tu producto.";
  });

  playerId.addEventListener("input", () => {
    playerId.value = playerId.value
      .replace(/\D/g, "")
      .slice(0, 12);

    verifiedPlayerId = null;

    playerResult.className = "player-result";
    playerResult.textContent = "";
  });
}

/* =====================================
   COMPRAR PRODUCTO
===================================== */

function buyProduct(index) {
  if (!productsLoaded) {
    alert("Los precios todavía no están disponibles. Intenta actualizar la página.");
    return;
  }

  const product = products[index];

  if (!product) return;

  if (!verifiedPlayerId) {
    if (playerResult) {
      playerResult.className = "player-result error";
      playerResult.textContent = "Primero debes verificar tu ID.";
    }

    const playerSection = document.getElementById("jugador");

    if (playerSection) {
      playerSection.scrollIntoView({
        behavior: "smooth"
      });
    }

    return;
  }

  openPaymentModal(product);
}

/* =====================================
   EVENTOS DE LOS PRODUCTOS
===================================== */

if (productsGrid) {
  productsGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".product-button");

    if (!button || button.disabled) return;

    const index = Number(button.dataset.index);
    buyProduct(index);
  });
}

/* =====================================
   CERRAR VENTANAS CON TECLADO
===================================== */

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
    closePaymentModal();
  }

  if (lightboxElement && lightboxElement.classList.contains("active")) {
    if (event.key === "ArrowRight") {
      changeLightboxImage(1);
      startLightboxAutoPlay();
    }

    if (event.key === "ArrowLeft") {
      changeLightboxImage(-1);
      startLightboxAutoPlay();
    }
  }
});

/* =====================================
   HORARIO DE ATENCIÓN
   HORA DE COLOMBIA
===================================== */

function updateSchedule() {
  const scheduleCard = document.getElementById("scheduleCard");
  const scheduleStatus = document.getElementById("scheduleStatus");

  if (!scheduleCard || !scheduleStatus) return;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  const hour = Number(
    parts.find(part => part.type === "hour").value
  );

  const minute = Number(
    parts.find(part => part.type === "minute").value
  );

  const currentMinutes = hour * 60 + minute;

  const openingTime = 11 * 60;
  const closingTime = 22 * 60;

  const isOpen =
    currentMinutes >= openingTime &&
    currentMinutes < closingTime;

  if (isOpen) {
    scheduleCard.classList.add("open");
    scheduleCard.classList.remove("closed");
    scheduleStatus.textContent = "● ABIERTO";
  } else {
    scheduleCard.classList.add("closed");
    scheduleCard.classList.remove("open");
    scheduleStatus.textContent = "● CERRADO";
  }
}

/* =====================================
   PERSONAS CONECTADAS Y VISITAS TOTALES
===================================== */

const visitorsCount = document.getElementById("visitorsOnlineCount");

let visitorsChannel = null;

async function initVisitorsCounter() {
  const { data, error } = await supabaseClient.rpc("registrar_visita");

  if (error) {
    console.error("Error al registrar visita:", error);
  } else {
    console.log("Visitas registradas:", data);
  }

  if (!visitorsCount) return;

  const visitorKey = window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : "visitor-" + Date.now() + "-" + Math.random();

  visitorsChannel = supabaseClient.channel("yesid-recargas-online", {
    config: {
      presence: {
        key: visitorKey
      }
    }
  });

  visitorsChannel.on("presence", { event: "sync" }, () => {
    const presenceState = visitorsChannel.presenceState();

    const visitorSessions = Object.values(presenceState)
      .flat()
      .filter(session => session.role !== "admin");

    visitorsCount.textContent = visitorSessions.length;
  });

  visitorsChannel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await visitorsChannel.track({
        role: "visitor",
        online_at: new Date().toISOString()
      });
    }
  });
}

/* =====================================
   CONTADOR PÚBLICO DE RECARGAS
   ACTUALIZACIÓN EN TIEMPO REAL
===================================== */

const totalRecargasElement =
  document.getElementById("totalRecargas");

let publicCounterChannel = null;

async function loadPublicCounter() {
  if (!totalRecargasElement) return;

  const { data, error } = await supabaseClient
    .from("contador")
    .select("total")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Error al cargar recargas:", error);
    return;
  }

  totalRecargasElement.textContent =
    Number(data.total).toLocaleString("es-CO");
}

function initPublicCounterRealtime() {
  if (!totalRecargasElement) return;

  publicCounterChannel = supabaseClient
    .channel("public-recargas-counter")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "contador",
        filter: "id=eq.1"
      },
      (payload) => {
        totalRecargasElement.textContent =
          Number(payload.new.total).toLocaleString("es-CO");
      }
    )
    .subscribe();
}

/* =====================================
   INICIAR PÁGINA
===================================== */

renderProducts();
initCarousel();
updateSchedule();

setInterval(updateSchedule, 30000);

// Cargar precios oficiales antes de habilitar compras.
loadStoreProducts();

// Iniciar estadísticas.
initVisitorsCounter();

// Cargar y escuchar contador público.
loadPublicCounter();
initPublicCounterRealtime();
