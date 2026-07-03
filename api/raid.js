let cache = {
    data: null,
    timestamp: 0
};

const CACHE_TIME = 30 * 60 * 1000;

export default async function handler(req, res) {

    try {

        if (
            cache.data &&
            Date.now() - cache.timestamp < CACHE_TIME
        ) {
            return res.status(200).json(cache.data);
        }

        const response = await fetch(
            "https://raider.io/api/v1/guilds/profile?region=eu&realm=blackrock&name=We%20Pull%20at%20Two&fields=raid_progression"
        );

        const data = await response.json();

        const progression = data.raid_progression || {};

        const raids = Object.entries(progression)
            .map(([slug, raidData]) => ({

                slug,

                name: slug,

                mythic: {

                    completed: raidData.mythic_bosses_killed || 0,

                    total: raidData.total_bosses || 0

                },

                heroic: {

                    completed: raidData.heroic_bosses_killed || 0,

                    total: raidData.total_bosses || 0

                },

                normal: {

                    completed: raidData.normal_bosses_killed || 0,

                    total: raidData.total_bosses || 0

                }

            }))
            .filter(raid =>

                raid.mythic.completed > 0 ||
                raid.heroic.completed > 0 ||
                raid.normal.completed > 0

            );

        const totalProgress = {

            mythic: {

                completed: raids.reduce(
                    (sum, raid) => sum + raid.mythic.completed,
                    0
                ),

                total: raids.reduce(
                    (sum, raid) => sum + raid.mythic.total,
                    0
                )

            },

            heroic: {

                completed: raids.reduce(
                    (sum, raid) => sum + raid.heroic.completed,
                    0
                ),

                total: raids.reduce(
                    (sum, raid) => sum + raid.heroic.total,
                    0
                )

            },

            normal: {

                completed: raids.reduce(
                    (sum, raid) => sum + raid.normal.completed,
                    0
                ),

                total: raids.reduce(
                    (sum, raid) => sum + raid.normal.total,
                    0
                )

            }

        };

        const result = {

            defaultRaid: "current",

            raids: [

                {

                    slug: "current",

                    name: "Current Raid",

                    ...totalProgress

                }

            ],

            activeRaids: raids

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