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

        difficulty.textContent = data.difficulty;

        difficulty.classList.remove(
            "difficulty-mythic",
            "difficulty-heroic",
            "difficulty-normal"
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

        document.getElementById(
            "next-raid-date"
        ).innerHTML = `

            ${capitalize(data.weekday)}

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

        const panel =
            document.querySelector(".next-raid-panel");

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