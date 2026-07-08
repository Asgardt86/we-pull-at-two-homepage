import {

    getCache,

    setCache

}

    from "../lib/cache.js";

import {

    getAccessToken

}

    from "../lib/blizzard.js";

export default async function handler(req, res) {

    try {

        /* ===================================================
           Cache
        =================================================== */

        const cached = await getCache(

            "cache:homepage"

        );

        if (cached) {

            return res.status(200).json(

                cached.data

            );

        }

        /* ===================================================
           Blizzard Access Token
        =================================================== */

        const accessToken =

            await getAccessToken();

        const guildResponse = await fetch(
            "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two?namespace=profile-eu&locale=de_DE",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        const guildData = await guildResponse.json();

        /* ===================================================
           WoWAudit Team
        =================================================== */

        const apiKey = process.env.WOWAUDIT_API_KEY;

        const teamResponse = await fetch(
            "https://wowaudit.com/v1/team",
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            }
        );

        const teamData = await teamResponse.json();

        const raidDays = teamData.raid_days
            .map(day => {

                switch (day.week_day) {

                    case "Wednesday":
                        return "Mi";

                    case "Sunday":
                        return "So";

                    case "Monday":
                        return "Mo";

                    case "Tuesday":
                        return "Di";

                    case "Thursday":
                        return "Do";

                    case "Friday":
                        return "Fr";

                    case "Saturday":
                        return "Sa";

                    default:
                        return day.week_day;

                }

            })
            .join(" & ");

        /* ===================================================
           Raider.io Progression
        =================================================== */

        const raidResponse = await fetch(
            "https://raider.io/api/v1/guilds/profile?region=eu&realm=blackrock&name=We%20Pull%20at%20Two&fields=raid_progression"
        );

        const raidData = await raidResponse.json();

        const progression = raidData.raid_progression || {};

        const activeRaids = Object.values(progression).filter(raid =>

            raid.mythic_bosses_killed > 0 ||
            raid.heroic_bosses_killed > 0 ||
            raid.normal_bosses_killed > 0

        );

        const mythicCompleted = activeRaids.reduce(

            (sum, raid) => sum + (raid.mythic_bosses_killed || 0),

            0

        );

        const totalBosses = activeRaids.reduce(

            (sum, raid) => sum + (raid.total_bosses || 0),

            0

        );

        const progress = `${mythicCompleted} / ${totalBosses}`;

        /* ===================================================
         Discord Widget
      =================================================== */

        let discord = null;

        try {

            const discordResponse = await fetch(

                "https://discord.com/api/guilds/1338690270019059722/widget.json"

            );

            const discordData = await discordResponse.json();

            discord = {

                name: discordData.name,

                online: discordData.presence_count,

                invite: discordData.instant_invite

            };

        }

        catch {

            discord = null;

        }

        const result = {

            guild: guildData.name,

            realm: guildData.realm.name,

            members: guildData.member_count,

            achievementPoints: guildData.achievement_points,

            raidDays,

            progress,

            discord

        };

        await setCache(

            "cache:homepage",

            result,

            60 * 60 * 24

        );

        return res.status(200).json(

            result

        );

    }

    catch (error) {

        return res.status(500).json({

            error: error.message

        });

    }

}