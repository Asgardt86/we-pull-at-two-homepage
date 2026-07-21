import { CACHE } from "../lib/cache-times.js";
import { getCache, setCache } from "../lib/cache.js";

const REGION = "eu";
const REALM = "blackrock";
const GUILD_NAME = "We Pull at Two";

const GUILD_URL =
    `https://raider.io/api/v1/guilds/profile?region=${REGION}&realm=${REALM}&name=${encodeURIComponent(GUILD_NAME)}`;

const RAIDERIO_KEY = process.env.RAIDER_IO_API_KEY;

const DIFFICULTIES = [
    "mythic",
    "heroic",
    "normal"
];

async function fetchJson(url) {

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error(
            `Raider.IO Fehler ${response.status}`
        );

    }

    return await response.json();

}

async function getGuildProgression() {

    const guild = await fetchJson(

        `${GUILD_URL}&fields=raid_progression`

    );

    const progression = guild.raid_progression || {};

    const raidSlugs = Object.keys(progression).filter(slug =>

        progression[slug].mythic_bosses_killed > 0 ||
        progression[slug].heroic_bosses_killed > 0 ||
        progression[slug].normal_bosses_killed > 0

    );

    if (!raidSlugs.length) {

        throw new Error(
            "Keine aktive Raid-Season gefunden."
        );

    }

    return raidSlugs;

}

async function getRaidComposition(
    bossSlug,
    raidSlug,
    difficulty
) {

    if (!RAIDERIO_KEY) {

        throw new Error(
            "RAIDERIO_ACCESS_KEY fehlt."
        );

    }

    const cacheKey =
        `${CACHE.raidComposition.cacheKey}` +
        `:${raidSlug}` +
        `:${difficulty}` +
        `:${bossSlug}`;

    const cached =
        await getCache(cacheKey);

    if (cached) {

        return cached.data;

    }

    const pullsUrl =
        `https://raider.io/api/v1/live-tracking/guild/raid-pulls` +
        `?raid=${raidSlug}` +
        `&difficulty=${difficulty}` +
        `&region=${REGION}` +
        `&realm=${REALM}` +
        `&guild=${encodeURIComponent(GUILD_NAME)}`;

    const pullsData = await fetchJson(pullsUrl);

    const bossPull =
        pullsData.pulls.find(
            boss => boss.encounter.slug === bossSlug
        );

    if (!bossPull) {

        throw new Error(
            "Bossdaten konnten nicht gefunden werden."
        );

    }

    const lastPull =
        bossPull.details[bossPull.details.length - 1];

    const raidCompUrl =
        `https://raider.io/api/v1/live-tracking/guild/raid-comps` +
        `?access_key=${RAIDERIO_KEY}` +
        `&raid=${raidSlug}` +
        `&difficulty=${difficulty}` +
        `&id=0` +
        `&region=${REGION}` +
        `&realm=${REALM}` +
        `&boss=${bossSlug}` +
        `&guild=${encodeURIComponent(GUILD_NAME)}`;

    console.log("raidCompUrl:");
    console.log(raidCompUrl);
    const data = await fetchJson(raidCompUrl);

    if (!data.details?.roster) {

        throw new Error(
            "Keine Raid Composition gefunden."
        );

    }

    const roster = data.details.roster.map(player => ({

        name: player.character.name,

        realm: player.character.realm.name,

        class: player.character.class.name,

        classSlug: player.character.class.slug,

        spec: player.character.spec.name,

        specSlug: player.character.spec.slug,

        role: player.character.spec.role,

        heroSpec: player.heroSpec?.name || null,

        itemLevel: player.character.itemLevelEquipped,

        thumbnail:
            `https://render.worldofwarcraft.com/eu/character/${player.character.thumbnail}`

    }));

    roster.sort((a, b) => {

        const order = {

            tank: 0,
            healer: 1,
            dps: 2

        };

        if (order[a.role] !== order[b.role]) {

            return order[a.role] - order[b.role];

        }

        return a.name.localeCompare(b.name);

    });

    const result = {

        raid: {

            name: pullsData.raid.name,

            slug: raidSlug,

            difficulty

        },

        boss: {

            name: data.details.boss.name,

            slug: data.details.boss.slug,

            encounterId: data.details.boss.encounterId,

            pullCount: bossPull.count,

            lastPull: {

                success: lastPull.is_success,

                progress:
                    lastPull.encounter_health.progress_display,

                date:
                    new Date(
                        lastPull.pull_ended_at
                    ).toLocaleDateString("de-DE"),

                duration:
                    formatDuration(
                        lastPull.duration_ms
                    ),

                deaths:
                    lastPull.num_deaths

            }

        },

        guild: {

            id: data.guild.id,

            name: data.guild.displayName

        },

        roster

    };

    await setCache(

        cacheKey,

        result,

        CACHE.raidComposition.ttl

    );

    return result;

}

function formatDuration(ms) {

    const minutes = Math.floor(ms / 60000);

    const seconds = Math.floor((ms % 60000) / 1000);

    return `${minutes}:${String(seconds).padStart(2, "0")}`;

}

async function getGuildMonitor() {

    const cached = await getCache(

        CACHE.guildMonitor.cacheKey

    );

    if (cached) {

        return cached.data;

    }

    const raidSlugs = await getGuildProgression();

    const bossMap = new Map();

    let currentRaid = null;

    for (const raidSlug of raidSlugs) {

        let liveData = null;

        for (const difficulty of DIFFICULTIES) {

            const url =
                `https://raider.io/api/v1/live-tracking/guild/raid-pulls` +
                `?raid=${raidSlug}` +
                `&difficulty=${difficulty}` +
                `&region=${REGION}` +
                `&realm=${REALM}` +
                `&guild=${encodeURIComponent(GUILD_NAME)}`;

            const data = await fetchJson(url);

            if (data?.pulls?.length) {

                liveData = data;

                if (!currentRaid) {

                    currentRaid = {

                        name: data.raid.name,

                        slug: data.raid.slug,

                        difficulty: data.raid.difficulty

                    };

                }

                break;

            }

        }

        if (!liveData) {

            continue;

        }

        for (const boss of liveData.pulls) {

            if (!boss.details?.length) {

                continue;

            }

            const lastPull =
                boss.details[boss.details.length - 1];

            bossMap.set(

                boss.encounter.slug,

                {

                    boss: boss.encounter.name,

                    slug: boss.encounter.slug,

                    raid: liveData.raid.slug,

                    difficulty: liveData.raid.difficulty,

                    image:
                        `/images/boss-images/${boss.encounter.slug}.webp`,

                    pullCount: boss.count,

                    lastPull: {

                        success: lastPull.is_success,

                        progress:
                            lastPull.encounter_health.progress_display,

                        date:
                            new Date(
                                lastPull.pull_ended_at
                            ).toLocaleDateString("de-DE"),

                        duration:
                            formatDuration(
                                lastPull.duration_ms
                            ),

                        members:
                            lastPull.num_members,

                        deaths:
                            lastPull.num_deaths

                    }

                }

            );

        }

    }

    const result = {

        raid: currentRaid,

        bosses: Array.from(bossMap.values())

    };

    await setCache(

        CACHE.guildMonitor.cacheKey,

        result,

        CACHE.guildMonitor.ttl

    );

    return result;

}

export default async function handler(req, res) {

    try {

        const bossSlug = req.query.boss;
        const raidSlug = req.query.raid;
        const difficulty = req.query.difficulty;

        if (bossSlug) {

            const raidComp = await getRaidComposition(
                bossSlug,
                raidSlug,
                difficulty
            );

            return res.status(200).json(raidComp);

        }

        const guildMonitor = await getGuildMonitor();

        return res.status(200).json(guildMonitor);

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            error: err.message

        });

    }

}