/* ===================================================
   API Info Bar
=================================================== */

function updateHomepageBar(data) {

    document.getElementById("member-count").textContent = data.members;
    document.getElementById("raid-days").textContent = data.raidDays;
    document.getElementById("realm-name").textContent = data.realm;
    document.getElementById("raid-progress").textContent = data.progress;

}

async function loadHomepageData() {

    try {

        const cached = sessionStorage.getItem("homepageData");

        if (cached) {

            updateHomepageBar(

                JSON.parse(cached)

            );

            return;

        }

        const response = await fetch(

            "/api/homepage"

        );

        const data = await response.json();

        sessionStorage.setItem(

            "homepageData",

            JSON.stringify(data)

        );

        updateHomepageBar(data);

    }

    catch (error) {

        console.error(

            "Homepage API:",

            error

        );

    }

}

loadHomepageData();