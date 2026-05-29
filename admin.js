async function checkAuth() {

  const {

    data: { session }

  } = await supabaseClient.auth.getSession();

  if(!session) {

    window.location.href = "/stock/login.html";

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

});

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {

  await supabaseClient.auth.signOut();

  window.location.href = "/archive-site/login.html";

});