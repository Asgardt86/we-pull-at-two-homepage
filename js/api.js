async function loadHomepageData() {

    try {

        const response = await fetch("/api/homepage");

        const data = await response.json();

        document.getElementById("member-count").textContent = data.members;
        document.getElementById("raid-days").textContent = data.raidDays;
        document.getElementById("realm-name").textContent = data.realm;
        document.getElementById("raid-progress").textContent = data.progress;

    }

    catch (error) {

        console.error("Homepage API:", error);

    }

}

loadHomepageData();