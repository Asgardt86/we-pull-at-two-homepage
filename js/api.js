/* ==========================================
   We Pull at Two
   API Loader
========================================== */

async function loadMembers() {

}

async function loadRaidProgress() {

}

async function loadRaidDays() {

}

async function loadRealm() {

}

async function initializeHomepage() {

    await loadMembers();
    await loadRaidProgress();
    await loadRaidDays();
    await loadRealm();

}

initializeHomepage();