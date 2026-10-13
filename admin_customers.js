const API="/giftora/backend/admin/customers.php", 
body=document.getElementById("customersBody"), 
message=document.getElementById("message");

let customers=[];

function esc(v){
    return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}
        [c]));
    }

function msg(t){
    message.textContent=t;message.className="message show error";
}

async function load(){
    try{const r=await fetch(API,
        {credentials:"same-origin",cache:"no-store"});
        const raw=await r.text();
        let d;
        try{d=JSON.parse(raw)}
        catch{throw Error("Server returned non-JSON. Check the PHP API.")}
        if(r.status===401){location.href="/giftora/admin_login.html";
            return}
            if(!r.ok||d.success===false)throw Error(d.message||"Could not load customers");
            customers=d.customers||[];
            render()}catch(e){msg(e.message);
                body.innerHTML='<tr><td colspan="6" class="empty">Could not load customers.</td></tr>';
            }
        }

function render(){
    const q=document.getElementById("search").value.toLowerCase().trim(),list=customers.filter(c=>[c.FullName,c.Email,c.MobileNo,c.ShippingAddress].join(" ").toLowerCase().includes(q));
    body.innerHTML=list.length?list.map(c=>`<tr><td>${c.CustomerID}</td>
        <td>${esc(c.FullName)}</td>
        <td>${esc(c.Email)}</td>
        <td>${esc(c.MobileNo||"—")}</td>
        <td>${esc(c.ShippingAddress||"—")}</td>
        <td>${esc(c.CreatedAt||"—")}</td>
        </tr>`).join(""):'<tr><td colspan="6" class="empty">No customers found.</td></tr>';
    }

document.getElementById("search").addEventListener("input",render);
load();
