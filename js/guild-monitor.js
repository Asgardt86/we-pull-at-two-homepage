async function loadGuildMonitor() {

    try {

        const response = await fetch("/api/guild-monitor");

        if (!response.ok) {

            throw new Error("Guild Monitor konnte nicht geladen werden.");

        }

        const data = await response.json();

        const isDeveloper =
            location.hostname === "localhost" ||
            !!localStorage.getItem("adminPassword");

        if (isDeveloper) {

            console.group("Guild Monitor - Boss Slugs");

        }

        const container = document.getElementById("guild-monitor");

        container.innerHTML = "";

        data.bosses.forEach(boss => {

            if (isDeveloper) {

                console.log(`${boss.boss} → ${boss.slug}.webp`);

            }

            const badgeClass = `${data.raid.difficulty.toLowerCase()}${boss.lastPull.success ? "" : " progress"}`;

            const badgeTitle = `${boss.lastPull.success ? "⭐ " : ""}${data.raid.difficulty.toUpperCase()}`;

            const badgeSubtitle = boss.lastPull.success
                ? "FIRST KILL"
                : "BEST PULL";

            const card = document.createElement("div");
            card.style.cursor = "pointer";

            card.onclick = () => {

                window.location.href =
                    `/pages/raid-composition.html` +
                    `?boss=${encodeURIComponent(boss.slug)}` +
                    `&raid=${encodeURIComponent(boss.raid)}` +
                    `&name=${encodeURIComponent(boss.boss)}` +
                    `&difficulty=${encodeURIComponent(boss.difficulty)}` +
                    `&image=${encodeURIComponent(boss.image)}`;

            };

            card.className = `guild-monitor-card ${boss.lastPull.success ? "boss-killed" : "boss-progress"}`;

            card.innerHTML = `

                <div class="guild-monitor-image">

                    <div class="guild-monitor-badge ${badgeClass}">

                        <div class="badge-line1">

                            ${badgeTitle}

                        </div>

                        <div class="badge-line2">

                            ${badgeSubtitle}

                        </div>

                    </div>

                    <img
                        src="${boss.image}"
                        alt="${boss.boss}"
                    >

                </div>

                <div class="guild-monitor-content">

                    <div class="guild-monitor-title">

                        ${boss.boss}

                    </div>

                    <div class="guild-monitor-status ${boss.lastPull.success ? "success" : "progress"}">

                        ${boss.lastPull.success ? "✔ Besiegt" : "⌛ In Progress"}

                    </div>

                    ${boss.lastPull.success ? "" : `

                        <div class="guild-monitor-progress">

                            Progress: ${boss.lastPull.progress}

                        </div>

                    `}

                    <div class="guild-monitor-stats">

                        <div>

                            <strong>Pulls</strong><br>
                            ${boss.pullCount}

                        </div>

                        <div>

                            <strong>Dauer</strong><br>
                            ${boss.lastPull.duration}

                        </div>

                        <div>

                            <strong>Spieler</strong><br>
                            ${boss.lastPull.members}

                        </div>

                        <div>

                            <strong>Tode</strong><br>
                            ${boss.lastPull.deaths}

                        </div>

                    </div>

                </div>

            `;

            const image = card.querySelector("img");

            image.onerror = () => {

                image.onerror = null;

                image.src = "/images/boss-images/placeholder.webp";

                if (isDeveloper) {

                    console.warn(`⚠ Bossbild fehlt: ${boss.slug}.webp`);

                }

            };

            container.appendChild(card);

        });

        if (isDeveloper) {

            console.groupEnd();

        }

    }

    catch (err) {

        console.error(err);

    }

}

loadGuildMonitor();