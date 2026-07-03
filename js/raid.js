async function loadRaidProgress() {

    try {

        const response = await fetch("/api/raid");
        const data = await response.json();

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

const cards = document.querySelectorAll(".difficulty-card");

const timelineTitle = document.getElementById("timeline-title");
const timelineContent = document.getElementById("timeline-content");

const timelines = {

    mythic: {
        title: "Mythic Progress",
        color: "mythic",
        html: `
            <div class="timeline-placeholder">
                Mythic Timeline wird hier angezeigt.
            </div>
        `
    },

    heroic: {
        title: "Heroisch Progress",
        color: "heroic",
        html: `
            <div class="timeline-placeholder">
                Heroisch Timeline wird hier angezeigt.
            </div>
        `
    },

    normal: {
        title: "Normal Progress",
        color: "normal",
        html: `
            <div class="timeline-placeholder">
                Normal Timeline wird hier angezeigt.
            </div>
        `
    }

};

cards.forEach(card => {

    card.addEventListener("click", () => {

        cards.forEach(c => c.classList.remove("active"));

        card.classList.add("active");

        const mode = card.dataset.mode;

        timelineTitle.textContent = timelines[mode].title;

        timelineTitle.classList.remove(
            "mythic",
            "heroic",
            "normal"
        );

        timelineTitle.classList.add(
            timelines[mode].color
        );

        timelineContent.innerHTML =
            timelines[mode].html;

    });

});

loadRaidProgress();
loadBossStatus();

async function loadBossStatus() {

    try {

        const response = await fetch("/api/raid-bosses");

        const data = await response.json();

        renderBossList("mythic", data.mythic);
        renderBossList("heroic", data.heroic);
        renderBossList("normal", data.normal);

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