import { getRedis } from "./redis.js";

/* ===================================================
   Cache lesen
=================================================== */

export async function getCache(key) {

    const redis = await getRedis();

    const cached = await redis.get(key);

    if (!cached) {

        return null;

    }

    return JSON.parse(cached);

}

/* ===================================================
   Cache speichern
=================================================== */

export async function setCache(

    key,

    data,

    ttlSeconds

) {

    const redis = await getRedis();

    const payload = {

        updated: Date.now(),

        data

    };

    await redis.set(

        key,

        JSON.stringify(payload),

        {

            EX: ttlSeconds

        }

    );

}