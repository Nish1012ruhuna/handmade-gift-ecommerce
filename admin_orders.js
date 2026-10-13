const API="/giftora/backend/admin/orders.php", 
body=document.getElementById("ordersBody"), 
message=document.getElementById("message");

const statuses=["Pending","Processing","Confirmed","Shipped","Delivered","Cancelled"];

function esc(v){
    return String(v??"").replace(/[&<>"']/g,c=>(
        {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}
    [c])
);
}

function msg(t,type="success"){
    message.textContent=t;message.className="message show "+type;
}

async function api(opt={}){
    const r=await fetch(API,{
        credentials:"same-origin",cache:"no-store",...opt
    }
);
const raw=await r.text();let d;try{d=JSON.parse(raw)}
catch{
    throw Error("Server returned non-JSON. Check the PHP API.")
}
if(r.status===401){
    location.href="/giftora/admin_login.html";throw Error("Admin login required.")
}
if(!r.ok||d.success===false)throw Error(d.message||"Request failed");
return d;
}

function money(v){
    return "LKR "+Number(v||0).toLocaleString("en-LK",{minimumFractionDigits:2,maximumFractionDigits:2});
}

async function load(){
    try{const d=await api();const orders=d.orders||[];
        body.innerHTML=orders.length?orders.map(o=>`<tr><td>#${o.OrderID}</td>
            <td>${esc(o.CustomerName||"Guest")}
            <div class="muted">${esc(o.Email||"")}</div>
            </td>
            <td>${esc(o.OrderDate||"—")}</td>
            <td>${money(o.TotalAmount)}</td>
            <td>${esc(o.DeliveryAddress||"—")}</td>
            <td><span class="pill">${esc(o.Status||"Pending")}</span></td>
            <td>
            <div style="display:flex;gap:6px;min-width:180px">
            <select aria-label="Status for order ${o.OrderID}" id="status-${o.OrderID}">
            ${statuses.map(s=>`<option ${s.toLowerCase()===String(o.Status||"").toLowerCase()?"selected":""} value="${s}">${s}
            </option>`).join("")}
            </select>
            <button class="btn small" data-save="${o.OrderID}">Save</button>
            </div>
            </td>
            </tr>`).join(""):'<tr><td colspan="7" class="empty">No orders found.</td></tr>';}
            catch(e){
                msg(e.message,"error");body.innerHTML='<tr><td colspan="7" class="empty">Could not load orders.</td></tr>';
            }
        }

body.addEventListener("click",async e=>{const b=e.target.closest("[data-save]");
    if(!b)return;
    const fd=new FormData();
    fd.set("action","update_status");
    fd.set("order_id",b.dataset.save);
    fd.set("status",document.getElementById("status-"+b.dataset.save).value);
    try{const d=await api({
        method:"POST",body:fd});
        msg(d.message||"Order status updated.");
        load()}catch(err){msg(err.message,"error")

        }
    }
);

document.getElementById("refresh").addEventListener("click",load);
load();
