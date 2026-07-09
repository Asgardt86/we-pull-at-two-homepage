/* ===================================================
   Zeit berechnen
=================================================== */

function timeAgo(timestamp) {

    const now =
        Date.now();

    const diff =
        now - timestamp;

    const minutes =
        Math.floor(diff / 60000);

    const hours =
        Math.floor(diff / 3600000);

    const days =
        Math.floor(diff / 86400000);

    if (minutes < 60) {

        return `vor ${minutes} Minuten`;

    }

    if (hours < 24) {

        return `vor ${hours} Stunden`;

    }

    return `vor ${days} Tagen`;

}

/* ===================================================
   Gildenaktivität laden
=================================================== */

async function loadActivity() {

    const container =
        document.getElementById("activity");

    try {

        /* ===================================================
           API-Daten laden
        =================================================== */

        const [

            activityResponse,

            achievementResponse

        ] = await Promise.all([

            fetch("/api/activity"),

            fetch("/api/guild-achievements")

        ]);

        const activityData =
            await activityResponse.json();

        const achievementData =
            await achievementResponse.json();

        /* ===================================================
           HTML-Container
        =================================================== */

        let html = `

            <div class="activity-panel">

        `;

        /* ===================================================
    Charakteraktivitäten
 =================================================== */

        html += `

    <div class="activity-section">

        <div class="activity-title">

            Charakteraktivitäten

        </div>

`;

        if (

            activityData.activities &&
            activityData.activities.length > 0

        ) {

            activityData.activities.forEach(entry => {

                let text = "";

                /* ===================================================
                   Charakter-Erfolge
                =================================================== */

                if (entry.type === "achievement") {

                    text = `

                🎯

                <span style="color:${entry.color}; font-weight:700;">

                    ${entry.player}

                </span>

                hat den Erfolg

                "<strong>${entry.achievement}</strong>"

                erhalten

            `;

                }

                /* ===================================================
                   Levelaufstiege
                =================================================== */

                else if (entry.type === "level") {

                    text = `

                ⭐

                <span style="color:${entry.color}; font-weight:700;">

                    ${entry.player}

                </span>

                hat Level

                <strong>${entry.level}</strong>

                erreicht

            `;

                }

                html += `

            <div class="activity-entry">

                <div class="activity-text">

                    ${text}

                </div>

                <div class="activity-time">

                    ${timeAgo(entry.timestamp)}

                </div>

            </div>

        `;

            });

        }

        else {

            html += `

        <div class="activity-empty">

            Keine aktuellen Charakteraktivitäten vorhanden.

        </div>

    `;

        }

        html += `

    </div>

`;

        /* ===================================================
           Gildenerfolge
        =================================================== */

        if (

            achievementData.achievements &&
            achievementData.achievements.length > 0

        ) {

            html += `

        <div class="activity-section">

            <div class="activity-title">

                Letzte Gildenerfolge

            </div>

    `;

            achievementData.achievements.forEach(entry => {

                const date = new Date(

                    entry.timestamp

                ).toLocaleDateString("de-DE");

                html += `

            <div class="activity-entry">

                <div class="activity-text">

                    🏆

                    <span class="guild-name">

                        We Pull at Two

                    </span>

                    hat den Erfolg

                    "<strong>${entry.name}</strong>"

                    erhalten

                    <div class="activity-achievement-description">

                        ${entry.description}

                    </div>

                </div>

                <div class="activity-time">

                    ${date}

                </div>

            </div>

        `;

            });

            html += `

        </div>

    `;

        }

        /* ===================================================
           Keine Aktivitäten
        =================================================== */

        if (

            !activityData.activities?.length &&
            !achievementData.achievements?.length

        ) {

            html += `

        <div class="activity-empty">

            Keine aktuellen Aktivitäten vorhanden.

        </div>

    `;

        }

        /* ===================================================
           HTML ausgeben
        =================================================== */

        html += `

    </div>

`;

        container.innerHTML = html;

    }

    /* ===================================================
       Fehler beim Laden
    =================================================== */

    catch (error) {

        console.error(error);

        container.innerHTML = `

        <div class="activity-panel">

            <div class="activity-empty">

                Gildenaktivitäten konnten nicht geladen werden.

            </div>

        </div>

    `;

    }

}

/* ===================================================
   Initialisierung
=================================================== */

document.addEventListener(

    "DOMContentLoaded",

    loadActivity

);