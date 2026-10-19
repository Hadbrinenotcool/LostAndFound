// prog.js - Lost & Found

const STORAGE_KEY = "lostfound_items";

// ---------- Storage functions ----------

function getItems() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Gagal membaca localStorage:", error);
        return [];
    }
}

function saveItems(items) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        console.error("Gagal menyimpan ke localStorage:", error);
        alert("Data gagal disimpan.");
    }
}

function addItem(item) {
    const items = getItems();
    items.push(item);
    saveItems(items);
}

function deleteItem(id) {
    saveItems(getItems().filter(item => item.id !== id));
    renderItems();
}

// ---------- Style kartu ----------

function injectCardStyles() {
    if (document.getElementById("lf-card-styles")) return;

    const style = document.createElement("style");
    style.id = "lf-card-styles";
    style.textContent = `
        .item-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
        }
        .lf-card {
            display: flex;
            flex-direction: column;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
            transition: transform .15s ease, box-shadow .15s ease;
            text-align: left;
        }
        .lf-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
        }
        .lf-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 8px;
        }
        .lf-card-title {
            margin: 0;
            font-size: 1.1rem;
            color: #111827;
            word-break: break-word;
        }
        .lf-badge {
            flex-shrink: 0;
            background: #dcfce7;
            color: #166534;
            font-size: .72rem;
            font-weight: 600;
            padding: 3px 8px;
            border-radius: 999px;
        }
        .lf-card-desc {
            margin: 0 0 12px;
            color: #4b5563;
            font-size: .92rem;
            line-height: 1.45;
            word-break: break-word;
        }
        .lf-card-meta {
            list-style: none;
            margin: 0 0 14px;
            padding: 10px 0 0;
            border-top: 1px solid #f0f1f3;
            font-size: .86rem;
            color: #374151;
        }
        .lf-card-meta li {
            display: flex;
            gap: 8px;
            margin-bottom: 6px;
            word-break: break-word;
        }
        .lf-card-actions {
            display: flex;
            gap: 8px;
            margin-top: auto;
        }
        .lf-btn {
            flex: 1;
            text-align: center;
            text-decoration: none;
            cursor: pointer;
            border: none;
            border-radius: 8px;
            padding: 8px 10px;
            font-size: .85rem;
            font-weight: 600;
        }
        .lf-btn-contact { background: #22c55e; color: #fff; }
        .lf-btn-contact:hover { background: #16a34a; }
        .lf-btn-delete { background: #ef4444; color: #fff; }
        .lf-btn-delete:hover { background: #dc2626; }
        .lf-empty {
            grid-column: 1 / -1;
            text-align: center;
            color: #6b7280;
            padding: 24px;
            border: 2px dashed #d1d5db;
            border-radius: 12px;
        }
    `;
    document.head.appendChild(style);
}

// ---------- Helper ----------

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

// Ubah 0812... menjadi 62812... untuk link WhatsApp
function toWhatsAppNumber(number) {
    const digits = number.replace(/\D/g, "");
    return digits.startsWith("0") ? "62" + digits.slice(1) : digits;
}

// ---------- Kartu laporan, lol ----------

function createItemCard(item) {
    const waLink = "https://wa.me/" + toWhatsAppNumber(item.nomor);

    return `
        <article class="lf-card">
            <div class="lf-card-header">
                <h3 class="lf-card-title">${escapeHTML(item.nama)}</h3>
                <span class="lf-badge">Ditemukan</span>
            </div>

            <p class="lf-card-desc">${escapeHTML(item.deskripsi)}</p>

            <ul class="lf-card-meta">
                <li><span>📍</span><span>${escapeHTML(item.lokasi)}</span></li>
                <li><span>📅</span><span>${escapeHTML(formatDate(item.tanggal))}</span></li>
                <li><span>📞</span><span>${escapeHTML(item.nomor)}</span></li>
            </ul>

            <div class="lf-card-actions">
                <a class="lf-btn lf-btn-contact" href="${escapeHTML(waLink)}"
                   target="_blank" rel="noopener">Hubungi</a>
                <button class="lf-btn lf-btn-delete" type="button"
                        data-id="${escapeHTML(item.id)}"
                        aria-label="Hapus laporan ${escapeHTML(item.nama)}">Hapus</button>
            </div>
        </article>
    `;
}

function renderItems() {
    const list = document.getElementById("itemlist");
    const items = getItems();

    if (items.length === 0) {
        list.innerHTML = `<div class="lf-empty">Belum ada barang yang dilaporkan.</div>`;
        return;
    }

    // Terbaru di atas
    list.innerHTML = items.slice().reverse().map(createItemCard).join("");
}

// ---------- Event handlers ----------

function handleSubmit(event) {
    event.preventDefault();

    const item = {
        id: Date.now().toString(),
        nama: document.getElementById("namabarang").value.trim(),
        deskripsi: document.getElementById("deskripsibarang").value.trim(),
        lokasi: document.getElementById("lokasifound").value.trim(),
        tanggal: document.getElementById("tanggalfound").value,
        nomor: document.getElementById("nomorpelapor").value.trim()
    };

    addItem(item);
    renderItems();
    event.target.reset();
}

function handleListClick(event) {
    const button = event.target.closest("button[data-id]");
    if (!button) return;

    if (confirm("Hapus laporan ini?")) {
        deleteItem(button.dataset.id);
    }
}

// ---------- Init ----------

document.addEventListener("DOMContentLoaded", () => {
    injectCardStyles();
    document.getElementById("formfound").addEventListener("submit", handleSubmit);
    document.getElementById("itemlist").addEventListener("click", handleListClick);
    renderItems();
});