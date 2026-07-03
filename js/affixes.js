/* ===================================================
   Mythic+ Affixe
=================================================== */

async function loadAffixes() {

    const container =
        document.getElementById("affixes");

    try {

        const response =
            await fetch("/api/affixes");

        const data =
            await response.json();

        if (!data.active) {

            container.innerHTML = `

                <div class="affixes-panel">

                    <div class="affixes-empty">

                        ${data.message}

                    </div>

                </div>

            `;

            return;

        }

        let html = `

            <div class="affixes-panel">

        `;

        data.affixes.forEach(affix => {

            html += `

                <div class="affix">

                    <img
                        src="${affix.icon}"
                        alt="${affix.name}"
                    >

                    <div class="affix-content">

                        <div class="affix-name">

                            ${affix.name}

                        </div>

                        <div class="affix-description">

                            ${affix.description}

                        </div>

                    </div>

                </div>

            `;

        });

        html += `

            </div>

        `;

        container.innerHTML = html;

    }

    catch (error) {

        console.error(error);

        container.innerHTML = `

            <div class="affixes-panel">

                <div class="affixes-empty">

                    Affixe konnten nicht geladen werden.

                </div>

            </div>

        `;

    }

}

/* ===================================================
   Initialisierung
=================================================== */

loadAffixes();