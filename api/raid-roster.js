import {

    getCache,

    setCache

}

    from "../lib/cache.js";

import {

    getAccessToken

}

    from "../lib/blizzard.js";

import { CACHE } from "../lib/cache-times.js";

function realmToSlug(realm) {

    return realm
        .toLowerCase()
        .replace(/ä/g, "a")
        .replace(/ö/g, "o")
        .replace(/ü/g, "u")
        .replace(/ß/g, "ss")
        .replace(/\s+/g, "-");

}

export default async function handler(req, res) {

    try {

        /* ==========================================
           Cache
        ========================================== */

        const cached = await getCache(

            CACHE.raidRoster.cacheKey

        );

        if (cached) {

            return res.status(200).json(

                cached.data

            );

        }

        /* ==========================================
           Blizzard Access Token
        ========================================== */

        const accessToken =

            await getAccessToken();

        /* ==========================================
   WoWAudit
========================================== */

        const rosterResponse = await fetch(

            "https://wowaudit.com/v1/characters",

            {

                headers: {

                    accept: "application/json",

                    Authorization: process.env.WOWAUDIT_API_KEY

                }

            }

        );

        const roster = await rosterResponse.json();

        const players = roster.filter(

            player => player.rank !== "Alt"

        );

        const tanks = [];
        const heals = [];
        const melee = [];
        const ranged = [];

        /* ==========================================
   Blizzard Daten je Charakter
========================================== */

        for (const player of players) {

            try {

                const realmSlug =
                    realmToSlug(player.realm);

                const characterName =
                    encodeURIComponent(player.name.toLowerCase());

                /* ------------------------------
                   Character Profile
                ------------------------------ */

                const profileResponse = await fetch(

                    `https://eu.api.blizzard.com/profile/wow/character/${realmSlug}/${characterName}?namespace=profile-eu&locale=de_DE`,

                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }

                );

                if (!profileResponse.ok) {

                    console.error(
                        `Profil konnte nicht geladen werden: ${player.name}`
                    );

                    continue;

                }

                const profile = await profileResponse.json();

                /* ------------------------------
                   Character Media
                ------------------------------ */

                const mediaResponse = await fetch(

                    `https://eu.api.blizzard.com/profile/wow/character/${realmSlug}/${characterName}/character-media?namespace=profile-eu&locale=de_DE`,

                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }

                );

                if (!mediaResponse.ok) {

                    console.error(
                        `Media konnte nicht geladen werden: ${player.name}`
                    );

                    continue;

                }

                const media =
                    await mediaResponse.json();

                const avatar =

                    media.assets?.find(

                        asset => asset.key === "avatar"

                    )?.value || null;

                const character = {

                    name: player.name,

                    realm: player.realm,

                    realmSlug,

                    characterSlug:
                        encodeURIComponent(
                            player.name.toLowerCase()
                        ),

                    class: player.class,

                    role: player.role,

                    rank: player.rank,

                    itemLevel:
                        profile.equipped_item_level,

                    avatar

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

            }

            catch (error) {

                console.error(

                    `Fehler bei ${player.name}:`,

                    error.message

                );

            }

        }

        /* ==========================================
           Sortieren
        ========================================== */

        const sortByName = (a, b) =>
            a.name.localeCompare(
                b.name,
                "de",
                { sensitivity: "base" }
            );

        tanks.sort(sortByName);
        heals.sort(sortByName);
        melee.sort(sortByName);
        ranged.sort(sortByName);

        const result = {

            total:

                tanks.length +
                heals.length +
                melee.length +
                ranged.length,

            tanks,

            heals,

            melee,

            ranged

        };

        await setCache(

            CACHE.raidRoster.cacheKey,

            result,

            CACHE.raidRoster.ttl

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