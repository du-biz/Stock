async function checkAuth() {

  const {

    data: { session }

  } = await supabaseClient.auth.getSession();

  if(!session) {

    window.location.href = "login.html";

  }

}

checkAuth();

const addButton = document.getElementById("addProduct");
const cancelBtn = document.getElementById("cancelEdit");

// Variáveis para sabermos se estamos a editar algum produto
let editingProductId = null;
let allAdminProducts = []; // Guarda os produtos todos para os encontrarmos facilmente

async function loadAdminProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order('id', { ascending: false });

  if (error) {
    console.log(error);
    return;
  }

  allAdminProducts = data; // Guarda na memória
  const list = document.getElementById("adminProductList");
  
  list.innerHTML = data.map(item => `
    <div class="admin-item">
      <div class="admin-item-info">
        <strong>${item.name}</strong>
        <span>SKU: ${item.sku} | Preço: ${item.price}€</span>
      </div>
      <div class="admin-item-actions">
        <button class="btn-edit" onclick="editProduct('${item.id}')">📝</button>
        <button class="btn-delete" onclick="deleteProduct('${item.id}')">🗑️</button>
      </div>
    </div>
  `).join("");
}

window.editProduct = function(id) {
  const product = allAdminProducts.find(p => p.id == id);
  if(!product) return;

  document.getElementById("name").value = product.name;
  document.getElementById("sku").value = product.sku;
  document.getElementById("sizes").value = product.sizes;
  document.getElementById("oldPrice").value = product.old_price || "";
  document.getElementById("price").value = product.price;
  document.getElementById("image").value = product.image;
  document.getElementById("category").value = product.category;

  editingProductId = product.id;
  addButton.textContent = "Guardar Alterações";
  cancelBtn.style.display = "block";
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function resetForm() {
  document.getElementById("name").value = "";
  document.getElementById("sku").value = "";
  document.getElementById("sizes").value = "";
  document.getElementById("oldPrice").value = "";
  document.getElementById("price").value = "";
  document.getElementById("image").value = "";
  document.getElementById("category").value = "sneakers";
  
  editingProductId = null;
  addButton.textContent = "Adicionar Produto";
  cancelBtn.style.display = "none";
}

if (cancelBtn) {
  cancelBtn.addEventListener("click", resetForm);
}

addButton.addEventListener("click", async () => {
  const productData = {
    name: document.getElementById("name").value,
    sku: document.getElementById("sku").value,
    sizes: document.getElementById("sizes").value,
    old_price: document.getElementById("oldPrice").value || null, // Permite preços antigos vazios
    price: document.getElementById("price").value,
    image: document.getElementById("image").value,
    category: document.getElementById("category").value
  };

  if (editingProductId) {
    const { error } = await supabaseClient
      .from("products")
      .update(productData)
      .eq("id", editingProductId);
    
    if(error) { alert("Erro ao atualizar!"); console.log(error); return; }
    alert("Produto atualizado!");

  } else {
    const { error } = await supabaseClient
      .from("products")
      .insert([productData]);

    if(error) { alert("Erro ao adicionar!"); console.log(error); return; }
    alert("Produto adicionado!");
  }

  resetForm();
  loadAdminProducts();
});

window.deleteProduct = async function(id) {
  if (!confirm("Tens a certeza que queres eliminar este produto?")) return;

  const { error } = await supabaseClient.from("products").delete().eq("id", id);
  if (error) { alert("Erro ao eliminar o produto."); return; }

  loadAdminProducts();
};

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
});

loadAdminProducts();

// Lógica do botão de alternar tema no Admin
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    if(document.body.classList.contains("light")) {
      document.body.classList.remove("light"); // Fica escuro
      themeToggle.innerHTML = "☀️"; // Muda o ícone
    } else {
      document.body.classList.add("light"); // Fica claro
      themeToggle.innerHTML = "🌙"; // Muda o ícone
    }
  });
}
