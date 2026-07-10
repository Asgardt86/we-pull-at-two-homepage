import {

    loadRaidStatus

}

    from "../lib/raid-status.js";

/* ===================================================
   Raid-Bosse API
=================================================== */

export default async function handler(req, res) {

    try {

        const result =

            await loadRaidStatus();

        res.status(200).json(result);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            error: error.message

        });

    }

}