/* ===================================================
   Raid Roster
=================================================== */

const RAID_CLASS_COLORS = {

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

const RAID_CLASS_ICONS = {

    "Death Knight": "deathknight",
    "Demon Hunter": "demonhunter",
    "Druid": "druid",
    "Evoker": "evoker",
    "Hunter": "hunter",
    "Mage": "mage",
    "Monk": "monk",
    "Paladin": "paladin",
    "Priest": "priest",
    "Rogue": "rogue",
    "Shaman": "shaman",
    "Warlock": "warlock",
    "Warrior": "warrior"

};

const RAID_RANK_COLORS = {

    Offi: "#3b82f6",
    Raider: "#22c55e",
    Trial: "#f59e0b",
    Alt: "#a855f7",
    Member: "#eab308"

};
function createRaidFrame(player) {

    const color =
        RAID_CLASS_COLORS[player.class] || "#ffffff";

    const icon =
        RAID_CLASS_ICONS[player.class];

    const rankColor =
        RAID_RANK_COLORS[player.rank] || "#6b7280";

    const iconUrl =
        `https://wow.zamimg.com/images/wow/icons/medium/class_${icon}.jpg`;

    return `

        <div class="raid-frame">

            <div class="raid-frame-top">

                <div class="raid-player">

                    <img
                        src="${iconUrl}"
                        alt="${player.class}"
                        class="raid-class-icon"
                    >

                    <span
                        class="raid-player-name"
                        style="color:${color};"
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
                    style="background:${color}; width:100%;"
                ></div>

            </div>

        </div>

    `;

}
async function loadRaidRoster() {

    const container = document.getElementById("raid-roster");

    try {

        const response =
            await fetch("/api/raid-roster");

        const data =
            await response.json();

        let html = `

            <div class="raid-roster-panel">

                <div class="raid-summary">

                    <div class="raid-total">

                        ${data.total} Charaktere

                    </div>

                    <div class="raid-counts">

                        <span>🛡 ${data.tanks.length}</span>
                        <span>❤ ${data.heals.length}</span>
                        <span>⚔ ${data.melee.length}</span>
                        <span>🏹 ${data.ranged.length}</span>

                    </div>

                </div>

                <div class="raid-grid">

        `;

        const groups = [

            {
                title: "🛡 Tanks",
                players: data.tanks
            },

            {
                title: "❤ Heiler",
                players: data.heals
            },

            {
                title: "⚔ Nahkampf",
                players: data.melee
            },

            {
                title: "🏹 Fernkampf",
                players: data.ranged
            }

        ];

        groups.forEach(group => {

            html += `

                <div class="raid-role">

                    <div class="raid-role-title">

                        ${group.title}
                        (${group.players.length})

                    </div>

            `;

            group.players.forEach(player => {

                html += createRaidFrame(player);

            });

            html += `

                </div>

            `;

        });

        html += `

                </div>

            </div>

        `;

        container.innerHTML = html;

    }

    catch (error) {

        console.error(error);

        container.innerHTML = `

            <div class="raid-roster-panel">

                Raid Roster konnte nicht geladen werden.

            </div>

        `;

    }

}

document.addEventListener(

    "DOMContentLoaded",

    loadRaidRoster

);