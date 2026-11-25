
/* =====================================
   YESID RECARGAS - ADMIN PANEL
   SUPABASE + GESTIÓN DE PRECIOS
===================================== */

// CONFIGURACIÓN SUPABASE

const SUPABASE_URL = "https://nmksscrtawrnrfxxvwrt.supabase.co";
const SUPABASE_KEY = "sb_publishable_qKC_777XkM_Fof0FdRBTjg_oinF8aUL";
const ADMIN_UID = "23cd1368-c11b-450b-89be-170968b62425";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ELEMENTOS HTML

const loginSection = document.getElementById("loginSection");
const adminSection = document.getElementById("adminSection");

const loginForm = document.getElementById("loginForm");
const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");

const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");

const counterValue = document.getElementById("counterValue");
const increaseBtn = document.getElementById("increaseBtn");
const decreaseBtn = document.getElementById("decreaseBtn");
const counterMessage = document.getElementById("counterMessage");
const logoutBtn = document.getElementById("logoutBtn");

// ESTADÍSTICAS

const adminOnlineCount = document.getElementById("adminOnlineCount");
const adminTotalVisits = document.getElementById("adminTotalVisits");

// GESTIÓN DE PRECIOS

const pricesList = document.getElementById("pricesList");
const pricesMessage = document.getElementById("pricesMessage");

let visitorsChannel = null;
let visitsRefreshInterval = null;

let counter = 0;
let updating = false;
let loadingPrices = false;

// MOSTRAR LOGIN

function showLogin() {
  loginSection.hidden = false;
  adminSection.hidden = true;
}

// MOSTRAR PANEL

function showAdmin() {
  loginSection.hidden = true;
  adminSection.hidden = false;
}

// =====================================
// CONTADOR DE RECARGAS
// =====================================

async function loadCounter() {
  counterMessage.textContent = "Cargando contador...";

  const { data, error } = await supabaseClient
    .from("contador")
    .select("total")
    .eq("id", 1)
    .single();

  if (error) {
    counterMessage.textContent = "Error al cargar el contador.";
    console.error(error);
    return;
  }

  counter = data.total;
  counterValue.textContent = counter;
  counterMessage.textContent = "";
}

async function changeCounter(amount) {
  if (updating) return;

  const newTotal = counter + amount;
  if (newTotal < 0) return;

  updating = true;
  increaseBtn.disabled = true;
  decreaseBtn.disabled = true;

  counterMessage.textContent = "Guardando...";

  const { data, error } = await supabaseClient
    .from("contador")
    .update({ total: newTotal })
    .eq("id", 1)
    .select("total")
    .single();

  if (error) {
    counterMessage.textContent = "No se pudo guardar el cambio.";
    console.error(error);
  } else {
    counter = data.total;
    counterValue.textContent = counter;
    counterMessage.textContent = "Contador actualizado correctamente.";
  }

  updating = false;
  increaseBtn.disabled = false;
  decreaseBtn.disabled = false;
}

// =====================================
// VISITAS TOTALES
// =====================================

async function loadTotalVisits() {
  if (!adminTotalVisits) return;

  const { data, error } = await supabaseClient
    .from("visitas_totales")
    .select("total")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Error al cargar visitas:", error);
    adminTotalVisits.textContent = "Error";
    return;
  }

  adminTotalVisits.textContent =
    Number(data.total).toLocaleString("es-CO");
}

// =====================================
// PERSONAS CONECTADAS EN TIEMPO REAL
// =====================================

function initAdminVisitors() {
  if (!adminOnlineCount || visitorsChannel) return;

  const visitorKey = window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : "admin-" + Date.now() + "-" + Math.random();

  visitorsChannel = supabaseClient.channel(
    "yesid-recargas-online",
    {
      config: {
        presence: {
          key: visitorKey
        }
      }
    }
  );

  visitorsChannel.on(
    "presence",
    { event: "sync" },
    () => {
      const presenceState = visitorsChannel.presenceState();

      const visitorSessions = Object.values(presenceState)
        .flat()
        .filter(session => session.role !== "admin");

      adminOnlineCount.textContent = visitorSessions.length;
    }
  );

  visitorsChannel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await visitorsChannel.track({
        role: "admin",
        online_at: new Date().toISOString()
      });
    }
  });
}

// =====================================
// ESTADÍSTICAS
// =====================================

async function loadAdminStats() {
  await loadTotalVisits();

  initAdminVisitors();

  clearInterval(visitsRefreshInterval);

  visitsRefreshInterval = setInterval(() => {
    loadTotalVisits();
  }, 10000);
}

async function closeAdminVisitors() {
  clearInterval(visitsRefreshInterval);
  visitsRefreshInterval = null;

  if (visitorsChannel) {
    await supabaseClient.removeChannel(visitorsChannel);
    visitorsChannel = null;
  }

  if (adminOnlineCount) {
    adminOnlineCount.textContent = "0";
  }
}

// =====================================
// GESTIÓN DE PRECIOS
// =====================================

function formatPrice(value) {
  return "$" + Number(value).toLocaleString("es-CO");
}

function showPricesMessage(message, type = "") {
  pricesMessage.textContent = message;
  pricesMessage.className = "prices-status " + type;
}

async function loadProducts() {
  if (loadingPrices) return;

  loadingPrices = true;
  pricesList.textContent = "Cargando productos...";
  showPricesMessage("");

  const { data, error } = await supabaseClient
    .from("productos")
    .select("id, nombre, precio, orden")
    .order("orden", { ascending: true });

  loadingPrices = false;

  if (error) {
    console.error("Error al cargar productos:", error);
    pricesList.textContent = "No se pudieron cargar los productos.";
    showPricesMessage("Revisa la conexión con Supabase.", "error");
    return;
  }

  if (!data || data.length === 0) {
    pricesList.textContent = "No hay productos registrados.";
    return;
  }

  pricesList.replaceChildren();

  data.forEach(product => {
    const item = document.createElement("div");
    item.className = "price-admin-item";

    const name = document.createElement("span");
    name.className = "price-admin-name";
    name.textContent = product.nombre;

    const input = document.createElement("input");
    input.className = "price-admin-input";
    input.type = "number";
    input.min = "0";
    input.step = "1";
    input.inputMode = "numeric";
    input.value = product.precio;
    input.setAttribute("aria-label", "Precio de " + product.nombre);

    const button = document.createElement("button");
    button.className = "price-save-btn";
    button.type = "button";
    button.textContent = "GUARDAR";

    button.addEventListener("click", () => {
      saveProductPrice(product.id, input, button);
    });

    item.append(name, input, button);
    pricesList.appendChild(item);
  });
}

async function saveProductPrice(productId, input, button) {
  const newPrice = Number(input.value);

  if (
    input.value.trim() === "" ||
    !Number.isSafeInteger(newPrice) ||
    newPrice < 0
  ) {
    showPricesMessage("Ingresa un precio válido en pesos.", "error");
    input.focus();
    return;
  }

  button.disabled = true;
  button.textContent = "GUARDANDO...";
  showPricesMessage("Guardando precio...");

  const { data, error } = await supabaseClient
    .from("productos")
    .update({ precio: newPrice })
    .eq("id", productId)
    .select("id, precio")
    .single();

  button.disabled = false;
  button.textContent = "GUARDAR";

  if (error || !data) {
    console.error("Error al guardar precio:", error);
    showPricesMessage(
      "No se pudo guardar. Comprueba que tu sesión sea de administrador.",
      "error"
    );
    return;
  }

  input.value = data.precio;

  showPricesMessage(
    "Precio actualizado correctamente: " + formatPrice(data.precio),
    "success"
  );
}

// =====================================
// INICIAR SESIÓN
// =====================================

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginBtn.disabled = true;
  loginMessage.textContent = "Iniciando sesión...";

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: adminEmail.value.trim(),
    password: adminPassword.value
  });

  if (error) {
    loginMessage.textContent = "Correo o contraseña incorrectos.";
    loginBtn.disabled = false;
    return;
  }

  if (data.user.id !== ADMIN_UID) {
    await supabaseClient.auth.signOut();

    loginMessage.textContent = "No tienes permiso para acceder.";
    loginBtn.disabled = false;
    return;
  }

  adminPassword.value = "";
  loginMessage.textContent = "";

  showAdmin();

  await loadCounter();
  await loadAdminStats();
  await loadProducts();

  loginBtn.disabled = false;
});

// BOTONES CONTADOR

increaseBtn.addEventListener("click", () => {
  changeCounter(1);
});

decreaseBtn.addEventListener("click", () => {
  changeCounter(-1);
});

// =====================================
// CERRAR SESIÓN
// =====================================

logoutBtn.addEventListener("click", async () => {
  await closeAdminVisitors();

  await supabaseClient.auth.signOut();

  showLogin();
  loginForm.reset();

  counterMessage.textContent = "";
  pricesList.replaceChildren();
  showPricesMessage("");
});

// =====================================
// COMPROBAR SESIÓN
// =====================================

async function checkSession() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error || !data.session) {
    showLogin();
    return;
  }

  if (data.session.user.id !== ADMIN_UID) {
    await supabaseClient.auth.signOut();
    showLogin();
    return;
  }

  showAdmin();

  await loadCounter();
  await loadAdminStats();
  await loadProducts();
}

// INICIAR PANEL

checkSession();
