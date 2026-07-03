import { Buffer } from "buffer";

export default async function handler(req, res) {

    try {

        const clientId = process.env.BLIZZARD_CLIENT_ID;
        const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

        const credentials = Buffer
            .from(`${clientId}:${clientSecret}`)
            .toString("base64");

        const tokenResponse = await fetch(
            "https://oauth.battle.net/token",
            {
                method: "POST",
                headers: {
                    Authorization: `Basic ${credentials}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "grant_type=client_credentials"
            }
        );

        const tokenText = await tokenResponse.text();

        console.log("TOKEN:", tokenText);

        const tokenData = JSON.parse(tokenText);

        const accessToken = tokenData.access_token;

        const guildResponse = await fetch(
            "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two?namespace=profile-eu&locale=de_DE",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        const guildData = await guildResponse.json();

        // =========================
        // WoWAudit Team
        // =========================

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

        // =========================
        // Raider.IO Progress
        // =========================

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

        res.status(200).json({

            guild: guildData.name,

            realm: guildData.realm.name,

            members: guildData.member_count,

            achievementPoints: guildData.achievement_points,

            raidDays,

            progress

        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

}
