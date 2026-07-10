/* ===================================================
   Raid Progress
=================================================== */

async function loadRaidProgress() {

    try {

        const response = await fetch("/api/raid");

        const data =
            await response.json();

        renderRaidHistory(

            data.raidHistory || []

        );

        const raid = data.raids.find(
            r => r.slug === data.defaultRaid
        );

        updateDifficulty("mythic", raid.mythic);
        updateDifficulty("heroic", raid.heroic);
        updateDifficulty("normal", raid.normal);

    }

    catch (error) {

        console.error("Raid API:", error);

    }

}

function updateDifficulty(mode, progress) {

    const percent =
        progress.total === 0
            ? 0
            : (progress.completed / progress.total) * 100;

    const progressElement = document.getElementById(`${mode}-progress`);
    const barElement = document.getElementById(`${mode}-bar`);

    if (progressElement) {

        progressElement.textContent =
            `${progress.completed} / ${progress.total}`;

    }

    if (barElement) {

        barElement.style.width = `${percent}%`;

    }

}

/* ===================================================
   Timeline Navigation
=================================================== */

const cards = document.querySelectorAll(".difficulty-card");

const timelineTitle =
    document.getElementById("timeline-title");

const timelineContent =
    document.getElementById("timeline-content");

let bossData = null;

let currentMode = "mythic";

cards.forEach(card => {

    card.addEventListener("click", () => {

        cards.forEach(c =>
            c.classList.remove("active")
        );

        card.classList.add("active");

        currentMode = card.dataset.mode;

        timelineTitle.textContent =
            card.querySelector("h3").textContent;

        timelineTitle.classList.remove(
            "mythic",
            "heroic",
            "normal"
        );

        timelineTitle.classList.add(currentMode);

        loadTimeline(currentMode);

    });

});

/* ===================================================
   Boss Status
=================================================== */

async function loadBossStatus() {

    try {

        const response =
            await fetch("/api/raid-bosses");

        bossData =
            await response.json();

        renderBossList(
            "mythic",
            bossData.mythic
        );

        renderBossList(
            "heroic",
            bossData.heroic
        );

        renderBossList(
            "normal",
            bossData.normal
        );

        loadTimeline(currentMode);

    }

    catch (error) {

        console.error(error);

    }

}

function renderBossList(mode, bosses) {

    const container =
        document.getElementById(`${mode}-bosses`);

    if (!container) return;

    const raids = [

        "Die Leerenspitze",

        "Der Traumriss",

        "Marsch auf Quel'Danas",

        "Sporefall"

    ];

    let html = "";

    raids.forEach(raid => {

        const raidBosses =
            bosses.filter(b => b.raid === raid);

        const remaining =
            raidBosses.filter(b => !b.killed);

        html += `

            <div class="boss-raid-title">

                ${raid}

            </div>

        `;

        if (remaining.length === 0) {

            html += `

                <div class="status-cleared">

                    ✔ Cleared

                </div>

            `;

        }

        else {

            html += `<ul class="boss-list">`;

            remaining.forEach(boss => {

                html += `

                    <li>

                        ${boss.name}

                    </li>

                `;

            });

            html += `</ul>`;

        }

    });

    container.innerHTML = html;

}

/* ===================================================
   Raid Timeline
=================================================== */

async function loadTimeline(mode) {

    try {

        if (!bossData) return;

        const bosses = bossData[mode];

        const raids = [

            "Die Leerenspitze",

            "Der Traumriss",

            "Marsch auf Quel'Danas",

            "Sporefall"

        ];

        let html = "";

        raids.forEach(raid => {

            const raidBosses =
                bosses.filter(b => b.raid === raid);

            html += `

                <div class="timeline-raid">

                    <div class="timeline-raid-title">

                        ${raid}

                    </div>

            `;

            raidBosses.forEach(boss => {

                const status =
                    boss.killed
                        ? "timeline-killed"
                        : "timeline-open";

                const icon =
                    boss.killed
                        ? "✔"
                        : "○";

                const date =
                    boss.killed
                        ? new Date(
                            boss.defeatedAt
                        ).toLocaleDateString("de-DE")
                        : "Noch nicht besiegt";

                html += `

                    <div class="timeline-boss ${status}">

                        <div class="timeline-boss-title">

                            ${icon} ${boss.name}

                        </div>

                        <div class="timeline-boss-date">

                            ${date}

                        </div>

                    </div>

                `;

            });

            html += `</div>`;

        });

        timelineContent.innerHTML = html;

    }

    catch (error) {

        console.error(error);

    }

}

/* ===================================================
   Vergangene Tiers
=================================================== */

function renderRaidHistory(history) {

    const container =

        document.getElementById(

            "raid-history"

        );

    if (!container) return;

    if (history.length === 0) {

        container.innerHTML = `

            <div class="raid-history-panel">

                <div class="hof-empty">

                    Noch keine vergangenen Tiers vorhanden.

                </div>

            </div>

        `;

        return;

    }

    let html = `

        <div class="raid-history-panel">

    `;

    history.forEach(entry => {

        html += `

            <div class="raid-history-entry">

                <div class="raid-history-season">

                    🏆 ${entry.expansion} – Season ${entry.season}

                </div>

        `;

        entry.raids.forEach(raid => {

            html += `

                <div class="raid-history-raid">

                    ${raid.name}

                </div>

                <div class="raid-history-info">

                    ${raid.mythic.completed === raid.mythic.total

                    ? `<div class="raid-history-ce">

                               ★ Cutting Edge erreicht

                           </div>`

                    : `Mythic ${raid.mythic.completed}/${raid.mythic.total}`}

                </div>

            `;

        });

        html += `

                <div class="raid-history-info">

                    <br>

                    Realm Rank <strong>#${entry.realmRank}</strong>

                    <br>

                    World Rank <strong>#${entry.worldRank}</strong>

                </div>

            </div>

        `;

    });

    html += `

        </div>

    `;

    container.innerHTML = html;

}

/* ===================================================
   Initialisierung
=================================================== */

loadRaidProgress();
loadBossStatus();