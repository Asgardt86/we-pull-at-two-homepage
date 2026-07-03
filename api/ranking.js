let cache = {
    data: null,
    timestamp: 0
};

const CACHE_TIME = 30 * 60 * 1000;

/* ===================================================
   Raid Ranking
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

            "https://raider.io/api/v1/guilds/profile?region=eu&realm=blackrock&name=We%20Pull%20at%20Two&fields=raid_rankings,raid_progression"

        );

        const data = await response.json();

        const rankings =
            data.raid_rankings || {};

        const progression =
            data.raid_progression || {};

        /* ===================================================
           Aktive Raids
        =================================================== */

        const raids = Object.entries(rankings)

            .map(([slug, ranking]) => {

                const progress =
                    progression[slug] || {};

                return {

                    slug,

                    name: slug,

                    mythic:

                        progress.mythic_bosses_killed > 0

                            ? ranking.mythic

                            : null,

                    heroic:

                        progress.heroic_bosses_killed > 0

                            ? ranking.heroic

                            : null,

                    normal:

                        progress.normal_bosses_killed > 0

                            ? ranking.normal

                            : null

                };

            })

            .filter(raid =>

                raid.mythic ||
                raid.heroic ||
                raid.normal

            );

        /* ===================================================
           Keine Daten
        =================================================== */

        if (raids.length === 0) {

            const result = {

                empty: true

            };

            cache = {

                data: result,

                timestamp: Date.now()

            };

            return res.status(200).json(result);

        }

        /* ===================================================
           Ergebnis
        =================================================== */

        const result = {

            raids

        };

        cache = {

            data: result,

            timestamp: Date.now()

        };

        res.status(200).json(result);

    }

    catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

}