import {

    getCache,

    setCache

}

    from "../lib/cache.js";


import { CACHE } from "../lib/cache-times.js";
/* ===================================================
   Mythic+ Affixe
=================================================== */

export default async function handler(req, res) {

    try {

        /* ===================================================
           Cache
        =================================================== */

        const cached = await getCache(

            CACHE.affixes.cacheKey

        );

        if (cached) {

            return res.status(200).json(

                cached.data

            );

        }

        const response = await fetch(

            "https://raider.io/api/v1/mythic-plus/affixes?region=eu&locale=de"

        );

        const data = await response.json();

        /* ===================================================
           Keine aktive Season
        =================================================== */

        if (

            !data.affix_details ||

            data.affix_details.length === 0

        ) {

            const result = {

                active: false,

                message:
                    "Neue Mythic+ Season startet bald."

            };

            await setCache(

                CACHE.affixes.cacheKey,

                result,

                CACHE.affixes.ttl

            );

            return res.status(200).json(result);

        }

        /* ===================================================
           Affixe
        =================================================== */

        const result = {

            active: true,

            affixes: data.affix_details.map(

                affix => ({

                    name: affix.name,

                    description: affix.description,

                    icon:

                        `https://render.worldofwarcraft.com/eu/icons/56/${affix.icon}.jpg`

                })

            )

        };

        await setCache(

            CACHE.affixes.cacheKey,

            result,

            CACHE.affixes.ttl

        );

        return res.status(200).json(result);

    }

    catch (error) {

        console.error(error);

        res.status(200).json({

            active: false,

            message:
                "Affixe derzeit nicht verfügbar."

        });

    }

}