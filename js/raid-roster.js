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

        <a

    class="raid-frame"

    href="https://worldofwarcraft.blizzard.com/de-de/character/eu/${player.realmSlug}/${player.characterSlug}"

    target="_blank"

    rel="noopener noreferrer"

>

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

    <div class="tooltip-name">

        ${player.name}

    </div>

    <div class="tooltip-realm">

        ${player.realm}

    </div>

    <hr>

    <div>

        <strong>Klasse:</strong> ${player.class}

    </div>

    <div>

        <strong>Rolle:</strong> ${player.role === "Tank" ? "Tank" :
            player.role === "Heal" ? "Heiler" :
                player.role === "Melee" ? "Nahkampf" :
                    "Fernkampf"
        }

    </div>

    <div>

        <strong>Rang:</strong> ${player.rank}

    </div>

    <div>

        <strong>Itemlevel:</strong> ${player.itemLevel}

    </div>

    <hr>

    <div class="tooltip-link">

        ↗ Blizzard Charakterprofil öffnen

    </div>

</div>

        </a>

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

            '<img src="../images/role-icons/tank-role-icon.png" class="role-icon"> Tanks',

            data.tanks

        );

        html += createRole(

            '<img src="../images/role-icons/heal-role-icon.png" class="role-icon"> Heiler',

            data.heals

        );

        html += createRole(

            '<img src="../images/role-icons/meele-role-icon.png" class="role-icon"> Melees',

            data.melee

        );

        html += createRole(

            '<img src="../images/role-icons/range-role-icon.png" class="role-icon"> Ranges',

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