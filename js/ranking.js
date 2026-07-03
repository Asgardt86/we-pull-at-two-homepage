/* ===================================================
   Raid Ranking
=================================================== */

async function loadRanking() {

    try {

        const response =
            await fetch("/api/ranking");

        const data =
            await response.json();

        if (data.empty) {

            document.getElementById("ranking").innerHTML = `

                <div class="ranking-panel">

                    Keine Rankings verfügbar.

                </div>

            `;

            return;

        }

        let html = "";

        data.raids.forEach(raid => {

            const raidName = raid.slug

                .replace(/^tier-/, "")

                .replace(/-/g, " ")

                .replace(/\b\w/g, letter => letter.toUpperCase());

            html += `

        <div class="ranking-panel">

            <h3 class="ranking-raid-name">

                ${raidName}

            </h3>

            <div class="ranking-grid">

                ${renderCard(
                "Mythic",
                "mythic",
                raid.mythic
            )}

                ${renderCard(
                "Heroisch",
                "heroic",
                raid.heroic
            )}

                ${renderCard(
                "Normal",
                "normal",
                raid.normal
            )}

            </div>

        </div>

    `;

        });

        document.getElementById("ranking").innerHTML = html;

    }

    catch (error) {

        console.error(error);

        document.getElementById(
            "ranking"
        ).innerHTML = `

            <div class="ranking-panel">

                Fehler beim Laden.

            </div>

        `;

    }

}

/* ===================================================
   Ranking Card
=================================================== */

function renderCard(
    title,
    cssClass,
    ranking
) {

    return `

        <div class="ranking-card ${cssClass}">

            <div class="ranking-title ${cssClass}">

                ${title}

            </div>

            ${renderRow(

        "../images/icons/world-icon.png",

        "World",

        ranking?.world

    )}

            ${renderRow(

        "../images/icons/eu-icon.png",

        "Europe",

        ranking?.region

    )}

            ${renderRow(

        "../images/icons/realm-icon.png",

        "Realm",

        ranking?.realm

    )}

        </div>

    `;

}

/* ===================================================
   Ranking Row
=================================================== */

function renderRow(
    icon,
    label,
    value
) {

    return `

        <div class="ranking-row">

            <div class="ranking-label">

                <img
                    src="${icon}"
                    alt="${label}"
                >

                ${label}

            </div>

            <div class="ranking-value">

                ${formatRank(value)}

            </div>

        </div>

    `;

}

/* ===================================================
   Rank Formatierung
=================================================== */

function formatRank(rank) {

    if (!rank) {

        return "-";

    }

    return `#${rank}`;

}

/* ===================================================
   Initialisierung
=================================================== */

loadRanking();