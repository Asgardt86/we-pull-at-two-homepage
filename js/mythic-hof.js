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

            <div class="hof-dungeon">

                +${player.bestKey} ${player.bestDungeon}

            </div>

            <div class="hof-bar">

                <div
                    class="hof-bar-fill ${extraClass}"
                    style="width:${(player.score / data.players[0].score) * 100}%"
                ></div>

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
                src="../images/icons/m+key-icon.png"
                alt="Mythic+"
            >

            ${player.score}

        </div>

        <a

            class="hof-link"

            href="${player.raiderIo}"

            target="_blank"

        >

            ↗ Raider.IO Profil

        </a>

    </div>

</div>

            `;

        });

        html += `

            </div>

        `;

        container.innerHTML = html;

        animateScoreChanges();

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
   Initialisierung
=================================================== */

document.addEventListener(

    "DOMContentLoaded",

    loadMythicHOF

);