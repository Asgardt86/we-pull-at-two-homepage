import {

    getCache,

    setCache

}

    from "../lib/cache.js";

import { CACHE } from "../lib/cache-times.js";

/* ===================================================
   Nächster Raid
=================================================== */

export default async function handler(req, res) {

    try {

        /* ===================================================
           Cache
        =================================================== */

        const cached = await getCache(

            CACHE.nextRaid.cacheKey

        );

        if (cached) {

            return res.status(200).json(

                cached.data

            );

        }

        const apiKey = process.env.WOWAUDIT_API_KEY;

        if (!apiKey) {

            return res.status(500).json({

                error: "WOWAUDIT_API_KEY fehlt"

            });

        }

        const response = await fetch(

            "https://wowaudit.com/v1/raids",

            {

                headers: {

                    Authorization: `Bearer ${apiKey}`

                }

            }

        );

        if (!response.ok) {

            return res.status(response.status).json({

                error: "WoWAudit API Fehler",

                status: response.status,

                statusText: response.statusText

            });

        }

        const data = await response.json();

        if (!data.raids || !Array.isArray(data.raids)) {

            return res.status(500).json({

                error: "Ungültiges API-Format"

            });

        }

        /* ===================================================
           Aktuelle Zeit
        =================================================== */

        const now = new Date(

            new Date().toLocaleString("en-US", {

                timeZone: "Europe/Berlin"

            })

        );

        /* ===================================================
           Nächsten Raid finden
        =================================================== */

        const upcoming = data.raids

            .map(raid => {

                const [year, month, day] =
                    raid.date.split("-");

                const [hour, minute] =
                    raid.start_time.split(":");

                const dateTime = new Date(

                    Number(year),

                    Number(month) - 1,

                    Number(day),

                    Number(hour),

                    Number(minute)

                );

                return {

                    ...raid,

                    dateTime

                };

            })

            .filter(raid => raid.dateTime > now)

            .sort((a, b) => a.dateTime - b.dateTime);

        if (upcoming.length === 0) {

            return res.status(200).json({

                message: "Kein geplanter Raid"

            });

        }

        const nextRaid = upcoming[0];

        /* ===================================================
           Countdown
        =================================================== */
        const diffMs = nextRaid.dateTime - now;

        const days =
            Math.floor(diffMs / (1000 * 60 * 60 * 24));

        const hours =
            Math.floor(diffMs / (1000 * 60 * 60) % 24);

        const minutes =
            Math.floor(diffMs / (1000 * 60) % 60);

        /* ===================================================
           Wochentag
        =================================================== */

        const weekday = nextRaid.dateTime.toLocaleDateString(

            "de-DE",

            {

                weekday: "long"

            }

        );

        /* ===================================================
           Ergebnis
        =================================================== */

        const result = {

            title: nextRaid.title,

            raid: nextRaid.instance,

            instances: nextRaid.instances,

            optional: nextRaid.optional,

            isCustom: nextRaid.instance === null,

            difficulty: nextRaid.difficulty,

            weekday,

            date: nextRaid.date,

            startTime: nextRaid.start_time,

            endTime: nextRaid.end_time,

            presentSize: nextRaid.present_size,

            totalSize: nextRaid.total_size,

            countdown: {

                days,

                hours,

                minutes

            },

            url:
                "https://wepullattwo.wowaudit.com/teams/main-raid/events"

        };

        await setCache(

            CACHE.nextRaid.cacheKey,

            result,

            CACHE.nextRaid.ttl

        );

        return res.status(200).json(result);

    }

    catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

}