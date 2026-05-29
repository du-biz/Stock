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

addButton.addEventListener("click", async () => {

  const product = {

    name: document.getElementById("name").value,

    sku: document.getElementById("sku").value,

    sizes: document.getElementById("sizes").value,

    old_price: document.getElementById("oldPrice").value,

    price: document.getElementById("price").value,

    image: document.getElementById("image").value,

    category: document.getElementById("category").value

  };

  const { error } = await supabaseClient
    .from("products")
    .insert([product]);

  if(error) {
    alert("Erro");
    console.log(error);
    return;
  }

  alert("Produto adicionado");
  loadAdminProducts();

});

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {

  await supabaseClient.auth.signOut();

  window.location.href = "/stock/login.html";

});

// Função para carregar e mostrar a lista de produtos no painel
async function loadAdminProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order('id', { ascending: false }); // Mostra os mais recentes primeiro

  if (error) {
    console.log(error);
    return;
  }

  const list = document.getElementById("adminProductList");
  
  list.innerHTML = data.map(item => `
    <div class="admin-item">
      <div class="admin-item-info">
        <strong>${item.name}</strong>
        <span>SKU: ${item.sku} | Tamanhos: ${item.sizes}</span>
      </div>
      <div class="admin-item-actions">
        <button class="btn-edit" onclick="updateSizes('${item.id}', '${item.sizes}')">📝</button>
        <button class="btn-delete" onclick="deleteProduct('${item.id}')">🗑️</button>
      </div>
    </div>
  `).join("");
}

// Função para Eliminar
window.deleteProduct = async function(id) {
  // Pede confirmação antes de apagar
  if (!confirm("Tens a certeza que queres eliminar este produto?")) return;

  const { error } = await supabaseClient
    .from("products")
    .delete()
    .eq("id", id); // Apaga o produto onde o ID for igual a este

  if (error) {
    alert("Erro ao eliminar o produto.");
    console.log(error);
    return;
  }

  loadAdminProducts();
};

window.updateSizes = async function(id, currentSizes) {
  const newSizes = prompt("Atualiza os tamanhos e stock (ex: 42 (2),43 (1)):", currentSizes);

  if (newSizes === null || newSizes === currentSizes) return;

  const { error } = await supabaseClient
    .from("products")
    .update({ sizes: newSizes })
    .eq("id", id);

  if (error) {
    alert("Erro ao atualizar o stock.");
    console.log(error);
    return;
  }

  loadAdminProducts();
};

loadAdminProducts();
