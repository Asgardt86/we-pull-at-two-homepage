/* ===================================================
   Raid Roster V2
=================================================== */

const ROSTER_CLASS_COLORS = {

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

const RANK_COLORS = {

    Offi: "#3b82f6",
    Raider: "#22c55e",
    Trial: "#f59e0b",
    Member: "#eab308"

};

function createRaidFrame(player) {

    const classColor =
        ROSTER_CLASS_COLORS[player.class] || "#ffffff";

    const rankColor =
        RANK_COLORS[player.rank] || "#6b7280";

    return `

        <div class="raid-frame">

            <div class="raid-frame-header">

                <div class="raid-player">

                    <img
                        src="${player.avatar}"
                        class="raid-avatar"
                        alt="${player.name}"
                    >

                    <span
                        class="raid-name"
                        style="color:${classColor};"
                    >

                        ${player.name}

                    </span>

                </div>

                <div
                    class="raid-rank"
                    style="background:${rankColor};"
                >

                    ${player.rank.toUpperCase()}

                </div>

            </div>

            <div class="raid-healthbar">

                <div
                    class="raid-health-fill"
                    style="background:${classColor}; width:100%;"
                ></div>

            </div>

            <div class="raid-ilvl">

                ilvl ${player.itemLevel}

            </div>

            <div class="raid-tooltip">

                <strong>${player.name}</strong><br>

                ${player.class}<br>

                ${player.role}<br>

                Rang: ${player.rank}<br>

                Itemlevel: ${player.itemLevel}<br>

                ${player.realm}

            </div>

        </div>

    `;

}

function createRole(title, players) {

    let html = `

        <div class="raid-role">

            <div class="raid-role-title">

                ${title}

                <span class="raid-role-count">

                    ${players.length}

                </span>

            </div>

    `;

    players.forEach(player => {

        html += createRaidFrame(player);

    });

    html += `

        </div>

    `;

    return html;

}

async function loadRaidRoster() {

    const container =

        document.getElementById("raid-roster");

    try {

        const response =

            await fetch("/api/raid-roster");

        const data =

            await response.json();

        let html = `

            <div class="raid-roster">

        `;

        html += createRole(

            "🛡 Tanks",

            data.tanks

        );

        html += createRole(

            "❤ Heiler",

            data.heals

        );

        html += createRole(

            "⚔ Nahkampf",

            data.melee

        );

        html += createRole(

            "🏹 Fernkampf",

            data.ranged

        );

        html += `

            </div>

        `;

        container.innerHTML = html;

    }

    catch (error) {

        console.error(error);

        container.innerHTML = `

            <div class="raid-error">

                Raid Roster konnte nicht geladen werden.

            </div>

        `;

    }

}

document.addEventListener(

    "DOMContentLoaded",

    loadRaidRoster

);