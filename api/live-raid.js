import { Buffer } from "buffer";

let cache = {
    data: null,
    timestamp: 0
};

const CACHE_TIME = 30 * 1000;

/* ===================================================
   Live Raid Tracker
=================================================== */

export default async function handler(req, res) {

    try {

        /* ===================================================
           Cache
        =================================================== */

        if (

            cache.data &&
            Date.now() - cache.timestamp < CACHE_TIME

        ) {

            return res.status(200).json(cache.data);

        }

        /* ===================================================
           Warcraft Logs Token
        =================================================== */

        const clientId =
            process.env.WCL_CLIENT_ID;

        const clientSecret =
            process.env.WCL_CLIENT_SECRET;

        const credentials = Buffer

            .from(`${clientId}:${clientSecret}`)

            .toString("base64");

        const tokenResponse = await fetch(

            "https://www.warcraftlogs.com/oauth/token",

            {

                method: "POST",

                headers: {

                    Authorization: `Basic ${credentials}`,

                    "Content-Type": "application/x-www-form-urlencoded"

                },

                body: "grant_type=client_credentials"

            }

        );

        const tokenData =
            await tokenResponse.json();

        const accessToken =
            tokenData.access_token;

        /* ===================================================
           Letzte Reports laden
        =================================================== */

        const reportsQuery = `

            {
                reportData {
                    reports(
                        guildName: "We Pull at Two",
                        guildServerSlug: "blackrock",
                        guildServerRegion: "eu",
                        limit: 5
                    ) {
                        data {
                            code
                            startTime
                            title
                        }
                    }
                }
            }

        `;

        const reportsResponse = await fetch(

            "https://www.warcraftlogs.com/api/v2/client",

            {

                method: "POST",

                headers: {

                    Authorization: `Bearer ${accessToken}`,

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    query: reportsQuery

                })

            }

        );

        const reportsData =
            await reportsResponse.json();

        const reports =

            reportsData?.data?.reportData?.reports?.data ||

            [];

        if (reports.length === 0) {

            const result = {

                live: false

            };

            cache = {

                data: result,

                timestamp: Date.now()

            };

            return res.status(200).json(result);

        }

        /* ===================================================
   Aktiven Report suchen
=================================================== */

        let activeReport = null;

        let fights = [];

        let reportStart = 0;

        let raidName = "";

        let reportTitle = "";

        for (const report of reports) {

            const fightsQuery = `

                {
                    reportData {
                        report(code:"${report.code}") {
                            zone {
                                name
                            }
                            fights {
                                name
                                bossPercentage
                                kill
                                difficulty
                                startTime
                            }
                        }
                    }
                }

            `;

            const fightsResponse = await fetch(

                "https://www.warcraftlogs.com/api/v2/client",

                {

                    method: "POST",

                    headers: {

                        Authorization: `Bearer ${accessToken}`,

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify({

                        query: fightsQuery

                    })

                }

            );

            const fightsData =
                await fightsResponse.json();

            const reportData =
                fightsData?.data?.reportData?.report;

            const pulls =

                reportData?.fights?.filter(

                    fight => fight.bossPercentage !== null

                ) || [];

            if (pulls.length === 0) {

                continue;

            }

            const lastPull =
                pulls[pulls.length - 1];

            const lastPullTime =

                report.startTime +

                (lastPull.startTime || 0);

            const minutesSincePull =

                (Date.now() - lastPullTime) /

                1000 /

                60;

            if (minutesSincePull < 25) {

                activeReport = report;

                fights = pulls;

                reportStart = report.startTime;

                raidName =
                    reportData?.zone?.name || "";

                reportTitle =
                    report.title || "";

                break;

            }

            if (!activeReport) {

                activeReport = report;

                fights = pulls;

                reportStart = report.startTime;

                raidName =
                    reportData?.zone?.name || "";

                reportTitle =
                    report.title || "";

            }

        }

        if (!activeReport) {

            const result = {

                live: false

            };

            cache = {

                data: result,

                timestamp: Date.now()

            };

            return res.status(200).json(result);

        }

        /* ===================================================
           Raid Status
        =================================================== */

        const lastPull =
            fights[fights.length - 1];

        const firstPull =
            fights[0];

        const now =
            Date.now();

        const firstPullTime =

            reportStart +

            (firstPull.startTime || 0);

        const lastPullTime =

            reportStart +

            (lastPull.startTime || 0);

        const minutesSincePull =

            (now - lastPullTime) /

            1000 /

            60;

        const raidStillActive =
            minutesSincePull < 25;

        const reportAgeMinutes =

            (now - reportStart) /

            1000 /

            60;

        const summaryActive =

            !raidStillActive &&

            reportAgeMinutes < 1200;

        /* ===================================================
           Schwierigkeit
        =================================================== */

        const difficultyMap = {

            3: "Normal",

            4: "Heroic",

            5: "Mythic"

        };

        const difficulty =

            difficultyMap[lastPull.difficulty] ||

            "";

        const currentBoss =
            lastPull.name;

        /* ===================================================
Boss Pulls
=================================================== */

        const bossPulls = fights.filter(

            fight =>

                fight.name === currentBoss &&

                fight.difficulty === lastPull.difficulty

        );

        const totalPulls =
            bossPulls.length;

        let best = 100;

        const timeline = [];

        bossPulls.forEach((pull, index) => {

            const percent =

                pull.kill

                    ? 0

                    : pull.bossPercentage;

            if (percent < best) {

                best = percent;

                timeline.push({

                    pull: index + 1,

                    percent: percent.toFixed(2)

                });

            }

        });

        /* ===================================================
           Raid Dauer
        =================================================== */

        const raidDurationMs =

            raidStillActive

                ? now - firstPullTime

                : lastPullTime - firstPullTime;

        const hours =
            Math.floor(raidDurationMs / 3600000);

        const minutes =
            Math.floor((raidDurationMs % 3600000) / 60000);

        const raidDuration =
            `${hours}h ${minutes}m`;

        /* ===================================================
           Raid Summary
        =================================================== */

        const raidStats = {};

        fights.forEach(fight => {

            if (

                fight.bossPercentage === null &&

                !fight.kill

            ) {

                return;

            }

            const difficulty =

                difficultyMap[fight.difficulty] ||

                "Unknown";

            if (!raidStats[difficulty]) {

                raidStats[difficulty] = {

                    kills: 0,

                    pulls: 0

                };

            }

            if (fight.bossPercentage !== null) {

                raidStats[difficulty].pulls++;

            }

            if (fight.kill) {

                raidStats[difficulty].kills++;

            }

        });

        /* ===================================================
           Live Raid
        =================================================== */

        if (raidStillActive) {

            const result = {

                live: true,

                raidName,

                reportTitle,

                boss: currentBoss,

                difficulty,

                report: activeReport.code,

                raidDuration,

                totalPulls,

                bestPull: best.toFixed(2),

                kill: lastPull.kill || false,

                timeline

            };

            cache = {

                data: result,

                timestamp: Date.now()

            };

            return res.status(200).json(result);

        }

        /* ===================================================
           Raid beendet
        =================================================== */

        if (summaryActive) {

            const result = {

                live: false,

                summary: true,

                raidName,

                reportTitle,

                raidDuration,

                report: activeReport.code,

                raidStats

            };

            cache = {

                data: result,

                timestamp: Date.now()

            };

            return res.status(200).json(result);

        }

        /* ===================================================
           Kein aktiver Raid
        =================================================== */

        const result = {

            live: false

        };

        cache = {

            data: result,

            timestamp: Date.now()

        };

        return res.status(200).json(result);

    }

    catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

}