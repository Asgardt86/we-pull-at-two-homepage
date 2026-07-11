const CLASS_ICONS = {

    "Warrior": "warrior",
    "Paladin": "paladin",
    "Hunter": "hunter",
    "Rogue": "rogue",
    "Priest": "priest",
    "Death Knight": "deathknight",
    "Shaman": "shaman",
    "Mage": "mage",
    "Warlock": "warlock",
    "Monk": "monk",
    "Druid": "druid",
    "Demon Hunter": "demonhunter",
    "Evoker": "evoker"

};

async function loadRecruitment() {

    try {

        const response = await fetch("/api/homepage");

        const data = await response.json();

        const container =

            document.getElementById("recruitment-list");

        const groups = {

            2: [],

            1: [],

            0: []

        };

        data.recruitment.forEach(entry => {

            groups[entry.priority].push(entry);

        });

        let html = "";

        [

            [2, "🔥 High Priority"],

            [1, "⭐ Medium Priority"],

            [0, "🐾 Low Priority"]

        ].forEach(([priority, title]) => {

            if (groups[priority].length === 0) {

                return;

            }

            html += `

                <div class="recruitment-group">

                    <div class="recruitment-group-title">

                        ${title}

                    </div>

            `;

            groups[priority].forEach(entry => {

    const icon = CLASS_ICONS[entry.class];

    html += `

        <div class="recruitment-entry">

            <img
                class="recruitment-icon"
                src="https://wow.zamimg.com/images/wow/icons/medium/class_${icon}.jpg"
                alt="${entry.class}"
            >

            <div class="recruitment-info">

                <div class="recruitment-class">

                    ${entry.class}

                </div>

                <div class="recruitment-specs">

                    ${entry.specs.join(" • ")}

                </div>

            </div>

        </div>

    `;

});

            html += `

                </div>

            `;

        });

        container.innerHTML = html;

    }

    catch (error) {

        console.error(error);

    }

}

loadRecruitment();