import { Buffer } from "buffer";

/* ===================================================
   Blizzard Access Token
=================================================== */

export async function getAccessToken() {

    const clientId =
        process.env.BLIZZARD_CLIENT_ID;

    const clientSecret =
        process.env.BLIZZARD_CLIENT_SECRET;

    const credentials = Buffer

        .from(

            `${clientId}:${clientSecret}`

        )

        .toString("base64");

    const response = await fetch(

        "https://oauth.battle.net/token",

        {

            method: "POST",

            headers: {

                Authorization:

                    `Basic ${credentials}`,

                "Content-Type":

                    "application/x-www-form-urlencoded"

            },

            body:

                "grant_type=client_credentials"

        }

    );

    const data =

        await response.json();

    return data.access_token;

}