let cache = {
    data: null,
    timestamp: 0
};

const CACHE_TIME = 10 * 60 * 1000;

/* ===================================================
   Raid Roster (WoWAudit)
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
            "https://wowaudit.com/v1/characters",
            {
                headers: {
                    accept: "application/json",
                    Authorization: process.env.WOWAUDIT_API_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error(`WoWAudit API Fehler: ${response.status}`);
        }

        const data = await response.json();

        const tanks = [];
        const heals = [];
        const melee = [];
        const ranged = [];

        data.forEach(player => {

            const character = {
                name: player.name,
                realm: player.realm,
                class: player.class,
                role: player.role,
                rank: player.rank
            };

            switch (player.role) {

                case "Tank":
                    tanks.push(character);
                    break;

                case "Heal":
                    heals.push(character);
                    break;

                case "Melee":
                    melee.push(character);
                    break;

                case "Ranged":
                    ranged.push(character);
                    break;

            }

        });

        const result = {

            total: data.length,

            tanks,
            heals,
            melee,
            ranged

        };

        cache = {
            data: result,
            timestamp: Date.now()
        };

        return res.status(200).json(result);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: error.message
        });

    }

}