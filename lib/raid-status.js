import BOSSES from "./raid-bosses.js";

let cache = {
    data: null,
    timestamp: 0
};

const CACHE_TIME = 30 * 60 * 1000;

const DIFFICULTIES = [
    "normal",
    "heroic",
    "mythic"
];

/* ===================================================
   Raid-Status laden
=================================================== */

export async function loadRaidStatus() {

    if (
        cache.data &&
        Date.now() - cache.timestamp < CACHE_TIME
    ) {
        return cache.data;
    }

    const apiKey = process.env.RAIDER_IO_API_KEY;

    const result = {};

    for (const difficulty of DIFFICULTIES) {

        const requests = BOSSES.map(async boss => {

            const url =
                `https://raider.io/api/v1/guilds/boss-kill?access_key=${apiKey}&region=eu&realm=blackrock&guild=We%20Pull%20at%20Two&raid=${boss.raidSlug}&boss=${boss.slug}&difficulty=${difficulty}`;

            const response = await fetch(url);

            const data = await response.json();

            return {

                name: boss.name,

                slug: boss.slug,

                raid: boss.raid,

                raidSlug: boss.raidSlug,

                killed: data.kill?.isSuccess || false,

                defeatedAt: data.kill?.defeatedAt || null

            };

        });

        result[difficulty] = await Promise.all(requests);

        result[difficulty].sort((a, b) => {

            if (!a.defeatedAt) return 1;
            if (!b.defeatedAt) return -1;

            return new Date(a.defeatedAt) - new Date(b.defeatedAt);

        });

    }

    cache = {

        data: result,

        timestamp: Date.now()

    };

    return result;

}