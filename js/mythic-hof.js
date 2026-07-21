/* ===================================================
   Mythic+ Hall of Fame
=================================================== */

const CLASS_COLORS = {

    1: "#C79C6E",
    2: "#F58CBA",
    3: "#ABD473",
    4: "#FFF569",
    5: "#FFFFFF",
    6: "#C41F3B",
    7: "#0070DE",
    8: "#69CCF0",
    9: "#9482C9",
    10: "#00FF96",
    11: "#FF7D0A",
    12: "#A330C9",
    13: "#33937F"

};

async function loadMythicHOF() {

    const container =
        document.getElementById("mythic-hof");

    try {

        const response =
            await fetch("/api/mythic-hof");

        const data =
            await response.json();

        if (

            !data.players ||

            data.players.length === 0

        ) {

            container.innerHTML = `

                <div class="hof-panel">

                    <div class="hof-empty">

                        Noch keine Mythic+ Daten vorhanden.

                    </div>

                </div>

            `;

            return;

        }

        let html = `

            <div class="hof-panel">

        `;

        data.players.forEach((player, index) => {

            const color =
                CLASS_COLORS[player.classId] || "#ffffff";

            let rank = `#${index + 1}`;

            let extraClass = "";

            if (index === 0) {

                rank = "👑";

                extraClass = "hof-first";

            }

            else if (index === 1) {

                rank = "🥈";

                extraClass = "hof-second";

            }

            else if (index === 2) {

                rank = "🥉";

                extraClass = "hof-third";

            }

            html += `

    <div class="hof-player ${extraClass}">

        <div class="hof-left">

            <div class="hof-rank">

                ${rank}

            </div>

            <div>

                <div
                    class="hof-name"
                    style="color:${color};"
                >

                    ${player.name}

                </div>

                <div class="hof-more-details">

                ▼ More Details

                </div>

            </div>

        </div>

        <div class="hof-right">

            <div
                class="hof-score"
                data-player="${player.name}"
                data-score="${player.score}"
            >

                <img
                    src="../images/icons/m+key-icon.webp"
                    alt="Mythic+"
                >

                ${player.score}

            </div>

        </div>

    </div>

<div class="hof-details">

    <div
        class="hof-details-content"

        style="background-image:
        linear-gradient(rgba(15,19,24,.65), rgba(15,19,24,.65)),
        url('${player.bestDungeonBackground}');
        background-size: cover;
        background-position: center;"
    >

        <div class="hof-character">

            <img

                src="${player.thumbnailUrl}"

                class="hof-character-image"

                alt="${player.name}"

            >

            <div class="hof-character-info">

                <div class="hof-character-name">

                    ${player.name}

                </div>

                <div class="hof-character-spec">

    ${player.activeSpec}

    (${player.activeRole})

</div>

<div class="hof-character-race">

    ${player.race}

    •

    ${player.gender}

    •

    ${player.faction}

</div>

            </div>

        </div>

        <div class="hof-detail-section">

    <div class="hof-detail-title">

        🏆 Beste Dungeons

    </div>

    

${(player.bestDungeons || []).map(run => `

<div class="hof-detail-run">

    <div class="hof-run-left">

        <img

            src="${run.icon || ""}"

            class="hof-dungeon-small"

        >

        <span>

            +${run.key}

            ${run.dungeon}

        </span>

    </div>

    <strong>

        ${(run.score || 0).toFixed(1)}

    </strong>

</div>

`).join("")}

</div>

<div class="hof-detail-section">

    <div class="hof-detail-title">

        📅 Last Run

    </div>

    ${player.recentRun ? `

        <div class="hof-detail-run">

            <div class="hof-run-left">

                <img
                    src="${player.recentRun.icon || ""}"
                    class="hof-dungeon-small"
                >

                <div>

                    <div>

                        +${player.recentRun.key}
                        ${player.recentRun.dungeon}

                    </div>

                    <div class="hof-last-run-date">

                        ${player.recentRun.completed}

                    </div>

                </div>

            </div>

        </div>

    ` : `

        <div class="hof-last-run-date">

            Keine Daten vorhanden.

        </div>

    `}

</div>

        <div class="hof-detail-row">

            <a
                class="hof-detail-link"
                href="${player.raiderIo}"
                target="_blank"
            >
                ↗ Raider.IO Profil öffnen
            </a>

        </div>

    </div>

</div>

`;

        });

        html += `

            </div>

        `;

        container.innerHTML = html;

        animateScoreChanges();

        initHallOfFameDetails();

    }

    catch (error) {

        console.error(error);

        container.innerHTML = `

            <div class="hof-panel">

                <div class="hof-empty">

                    Fehler beim Laden der Hall of Fame.

                </div>

            </div>

        `;

    }

}

/* ===================================================
   Score Animation
=================================================== */

function animateScoreChanges() {

    const scores =
        document.querySelectorAll(".hof-score");

    scores.forEach(score => {

        const player =
            score.dataset.player;

        const newScore =
            score.dataset.score;

        const storageKey =
            "mplus-score-" + player;

        const oldScore =
            localStorage.getItem(storageKey);

        if (

            oldScore &&

            oldScore !== newScore

        ) {

            score.classList.add("score-update");

            setTimeout(() => {

                score.classList.remove("score-update");

            }, 900);

        }

        localStorage.setItem(

            storageKey,

            newScore

        );

    });

}

/* ===================================================
  Hall of Fame Details
=================================================== */

function initHallOfFameDetails() {

    const players = document.querySelectorAll(".hof-player");

    const details = document.querySelectorAll(".hof-details");

    players.forEach((player, index) => {

        player.addEventListener("click", () => {

            const isOpen = details[index].classList.contains("open");

            details.forEach(detail => {

                detail.classList.remove("open");

            });

            if (!isOpen) {

                details[index].classList.add("open");

            }

        });

    });

    document.addEventListener("click", (event) => {

        if (!event.target.closest(".hof-player") &&
            !event.target.closest(".hof-details")) {

            details.forEach(detail => {

                detail.classList.remove("open");

            });

        }

    });

}

/* ===================================================
   Initialisierung
=================================================== */

document.addEventListener(

    "DOMContentLoaded",

    loadMythicHOF

);