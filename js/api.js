async function loadHomepageData() {

    try {

        const response = await fetch("/api/homepage");

        const data = await response.json();

        document.getElementById("member-count").textContent = data.members;

    }

    catch (error) {

        console.error(error);

    }

}

loadHomepageData();