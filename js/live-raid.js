/* ===================================================
   Live Raid Tracker
=================================================== */

let refreshTimer = null;

/* ===================================================
   Daten laden
=================================================== */

async function loadRaidTracker() {

    const container =
        document.getElementById("raid-tracker");

    try {

        const response =
            await fetch("/api/live-raid");

        const data =
            await response.json();

        if (!data.live && !data.summary) {

            container.innerHTML =
                renderOffline();

            startRefresh(60000);

            return;

        }

        if (data.summary) {

            container.innerHTML =
                renderSummary(data);

            startRefresh(60000);

            attachToggle();

            return;

        }

        container.innerHTML =
            renderLive(data);

        startRefresh(30000);

        attachToggle();

    }

    catch (error) {

        console.error(error);

        container.innerHTML = `

            <div class="live-raid-panel">

                <div class="live-raid-status offline">

                    ⚫ Fehler

                </div>

                <div class="live-raid-message">

                    Der Live Raid Tracker konnte
                    nicht geladen werden.

                </div>

            </div>

        `;

    }

}

/* ===================================================
   Kein Live Raid
=================================================== */

function renderOffline() {

    return `

        <div class="live-raid-panel">

            <div class="live-raid-status offline">

                ⚫ Kein Live Raid

            </div>

            <div class="live-raid-message">

                Der Raid Tracker wird automatisch
                aktiviert, sobald ein Raid beginnt.

            </div>

        </div>

    `;

}

/* ===================================================
   Raid beendet
=================================================== */

function renderSummary(data) {

    let summaryHTML = "";

    Object.entries(data.raidStats).forEach(

        ([difficulty, stats]) => {

            summaryHTML += `

                <div class="live-item">

                    <div class="live-label">

                        ${difficulty}

                    </div>

                    <div class="live-value">

                        ${stats.kills} Boss Kills

                    </div>

                    <div class="live-value">

                        ${stats.pulls} Pulls

                    </div>

                </div>

            `;

        }

    );

    return `

        <div class="live-raid-panel">

            <div class="live-raid-status summary">

                🔴 RAID BEENDET

            </div>

            <div class="live-raid-grid">

                <div class="live-item">

                    <div class="live-label">

                        Raid

                    </div>

                    <div class="live-value">

                        ${data.reportTitle || data.raidName}

                    </div>

                </div>

                <div class="live-item">

                    <div class="live-label">

                        Dauer

                    </div>

                    <div class="live-value">

                        ${data.raidDuration}

                    </div>

                </div>

            </div>

            <div
                class="live-expand"
                onclick="toggleDetails()"
            >

                ▼ Zusammenfassung anzeigen

            </div>

            <div class="live-details">

                <div class="live-raid-grid">

                    ${summaryHTML}

                </div>

                <a

                    class="live-log"

                    href="https://www.warcraftlogs.com/reports/${data.report}"

                    target="_blank"

                >

                    WarcraftLogs öffnen

                </a>

            </div>

        </div>

    `;

}

/* ===================================================
   Live Raid
=================================================== */

function renderLive(data) {

    return `

        <div class="live-raid-panel">

            <div class="live-raid-status live">

                <div class="live-indicator"></div>

                LIVE RAID

            </div>

            <div class="live-raid-grid">

                <div class="live-item">

                    <div class="live-label">

                        Boss

                    </div>

                    <div class="live-value">

                        ${data.boss}

                    </div>

                </div>

                <div class="live-item">

                    <div class="live-label">

                        Schwierigkeit

                    </div>

                    <div class="live-value">

                        ${data.difficulty}

                    </div>

                </div>

                <div class="live-item">

                    <div class="live-label">

                        Raid läuft

                    </div>

                    <div class="live-value">

                        ${data.raidDuration}

                    </div>

                </div>

                <div class="live-item">

                    <div class="live-label">

                        Best Pull

                    </div>

                    <div class="live-value">

                        ${data.bestPull}%

                    </div>

                </div>

            </div>

            <div
                class="live-expand"
                onclick="toggleDetails()"
            >

                ▼ Mehr anzeigen

            </div>

            <div class="live-details">

                <div class="live-raid-grid">

                    <div class="live-item">

                        <div class="live-label">

                            Pulls

                        </div>

                        <div class="live-value">

                            ${data.totalPulls}

                        </div>

                    </div>

                </div>

                ${createTimeline(data.timeline)}

                <a

                    class="live-log"

                    href="https://www.warcraftlogs.com/reports/${data.report}"

                    target="_blank"

                >

                    WarcraftLogs öffnen

                </a>

            </div>

        </div>

    `;

}

/* ===================================================
   Progress Timeline
=================================================== */

function createTimeline(timeline) {

    if (!timeline || timeline.length === 0) {

        return "";

    }

    let html = `

        <div class="live-details-section">

            <div class="live-label">

                Progress Timeline

            </div>

    `;

    timeline.forEach((pull, index) => {

        const best =
            index === timeline.length - 1;

        html += `

            <div class="ranking-row">

                <div class="ranking-label">

                    Pull ${pull.pull}

                </div>

                <div class="ranking-value">

                    ${pull.percent}%

                    ${best ? "⭐" : ""}

                </div>

            </div>

        `;

    });

    html += `</div>`;

    return html;

}

/* ===================================================
   Details ein-/ausklappen
=================================================== */

function toggleDetails() {

    const details =
        document.querySelector(".live-details");

    const button =
        document.querySelector(".live-expand");

    if (!details || !button) {

        return;

    }

    details.classList.toggle("open");

    if (details.classList.contains("open")) {

        button.textContent =
            "▲ Weniger anzeigen";

    }

    else {

        button.textContent =
            button.textContent.includes("Zusammenfassung")
                ? "▼ Zusammenfassung anzeigen"
                : "▼ Mehr anzeigen";

    }

}

/* ===================================================
   Toggle vorbereiten
=================================================== */

function attachToggle() {

    const details =
        document.querySelector(".live-details");

    if (details) {

        details.classList.remove("open");

    }

}

/* ===================================================
   Aktualisierung
=================================================== */

function startRefresh(interval) {

    if (refreshTimer) {

        clearInterval(refreshTimer);

    }

    refreshTimer = setInterval(

        loadRaidTracker,

        interval

    );

}

/* ===================================================
   Initialisierung
=================================================== */

loadRaidTracker();