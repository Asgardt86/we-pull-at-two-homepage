import {

    getPermanent,

    setPermanent

}

    from "./cache.js";

/* ===================================================
   Historie laden
=================================================== */

export async function loadHistory(

    key

) {

    const history =

        await getPermanent(

            `history:${key}`

        );

    if (!history) {

        return [];

    }

    /* -----------------------------------------------
       Neues Format
    ----------------------------------------------- */

    if (

        Array.isArray(history)

    ) {

        return history;

    }

    /* -----------------------------------------------
       Altes Format
    ----------------------------------------------- */

    if (

        Array.isArray(history.activities)

    ) {

        return history.activities;

    }

    return [];

}

/* ===================================================
   Historie speichern
=================================================== */

export async function saveHistory(

    key,

    entries

) {

    await setPermanent(

        `history:${key}`,

        entries

    );

}

/* ===================================================
   Historie zusammenführen
=================================================== */

export function mergeHistory(

    oldEntries = [],

    newEntries = [],

    getId,

    maxEntries = 20

) {

    const map = new Map();

    /* -----------------------------------------------
       Neue Einträge zuerst
    ----------------------------------------------- */

    [...newEntries, ...oldEntries].forEach(entry => {

        map.set(

            getId(entry),

            entry

        );

    });

    return [...map.values()]

        .slice(0, maxEntries);

}