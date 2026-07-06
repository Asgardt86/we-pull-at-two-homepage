import {

    loadHistory,

    saveHistory,

    mergeHistory

}

    from "../lib/history.js";
import { getAccessToken } from "../lib/blizzard.js";
import {

    getCache,

    setCache,

    clearCache,

    deleteCache

}

    from "../lib/cache.js";

const CLASS_COLORS = {

    1: "#C79C6E",
    2: "#F58CBA",
    3: "#ABD473",
    4: "#FFF569",
    5: "#FFFFFF",
    6: "#C41F3B",
    7: "#0070DE",
    8: "#69CCF0",
    9: "#9482C9",
    10: "#00FF96",
    11: "#FF7D0A",
    12: "#A330C9",
    13: "#33937F"

};

function timeAgo(timestamp) {

    const now = Date.now();

    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `vor ${minutes} Minuten`;
    if (hours < 24) return `vor ${hours} Stunden`;

    return `vor ${days} Tagen`;

}

/* ===================================================
   Gildenaktivität
=================================================== */

export default async function handler(req, res) {

    try {

        /* ===================================================
   Cache
=================================================== */

        const cached = await getCache("cache:activity");

        /* ===================================================
   Cache vorhanden
=================================================== */

        if (cached) {

            return res.status(200).json(cached.data);

        }

        /* ===================================================
           Historie laden
        =================================================== */

        const history =

            await loadHistory(

                "activity"

            );

        console.log(

            "History:",

            history

        );
        /* ===================================================
Cache ENDE
=================================================== */

        const accessToken =

            await getAccessToken();

        /* ===================================================
           Gilden-Roster
        =================================================== */

        const rosterResponse = await fetch(

            "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two/roster?namespace=profile-eu&locale=de_DE",

            {

                headers: {

                    Authorization:
                        `Bearer ${accessToken}`

                }

            }

        );

        const rosterData =
            await rosterResponse.json();

        const classMap = {};

        rosterData.members?.forEach(member => {

            classMap[member.character.name] =

                CLASS_COLORS[
                member.character.playable_class.id
                ] || "#ffffff";

        });

        /* ===================================================
           Gildenaktivität
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
        /* ===================================================
Aktivitäten filtern
=================================================== */

        if (!activityData.activities) {

            return res.status(200).json({

                activities: []

            });

        }

        const activities = activityData.activities

            .map(entry => {

                const type = entry.activity?.type;

                /* -----------------------------------------------
                   Charakter-Erfolg
                ------------------------------------------------ */

                if (

                    type === "CHARACTER_ACHIEVEMENT" &&
                    entry.character_achievement

                ) {

                    return {

                        type: "achievement",

                        player:
                            entry.character_achievement.character.name,

                        color:
                            classMap[
                            entry.character_achievement.character.name
                            ] || "#ffffff",

                        achievement:
                            entry.character_achievement.achievement.name,

                        timestamp:
                            entry.timestamp

                    };

                }

                /* -----------------------------------------------
                   Level-Up
                ------------------------------------------------ */

                if (

                    type === "PLAYER_LEVEL_UP" &&
                    entry.player_level_up

                ) {

                    return {

                        type: "level",

                        player:
                            entry.player_level_up.character.name,

                        color:
                            classMap[
                            entry.player_level_up.character.name
                            ] || "#ffffff",

                        level:
                            entry.player_level_up.level,

                        timestamp:
                            entry.timestamp

                    };

                }

                return null;

            })

            .filter(Boolean)

            .slice(0, 10);

        const mergedActivities = mergeHistory(

            history,

            activities,

            entry =>

                `${entry.type}-${entry.player}-${entry.achievement ?? ""}-${entry.level ?? ""}`,

            20

        );

        /* ===================================================
   Historie speichern
=================================================== */

        await saveHistory(

            "activity",

            mergedActivities

        );

        const result = {

            activities: mergedActivities

        };

        await setCache(

            "cache:activity",

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