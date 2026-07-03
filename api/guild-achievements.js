import { Buffer } from "buffer";

let cache = {
    data: null,
    timestamp: 0
};

const CACHE_TIME = 30 * 60 * 1000;

/* ===================================================
   Gilden-Erfolge
=================================================== */

export default async function handler(req, res) {

    try {

        if (

            cache.data &&
            Date.now() - cache.timestamp < CACHE_TIME

        ) {

            return res.status(200).json(cache.data);

        }

        /* ===================================================
           Blizzard OAuth
        =================================================== */

        const clientId =
            process.env.BLIZZARD_CLIENT_ID;

        const clientSecret =
            process.env.BLIZZARD_CLIENT_SECRET;

        const credentials = Buffer

            .from(`${clientId}:${clientSecret}`)

            .toString("base64");

        const tokenResponse = await fetch(

            "https://oauth.battle.net/token",

            {

                method: "POST",

                headers: {

                    Authorization: `Basic ${credentials}`,

                    "Content-Type":
                        "application/x-www-form-urlencoded"

                },

                body: "grant_type=client_credentials"

            }

        );

        const tokenData =
            await tokenResponse.json();

        const accessToken =
            tokenData.access_token;

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

            const detailResponse = await fetch(

                `https://eu.api.blizzard.com/data/wow/achievement/${achievement.achievement.id}?namespace=static-eu&locale=de_DE`,

                {

                    headers: {

                        Authorization: `Bearer ${accessToken}`

                    }

                }

            );

            if (!detailResponse.ok) {

                continue;

            }

            const detail = await detailResponse.json();

            achievements.push({

                type: "achievement",

                name: detail.name,

                timestamp: achievement.completed_timestamp

            });

        }

        achievements.sort(

            (a, b) => b.timestamp - a.timestamp

        );

        const result = {

            achievements: achievements.slice(0, 10)

        };

        cache = {

            data: result,

            timestamp: Date.now()

        };

        return res.status(200).json(result);

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            error: error.message

        });

    }

}