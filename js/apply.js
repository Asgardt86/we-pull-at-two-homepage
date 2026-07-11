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

const CLASS_COLORS = {

    "Warrior": "#C79C6E",
    "Paladin": "#F58CBA",
    "Hunter": "#ABD473",
    "Rogue": "#FFF569",
    "Priest": "#FFFFFF",
    "Death Knight": "#C41F3B",
    "Shaman": "#0070DD",
    "Mage": "#69CCF0",
    "Warlock": "#9482C9",
    "Monk": "#00FF96",
    "Druid": "#FF7D0A",
    "Demon Hunter": "#A330C9",
    "Evoker": "#33937F"

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

            [2, "HIGH PRIORITY"],

            [1, "MEDIUM PRIORITY"],

            [0, "LOW PRIORITY"]

        ].forEach(([priority, title]) => {

            if (groups[priority].length === 0) {

                return;

            }

            html += `

                <div class="recruitment-group">

<div
    class="recruitment-group-title
    priority-${priority}"
>

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

<div
    class="recruitment-class"
    style="color:${CLASS_COLORS[entry.class]}"
>

    ${entry.class}

    <span class="recruitment-specs-inline">

        ${entry.specs.join(" • ")}

    </span>

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