import { deleteCache } from "../lib/cache.js";

export default async function handler(req, res) {

    await deleteCache("cache:mythic-hof");

    res.json({
        success: true
    });

}