const API = "/giftora/backend/admin/products.php";
const CAT_API = "/giftora/backend/admin/categories.php";
const form = document.getElementById("productForm");
const body = document.getElementById("productsBody");
const message = document.getElementById("message");
let products = [];


const lowStockOnly =
  new URLSearchParams(window.location.search)
    .get("filter") === "low-stock";


function showMessage(text, type="success") {
  message.textContent = text; message.className = "message show " + type;
  window.scrollTo({top:0,behavior:"smooth"});
}
async function readJson(response) {
  const raw = await response.text();
  try { return JSON.parse(raw); }
  catch { throw new Error("The server returned a non-JSON response. Check the PHP error log and API URL."); }
}

async function api(url, options={}) {
  const response = await fetch(url, {credentials:"same-origin", cache:"no-store", ...options});
  const data = await readJson(response);
  if (response.status === 401) 
    { window.location.href="/giftora/admin_login.html"; throw new Error("Admin login required."); }
  if (!response.ok || data.success === false) 
    throw new Error(data.message || "Request failed.");
  return data;
}

function money(value) 
{ return "LKR " + Number(value || 0).toLocaleString("en-LK",{minimumFractionDigits:2,maximumFractionDigits:2}); }
async function loadCategories(selected="") {
  const data = await api(CAT_API);
  const select = document.getElementById("categoryId");
  select.innerHTML = '<option value="">Select category</option>' + data.categories.map(c=>`<option value="${c.CategoryID}">${escapeHtml(c.Name)}</option>`).join("");
  if (selected) select.value = String(selected);
}

function escapeHtml(v) { return String(v ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

function render() {
  const q = document.getElementById("search").value
    .toLowerCase()
    .trim();

  // When opened from the dashboard, show only low-stock products.
  const stockFiltered = lowStockOnly
    ? products.filter(p => Number(p.StockQuantity) <= 5)
    : products;

  // Preserve the existing search feature.
  const filtered = stockFiltered.filter(p =>
    [
      p.Title,
      p.Name,
      p.CategoryName,
      p.Description
    ].join(" ").toLowerCase().includes(q)
  );

  if (!filtered.length) {
    body.innerHTML =
      '<tr><td colspan="7" class="empty">No products found.</td></tr>';
    return;
  }

  body.innerHTML = filtered.map(p => `
    <tr>
      <td>${escapeHtml(p.ProductID)}</td>
      <td>
        <strong>${escapeHtml(p.Title)}</strong>
        <div class="muted">${escapeHtml(p.Description || "")}</div>
      </td>
      <td>${escapeHtml(p.CategoryName || "—")}</td>
      <td>${money(p.Price)}</td>
      <td>${escapeHtml(p.StockQuantity)}</td>
      <td>${Number(p.Customizable) ? "Yes" : "No"}</td>
      <td>
        <div class="rowactions">
          <button class="btn small" data-edit="${p.ProductID}">Edit</button>
          <button class="btn danger small" data-delete="${p.ProductID}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}


async function loadProducts() {
  try { const data = await api(API); products = data.products || []; render(); }
  catch(e) 
  { showMessage(e.message,"error"); body.innerHTML='<tr><td colspan="7" class="empty">Could not load products.</td></tr>'; }
}

function resetForm() {
  form.reset(); document.getElementById("productId").value="";
  form.elements.action.value="create"; document.getElementById("formTitle").textContent="Add a product";
  document.getElementById("saveButton").textContent="Save product"; document.getElementById("cancelEdit").hidden=true;
}

form.addEventListener("submit", async e=>{
  e.preventDefault(); message.className="message";
  const fd = new FormData(form);
  if (!document.getElementById("customizable").checked) fd.set("customizable","0");
  try {
    const data = await api(API,{method:"POST",body:fd});
    showMessage(data.message || "Product saved."); resetForm(); await loadProducts();
  } catch(err) { showMessage(err.message,"error"); }
});

body.addEventListener("click", async e=>{
  const edit = e.target.closest("[data-edit]");
  const del = e.target.closest("[data-delete]");
  if (edit) {
    const p = products.find(x=>String(x.ProductID)===edit.dataset.edit); if(!p) return;
    form.elements.action.value="update"; document.getElementById("productId").value=p.ProductID;
    document.getElementById("title").value=p.Title || ""; document.getElementById("price").value=p.Price;
    document.getElementById("stock").value=p.StockQuantity; document.getElementById("imageUrl").value=p.ImageURL || "";
    document.getElementById("description").value=p.Description || ""; document.getElementById("customizable").checked=Number(p.Customizable)===1;
    await loadCategories(p.CategoryID); document.getElementById("formTitle").textContent="Edit product #" + p.ProductID;
    document.getElementById("saveButton").textContent="Update product"; document.getElementById("cancelEdit").hidden=false;
    window.scrollTo({top:0,behavior:"smooth"});
  }
  if (del) {
    const p = products.find(x=>String(x.ProductID)===del.dataset.delete); if(!p) return;
    if (!confirm(`Delete "${p.Title}"? If this product belongs to an existing order, the database may prevent deletion.`)) return;
    const fd=new FormData(); fd.set("action","delete"); fd.set("product_id",p.ProductID);
    try { const d=await api(API,{method:"POST",body:fd}); showMessage(d.message || "Product deleted."); await loadProducts(); }
    catch(err) { showMessage(err.message,"error"); }
  }
});

document.getElementById("cancelEdit").addEventListener("click",()=>{resetForm();loadCategories().catch(e=>showMessage(e.message,"error"));});
document.getElementById("search").addEventListener("input",render);
loadCategories().then(loadProducts).catch(e=>showMessage(e.message,"error"));
