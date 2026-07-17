import {

    getCache,

    setCache

}

    from "../lib/cache.js";

import {

    getAccessToken

}

    from "../lib/blizzard.js";

import { CACHE } from "../lib/cache-times.js";

const CLASS_MAP = {

    1: { name: "Krieger", icon: "warrior", color: "#C79C6E" },
    2: { name: "Paladin", icon: "paladin", color: "#F58CBA" },
    3: { name: "Jäger", icon: "hunter", color: "#ABD473" },
    4: { name: "Schurke", icon: "rogue", color: "#FFF569" },
    5: { name: "Priester", icon: "priest", color: "#FFFFFF" },
    6: { name: "Todesritter", icon: "deathknight", color: "#C41F3B" },
    7: { name: "Schamane", icon: "shaman", color: "#0070DE" },
    8: { name: "Magier", icon: "mage", color: "#69CCF0" },
    9: { name: "Hexenmeister", icon: "warlock", color: "#9482C9" },
    10: { name: "Mönch", icon: "monk", color: "#00FF96" },
    11: { name: "Druide", icon: "druid", color: "#FF7D0A" },
    12: { name: "Dämonenjäger", icon: "demonhunter", color: "#A330C9" },
    13: { name: "Rufer", icon: "evoker", color: "#33937F" }

};

/* ===================================================
   Klassenverteilung
=================================================== */

export default async function handler(req, res) {

    try {

        /* ===================================================
           Cache
        =================================================== */

        const cached = await getCache(

            CACHE.classes.cacheKey

        );

        if (cached) {

            return res.status(200).json(

                cached.data

            );

        }

        /* ===================================================
           Blizzard Access Token
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

        const classCount = {};
        const maxLevelCount = {};

        let totalLevel = 0;
        let totalMax = 0;
        /* ===================================================
   Klassen zählen
=================================================== */

        rosterData.members?.forEach(member => {

            const level = member.character.level;

            const classId =
                member.character.playable_class.id;

            const classInfo =
                CLASS_MAP[classId];

            if (!classInfo) {

                return;

            }

            /* -----------------------------------------------
               Gesamte Gilde
            ------------------------------------------------ */

            if (!classCount[classId]) {

                classCount[classId] = {

                    name: classInfo.name,

                    icon: classInfo.icon,

                    color: classInfo.color,

                    count: 0

                };

            }

            classCount[classId].count++;
            totalLevel++;

            /* -----------------------------------------------
               Max-Level
            ------------------------------------------------ */

            if (level === 90) {

                if (!maxLevelCount[classId]) {

                    maxLevelCount[classId] = {

                        name: classInfo.name,

                        icon: classInfo.icon,

                        color: classInfo.color,

                        count: 0

                    };

                }

                maxLevelCount[classId].count++;
                totalMax++;

            }

        });

        const result = {

            total80: totalLevel,

            totalMax: totalMax,

            classes80:

                Object.values(classCount),

            classesMax:

                Object.values(maxLevelCount)

        };

        await setCache(

            CACHE.classes.cacheKey,

            result,

            CACHE.classes.ttl

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