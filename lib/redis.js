import { createClient } from "redis";

const redis = createClient({

    url: process.env.REDIS_URL

});

redis.on(

    "error",

    (err) => {

        console.error("Redis Error:", err);

    }

);

let connected = false;

export async function getRedis() {

    if (!connected) {

        await redis.connect();

        connected = true;

    }

    return redis;

}