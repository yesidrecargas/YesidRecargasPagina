
/* =====================================
   YESID RECARGAS - TIENDA COMPLETA
   ACTUALIZADO CON X PARA COMPROBANTES
===================================== */

// CONFIGURACIÓN SUPABASE

const SUPABASE_URL =
  "https://kmjzhugxgbccgovzlkzl.supabase.co";

// Coloca aquí tu Publishable Key actual.
// No compartas esta clave en chats.

const SUPABASE_KEY = "sb_publishable_xzqywVnEtHKcpX40eX-IEw_lwTvUTSJ";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* ELEMENTOS */

const productsGrid = document.getElementById("productsGrid");
const freeFireIdInput = document.getElementById("freeFireId");
const verifyFreeFireId = document.getElementById("verifyFreeFireId");
const uidStatus = document.getElementById("uidStatus");

const orderModal = document.getElementById("orderModal");
const modalOverlay = document.getElementById("modalOverlay");
const closeModal = document.getElementById("closeModal");

const orderForm = document.getElementById("orderForm");
const customerNameInput = document.getElementById("customerName");
const selectedProductText = document.getElementById("selectedProduct");
const orderTotal = document.getElementById("orderTotal");
const orderResult = document.getElementById("orderResult");
const submitOrder = document.getElementById("submitOrder");

const paymentSection = document.getElementById("paymentSection");
const closeProofSection = document.getElementById("closeProofSection");
const paymentReference = document.getElementById("paymentReference");
const proofFile = document.getElementById("proofFile");
const proofPreview = document.getElementById("proofPreview");
const uploadProofButton = document.getElementById("uploadProofButton");
const proofResult = document.getElementById("proofResult");

const trackingForm = document.getElementById("trackingForm");
const trackingCode = document.getElementById("trackingCode");
const trackingResult = document.getElementById("trackingResult");

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

/* VARIABLES */

let selectedProduct = null;
let currentOrderCode = null;
let currentFreeFireId = "";
let verifiedFreeFireId = "";
let creatingOrder = false;
let uploadingProof = false;
let proofPreviewUrl = null;

/* UTILIDADES */

function formatPrice(value) {
  return "$" + Number(value).toLocaleString("es-CO") + " COP";
}

function showOrderError(message) {
  orderResult.textContent = message;
}

/* UID: SOLO NÚMEROS */

freeFireIdInput?.addEventListener("input", () => {
  freeFireIdInput.value =
    freeFireIdInput.value.replace(/\D/g, "").slice(0, 11);

  verifiedFreeFireId = "";
  currentFreeFireId = "";

  uidStatus.textContent = "Debes verificar nuevamente tu UID.";
  uidStatus.className = "";
});

/* VERIFICAR UID */

verifyFreeFireId?.addEventListener("click", () => {
  const uid = freeFireIdInput.value.trim();

  if (!/^\d{8,11}$/.test(uid)) {
    verifiedFreeFireId = "";
    currentFreeFireId = "";

    uidStatus.textContent =
      "UID inválido. Usa entre 8 y 11 números.";

    uidStatus.className = "invalid";
    return;
  }

  verifiedFreeFireId = uid;
  currentFreeFireId = uid;

  uidStatus.textContent = "✓ Verificado";
  uidStatus.className = "verified";
});

/* CARGAR PRODUCTOS */

async function loadProducts() {
  if (!productsGrid) return;

  productsGrid.innerHTML =
    '<p class="loading-products">Cargando productos...</p>';

  try {
    const { data, error } = await db
      .from("products")
      .select("id,name,diamonds,price,active")
      .eq("active", true)
      .order("diamonds", { ascending: true });

    if (error) throw error;

    const products = (data || []).filter(product => {
      const name = String(product.name).toLowerCase();

      return (
        Number(product.diamonds) > 0 &&
        !name.includes("semanal") &&
        !name.includes("mensual") &&
        !name.includes("booyah") &&
        !name.includes("pase")
      );
    });

    productsGrid.innerHTML = "";

    if (!products.length) {
      productsGrid.textContent = "No hay productos disponibles.";
      return;
    }

    products.forEach(product => {
      const card = document.createElement("article");
      card.className = "product-card";

      const icon = document.createElement("div");
      icon.className = "product-icon";
      icon.textContent = "💎";

      const title = document.createElement("h3");
      title.textContent = product.name;

      const description = document.createElement("p");
      description.textContent = "Diamantes Free Fire";

      const price = document.createElement("div");
      price.className = "product-price";
      price.textContent = formatPrice(product.price);

      const button = document.createElement("button");
      button.className = "product-buy";
      button.type = "button";
      button.textContent = "Comprar";

      button.addEventListener("click", () => {
        const uid = freeFireIdInput.value.trim();

        if (
          !verifiedFreeFireId ||
          verifiedFreeFireId !== uid ||
          !/^\d{8,11}$/.test(uid)
        ) {
          uidStatus.textContent = "Primero verifica tu UID.";
          uidStatus.className = "invalid";
          freeFireIdInput.focus();
          return;
        }

        currentFreeFireId = verifiedFreeFireId;
        openOrderModal(product);
      });

      card.append(icon, title, description, price, button);
      productsGrid.appendChild(card);
    });

  } catch (error) {
    console.error("Error cargando productos:", error);
    productsGrid.textContent =
      "No se pudieron cargar los productos. Recarga la página.";
  }
}

/* ABRIR PEDIDO */

function openOrderModal(product) {
  selectedProduct = product;
  currentOrderCode = null;

  selectedProductText.textContent = product.name;
  orderTotal.textContent = formatPrice(product.price);

  orderForm.reset();
  orderForm.hidden = false;

  customerNameInput.classList.remove("input-error");

  orderResult.textContent = "";
  paymentSection.hidden = true;

  proofResult.textContent = "";
  proofResult.classList.remove("proof-success");

  proofFile.value = "";
  proofFile.disabled = false;

  proofPreview.hidden = true;
  proofPreview.removeAttribute("src");

  if (proofPreviewUrl) {
    URL.revokeObjectURL(proofPreviewUrl);
    proofPreviewUrl = null;
  }

  uploadProofButton.disabled = false;
  uploadProofButton.textContent = "Enviar comprobante";

  orderModal.hidden = false;
  orderModal.classList.add("active");
  orderModal.setAttribute("aria-hidden", "false");

  document.body.classList.add("modal-open");
}

/* CERRAR PEDIDO */

function closeOrderModal() {
  if (creatingOrder || uploadingProof) return;

  orderModal.classList.remove("active");
  orderModal.hidden = true;
  orderModal.setAttribute("aria-hidden", "true");

  document.body.classList.remove("modal-open");
}

closeModal?.addEventListener("click", closeOrderModal);
modalOverlay?.addEventListener("click", closeOrderModal);

/* NUEVO: CERRAR APARTADO DE COMPROBANTE CON X */

closeProofSection?.addEventListener("click", () => {
  if (uploadingProof) return;

  paymentSection.hidden = true;
});

/* VALIDAR NOMBRE */

customerNameInput?.addEventListener("input", () => {
  customerNameInput.classList.remove("input-error");
});

/* CREAR PEDIDO */

orderForm?.addEventListener("submit", async event => {
  event.preventDefault();

  if (creatingOrder || !selectedProduct) return;

  const customerName = customerNameInput.value.trim();

  if (customerName.length < 2 || customerName.length > 60) {
    customerNameInput.classList.add("input-error");
    customerNameInput.focus();
    return;
  }

  if (!/^\d{8,11}$/.test(currentFreeFireId)) {
    showOrderError("El UID no es válido. Verifícalo nuevamente.");
    return;
  }

  creatingOrder = true;

  submitOrder.disabled = true;
  submitOrder.textContent = "Creando pedido...";
  showOrderError("Conectando con el servidor...");

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 15000);

  try {
    const { data, error } = await db
      .rpc("create_order_public", {
        p_customer_name: customerName,
        p_free_fire_id: currentFreeFireId,
        p_product_id: selectedProduct.id
      })
      .abortSignal(controller.signal);

    if (error) throw error;

    const order = Array.isArray(data) ? data[0] : data;

    if (!order || !order.reference_code) {
      throw new Error("Supabase no devolvió el código del pedido.");
    }

    currentOrderCode = order.reference_code;

    paymentReference.textContent = currentOrderCode;

    showOrderError(
      "¡Pedido creado! Realiza el pago y envía tu comprobante."
    );

    orderForm.hidden = true;
    paymentSection.hidden = false;

  } catch (error) {
    console.error("Error creando pedido:", error);

    if (error.name === "AbortError") {
      showOrderError(
        "La conexión tardó demasiado. Comprueba tu internet e inténtalo nuevamente."
      );
    } else {
      showOrderError(
        "No se pudo crear el pedido: " +
        (error.message || "Error desconocido.")
      );
    }

  } finally {
    clearTimeout(timeoutId);

    creatingOrder = false;
    submitOrder.disabled = false;
    submitOrder.textContent = "Crear pedido";
  }
});

/* VISTA PREVIA DEL COMPROBANTE */

proofFile?.addEventListener("change", () => {
  const file = proofFile.files[0];

  if (!file) {
    proofPreview.hidden = true;
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    alert("Selecciona una imagen JPG, PNG o WEBP.");
    proofFile.value = "";
    proofPreview.hidden = true;
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("La imagen no puede superar los 5 MB.");
    proofFile.value = "";
    proofPreview.hidden = true;
    return;
  }

  if (proofPreviewUrl) {
    URL.revokeObjectURL(proofPreviewUrl);
  }

  proofPreviewUrl = URL.createObjectURL(file);
  proofPreview.src = proofPreviewUrl;
  proofPreview.hidden = false;
});

/* SUBIR COMPROBANTE */

uploadProofButton?.addEventListener("click", async () => {
  if (uploadingProof) return;

  if (!currentOrderCode) {
    proofResult.textContent = "No hay un pedido activo.";
    proofResult.classList.remove("proof-success");
    return;
  }

  const file = proofFile.files[0];

  if (!file) {
    proofResult.textContent =
      "Selecciona primero tu comprobante.";
    proofResult.classList.remove("proof-success");
    return;
  }

  uploadingProof = true;
  uploadProofButton.disabled = true;
  uploadProofButton.textContent = "Enviando...";

  try {
    const extension =
      file.type === "image/png" ? "png" :
      file.type === "image/webp" ? "webp" : "jpg";

    const uniqueName = window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : Date.now() + "-" + Math.random().toString(36).slice(2);

    const path =
      `${currentOrderCode}/${uniqueName}.${extension}`;

    const { error: uploadError } = await db.storage
      .from("comprobantes")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      throw new Error(
        "FALLO EN STORAGE: " + uploadError.message
      );
    }

    const { data, error } = await db.rpc("attach_order_proof", {
      p_code: currentOrderCode,
      p_path: path
    });

    if (error) {
      throw new Error(
        "FALLO AL VINCULAR: " + error.message
      );
    }

    if (data !== true) {
      throw new Error(
        "El archivo se subió, pero no se pudo vincular al pedido."
      );
    }

    proofResult.classList.add("proof-success");

    proofResult.textContent =
      "¡Comprobante enviado correctamente! 📋 Copia y guarda tu código de pedido: " +
      currentOrderCode +
      ". Lo necesitarás para consultar el estado de tu compra. Tu pedido sigue pendiente hasta verificar el pago.";

    proofFile.disabled = true;
    uploadProofButton.textContent = "Comprobante enviado";

  } catch (error) {
    console.error("Error subiendo comprobante:", error);

    proofResult.classList.remove("proof-success");

    proofResult.textContent =
      "No se pudo enviar el comprobante: " +
      (error.message || "Error desconocido.");

    uploadProofButton.disabled = false;
    uploadProofButton.textContent = "Enviar comprobante";

  } finally {
    uploadingProof = false;
  }
});

/* CONSULTAR PEDIDO */

trackingForm?.addEventListener("submit", async event => {
  event.preventDefault();

  const code = trackingCode.value.trim().toUpperCase();

  if (!/^REF\d{4}$/.test(code)) {
    trackingResult.textContent =
      "Escribe un código válido. Ejemplo: REF4821";
    return;
  }

  trackingResult.textContent = "Buscando pedido...";

  try {
    const { data, error } = await db.rpc("track_order_public", {
      p_code: code
    });

    if (error) throw error;

    const order = Array.isArray(data) ? data[0] : data;

    if (!order) {
      trackingResult.textContent = "No encontramos ese pedido.";
      return;
    }

    const statuses = {
      pending: {
        text: "Pendiente",
        class: "status-pending"
      },
      paid: {
        text: "Pagado",
        class: "status-paid"
      },
      completed: {
        text: "Completado",
        class: "status-completed"
      },
      cancelled: {
        text: "Cancelado",
        class: "status-cancelled"
      }
    };

    const status = statuses[order.status] || {
      text: order.status,
      class: ""
    };

    const date = new Date(order.created_at);

    const formattedDate = isNaN(date.getTime())
      ? "No disponible"
      : date.toLocaleString("es-CO", {
          timeZone: "America/Bogota",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        });

    const card = document.createElement("div");
    card.className = "tracking-order-card";

    const title = document.createElement("h3");
    title.textContent = "Detalles de tu pedido";
    card.appendChild(title);

    function addRow(label, value) {
      const row = document.createElement("div");
      row.className = "tracking-order-row";

      const name = document.createElement("span");
      name.textContent = label;

      const content = document.createElement("strong");
      content.textContent = value ?? "No disponible";

      row.append(name, content);
      card.appendChild(row);
    }

    addRow("UID de Free Fire", order.free_fire_id);
    addRow("Producto", order.product_name);

    addRow(
      "Total",
      formatPrice(order.total).replace(" COP", " 🇨🇴")
    );

    addRow("Fecha del pedido", formattedDate);

    const statusRow = document.createElement("div");
    statusRow.className = "tracking-order-status";

    const statusLabel = document.createElement("span");
    statusLabel.textContent = "Estado";

    const statusValue = document.createElement("strong");
    statusValue.className = status.class;
    statusValue.textContent = "● " + status.text;

    statusRow.append(statusLabel, statusValue);
    card.appendChild(statusRow);

    trackingResult.replaceChildren(card);

  } catch (error) {
    console.error("Error consultando pedido:", error);

    trackingResult.textContent =
      "No se pudo consultar el pedido: " +
      (error.message || "Error desconocido.");
  }
});

/* MENÚ MÓVIL */

menuToggle?.addEventListener("click", () => {
  mainNav?.classList.toggle("active");
});

mainNav?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("active");
  });
});

/* INICIAR */

loadProducts();
