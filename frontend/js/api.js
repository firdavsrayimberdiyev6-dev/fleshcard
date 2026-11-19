/**
 * api.js — API chaqiruvlari (Dual Engine: PHP Backend + Avtomatik Lokal Fallback)
 * 
 * 1. PHP Server ishlayotgan bo'lsa: SQLite + PHP REST API orqali ishlaydi.
 * 2. PHP Server ishga tushmagan bo'lsa: Lokal ma'lumotlar bazasi (offline rejim) orqali to'liq ishlaydi.
 */

const API_BASE = "/api";
let isBackendAvailable = null; // null = tekshirilmagan, true = PHP faol, false = lokal rejim

// ===== LOKAL BAZA (OFFLINE FALLBACK UCHUN) =====
const LOCAL_DB_KEY = "fleshcard_local_db";

function getLocalDB() {
    let db = localStorage.getItem(LOCAL_DB_KEY);
    if (!db) {
        db = {
            users: [
                { id: 1, username: "demo", email: "demo@fleshcard.uz", password: "password123" }
            ],
            units: [
                { id: 1, user_id: 1, title: "Unit 1: Essential", created_at: new Date().toISOString() }
            ],
            words: [
                { id: 1, unit_id: 1, en: "Achieve", uz: "Erishmoq", phonetic: "/əˈtʃiːv/", pos: "verb", learned: false },
                { id: 2, unit_id: 1, en: "Knowledge", uz: "Bilim", phonetic: "/ˈnɒl.ɪdʒ/", pos: "noun", learned: false },
                { id: 3, unit_id: 1, en: "Success", uz: "Muvaffaqiyat", phonetic: "/səkˈses/", pos: "noun", learned: true }
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

// ===== TOKEN VA FOYDALANUVCHI BOSHQARUVI =====
function tokenniOlish() {
    return localStorage.getItem("fleshcard_token");
}

function tokenniSaqlash(token) {
    localStorage.setItem("fleshcard_token", token);
}

function tokenniOchirish() {
    localStorage.removeItem("fleshcard_token");
    localStorage.removeItem("fleshcard_user");
}

function foydalanuvchiniSaqlash(user) {
    localStorage.setItem("fleshcard_user", JSON.stringify(user));
}

function foydalanuvchiniOlish() {
    const data = localStorage.getItem("fleshcard_user");
    return data ? JSON.parse(data) : null;
}

function chiqish() {
    tokenniOchirish();
    window.location.reload();
}

function kirilganmi() {
    return !!tokenniOlish();
}

// ===== BACKEND ISHGA TUSHGANLIGINI TEKSHIRISH =====
async function tekshirBackend() {
    if (isBackendAvailable !== null) return isBackendAvailable;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const res = await fetch(`${API_BASE}/health`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            isBackendAvailable = true;
            console.log("⚡ PHP Backend faol (SQLite rejimida)");
            return true;
        }
    } catch (e) {
        // Backend javob bermadi
    }

    isBackendAvailable = false;
    console.log("ℹ️ PHP Backend aniqlanmadi — avtomatik Lokal Baza (Offline rejim) yoqildi");
    return false;
}

// ===== UMUMIY FETCH FUNKSIYASI =====
async function apiSorov(endpoint, options = {}) {
    const token = tokenniOlish();
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options.headers
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Serverda xatolik yuz berdi");
    }
    return data;
}

// ===================================
//  1. AUTH API (LOGIN / REGISTER)
// ===================================

async function registerQilish(username, email, password) {
    const backendFaol = await tekshirBackend();

    if (backendFaol) {
        try {
            const data = await apiSorov("/auth.php?action=register", {
                method: "POST",
                body: JSON.stringify({ username, email, password })
            });
            tokenniSaqlash(data.token);
            foydalanuvchiniSaqlash(data.user);
            return data;
        } catch (err) {
            throw err;
        }
    }

    // LOKAL REJIM:
    const db = getLocalDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase());
    if (existing) {
        throw new Error("Bu email yoki foydalanuvchi nomi allaqachon ro'yxatdan o'tgan");
    }

    const newUser = {
        id: Date.now(),
        username,
        email,
        password
    };
    db.users.push(newUser);

    // Standart bo'lim yaratish
    const newUnit = {
        id: Date.now() + 1,
        user_id: newUser.id,
        title: "Unit 1: Essential",
        created_at: new Date().toISOString()
    };
    db.units.push(newUnit);

    // Standart so'zlar
    db.words.push(
        { id: Date.now() + 2, unit_id: newUnit.id, en: "Achieve", uz: "Erishmoq", phonetic: "/əˈtʃiːv/", pos: "verb", learned: false },
        { id: Date.now() + 3, unit_id: newUnit.id, en: "Knowledge", uz: "Bilim", phonetic: "/ˈnɒl.ɪdʒ/", pos: "noun", learned: false },
        { id: Date.now() + 4, unit_id: newUnit.id, en: "Success", uz: "Muvaffaqiyat", phonetic: "/səkˈses/", pos: "noun", learned: false }
    );

    saveLocalDB(db);

    const token = "mock_jwt_token_" + newUser.id;
    const safeUser = { id: newUser.id, username: newUser.username, email: newUser.email };
    tokenniSaqlash(token);
    foydalanuvchiniSaqlash(safeUser);

    return { message: "Muvaffaqiyatli ro'yxatdan o'tdingiz! ✅", token, user: safeUser };
}

async function loginQilish(email, password) {
    const backendFaol = await tekshirBackend();

    if (backendFaol) {
        try {
            const data = await apiSorov("/auth.php?action=login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });
            tokenniSaqlash(data.token);
            foydalanuvchiniSaqlash(data.user);
            return data;
        } catch (err) {
            throw err;
        }
    }

    // LOKAL REJIM:
    const db = getLocalDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== password) {
        throw new Error("Email yoki parol noto'g'ri");
    }

    const token = "mock_jwt_token_" + user.id;
    const safeUser = { id: user.id, username: user.username, email: user.email };
    tokenniSaqlash(token);
    foydalanuvchiniSaqlash(safeUser);

    return { message: "Muvaffaqiyatli kirdingiz! ✅", token, user: safeUser };
}

// ===================================
//  2. UNITS API
// ===================================

async function unitlarniOlish() {
    const backendFaol = await tekshirBackend();
    if (backendFaol) {
        return await apiSorov("/units.php");
    }

    // LOKAL REJIM:
    const user = foydalanuvchiniOlish();
    const db = getLocalDB();
    const userUnits = db.units.filter(u => !user || u.user_id === user.id);

    return userUnits.map(u => {
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

async function unitYaratish(title) {
    const backendFaol = await tekshirBackend();
    if (backendFaol) {
        return await apiSorov("/units.php", {
            method: "POST",
            body: JSON.stringify({ title })
        });
    }

    // LOKAL REJIM:
    const user = foydalanuvchiniOlish();
    const db = getLocalDB();
    const newUnit = {
        id: Date.now(),
        user_id: user ? user.id : 1,
        title: title.trim(),
        created_at: new Date().toISOString()
    };
    db.units.push(newUnit);
    saveLocalDB(db);

    return {
        message: "Bo'lim yaratildi! ✅",
        unit: { id: newUnit.id, title: newUnit.title, total_words: 0, learned_words: 0 }
    };
}

async function unitOchirish(id) {
    const backendFaol = await tekshirBackend();
    if (backendFaol) {
        return await apiSorov(`/units.php?id=${id}`, { method: "DELETE" });
    }

    // LOKAL REJIM:
    const db = getLocalDB();
    db.units = db.units.filter(u => u.id !== id);
    db.words = db.words.filter(w => w.unit_id !== id);
    saveLocalDB(db);

    return { message: "Bo'lim o'chirildi! 🗑️" };
}

// ===================================
//  3. WORDS API
// ===================================

async function sozlarniOlish(unitId) {
    const backendFaol = await tekshirBackend();
    if (backendFaol) {
        return await apiSorov(`/words.php?unit_id=${unitId}`);
    }

    // LOKAL REJIM:
    const db = getLocalDB();
    return db.words.filter(w => w.unit_id === parseInt(unitId));
}

async function sozQoshish(unitId, en, uz, sentence) {
    const backendFaol = await tekshirBackend();
    if (backendFaol) {
        return await apiSorov("/words.php", {
            method: "POST",
            body: JSON.stringify({ unit_id: unitId, en, uz, sentence })
        });
    }

    // LOKAL REJIM:
    const db = getLocalDB();
    const newWord = {
        id: Date.now(),
        unit_id: parseInt(unitId),
        en,
        uz,
        sentence: sentence || "",
        learned: false
    };
    db.words.unshift(newWord);
    saveLocalDB(db);

    return { message: "So'z qo'shildi! ✅", word: newWord };
}

async function sozYangilash(id, data) {
    const backendFaol = await tekshirBackend();
    if (backendFaol) {
        return await apiSorov(`/words.php?id=${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        });
    }

    // LOKAL REJIM:
    const db = getLocalDB();
    const idx = db.words.findIndex(w => w.id === parseInt(id));
    if (idx !== -1) {
        if (data.en) db.words[idx].en = data.en;
        if (data.uz) db.words[idx].uz = data.uz;
        if (data.sentence !== undefined) db.words[idx].sentence = data.sentence;
        if (data.learned !== undefined) db.words[idx].learned = !!data.learned;
        saveLocalDB(db);
    }
    return { message: "So'z yangilandi! ✅" };
}

async function sozOchirish(id) {
    const backendFaol = await tekshirBackend();
    if (backendFaol) {
        return await apiSorov(`/words.php?id=${id}`, { method: "DELETE" });
    }

    // LOKAL REJIM:
    const db = getLocalDB();
    db.words = db.words.filter(w => w.id !== parseInt(id));
    saveLocalDB(db);

    return { message: "So'z o'chirildi! 🗑️" };
}

async function sozHolatiniAlmashtirish(id) {
    const backendFaol = await tekshirBackend();
    if (backendFaol) {
        return await apiSorov(`/words.php?id=${id}&action=toggle`, { method: "PATCH" });
    }

    // LOKAL REJIM:
    const db = getLocalDB();
    const word = db.words.find(w => w.id === parseInt(id));
    if (word) {
        word.learned = !word.learned;
        saveLocalDB(db);
        return { message: "Holat o'zgartirildi! ✅", learned: word.learned };
    }
    throw new Error("So'z topilmadi");
}

// ===================================
//  4. TASHQI APILAR (Tarjima, Lug'at, Autocomplete)
// ===================================

async function tavsiyalarniOlish(query, max = 8) {
    try {
        const res = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(query)}&max=${max}`);
        if (!res.ok) throw new Error("API javob bermadi");
        return await res.json();
    } catch (e) {
        return [];
    }
}

async function sozniTarjimaQilish(word) {
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|uz`);
        const data = await res.json();
        if (data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText.toLowerCase();
        }
        return "";
    } catch (e) {
        return "";
    }
}

async function sozniTekshirish(word) {
    try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`);
        if (!res.ok) return { exists: false, example: "", definition: "" };

        const data = await res.json();
        let example = "";
        let definition = "";

        for (const entry of data) {
            for (const meaning of entry.meanings) {
                for (const def of meaning.definitions) {
                    if (!definition && def.definition) definition = def.definition;
                    if (def.example) { example = def.example; break; }
                }
                if (example) break;
            }
            if (example) break;
        }

        return { exists: true, example, definition };
    } catch (e) {
        return { exists: false, example: "", definition: "" };
    }
}

export {
    // Holat & Auth
    tekshirBackend, registerQilish, loginQilish, chiqish, kirilganmi,
    foydalanuvchiniOlish, tokenniOlish,
    // Units
    unitlarniOlish, unitYaratish, unitOchirish,
    // Words
    sozlarniOlish, sozQoshish, sozYangilash, sozOchirish, sozHolatiniAlmashtirish,
    // Tashqi API
    tavsiyalarniOlish, sozniTarjimaQilish, sozniTekshirish
};
