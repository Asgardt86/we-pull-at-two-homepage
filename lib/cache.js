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

/* ===================================================
   Cache löschen
=================================================== */

export async function deleteCache(key) {

    const redis = await getRedis();

    await redis.del(key);

}

/* ===================================================
   Alle Cache-Einträge löschen (Debug)
=================================================== */

export async function clearCache() {

    const redis = await getRedis();

    const keys = await redis.keys("cache:*");

    if (keys.length > 0) {

        await redis.del(keys);

    }

}

/* ===================================================
   Dauerhafte Daten lesen
=================================================== */

export async function getPermanent(key) {

    const redis = await getRedis();

    const data = await redis.get(key);

    if (!data) {

        return null;

    }

    return JSON.parse(data);

}

/* ===================================================
   Dauerhafte Daten speichern
=================================================== */

export async function setPermanent(

    key,

    data

) {

    const redis = await getRedis();

    await redis.set(

        key,

        JSON.stringify(data)

    );

}

/* ===================================================
   Cache Informationen lesen admin
=================================================== */

export async function getCacheInfo(key) {

    const redis = await getRedis();

    const cached = await redis.get(key);

    if (!cached) {

        return null;

    }

    const payload =
        JSON.parse(cached);

    const ttl =
        await redis.ttl(key);

    return {

        updated: payload.updated,

        ttl,

        data: payload.data

    };

}