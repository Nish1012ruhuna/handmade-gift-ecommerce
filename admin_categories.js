const API="/giftora/backend/admin/categories.php", 
form=document.getElementById("categoryForm"), 
body=document.getElementById("categoriesBody"), 
message=document.getElementById("message"); 

let categories=[];

function esc(v){
    return String(v??"").replace(/[&<>"']/g,c=>({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }
    [c]));
}

function msg(t,type="success"){
    message.textContent=t;message.className="message show "+type;window.scrollTo(
        {top:0,behavior:"smooth"});
    }

async function api(url,opt={}){
    const r=await fetch(url,{credentials:"same-origin",cache:"no-store",...opt});
    const raw=await r.text();
    let d;
    try{d=JSON.parse(raw)}
    catch{
        throw Error("Server returned a non-JSON response. Check the PHP file and API path.")
    }
    if(r.status===401){
        location.href="/giftora/admin_login.html";
        throw Error("Admin login required.")
    }
    if(!r.ok||d.success===false)
        throw Error(d.message||"Request failed.");
    return d;
}

function render(){
    body.innerHTML=categories.length?categories.map(c=>`<tr>
        <td>${c.CategoryID}</td>
        <td><strong>${esc(c.Name)}</strong></td>
        <td>${esc(c.Description||"—")}</td>
        <td>${c.ProductCount}</td>
        <td>
        <div class="rowactions"><button class="btn small" data-edit="${c.CategoryID}">Edit</button><button class="btn danger small" data-delete="${c.CategoryID}">Delete</button>
        </div>
        </td>
        </tr>`
    ).join(""):'<tr><td colspan="5" class="empty">No categories found.</td></tr>';
}

async function load(){
    try{categories=(await api(API)).categories||[];render()}
    catch(e){msg(e.message,"error");}
}

function reset(){
    form.reset();
    form.elements.action.value="create";
    document.getElementById("categoryId").value="";
    document.getElementById("formTitle").textContent="Add a category";
    document.getElementById("saveButton").textContent="Save category";
    document.getElementById("cancelEdit").hidden=true;
}

form.addEventListener("submit",async e=>{e.preventDefault();
    const fd=new FormData(form);
    try{const d=await api(API,{method:"POST",body:fd});
    msg(d.message||"Category saved.");
    reset();
    load()}catch(err){msg(err.message,"error")}
});

document.getElementById("cancelEdit").addEventListener("click",reset);
body.addEventListener("click",async e=>{const eb=e.target.closest("[data-edit]"),db=e.target.closest("[data-delete]");
    if(eb){const c=categories.find(x=>String(x.CategoryID)===eb.dataset.edit);
        if(!c)
            return;
        form.elements.action.value="update";
        document.getElementById("categoryId").value=c.CategoryID;
        document.getElementById("name").value=c.Name;
        document.getElementById("description").value=c.Description||"";
        document.getElementById("formTitle").textContent="Edit category #"+c.CategoryID;
        document.getElementById("saveButton").textContent="Update category";
        document.getElementById("cancelEdit").hidden=false;
        window.scrollTo({top:0,behavior:"smooth"});
    }
    if(db){const c=categories.find(x=>String(x.CategoryID)===db.dataset.delete);
        if(!c)return;
        if(!confirm(`Delete category "${c.Name}"? Categories used by products cannot be deleted.`))return;
        const fd=new FormData();
        fd.set("action","delete");
        fd.set("category_id",c.CategoryID);
        try{const d=await api(API,{method:"POST",body:fd});
        msg(d.message||"Category deleted.");
        load()
    }
    catch(err){msg(err.message,"error")}}}
);

load();
