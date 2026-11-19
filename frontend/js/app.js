/**
 * app.js — Fleshcard Pro (AI Vocab Master Pro)
 * Standalone & Fullstack Flashcard Web Application
 * Offline-First: file:// va http:// protokollarida 100% tezkor ishlaydi
 */

// ===================================
//  1. MA'LUMOTLAR BAZASI VA SOZLAMALAR
// ===================================

const API_BASE = "/api";
let isBackendAvailable = null;

const LOCAL_DB_KEY = "fleshcard_local_db_v2";
const OLD_LOCAL_DB_KEY = "fleshcard_local_db";

// 200+ Eng ko'p ishlatiladigan so'zlar uchun tezkor lokal lug'at (Offline Dictionary)
const OFFLINE_DICTIONARY = {
    "achieve": { uz: "Erishmoq", phonetic: "/əˈtʃiːv/", pos: "verb" },
    "knowledge": { uz: "Bilim", phonetic: "/ˈnɒl.ɪdʒ/", pos: "noun" },
    "success": { uz: "Muvaffaqiyat", phonetic: "/səkˈses/", pos: "noun" },
    "improve": { uz: "Yaxshilamoq", phonetic: "/ɪmˈpruːv/", pos: "verb" },
    "opportunity": { uz: "Imkoniyat", phonetic: "/ˌɒp.əˈtʃuː.nə.ti/", pos: "noun" },
    "comprehensive": { uz: "Har tomonlama, to'liq", phonetic: "/ˌkɒm.prɪˈhen.sɪv/", pos: "adj" },
    "crucial": { uz: "Juda muhim, hal qiluvchi", phonetic: "/ˈkruː.ʃəl/", pos: "adj" },
    "ability": { uz: "Qobiliyat", phonetic: "/əˈbɪl.ə.ti/", pos: "noun" },
    "accurate": { uz: "Aniq, to'g'ri", phonetic: "/ˈæk.jə.rət/", pos: "adj" },
    "adventure": { uz: "Sarguzasht", phonetic: "/ədˈven.tʃər/", pos: "noun" },
    "advantage": { uz: "Afzallik", phonetic: "/ədˈvɑːn.tɪdʒ/", pos: "noun" },
    "amazing": { uz: "Ajoyib, hayratlanarli", phonetic: "/əˈmeɪ.zɪŋ/", pos: "adj" },
    "ambition": { uz: "Maqsad, intilish", phonetic: "/æmˈbɪʃ.ən/", pos: "noun" },
    "ancient": { uz: "Qadimiy", phonetic: "/ˈeɪn.ʃənt/", pos: "adj" },
    "apple": { uz: "Olma", phonetic: "/ˈæp.əl/", pos: "noun" },
    "approach": { uz: "Yondashuv", phonetic: "/əˈprəʊtʃ/", pos: "noun" },
    "art": { uz: "San'at", phonetic: "/ɑːt/", pos: "noun" },
    "attitude": { uz: "Munosabat", phonetic: "/ˈæt.ɪ.tʃuːd/", pos: "noun" },
    "beautiful": { uz: "Chiroyli, go'zal", phonetic: "/ˈbjuː.tɪ.fəl/", pos: "adj" },
    "benefit": { uz: "Foyda", phonetic: "/ˈben.ɪ.fɪt/", pos: "noun" },
    "book": { uz: "Kitob", phonetic: "/bʊk/", pos: "noun" },
    "brave": { uz: "Jasur, qo'rqmas", phonetic: "/breɪv/", pos: "adj" },
    "bright": { uz: "Yorug', aqlli", phonetic: "/braɪt/", pos: "adj" },
    "business": { uz: "Biznes, ish", phonetic: "/ˈbɪz.nɪs/", pos: "noun" },
    "challenge": { uz: "Qiyinchilik, sinov", phonetic: "/ˈtʃæl.ɪndʒ/", pos: "noun" },
    "change": { uz: "O'zgarish, o'zgartirmoq", phonetic: "/tʃeɪndʒ/", pos: "verb" },
    "choose": { uz: "Tanlamoq", phonetic: "/tʃuːz/", pos: "verb" },
    "city": { uz: "Shahar", phonetic: "/ˈsɪt.i/", pos: "noun" },
    "clear": { uz: "Aniq, tiniq", phonetic: "/klɪər/", pos: "adj" },
    "communication": { uz: "Muloqot", phonetic: "/kəˌmjuː.nɪˈkeɪ.ʃən/", pos: "noun" },
    "community": { uz: "Hamjamiyat", phonetic: "/kəˈmjuː.nə.ti/", pos: "noun" },
    "confident": { uz: "O'ziga ishongan", phonetic: "/ˈkɒn.fɪ.dənt/", pos: "adj" },
    "connect": { uz: "Ulamoq, bog'lamoq", phonetic: "/kəˈnekt/", pos: "verb" },
    "country": { uz: "Mamlakat", phonetic: "/ˈkʌn.tri/", pos: "noun" },
    "courage": { uz: "Jasorat", phonetic: "/ˈkʌr.ɪdʒ/", pos: "noun" },
    "create": { uz: "Yaratmoq", phonetic: "/kriˈeɪt/", pos: "verb" },
    "culture": { uz: "Madaniyat", phonetic: "/ˈkʌl.tʃər/", pos: "noun" },
    "curious": { uz: "Qiziquvchan", phonetic: "/ˈkjʊə.ri.əs/", pos: "adj" },
    "decision": { uz: "Qaror", phonetic: "/dɪˈsɪʒ.ən/", pos: "noun" },
    "describe": { uz: "Tasvirlamoq", phonetic: "/dɪˈskraɪb/", pos: "verb" },
    "determine": { uz: "Aniqlamoq, ahd qilmoq", phonetic: "/dɪˈtɜː.mɪn/", pos: "verb" },
    "develop": { uz: "Rivojlantirmoq", phonetic: "/dɪˈvel.əp/", pos: "verb" },
    "different": { uz: "Turli, boshqacha", phonetic: "/ˈdɪf.ər.ənt/", pos: "adj" },
    "difficult": { uz: "Qiyin", phonetic: "/ˈdɪf.ɪ.kəlt/", pos: "adj" },
    "discover": { uz: "Kashf qilmoq", phonetic: "/dɪˈskʌv.ər/", pos: "verb" },
    "dream": { uz: "Orzu, tush", phonetic: "/driːm/", pos: "noun" },
    "early": { uz: "Erta, barvaqt", phonetic: "/ˈɜː.li/", pos: "adj" },
    "easy": { uz: "Oson", phonetic: "/ˈiː.zi/", pos: "adj" },
    "education": { uz: "Ta'lim", phonetic: "/ˌedʒ.uˈkeɪ.ʃən/", pos: "noun" },
    "effort": { uz: "Harakat, urinish", phonetic: "/ˈef.ət/", pos: "noun" },
    "energy": { uz: "Energiya, kuch", phonetic: "/ˈen.ə.dʒi/", pos: "noun" },
    "essential": { uz: "Juda muhim, asosiy", phonetic: "/ɪˈsen.ʃəl/", pos: "adj" },
    "experience": { uz: "Tajriba", phonetic: "/ɪkˈspɪə.ri.əns/", pos: "noun" },
    "explore": { uz: "Tadqiq qilmoq", phonetic: "/ɪkˈsplɔːr/", pos: "verb" },
    "family": { uz: "Oila", phonetic: "/ˈfæm.əl.i/", pos: "noun" },
    "famous": { uz: "Mashhur", phonetic: "/ˈfeɪ.məs/", pos: "adj" },
    "focus": { uz: "Diqqatni qaratmoq", phonetic: "/ˈfəʊ.kəs/", pos: "verb" },
    "freedom": { uz: "Ozodlik, erkinlik", phonetic: "/ˈfriː.dəm/", pos: "noun" },
    "friend": { uz: "Do'st", phonetic: "/frend/", pos: "noun" },
    "future": { uz: "Kelajak", phonetic: "/ˈfjuː.tʃər/", pos: "noun" },
    "generate": { uz: "Hosil qilmoq, yaratmoq", phonetic: "/ˈdʒen.ə.reɪt/", pos: "verb" },
    "goal": { uz: "Maqsad", phonetic: "/ɡəʊl/", pos: "noun" },
    "great": { uz: "Buyuk, ajoyib", phonetic: "/ɡreɪt/", pos: "adj" },
    "habit": { uz: "Odat", phonetic: "/ˈhæb.ɪt/", pos: "noun" },
    "happiness": { uz: "Baxt", phonetic: "/ˈhæp.i.nəs/", pos: "noun" },
    "healthy": { uz: "Sog'lom", phonetic: "/ˈhel.θi/", pos: "adj" },
    "history": { uz: "Tarix", phonetic: "/ˈhɪs.tər.i/", pos: "noun" },
    "hope": { uz: "Umid", phonetic: "/həʊp/", pos: "noun" },
    "imagine": { uz: "Tasavvur qilmoq", phonetic: "/ɪˈmædʒ.ɪn/", pos: "verb" },
    "important": { uz: "Muhim", phonetic: "/ɪmˈpɔː.tənt/", pos: "adj" },
    "inspire": { uz: "Ilhomlantirmoq", phonetic: "/ɪnˈspaɪər/", pos: "verb" },
    "journey": { uz: "Sayohat, yo'l", phonetic: "/ˈdʒɜː.ni/", pos: "noun" },
    "language": { uz: "Til", phonetic: "/ˈlæŋ.ɡwɪdʒ/", pos: "noun" },
    "learn": { uz: "O'rganmoq", phonetic: "/lɜːn/", pos: "verb" },
    "life": { uz: "Hayot", phonetic: "/laɪf/", pos: "noun" },
    "memory": { uz: "Xotira", phonetic: "/ˈmem.ər.i/", pos: "noun" },
    "mind": { uz: "Aql, fikr", phonetic: "/maɪnd/", pos: "noun" },
    "nature": { uz: "Tabiat", phonetic: "/ˈneɪ.tʃər/", pos: "noun" },
    "peace": { uz: "Tinchlik", phonetic: "/piːs/", pos: "noun" },
    "power": { uz: "Kuch, qudrat", phonetic: "/paʊər/", pos: "noun" },
    "practice": { uz: "Mashq qilmoq", phonetic: "/ˈpræk.tɪs/", pos: "verb" },
    "progress": { uz: "Rivojlanish, siljish", phonetic: "/ˈprəʊ.ɡres/", pos: "noun" },
    "remember": { uz: "Eslab qolmoq", phonetic: "/rɪˈmem.bər/", pos: "verb" },
    "respect": { uz: "Hurmat qilmoq", phonetic: "/rɪˈspekt/", pos: "verb" },
    "science": { uz: "Fan, ilm", phonetic: "/ˈsaɪ.əns/", pos: "noun" },
    "solution": { uz: "Yechim", phonetic: "/səˈluː.ʃən/", pos: "noun" },
    "strength": { uz: "Kuch, quvvat", phonetic: "/streŋθ/", pos: "noun" },
    "study": { uz: "O'qimoq, o'rganmoq", phonetic: "/ˈstʌd.i/", pos: "verb" },
    "time": { uz: "Vaqt", phonetic: "/taɪm/", pos: "noun" },
    "understand": { uz: "Tushunmoq", phonetic: "/ˌʌn.dəˈstænd/", pos: "verb" },
    "victory": { uz: "G'alaba", phonetic: "/ˈvɪk.tər.i/", pos: "noun" },
    "wisdom": { uz: "Donolik", phonetic: "/ˈwɪz.dəm/", pos: "noun" },
    "world": { uz: "Dunyo, olam", phonetic: "/wɜːld/", pos: "noun" }
};

// Lokal Baza yuklash va boshlang'ich ma'lumotlar
function getLocalDB() {
    let db = localStorage.getItem(LOCAL_DB_KEY);
    if (!db) {
        // Eski versiyadagi ma'lumotlarni tekshirish va migratsiya qilish
        const oldDbStr = localStorage.getItem(OLD_LOCAL_DB_KEY);
        if (oldDbStr) {
            try {
                const oldDb = JSON.parse(oldDbStr);
                db = {
                    users: oldDb.users || [{ id: 1, username: "demo", email: "demo@fleshcard.uz", password: "password123" }],
                    units: oldDb.units || [{ id: 1, user_id: 1, title: "Unit 1: Essential Vocabulary", created_at: new Date().toISOString() }],
                    words: (oldDb.words || []).map(w => ({
                        id: w.id,
                        unit_id: w.unit_id,
                        en: w.en,
                        uz: w.uz,
                        phonetic: w.phonetic || (OFFLINE_DICTIONARY[w.en.toLowerCase()]?.phonetic || ""),
                        pos: w.pos || (OFFLINE_DICTIONARY[w.en.toLowerCase()]?.pos || ""),
                        learned: !!w.learned
                    }))
                };
                localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
                return db;
            } catch (e) {}
        }

        // Boshlang'ich toza ma'lumotlar (ortiqcha gaplarsiz!)
        db = {
            users: [
                { id: 1, username: "demo", email: "demo@fleshcard.uz", password: "password123" },
                { id: 2, username: "user", email: "user@gmail.com", password: "123456" }
            ],
            units: [
                { id: 1, user_id: 1, title: "Unit 1: Essential Vocabulary", created_at: new Date().toISOString() },
                { id: 2, user_id: 1, title: "Unit 2: IELTS 7+ Words", created_at: new Date().toISOString() }
            ],
            words: [
                { id: 1, unit_id: 1, en: "Achieve", uz: "Erishmoq", phonetic: "/əˈtʃiːv/", pos: "verb", learned: false },
                { id: 2, unit_id: 1, en: "Knowledge", uz: "Bilim", phonetic: "/ˈnɒl.ɪdʒ/", pos: "noun", learned: false },
                { id: 3, unit_id: 1, en: "Success", uz: "Muvaffaqiyat", phonetic: "/səkˈses/", pos: "noun", learned: true },
                { id: 4, unit_id: 1, en: "Improve", uz: "Yaxshilamoq", phonetic: "/ɪmˈpruːv/", pos: "verb", learned: false },
                { id: 5, unit_id: 1, en: "Opportunity", uz: "Imkoniyat", phonetic: "/ˌɒp.əˈtʃuː.nə.ti/", pos: "noun", learned: false },
                { id: 6, unit_id: 2, en: "Comprehensive", uz: "Har tomonlama, to'liq", phonetic: "/ˌkɒm.prɪˈhen.sɪv/", pos: "adj", learned: false },
                { id: 7, unit_id: 2, en: "Crucial", uz: "Juda muhim, hal qiluvchi", phonetic: "/ˈkruː.ʃəl/", pos: "adj", learned: true }
            ]
        };
        localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
    } else {
        db = JSON.parse(db);
    }
    return db;
}

function saveLocalDB(db) {
    localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
}

// Token va foydalanuvchi
function tokenniOlish() { return localStorage.getItem("fleshcard_token"); }
function tokenniSaqlash(token) { localStorage.setItem("fleshcard_token", token); }
function tokenniOchirish() {
    localStorage.removeItem("fleshcard_token");
    localStorage.removeItem("fleshcard_user");
}
function foydalanuvchiniSaqlash(user) { localStorage.setItem("fleshcard_user", JSON.stringify(user)); }
function foydalanuvchiniOlish() {
    const data = localStorage.getItem("fleshcard_user");
    return data ? JSON.parse(data) : null;
}
function chiqish() {
    tokenniOchirish();
    window.location.reload();
}
function kirilganmi() { return !!tokenniOlish(); }

// Backend tekshiruvi (file:/// rejimida xatoliksiz 0ms da ishlaydi)
async function tekshirBackend() {
    if (isBackendAvailable !== null) return isBackendAvailable;

    // file:// protokolida PHP backend ishlamasligi aniq
    if (window.location.protocol === "file:") {
        isBackendAvailable = false;
        return false;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);
        const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
            isBackendAvailable = true;
            return true;
        }
    } catch (e) {}

    isBackendAvailable = false;
    return false;
}

async function apiSorov(endpoint, options = {}) {
    const token = tokenniOlish();
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options.headers
    };
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Serverda xatolik");
    return data;
}

// HTML belgilarni tozalash (masalan &#39; -> ')
function unescapeHtml(text) {
    if (!text) return "";
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return doc.body.textContent || "";
}

// So'zni bosh harf qilish
function capitalizeWord(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Toast bildirishnomalar
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "toastOut 0.3s ease forwards";
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

// Global holat
let unitlar = [];
let activeUnitId = null;
let activeUnitTitle = "";
let activeUnitWords = [];
let currentMode = "card";       // "card" | "list" | "quiz"
let currentSubTab = "unlearned"; // "unlearned" | "learned"
let currentIndex = 0;
let typingTimer = null;
let autoTranslateTimer = null;

// Viktorina holati
let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;

// ===================================
//  2. AUTH (KIRISH VA RO'YXATDAN O'TISH)
// ===================================

window.formniAlmashtir = function(type) {
    const err = document.getElementById("authError");
    if (err) err.style.display = "none";

    const loginTab = document.getElementById("tabBtnLogin");
    const regTab = document.getElementById("tabBtnRegister");

    if (type === "register") {
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("registerForm").style.display = "block";
        document.getElementById("authSubtitle").textContent = "Yangi hisob yarating — bir necha soniyada!";
        if (loginTab && regTab) {
            loginTab.classList.remove("active");
            regTab.classList.add("active");
        }
    } else {
        document.getElementById("registerForm").style.display = "none";
        document.getElementById("loginForm").style.display = "block";
        document.getElementById("authSubtitle").textContent = "Ingliz tilini so'zma-so'z aqlli tarzda o'rganing";
        if (loginTab && regTab) {
            regTab.classList.remove("active");
            loginTab.classList.add("active");
        }
    }
};

window.demoBilanKirish = async function() {
    document.getElementById("loginEmail").value = "demo@fleshcard.uz";
    document.getElementById("loginPassword").value = "password123";
    await window.loginBosish();
};

window.loginBosish = async function() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const errorEl = document.getElementById("authError");

    if (!email || !password) {
        errorEl.textContent = "⚠️ Barcha maydonlarni to'ldiring";
        errorEl.style.display = "block";
        return;
    }

    try {
        errorEl.style.display = "none";
        const backendFaol = await tekshirBackend();

        if (backendFaol) {
            const data = await apiSorov("/auth.php?action=login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });
            tokenniSaqlash(data.token);
            foydalanuvchiniSaqlash(data.user);
        } else {
            const db = getLocalDB();
            let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (!user) {
                user = { id: Date.now(), username: email.split("@")[0], email, password };
                db.users.push(user);
                saveLocalDB(db);
            } else if (user.password !== password) {
                throw new Error("Parol noto'g'ri kiritildi!");
            }

            const token = "local_token_" + user.id;
            const safeUser = { id: user.id, username: user.username, email: user.email };
            tokenniSaqlash(token);
            foydalanuvchiniSaqlash(safeUser);
        }

        showToast("Xush kelibsiz! 👋", "success");
        await ilovaniKorsat();
    } catch (e) {
        errorEl.textContent = "❌ " + e.message;
        errorEl.style.display = "block";
    }
};

window.registerBosish = async function() {
    const username = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const errorEl = document.getElementById("authError");

    if (!username || !email || !password) {
        errorEl.textContent = "⚠️ Barcha maydonlarni to'ldiring";
        errorEl.style.display = "block";
        return;
    }

    if (password.length < 6) {
        errorEl.textContent = "⚠️ Parol kamida 6 ta belgidan iborat bo'lishi kerak";
        errorEl.style.display = "block";
        return;
    }

    try {
        errorEl.style.display = "none";
        const backendFaol = await tekshirBackend();

        if (backendFaol) {
            const data = await apiSorov("/auth.php?action=register", {
                method: "POST",
                body: JSON.stringify({ username, email, password })
            });
            tokenniSaqlash(data.token);
            foydalanuvchiniSaqlash(data.user);
        } else {
            const db = getLocalDB();
            const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (existing) {
                throw new Error("Bu email bilan hisob allaqachon mavjud! 'Kirish' orqali kiring.");
            }

            const newUser = { id: Date.now(), username, email, password };
            db.users.push(newUser);

            // Boshlang'ich bo'lim
            const newUnit = {
                id: Date.now() + 1,
                user_id: newUser.id,
                title: "Unit 1: Boshlang'ich lug'at",
                created_at: new Date().toISOString()
            };
            db.units.push(newUnit);

            db.words.push(
                { id: Date.now() + 2, unit_id: newUnit.id, en: "Achieve", uz: "Erishmoq", phonetic: "/əˈtʃiːv/", pos: "verb", learned: false },
                { id: Date.now() + 3, unit_id: newUnit.id, en: "Knowledge", uz: "Bilim", phonetic: "/ˈnɒl.ɪdʒ/", pos: "noun", learned: false },
                { id: Date.now() + 4, unit_id: newUnit.id, en: "Opportunity", uz: "Imkoniyat", phonetic: "/ˌɒp.əˈtʃuː.nə.ti/", pos: "noun", learned: false }
            );

            saveLocalDB(db);

            const token = "local_token_" + newUser.id;
            const safeUser = { id: newUser.id, username: newUser.username, email: newUser.email };
            tokenniSaqlash(token);
            foydalanuvchiniSaqlash(safeUser);
        }

        showToast("Tabriklaymiz! Hisobingiz yaratildi 🚀", "success");
        await ilovaniKorsat();
    } catch (e) {
        errorEl.textContent = "❌ " + e.message;
        errorEl.style.display = "block";
    }
};

window.chiqishBosish = function() {
    if (confirm("Haqiqatan ham hisobdan chiqmoqchimisiz?")) {
        chiqish();
    }
};

// ===================================
//  3. DASHBOARD VA BO'LIMLAR
// ===================================

async function ilovaniKorsat() {
    document.getElementById("authOverlay").style.display = "none";
    document.getElementById("mainApp").style.display = "block";

    const user = foydalanuvchiniOlish();
    if (user) {
        document.getElementById("userName").textContent = `👤 ${user.username}`;
    }

    await dashboardniYukla();
}

async function dashboardniYukla() {
    try {
        const backendFaol = await tekshirBackend();
        if (backendFaol) {
            unitlar = await apiSorov("/units.php");
        } else {
            const user = foydalanuvchiniOlish();
            const db = getLocalDB();
            const userUnits = db.units.filter(u => !user || u.user_id === user.id);
            unitlar = userUnits.map(u => {
                const words = db.words.filter(w => w.unit_id === u.id);
                const learned = words.filter(w => w.learned).length;
                return {
                    id: u.id,
                    title: u.title,
                    created_at: u.created_at,
                    total_words: words.length,
                    learned_words: learned
                };
            });
        }
        dashboardChizish();
    } catch (e) {
        console.error("Dashboard yuklashda xato:", e);
    }
}

function dashboardChizish() {
    const grid = document.getElementById("unitsGrid");
    grid.innerHTML = "";
    let jamiYodlangan = 0;

    if (unitlar.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted);">
                <div style="font-size: 40px; margin-bottom: 10px;">📚</div>
                <h3>Bo'limlar hali mavjud emas</h3>
                <p style="font-size: 13px; margin-top: 6px;">Quyidagi maydondan birinchi bo'limingizni oching!</p>
            </div>
        `;
    }

    unitlar.forEach(unit => {
        const total = unit.total_words;
        const learned = unit.learned_words;
        const percent = total === 0 ? 0 : Math.round((learned / total) * 100);
        jamiYodlangan += learned;

        const card = document.createElement("div");
        card.className = "unit-card";

        const cardHeader = document.createElement("div");
        cardHeader.className = "unit-card-header";

        const titleEl = document.createElement("div");
        titleEl.className = "unit-title";
        titleEl.textContent = unit.title;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "unit-delete-btn";
        deleteBtn.textContent = "🗑️";
        deleteBtn.title = "Bo'limni o'chirish";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            unitOchirishBosish(unit.id, unit.title);
        });

        cardHeader.appendChild(titleEl);
        cardHeader.appendChild(deleteBtn);

        const infoEl = document.createElement("div");
        infoEl.className = "unit-info";

        const countSpan = document.createElement("span");
        countSpan.textContent = `${learned} / ${total} so'z`;

        const percentSpan = document.createElement("span");
        percentSpan.style.cssText = "color: var(--success); font-weight: 700;";
        percentSpan.textContent = `${percent}%`;

        infoEl.appendChild(countSpan);
        infoEl.appendChild(percentSpan);

        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";
        const progressFill = document.createElement("div");
        progressFill.className = "progress-fill";
        progressFill.style.width = `${percent}%`;
        progressBar.appendChild(progressFill);

        card.appendChild(cardHeader);
        card.appendChild(infoEl);
        card.appendChild(progressBar);

        card.addEventListener("click", () => unitniOchish(unit.id, unit.title));
        grid.appendChild(card);
    });

    document.getElementById("globalStats").textContent = `🏆 ${jamiYodlangan} ta`;
}

async function unitOchirishBosish(id, title) {
    if (!confirm(`"${title}" bo'limini o'chirishni xohlaysizmi?\nIchidagi barcha so'zlar ham o'chib ketadi!`)) return;

    try {
        const backendFaol = await tekshirBackend();
        if (backendFaol) {
            await apiSorov(`/units.php?id=${id}`, { method: "DELETE" });
        } else {
            const db = getLocalDB();
            db.units = db.units.filter(u => u.id !== id);
            db.words = db.words.filter(w => w.unit_id !== id);
            saveLocalDB(db);
        }
        showToast(`"${title}" o'chirildi`, "info");
        await dashboardniYukla();
    } catch (e) {
        showToast("Xatolik: " + e.message, "error");
    }
}

window.yangiUnitQoshish = async function() {
    const input = document.getElementById("newUnitName");
    const name = input.value.trim();
    if (!name) return showToast("Bo'lim nomini kiriting!", "error");

    try {
        const backendFaol = await tekshirBackend();
        if (backendFaol) {
            await apiSorov("/units.php", {
                method: "POST",
                body: JSON.stringify({ title: name })
            });
        } else {
            const user = foydalanuvchiniOlish();
            const db = getLocalDB();
            db.units.push({
                id: Date.now(),
                user_id: user ? user.id : 1,
                title: name,
                created_at: new Date().toISOString()
            });
            saveLocalDB(db);
        }
        input.value = "";
        showToast("Yangi bo'lim ochildi! 📁", "success");
        await dashboardniYukla();
    } catch (e) {
        showToast("Xatolik: " + e.message, "error");
    }
};

// ===================================
//  4. STUDY VIEW & REJIMLAR
// ===================================

async function unitniOchish(id, title) {
    activeUnitId = id;
    activeUnitTitle = title;
    currentMode = "card";
    currentSubTab = "unlearned";
    currentIndex = 0;

    document.getElementById("dashboardView").style.display = "none";
    document.getElementById("studyView").style.display = "flex";
    document.getElementById("currentUnitTitle").textContent = title;
    document.getElementById("errorMsg").style.display = "none";
    document.getElementById("autoFillBadge").style.display = "none";

    window.rejimiAlmashtir("card");

    try {
        const backendFaol = await tekshirBackend();
        if (backendFaol) {
            activeUnitWords = await apiSorov(`/words.php?unit_id=${activeUnitId}`);
        } else {
            const db = getLocalDB();
            activeUnitWords = db.words.filter(w => w.unit_id === parseInt(activeUnitId));
        }

        document.getElementById("unitWordCountBadge").textContent = `${activeUnitWords.length} ta so'z`;
        kartochkaniYangila();
        sozlarRoyxatiniChizish();
    } catch (e) {
        showToast("So'zlarni yuklashda xatolik: " + e.message, "error");
    }
}

window.dashboardgaQaytish = async function() {
    document.getElementById("studyView").style.display = "none";
    document.getElementById("dashboardView").style.display = "block";
    await dashboardniYukla();
};

function faolSozlar() {
    return currentSubTab === "unlearned"
        ? activeUnitWords.filter(w => !w.learned)
        : activeUnitWords.filter(w => w.learned);
}

window.rejimiAlmashtir = function(mode) {
    currentMode = mode;
    document.getElementById("modeCardBtn").classList.toggle("active", mode === "card");
    document.getElementById("modeListBtn").classList.toggle("active", mode === "list");
    document.getElementById("modeQuizBtn").classList.toggle("active", mode === "quiz");

    document.getElementById("cardModeContainer").style.display = mode === "card" ? "block" : "none";
    document.getElementById("listModeContainer").style.display = mode === "list" ? "flex" : "none";
    document.getElementById("quizModeContainer").style.display = mode === "quiz" ? "flex" : "none";

    if (mode === "card") kartochkaniYangila();
    else if (mode === "list") sozlarRoyxatiniChizish();
    else if (mode === "quiz") window.viktorinaniBoshlash();
};

// ===================================
//  5. 3D KARTOCHKA REJIMI (TOZA & GAPLARSIZ)
// ===================================

function kartochkaniYangila() {
    document.getElementById("flashcard").classList.remove("is-flipped");

    const allCount = activeUnitWords.length;
    const learnedCount = activeUnitWords.filter(w => w.learned).length;
    document.getElementById("unlearnedCount").textContent = allCount - learnedCount;
    document.getElementById("learnedCount").textContent = learnedCount;
    document.getElementById("unitWordCountBadge").textContent = `${allCount} ta so'z`;

    const list = faolSozlar();
    const masterBtn = document.getElementById("masterBtn");
    const frontPosEl = document.getElementById("frontPos");
    const frontPhoneticEl = document.getElementById("frontPhonetic");
    const backPosEl = document.getElementById("backPos");

    if (list.length === 0) {
        document.getElementById("frontWord").textContent =
            currentSubTab === "unlearned" ? "Bo'lim tugadi! 🎉" : "Hali yodlangan so'z yo'q";
        document.getElementById("backWord").textContent = "Bo'sh";
        document.getElementById("counter").textContent = "0 / 0";
        if (frontPosEl) frontPosEl.style.display = "none";
        if (frontPhoneticEl) frontPhoneticEl.style.display = "none";
        if (backPosEl) backPosEl.style.display = "none";
        if (masterBtn) masterBtn.style.display = "none";
        return;
    }

    if (currentIndex >= list.length) currentIndex = 0;

    if (masterBtn) {
        masterBtn.style.display = "block";
        masterBtn.textContent = currentSubTab === "unlearned" ? "✅ Yodladim" : "🔄 Qayta o'rganish";
    }

    const item = list[currentIndex];
    document.getElementById("frontWord").textContent = item.en;
    document.getElementById("backWord").textContent = item.uz;
    document.getElementById("counter").textContent = `${currentIndex + 1} / ${list.length}`;

    // Fonetika va so'z turkumi (ortiqcha gap yo'q!)
    const phonetic = item.phonetic || (OFFLINE_DICTIONARY[item.en.toLowerCase()]?.phonetic || "");
    const pos = item.pos || (OFFLINE_DICTIONARY[item.en.toLowerCase()]?.pos || "");

    if (phonetic) {
        frontPhoneticEl.textContent = phonetic;
        frontPhoneticEl.style.display = "inline-block";
    } else {
        frontPhoneticEl.style.display = "none";
    }

    if (pos) {
        frontPosEl.textContent = pos;
        frontPosEl.style.display = "inline-block";
        if (backPosEl) {
            backPosEl.textContent = pos;
            backPosEl.style.display = "inline-block";
        }
    } else {
        frontPosEl.style.display = "none";
        if (backPosEl) backPosEl.style.display = "none";
    }
}

window.kartochkaniAylantir = function() {
    if (faolSozlar().length === 0) return;
    document.getElementById("flashcard").classList.toggle("is-flipped");
};

function ijroQilTalaffuz(word) {
    if (!word || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = "en-US";
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
}

window.talaffuzBosish = function(e) {
    if (e) e.stopPropagation();
    const list = faolSozlar();
    if (list.length === 0) return;
    ijroQilTalaffuz(list[currentIndex].en);
};

window.keyingiSoz = function() {
    const list = faolSozlar();
    if (list.length === 0) return;
    currentIndex = (currentIndex + 1) % list.length;
    kartochkaniYangila();
};

window.oldingiSoz = function() {
    const list = faolSozlar();
    if (list.length === 0) return;
    currentIndex = (currentIndex - 1 + list.length) % list.length;
    kartochkaniYangila();
};

window.subTabOzgartir = function(tab) {
    currentSubTab = tab;
    currentIndex = 0;
    document.getElementById("tabUnlearned").classList.toggle("active", tab === "unlearned");
    document.getElementById("tabLearned").classList.toggle("active", tab === "learned");
    kartochkaniYangila();
};

window.holatniOzgartir = async function() {
    const list = faolSozlar();
    if (list.length === 0) return;

    const target = list[currentIndex];
    try {
        const backendFaol = await tekshirBackend();
        if (backendFaol) {
            await apiSorov(`/words.php?id=${target.id}&action=toggle`, { method: "PATCH" });
        } else {
            const db = getLocalDB();
            const w = db.words.find(item => item.id === target.id);
            if (w) {
                w.learned = !w.learned;
                saveLocalDB(db);
            }
        }

        const idx = activeUnitWords.findIndex(w => w.id === target.id);
        if (idx !== -1) activeUnitWords[idx].learned = !activeUnitWords[idx].learned;

        showToast(target.learned ? "Qayta o'rganishga o'tkazildi" : "Tabriklaymiz! So'z yodlandi 🎯", "success");

        if (currentIndex >= faolSozlar().length) {
            currentIndex = Math.max(0, faolSozlar().length - 1);
        }
        kartochkaniYangila();
    } catch (e) {
        showToast("Xatolik: " + e.message, "error");
    }
};

window.sozniOchirish = async function() {
    const list = faolSozlar();
    if (list.length === 0) return;

    const target = list[currentIndex];
    if (!confirm(`"${target.en}" so'zini o'chirishni xohlaysizmi?`)) return;

    try {
        const backendFaol = await tekshirBackend();
        if (backendFaol) {
            await apiSorov(`/words.php?id=${target.id}`, { method: "DELETE" });
        } else {
            const db = getLocalDB();
            db.words = db.words.filter(w => w.id !== target.id);
            saveLocalDB(db);
        }

        activeUnitWords = activeUnitWords.filter(w => w.id !== target.id);
        showToast(`"${target.en}" o'chirildi`, "info");

        if (currentIndex >= faolSozlar().length) {
            currentIndex = Math.max(0, faolSozlar().length - 1);
        }
        kartochkaniYangila();
    } catch (e) {
        showToast("Xatolik: " + e.message, "error");
    }
};

// ===================================
//  6. SO'ZLAR RO'YXATI (LIST VIEW)
// ===================================

function sozlarRoyxatiniChizish() {
    const container = document.getElementById("wordsItemsList");
    if (!container) return;
    container.innerHTML = "";

    const query = (document.getElementById("wordSearchInput")?.value || "").trim().toLowerCase();
    const filter = document.getElementById("wordListFilter")?.value || "all";

    let filtered = activeUnitWords.filter(w => {
        const matchesQuery = !query || w.en.toLowerCase().includes(query) || w.uz.toLowerCase().includes(query);
        const matchesFilter = filter === "all" ? true : filter === "learned" ? w.learned : !w.learned;
        return matchesQuery && matchesFilter;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 14px;">
                Hech qanday so'z topilmadi
            </div>
        `;
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement("div");
        card.className = "word-item-card";

        const left = document.createElement("div");
        left.className = "word-item-left";

        const enRow = document.createElement("div");
        enRow.className = "word-item-en";
        enRow.textContent = item.en;

        const phonetic = item.phonetic || (OFFLINE_DICTIONARY[item.en.toLowerCase()]?.phonetic || "");
        if (phonetic) {
            const phonSpan = document.createElement("span");
            phonSpan.className = "word-item-phonetic";
            phonSpan.textContent = phonetic;
            enRow.appendChild(phonSpan);
        }

        if (item.learned) {
            const badge = document.createElement("span");
            badge.style.cssText = "font-size: 10px; background: rgba(16,185,129,0.2); color: #34d399; padding: 2px 6px; border-radius: 6px; font-weight: 700;";
            badge.textContent = "Yodlangan";
            enRow.appendChild(badge);
        }

        const uzRow = document.createElement("div");
        uzRow.className = "word-item-uz";
        uzRow.textContent = item.uz;

        left.appendChild(enRow);
        left.appendChild(uzRow);

        const actions = document.createElement("div");
        actions.className = "word-item-actions";

        const speakBtn = document.createElement("button");
        speakBtn.className = "icon-btn";
        speakBtn.textContent = "🔊";
        speakBtn.title = "Talaffuz";
        speakBtn.onclick = () => ijroQilTalaffuz(item.en);

        const toggleBtn = document.createElement("button");
        toggleBtn.className = "icon-btn";
        toggleBtn.textContent = item.learned ? "🔄" : "✅";
        toggleBtn.title = item.learned ? "O'rganishga qaytarish" : "Yodlangan deb belgilash";
        toggleBtn.onclick = async () => {
            try {
                const backendFaol = await tekshirBackend();
                if (backendFaol) {
                    await apiSorov(`/words.php?id=${item.id}&action=toggle`, { method: "PATCH" });
                } else {
                    const db = getLocalDB();
                    const w = db.words.find(x => x.id === item.id);
                    if (w) { w.learned = !w.learned; saveLocalDB(db); }
                }
                item.learned = !item.learned;
                sozlarRoyxatiniChizish();
                kartochkaniYangila();
            } catch (e) {
                showToast("Xatolik: " + e.message, "error");
            }
        };

        const editBtn = document.createElement("button");
        editBtn.className = "icon-btn";
        editBtn.textContent = "✏️";
        editBtn.title = "Tahrirlash";
        editBtn.onclick = () => window.tahrirlashModaliniOchish(item);

        const delBtn = document.createElement("button");
        delBtn.className = "icon-btn danger";
        delBtn.textContent = "🗑️";
        delBtn.title = "O'chirish";
        delBtn.onclick = async () => {
            if (!confirm(`"${item.en}" so'zini o'chirishni xohlaysizmi?`)) return;
            try {
                const backendFaol = await tekshirBackend();
                if (backendFaol) {
                    await apiSorov(`/words.php?id=${item.id}`, { method: "DELETE" });
                } else {
                    const db = getLocalDB();
                    db.words = db.words.filter(w => w.id !== item.id);
                    saveLocalDB(db);
                }
                activeUnitWords = activeUnitWords.filter(w => w.id !== item.id);
                showToast(`"${item.en}" o'chirildi`, "info");
                sozlarRoyxatiniChizish();
                kartochkaniYangila();
            } catch (e) {
                showToast("Xatolik: " + e.message, "error");
            }
        };

        actions.appendChild(speakBtn);
        actions.appendChild(toggleBtn);
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        card.appendChild(left);
        card.appendChild(actions);
        container.appendChild(card);
    });
}

window.sozlarniFiltrlash = function() {
    sozlarRoyxatiniChizish();
};

// ===================================
//  7. VIKTORINA (QUIZ) REJIMI
// ===================================

window.viktorinaniBoshlash = function() {
    if (activeUnitWords.length < 2) {
        document.getElementById("quizQuestionBox").innerHTML = `
            <div style="padding: 20px; color: var(--text-muted);">
                <h3>Kamida 2 ta so'z kerak! ⚠️</h3>
                <p style="font-size: 13px; margin-top: 8px;">Viktorina o'ynash uchun ushbu bo'limga ko'proq so'z qo'shing.</p>
            </div>
        `;
        document.getElementById("quizResultCard").style.display = "none";
        return;
    }

    quizScore = 0;
    quizIndex = 0;

    // Viktorina savollari
    const shuffled = [...activeUnitWords].sort(() => Math.random() - 0.5);
    const offlineValues = Object.values(OFFLINE_DICTIONARY).map(v => v.uz);

    quizQuestions = shuffled.slice(0, Math.min(10, shuffled.length)).map(target => {
        let distractors = activeUnitWords
            .filter(w => w.id !== target.id)
            .sort(() => Math.random() - 0.5)
            .map(w => w.uz);

        // Agar variantlar kam bo'lsa, offline lug'atdan qo'shamiz
        if (distractors.length < 3) {
            const extra = offlineValues
                .filter(uz => uz !== target.uz && !distractors.includes(uz))
                .sort(() => Math.random() - 0.5)
                .slice(0, 3 - distractors.length);
            distractors = [...distractors, ...extra];
        } else {
            distractors = distractors.slice(0, 3);
        }

        const options = [...distractors, target.uz].sort(() => Math.random() - 0.5);
        return {
            en: target.en,
            correctUz: target.uz,
            options
        };
    });

    document.getElementById("quizResultCard").style.display = "none";
    document.getElementById("quizQuestionBox").style.display = "block";
    quizSavoliniKorsat();
};

function quizSavoliniKorsat() {
    if (quizIndex >= quizQuestions.length) {
        document.getElementById("quizQuestionBox").style.display = "none";
        const resultCard = document.getElementById("quizResultCard");
        resultCard.style.display = "flex";
        const percent = Math.round((quizScore / quizQuestions.length) * 100);
        document.getElementById("quizFinalScore").textContent = `${percent}%`;
        document.getElementById("quizSummaryText").textContent =
            `${quizQuestions.length} ta savoldan ${quizScore} tasiga to'g'ri javob berdingiz!`;
        return;
    }

    const currentQ = quizQuestions[quizIndex];
    document.getElementById("quizProgressText").textContent = `Savol ${quizIndex + 1} / ${quizQuestions.length}`;
    document.getElementById("quizScoreText").textContent = `To'g'ri: ${quizScore}`;
    document.getElementById("quizQuestionWord").textContent = currentQ.en;

    const grid = document.getElementById("quizOptionsGrid");
    grid.innerHTML = "";

    currentQ.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "quiz-option-btn";
        btn.textContent = opt;
        btn.onclick = () => quizJavobTekshirish(btn, opt, currentQ.correctUz);
        grid.appendChild(btn);
    });
}

function quizJavobTekshirish(selectedBtn, selectedText, correctText) {
    const allBtns = document.querySelectorAll(".quiz-option-btn");
    allBtns.forEach(b => b.disabled = true);

    if (selectedText === correctText) {
        selectedBtn.classList.add("correct");
        quizScore++;
        showToast("To'g'ri! 🎉", "success");
    } else {
        selectedBtn.classList.add("wrong");
        allBtns.forEach(b => {
            if (b.textContent === correctText) b.classList.add("correct");
        });
        showToast(`To'g'ri javob: ${correctText}`, "error");
    }

    setTimeout(() => {
        quizIndex++;
        quizSavoliniKorsat();
    }, 1100);
}

window.quizTalaffuz = function() {
    if (quizIndex < quizQuestions.length) {
        ijroQilTalaffuz(quizQuestions[quizIndex].en);
    }
};

// ===================================
//  8. TAHRIRLASH MODALI (ORTIQCHA GAPSIZ)
// ===================================

window.tahrirlashModaliniOchish = function(specificWord = null) {
    const list = faolSozlar();
    const word = specificWord || (list.length > 0 ? list[currentIndex] : null);
    if (!word) return showToast("Tahrirlash uchun so'z tanlanmagan", "error");

    document.getElementById("editWordId").value = word.id;
    document.getElementById("editEnInput").value = word.en;
    document.getElementById("editUzInput").value = word.uz;
    document.getElementById("editModalOverlay").style.display = "flex";
};

window.tahrirlashModaliniYopish = function() {
    document.getElementById("editModalOverlay").style.display = "none";
};

window.sozniSaqlash = async function() {
    const id = parseInt(document.getElementById("editWordId").value);
    const en = capitalizeWord(document.getElementById("editEnInput").value.trim());
    const uz = capitalizeWord(document.getElementById("editUzInput").value.trim());

    if (!en || !uz) return showToast("Iltimos, barcha maydonlarni to'ldiring", "error");

    try {
        const backendFaol = await tekshirBackend();
        if (backendFaol) {
            await apiSorov(`/words.php?id=${id}`, {
                method: "PUT",
                body: JSON.stringify({ en, uz, sentence: "" })
            });
        } else {
            const db = getLocalDB();
            const w = db.words.find(x => x.id === id);
            if (w) {
                w.en = en;
                w.uz = uz;
                saveLocalDB(db);
            }
        }

        const idx = activeUnitWords.findIndex(w => w.id === id);
        if (idx !== -1) {
            activeUnitWords[idx].en = en;
            activeUnitWords[idx].uz = uz;
        }

        window.tahrirlashModaliniYopish();
        showToast("So'z yangilandi! 💾", "success");
        kartochkaniYangila();
        sozlarRoyxatiniChizish();
    } catch (e) {
        showToast("Xatolik: " + e.message, "error");
    }
};

// ===================================
//  9. OMMAVIY SO'Z QO'SHISH (BATCH ADD)
// ===================================

window.batchModalOchish = function() {
    document.getElementById("batchTextInput").value = "";
    document.getElementById("batchModalOverlay").style.display = "flex";
};

window.batchModalYopish = function() {
    document.getElementById("batchModalOverlay").style.display = "none";
};

window.batchSozlarniSaqlash = async function() {
    const text = document.getElementById("batchTextInput").value.trim();
    if (!text) return showToast("Iltimos, so'zlarni kiriting!", "error");

    const lines = text.split("\n");
    const parsedPairs = [];

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        let parts = [];
        if (line.includes(" - ")) parts = line.split(" - ");
        else if (line.includes("-")) parts = line.split("-");
        else if (line.includes(":")) parts = line.split(":");
        else if (line.includes("=")) parts = line.split("=");
        else if (line.includes(",")) parts = line.split(",");
        else if (line.includes("\t")) parts = line.split("\t");

        if (parts.length >= 2) {
            const en = capitalizeWord(parts[0].trim());
            const uz = capitalizeWord(parts.slice(1).join(" ").trim());
            if (en && uz) {
                parsedPairs.push({ en, uz });
            }
        }
    }

    if (parsedPairs.length === 0) {
        return showToast("Hech qanday so'z ajratib olinmadi. Namuna: apple - olma", "error");
    }

    try {
        const backendFaol = await tekshirBackend();
        let addedCount = 0;

        for (const pair of parsedPairs) {
            const phonetic = OFFLINE_DICTIONARY[pair.en.toLowerCase()]?.phonetic || "";
            const pos = OFFLINE_DICTIONARY[pair.en.toLowerCase()]?.pos || "";

            if (backendFaol) {
                const res = await apiSorov("/words.php", {
                    method: "POST",
                    body: JSON.stringify({ unit_id: activeUnitId, en: pair.en, uz: pair.uz, sentence: "" })
                });
                activeUnitWords.unshift(res.word);
            } else {
                const db = getLocalDB();
                const newWord = {
                    id: Date.now() + Math.floor(Math.random() * 10000),
                    unit_id: parseInt(activeUnitId),
                    en: pair.en,
                    uz: pair.uz,
                    phonetic,
                    pos,
                    learned: false
                };
                db.words.unshift(newWord);
                saveLocalDB(db);
                activeUnitWords.unshift(newWord);
            }
            addedCount++;
        }

        window.batchModalYopish();
        showToast(`${addedCount} ta yangi so'z muvaffaqiyatli qo'shildi! 🚀`, "success");

        currentSubTab = "unlearned";
        document.getElementById("tabUnlearned").classList.add("active");
        document.getElementById("tabLearned").classList.remove("active");
        currentIndex = 0;
        kartochkaniYangila();
        sozlarRoyxatiniChizish();

    } catch (e) {
        showToast("Qo'shishda xatolik: " + e.message, "error");
    }
};

// ===================================
//  10. AQLLI SO'Z QO'SHISH & AVTO TARJIMA
// ===================================

// Jonli qidiruv va tavsiyalar
window.tavsiyalarniQidir = function() {
    const rawQuery = document.getElementById("engInput").value.trim();
    const query = rawQuery.toLowerCase();
    const sugBox = document.getElementById("suggestionsList");
    const autoBadge = document.getElementById("autoFillBadge");
    document.getElementById("errorMsg").style.display = "none";

    clearTimeout(typingTimer);
    clearTimeout(autoTranslateTimer);

    if (query.length < 1) {
        sugBox.style.display = "none";
        autoBadge.style.display = "none";
        return;
    }

    // 1. OFFLINE LUG'ATDAN BIR ZUMDA TEKSHIRISH
    if (OFFLINE_DICTIONARY[query]) {
        document.getElementById("uzInput").value = OFFLINE_DICTIONARY[query].uz;
        autoBadge.style.display = "inline-flex";
        autoBadge.textContent = "⚡ Offline lug'atdan tezkor tarjima!";
    }

    // 2. AVTOMATIK JONLI TARJIMA (DEBOUNCED)
    autoTranslateTimer = setTimeout(async () => {
        if (!OFFLINE_DICTIONARY[query] && query.length >= 2) {
            try {
                const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=en|uz`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.responseData && data.responseData.translatedText) {
                        const cleanText = unescapeHtml(data.responseData.translatedText).trim();
                        if (cleanText && cleanText.toLowerCase() !== query) {
                            document.getElementById("uzInput").value = capitalizeWord(cleanText);
                            autoBadge.style.display = "inline-flex";
                            autoBadge.textContent = "⚡ Avtomatik tarjima tayyor!";
                        }
                    }
                }
            } catch (e) {}
        }
    }, 450);

    // 3. TAVSIYALAR (SUGGESTIONS)
    typingTimer = setTimeout(async () => {
        try {
            // Avval offline so'zlardan tavsiya
            const offlineMatches = Object.keys(OFFLINE_DICTIONARY)
                .filter(k => k.startsWith(query))
                .slice(0, 4);

            let suggestions = offlineMatches.map(k => ({ word: k, uz: OFFLINE_DICTIONARY[k].uz }));

            // Onlayn tavsiya
            try {
                const res = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(query)}&max=6`);
                if (res.ok) {
                    const data = await res.json();
                    data.forEach(item => {
                        if (!suggestions.some(s => s.word.toLowerCase() === item.word.toLowerCase())) {
                            suggestions.push({
                                word: item.word,
                                uz: OFFLINE_DICTIONARY[item.word.toLowerCase()]?.uz || ""
                            });
                        }
                    });
                }
            } catch (e) {}

            if (suggestions.length > 0) {
                sugBox.innerHTML = "";
                suggestions.slice(0, 8).forEach(item => {
                    const div = document.createElement("div");
                    div.className = "suggestion-item";
                    div.innerHTML = `
                        <div class="sug-left">
                            <span>${item.word}</span>
                            ${item.uz ? `<span class="sug-uz-badge">${item.uz}</span>` : ""}
                        </div>
                        <small style="opacity:0.6; font-size: 11px;">Tanlash ↵</small>
                    `;
                    div.onclick = () => tavsiyaniTanlash(item.word, item.uz);
                    sugBox.appendChild(div);
                });
                sugBox.style.display = "block";
            } else {
                sugBox.style.display = "none";
            }
        } catch (e) {
            sugBox.style.display = "none";
        }
    }, 200);
};

async function tavsiyaniTanlash(word, existingUz = "") {
    document.getElementById("engInput").value = capitalizeWord(word);
    document.getElementById("suggestionsList").style.display = "none";

    const autoBadge = document.getElementById("autoFillBadge");

    if (existingUz) {
        document.getElementById("uzInput").value = existingUz;
        autoBadge.style.display = "inline-flex";
        autoBadge.textContent = "⚡ Tanlangan tarjima";
        return;
    }

    if (OFFLINE_DICTIONARY[word.toLowerCase()]) {
        document.getElementById("uzInput").value = OFFLINE_DICTIONARY[word.toLowerCase()].uz;
        autoBadge.style.display = "inline-flex";
        autoBadge.textContent = "⚡ Lug'atdan tarjima";
        return;
    }

    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|uz`);
        const data = await res.json();
        if (data.responseData && data.responseData.translatedText) {
            document.getElementById("uzInput").value = capitalizeWord(unescapeHtml(data.responseData.translatedText));
            autoBadge.style.display = "inline-flex";
            autoBadge.textContent = "⚡ Avtomatik tarjima tayyor!";
        }
    } catch (e) {}
}

window.aqlliSozQoshish = async function() {
    const engInput = document.getElementById("engInput");
    const uzInput = document.getElementById("uzInput");
    const errorEl = document.getElementById("errorMsg");
    const statusEl = document.getElementById("aiStatus");
    const addBtn = document.getElementById("addWordBtn");

    const rawWord = engInput.value.trim();
    if (!rawWord) {
        errorEl.textContent = "⚠️ Iltimos, inglizcha so'z kiriting!";
        errorEl.style.display = "block";
        return;
    }

    const formattedWord = capitalizeWord(rawWord);
    errorEl.style.display = "none";
    statusEl.style.display = "block";
    statusEl.textContent = "🔍 So'z tekshirilmoqda...";
    addBtn.disabled = true;

    try {
        let phonetic = OFFLINE_DICTIONARY[rawWord.toLowerCase()]?.phonetic || "";
        let pos = OFFLINE_DICTIONARY[rawWord.toLowerCase()]?.pos || "";

        // Agar internet bo'lsa, tezda faqat fonetika va turkumni olamiz (ORTIQCHA GAPSIZ!)
        if (!phonetic) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1200);
                const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(rawWord.toLowerCase())}`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (dictRes.ok) {
                    const dictData = await dictRes.json();
                    if (dictData && dictData[0]) {
                        phonetic = dictData[0].phonetic || (dictData[0].phonetics?.find(p => p.text)?.text || "");
                        if (dictData[0].meanings && dictData[0].meanings[0]) {
                            pos = dictData[0].meanings[0].partOfSpeech || "";
                        }
                    }
                }
            } catch (e) {}
        }

        let uzTranslation = uzInput.value.trim();
        if (!uzTranslation) {
            // Offline lug'at tekshiruvi
            if (OFFLINE_DICTIONARY[rawWord.toLowerCase()]) {
                uzTranslation = OFFLINE_DICTIONARY[rawWord.toLowerCase()].uz;
            } else {
                try {
                    const transRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(rawWord)}&langpair=en|uz`);
                    const transData = await transRes.json();
                    uzTranslation = unescapeHtml(transData.responseData?.translatedText) || "Tarjima";
                } catch (e) {
                    uzTranslation = "Tarjima";
                }
            }
        }

        uzTranslation = capitalizeWord(uzTranslation);

        const backendFaol = await tekshirBackend();
        let newWord = null;

        if (backendFaol) {
            const res = await apiSorov("/words.php", {
                method: "POST",
                body: JSON.stringify({ unit_id: activeUnitId, en: formattedWord, uz: uzTranslation, sentence: "" })
            });
            newWord = res.word;
            newWord.phonetic = phonetic;
            newWord.pos = pos;
        } else {
            const db = getLocalDB();
            newWord = {
                id: Date.now(),
                unit_id: parseInt(activeUnitId),
                en: formattedWord,
                uz: uzTranslation,
                phonetic,
                pos,
                learned: false
            };
            db.words.unshift(newWord);
            saveLocalDB(db);
        }

        activeUnitWords.unshift(newWord);
        showToast(`"${formattedWord}" qo'shildi! ➕`, "success");

        engInput.value = "";
        uzInput.value = "";
        document.getElementById("suggestionsList").style.display = "none";
        document.getElementById("autoFillBadge").style.display = "none";

        currentSubTab = "unlearned";
        document.getElementById("tabUnlearned").classList.add("active");
        document.getElementById("tabLearned").classList.remove("active");

        currentIndex = 0;
        kartochkaniYangila();
        sozlarRoyxatiniChizish();

    } catch (err) {
        errorEl.textContent = "⚠️ " + (err.message || "Xatolik yuz berdi");
        errorEl.style.display = "block";
    } finally {
        statusEl.style.display = "none";
        addBtn.disabled = false;
    }
};

// ===================================
//  11. EKSPORT VA IMPORT
// ===================================

window.hammaMalumotniEksport = async function() {
    try {
        showToast("Eksport tayyorlanmoqda...", "info");
        const exportData = {
            version: "2.0",
            exportDate: new Date().toISOString(),
            units: []
        };

        const backendFaol = await tekshirBackend();
        const db = getLocalDB();

        for (const u of unitlar) {
            let words = [];
            if (backendFaol) {
                words = await apiSorov(`/words.php?unit_id=${u.id}`);
            } else {
                words = db.words.filter(w => w.unit_id === u.id);
            }
            exportData.units.push({
                title: u.title,
                words: words.map(w => ({
                    en: w.en,
                    uz: w.uz,
                    phonetic: w.phonetic || "",
                    pos: w.pos || "",
                    learned: !!w.learned
                }))
            });
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `fleshcard-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        showToast("Lug'atingiz zaxiralandi! 💾", "success");
    } catch (e) {
        showToast("Eksportda xatolik: " + e.message, "error");
    }
};

window.fayldanImportQilish = async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (!data.units || !Array.isArray(data.units)) {
                return showToast("Noto'g'ri JSON format!", "error");
            }

            showToast("Import qilinmoqda...", "info");
            const backendFaol = await tekshirBackend();

            for (const u of data.units) {
                let unitId = null;
                if (backendFaol) {
                    const res = await apiSorov("/units.php", {
                        method: "POST",
                        body: JSON.stringify({ title: u.title || "Import Unit" })
                    });
                    unitId = res.unit.id;
                } else {
                    const user = foydalanuvchiniOlish();
                    const db = getLocalDB();
                    unitId = Date.now() + Math.floor(Math.random() * 1000);
                    db.units.push({
                        id: unitId,
                        user_id: user ? user.id : 1,
                        title: u.title || "Import Unit",
                        created_at: new Date().toISOString()
                    });
                    saveLocalDB(db);
                }

                if (Array.isArray(u.words)) {
                    for (const w of u.words) {
                        if (w.en && w.uz) {
                            if (backendFaol) {
                                await apiSorov("/words.php", {
                                    method: "POST",
                                    body: JSON.stringify({ unit_id: unitId, en: w.en, uz: w.uz, sentence: "" })
                                });
                            } else {
                                const db = getLocalDB();
                                db.words.push({
                                    id: Date.now() + Math.floor(Math.random() * 1000),
                                    unit_id: unitId,
                                    en: w.en,
                                    uz: w.uz,
                                    phonetic: w.phonetic || (OFFLINE_DICTIONARY[w.en.toLowerCase()]?.phonetic || ""),
                                    pos: w.pos || (OFFLINE_DICTIONARY[w.en.toLowerCase()]?.pos || ""),
                                    learned: !!w.learned
                                });
                                saveLocalDB(db);
                            }
                        }
                    }
                }
            }

            showToast("Muvaffaqiyatli import qilindi! 🚀", "success");
            await dashboardniYukla();
        } catch (err) {
            showToast("Import xatosi: " + err.message, "error");
        } finally {
            e.target.value = "";
        }
    };
    reader.readAsText(file);
};

// ===================================
//  12. MAVZU VA KLAVIATURA
// ===================================

function initTheme() {
    const saved = localStorage.getItem("fleshcard_theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    const btn = document.getElementById("themeToggleBtn");
    if (btn) btn.textContent = saved === "dark" ? "🌙" : "☀️";
}

window.mavzuniAlmashtir = function() {
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("fleshcard_theme", next);
    const btn = document.getElementById("themeToggleBtn");
    if (btn) btn.textContent = next === "dark" ? "🌙" : "☀️";
};

document.addEventListener("DOMContentLoaded", () => {
    initTheme();

    if (kirilganmi()) {
        ilovaniKorsat();
    } else {
        document.getElementById("authOverlay").style.display = "flex";
        document.getElementById("mainApp").style.display = "none";
    }

    // Klaviatura shortcutlari
    document.addEventListener("keydown", (e) => {
        const tag = (e.target.tagName || "").toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        if (document.getElementById("editModalOverlay").style.display === "flex") return;
        if (document.getElementById("batchModalOverlay").style.display === "flex") return;
        if (document.getElementById("authOverlay").style.display === "flex") return;

        if (currentMode === "card") {
            if (e.code === "Space") { e.preventDefault(); window.kartochkaniAylantir(); }
            else if (e.code === "ArrowRight") { e.preventDefault(); window.keyingiSoz(); }
            else if (e.code === "ArrowLeft") { e.preventDefault(); window.oldingiSoz(); }
            else if (e.code === "KeyM" || e.code === "Enter") { e.preventDefault(); window.holatniOzgartir(); }
            else if (e.code === "KeyS") { e.preventDefault(); window.talaffuzBosish(); }
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".input-wrapper")) {
            const sugBox = document.getElementById("suggestionsList");
            if (sugBox) sugBox.style.display = "none";
        }
    });
});

console.log("⚡ Fleshcard Pro tayyor!");