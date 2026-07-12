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

            const result = cached.data;

            try {

                const discordResponse = await fetch(

                    "https://discord.com/api/guilds/1338690270019059722/widget.json"

                );

                const discordData = await discordResponse.json();

                result.discord = {

                    name: discordData.name,

                    online: discordData.presence_count,

                    invite: discordData.instant_invite

                };

            }

            catch {

                result.discord = null;

            }

            return res.status(200).json(result);

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
   Raider.io Recruitment
=================================================== */

        const recruitmentResponse = await fetch(

            "https://raider.io/api/recruitment/target-profiles?entity_type=guild&target_id=2136590"

        );

        const recruitmentData =

            await recruitmentResponse.json();

        const profile = recruitmentData.profiles[0];

        const CLASS_NAMES = {

            1: "Warrior",
            2: "Paladin",
            3: "Hunter",
            4: "Rogue",
            5: "Priest",
            6: "Death Knight",
            7: "Shaman",
            8: "Mage",
            9: "Warlock",
            10: "Monk",
            11: "Druid",
            12: "Demon Hunter",
            13: "Evoker"

        };

        const SPEC_NAMES = {

            62: "Arcane",
            63: "Fire",
            64: "Frost",

            65: "Holy",
            66: "Protection",
            70: "Retribution",

            71: "Arms",
            72: "Fury",
            73: "Protection",

            102: "Balance",
            103: "Feral",
            104: "Guardian",
            105: "Restoration",

            1467: "Devastation",
            1468: "Preservation",
            1473: "Augmentation",

            250: "Blood",
            251: "Frost",
            252: "Unholy",

            253: "Beast Mastery",
            254: "Marksmanship",
            255: "Survival",

            256: "Discipline",
            257: "Holy",
            258: "Shadow",

            259: "Assassination",
            260: "Outlaw",
            261: "Subtlety",

            262: "Elemental",
            263: "Enhancement",
            264: "Restoration",

            265: "Affliction",
            266: "Demonology",
            267: "Destruction",

            268: "Brewmaster",
            269: "Windwalker",
            270: "Mistweaver",

            577: "Havoc",
            581: "Vengeance"

        };

        const recruitment = [];

        profile.slots.forEach(slot => {

            slot.entries.forEach(entry => {

                recruitment.push({

                    priority: slot.priority,

                    class: CLASS_NAMES[entry.class_id],

                    specs: [

                        entry.mainspec_0_id,
                        entry.mainspec_1_id,
                        entry.mainspec_2_id,
                        entry.mainspec_3_id

                    ]

                        .filter(id => id !== null)

                        .map(id => SPEC_NAMES[id])

                });

            });

        });

        const result = {

            guild: guildData.name,

            realm: guildData.realm.name,

            members: guildData.member_count,

            achievementPoints: guildData.achievement_points,

            raidDays,

            progress,

            recruitment

        };

        await setCache(

            "cache:homepage",

            result,

            60 * 60 * 24

        );

        /* ===================================================
   Discord Widget (Live)
=================================================== */

        try {

            const discordResponse = await fetch(

                "https://discord.com/api/guilds/1338690270019059722/widget.json"

            );

            if (!discordResponse.ok) {

                throw new Error("Discord Widget nicht erreichbar");

            }

            const discordData = await discordResponse.json();

            result.discord = {

                name: discordData.name,

                online: discordData.presence_count,

                invite: discordData.instant_invite

            };

        }

        catch {

            result.discord = null;

        }

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