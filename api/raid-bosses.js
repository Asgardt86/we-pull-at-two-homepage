let cache = {
    data: null,
    timestamp: 0
};

const CACHE_TIME = 30 * 60 * 1000;

const BOSSES = [

    // Midnight – Season 1

    {
        name: "Imperator Averzian",
        slug: "imperator-averzian",
        raid: "Die Leerenspitze",
        raidSlug: "tier-mn-1"
    },
    {
        name: "Vorasius",
        slug: "vorasius",
        raid: "Die Leerenspitze",
        raidSlug: "tier-mn-1"
    },
    {
        name: "Fallen King Salhadaar",
        slug: "fallenking-salhadaar",
        raid: "Die Leerenspitze",
        raidSlug: "tier-mn-1"
    },
    {
        name: "Vaelgor & Ezzorak",
        slug: "vaelgor-ezzorak",
        raid: "Die Leerenspitze",
        raidSlug: "tier-mn-1"
    },
    {
        name: "Lightblinded Vanguard",
        slug: "lightblinded-vanguard",
        raid: "Die Leerenspitze",
        raidSlug: "tier-mn-1"
    },
    {
        name: "Crown of the Cosmos",
        slug: "crown-of-the-cosmos",
        raid: "Die Leerenspitze",
        raidSlug: "tier-mn-1"
    },
    {
        name: "Chimaerus the Undreamt God",
        slug: "chimaerus-the-undreamt-god",
        raid: "Der Traumriss",
        raidSlug: "tier-mn-1"
    },
    {
        name: "Belo'ren, Child of Al'ar",
        slug: "beloren-child-of-alar",
        raid: "Marsch auf Quel'Danas",
        raidSlug: "tier-mn-1"
    },
    {
        name: "Midnight Falls",
        slug: "midnight-falls",
        raid: "Marsch auf Quel'Danas",
        raidSlug: "tier-mn-1"
    },

    // Sporefall

    {
        name: "Rottmoor",
        slug: "rotmire",
        raid: "Sporefall",
        raidSlug: "sporefall"
    }

];

const DIFFICULTIES = [
    "normal",
    "heroic",
    "mythic"
];

export default async function handler(req, res) {

    try {

        if (
            cache.data &&
            Date.now() - cache.timestamp < CACHE_TIME
        ) {
            return res.status(200).json(cache.data);
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

        res.status(200).json(result);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            error: error.message

        });

    }

}