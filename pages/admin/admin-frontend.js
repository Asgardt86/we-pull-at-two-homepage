/* ===================================================
   Login
=================================================== */

let password =
    sessionStorage.getItem("adminPassword");

const loginScreen =
    document.getElementById("login-screen");

const container =
    document.querySelector(".container");

const passwordInput =
    document.getElementById("login-password");

const loginButton =
    document.getElementById("login-button");

const loginError =
    document.getElementById("login-error");

if (password) {

    showAdmin();

}

else {

    loginScreen.style.display = "flex";

    container.style.display = "none";

    passwordInput.focus();

}

loginButton.addEventListener(

    "click",

    login

);

passwordInput.addEventListener(

    "keydown",

    event => {

        if (event.key === "Enter") {

            login();

        }

    }

);

async function login() {

    password =
        passwordInput.value.trim();

    if (!password) {

        return;

    }

    await loadAdmin();

}

/* ===================================================
   Admin laden
=================================================== */

loadAdmin();

async function loadAdmin() {

    try {

        const response = await fetch(

            `/api/homepage?admin=1&password=${encodeURIComponent(password)}`

        );

        const data = await response.json();

        if (!data.admin?.authorized) {

            loginError.textContent =

                "Falsches Passwort.";

            passwordInput.value = "";

            passwordInput.focus();

            sessionStorage.removeItem(

                "adminPassword"

            );

            return;

        }

        sessionStorage.setItem(

            "adminPassword",

            password

        );

        loginError.textContent = "";

        showAdmin();

        buildApis(data.admin.apis);

        buildCache(data.admin.cache);

        buildSystem(data.admin.system);

    }

    catch (error) {

        console.error(error);

        document.body.innerHTML = "<h1>Admin konnte nicht geladen werden.</h1>";

    }

}

function showAdmin() {

    loginScreen.style.display = "none";

    container.style.display = "block";

}

/* ===================================================
   APIs
=================================================== */

function buildApis(apis) {

    document.getElementById("apis-content").innerHTML = `

        ${apiRow(
        "🌀 Blizzard",
        apis.blizzard.online,
        apis.blizzard.responseTime
    )}

        ${apiRow(
        "📊 WoWAudit",
        apis.wowaudit.online,
        apis.wowaudit.responseTime
    )}

        ${apiRow(
        "⚔ Raider.IO",
        apis.raiderio.online,
        apis.raiderio.responseTime
    )}

    `;

}

/* ===================================================
   Cache
=================================================== */

function buildCache(cache) {

    const html = cache.map(api => `

        <div class="cache-card">

            <h3>

                ${api.name}

            </h3>

            ${infoRow(

        "Status",

        api.status === "HIT"

            ? "🟢 Cache aktiv"

            : "🟡 Wird erstellt"

    )}

            ${infoRow(

        "Erstellt",

        api.updated

            ? formatDate(api.updated)

            : "-"

    )}

            ${infoRow(

        "Alter",

        formatDuration(api.age)

    )}

            ${infoRow(

        "Läuft ab in",

        formatDuration(api.expiresIn)

    )}

            ${infoRow(

        "Cache-Time",

        formatDuration(api.cacheTime)

    )}

${infoRow(

        "History",

        api.historyKey ?? "Keine"

    )}

${infoRow(

        "Archiviert",

        api.lastArchived

            ? formatDate(api.lastArchived)

            : "-"

    )}

<div class="cache-actions">

    <button

        class="cache-button"

        ${api.status !== "HIT" ? "disabled" : ""}

        onclick="clearCache('${api.cacheKey.replace("cache:", "")}')"

    >

        Cache leeren

    </button>

<button

    class="cache-button"

    onclick="rebuildCache('${api.cacheKey.replace("cache:", "")}','${api.endpoint}')"

>

    Neu aufbauen

</button>

</div>

        </div>

    `).join("");

    document.getElementById(

        "cache-content"

    ).innerHTML = html;

}

/* ===================================================
   System
=================================================== */

function buildSystem(system) {

    document.getElementById("system-content").innerHTML = `

        ${systemRow(

        "Node.js Version",

        system.nodeVersion

    )}

        ${systemRow(

        "Speicherverbrauch",

        formatMemory(system.memory.heapUsed)

    )}

        ${systemRow(

        "Serverzeit",

        formatDate(system.serverTime)

    )}

        ${systemRow(

        "Uptime",

        formatDuration(system.uptime)

    )}

    `;

}

/* ===================================================
   API Zeile
=================================================== */

function apiRow(name, online, responseTime) {

    return `

        <div class="api-row">

            <span class="api-name">

                ${name}

            </span>

            <span class="${online ? "online" : "offline"}">

                ${online ? "🟢 Online" : "🔴 Offline"}

            </span>

            <span class="api-time">

                ${responseTime} ms

            </span>

        </div>

    `;

}

/* ===================================================
   System Zeile
=================================================== */

function systemRow(label, value) {

    return `

        <div class="system-row">

            <span class="system-label">

                ${label}

            </span>

            <span class="system-value">

                ${value}

            </span>

        </div>

    `;

}

/* ===================================================
   Status Zeile
=================================================== */

function statusRow(name, online, value) {

    return `

        <div class="row">

            <span class="label">

                ${name}

            </span>

            <span class="value">

                <span class="${online ? "online" : "offline"}">

                    ${online ? "🟢 Online" : "🔴 Offline"}

                </span>

                &nbsp;|&nbsp;

                ${value}

            </span>

        </div>

    `;

}

/* ===================================================
   Info Zeile
=================================================== */

function infoRow(label, value) {

    return `

        <div class="row">

            <span class="label">

                ${label}

            </span>

            <span class="value">

                ${value}

            </span>

        </div>

    `;

}

/* ===================================================
   Sekunden formatieren
=================================================== */

function formatDuration(seconds) {

    if (seconds == null) {

        return "-";

    }

    const days = Math.floor(seconds / 86400);

    seconds %= 86400;

    const hours = Math.floor(seconds / 3600);

    seconds %= 3600;

    const minutes = Math.floor(seconds / 60);

    seconds %= 60;

    if (days > 0) {

        return `${days} T ${hours} Std.`;

    }

    if (hours > 0) {

        return `${hours} Std. ${minutes} Min.`;

    }

    if (minutes > 0) {

        return `${minutes} Min.`;

    }

    return `${seconds} Sek.`;

}

/* ===================================================
   Datum formatieren
=================================================== */

function formatDate(timestamp) {

    return new Date(timestamp).toLocaleString(

        "de-DE"

    );

}

/* ===================================================
   Speicher formatieren
=================================================== */

function formatMemory(bytes) {

    return (

        bytes /

        1024 /

        1024

    ).toFixed(1) + " MB";

}

/* ===================================================
   Cache löschen
=================================================== */

async function clearCache(cache) {

    if (

        !confirm(

            `Cache "${cache}" wirklich löschen?`

        )

    ) {

        return;

    }

    try {

        const response = await fetch(

            `/api/homepage?admin=1&password=${encodeURIComponent(password)}&action=clear-cache&cache=${cache}`

        );

        const result = await response.json();

        console.log(result);

        if (!response.ok || !result.success) {

            alert(JSON.stringify(result));

            return;

        }

        await loadAdmin();

    }

    catch (error) {

        console.error(error);

        alert(

            "Fehler beim Löschen."

        );

    }

}

/* ===================================================
   Cache neu aufbauen
=================================================== */

async function rebuildCache(cache, endpoint) {

    try {

        const clearResponse = await fetch(

            `/api/homepage?admin=1&password=${encodeURIComponent(password)}&action=clear-cache&cache=${cache}`

        );

        const clearResult = await clearResponse.json();

        if (!clearResponse.ok || !clearResult.success) {

            alert(

                clearResult.error ||

                "Cache konnte nicht gelöscht werden."

            );

            return;

        }

        await fetch(endpoint);

        await loadAdmin();

    }

    catch (error) {

        console.error(error);

        alert("Cache konnte nicht aufgebaut werden.");

    }

}

/* ===================================================
   Logout
=================================================== */

function logout() {

    sessionStorage.removeItem(

        "adminPassword"

    );

    location.reload();

}