const translations = {

  pt: {
    heroTitle: "Sneakers and Clothing Inventory",
    search: "Pesquisar produto...",
    sort: "Ordenar",
    lowHigh: "Preço: Menor → Maior",
    highLow: "Preço: Maior → Menor",
    items: "Items",
    total: "Valor Total",
    sneakers: "Sneakers",
    clothing: "Roupa",
    sku: "SKU",
    sizes: "Tamanhos",
  },

  en: {
    heroTitle: "Sneakers and Clothing Inventory",
    search: "Search product...",
    sort: "Sort",
    lowHigh: "Price: Low → High",
    highLow: "Price: High → Low",
    items: "Items",
    total: "Total Value",
    sneakers: "Sneakers",
    clothing: "Clothing",
    sku: "SKU",
    sizes: "Sizes",
  }

};

let products = {
  sneakers: [],
  clothing: []
};

async function loadProducts() {

  const { data, error } = await supabaseClient
    .from("products")
    .select("*");

  if(error) {
    console.log(error);
    return;
  }

  products = {
    sneakers: [],
    clothing: []
  };

  data.forEach(item => {

    const formatted = {
      ...item,
      sizes: item.sizes.split(",")
    };

    if(item.category === "sneakers") {
      products.sneakers.push(formatted);
    }

    if(item.category === "clothing") {
      products.clothing.push(formatted);
    }

  });

  renderProducts();

}

loadProducts();

let currentLanguage = "pt";

let currentCategory = "sneakers";

const grid = document.getElementById("productGrid");
const tabs = document.querySelectorAll(".tab");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

function updateLanguage() {

  const t = translations[currentLanguage];

  document.querySelector(".hero h1").textContent = t.heroTitle;

  searchInput.placeholder = t.search;

  sortSelect.innerHTML = `
    <option value="default">${t.sort}</option>
    <option value="low-high">${t.lowHigh}</option>
    <option value="high-low">${t.highLow}</option>
  `;

  document.querySelectorAll(".tab")[0].textContent = t.sneakers;
  document.querySelectorAll(".tab")[1].textContent = t.clothing;

  renderProducts();
}

function renderProducts() {

  const t = translations[currentLanguage];

  let items = [...products[currentCategory]];

  const search = searchInput.value.toLowerCase();

  items = items.filter(item =>
    item.name.toLowerCase().includes(search)
  );

  if (sortSelect.value === "low-high") {
    items.sort((a, b) => a.price - b.price);
  }

  if (sortSelect.value === "high-low") {
    items.sort((a, b) => b.price - a.price);
  }

  grid.innerHTML = items.map(item => `

    <div class="card">

      <img src="${item.image}" alt="${item.name}" onclick="openModal('${item.image}')">

      <div class="card-content">

        <h3>${item.name}</h3>

        <p class="info">${t.sku}: ${item.sku}</p>

        <div class="sizes-wrapper">
          <p class="sizes-title">${t.sizes}:</p>

          <div class="sizes">
            ${item.sizes.map(size => `
              <span class="size-badge">${size}</span>
            `).join("")}
          </div>
        </div>

        <div class="price-wrapper">

         <span class="old-price">
          ${item.old_price ? parseFloat(item.old_price).toFixed(2).replace(".", ",") + "€" : ""}
         </span>

          <span class="price">
            ${item.price.toFixed(2).replace(".", ",")}€
          </span>

        </div>

      </div>

    </div>

  `).join("");

}

renderProducts();

searchInput.addEventListener("input", renderProducts);

sortSelect.addEventListener("change", renderProducts);

tabs.forEach(tab => {

  tab.addEventListener("click", () => {

    tabs.forEach(t => t.classList.remove("active"));

    tab.classList.add("active");

    currentCategory = tab.dataset.category;

    renderProducts();

  });

});

const ptBtn = document.getElementById("ptBtn");
const enBtn = document.getElementById("enBtn");

ptBtn.addEventListener("click", () => {

  currentLanguage = "pt";

  ptBtn.classList.add("active-lang");
  enBtn.classList.remove("active-lang");

  updateLanguage();

});

enBtn.addEventListener("click", () => {

  currentLanguage = "en";

  enBtn.classList.add("active-lang");
  ptBtn.classList.remove("active-lang");

  updateLanguage();

});

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {

  if(document.body.classList.contains("light")) {

    document.body.classList.remove("light");

    themeToggle.innerHTML = "🌙";

  } else {

    document.body.classList.add("light");

    themeToggle.innerHTML = "☀️";

  }

});

updateLanguage();
renderProducts();

// Lógica para abrir imagens em grande
const imageModal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");

function openModal(imageSrc) {
  if(modalImg && imageModal) { // Pequena verificação de segurança
    modalImg.src = imageSrc;
    imageModal.style.display = "flex";
  }
}

function closeModal() {
  if(imageModal) {
    imageModal.style.display = "none";
  }
}

// Fechar a imagem se clicar fora
if(imageModal) {
  imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) {
      closeModal();
    }
  });
}
