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