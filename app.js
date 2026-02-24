/* ============================================================
   Gen 1 RNG Gym Run — app.js
   Vanilla JS, no build step, GitHub Pages compatible
   All JSON data inlined — no fetch() calls needed
   ============================================================ */

// ── Inlined Game Data ──────────────────────────────────────────
const INLINE_POKEDEX = [
  {"dexNumber":1,"name":"Bulbasaur","type1":"Grass","type2":"Poison","tier":"Common","evolvesTo":2},
  {"dexNumber":2,"name":"Ivysaur","type1":"Grass","type2":"Poison","tier":"Uncommon","evolvesTo":3},
  {"dexNumber":3,"name":"Venusaur","type1":"Grass","type2":"Poison","tier":"Rare","evolvesTo":null},
  {"dexNumber":4,"name":"Charmander","type1":"Fire","type2":null,"tier":"Common","evolvesTo":5},
  {"dexNumber":5,"name":"Charmeleon","type1":"Fire","type2":null,"tier":"Uncommon","evolvesTo":6},
  {"dexNumber":6,"name":"Charizard","type1":"Fire","type2":"Flying","tier":"Rare","evolvesTo":null},
  {"dexNumber":7,"name":"Squirtle","type1":"Water","type2":null,"tier":"Common","evolvesTo":8},
  {"dexNumber":8,"name":"Wartortle","type1":"Water","type2":null,"tier":"Uncommon","evolvesTo":9},
  {"dexNumber":9,"name":"Blastoise","type1":"Water","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":10,"name":"Caterpie","type1":"Bug","type2":null,"tier":"Common","evolvesTo":11},
  {"dexNumber":11,"name":"Metapod","type1":"Bug","type2":null,"tier":"Common","evolvesTo":12},
  {"dexNumber":12,"name":"Butterfree","type1":"Bug","type2":"Flying","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":13,"name":"Weedle","type1":"Bug","type2":"Poison","tier":"Common","evolvesTo":14},
  {"dexNumber":14,"name":"Kakuna","type1":"Bug","type2":"Poison","tier":"Common","evolvesTo":15},
  {"dexNumber":15,"name":"Beedrill","type1":"Bug","type2":"Poison","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":16,"name":"Pidgey","type1":"Normal","type2":"Flying","tier":"Common","evolvesTo":17},
  {"dexNumber":17,"name":"Pidgeotto","type1":"Normal","type2":"Flying","tier":"Common","evolvesTo":18},
  {"dexNumber":18,"name":"Pidgeot","type1":"Normal","type2":"Flying","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":19,"name":"Rattata","type1":"Normal","type2":null,"tier":"Common","evolvesTo":20},
  {"dexNumber":20,"name":"Raticate","type1":"Normal","type2":null,"tier":"Common","evolvesTo":null},
  {"dexNumber":21,"name":"Spearow","type1":"Normal","type2":"Flying","tier":"Common","evolvesTo":22},
  {"dexNumber":22,"name":"Fearow","type1":"Normal","type2":"Flying","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":23,"name":"Ekans","type1":"Poison","type2":null,"tier":"Common","evolvesTo":24},
  {"dexNumber":24,"name":"Arbok","type1":"Poison","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":25,"name":"Pikachu","type1":"Electric","type2":null,"tier":"Uncommon","evolvesTo":26},
  {"dexNumber":26,"name":"Raichu","type1":"Electric","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":27,"name":"Sandshrew","type1":"Ground","type2":null,"tier":"Common","evolvesTo":28},
  {"dexNumber":28,"name":"Sandslash","type1":"Ground","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":29,"name":"Nidoran-F","type1":"Poison","type2":null,"tier":"Common","evolvesTo":30},
  {"dexNumber":30,"name":"Nidorina","type1":"Poison","type2":null,"tier":"Common","evolvesTo":31},
  {"dexNumber":31,"name":"Nidoqueen","type1":"Poison","type2":"Ground","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":32,"name":"Nidoran-M","type1":"Poison","type2":null,"tier":"Common","evolvesTo":33},
  {"dexNumber":33,"name":"Nidorino","type1":"Poison","type2":null,"tier":"Common","evolvesTo":34},
  {"dexNumber":34,"name":"Nidoking","type1":"Poison","type2":"Ground","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":35,"name":"Clefairy","type1":"Normal","type2":null,"tier":"Uncommon","evolvesTo":36},
  {"dexNumber":36,"name":"Clefable","type1":"Normal","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":37,"name":"Vulpix","type1":"Fire","type2":null,"tier":"Common","evolvesTo":38},
  {"dexNumber":38,"name":"Ninetales","type1":"Fire","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":39,"name":"Jigglypuff","type1":"Normal","type2":null,"tier":"Common","evolvesTo":40},
  {"dexNumber":40,"name":"Wigglytuff","type1":"Normal","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":41,"name":"Zubat","type1":"Poison","type2":"Flying","tier":"Common","evolvesTo":42},
  {"dexNumber":42,"name":"Golbat","type1":"Poison","type2":"Flying","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":43,"name":"Oddish","type1":"Grass","type2":"Poison","tier":"Common","evolvesTo":44},
  {"dexNumber":44,"name":"Gloom","type1":"Grass","type2":"Poison","tier":"Common","evolvesTo":45},
  {"dexNumber":45,"name":"Vileplume","type1":"Grass","type2":"Poison","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":46,"name":"Paras","type1":"Bug","type2":"Grass","tier":"Common","evolvesTo":47},
  {"dexNumber":47,"name":"Parasect","type1":"Bug","type2":"Grass","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":48,"name":"Venonat","type1":"Bug","type2":"Poison","tier":"Common","evolvesTo":49},
  {"dexNumber":49,"name":"Venomoth","type1":"Bug","type2":"Poison","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":50,"name":"Diglett","type1":"Ground","type2":null,"tier":"Common","evolvesTo":51},
  {"dexNumber":51,"name":"Dugtrio","type1":"Ground","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":52,"name":"Meowth","type1":"Normal","type2":null,"tier":"Common","evolvesTo":53},
  {"dexNumber":53,"name":"Persian","type1":"Normal","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":54,"name":"Psyduck","type1":"Water","type2":null,"tier":"Common","evolvesTo":55},
  {"dexNumber":55,"name":"Golduck","type1":"Water","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":56,"name":"Mankey","type1":"Fighting","type2":null,"tier":"Common","evolvesTo":57},
  {"dexNumber":57,"name":"Primeape","type1":"Fighting","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":58,"name":"Growlithe","type1":"Fire","type2":null,"tier":"Common","evolvesTo":59},
  {"dexNumber":59,"name":"Arcanine","type1":"Fire","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":60,"name":"Poliwag","type1":"Water","type2":null,"tier":"Common","evolvesTo":61},
  {"dexNumber":61,"name":"Poliwhirl","type1":"Water","type2":null,"tier":"Common","evolvesTo":62},
  {"dexNumber":62,"name":"Poliwrath","type1":"Water","type2":"Fighting","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":63,"name":"Abra","type1":"Psychic","type2":null,"tier":"Uncommon","evolvesTo":64},
  {"dexNumber":64,"name":"Kadabra","type1":"Psychic","type2":null,"tier":"Uncommon","evolvesTo":65},
  {"dexNumber":65,"name":"Alakazam","type1":"Psychic","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":66,"name":"Machop","type1":"Fighting","type2":null,"tier":"Common","evolvesTo":67},
  {"dexNumber":67,"name":"Machoke","type1":"Fighting","type2":null,"tier":"Uncommon","evolvesTo":68},
  {"dexNumber":68,"name":"Machamp","type1":"Fighting","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":69,"name":"Bellsprout","type1":"Grass","type2":"Poison","tier":"Common","evolvesTo":70},
  {"dexNumber":70,"name":"Weepinbell","type1":"Grass","type2":"Poison","tier":"Common","evolvesTo":71},
  {"dexNumber":71,"name":"Victreebel","type1":"Grass","type2":"Poison","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":72,"name":"Tentacool","type1":"Water","type2":"Poison","tier":"Common","evolvesTo":73},
  {"dexNumber":73,"name":"Tentacruel","type1":"Water","type2":"Poison","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":74,"name":"Geodude","type1":"Rock","type2":"Ground","tier":"Common","evolvesTo":75},
  {"dexNumber":75,"name":"Graveler","type1":"Rock","type2":"Ground","tier":"Common","evolvesTo":76},
  {"dexNumber":76,"name":"Golem","type1":"Rock","type2":"Ground","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":77,"name":"Ponyta","type1":"Fire","type2":null,"tier":"Common","evolvesTo":78},
  {"dexNumber":78,"name":"Rapidash","type1":"Fire","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":79,"name":"Slowpoke","type1":"Water","type2":"Psychic","tier":"Common","evolvesTo":80},
  {"dexNumber":80,"name":"Slowbro","type1":"Water","type2":"Psychic","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":81,"name":"Magnemite","type1":"Electric","type2":null,"tier":"Common","evolvesTo":82},
  {"dexNumber":82,"name":"Magneton","type1":"Electric","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":83,"name":"Farfetch'd","type1":"Normal","type2":"Flying","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":84,"name":"Doduo","type1":"Normal","type2":"Flying","tier":"Common","evolvesTo":85},
  {"dexNumber":85,"name":"Dodrio","type1":"Normal","type2":"Flying","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":86,"name":"Seel","type1":"Water","type2":null,"tier":"Common","evolvesTo":87},
  {"dexNumber":87,"name":"Dewgong","type1":"Water","type2":"Ice","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":88,"name":"Grimer","type1":"Poison","type2":null,"tier":"Common","evolvesTo":89},
  {"dexNumber":89,"name":"Muk","type1":"Poison","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":90,"name":"Shellder","type1":"Water","type2":null,"tier":"Common","evolvesTo":91},
  {"dexNumber":91,"name":"Cloyster","type1":"Water","type2":"Ice","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":92,"name":"Gastly","type1":"Ghost","type2":"Poison","tier":"Common","evolvesTo":93},
  {"dexNumber":93,"name":"Haunter","type1":"Ghost","type2":"Poison","tier":"Uncommon","evolvesTo":94},
  {"dexNumber":94,"name":"Gengar","type1":"Ghost","type2":"Poison","tier":"Rare","evolvesTo":null},
  {"dexNumber":95,"name":"Onix","type1":"Rock","type2":"Ground","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":96,"name":"Drowzee","type1":"Psychic","type2":null,"tier":"Common","evolvesTo":97},
  {"dexNumber":97,"name":"Hypno","type1":"Psychic","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":98,"name":"Krabby","type1":"Water","type2":null,"tier":"Common","evolvesTo":99},
  {"dexNumber":99,"name":"Kingler","type1":"Water","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":100,"name":"Voltorb","type1":"Electric","type2":null,"tier":"Common","evolvesTo":101},
  {"dexNumber":101,"name":"Electrode","type1":"Electric","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":102,"name":"Exeggcute","type1":"Grass","type2":"Psychic","tier":"Common","evolvesTo":103},
  {"dexNumber":103,"name":"Exeggutor","type1":"Grass","type2":"Psychic","tier":"Rare","evolvesTo":null},
  {"dexNumber":104,"name":"Cubone","type1":"Ground","type2":null,"tier":"Common","evolvesTo":105},
  {"dexNumber":105,"name":"Marowak","type1":"Ground","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":106,"name":"Hitmonlee","type1":"Fighting","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":107,"name":"Hitmonchan","type1":"Fighting","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":108,"name":"Lickitung","type1":"Normal","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":109,"name":"Koffing","type1":"Poison","type2":null,"tier":"Common","evolvesTo":110},
  {"dexNumber":110,"name":"Weezing","type1":"Poison","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":111,"name":"Rhyhorn","type1":"Ground","type2":"Rock","tier":"Common","evolvesTo":112},
  {"dexNumber":112,"name":"Rhydon","type1":"Ground","type2":"Rock","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":113,"name":"Chansey","type1":"Normal","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":114,"name":"Tangela","type1":"Grass","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":115,"name":"Kangaskhan","type1":"Normal","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":116,"name":"Horsea","type1":"Water","type2":null,"tier":"Common","evolvesTo":117},
  {"dexNumber":117,"name":"Seadra","type1":"Water","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":118,"name":"Goldeen","type1":"Water","type2":null,"tier":"Common","evolvesTo":119},
  {"dexNumber":119,"name":"Seaking","type1":"Water","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":120,"name":"Staryu","type1":"Water","type2":null,"tier":"Common","evolvesTo":121},
  {"dexNumber":121,"name":"Starmie","type1":"Water","type2":"Psychic","tier":"Rare","evolvesTo":null},
  {"dexNumber":122,"name":"Mr. Mime","type1":"Psychic","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":123,"name":"Scyther","type1":"Bug","type2":"Flying","tier":"Rare","evolvesTo":null},
  {"dexNumber":124,"name":"Jynx","type1":"Ice","type2":"Psychic","tier":"Uncommon","evolvesTo":null},
  {"dexNumber":125,"name":"Electabuzz","type1":"Electric","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":126,"name":"Magmar","type1":"Fire","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":127,"name":"Pinsir","type1":"Bug","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":128,"name":"Tauros","type1":"Normal","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":129,"name":"Magikarp","type1":"Water","type2":null,"tier":"Common","evolvesTo":130},
  {"dexNumber":130,"name":"Gyarados","type1":"Water","type2":"Flying","tier":"Rare","evolvesTo":null},
  {"dexNumber":131,"name":"Lapras","type1":"Water","type2":"Ice","tier":"Rare","evolvesTo":null},
  {"dexNumber":132,"name":"Ditto","type1":"Normal","type2":null,"tier":"Uncommon","evolvesTo":null},
  {"dexNumber":133,"name":"Eevee","type1":"Normal","type2":null,"tier":"Uncommon","evolvesTo":136},
  {"dexNumber":134,"name":"Vaporeon","type1":"Water","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":135,"name":"Jolteon","type1":"Electric","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":136,"name":"Flareon","type1":"Fire","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":137,"name":"Porygon","type1":"Normal","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":138,"name":"Omanyte","type1":"Rock","type2":"Water","tier":"Uncommon","evolvesTo":139},
  {"dexNumber":139,"name":"Omastar","type1":"Rock","type2":"Water","tier":"Rare","evolvesTo":null},
  {"dexNumber":140,"name":"Kabuto","type1":"Rock","type2":"Water","tier":"Uncommon","evolvesTo":141},
  {"dexNumber":141,"name":"Kabutops","type1":"Rock","type2":"Water","tier":"Rare","evolvesTo":null},
  {"dexNumber":142,"name":"Aerodactyl","type1":"Rock","type2":"Flying","tier":"Rare","evolvesTo":null},
  {"dexNumber":143,"name":"Snorlax","type1":"Normal","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":144,"name":"Articuno","type1":"Ice","type2":"Flying","tier":"Rare","evolvesTo":null},
  {"dexNumber":145,"name":"Zapdos","type1":"Electric","type2":"Flying","tier":"Rare","evolvesTo":null},
  {"dexNumber":146,"name":"Moltres","type1":"Fire","type2":"Flying","tier":"Rare","evolvesTo":null},
  {"dexNumber":147,"name":"Dratini","type1":"Dragon","type2":null,"tier":"Uncommon","evolvesTo":148},
  {"dexNumber":148,"name":"Dragonair","type1":"Dragon","type2":null,"tier":"Rare","evolvesTo":149},
  {"dexNumber":149,"name":"Dragonite","type1":"Dragon","type2":"Flying","tier":"Rare","evolvesTo":null},
  {"dexNumber":150,"name":"Mewtwo","type1":"Psychic","type2":null,"tier":"Rare","evolvesTo":null},
  {"dexNumber":151,"name":"Mew","type1":"Psychic","type2":null,"tier":"Rare","evolvesTo":null}
];

const INLINE_TYPECHART = {
  "Normal":    {"Rock":0.5,"Ghost":0},
  "Fire":      {"Fire":0.5,"Water":0.5,"Grass":2,"Ice":2,"Bug":2,"Rock":0.5,"Dragon":0.5},
  "Water":     {"Fire":2,"Water":0.5,"Grass":0.5,"Ground":2,"Rock":2,"Dragon":0.5},
  "Electric":  {"Water":2,"Electric":0.5,"Grass":0.5,"Ground":0,"Flying":2,"Dragon":0.5},
  "Grass":     {"Fire":0.5,"Water":2,"Grass":0.5,"Poison":0.5,"Ground":2,"Flying":0.5,"Bug":0.5,"Rock":2,"Dragon":0.5},
  "Ice":       {"Water":0.5,"Grass":2,"Ice":0.5,"Ground":2,"Flying":2,"Dragon":2},
  "Fighting":  {"Normal":2,"Ice":2,"Poison":0.5,"Flying":0.5,"Psychic":0.5,"Bug":0.5,"Rock":2,"Ghost":0},
  "Poison":    {"Grass":2,"Poison":0.5,"Ground":0.5,"Bug":2,"Rock":0.5,"Ghost":0.5},
  "Ground":    {"Fire":2,"Electric":2,"Grass":0.5,"Poison":2,"Flying":0,"Bug":0.5,"Rock":2},
  "Flying":    {"Electric":0.5,"Grass":2,"Fighting":2,"Bug":2,"Rock":0.5},
  "Psychic":   {"Fighting":2,"Poison":2,"Psychic":0.5,"Ghost":0},
  "Bug":       {"Fire":0.5,"Grass":2,"Fighting":0.5,"Flying":0.5,"Psychic":2,"Ghost":0.5,"Poison":2},
  "Rock":      {"Fire":2,"Ice":2,"Fighting":0.5,"Ground":0.5,"Flying":2,"Bug":2},
  "Ghost":     {"Normal":0,"Psychic":0,"Ghost":2},
  "Dragon":    {"Dragon":2}
};

const INLINE_STAGES = [
  {
    "id": "gym1",
    "stageName": "Brock's Gym",
    "stageKind": "GYM",
    "stageTypes": [
      "Rock"
    ],
    "leader": "Brock",
    "badge": "Boulder Badge",
    "difficulty": 0,
    "jitter": {
      "enabled": false,
      "min": 0,
      "max": 0
    }
  },
  {
    "id": "gym2",
    "stageName": "Misty's Gym",
    "stageKind": "GYM",
    "stageTypes": [
      "Water"
    ],
    "leader": "Misty",
    "badge": "Cascade Badge",
    "difficulty": 4,
    "jitter": {
      "enabled": false,
      "min": 0,
      "max": 0
    }
  },
  {
    "id": "gym3",
    "stageName": "Lt. Surge's Gym",
    "stageKind": "GYM",
    "stageTypes": [
      "Electric"
    ],
    "leader": "Lt. Surge",
    "badge": "Thunder Badge",
    "difficulty": 8,
    "jitter": {
      "enabled": false,
      "min": 0,
      "max": 0
    }
  },
  {
    "id": "gym4",
    "stageName": "Erika's Gym",
    "stageKind": "GYM",
    "stageTypes": [
      "Grass"
    ],
    "leader": "Erika",
    "badge": "Rainbow Badge",
    "difficulty": 12,
    "jitter": {
      "enabled": false,
      "min": 0,
      "max": 0
    }
  },
  {
    "id": "gym5",
    "stageName": "Koga's Gym",
    "stageKind": "GYM",
    "stageTypes": [
      "Poison"
    ],
    "leader": "Koga",
    "badge": "Soul Badge",
    "difficulty": 16,
    "jitter": {
      "enabled": true,
      "min": -2,
      "max": 2
    }
  },
  {
    "id": "gym6",
    "stageName": "Sabrina's Gym",
    "stageKind": "GYM",
    "stageTypes": [
      "Psychic"
    ],
    "leader": "Sabrina",
    "badge": "Marsh Badge",
    "difficulty": 20,
    "jitter": {
      "enabled": true,
      "min": -2,
      "max": 2
    }
  },
  {
    "id": "gym7",
    "stageName": "Blaine's Gym",
    "stageKind": "GYM",
    "stageTypes": [
      "Fire"
    ],
    "leader": "Blaine",
    "badge": "Volcano Badge",
    "difficulty": 24,
    "jitter": {
      "enabled": true,
      "min": -2,
      "max": 2
    }
  },
  {
    "id": "gym8",
    "stageName": "Giovanni's Gym",
    "stageKind": "GYM",
    "stageTypes": [
      "Ground"
    ],
    "leader": "Giovanni",
    "badge": "Earth Badge",
    "difficulty": 28,
    "jitter": {
      "enabled": true,
      "min": -2,
      "max": 2
    }
  },
  {
    "id": "e4_1",
    "stageName": "Lorelei \u2014 Elite Four",
    "stageKind": "E4",
    "stageTypes": [
      "Ice",
      "Water"
    ],
    "leader": "Lorelei",
    "badge": null,
    "difficulty": 34,
    "jitter": {
      "enabled": true,
      "min": -3,
      "max": 3
    }
  },
  {
    "id": "e4_2",
    "stageName": "Bruno \u2014 Elite Four",
    "stageKind": "E4",
    "stageTypes": [
      "Fighting",
      "Rock"
    ],
    "leader": "Bruno",
    "badge": null,
    "difficulty": 38,
    "jitter": {
      "enabled": true,
      "min": -3,
      "max": 3
    }
  },
  {
    "id": "e4_3",
    "stageName": "Agatha \u2014 Elite Four",
    "stageKind": "E4",
    "stageTypes": [
      "Ghost",
      "Poison"
    ],
    "leader": "Agatha",
    "badge": null,
    "difficulty": 42,
    "jitter": {
      "enabled": true,
      "min": -3,
      "max": 3
    }
  },
  {
    "id": "e4_4",
    "stageName": "Lance \u2014 Elite Four",
    "stageKind": "E4",
    "stageTypes": [
      "Dragon",
      "Flying"
    ],
    "leader": "Lance",
    "badge": null,
    "difficulty": 46,
    "jitter": {
      "enabled": true,
      "min": -3,
      "max": 3
    }
  },
  {
    "id": "champion",
    "stageName": "Blue \u2014 Champion",
    "stageKind": "CHAMPION",
    "stageTypes": [
      "Mixed"
    ],
    "leader": "Blue",
    "badge": null,
    "difficulty": 50,
    "jitter": {
      "enabled": true,
      "min": -3,
      "max": 3
    }
  }
];

const INLINE_BALANCE = {
  "intermissionWheel": {
    "Capture": 30,
    "DoubleCapture": 10,
    "GuaranteedRareEncounter": 6,
    "MysteryPokemon": 9,
    "EvolvePartyPokemon": 12,
    "TypeShield": 10,
    "LuckyCharm": 6,
    "BonusSlotNextBattle": 7,
    "FindItem": 10
  },
  "captureTierWeights": {
    "Common": 70,
    "Uncommon": 25,
    "Rare": 5
  },
  "mysteryTierWeights": {
    "Common": 55,
    "Uncommon": 35,
    "Rare": 10
  },
  "captureResultWeights": {
    "Fail": 30,
    "Success": 60,
    "Critical": 10
  },
  "criticalBonus": 6,
  "partyFullWheel": {
    "ReplaceRandom": 40,
    "ReplaceWorstMatchup": 40,
    "DiscardNew": 20
  },
  "findItemWheel": {
    "Potion": 45,
    "TypeShield": 30,
    "LuckyCharm": 20,
    "RunningShoes": 5
  },
  "intermissionSpins": {
    "base": 1,
    "withRunningShoes": 2
  },
  "typeShieldBonus": 8,
  "bonusSlotContribution": 7,
  "winModel": {
    "baseChance": 20,
    "contributions": {
      "VeryStrong": 12,
      "Strong": 10,
      "Neutral": 5,
      "Resisted": 2
    },
    "clamp": [5, 95]
  }
};

// ── Global State ──────────────────────────────────────────────
let G = {};
let DATA = {};

// ── Data Init ─────────────────────────────────────────────────
function loadData() {
  DATA.pokedex = INLINE_POKEDEX;
  DATA.typeChart = INLINE_TYPECHART;
  DATA.stages = INLINE_STAGES;
  DATA.balance = INLINE_BALANCE;
  DATA.byTier = { Common: [], Uncommon: [], Rare: [] };
  for (const p of DATA.pokedex) DATA.byTier[p.tier].push(p);
  DATA.dexMap = {};
  for (const p of DATA.pokedex) DATA.dexMap[p.dexNumber] = p;
}

// ── Wheel Engine ───────────────────────────────────────────────
const canvas = document.getElementById('wheel-canvas');
const ctx = canvas.getContext('2d');

const WHEEL_COLORS_DARK = [
  '#c03060','#e06020','#b8a020','#208050','#2060c0','#803090',
  '#c05050','#2090a0','#a04080','#50a030','#d04030','#3060a0',
  '#a07020','#306090'
];
const WHEEL_COLORS_LIGHT = [
  '#f06090','#f0a060','#d8c040','#60c080','#6090e0','#c070d0',
  '#e08080','#60c0d0','#d070a0','#80d070','#f07060','#6080d0',
  '#d0a040','#5080d0'
];

let wheelState = {
  slices: [],
  angle: 0,
  spinning: false,
  targetAngle: 0,
  startAngle: 0,
  startTime: 0,
  duration: 0,
  onDone: null,
};

function buildWheel(slices) {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const colors = isDark ? WHEEL_COLORS_DARK : WHEEL_COLORS_LIGHT;
  return slices.map((s, i) => ({ ...s, color: colors[i % colors.length] }));
}

// Returns the label of the slice currently under the pointer (top of wheel).
// The pointer is at the top, which corresponds to angle=0 in draw coords.
// draw: slices start at (wheelAngle - PI/2). Pointer at top = absolute angle -PI/2 from center.
// The slice at the pointer is whichever slice contains angle 0 (top) in the rotated wheel.
function getPointerSlice(slices, angle) {
  if (!slices || slices.length === 0) return null;
  const total = slices.reduce((s, x) => s + x.weight, 0);
  // "top" in our coordinate: the pointer sits at angle = -(PI/2) + angle relative to draw start
  // Slices are drawn starting at (angle - PI/2), going clockwise.
  // The pointer is at the top = angle (- PI/2) in absolute terms.
  // We need to find which slice contains the pointer position.
  // Normalize: pointer position within wheel = 0 (start of first slice reference angle)
  // pointer is at the draw start angle = angle - PI/2
  // So relative to draw start (angle - PI/2), pointer is at 0.
  // But we want offset from angle=0 (the draw start of first slice at offset angle - PI/2)
  // Actually simpler: the pointer is at the top. The wheel's reference angle rotates.
  // At angle=0, slice[0] starts at -PI/2 (top). So pointer hits slice[0]'s start.
  // pointer position in "slice space": we need (0 - (angle - PI/2)) mod 2PI = (PI/2 - angle) mod 2PI
  // = how far into the wheel (clockwise from its start) the pointer sits
  let pointerInWheel = ((Math.PI / 2 - angle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  let acc = 0;
  for (const s of slices) {
    const sweep = (s.weight / total) * 2 * Math.PI;
    if (pointerInWheel < acc + sweep) return s;
    acc += sweep;
  }
  return slices[slices.length - 1];
}

function drawWheel(slices, angle) {
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const r = Math.min(W, H) / 2 - 6;
  ctx.clearRect(0, 0, W, H);
  if (!slices || slices.length === 0) return;

  let start = angle - Math.PI / 2;
  const total = slices.reduce((s, x) => s + x.weight, 0);

  for (const s of slices) {
    const sweep = (s.weight / total) * 2 * Math.PI;
    const end = start + sweep;
    const mid = start + sweep / 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (sweep > 0.12) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      ctx.fillStyle = isDark ? '#fff' : '#000';
      ctx.shadowColor = isDark ? '#000' : '#fff';
      ctx.shadowBlur = 4;
      let label = s.label.length > 14 ? s.label.slice(0, 13) + '\u2026' : s.label;
      const fontSize = Math.max(8, Math.min(13, sweep * 40));
      ctx.font = `bold ${fontSize}px 'VT323', monospace`;
      ctx.fillText(label, r * 0.65, 0);
      ctx.restore();
    }
    start = end;
  }

  // Center hub
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.strokeStyle = '#f8e71c';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

function animateSpin(timestamp) {
  if (!wheelState.spinning) return;
  const elapsed = timestamp - wheelState.startTime;
  const progress = Math.min(elapsed / wheelState.duration, 1);
  wheelState.angle = wheelState.startAngle + (wheelState.targetAngle - wheelState.startAngle) * easeOut(progress);
  drawWheel(wheelState.slices, wheelState.angle);

  // Live pointer label update
  const current = getPointerSlice(wheelState.slices, wheelState.angle);
  if (current) setPointerLabel(current.label);

  if (progress < 1) {
    requestAnimationFrame(animateSpin);
  } else {
    wheelState.spinning = false;
    canvas.classList.remove('wheel-spinning');
    if (wheelState.onDone) wheelState.onDone();
  }
}

function spinWheel(slices, onDone) {
  if (wheelState.spinning) return;
  if (!slices || slices.length === 0) return;

  const built = buildWheel(slices);
  wheelState.slices = built;

  // Weighted random winner
  const total = slices.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  let winnerIdx = slices.length - 1;
  for (let i = 0; i < slices.length; i++) {
    r -= slices[i].weight;
    if (r <= 0) { winnerIdx = i; break; }
  }

  // Compute target angle so winner slice mid is at pointer (top)
  const totalW = slices.reduce((s, x) => s + x.weight, 0);
  let accAngle = 0;
  for (let i = 0; i < winnerIdx; i++) accAngle += (slices[i].weight / totalW) * 2 * Math.PI;
  const winnerMid = accAngle + (slices[winnerIdx].weight / totalW) * Math.PI;

  // We want pointer (top) to land on winnerMid.
  // pointer position in slice space: (PI/2 - angle) mod 2PI = winnerMid
  // => angle = PI/2 - winnerMid  (mod 2PI)
  const targetNorm = ((Math.PI / 2 - winnerMid) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  const currentNorm = ((wheelState.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const spins = 4 + Math.random() * 4;
  let diff = (targetNorm - currentNorm + 2 * Math.PI) % (2 * Math.PI);
  if (diff < 0.01) diff += 2 * Math.PI; // ensure at least one full rotation portion

  wheelState.targetAngle = wheelState.angle + spins * 2 * Math.PI + diff;
  wheelState.startAngle = wheelState.angle;
  wheelState.spinning = true;
  wheelState.startTime = performance.now();
  wheelState.duration = 2800 + Math.random() * 1000;
  wheelState.onDone = () => {
    const finalSlice = getPointerSlice(built, wheelState.angle);
    setPointerLabel(finalSlice ? finalSlice.label : '');
    onDone(winnerIdx, built[winnerIdx]);
  };
  canvas.classList.add('wheel-spinning');
  requestAnimationFrame(animateSpin);
}

// ── Pointer Label ──────────────────────────────────────────────
function setPointerLabel(text) {
  document.getElementById('pointer-label').textContent = text ? `▼  ${text}` : '';
}

// ── Type Effectiveness ─────────────────────────────────────────
function getEffectiveness(attackType, defType) {
  const row = DATA.typeChart[attackType];
  if (!row) return 1;
  return row[defType] ?? 1;
}

function getPokemonMatchup(pokemon, stageTypes) {
  const pokemonTypes = [pokemon.type1, pokemon.type2].filter(Boolean);
  const filtered = stageTypes.filter(t => t !== 'Mixed');
  let best = 0, superCount = 0;
  for (const pt of pokemonTypes) {
    for (const st of filtered) {
      const eff = getEffectiveness(pt, st);
      if (eff > best) best = eff;
      if (eff >= 2) superCount++;
    }
  }
  const bal = DATA.balance.winModel.contributions;
  if (superCount >= 2) return { category: 'VeryStrong', value: bal.VeryStrong };
  if (best >= 2)       return { category: 'Strong',     value: bal.Strong };
  if (best >= 1)       return { category: 'Neutral',    value: bal.Neutral };
  return                      { category: 'Resisted',   value: bal.Resisted };
}

function computeWinChance(party, stageTypes, bonuses = []) {
  const bal = DATA.balance.winModel;
  let chance = bal.baseChance;
  const breakdown = [];
  for (const p of party) {
    const m = getPokemonMatchup(p, stageTypes);
    chance += m.value;
    breakdown.push({ name: p.name, category: m.category, value: m.value, bonus: false });
  }
  for (const b of bonuses) {
    chance += b.value;
    breakdown.push({ name: b.label, category: b.category, value: b.value, bonus: true });
  }
  return { chance: Math.max(bal.clamp[0], Math.min(bal.clamp[1], chance)), breakdown };
}

// ── Spin Queue — manual player-driven sub-spins ────────────────
// Each item: { slices, label, onResult(winnerIdx, slice, cb) }
// Player presses SPIN for every step. Between steps we show a prompt.
let _spinQueue = [];
let _onQueueDone = null;

function enqueueSpins(steps, onAllDone) {
  _spinQueue = [...steps];
  _onQueueDone = onAllDone;
  advanceQueue();
}

function advanceQueue() {
  if (_spinQueue.length === 0) {
    if (_onQueueDone) _onQueueDone();
    return;
  }
  const step = _spinQueue.shift();
  setWheelResult(step.prompt || 'Spin!');
  setPointerLabel('');
  drawWheel(buildWheel(step.slices), wheelState.angle);
  // Pre-draw so player sees the wheel before spinning
  wheelState.slices = buildWheel(step.slices);
  drawWheel(wheelState.slices, wheelState.angle);

  setSpinHandler(() => {
    spinWheel(step.slices, (idx, slice) => {
      step.onResult(idx, slice, () => {
        renderAll();
        advanceQueue();
      });
    });
  });
}

// ── Game Init ──────────────────────────────────────────────────
function initGame() {
  G = {
    phase: 'STARTER',
    stageIndex: 0,
    party: [],
    inventory: { Potion: 0, LuckyCharm: 0, TypeShield: 0, RunningShoes: false },
    bonuses: { criticalBonus: false, bonusSlot: null },
    intermissionSpinsLeft: 0,
    runEnded: false,
  };
  _spinQueue = [];
  _onQueueDone = null;
  document.getElementById('run-log').innerHTML = '';
  setPointerLabel('');
  renderAll();
  drawWheel([], 0);
  setupStarterWheel();
}

// ── Starter ────────────────────────────────────────────────────
function setupStarterWheel() {
  const starters = [DATA.dexMap[1], DATA.dexMap[4], DATA.dexMap[7]];
  const slices = starters.map(p => ({ label: p.name, weight: 1 }));
  setPhaseLabel('Starter Selection', 'Who will you choose?');
  setWheelResult('Spin to choose your starter!');
  setPointerLabel('');
  wheelState.slices = buildWheel(slices);
  drawWheel(wheelState.slices, wheelState.angle);

  setSpinHandler(() => {
    spinWheel(slices, (idx) => {
      const chosen = starters[idx];
      log('\u2728', `Starter: ${chosen.name}!`, 'log-capture');
      G.party.push({ ...chosen });
      G.phase = 'INTERMISSION';
      G.stageIndex = 0;
      G.intermissionSpinsLeft = getIntermissionSpins();
      setWheelResult(`${chosen.name} is your starter!`);
      renderAll();
      setupIntermissionWheel();
    });
  });
}

// ── Intermission ───────────────────────────────────────────────
function getIntermissionSpins() {
  return G.inventory.RunningShoes
    ? DATA.balance.intermissionSpins.withRunningShoes
    : DATA.balance.intermissionSpins.base;
}

function setupIntermissionWheel() {
  if (G.intermissionSpinsLeft <= 0) {
    setupBattlePhase();
    return;
  }
  const stage = DATA.stages[G.stageIndex];
  setPhaseLabel('Intermission', `Before: ${stage.stageName}`);
  updateSpinQueueLabel();

  const bw = DATA.balance.intermissionWheel;
  const slices = Object.entries(bw).map(([key, w]) => ({
    label: formatActionLabel(key), weight: w, action: key
  }));
  wheelState.slices = buildWheel(slices);
  drawWheel(wheelState.slices, wheelState.angle);
  setWheelResult('Spin the intermission wheel!');
  setPointerLabel('');

  setSpinHandler(() => {
    spinWheel(slices, (idx, slice) => {
      G.intermissionSpinsLeft--;
      updateSpinQueueLabel();
      log('\u1F3A1', `Action: ${slice.label}`, 'log-info');
      setWheelResult(`${slice.label}`);
      resolveIntermissionAction(slice.action, () => {
        renderAll();
        // After action done, setup next intermission spin or go to battle
        setupIntermissionWheel();
      });
    });
  });
}

function formatActionLabel(key) {
  return {
    Capture: 'Capture!', DoubleCapture: 'x2 Capture!',
    GuaranteedRareEncounter: 'Rare!', MysteryPokemon: 'Mystery!',
    EvolvePartyPokemon: 'Evolve!', TypeShield: 'Type Shield!',
    LuckyCharm: 'Lucky Charm!', BonusSlotNextBattle: 'Bonus Slot!',
    FindItem: 'Find Item!',
  }[key] || key;
}

function updateSpinQueueLabel() {
  const el = document.getElementById('spin-queue-label');
  el.textContent = G.phase === 'INTERMISSION' ? `Intermission spins left: ${G.intermissionSpinsLeft}` : '';
}

// ── Action Resolver ────────────────────────────────────────────
function resolveIntermissionAction(action, cb) {
  switch(action) {
    case 'Capture':
      doCapture(false, false, cb); break;
    case 'DoubleCapture':
      log('\u1F3A3', 'Double Capture! First capture...', 'log-capture');
      doCapture(false, false, () => {
        log('\u1F3A3', 'Double Capture! Second capture...', 'log-capture');
        doCapture(false, false, cb);
      });
      break;
    case 'GuaranteedRareEncounter':
      doCapture(true, false, cb); break;
    case 'MysteryPokemon':
      doCapture(false, true, cb); break;
    case 'EvolvePartyPokemon':
      doEvolve(cb); break;
    case 'TypeShield':
      G.inventory.TypeShield++;
      log('\u1F6E1', 'Type Shield added to bag!', 'log-item');
      cb(); break;
    case 'LuckyCharm':
      G.inventory.LuckyCharm++;
      log('\u1F340', 'Lucky Charm added to bag!', 'log-item');
      cb(); break;
    case 'BonusSlotNextBattle':
      doBonusSlot(cb); break;
    case 'FindItem':
      doFindItem(cb); break;
    default: cb();
  }
}

// ── Capture — fully manual sub-spins ──────────────────────────
function doCapture(forceRare, mystery, cb) {
  const steps = [];

  if (forceRare) {
    log('\u2B50', 'Guaranteed Rare Encounter! Spin to pick the Pokemon.', 'log-capture');
    const pool = DATA.byTier['Rare'];
    steps.push({
      prompt: '\u2B50 Spin to pick the Rare Pokemon!',
      slices: pool.map(p => ({ label: p.name, weight: 1 })),
      onResult(idx, slice, next) {
        const caught = pool[idx];
        log('\u1F3B0', `Rare encounter: ${caught.name}`, 'log-capture');
        pushCaptureResultStep(steps, caught, cb);
        next();
      }
    });
  } else if (mystery) {
    log('\u2753', 'Mystery Pokemon! Spin the tier.', 'log-capture');
    const mw = DATA.balance.mysteryTierWeights;
    steps.push({
      prompt: '\u2753 Mystery Pokemon — Spin the tier!',
      slices: Object.entries(mw).map(([t, w]) => ({ label: t, weight: w, tier: t })),
      onResult(idx, slice, next) {
        const tier = slice.tier;
        log('\u1F3A1', `Mystery tier: ${tier}`, 'log-capture');
        const pool = DATA.byTier[tier];
        // Inject Pokemon step at front of remaining queue
        _spinQueue.unshift({
          prompt: `\u2753 Spin to pick the ${tier} Pokemon!`,
          slices: pool.map(p => ({ label: p.name, weight: 1 })),
          onResult(idx2, slice2, next2) {
            const caught = pool[idx2];
            log('\u1F3B0', `Mystery: ${caught.name}`, 'log-capture');
            // Inject result step
            _spinQueue.unshift(makeCaptureResultStep(caught, cb));
            next2();
          }
        });
        next();
      }
    });
  } else {
    // Standard: Tier → Pokemon → Result
    log('\u1F3A3', 'Capture! Spin the tier.', 'log-capture');
    const tw = DATA.balance.captureTierWeights;
    steps.push({
      prompt: '\u1F3A3 Capture — Spin the tier!',
      slices: Object.entries(tw).map(([t, w]) => ({ label: t, weight: w, tier: t })),
      onResult(idx, slice, next) {
        const tier = slice.tier;
        log('\u1F3A1', `Tier: ${tier}`, 'log-capture');
        const pool = DATA.byTier[tier];
        _spinQueue.unshift({
          prompt: `\u1F3A3 Spin to pick the ${tier} Pokemon!`,
          slices: pool.map(p => ({ label: p.name, weight: 1 })),
          onResult(idx2, slice2, next2) {
            const caught = pool[idx2];
            log('\u1F3B0', `Encounter: ${caught.name}`, 'log-capture');
            _spinQueue.unshift(makeCaptureResultStep(caught, cb));
            next2();
          }
        });
        next();
      }
    });
  }

  enqueueSpins(steps, () => {});
}

function makeCaptureResultStep(pokemon, cb) {
  const rw = DATA.balance.captureResultWeights;
  return {
    prompt: `\u1F3AF Spin the capture result for ${pokemon.name}!`,
    slices: Object.entries(rw).map(([r, w]) => ({ label: r, weight: w })),
    onResult(idx, slice, next) {
      const result = slice.label;
      if (result === 'Fail') {
        log('\u1F4A8', `Capture failed! ${pokemon.name} escaped.`, 'log-lose');
        setWheelResult(`${pokemon.name} escaped!`);
        cb();
        next();
      } else if (result === 'Critical') {
        log('\u1F4A5', `Critical! ${pokemon.name} + battle bonus +${DATA.balance.criticalBonus}%!`, 'log-crit');
        G.bonuses.criticalBonus = true;
        setWheelResult(`Critical! ${pokemon.name} caught!`);
        addToParty(pokemon, cb, next);
      } else {
        log('\u2705', `Caught ${pokemon.name}!`, 'log-win');
        setWheelResult(`${pokemon.name} caught!`);
        addToParty(pokemon, cb, next);
      }
    }
  };
}

// Legacy helper (for forceRare path which builds steps array before enqueueing)
function pushCaptureResultStep(steps, pokemon, cb) {
  // We just push into the queue directly since steps array is already being processed
  _spinQueue.unshift(makeCaptureResultStep(pokemon, cb));
}

function addToParty(pokemon, cb, next) {
  if (G.party.length < 6) {
    G.party.push({ ...pokemon });
    log('\u2795', `${pokemon.name} joined the party!`, 'log-capture');
    renderAll();
    cb();
    next();
  } else {
    doPartyFullSpin(pokemon, cb, next);
  }
}

function doPartyFullSpin(newPokemon, cb, next) {
  const pfw = DATA.balance.partyFullWheel;
  const slices = Object.entries(pfw).map(([k, w]) => ({ label: formatPartyFullLabel(k), weight: w, action: k }));
  const stage = DATA.stages[G.stageIndex];
  log('\u1F4E6', 'Party full! Spin to decide...', 'log-info');
  _spinQueue.unshift({
    prompt: '\u1F4E6 Party full — what happens to the new Pokemon?',
    slices,
    onResult(idx, slice, next2) {
      const action = slice.action;
      if (action === 'DiscardNew') {
        log('\u1F5D1', `${newPokemon.name} discarded.`, 'log-info');
        setWheelResult(`${newPokemon.name} discarded!`);
        cb(); next2();
      } else if (action === 'ReplaceRandom') {
        const i = Math.floor(Math.random() * G.party.length);
        const removed = G.party[i];
        G.party[i] = { ...newPokemon };
        log('\u1F504', `Replaced ${removed.name} \u2192 ${newPokemon.name}.`, 'log-info');
        setWheelResult(`${removed.name} \u2192 ${newPokemon.name}`);
        renderAll(); cb(); next2();
      } else {
        const stageTypes = stage.stageTypes;
        let worstIdx = 0, worstVal = Infinity;
        G.party.forEach((p, i) => {
          const { value } = getPokemonMatchup(p, stageTypes);
          if (value < worstVal) { worstVal = value; worstIdx = i; }
        });
        const removed = G.party[worstIdx];
        G.party[worstIdx] = { ...newPokemon };
        log('\u1F504', `Replaced worst (${removed.name}) \u2192 ${newPokemon.name}.`, 'log-info');
        setWheelResult(`${removed.name} \u2192 ${newPokemon.name}`);
        renderAll(); cb(); next2();
      }
    }
  });
  next();
}

function formatPartyFullLabel(key) {
  return { ReplaceRandom: 'Replace Random', ReplaceWorstMatchup: 'Replace Worst', DiscardNew: 'Discard New' }[key] || key;
}

// ── Evolve ─────────────────────────────────────────────────────
function doEvolve(cb) {
  const evolvable = G.party.filter(p => p.evolvesTo);
  if (evolvable.length === 0) {
    log('\u274C', 'No evolvable Pokemon in party.', 'log-info');
    setWheelResult('No evolutions available!');
    cb(); return;
  }
  const stage = DATA.stages[G.stageIndex];
  const stageTypes = stage.stageTypes;
  enqueueSpins([{
    prompt: '\u2728 Evolve — Spin to pick which one!',
    slices: [
      { label: 'Random Evolvable', weight: 60, action: 'random' },
      { label: 'Worst Matchup', weight: 40, action: 'worst' },
    ],
    onResult(idx, slice, next) {
      let target;
      if (slice.action === 'random') {
        target = evolvable[Math.floor(Math.random() * evolvable.length)];
      } else {
        let worstVal = Infinity;
        for (const p of evolvable) {
          const { value } = getPokemonMatchup(p, stageTypes);
          if (value < worstVal) { worstVal = value; target = p; }
        }
      }
      const evolved = DATA.dexMap[target.evolvesTo];
      if (evolved) {
        const i = G.party.findIndex(p => p.dexNumber === target.dexNumber);
        if (i >= 0) {
          G.party[i] = { ...evolved };
          log('\u2728', `${target.name} \u2192 ${evolved.name}!`, 'log-evolve');
          setWheelResult(`${target.name} \u2192 ${evolved.name}!`);
          renderAll();
        }
      }
      cb(); next();
    }
  }], () => {});
}

// ── Find Item ──────────────────────────────────────────────────
function doFindItem(cb) {
  const fw = DATA.balance.findItemWheel;
  const slices = Object.entries(fw).map(([k, w]) => ({
    label: k === 'RunningShoes' ? 'Running Shoes' : k, weight: w, item: k
  }));
  log('\u1F50D', 'Find Item! Spin to see what you get.', 'log-item');
  enqueueSpins([{
    prompt: '\u1F50D Find Item — Spin!',
    slices,
    onResult(idx, slice, next) {
      if (slice.item === 'RunningShoes') {
        G.inventory.RunningShoes = true;
        log('\u1F45F', 'Running Shoes! +1 intermission spin per stage!', 'log-item');
      } else {
        G.inventory[slice.item]++;
        log('\u1F392', `Found ${slice.label}!`, 'log-item');
      }
      setWheelResult(`Found: ${slice.label}!`);
      renderAll(); cb(); next();
    }
  }], () => {});
}

// ── Bonus Slot ─────────────────────────────────────────────────
function doBonusSlot(cb) {
  if (G.party.length === 0) { cb(); return; }
  const stage = DATA.stages[G.stageIndex];
  const stageTypes = stage.stageTypes;
  const slices = [
    { label: 'Best Matchup', weight: 40, action: 'best' },
    { label: 'Random Party', weight: 60, action: 'random' },
  ];
  log('\u2B50', 'Bonus Slot! Spin to pick the helper.', 'log-item');
  enqueueSpins([{
    prompt: '\u2B50 Bonus Slot — Spin to pick!',
    slices,
    onResult(idx, slice, next) {
      let chosen;
      if (slice.action === 'best') {
        let bestVal = -1;
        for (const p of G.party) {
          const { value } = getPokemonMatchup(p, stageTypes);
          if (value > bestVal) { bestVal = value; chosen = p; }
        }
      } else {
        chosen = G.party[Math.floor(Math.random() * G.party.length)];
      }
      G.bonuses.bonusSlot = { ...chosen };
      log('\u2B50', `Bonus slot: ${chosen.name} for next battle!`, 'log-item');
      setWheelResult(`Bonus: ${chosen.name}!`);
      renderAll(); cb(); next();
    }
  }], () => {});
}

// ── Battle Phase ───────────────────────────────────────────────
function setupBattlePhase() {
  const stage = DATA.stages[G.stageIndex];
  G.phase = 'BATTLE';
  const kindLabel = { GYM: 'Gym Battle', E4: 'Elite Four', CHAMPION: 'Champion!' }[stage.stageKind] || 'Battle';
  setPhaseLabel(kindLabel, stage.stageName);
  updateSpinQueueLabel();

  const activeBonuses = [];
  if (G.inventory.TypeShield > 0) {
    G.inventory.TypeShield--;
    activeBonuses.push({ label: 'Type Shield', category: 'Shield', value: DATA.balance.typeShieldBonus });
    log('\u1F6E1', `Type Shield active! +${DATA.balance.typeShieldBonus}%`, 'log-item');
  }
  if (G.bonuses.criticalBonus) {
    activeBonuses.push({ label: 'Crit Bonus', category: 'Bonus', value: DATA.balance.criticalBonus });
    log('\u1F4A5', `Crit bonus! +${DATA.balance.criticalBonus}%`, 'log-crit');
    G.bonuses.criticalBonus = false;
  }

  let stageTypes = stage.stageTypes;
  if (stageTypes.includes('Mixed')) {
    const allTypes = Object.keys(DATA.typeChart);
    stageTypes = [
      allTypes[Math.floor(Math.random() * allTypes.length)],
      allTypes[Math.floor(Math.random() * allTypes.length)]
    ];
    log('\u1F300', `Champion uses: ${stageTypes.join(' / ')}`, 'log-info');
  }

  const battleParty = [...G.party];
  if (G.bonuses.bonusSlot) {
    battleParty.push({ ...G.bonuses.bonusSlot, _isBonus: true });
    log('\u2B50', `Bonus slot active: ${G.bonuses.bonusSlot.name}`, 'log-item');
  }

  const { chance, breakdown } = computeWinChance(battleParty, stageTypes, activeBonuses);
  renderBattleBreakdown(breakdown, chance);

  const slices = [
    { label: 'WIN!',   weight: chance },
    { label: 'LOSE...', weight: Math.max(1, 100 - chance) },
  ];
  wheelState.slices = buildWheel(slices);
  drawWheel(wheelState.slices, wheelState.angle);
  setWheelResult(`Spin to battle! Win chance: ${chance}%`);
  setPointerLabel('');

  setSpinHandler(() => {
    log('\u2694', `Battle vs ${stage.stageName} (${chance}% win)`, 'log-info');
    spinWheel(slices, (idx, slice) => {
      G.bonuses.bonusSlot = null;
      if (slice.label === 'WIN!') {
        log('\u1F3C6', `VICTORY vs ${stage.stageName}!`, 'log-win');
        setWheelResult(`Victory!${stage.badge ? ' ' + stage.badge + ' earned!' : ''}`);
        renderAll();
        advanceStage();
      } else {
        log('\u1F480', `DEFEAT vs ${stage.stageName}...`, 'log-lose');
        setWheelResult('Defeat! Checking bag...');
        renderAll();
        handleDefeat(stage, stageTypes);
      }
    });
  });
}

function handleDefeat(stage, stageTypes) {
  if (G.inventory.LuckyCharm > 0) {
    G.inventory.LuckyCharm--;
    log('\u1F340', 'Lucky Charm used! Rerolling battle...', 'log-item');
    renderAll();
    retryBattle(stage, stageTypes, false);
  } else if (G.inventory.Potion > 0) {
    G.inventory.Potion--;
    log('\u1F9EA', 'Potion used! Retrying battle...', 'log-item');
    renderAll();
    retryBattle(stage, stageTypes, true);
  } else {
    endRun(false, stage.stageName);
  }
}

function retryBattle(stage, stageTypes, usedPotion) {
  const { chance, breakdown } = computeWinChance(G.party, stageTypes, []);
  renderBattleBreakdown(breakdown, chance);
  const slices = [
    { label: 'WIN!',   weight: chance },
    { label: 'LOSE...', weight: Math.max(1, 100 - chance) },
  ];
  wheelState.slices = buildWheel(slices);
  drawWheel(wheelState.slices, wheelState.angle);
  setWheelResult(`Retry! Win chance: ${chance}%`);
  setPointerLabel('');
  log('\u1F504', `Retry — ${chance}% win chance`, 'log-info');

  setSpinHandler(() => {
    spinWheel(slices, (idx, slice) => {
      if (slice.label === 'WIN!') {
        log('\u1F3C6', `VICTORY on retry vs ${stage.stageName}!`, 'log-win');
        setWheelResult('Victory on retry!');
        renderAll();
        advanceStage();
      } else {
        if (!usedPotion && G.inventory.Potion > 0) {
          G.inventory.Potion--;
          log('\u1F9EA', 'Potion used! Retrying...', 'log-item');
          renderAll();
          retryBattle(stage, stageTypes, true);
        } else {
          endRun(false, stage.stageName);
        }
      }
    });
  });
}

function advanceStage() {
  G.stageIndex++;
  if (G.stageIndex >= DATA.stages.length) { endRun(true); return; }
  G.phase = 'INTERMISSION';
  G.intermissionSpinsLeft = getIntermissionSpins();
  renderAll();
  setupIntermissionWheel();
}

function endRun(win, stageName) {
  G.phase = 'END';
  G.runEnded = true;
  renderAll();
  document.getElementById('overlay').classList.remove('hidden');
  document.getElementById('overlay-title').textContent = win ? '\u1F3C6 CHAMPION!' : '\u1F480 RUN OVER';
  document.getElementById('overlay-msg').textContent = win
    ? `You conquered all of Kanto! Party: ${G.party.map(p=>p.name).join(', ')}`
    : `Defeated by ${stageName || '???'}. Party: ${G.party.map(p=>p.name).join(', ') || 'none'}`;
  log(win ? '\u1F3C6' : '\u1F480', win ? 'Hall of Fame!' : `Run ended at: ${stageName}`, win ? 'log-win' : 'log-lose');
}

// ── Render ─────────────────────────────────────────────────────
function renderAll() {
  renderParty();
  renderInventory();
  renderStageInfo();
  renderWinChance();
}

function renderParty() {
  const grid = document.getElementById('party-grid');
  const slots = grid.querySelectorAll('.party-slot');
  slots.forEach((slot, i) => {
    slot.className = 'party-slot';
    slot.innerHTML = '';
    if (i < G.party.length) {
      const p = G.party[i];
      slot.classList.add('filled');
      if (p._isBonus) slot.classList.add('bonus');
      const nameEl = document.createElement('div');
      nameEl.className = 'slot-name';
      nameEl.textContent = p.name;
      const typesEl = document.createElement('div');
      typesEl.className = 'slot-types';
      [p.type1, p.type2].filter(Boolean).forEach(t => {
        const badge = document.createElement('span');
        badge.className = `type-badge type-${t}`;
        badge.textContent = t;
        typesEl.appendChild(badge);
      });
      slot.appendChild(nameEl);
      slot.appendChild(typesEl);
      if (G.stageIndex < DATA.stages.length) {
        const st = DATA.stages[G.stageIndex].stageTypes.filter(t => t !== 'Mixed');
        if (st.length > 0) {
          const { category, value } = getPokemonMatchup(p, st);
          const contEl = document.createElement('div');
          contEl.className = 'slot-contrib';
          contEl.textContent = `+${value} (${category[0]})`;
          slot.appendChild(contEl);
        }
      }
    } else {
      slot.classList.add('empty');
    }
  });
  const existing = grid.querySelector('.bonus-note');
  if (existing) existing.remove();
  if (G.bonuses && G.bonuses.bonusSlot) {
    const note = document.createElement('div');
    note.className = 'bonus-note';
    note.style.cssText = 'grid-column:1/-1;padding:4px;font-family:var(--pixel-font);font-size:0.38rem;color:var(--accent2);border-top:1px solid var(--border);margin-top:4px;';
    note.textContent = `\u2B50 Bonus slot: ${G.bonuses.bonusSlot.name}`;
    grid.appendChild(note);
  }
}

function renderInventory() {
  const list = document.getElementById('inventory-list');
  list.innerHTML = '';
  [['Potion','\u1F9EA','Potion'],['TypeShield','\u1F6E1','Type Shield'],['LuckyCharm','\u1F340','Lucky Charm']].forEach(([key, icon, name]) => {
    const row = document.createElement('div');
    row.className = 'inv-row';
    row.innerHTML = `<span class="inv-name">${icon} ${name}</span><span class="inv-count">\u00D7${G.inventory[key]}</span>`;
    list.appendChild(row);
  });
  const shoes = document.createElement('div');
  shoes.className = 'inv-row';
  shoes.innerHTML = `<span class="inv-name">\u1F45F Running Shoes</span><span class="inv-permanent">${G.inventory.RunningShoes ? '\u2713 Active' : '\u2014'}</span>`;
  list.appendChild(shoes);
  if (G.bonuses && G.bonuses.criticalBonus) {
    const cb = document.createElement('div');
    cb.className = 'inv-row';
    cb.innerHTML = `<span class="inv-name">\u1F4A5 Crit Bonus</span><span class="inv-permanent">+${DATA.balance.criticalBonus}%</span>`;
    list.appendChild(cb);
  }
}

function renderStageInfo() {
  const info = document.getElementById('stage-info');
  if (G.stageIndex >= DATA.stages.length) {
    info.innerHTML = '<strong>\u1F3C6 All stages cleared!</strong>'; return;
  }
  const stage = DATA.stages[G.stageIndex];
  info.innerHTML = `
    <div><strong>${stage.stageName}</strong></div>
    <div>${stage.stageKind} \u2014 ${stage.stageTypes.join(' / ')}</div>
    ${stage.leader ? `<div>Leader: ${stage.leader}</div>` : ''}
    ${stage.badge ? `<div>Badge: ${stage.badge}</div>` : ''}
    <div style="margin-top:4px;color:var(--text2)">${G.stageIndex + 1} / ${DATA.stages.length}</div>
  `;
}

function renderWinChance() {
  if (G.party.length === 0 || G.stageIndex >= DATA.stages.length) {
    document.getElementById('win-chance-pct').textContent = '\u2014%';
    document.getElementById('win-chance-fill').style.width = '0%';
    document.getElementById('battle-breakdown').innerHTML = '';
    return;
  }
  const stage = DATA.stages[G.stageIndex];
  let stageTypes = stage.stageTypes.filter(t => t !== 'Mixed');
  if (stageTypes.length === 0) stageTypes = ['Normal'];
  const battleParty = [...G.party];
  if (G.bonuses && G.bonuses.bonusSlot) battleParty.push({ ...G.bonuses.bonusSlot });
  const bonuses = [];
  if (G.inventory.TypeShield > 0) bonuses.push({ label: 'Type Shield', category: 'Shield', value: DATA.balance.typeShieldBonus });
  if (G.bonuses && G.bonuses.criticalBonus) bonuses.push({ label: 'Crit Bonus', category: 'Bonus', value: DATA.balance.criticalBonus });
  const { chance, breakdown } = computeWinChance(battleParty, stageTypes, bonuses);
  renderBattleBreakdown(breakdown, chance);
}

function renderBattleBreakdown(breakdown, chance) {
  document.getElementById('win-chance-pct').textContent = `${chance}%`;
  const fill = document.getElementById('win-chance-fill');
  fill.style.width = `${chance}%`;
  fill.style.background = chance >= 70 ? 'var(--accent3)' : chance >= 40 ? '#f8d030' : 'var(--accent2)';
  const base = DATA.balance.winModel.baseChance;
  let html = `<div class="contrib-row"><span>Base</span><span class="contrib-vs">+${base}</span></div>`;
  for (const row of breakdown) {
    html += `<div class="contrib-row"><span>${row.name} <small style="color:var(--text2)">(${row.category})</small></span><span class="${row.bonus ? 'contrib-bonus' : 'contrib-vs'}">+${row.value}</span></div>`;
  }
  html += `<div class="contrib-row" style="font-family:var(--pixel-font);font-size:0.4rem;border-top:1px solid var(--border);margin-top:4px;padding-top:4px"><span>Total</span><span>${chance}%</span></div>`;
  document.getElementById('battle-breakdown').innerHTML = html;
}

// ── Spin Button ────────────────────────────────────────────────
let _spinHandler = null;

function setSpinHandler(fn) {
  _spinHandler = fn;
  document.getElementById('spinBtn').disabled = false;
}

function setPhaseLabel(phase, stage) {
  document.getElementById('phase-label').textContent = phase;
  document.getElementById('stage-label').textContent = stage;
}

function setWheelResult(text) {
  document.getElementById('wheel-result-label').textContent = text;
}

function log(icon, msg, cls = 'log-info') {
  const logEl = document.getElementById('run-log');
  const entry = document.createElement('div');
  entry.className = `log-entry ${cls}`;
  entry.innerHTML = `<span class="log-icon">${icon}</span>${msg}`;
  logEl.appendChild(entry);
  logEl.scrollTop = logEl.scrollHeight;
}

document.getElementById('spinBtn').addEventListener('click', () => {
  if (wheelState.spinning || G.runEnded) return;
  if (_spinHandler) {
    document.getElementById('spinBtn').disabled = true;
    _spinHandler();
  }
});

// ── Dark Mode ──────────────────────────────────────────────────
document.getElementById('darkModeToggle').addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  document.getElementById('darkModeToggle').textContent = next === 'dark' ? '\u263E' : '\u2600';
  if (wheelState.slices.length > 0) drawWheel(wheelState.slices, wheelState.angle);
});

// ── Restart ────────────────────────────────────────────────────
function doRestart() {
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('spinBtn').disabled = false;
  _spinHandler = null;
  _spinQueue = [];
  _onQueueDone = null;
  initGame();
}
document.getElementById('restartBtn').addEventListener('click', doRestart);
document.getElementById('overlay-restart').addEventListener('click', doRestart);

// ── Boot ───────────────────────────────────────────────────────
loadData();
initGame();
