import { Buffer } from "buffer";

/* ===================================================
   Warcraft Logs Access Token
=================================================== */

export async function getWarcraftLogsToken() {

    const clientId =
        process.env.WCL_CLIENT_ID;

    const clientSecret =
        process.env.WCL_CLIENT_SECRET;

    const credentials = Buffer

        .from(`${clientId}:${clientSecret}`)

        .toString("base64");

    const tokenResponse = await fetch(

        "https://www.warcraftlogs.com/oauth/token",

        {

            method: "POST",

            headers: {

                Authorization: `Basic ${credentials}`,

                "Content-Type":
                    "application/x-www-form-urlencoded"

            },

            body: "grant_type=client_credentials"

        }

    );

    const tokenData =
        await tokenResponse.json();

    return tokenData.access_token;

}