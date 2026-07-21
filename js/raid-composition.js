const params = new URLSearchParams(window.location.search);

const bossSlug = params.get("boss");
const raidSlug = params.get("raid");
const bossName = params.get("name");
const bossDifficulty = params.get("difficulty");
const bossImage = params.get("image");

const CLASS_COLORS = {

    "Death Knight": "#C41F3B",
    "Demon Hunter": "#A330C9",
    "Druid": "#FF7D0A",
    "Evoker": "#33937F",
    "Hunter": "#ABD473",
    "Mage": "#69CCF0",
    "Monk": "#00FF96",
    "Paladin": "#F58CBA",
    "Priest": "#FFFFFF",
    "Rogue": "#FFF569",
    "Shaman": "#0070DE",
    "Warlock": "#9482C9",
    "Warrior": "#C79C6E"

};

document.getElementById("boss-name").textContent =
    bossName || "Unbekannter Boss";

const difficultyElement =
    document.getElementById("boss-difficulty");

difficultyElement.textContent =
    (bossDifficulty || "").toUpperCase();

difficultyElement.className =
    (bossDifficulty || "").toLowerCase();

document.getElementById("boss-image").src =
    bossImage || "/images/boss-images/placeholder.webp";

const tankContainer = document.getElementById("tank-container");
const healerContainer = document.getElementById("healer-container");
const dpsContainer = document.getElementById("dps-container");

function createPlayerCard(player) {

    const classColor =
        CLASS_COLORS[player.class] || "#ffffff";

    const card = document.createElement("div");

    card.className = "player-card";

    card.innerHTML = `

        <img
            class="player-avatar"
            src="${player.thumbnail}"
            alt="${player.name}">

        <div class="player-info">

            <div
                class="player-name"
                style="color:${classColor};"
            >
                ${player.name}
            </div>

            <div class="player-spec">
                ${player.spec} ${player.class}
            </div>

            <div class="player-realm">
                ${player.realm}
            </div>

            <div class="player-ilvl">
                Itemlevel ${player.itemLevel.toFixed(1)}
            </div>

        </div>

    `;

    return card;

}

async function loadRaidComposition() {

    try {

        const response = await fetch(
            `/api/guild-monitor` +
            `?boss=${encodeURIComponent(bossSlug)}` +
            `&raid=${encodeURIComponent(raidSlug)}` +
            `&difficulty=${encodeURIComponent(bossDifficulty)}`
        );

        if (!response.ok) {

            throw new Error("API konnte nicht geladen werden.");

        }

        const data = await response.json();

        document.getElementById("boss-pulls").textContent =
            data.boss.pullCount;

        document.getElementById("boss-progress").textContent =
            data.boss.lastPull.progress;

        document.getElementById("boss-date").textContent =
            data.boss.lastPull.date;

        document.getElementById("boss-duration").textContent =
            data.boss.lastPull.duration;

        document.getElementById("boss-deaths").textContent =
            data.boss.lastPull.deaths;

        data.roster.forEach(player => {

            const card = createPlayerCard(player);

            switch (player.role) {

                case "tank":
                    tankContainer.appendChild(card);
                    break;

                case "healer":
                    healerContainer.appendChild(card);
                    break;

                default:
                    dpsContainer.appendChild(card);

            }

        });

    }

    catch (err) {

        console.error(err);

    }

}

loadRaidComposition();