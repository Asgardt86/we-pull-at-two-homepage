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

        const difficultyIcon =
            document.getElementById("next-raid-icon");

        if (!data.raid) {

            document.getElementById(
                "next-raid-name"
            ).textContent = "Custom";

            difficulty.textContent = "Custom";

            difficulty.classList.remove(
                "difficulty-mythic",
                "difficulty-heroic",
                "difficulty-normal",
                "difficulty-custom"
            );

            difficulty.classList.add("difficulty-custom");

            difficultyIcon.src =
                "../images/icons/custom-mode-icon.png";

            console.log(difficultyIcon.src);

        }

        else {

            document.getElementById(
                "next-raid-name"
            ).textContent = data.raid;

            difficulty.textContent = data.difficulty;

            difficulty.classList.remove(
                "difficulty-mythic",
                "difficulty-heroic",
                "difficulty-normal",
                "difficulty-custom"
            );

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

            `${data.countdown.days} Tage ${data.countdown.hours} Stunden`;

        document.getElementById(
            "next-raid-signups"
        ).textContent =

            `${data.presentSize} / ${data.totalSize} Spieler angemeldet`;

        const percent = (data.presentSize / data.totalSize) * 100;

        const progressBar = document.getElementById(
            "next-raid-progress-bar"
        );

        progressBar.style.width = `${percent}%`;

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

}