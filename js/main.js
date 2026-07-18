/* ===================================================
   Nächster Raid
=================================================== */

async function loadNextRaid() {

    try {

        const response =
            await fetch("/api/next-raid");

        const data =
            await response.json();

        if (data.message) {

            document.getElementById(
                "next-raid-difficulty"
            ).textContent = data.message;

            return;

        }

        const difficulty =
            document.getElementById("next-raid-difficulty");

        difficulty.classList.remove(
            "difficulty-mythic",
            "difficulty-heroic",
            "difficulty-normal",
            "difficulty-custom"
        );

        const difficultyIcon =
            document.getElementById("next-raid-icon");

        if (data.isCustom) {

            document.getElementById(
                "next-raid-name"
            ).textContent = data.title;

            difficulty.textContent = "Custom";

            difficulty.classList.add("difficulty-custom");

            difficultyIcon.src =
                "../images/icons/custom-mode-icon.png";

        }

        else {

            document.getElementById(
                "next-raid-name"
            ).textContent = data.title;

            difficulty.textContent = data.difficulty;

            switch (data.difficulty.toLowerCase()) {

                case "mythic":

                    difficulty.classList.add("difficulty-mythic");

                    difficultyIcon.src =
                        "../images/icons/mythic-mode-icon.png";

                    break;

                case "heroic":

                case "heroisch":

                    difficulty.classList.add("difficulty-heroic");

                    difficultyIcon.src =
                        "../images/icons/heroic-mode-icon.png";

                    break;

                default:

                    difficulty.classList.add("difficulty-normal");

                    difficultyIcon.src =
                        "../images/icons/normal-mode-icon.png";

            }

        }

        const instances =
            document.getElementById("next-raid-instances");

        if (data.instances && data.instances.length > 0) {

            instances.textContent =
                data.instances.join(" • ");

        }

        else {

            instances.textContent = "";

        }

        const optional =
            document.getElementById("next-raid-optional");

        optional.textContent =
            data.optional ? "⭐ Optional" : "";

        const formattedDate = new Date(data.date).toLocaleDateString(

            "de-DE",

            {

                day: "numeric",

                month: "long",

                year: "numeric"

            }

        );

        document.getElementById(
            "next-raid-date"
        ).innerHTML = `

    ${capitalize(data.weekday)}

    <br>

    ${formattedDate}

    <br>

    ${data.startTime} – ${data.endTime} Uhr

`;

        document.getElementById(
            "next-raid-countdown"
        ).textContent =

            `${data.countdown.days} Tage ${data.countdown.hours} Stunden ${data.countdown.minutes} Minuten`;

        document.getElementById(
            "next-raid-signups"
        ).textContent =

            `${data.presentSize} / ${data.totalSize} Spieler angemeldet`;

        const percent = (data.presentSize / data.totalSize) * 100;

        const progressBar = document.getElementById(
            "next-raid-progress-bar"
        );

        progressBar.style.width = `${percent}%`;

        const marker15 = document.querySelector(".marker-15");
        const marker20 = document.querySelector(".marker-20");
        const marker25 = document.querySelector(".marker-25");

        const label15 = document.querySelector(".label-15");
        const label20 = document.querySelector(".label-20");
        const label25 = document.querySelector(".label-25");

        const marker15Percent = (15 / data.totalSize) * 100;
        const marker20Percent = (20 / data.totalSize) * 100;
        const marker25Percent = (25 / data.totalSize) * 100;

        marker15.style.left = `${marker15Percent}%`;
        marker20.style.left = `${marker20Percent}%`;
        marker25.style.left = `${marker25Percent}%`;

        label15.style.left = `${marker15Percent}%`;
        label20.style.left = `${marker20Percent}%`;
        label25.style.left = `${marker25Percent}%`;

        if (data.presentSize >= 20) {

            progressBar.style.background = "#37d66b";

        }

        else if (data.presentSize >= 15) {

            progressBar.style.background = "#ff9838";

        }

        else {

            progressBar.style.background = "#ff4b4b";

        }

        const panel =
            document.querySelector(".next-raid-panel");

        panel.classList.remove(

            "raid-green",
            "raid-orange",
            "raid-red"

        );

        if (data.presentSize >= 20) {

            panel.classList.add("raid-green");

        }

        else if (data.presentSize >= 15) {

            panel.classList.add("raid-orange");

        }

        else {

            panel.classList.add("raid-red");

        }

        panel.style.cursor = "pointer";

        panel.onclick = () => {

            window.open(

                data.url,

                "_blank"

            );

        };

    }

    catch (error) {

        console.error(

            "Next Raid:",

            error

        );

    }

}

/* ===================================================
   Hilfsfunktionen
=================================================== */

function capitalize(text) {

    return text.charAt(0).toUpperCase() +
        text.slice(1);

}

/* ===================================================
   Initialisierung
=================================================== */

loadNextRaid();

/* ===================================================
   Gildenleitung Accordion
=================================================== */

const teamSection = document.querySelector(".team-section");

if (teamSection) {

    const summary = document.getElementById("team-summary");

    teamSection.addEventListener("toggle", () => {

        summary.textContent = teamSection.open
            ? "Gildenleitung ausblenden"
            : "Gildenleitung anzeigen";

    });

    const leadershipAccordions = document.querySelectorAll(
        ".team-section .accordion"
    );

    leadershipAccordions.forEach(current => {

        current.addEventListener("toggle", () => {

            if (!current.open) return;

            leadershipAccordions.forEach(other => {

                if (other !== current) {

                    other.open = false;

                }

            });

        });

    });

    document.addEventListener("click", (event) => {

        if (!teamSection.open) return;

        if (teamSection.contains(event.target)) return;

        teamSection.open = false;

    });

}

/* ===================================================
   Mobile Navigation
=================================================== */

const mobileMenuButton =
    document.getElementById("mobile-menu-button");

const mobileOverlay =
    document.getElementById("mobile-overlay");

const sidebar =
    document.querySelector(".sidebar");

if (mobileMenuButton && mobileOverlay && sidebar) {

    function closeMenu() {

        sidebar.classList.remove("open");

        mobileOverlay.classList.remove("show");

        mobileMenuButton.innerHTML = "☰";

    }

    mobileMenuButton.addEventListener("click", () => {

        const isOpen = sidebar.classList.contains("open");

        if (isOpen) {

            closeMenu();

        }

        else {

            sidebar.classList.add("open");

            mobileOverlay.classList.add("show");

            mobileMenuButton.innerHTML = "✕";

        }

    });

    mobileOverlay.addEventListener("click", closeMenu);

    document.querySelectorAll(".sidebar-nav a").forEach(link => {

        link.addEventListener("click", closeMenu);

    });

}