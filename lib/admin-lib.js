import { getCache } from "./cache.js";
import { getAccessTokenInfo } from "./blizzard.js";

/* ===================================================
   Admin Daten
=================================================== */

export async function buildAdminData({ password }) {

    if (password !== process.env.ADMIN_PASSWORD) {

        return {

            authorized: false

        };

    }

    const apis =
        await buildApiStatus();

    const cache =
        await buildCacheStatus();

    const system =
        buildSystemStatus();

    return {

        authorized: true,

        apis,

        cache,

        system

    };

}

/* ===================================================
   API Status
=================================================== */

async function buildApiStatus() {

    /* ---------- Blizzard ---------- */

    const blizzard =
        await getAccessTokenInfo();

    /* ---------- WoWAudit ---------- */

    const wowauditStart =
        Date.now();

    let wowauditOnline = false;

    try {

        const response = await fetch(

            "https://wowaudit.com/v1/team",

            {

                headers: {

                    Authorization:
                        `Bearer ${process.env.WOWAUDIT_API_KEY}`

                }

            }

        );

        wowauditOnline =
            response.ok;

    }

    catch {

        wowauditOnline = false;

    }

    const wowauditTime =
        Date.now() - wowauditStart;

    /* ---------- Raider.IO ---------- */

    const raiderStart =
        Date.now();

    let raiderOnline = false;

    try {

        const response = await fetch(

            "https://raider.io/api/v1/guilds/profile?region=eu&realm=blackrock&name=We%20Pull%20at%20Two"

        );

        raiderOnline =
            response.ok;

    }

    catch {

        raiderOnline = false;

    }

    const raiderTime =
        Date.now() - raiderStart;

    return {

        blizzard: {

            online:
                blizzard.success,

            responseTime:
                blizzard.responseTime,

            createdAt:
                blizzard.createdAt,

            expiresAt:
                blizzard.expiresAt

        },

        wowaudit: {

            online:
                wowauditOnline,

            responseTime:
                wowauditTime

        },

        raiderio: {

            online:
                raiderOnline,

            responseTime:
                raiderTime

        }

    };

}

/* ===================================================
   Cache
=================================================== */

async function buildCacheStatus() {

    const cache =
        await getCache("cache:homepage");

    const cacheTime =
        60 * 60 * 24;

    if (!cache) {

        return {

            status: "MISS",

            updated: null,

            age: null,

            expiresIn: 0,

            cacheTime

        };

    }

    const age =
        Math.floor(

            (Date.now() - cache.updated) / 1000

        );

    const expiresIn =
        Math.max(

            0,

            cacheTime - age

        );

    return {

        status: "HIT",

        updated:
            cache.updated,

        age,

        expiresIn,

        cacheTime

    };

}

/* ===================================================
   System
=================================================== */

function buildSystemStatus() {

    const memory =
        process.memoryUsage();

    return {

        serverTime:
            Date.now(),

        nodeVersion:
            process.version,

        uptime:
            Math.floor(

                process.uptime()

            ),

        memory: {

            rss:
                memory.rss,

            heapUsed:
                memory.heapUsed,

            heapTotal:
                memory.heapTotal

        }

    };

}