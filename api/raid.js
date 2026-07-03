let cache = {
    data: null,
    timestamp: 0
};

const CACHE_TIME = 30 * 60 * 1000;

const RAID_TIERS = [
    {
        slug: "tier-mn-1",
        name: "Midnight – Season 1"
    },
    {
        slug: "sporefall",
        name: "Sporefall"
    }
];

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

        const raids = RAID_TIERS.map(raid => {

            const raidData = progression[raid.slug];

            return {

                slug: raid.slug,

                name: raid.name,

                mythic: {

                    completed: raidData?.mythic_bosses_killed || 0,

                    total: raidData?.total_bosses || 0

                },

                heroic: {

                    completed: raidData?.heroic_bosses_killed || 0,

                    total: raidData?.total_bosses || 0

                },

                normal: {

                    completed: raidData?.normal_bosses_killed || 0,

                    total: raidData?.total_bosses || 0

                }

            };

        });

        const result = {

            defaultRaid: "tier-mn-1",

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
