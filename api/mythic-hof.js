import {

    getCache,

    setCache

}

    from "../lib/cache.js";

import {

    loadHistory,

    saveHistory

}

    from "../lib/history.js";

import {

    getAccessToken

}

    from "../lib/blizzard.js";

/* ===================================================
   Mythic+ Hall of Fame
=================================================== */

export default async function handler(req, res) {

    try {

        /* ===================================================
           Cache
        =================================================== */

        const cached = await getCache(

            "cache:mythic-hof"

        );

        if (cached) {

            return res.status(200).json(

                cached.data

            );

        }

        /* ===================================================
   Hall of Fame Historie
=================================================== */

        const history =

            await loadHistory(

                "mythic-hof"

            );

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

                    Authorization: `Bearer ${accessToken}`

                }

            }

        );

        const rosterData =
            await rosterResponse.json();

        if (!rosterData.members) {

            return res.status(200).json({

                players: [],

                status: "empty"

            });

        }

        const players = [];

        /* ===================================================
           Mythic+ Daten laden
        =================================================== */

        for (const member of rosterData.members) {

            if (member.character.level !== 90) {

                continue;

            }

            try {

                const profileResponse = await fetch(

                    `https://eu.api.blizzard.com/profile/wow/character/${member.character.realm.slug}/${member.character.name.toLowerCase()}/mythic-keystone-profile?namespace=profile-eu&locale=de_DE`,

                    {

                        headers: {

                            Authorization: `Bearer ${accessToken}`

                        }

                    }

                );

                if (!profileResponse.ok) {

                    continue;

                }

                const profileData =
                    await profileResponse.json();

                const score =

                    profileData.current_mythic_rating?.rating ||

                    0;

                if (score <= 0) {

                    continue;

                }

                players.push({

                    name: member.character.name,

                    realm: member.character.realm.slug,

                    classId: member.character.playable_class.id,

                    level: member.character.level,

                    score: Math.round(score),

                    raiderIo: `https://raider.io/characters/eu/${member.character.realm.slug}/${member.character.name}`

                });

            }

            catch {

                continue;

            }

        }
        /* ===================================================
   Keine aktive Season
=================================================== */

        if (players.length === 0) {

            if (

                history.players &&
                history.players.length > 0

            ) {

                return res.status(200).json({

                    status: "inactive",

                    players: history.players

                });

            }

            return res.status(200).json({

                status: "inactive",

                players: []

            });

        }

        /* ===================================================
           Top 10
        =================================================== */

        const topPlayers = players

            .sort((a, b) => b.score - a.score)

            .slice(0, 10);

        for (const player of topPlayers) {

            try {

                const response = await fetch(

                    `https://raider.io/api/v1/characters/profile?region=eu&realm=${player.realm}&name=${encodeURIComponent(player.name)}&fields=mythic_plus_best_runs`

                );

                if (!response.ok) {

                    continue;

                }

                const profile = await response.json();

                const bestRun = profile.mythic_plus_best_runs?.[0];

                player.bestKey =

                    bestRun?.mythic_level || "-";

                player.bestDungeon =

                    bestRun?.dungeon || "-";

            }

            catch {

                player.bestKey = "-";

                player.bestDungeon = "-";

            }

        }

        const result = {

            status: "active",

            players: topPlayers

        };

        /* ===================================================
   Hall of Fame Historie speichern
=================================================== */

        await saveHistory(

            "mythic-hof",

            result

        );

        /* ===================================================
           Cache
        =================================================== */

        await setCache(

            "cache:mythic-hof",

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