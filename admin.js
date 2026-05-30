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
  
  // Limpa o ficheiro selecionado caso estivesse algum
  const fileInput = document.getElementById("imageFile");
  if(fileInput) fileInput.value = "";

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
  
  // Limpa o campo do ficheiro do PC
  const fileInput = document.getElementById("imageFile");
  if(fileInput) fileInput.value = "";
  
  editingProductId = null;
  addButton.textContent = "Adicionar Produto";
  cancelBtn.style.display = "none";
}

if (cancelBtn) {
  cancelBtn.addEventListener("click", resetForm);
}

addButton.addEventListener("click", async () => {
  // 1. Recolhe os valores
  const name = document.getElementById("name").value;
  const sku = document.getElementById("sku").value;
  const sizes = document.getElementById("sizes").value;
  const oldPrice = document.getElementById("oldPrice").value;
  const price = document.getElementById("price").value;
  const category = document.getElementById("category").value;
  
  let imageUrl = document.getElementById("image").value; // O URL manual
  const fileInput = document.getElementById("imageFile");
  const imageFile = fileInput ? fileInput.files[0] : null; // O ficheiro do PC (se existir)

  // Validação
  if (!name || !sku || !price || !sizes) {
    alert("Por favor, preenche os campos obrigatórios (Nome, SKU, Tamanhos e Preço)!");
    return;
  }

  // Previne cliques duplos e avisa que está a carregar
  const originalBtnText = addButton.textContent;
  addButton.textContent = "A guardar...";
  addButton.disabled = true;

  try {
    // 2. Se o utilizador escolheu um ficheiro do PC, fazemos o upload para o Supabase
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`; // Gera nome aleatório

      // Faz upload para a pasta 'imagens' do Storage
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('imagens')
        .upload(fileName, imageFile);

      if (uploadError) {
        alert("Erro ao fazer upload da imagem: " + uploadError.message);
        addButton.textContent = originalBtnText;
        addButton.disabled = false;
        return;
      }

      // Vai buscar o link oficial da imagem gerada
      const { data: publicUrlData } = supabaseClient.storage
        .from('imagens')
        .getPublicUrl(fileName);

      // Substitui o URL manual pelo URL verdadeiro do ficheiro!
      imageUrl = publicUrlData.publicUrl;
    }

    // 3. Constrói o objeto do produto com a imagem correta
    const productData = {
      name: name,
      sku: sku,
      sizes: sizes,
      old_price: oldPrice ? parseFloat(oldPrice) : null,
      price: parseFloat(price),
      image: imageUrl,
      category: category
    };

    // 4. Guarda ou atualiza na Base de Dados
    if (editingProductId) {
      const { error } = await supabaseClient
        .from("products")
        .update(productData)
        .eq("id", editingProductId);
      
      if(error) throw error;
      alert("Produto atualizado com sucesso!");
    } else {
      const { error } = await supabaseClient
        .from("products")
        .insert([productData]);

      if(error) throw error;
      alert("Produto adicionado com sucesso!");
    }

    resetForm();
    loadAdminProducts();

  } catch (error) {
    alert("Ocorreu um erro ao guardar. Vê a consola para mais detalhes.");
    console.log(error);
  } finally {
    // Restaura o botão
    addButton.textContent = originalBtnText;
    addButton.disabled = false;
  }
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
