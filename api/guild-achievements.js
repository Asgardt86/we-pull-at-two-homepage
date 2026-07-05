import {

    loadHistory,

    saveHistory,

    mergeHistory

}

    from "../lib/history.js";

import {

    getCache,

    setCache

}

    from "../lib/cache.js";

import {

    getAccessToken

}

    from "../lib/blizzard.js";

/* ===================================================
   Gilden-Erfolge
=================================================== */

export default async function handler(req, res) {

    try {

        /* ===================================================
           Cache
        =================================================== */

        const cached = await getCache(

            "cache:guild-achievements"

        );

        /* ===================================================
           Cache vorhanden
        =================================================== */

        if (cached) {

            return res.status(200).json(

                cached.data

            );

        }

        /* ===================================================
           Historie laden
        =================================================== */

        const history = await loadHistory(

            "guild-achievements"

        );

        /* ===================================================
    Blizzard Access Token
 =================================================== */

        const accessToken =

            await getAccessToken();

        /* ===================================================
           Guild Achievements
        =================================================== */

        const guildResponse = await fetch(

            "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two/achievements?namespace=profile-eu&locale=de_DE",

            {

                headers: {

                    Authorization:
                        `Bearer ${accessToken}`

                }

            }

        );

        const guildData =
            await guildResponse.json();

        /* ===================================================
           Guild Activity
        =================================================== */

        const activityResponse = await fetch(

            "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two/activity?namespace=profile-eu&locale=de_DE",

            {

                headers: {

                    Authorization:
                        `Bearer ${accessToken}`

                }

            }

        );

        const activityData =
            await activityResponse.json();

        const achievements = [];
        /* ===================================================
   Letzter Heroic/Mythic Bosskill
=================================================== */

        const latestEncounter = activityData.activities?.find(entry => {

            if (entry.activity?.type !== "ENCOUNTER") {

                return false;

            }

            if (!entry.encounter_completed) {

                return false;

            }

            const mode = entry.encounter_completed.mode?.name;

            return (

                mode === "Mythisch" ||

                mode === "Heroisch"

            );

        });

        if (latestEncounter) {

            achievements.push({

                type: "boss",

                name: latestEncounter.encounter_completed.encounter.name,

                difficulty: latestEncounter.encounter_completed.mode.name,

                timestamp: latestEncounter.timestamp

            });

        }

        /* ===================================================
           Blizzard Gildenerfolge
        =================================================== */

        const latestAchievements =

            guildData.achievements

                ?.filter(a => a.completed_timestamp)

                .sort((a, b) =>

                    b.completed_timestamp -

                    a.completed_timestamp

                )

                .slice(0, 10) || [];

        for (const achievement of latestAchievements) {

            achievements.push({

                type: "achievement",

                name: achievement.achievement.name,

                timestamp: achievement.completed_timestamp

            });

        }

        achievements.sort(

            (a, b) => b.timestamp - a.timestamp

        );

        const mergedAchievements = mergeHistory(

            history,

            achievements,

            entry =>

                `${entry.type}-${entry.name}`,

            20

        );

        /* ===================================================
           Historie speichern
        =================================================== */

        await saveHistory(

            "guild-achievements",

            mergedAchievements

        );

        const result = {

            achievements: mergedAchievements.slice(0, 10)

        };

        /* ===================================================
           Cache speichern
        =================================================== */

        await setCache(

            "cache:guild-achievements",

            result,

            60 * 60 * 24

        );

        return res.status(200).json(result);

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            error: error.message

        });

    }

}