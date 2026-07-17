/* ===================================================
   API Konfiguration
=================================================== */

export const CACHE = {

    activity: {

        name: "Activity",

        cacheKey: "cache:activity",

        historyKey: "activity",

        endpoint: "/api/activity",

        ttl:
            60 * 60 * 24

    },

    affixes: {

        name: "Affixes",

        cacheKey: "cache:affixes",

        historyKey: null,

        endpoint: "/api/affixes",

        ttl:
            60 * 60 * 24

    },

    classes: {

        name: "Classes",

        cacheKey: "cache:classes",

        historyKey: null,

        endpoint: "/api/classes",

        ttl:
            60 * 60 * 24

    },

    guildAchievements: {

        name: "Guild Achievements",

        cacheKey: "cache:guild-achievements",

        historyKey: "guild-achievements",

        endpoint: "/api/guild-achievements",

        ttl:
            60 * 60 * 24

    },

    homepage: {

        name: "Homepage",

        cacheKey: "cache:homepage",

        historyKey: null,

        endpoint: "/api/homepage",

        ttl:
            60 * 60 * 24

    },

    liveRaid: {

        name: "Live Raid",

        cacheKey: "cache:live-raid",

        historyKey: null,

        endpoint: "/api/live-raid",

        ttl:
            60

    },

    mythicHallOfFame: {

        name: "Mythic+ Hall of Fame",

        cacheKey: "cache:mythic-hof",

        historyKey: "mythic-hof",

        endpoint: "/api/mythic-hof",

        ttl:
            60 * 60

    },

    nextRaid: {

        name: "Next Raid",

        cacheKey: "cache:next-raid",

        historyKey: null,

        endpoint: "/api/next-raid",

        ttl:
            60 * 5

    },

    raidStatus: {

        name: "Raid Status",

        cacheKey: "cache:raid-status",

        historyKey: null,

        endpoint: "/api/raid-status",

        ttl:
            60 * 30

    },

    raidRoster: {

        name: "Raidkader",

        cacheKey: "cache:raid-roster",

        historyKey: null,

        endpoint: "/api/raid-roster",

        ttl:
            60 * 60 * 24

    },

    ranking: {

        name: "Ranking",

        cacheKey: "cache:ranking",

        historyKey: null,

        endpoint: "/api/ranking",

        ttl:
            60 * 60 * 24

    }

};