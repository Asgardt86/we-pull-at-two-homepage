let cache = {
    data: null,
    timestamp: 0
};

const CACHE_TIME = 30 * 60 * 1000;

/* ===================================================
   Mythic+ Affixe
=================================================== */

export default async function handler(req, res) {

    try {

        if (

            cache.data &&
            Date.now() - cache.timestamp < CACHE_TIME

        ) {

            return res.status(200).json(cache.data);

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

            cache = {

                data: result,

                timestamp: Date.now()

            };

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

        cache = {

            data: result,

            timestamp: Date.now()

        };

        res.status(200).json(result);

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