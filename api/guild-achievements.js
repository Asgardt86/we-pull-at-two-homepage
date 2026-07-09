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
           Einstellungen
        =================================================== */

        const DEBUG = false;
        const useCache = !DEBUG;

        /* ===================================================
           Cache
        =================================================== */

        const cached = await getCache(

            "cache:guild-achievements"

        );

        if (useCache && cached) {

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
Debug
=================================================== */

        if (DEBUG) {

            return res.status(200).json({

                guildData,

                activityData

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

        /* ===================================================
Achievement-Details laden
=================================================== */

        for (const achievement of latestAchievements) {

            const achievementId =
                achievement.achievement.id;

            const detailResponse = await fetch(

                `https://eu.api.blizzard.com/data/wow/achievement/${achievementId}?namespace=static-eu&locale=de_DE`,

                {

                    headers: {

                        Authorization:
                            `Bearer ${accessToken}`

                    }

                }

            );

            const detail =
                await detailResponse.json();

            let icon = null;

            if (detail.media?.key?.href) {

                const mediaResponse = await fetch(

                    `${detail.media.key.href}&locale=de_DE`,

                    {

                        headers: {

                            Authorization:
                                `Bearer ${accessToken}`

                        }

                    }

                );

                const mediaData =
                    await mediaResponse.json();

                icon = mediaData.assets?.find(

                    asset => asset.key === "icon"

                )?.value ?? null;

            }

            achievements.push({

                type: "achievement",

                id: achievementId,

                name: detail.name,

                description: detail.description,

                points: detail.points,

                icon,

                category: detail.category?.name,

                timestamp:
                    achievement.completed_timestamp

            });

        }

        /* ===================================================
   Erfolge sortieren
=================================================== */

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