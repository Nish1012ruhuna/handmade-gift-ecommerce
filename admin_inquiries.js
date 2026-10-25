// ========================================
// GIFTORA - ADMIN CUSTOMER INQUIRIES
// ========================================

const API_URL = "/giftora/backend/api/admin/order_inquiries.php";

const tableBody = document.getElementById("inquiriesTableBody");
const messageBox = document.getElementById("message");
const searchInput = document.getElementById("search");

const params = new URLSearchParams(window.location.search);
const customerID = params.get("customer_id");

let allInquiries = [];

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(String(value).replace(" ", "T"));

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString("en-LK", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function showMessage(text, type = "") {
    messageBox.textContent = text;
    messageBox.className = "message";

    if (text) {
        messageBox.classList.add("show");

        if (type) {
            messageBox.classList.add(type);
        }
    }
}

function renderInquiries() {
    const query = searchInput.value.trim().toLowerCase();

    const filtered = allInquiries.filter(inquiry => {
        const searchable = [
            inquiry.InquiryID,
            inquiry.CustomerID,
            inquiry.OrderID,
            inquiry.Subject,
            inquiry.Message,
            inquiry.AdminReply,
            inquiry.InquiryStatus,
            inquiry.CreatedAt
        ].join(" ").toLowerCase();

        return searchable.includes(query);
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty">
                    No matching inquiries found.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filtered.map(inquiry => {
        const replied = Boolean(
            String(inquiry.AdminReply ?? "").trim()
        );

        return `
            <tr>
                <td>#${escapeHTML(inquiry.InquiryID)}</td>

                <td>
                    <a href="admin_inquiries.html?customer_id=${encodeURIComponent(inquiry.CustomerID)}">
                        #${escapeHTML(inquiry.CustomerID)}
                    </a>
                </td>

                <td>#${escapeHTML(inquiry.OrderID)}</td>

                <td>${escapeHTML(inquiry.Subject)}</td>

                <td>
                    <div class="inquiry-message">
                        ${escapeHTML(inquiry.Message)}
                    </div>
                </td>

                <td>
                    <div class="reply-text">
                        ${replied
                            ? escapeHTML(inquiry.AdminReply)
                            : '<span class="muted">No reply yet.</span>'}
                    </div>

                    <form class="reply-box reply-form"
                          data-inquiry-id="${escapeHTML(inquiry.InquiryID)}">

                        <textarea
                            name="reply"
                            maxlength="5000"
                            required
                            placeholder="${replied
                                ? "Write an updated reply..."
                                : "Type your reply to this customer..."}"
                        ></textarea>

                        <button type="submit" class="btn small">
                            ${replied ? "Update Reply" : "Send Reply"}
                        </button>
                    </form>
                </td>

                <td>
                    <span class="pill ${
                        replied ? "status-replied" : "status-open"
                    }">
                        ${escapeHTML(inquiry.InquiryStatus || "Open")}
                    </span>
                </td>

                <td>${escapeHTML(formatDate(inquiry.CreatedAt))}</td>

                <td>${escapeHTML(formatDate(inquiry.RepliedAt))}</td>
            </tr>
        `;
    }).join("");
}

async function loadInquiries() {
    tableBody.innerHTML = `
        <tr>
            <td colspan="9" class="empty">Loading inquiries...</td>
        </tr>
    `;

    showMessage("");

    try {
        const url = new URL(API_URL, window.location.origin);
        url.searchParams.set("all", "1");

        if (customerID !== null) {
            if (!/^[1-9]\d*$/.test(customerID)) {
                throw new Error("Invalid customer ID in the page URL.");
            }

            url.searchParams.set("customer_id", customerID);
            document.getElementById("pageSubtitle").textContent =
                `Viewing inquiries for Customer #${customerID}.`;
        }

        const response = await fetch(url, {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store"
        });

        if (response.status === 401) {
            window.location.href = "/giftora/admin_login.html";
            return;
        }

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Unable to load inquiries."
            );
        }

        allInquiries = result.inquiries || [];
        renderInquiries();

        showMessage(
            `Loaded ${allInquiries.length} inquiry/inquiries.`,
            "success"
        );

    } catch (error) {
        console.error("Load inquiries error:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty">
                    Unable to load inquiries.
                </td>
            </tr>
        `;

        showMessage(error.message, "error");
    }
}

// Handle reply forms without adding a separate listener to every row.
tableBody.addEventListener("submit", async function (event) {
    const form = event.target.closest(".reply-form");

    if (!form) return;

    event.preventDefault();

    const inquiryID = form.dataset.inquiryId;
    const textarea = form.querySelector('textarea[name="reply"]');
    const button = form.querySelector('button[type="submit"]');
    const reply = textarea.value.trim();

    if (!reply) {
        showMessage("Please write a reply before sending.", "error");
        return;
    }

    button.disabled = true;
    button.textContent = "Sending...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            credentials: "same-origin",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                inquiryID: Number(inquiryID),
                reply: reply
            })
        });

        if (response.status === 401) {
            window.location.href = "/giftora/admin_login.html";
            return;
        }

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to save reply.");
        }

        showMessage("Reply saved successfully!", "success");

        // Reload so the saved reply and status appear in the table.
        await loadInquiries();

    } catch (error) {
        console.error("Send reply error:", error);
        showMessage(error.message || "Unable to save reply.", "error");

        button.disabled = false;
        button.textContent = "Send Reply";
    }
});

searchInput.addEventListener("input", renderInquiries);

loadInquiries();