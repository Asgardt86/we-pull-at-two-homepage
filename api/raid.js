import {

    loadHistory,

    saveHistory,

}

    from "../lib/history.js";

import {
    getCache,
    setCache
} from "../lib/cache.js";

import { CACHE } from "../lib/cache-times.js";

import BOSSES from "../lib/raid-bosses.js";
import RAID_TIERS from "../lib/raid-tiers.js";

import {

    loadRaidStatus

}

    from "../lib/raid-status.js";

/* ===================================================
   Bereits archiviert?
=================================================== */

function isArchived(

    history,

    expansion,

    season

) {

    return history.some(

        entry =>

            entry.expansion === expansion &&

            entry.season === season

    );

}

export default async function handler(req, res) {

    try {

        const cached = await getCache(
            CACHE.raid.cacheKey
        );

        if (cached) {
            return res.status(200).json(
                cached.data
            );
        }

        const response = await fetch(
            "https://raider.io/api/v1/guilds/profile?region=eu&realm=blackrock&name=We%20Pull%20at%20Two&fields=raid_progression,raid_rankings"
        );

        const data = await response.json();

        /* ===================================================
        Raid-Historie laden
        =================================================== */

        const raidHistory = await loadHistory(

            "raid-tiers"

        );

        /* ===================================================
            Debug-Testdaten Raid-History
        =================================================== */

        const DEBUG_HISTORY = false;

        if (

            DEBUG_HISTORY &&

            raidHistory.length === 0

        ) {

            raidHistory.push(

                {

                    expansion: "The War Within",

                    season: 1,

                    raids: [

                        {

                            name: "Nerub-ar Palace",

                            mythic: {

                                completed: 6,

                                total: 8

                            }

                        }

                    ],

                    realmRank: 53,

                    worldRank: 2713,

                    archivedAt: Date.now()

                },

                {

                    expansion: "The War Within",

                    season: 2,

                    raids: [

                        {

                            name: "Liberation of Undermine",

                            mythic: {

                                completed: 8,

                                total: 8

                            }

                        }

                    ],

                    realmRank: 51,

                    worldRank: 2738,

                    archivedAt: Date.now()

                }

            );

        }

        const progression = data.raid_progression || {};
        const rankings = data.raid_rankings || {};

        /* ===================================================
           Aktive Raids
        =================================================== */

        const rankingRaids = Object.entries(rankings)

            .map(([slug, ranking]) => {

                const progress =
                    progression[slug] || {};

                return {

                    slug,

                    name:

                        slug === "tier-mn-1"

                            ? RAID_TIERS[slug].seasonName

                            : RAID_TIERS[slug]?.raids?.[0] ||

                            slug,

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

        const bossStatus =

            await loadRaidStatus();

        /* ===================================================
Aktuelle Season ermitteln
=================================================== */

        const currentTier =

            Object.entries(progression)

                .filter(

                    ([, raid]) =>

                        raid.normal_bosses_killed > 0 ||

                        raid.heroic_bosses_killed > 0 ||

                        raid.mythic_bosses_killed > 0

                )

                .map(

                    ([slug]) => RAID_TIERS[slug]

                )

                .filter(Boolean)

                .sort(

                    (a, b) =>

                        b.season - a.season

                )[0];

        if (!currentTier) {

            throw new Error(

                "Keine aktive Raid-Season gefunden."

            );

        }

        /* ===================================================
   Raider.IO Raid-Progress
=================================================== */

        const raids = Object.entries(progression)
            .map(([slug, raidData]) => ({

                slug,

                name:

                    slug === "tier-mn-1"

                        ? RAID_TIERS[slug].seasonName

                        : RAID_TIERS[slug]?.raids?.[0] ||

                        slug,

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

        /* ===================================================
            Aktuelle Season aus Bossdaten erstellen
        =================================================== */

        const currentSeason = {

            expansion:

                currentTier.expansion,

            season:

                currentTier.season,

            seasonName:

                currentTier.seasonName,

            wowprogress:

                currentTier.wowprogress,

            realmRank:

                currentTier.realmRank,

            worldRank:

                currentTier.worldRank,

            raids: [],

            archivedAt: null

        };

        const raidMap = new Map();

        BOSSES.forEach(boss => {

            if (!raidMap.has(boss.raid)) {

                raidMap.set(

                    boss.raid,

                    {

                        name: boss.raid,

                        mythic: {

                            completed: 0,

                            total: 0

                        },

                        heroic: {

                            completed: 0,

                            total: 0

                        },

                        normal: {

                            completed: 0,

                            total: 0

                        }

                    }

                );

            }

        });

        ["normal", "heroic", "mythic"].forEach(difficulty => {

            bossStatus[difficulty].forEach(boss => {

                const raid = raidMap.get(

                    boss.raid

                );

                raid[difficulty].total++;

                if (boss.killed) {

                    raid[difficulty].completed++;

                }

            });

        });

        currentSeason.raids = [

            ...raidMap.values()

        ];

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

        /* ===================================================
           Aktuelle Season bereits archiviert?
        =================================================== */

        const alreadyArchived = isArchived(

            raidHistory,

            currentSeason.expansion,

            currentSeason.season

        );

        /* ===================================================
    Nachfolgende Season aktiv?
    =================================================== */

        const nextSeasonActive =

            Object.entries(progression).some(

                ([slug, raid]) => {

                    const tier = RAID_TIERS[slug];

                    if (!tier) return false;

                    return (

                        tier.expansion === currentSeason.expansion &&

                        tier.season > currentSeason.season &&

                        (

                            raid.normal_bosses_killed > 0 ||

                            raid.heroic_bosses_killed > 0 ||

                            raid.mythic_bosses_killed > 0

                        )

                    );

                }

            );

        /* ===================================================
            Season archivieren
        =================================================== */

        const shouldArchive =

            nextSeasonActive &&

            !alreadyArchived;

        if (shouldArchive) {

            currentSeason.archivedAt =

                new Date().toISOString();

            raidHistory.push(

                structuredClone(

                    currentSeason

                )

            );

            await saveHistory(

                "raid-tiers",

                raidHistory

            );

        }

        /* ===================================================
        API-Antwort
        =================================================== */

        const result = {

            defaultRaid: "current",

            raids: [

                {

                    slug: "current",

                    name: "Current Raid",

                    ...totalProgress

                }

            ],

            activeRaids: raids,

            currentSeason,

            raidHistory,

            bossStatus,

            ranking: {

                empty: rankingRaids.length === 0,

                raids: rankingRaids

            }

        };

        await setCache(
            CACHE.raid.cacheKey,
            result,
            CACHE.raid.ttl
        );

        res.status(200).json(result);

    }

    catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

}