/* ===================================================
   Passwort
=================================================== */

const password = prompt("Admin Passwort");

if (!password) {

    document.body.innerHTML = "<h1>Kein Passwort eingegeben.</h1>";

    throw new Error("Kein Passwort");

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

            document.body.innerHTML = "<h1>Zugriff verweigert</h1>";

            return;

        }

        buildApis(data.admin.apis);

        buildCache(data.admin.cache);

        buildSystem(data.admin.system);

    }

    catch (error) {

        console.error(error);

        document.body.innerHTML = "<h1>Admin konnte nicht geladen werden.</h1>";

    }

}

/* ===================================================
   APIs
=================================================== */

function buildApis(apis) {

    document.getElementById("apis-content").innerHTML = `

        ${statusRow(

        "🌀 Blizzard",

        apis.blizzard.online,

        apis.blizzard.responseTime + " ms"

    )}

        ${statusRow(

        "📊 WoWAudit",

        apis.wowaudit.online,

        apis.wowaudit.responseTime + " ms"

    )}

        ${statusRow(

        "⚔ Raider.IO",

        apis.raiderio.online,

        apis.raiderio.responseTime + " ms"

    )}

    `;

}

/* ===================================================
   Cache
=================================================== */

function buildCache(cache) {

    document.getElementById("cache-content").innerHTML = `

        ${infoRow(

        "Status",

        cache.status === "HIT"

            ? "🟢 Cache aktiv"

            : "🟡 Cache wird neu erstellt"

    )}

        ${infoRow(

        "Erstellt",

        cache.updated

            ? formatDate(cache.updated)

            : "-"

    )}

        ${infoRow(

        "Alter",

        formatDuration(cache.age)

    )}

        ${infoRow(

        "Läuft ab in",

        formatDuration(cache.expiresIn)

    )}

        ${infoRow(

        "Cache-Time",

        formatDuration(cache.cacheTime)

    )}

    `;

}

/* ===================================================
   System
=================================================== */

function buildSystem(system) {

    document.getElementById("system-content").innerHTML = `

        ${infoRow(

        "Node.js Version",

        system.nodeVersion

    )}

        ${infoRow(

        "Speicherverbrauch",

        formatMemory(system.memory.heapUsed)

    )}

        ${infoRow(

        "Serverzeit",

        formatDate(system.serverTime)

    )}

        ${infoRow(

        "Uptime",

        formatDuration(system.uptime)

    )}

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