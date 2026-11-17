
/* =================================
   YESID RECARGAS - ADMINISTRADOR
================================= */

const SUPABASE_URL =
  "https://kmjzhugxgbccgovzlkzl.supabase.co";

const SUPABASE_KEY = "sb_publishable_xzqywVnEtHKcpX40eX-IEw_lwTvUTSJ";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ELEMENTOS

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const ordersContainer = document.getElementById("ordersContainer");

const totalOrders = document.getElementById("totalOrders");
const pendingOrders = document.getElementById("pendingOrders");
const completedOrders = document.getElementById("completedOrders");

const logoutButton = document.getElementById("logoutButton");
const refreshOrders = document.getElementById("refreshOrders");

const statuses = [
  { value: "pending", label: "Pendiente de pago", color: "pending" },
  { value: "paid", label: "Pago confirmado", color: "paid" },
  { value: "completed", label: "Completado", color: "completed" },
  { value: "cancelled", label: "Cancelado", color: "cancelled" }
];

function formatPrice(price) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(price);
}

function showLoginMessage(message) {
  loginMessage.textContent = message;
}

function showDashboard() {
  loginSection.hidden = true;
  dashboardSection.hidden = false;
}

function showLogin() {
  loginSection.hidden = false;
  dashboardSection.hidden = true;
}

// INICIAR SESIÓN

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;
  const button = loginForm.querySelector("button");

  button.disabled = true;
  button.textContent = "Ingresando...";
  showLoginMessage("");

  try {
    const { error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    showDashboard();
    await loadOrders();

  } catch (error) {
    console.error(error);
    showLoginMessage(error.message);
  } finally {
    button.disabled = false;
    button.textContent = "Iniciar sesión";
  }
});

// CERRAR SESIÓN

logoutButton.addEventListener("click", async () => {
  const { error } = await db.auth.signOut();

  if (error) {
    alert("No se pudo cerrar la sesión.");
    return;
  }

  showLogin();
  ordersContainer.textContent = "";
  loginForm.reset();
});

// CARGAR PEDIDOS

async function loadOrders() {
  ordersContainer.textContent = "Cargando pedidos...";
  refreshOrders.disabled = true;

  try {
    const { data, error } = await db.rpc("admin_get_orders");

    if (error) throw error;

    const orders = data || [];

    totalOrders.textContent = orders.length;

    pendingOrders.textContent = orders.filter(
      order => order.status === "pending"
    ).length;

    completedOrders.textContent = orders.filter(
      order => order.status === "completed"
    ).length;

    renderOrders(orders);

  } catch (error) {
    console.error(error);
    ordersContainer.textContent =
      "No se pudieron cargar los pedidos. Comprueba tus permisos.";
  } finally {
    refreshOrders.disabled = false;
  }
}

// MENÚ PERSONALIZADO

function createStatusMenu(currentStatus) {
  let selectedStatus = currentStatus;

  const wrapper = document.createElement("div");
  wrapper.className = "yr-status-wrapper";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "yr-status-trigger";

  const optionsBox = document.createElement("div");
  optionsBox.className = "yr-status-options";
  optionsBox.hidden = true;

  function updateTrigger() {
    const selected = statuses.find(
      item => item.value === selectedStatus
    ) || statuses[0];

    trigger.textContent = selected.label + "  ▾";
    trigger.className =
      "yr-status-trigger status-" + selected.color;
  }

  statuses.forEach(status => {
    const option = document.createElement("button");

    option.type = "button";
    option.className = "yr-status-option status-" + status.color;
    option.textContent = status.label;

    option.addEventListener("click", () => {
      selectedStatus = status.value;
      updateTrigger();
      optionsBox.hidden = true;
    });

    optionsBox.appendChild(option);
  });

  trigger.addEventListener("click", () => {
    const willOpen = optionsBox.hidden;

    optionsBox.hidden = !willOpen;

    if (willOpen) {
      const rect = trigger.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const menuHeight = 190;

      if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
        optionsBox.classList.add("yr-open-up");
      } else {
        optionsBox.classList.remove("yr-open-up");
      }
    } else {
      optionsBox.classList.remove("yr-open-up");
    }
  });

  wrapper.addEventListener("click", event => {
    event.stopPropagation();
  });

  document.addEventListener("click", () => {
    optionsBox.hidden = true;
  });

  updateTrigger();

  wrapper.append(trigger, optionsBox);

  return {
    element: wrapper,
    getValue: () => selectedStatus
  };
}

// BUSCADOR Y FILTROS

let cachedOrders = [];
let activeOrderFilter = "all";
let orderSearchTerm = "";

function renderOrders(orders) {
  cachedOrders = orders || [];
  ordersContainer.innerHTML = "";

  if (cachedOrders.length === 0) {
    ordersContainer.textContent = "Todavía no tienes pedidos.";
    return;
  }

  const toolbar = document.createElement("div");
  toolbar.className = "yr-orders-toolbar";

  const search = document.createElement("input");
  search.type = "search";
  search.className = "yr-order-search";
  search.placeholder = "Buscar cliente, ID Free Fire o pedido...";
  search.value = orderSearchTerm;

  const filters = document.createElement("div");
  filters.className = "yr-order-filters";

  const filterOptions = [
    ["all", "Todos"],
    ["pending", "Pendientes"],
    ["paid", "Pagados"],
    ["completed", "Completados"],
    ["cancelled", "Cancelados"]
  ];

  const list = document.createElement("div");
  list.className = "yr-orders-list";

  function drawCards() {
    list.innerHTML = "";

    const filtered = cachedOrders.filter(order => {
      const matchesFilter =
        activeOrderFilter === "all" ||
        order.status === activeOrderFilter;

      const text = orderSearchTerm.toLowerCase();

      const matchesSearch = [
        order.customer_name,
        order.free_fire_id,
        order.order_id,
        order.product_name
      ].some(value =>
        String(value ?? "").toLowerCase().includes(text)
      );

      return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
      list.textContent = "No se encontraron pedidos.";
      return;
    }

    filtered.forEach(order => {
      const card = document.createElement("article");
      card.className = "admin-order-card";

      const title = document.createElement("h3");
      title.textContent = "Pedido #" + order.order_id;

      const customer = document.createElement("p");
      customer.textContent = "Cliente: " + order.customer_name;

      // ID FREE FIRE Y BOTÓN PARA COPIAR

      const ffid = document.createElement("p");
      ffid.className = "yr-ffid";

      const ffidText = document.createElement("span");
      ffidText.textContent = "ID Free Fire: " + order.free_fire_id;

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "yr-copy-button";
      copyButton.textContent = "▢";
      copyButton.title = "Copiar ID Free Fire";
      copyButton.setAttribute("aria-label", "Copiar ID Free Fire");

      copyButton.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(
            String(order.free_fire_id)
          );

          copyButton.textContent = "✓";

          setTimeout(() => {
            copyButton.textContent = "▢";
          }, 1500);

        } catch (error) {
          alert("No se pudo copiar el ID.");
        }
      });

      ffid.append(ffidText, copyButton);

      const product = document.createElement("p");
      product.textContent = "Producto: " + order.product_name;

      const price = document.createElement("p");
      price.textContent = "Total: " + formatPrice(order.total);

      const tracking = document.createElement("p");
      tracking.textContent = "Código: " + order.tracking_code;

      const date = document.createElement("p");
      date.textContent =
        "Fecha: " + new Date(order.created_at).toLocaleString("es-CO");

      // VER COMPROBANTE

      const proofButton = document.createElement("button");
      proofButton.type = "button";
      proofButton.className = "btn btn-primary";

      const proofImage = document.createElement("img");
      proofImage.hidden = true;
      proofImage.alt = "Comprobante de pago";
      proofImage.style.width = "100%";
      proofImage.style.maxWidth = "350px";
      proofImage.style.display = "block";
      proofImage.style.marginTop = "12px";
      proofImage.style.borderRadius = "10px";

      let proofVisible = false;

      proofButton.textContent = order.proof_path
        ? "Ver comprobante"
        : "Sin comprobante";

      proofButton.disabled = !order.proof_path;

      proofButton.addEventListener("click", async () => {
        if (proofVisible) {
          proofImage.hidden = true;
          proofVisible = false;
          proofButton.textContent = "Ver comprobante";
          return;
        }

        proofButton.disabled = true;
        proofButton.textContent = "Cargando imagen...";

        try {
          const { data, error } = await db.storage
            .from("comprobantes")
            .createSignedUrl(order.proof_path, 300);

          if (error) throw error;

          proofImage.src = data.signedUrl;
          proofImage.hidden = false;
          proofVisible = true;

          proofButton.textContent = "Ocultar comprobante";

        } catch (error) {
          console.error("Error mostrando comprobante:", error);
          alert("No se pudo cargar el comprobante.");
          proofButton.textContent = "Ver comprobante";

        } finally {
          proofButton.disabled = false;
        }
      });

      const statusLabel = document.createElement("label");
      statusLabel.textContent = "Estado del pedido";
      statusLabel.className = "yr-status-label";

      const statusMenu = createStatusMenu(order.status);

      const saveButton = document.createElement("button");
      saveButton.type = "button";
      saveButton.className = "btn btn-primary";
      saveButton.textContent = "Guardar estado";

      const message = document.createElement("p");
      message.className = "yr-status-message";

      saveButton.addEventListener("click", async () => {
        saveButton.disabled = true;
        saveButton.textContent = "Guardando...";
        message.textContent = "";

        try {
          const { error } = await db.rpc("admin_update_order", {
            p_order_id: order.order_id,
            p_status: statusMenu.getValue()
          });

          if (error) throw error;

          message.textContent = "¡Estado actualizado correctamente!";
          await loadOrders();

        } catch (error) {
          console.error(error);
          message.textContent = "No se pudo actualizar el pedido.";
        } finally {
          saveButton.disabled = false;
          saveButton.textContent = "Guardar estado";
        }
      });

      card.append(
        title,
        customer,
        ffid,
        product,
        price,
        tracking,
        date,
        proofButton,
        proofImage,
        statusLabel,
        statusMenu.element,
        saveButton,
        message
      );

      list.appendChild(card);
    });
  }

  search.addEventListener("input", () => {
    orderSearchTerm = search.value;
    drawCards();
  });

  filterOptions.forEach(([value, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.className =
      "yr-filter-btn" +
      (activeOrderFilter === value ? " active" : "");

    button.addEventListener("click", () => {
      activeOrderFilter = value;

      filters.querySelectorAll("button").forEach(btn => {
        btn.classList.remove("active");
      });

      button.classList.add("active");
      drawCards();
    });

    filters.appendChild(button);
  });

  toolbar.append(search, filters);
  ordersContainer.append(toolbar, list);

  drawCards();
}

// ACTUALIZAR PEDIDOS

refreshOrders.addEventListener("click", loadOrders);

// COMPROBAR SESIÓN

async function checkSession() {
  const { data, error } = await db.auth.getSession();

  if (error) {
    showLogin();
    return;
  }

  if (data.session) {
    showDashboard();
    await loadOrders();
  } else {
    showLogin();
  }
}

checkSession();
