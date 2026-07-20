const GUILD =
    "https://raider.io/api/v1/guilds/profile?region=eu&realm=blackrock&name=We%20Pull%20at%20Two";

export default async function handler(req, res) {

    try {

        const response = await fetch(
            `${GUILD}&fields=raid_progression`
        );

        const guild = await response.json();

        const progression = guild.raid_progression || {};

        const raidSlugs = Object.keys(progression).filter(slug =>
            progression[slug].mythic_bosses_killed > 0 ||
            progression[slug].heroic_bosses_killed > 0 ||
            progression[slug].normal_bosses_killed > 0
        );

        if (!raidSlugs.length) {

            return res.status(404).json({
                error: "Keine aktive Raid-Season gefunden."
            });

        }

        const difficulties = ["mythic", "heroic", "normal"];

        const bossMap = new Map();

        let highestDifficulty = null;

        for (const raidSlug of raidSlugs) {

            let liveData = null;

            for (const difficulty of difficulties) {

                const liveResponse = await fetch(

                    `https://raider.io/api/v1/live-tracking/guild/raid-pulls?raid=${raidSlug}&difficulty=${difficulty}&region=eu&realm=blackrock&guild=We%20Pull%20at%20Two`

                );

                const data = await liveResponse.json();

                if (data?.pulls?.length) {

                    liveData = data;

                    if (!highestDifficulty) {

                        highestDifficulty = {
                            name: data.raid.name,
                            slug: data.raid.slug,
                            difficulty: data.raid.difficulty
                        };

                    }

                    break;

                }

            }

            if (!liveData) continue;

            for (const boss of liveData.pulls) {

                const lastPull = boss.details[boss.details.length - 1];

                const durationMinutes = Math.floor(lastPull.duration_ms / 60000);
                const durationSeconds = Math.floor((lastPull.duration_ms % 60000) / 1000);

                bossMap.set(boss.encounter.slug, {

                    boss: boss.encounter.name,

                    slug: boss.encounter.slug,

                    image: `/images/boss-images/${boss.encounter.slug}.png`,

                    pullCount: boss.count,

                    lastPull: {

                        success: lastPull.is_success,

                        progress: lastPull.encounter_health.progress_display,

                        date: new Date(lastPull.pull_ended_at).toLocaleDateString("de-DE"),

                        duration: `${durationMinutes}:${String(durationSeconds).padStart(2, "0")}`,

                        members: lastPull.num_members,

                        deaths: lastPull.num_deaths

                    }

                });

            }

        }

        const bosses = Array.from(bossMap.values());

        return res.status(200).json({

            raid: highestDifficulty,

            bosses

        });

    }

    catch (err) {

        return res.status(500).json({

            error: err.message

        });

    }

}