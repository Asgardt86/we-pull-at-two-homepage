/* ===================================================
   Discord Community
=================================================== */

async function loadDiscord() {

    try {

        const response = await fetch("/api/homepage");

        const data = await response.json();

        const card = document.getElementById(

            "discord-card"

        );

        if (!data.discord) {

            card.innerHTML = `

                <div class="card-text">

                    Discord ist aktuell nicht verfügbar.

                </div>

            `;

            return;

        }

        card.innerHTML = `

<div class="card-title discord-title">

    <img src="../images/logo/discord-logo.png" alt="Discord">

    <span>${data.discord.name}</span>

</div>

            <div class="card-text">

                <p>

                    🟢 <strong>${data.discord.online}</strong> Mitglieder online

                </p>

<p>

    Raids • Events • Community • Austausch

</p>

                <br><br>

                <a class="button-primary"

                   href="${data.discord.invite}"

                   target="_blank">

                    ↗ Discord beitreten

                </a>

            </div>

        `;

    }

    catch {

        document.getElementById(

            "discord-card"

        ).innerHTML = `

            <div class="card-text">

                Discord konnte nicht geladen werden.

            </div>

        `;

    }

}

loadDiscord();