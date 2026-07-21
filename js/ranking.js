/* ===================================================
   Raid Ranking
=================================================== */

async function renderRanking(data) {

    try {

        if (data.ranking.empty) {

            document.getElementById("ranking").innerHTML = `

                <div class="ranking-panel">

                    Keine Rankings verfügbar.

                </div>

            `;

            return;

        }

        let html = "";

        data.ranking.raids.forEach(raid => {

            const raidName = raid.name;

            html += `

        <div class="ranking-panel">

            <h4 class="ranking-raid-name">

                ${raidName}

            </h4>

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

        "../images/icons/world-icon.webp",

        "World",

        ranking?.world

    )}

            ${renderRow(

        "../images/icons/eu-icon.webp",

        "Europe",

        ranking?.region

    )}

            ${renderRow(

        "../images/icons/realm-icon.webp",

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
