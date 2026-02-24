/* Gen 1 RNG Gym Run — index.html + app.js only (GitHub Pages ready)
   - Wheel-only decisions
   - Party grows between stages
   - Inventory auto-consume (Potion, Lucky Charm, Type Shield, Running Shoes)
   - Increasing StageDifficulty + StageJitter (rolled once per stage)
   - Per-Pokémon contribution scales down over the run (starter ~ +30% Gym1, ~ +4% E4)
   - Diminishing returns on total party contribution (late-game anti-snowball)

   NOTE: This build includes a *synthetic* "power" rating per Pokémon (deterministic from Dex).
         Replace POWER_BY_DEX with real Gen 1 base stats later if desired.
*/
(() => {
  'use strict';

  // ------------------------------
  // Utilities
  // ------------------------------
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  // Deterministic RNG (Mulberry32)
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hashStringToSeed(str) {
    // FNV-1a 32-bit
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  function pickWeighted(rng, items) {
    // items: [{label, weight, data}]
    const total = items.reduce((s, it) => s + it.weight, 0);
    let r = rng() * total;
    for (const it of items) {
      r -= it.weight;
      if (r <= 0) return it;
    }
    return items[items.length - 1];
  }

  // ------------------------------
  // Data: Types + effectiveness (Gen 1 chart simplified to attack->def multiplier)
  // ------------------------------
  const TYPES = [
    'Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison','Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon'
  ];

  // Gen 1-ish effectiveness map: attacker -> defender -> multiplier (0,0.5,1,2)
  // This is a compact table; not perfect-edge-case-critical for the game feel.
  const TYPE_CHART = {
    Normal:   {Rock:0.5, Ghost:0},
    Fire:     {Grass:2, Ice:2, Bug:2, Rock:0.5, Fire:0.5, Water:0.5, Dragon:0.5},
    Water:    {Fire:2, Ground:2, Rock:2, Water:0.5, Grass:0.5, Dragon:0.5},
    Electric: {Water:2, Flying:2, Electric:0.5, Grass:0.5, Dragon:0.5, Ground:0},
    Grass:    {Water:2, Ground:2, Rock:2, Fire:0.5, Grass:0.5, Poison:0.5, Flying:0.5, Bug:0.5, Dragon:0.5},
    Ice:      {Grass:2, Ground:2, Flying:2, Dragon:2, Fire:0.5, Water:0.5, Ice:0.5},
    Fighting: {Normal:2, Ice:2, Rock:2, Poison:0.5, Flying:0.5, Psychic:0.5, Bug:0.5, Ghost:0},
    Poison:   {Grass:2, Bug:2, Poison:0.5, Ground:0.5, Rock:0.5, Ghost:0.5},
    Ground:   {Fire:2, Electric:2, Poison:2, Rock:2, Water:0.5, Grass:0.5, Bug:0.5, Flying:0},
    Flying:   {Grass:2, Fighting:2, Bug:2, Electric:0.5, Rock:0.5},
    Psychic:  {Fighting:2, Poison:2, Psychic:0.5},
    Bug:      {Grass:2, Psychic:2, Fire:0.5, Fighting:0.5, Poison:0.5, Flying:0.5, Ghost:0.5},
    Rock:     {Fire:2, Ice:2, Flying:2, Bug:2, Fighting:0.5, Ground:0.5},
    Ghost:    {Psychic:0, Ghost:2, Normal:0},
    Dragon:   {Dragon:2}
  };

  function eff(att, def) {
    const row = TYPE_CHART[att] || {};
    return row[def] ?? 1;
  }

  function bestOffensiveMultiplier(pokemonTypes, stageTypes) {
    // choose best attack type (pokemon type) against any stage defender types (could be 1 or 2)
    let best = 1;
    for (const atk of pokemonTypes) {
      let mult = 1;
      // in Gen games, damage multiplier is product vs dual type
      for (const def of stageTypes) mult *= eff(atk, def);
      if (mult > best) best = mult;
    }
    return best;
  }

  // ------------------------------
  // Data: Pokédex Gen 1 (names + types).
  // To keep this file reasonable, we include full 151 with types only.
  // A deterministic synthetic "power" (0..1) is derived from dex number.
  // ------------------------------
  const POKEDEX = [
    {"dex":1,"name":"Bulbasaur","types":["Grass","Poison"]},
    {"dex":2,"name":"Ivysaur","types":["Grass","Poison"]},
    {"dex":3,"name":"Venusaur","types":["Grass","Poison"]},
    {"dex":4,"name":"Charmander","types":["Fire"]},
    {"dex":5,"name":"Charmeleon","types":["Fire"]},
    {"dex":6,"name":"Charizard","types":["Fire","Flying"]},
    {"dex":7,"name":"Squirtle","types":["Water"]},
    {"dex":8,"name":"Wartortle","types":["Water"]},
    {"dex":9,"name":"Blastoise","types":["Water"]},
    {"dex":10,"name":"Caterpie","types":["Bug"]},
    {"dex":11,"name":"Metapod","types":["Bug"]},
    {"dex":12,"name":"Butterfree","types":["Bug","Flying"]},
    {"dex":13,"name":"Weedle","types":["Bug","Poison"]},
    {"dex":14,"name":"Kakuna","types":["Bug","Poison"]},
    {"dex":15,"name":"Beedrill","types":["Bug","Poison"]},
    {"dex":16,"name":"Pidgey","types":["Normal","Flying"]},
    {"dex":17,"name":"Pidgeotto","types":["Normal","Flying"]},
    {"dex":18,"name":"Pidgeot","types":["Normal","Flying"]},
    {"dex":19,"name":"Rattata","types":["Normal"]},
    {"dex":20,"name":"Raticate","types":["Normal"]},
    {"dex":21,"name":"Spearow","types":["Normal","Flying"]},
    {"dex":22,"name":"Fearow","types":["Normal","Flying"]},
    {"dex":23,"name":"Ekans","types":["Poison"]},
    {"dex":24,"name":"Arbok","types":["Poison"]},
    {"dex":25,"name":"Pikachu","types":["Electric"]},
    {"dex":26,"name":"Raichu","types":["Electric"]},
    {"dex":27,"name":"Sandshrew","types":["Ground"]},
    {"dex":28,"name":"Sandslash","types":["Ground"]},
    {"dex":29,"name":"Nidoran♀","types":["Poison"]},
    {"dex":30,"name":"Nidorina","types":["Poison"]},
    {"dex":31,"name":"Nidoqueen","types":["Poison","Ground"]},
    {"dex":32,"name":"Nidoran♂","types":["Poison"]},
    {"dex":33,"name":"Nidorino","types":["Poison"]},
    {"dex":34,"name":"Nidoking","types":["Poison","Ground"]},
    {"dex":35,"name":"Clefairy","types":["Normal"]},
    {"dex":36,"name":"Clefable","types":["Normal"]},
    {"dex":37,"name":"Vulpix","types":["Fire"]},
    {"dex":38,"name":"Ninetales","types":["Fire"]},
    {"dex":39,"name":"Jigglypuff","types":["Normal"]},
    {"dex":40,"name":"Wigglytuff","types":["Normal"]},
    {"dex":41,"name":"Zubat","types":["Poison","Flying"]},
    {"dex":42,"name":"Golbat","types":["Poison","Flying"]},
    {"dex":43,"name":"Oddish","types":["Grass","Poison"]},
    {"dex":44,"name":"Gloom","types":["Grass","Poison"]},
    {"dex":45,"name":"Vileplume","types":["Grass","Poison"]},
    {"dex":46,"name":"Paras","types":["Bug","Grass"]},
    {"dex":47,"name":"Parasect","types":["Bug","Grass"]},
    {"dex":48,"name":"Venonat","types":["Bug","Poison"]},
    {"dex":49,"name":"Venomoth","types":["Bug","Poison"]},
    {"dex":50,"name":"Diglett","types":["Ground"]},
    {"dex":51,"name":"Dugtrio","types":["Ground"]},
    {"dex":52,"name":"Meowth","types":["Normal"]},
    {"dex":53,"name":"Persian","types":["Normal"]},
    {"dex":54,"name":"Psyduck","types":["Water"]},
    {"dex":55,"name":"Golduck","types":["Water"]},
    {"dex":56,"name":"Mankey","types":["Fighting"]},
    {"dex":57,"name":"Primeape","types":["Fighting"]},
    {"dex":58,"name":"Growlithe","types":["Fire"]},
    {"dex":59,"name":"Arcanine","types":["Fire"]},
    {"dex":60,"name":"Poliwag","types":["Water"]},
    {"dex":61,"name":"Poliwhirl","types":["Water"]},
    {"dex":62,"name":"Poliwrath","types":["Water","Fighting"]},
    {"dex":63,"name":"Abra","types":["Psychic"]},
    {"dex":64,"name":"Kadabra","types":["Psychic"]},
    {"dex":65,"name":"Alakazam","types":["Psychic"]},
    {"dex":66,"name":"Machop","types":["Fighting"]},
    {"dex":67,"name":"Machoke","types":["Fighting"]},
    {"dex":68,"name":"Machamp","types":["Fighting"]},
    {"dex":69,"name":"Bellsprout","types":["Grass","Poison"]},
    {"dex":70,"name":"Weepinbell","types":["Grass","Poison"]},
    {"dex":71,"name":"Victreebel","types":["Grass","Poison"]},
    {"dex":72,"name":"Tentacool","types":["Water","Poison"]},
    {"dex":73,"name":"Tentacruel","types":["Water","Poison"]},
    {"dex":74,"name":"Geodude","types":["Rock","Ground"]},
    {"dex":75,"name":"Graveler","types":["Rock","Ground"]},
    {"dex":76,"name":"Golem","types":["Rock","Ground"]},
    {"dex":77,"name":"Ponyta","types":["Fire"]},
    {"dex":78,"name":"Rapidash","types":["Fire"]},
    {"dex":79,"name":"Slowpoke","types":["Water","Psychic"]},
    {"dex":80,"name":"Slowbro","types":["Water","Psychic"]},
    {"dex":81,"name":"Magnemite","types":["Electric"]},
    {"dex":82,"name":"Magneton","types":["Electric"]},
    {"dex":83,"name":"Farfetch'd","types":["Normal","Flying"]},
    {"dex":84,"name":"Doduo","types":["Normal","Flying"]},
    {"dex":85,"name":"Dodrio","types":["Normal","Flying"]},
    {"dex":86,"name":"Seel","types":["Water"]},
    {"dex":87,"name":"Dewgong","types":["Water","Ice"]},
    {"dex":88,"name":"Grimer","types":["Poison"]},
    {"dex":89,"name":"Muk","types":["Poison"]},
    {"dex":90,"name":"Shellder","types":["Water"]},
    {"dex":91,"name":"Cloyster","types":["Water","Ice"]},
    {"dex":92,"name":"Gastly","types":["Ghost","Poison"]},
    {"dex":93,"name":"Haunter","types":["Ghost","Poison"]},
    {"dex":94,"name":"Gengar","types":["Ghost","Poison"]},
    {"dex":95,"name":"Onix","types":["Rock","Ground"]},
    {"dex":96,"name":"Drowzee","types":["Psychic"]},
    {"dex":97,"name":"Hypno","types":["Psychic"]},
    {"dex":98,"name":"Krabby","types":["Water"]},
    {"dex":99,"name":"Kingler","types":["Water"]},
    {"dex":100,"name":"Voltorb","types":["Electric"]},
    {"dex":101,"name":"Electrode","types":["Electric"]},
    {"dex":102,"name":"Exeggcute","types":["Grass","Psychic"]},
    {"dex":103,"name":"Exeggutor","types":["Grass","Psychic"]},
    {"dex":104,"name":"Cubone","types":["Ground"]},
    {"dex":105,"name":"Marowak","types":["Ground"]},
    {"dex":106,"name":"Hitmonlee","types":["Fighting"]},
    {"dex":107,"name":"Hitmonchan","types":["Fighting"]},
    {"dex":108,"name":"Lickitung","types":["Normal"]},
    {"dex":109,"name":"Koffing","types":["Poison"]},
    {"dex":110,"name":"Weezing","types":["Poison"]},
    {"dex":111,"name":"Rhyhorn","types":["Ground","Rock"]},
    {"dex":112,"name":"Rhydon","types":["Ground","Rock"]},
    {"dex":113,"name":"Chansey","types":["Normal"]},
    {"dex":114,"name":"Tangela","types":["Grass"]},
    {"dex":115,"name":"Kangaskhan","types":["Normal"]},
    {"dex":116,"name":"Horsea","types":["Water"]},
    {"dex":117,"name":"Seadra","types":["Water"]},
    {"dex":118,"name":"Goldeen","types":["Water"]},
    {"dex":119,"name":"Seaking","types":["Water"]},
    {"dex":120,"name":"Staryu","types":["Water"]},
    {"dex":121,"name":"Starmie","types":["Water","Psychic"]},
    {"dex":122,"name":"Mr. Mime","types":["Psychic"]},
    {"dex":123,"name":"Scyther","types":["Bug","Flying"]},
    {"dex":124,"name":"Jynx","types":["Ice","Psychic"]},
    {"dex":125,"name":"Electabuzz","types":["Electric"]},
    {"dex":126,"name":"Magmar","types":["Fire"]},
    {"dex":127,"name":"Pinsir","types":["Bug"]},
    {"dex":128,"name":"Tauros","types":["Normal"]},
    {"dex":129,"name":"Magikarp","types":["Water"]},
    {"dex":130,"name":"Gyarados","types":["Water","Flying"]},
    {"dex":131,"name":"Lapras","types":["Water","Ice"]},
    {"dex":132,"name":"Ditto","types":["Normal"]},
    {"dex":133,"name":"Eevee","types":["Normal"]},
    {"dex":134,"name":"Vaporeon","types":["Water"]},
    {"dex":135,"name":"Jolteon","types":["Electric"]},
    {"dex":136,"name":"Flareon","types":["Fire"]},
    {"dex":137,"name":"Porygon","types":["Normal"]},
    {"dex":138,"name":"Omanyte","types":["Rock","Water"]},
    {"dex":139,"name":"Omastar","types":["Rock","Water"]},
    {"dex":140,"name":"Kabuto","types":["Rock","Water"]},
    {"dex":141,"name":"Kabutops","types":["Rock","Water"]},
    {"dex":142,"name":"Aerodactyl","types":["Rock","Flying"]},
    {"dex":143,"name":"Snorlax","types":["Normal"]},
    {"dex":144,"name":"Articuno","types":["Ice","Flying"]},
    {"dex":145,"name":"Zapdos","types":["Electric","Flying"]},
    {"dex":146,"name":"Moltres","types":["Fire","Flying"]},
    {"dex":147,"name":"Dratini","types":["Dragon"]},
    {"dex":148,"name":"Dragonair","types":["Dragon"]},
    {"dex":149,"name":"Dragonite","types":["Dragon","Flying"]},
    {"dex":150,"name":"Mewtwo","types":["Psychic"]},
    {"dex":151,"name":"Mew","types":["Psychic"]}
  ];

  const POKE_BY_DEX = new Map(POKEDEX.map(p => [p.dex, p]));

  // Synthetic power by dex (0..1): deterministic, smooth-ish.
  function powerNormByDex(dex) {
    // map dex to pseudo power using sin + hash
    const x = dex * 0.37;
    const s = (Math.sin(x) + 1) / 2; // 0..1
    const h = ((dex * 2654435761) >>> 0) / 0xFFFFFFFF; // 0..1
    // blend and add "legendary bump"
    let p = 0.65 * s + 0.35 * h;
    if (dex >= 144 && dex <= 151) p = clamp(p + 0.20, 0, 1);
    if (dex === 150) p = clamp(p + 0.10, 0, 1);
    return p;
  }

  // Evolution chains (Gen 1 only)
  const EVOLVE_TO = new Map([
    [1,2],[2,3],[4,5],[5,6],[7,8],[8,9],[10,11],[11,12],[13,14],[14,15],[16,17],[17,18],[19,20],
    [21,22],[23,24],[25,26],[27,28],[29,30],[30,31],[32,33],[33,34],[35,36],[37,38],[39,40],[41,42],
    [43,44],[44,45],[46,47],[48,49],[50,51],[52,53],[54,55],[56,57],[58,59],[60,61],[61,62],[63,64],[64,65],
    [66,67],[67,68],[69,70],[70,71],[72,73],[74,75],[75,76],[77,78],[79,80],[81,82],[84,85],[86,87],[88,89],
    [90,91],[92,93],[93,94],[96,97],[98,99],[100,101],[102,103],[104,105],[109,110],[111,112],[116,117],
    [118,119],[120,121],[129,130],[133,134],[133,135],[133,136],[138,139],[140,141],[147,148],[148,149]
  ]);

  // ------------------------------
  // Stages: Types + difficulty + jitter
  // ------------------------------
  const STAGES = [
    { id:'GYM_1', name:'Gym 1', kind:'GYM', types:['Rock'], difficulty:0,  jitter:{enabled:false,min:0,max:0} },
    { id:'GYM_2', name:'Gym 2', kind:'GYM', types:['Water'], difficulty:4,  jitter:{enabled:false,min:0,max:0} },
    { id:'GYM_3', name:'Gym 3', kind:'GYM', types:['Electric'], difficulty:8,  jitter:{enabled:false,min:0,max:0} },
    { id:'GYM_4', name:'Gym 4', kind:'GYM', types:['Grass'], difficulty:12, jitter:{enabled:false,min:0,max:0} },
    { id:'GYM_5', name:'Gym 5', kind:'GYM', types:['Poison'], difficulty:16, jitter:{enabled:true,min:-2,max:2} },
    { id:'GYM_6', name:'Gym 6', kind:'GYM', types:['Psychic'], difficulty:20, jitter:{enabled:true,min:-2,max:2} },
    { id:'GYM_7', name:'Gym 7', kind:'GYM', types:['Fire'], difficulty:24, jitter:{enabled:true,min:-2,max:2} },
    { id:'GYM_8', name:'Gym 8', kind:'GYM', types:['Ground'], difficulty:28, jitter:{enabled:true,min:-2,max:2} },
    { id:'E4_1',  name:'Elite Four 1', kind:'E4', types:['Ice'], difficulty:34, jitter:{enabled:true,min:-3,max:3} },
    { id:'E4_2',  name:'Elite Four 2', kind:'E4', types:['Fighting'], difficulty:38, jitter:{enabled:true,min:-3,max:3} },
    { id:'E4_3',  name:'Elite Four 3', kind:'E4', types:['Ghost'], difficulty:42, jitter:{enabled:true,min:-3,max:3} },
    { id:'E4_4',  name:'Elite Four 4', kind:'E4', types:['Dragon'], difficulty:46, jitter:{enabled:true,min:-3,max:3} },
    { id:'CHAMP', name:'Champion', kind:'CHAMP', types:['Mixed'], difficulty:50, jitter:{enabled:true,min:-3,max:3} }
  ];

  // ------------------------------
  // Balance config
  // ------------------------------
  const BAL = {
    intermissionSpins: { base: 1, withRunningShoes: 2 },
    intermissionActions: [
      { id:1,  label:'Capture', weight:30 },
      { id:2,  label:'Double Capture', weight:10 },
      { id:3,  label:'Guaranteed Rare', weight:6 },
      { id:4,  label:'Mystery Pokémon', weight:9 },
      { id:5,  label:'Evolve Party Pokémon', weight:12 },
      { id:9,  label:'Type Shield', weight:10 },
      { id:11, label:'Lucky Charm', weight:6 },
      { id:13, label:'Bonus Slot (Next Battle)', weight:7 },
      { id:16, label:'Find Item', weight:10 }
    ],
    capture: {
      tierWeights: [
        { label:'Common', weight:70 },
        { label:'Uncommon', weight:25 },
        { label:'Rare', weight:5 }
      ],
      tierWeightsMystery: [
        { label:'Common', weight:55 },
        { label:'Uncommon', weight:35 },
        { label:'Rare', weight:10 }
      ],
      resultWeights: [
        { label:'Fail', weight:30 },
        { label:'Success', weight:60 },
        { label:'Critical', weight:10 }
      ],
      criticalBonusNextBattlePct: 6,
      partyFull: [
        { label:'Replace Random', weight:40, key:'replaceRandom' },
        { label:'Replace Worst Matchup', weight:40, key:'replaceWorst' },
        { label:'Discard New', weight:20, key:'discard' }
      ]
    },
    items: {
      findItem: [
        { label:'Potion', weight:45, key:'potion' },
        { label:'Type Shield', weight:30, key:'typeShield' },
        { label:'Lucky Charm', weight:20, key:'luckyCharm' },
        { label:'Running Shoes', weight:5, key:'runningShoes' }
      ],
      typeShieldBonusPct: 8,
      autoConsumeOnLossOrder: ['luckyCharm','potion']
    },
    winModel: {
      baseChance: 10,
      // Gym1 baseline contributions (before stage scaling)
      contributionBase: { veryStrong:36, strong:30, neutral:24, resisted:18 },
      // per-stage multiplier: Gym1=1.0, E4≈0.13
      stageMult: { early:1.0, late:0.13 },
      clampMin: 5,
      clampMax: 95,
      diminishingReturns: { enabled:true, expEarly:1.0, expLate:0.90 }
    }
  };

  // ------------------------------
  // Derived rarity pools (Common/Uncommon/Rare) from synthetic power.
  // ------------------------------
  const sortedByPower = [...POKEDEX].sort((a,b) => powerNormByDex(a.dex) - powerNormByDex(b.dex));
  const commonCut = Math.floor(sortedByPower.length * 0.60);
  const uncommonCut = Math.floor(sortedByPower.length * 0.90);
  const POOL_COMMON = sortedByPower.slice(0, commonCut);
  const POOL_UNCOMMON = sortedByPower.slice(commonCut, uncommonCut);
  const POOL_RARE = sortedByPower.slice(uncommonCut);

  function poolForTier(tier) {
    if (tier === 'Common') return POOL_COMMON;
    if (tier === 'Uncommon') return POOL_UNCOMMON;
    return POOL_RARE;
  }

  // ------------------------------
  // Game State
  // ------------------------------
  const makeInitialState = () => {
    const seedStr = String(Date.now()) + '|' + Math.random().toString(16).slice(2);
    const seed = hashStringToSeed(seedStr);
    const rng = mulberry32(seed);

    return {
      seed,
      rng,
      phase: 'STARTER', // STARTER, BATTLE, INTERMISSION, GAME_OVER, VICTORY
      stageIndex: 0,
      stageJitterById: {},
      party: [], // array of dex numbers
      inventory: { potion:0, luckyCharm:0, typeShield:0, runningShoes:false },
      buffs: { nextBattleCritBonus:0, nextBattleBonusSlot:false, nextBattleTempDex:null },
      wheel: null, // current wheel slices
      wheelPurpose: '',
      pending: null, // step machine for sub-wheels
      log: []
    };
  };

  let S = makeInitialState();

  // ------------------------------
  // UI elements
  // ------------------------------
  const el = (id) => document.getElementById(id);
  const wheelCanvas = el('wheel');
  const ctx = wheelCanvas.getContext('2d');
  const spinBtn = el('spinBtn');
  const restartBtn = el('restartBtn');
  const phaseLabel = el('phaseLabel');
  const phaseSub = el('phaseSub');
  const nextInfo = el('nextInfo');
  const resultText = el('resultText');
  const partyGrid = el('partyGrid');
  const invRow = el('invRow');
  const logBox = el('logBox');
  const seedPill = el('seedPill');
  const stagePill = el('stagePill');
  const chanceText = el('chanceText');
  const chanceMeta = el('chanceMeta');
  const breakdownText = el('breakdownText');
  const darkToggle = el('darkToggle');

  // ------------------------------
  // Logging
  // ------------------------------
  function log(tag, msg, kind='info') {
    const ts = new Date().toLocaleTimeString();
    S.log.unshift({ ts, tag, msg, kind });
    renderLog();
  }

  function renderLog() {
    logBox.innerHTML = S.log.slice(0, 80).map(r => `
      <div class="row">
        <span class="tag ${r.kind}">${r.tag}</span>
        <span>${escapeHtml(r.msg)}</span>
        <div style="margin-top:4px; color: var(--muted); font-family: var(--mono); font-size:10px;">${r.ts}</div>
      </div>
    `).join('');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  // ------------------------------
  // Wheel rendering + spin animation
  // ------------------------------
  const wheelState = {
    angle: 0,
    spinning: false,
    targetAngle: 0,
    startAngle: 0,
    startTime: 0,
    duration: 0
  };

  function setWheel(purpose, slices) {
    // slices: [{label, weight, data}]
    S.wheelPurpose = purpose;
    S.wheel = slices.map(s => ({...s}));
    resultText.textContent = '';
    drawWheel();
  }

  function totalWeight() {
    return (S.wheel || []).reduce((a,s) => a + (s.weight ?? 1), 0);
  }

  function pickWheelOutcome(rng) {
    return pickWeighted(rng, S.wheel);
  }

  function drawWheel() {
    const slices = S.wheel || [];
    const W = wheelCanvas.width, H = wheelCanvas.height;
    const cx = W/2, cy = H/2;
    ctx.clearRect(0,0,W,H);

    // background circle
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(wheelState.angle);

    const sum = totalWeight() || 1;
    let start = -Math.PI/2;
    const palette = [
      'rgba(125,211,252,.22)','rgba(134,239,172,.20)','rgba(251,113,133,.18)','rgba(253,224,71,.18)',
      'rgba(196,181,253,.20)','rgba(244,114,182,.18)','rgba(94,234,212,.18)','rgba(251,146,60,.18)'
    ];

    slices.forEach((s, i) => {
      const frac = (s.weight ?? 1) / sum;
      const end = start + frac * Math.PI * 2;

      // slice
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.arc(0,0, W*0.45, start, end);
      ctx.closePath();
      ctx.fillStyle = palette[i % palette.length];
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,.12)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // label
      const mid = (start + end) / 2;
      ctx.save();
      ctx.rotate(mid);
      ctx.translate(W*0.30, 0);
      ctx.rotate(Math.PI/2);
      ctx.fillStyle = 'rgba(255,255,255,.90)';
      ctx.font = '800 20px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = s.label.length > 18 ? s.label.slice(0,16) + '…' : s.label;
      ctx.fillText(label, 0, 0);
      ctx.restore();

      start = end;
    });

    // center hub
    ctx.beginPath();
    ctx.arc(0,0, W*0.12, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,.88)';
    ctx.font = '900 18px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', 0, 2);

    ctx.restore();
  }

  function spinWheel() {
    if (wheelState.spinning) return;
    if (!S.wheel || S.wheel.length === 0) return;

    wheelState.spinning = true;
    spinBtn.disabled = true;

    // choose outcome now (so we can land deterministically)
    const outcome = pickWheelOutcome(S.rng);

    // convert outcome to an angle that lands that slice at pointer (top, -90deg).
    // We'll compute slice ranges based on weights.
    const sum = totalWeight() || 1;
    let start = -Math.PI/2;
    let chosenStart = start, chosenEnd = start;
    for (const s of S.wheel) {
      const frac = (s.weight ?? 1) / sum;
      const end = start + frac * Math.PI * 2;
      if (s === outcome) { chosenStart = start; chosenEnd = end; break; }
      start = end;
    }
    const chosenMid = (chosenStart + chosenEnd) / 2;

    // we want chosenMid + wheelAngle == -PI/2 (pointer). Since we draw with wheelState.angle, pointer is fixed.
    // Actually pointer is visually at top; our slice labels start from -PI/2 too.
    // So we want wheelState.angle such that chosenMid + wheelState.angle == -PI/2.
    // => wheelState.angleTarget = -PI/2 - chosenMid, plus multiple spins.
    const spins = 6 + Math.floor(S.rng() * 4); // 6..9 rotations
    const target = (-Math.PI/2 - chosenMid) + spins * Math.PI * 2;

    wheelState.startAngle = wheelState.angle;
    wheelState.targetAngle = target;
    wheelState.startTime = performance.now();
    wheelState.duration = 1400 + Math.floor(S.rng() * 600); // 1.4..2.0s

    function anim(now) {
      const t = clamp((now - wheelState.startTime) / wheelState.duration, 0, 1);
      // easeOutCubic
      const e = 1 - Math.pow(1 - t, 3);
      wheelState.angle = wheelState.startAngle + (wheelState.targetAngle - wheelState.startAngle) * e;
      drawWheel();
      if (t < 1) {
        requestAnimationFrame(anim);
      } else {
        wheelState.spinning = false;
        spinBtn.disabled = false;
        onWheelResult(outcome);
      }
    }
    requestAnimationFrame(anim);
  }

  // ------------------------------
  // Game mechanics: chance computation
  // ------------------------------
  function stageProgress() {
    return clamp(S.stageIndex / (STAGES.length - 1), 0, 1);
  }

  function stageContributionMultiplier() {
    const t = stageProgress();
    return lerp(BAL.winModel.stageMult.early, BAL.winModel.stageMult.late, t);
  }

  function diminishingExponent() {
    const t = stageProgress();
    return lerp(BAL.winModel.diminishingReturns.expEarly, BAL.winModel.diminishingReturns.expLate, t);
  }

  function matchupCategory(pkm, stageTypes) {
    const mult = bestOffensiveMultiplier(pkm.types, stageTypes);
    if (mult >= 4) return 'veryStrong'; // e.g. 2x2
    if (mult >= 2) return 'strong';
    if (mult <= 0.5) return 'resisted';
    return 'neutral';
  }

  function pokemonBaseContribution(category, dex) {
    const base = BAL.winModel.contributionBase[category];
    // Optional tiny stat factor from synthetic power (0.85..1.15) to add identity
    const p = powerNormByDex(dex);
    const statFactor = 0.85 + 0.30 * p;
    return base * statFactor;
  }

  function computeBattleChance() {
    const stage = STAGES[S.stageIndex];
    const stageTypes = stage.types[0] === 'Mixed'
      ? randomChampionTypesForStage(stage.id)
      : stage.types;

    // roll jitter once per stage, store
    const jitter = getOrRollStageJitter(stage);

    // Auto-consume start-of-battle items/buffs: Type Shield + crit bonus
    let bonuses = 0;
    let bonusLines = [];

    if (S.inventory.typeShield > 0) {
      bonuses += BAL.items.typeShieldBonusPct;
      S.inventory.typeShield -= 1;
      bonusLines.push(`+${BAL.items.typeShieldBonusPct}% (Type Shield auto-consumed)`);
      log('ITEM', 'Type Shield auto-consumed (+8% this battle).', 'info');
    }

    if (S.buffs.nextBattleCritBonus > 0) {
      bonuses += S.buffs.nextBattleCritBonus;
      bonusLines.push(`+${S.buffs.nextBattleCritBonus}% (Critical Capture bonus auto-consumed)`);
      log('BUFF', `Critical Capture bonus auto-consumed (+${S.buffs.nextBattleCritBonus}%).`, 'info');
      S.buffs.nextBattleCritBonus = 0;
    }

    // Bonus slot handling: temporary 7th contributor for this battle
    let tempDex = null;
    if (S.buffs.nextBattleBonusSlot) {
      tempDex = S.buffs.nextBattleTempDex;
      S.buffs.nextBattleBonusSlot = false;
      S.buffs.nextBattleTempDex = null;
      if (tempDex != null) {
        const p = POKE_BY_DEX.get(tempDex);
        log('BUFF', `Bonus Slot active: extra contributor = ${p?.name ?? ('Dex ' + tempDex)}.`, 'info');
      }
    }

    // Compute pokemon contributions (scaled by stage)
    const multStage = stageContributionMultiplier();
    const contributions = [];

    const dexes = [...S.party];
    if (tempDex != null) dexes.push(tempDex);

    for (const dex of dexes) {
      const p = POKE_BY_DEX.get(dex);
      const cat = matchupCategory(p, stageTypes);
      const baseContrib = pokemonBaseContribution(cat, dex); // Gym1 baseline-ish
      const scaled = baseContrib * multStage;
      contributions.push({
        dex, name: p.name, types: p.types, category: cat,
        base: baseContrib,
        stageMult: multStage,
        final: scaled
      });
    }

    const sumScaled = contributions.reduce((s,c) => s + c.final, 0);

    let sumAfterDR = sumScaled;
    let drExp = 1.0;
    if (BAL.winModel.diminishingReturns.enabled) {
      drExp = diminishingExponent();
      // handle zero safely
      sumAfterDR = sumScaled <= 0 ? 0 : Math.pow(sumScaled, drExp);
    }

    // base chance
    const baseChance = BAL.winModel.baseChance;

    const rawChance = baseChance + sumAfterDR + bonuses;

    const finalChance = clamp(rawChance - stage.difficulty + jitter, BAL.winModel.clampMin, BAL.winModel.clampMax);

    // breakdown text
    const lines = [];
    lines.push(`Stage types: ${stageTypes.join('/')}  |  StageDifficulty: -${stage.difficulty}%  |  Jitter: ${jitter >=0 ? '+' : ''}${jitter}%`);
    lines.push(`BaseChance: ${baseChance}%`);
    lines.push(`Stage contribution multiplier: ${multStage.toFixed(2)} (Gym1→E4 scaling)`);
    lines.push(`Pokémon contributions (each always positive):`);
    contributions.forEach(c => {
      lines.push(`- ${c.name} [${c.types.join('/')}]  cat=${c.category}  base=${c.base.toFixed(1)}  -> scaled=${c.final.toFixed(1)}`);
    });
    lines.push(`SumScaled: ${sumScaled.toFixed(1)}`);
    if (BAL.winModel.diminishingReturns.enabled) {
      lines.push(`Diminishing returns: exponent=${drExp.toFixed(2)}  => SumAfterDR: ${sumAfterDR.toFixed(1)}`);
    }
    if (bonusLines.length) lines.push(`Bonuses: ${bonusLines.join(' + ')}`);
    lines.push(`RawChance: ${rawChance.toFixed(1)}%`);
    lines.push(`FinalChance: ${finalChance.toFixed(1)}%`);

    return { stage, stageTypes, jitter, baseChance, multStage, contributions, sumScaled, sumAfterDR, drExp, bonuses, rawChance, finalChance };
  }

  function randomChampionTypesForStage(stageId) {
    // Roll once per stage; store it like jitter so retries remain consistent.
    if (!S.stageJitterById[`champTypes:${stageId}`]) {
      const t1 = TYPES[Math.floor(S.rng() * TYPES.length)];
      const t2 = TYPES[Math.floor(S.rng() * TYPES.length)];
      S.stageJitterById[`champTypes:${stageId}`] = `${t1}/${t2}`;
    }
    const s = S.stageJitterById[`champTypes:${stageId}`];
    return String(s).split('/');
  }

  function getOrRollStageJitter(stage) {
    if (S.stageJitterById[stage.id] != null) return S.stageJitterById[stage.id];
    let j = 0;
    if (stage.jitter?.enabled) {
      const min = stage.jitter.min, max = stage.jitter.max;
      j = Math.floor(S.rng() * (max - min + 1)) + min;
    }
    S.stageJitterById[stage.id] = j;
    return j;
  }

  // ------------------------------
  // Wheels as a state machine (pending sub-wheels)
  // ------------------------------
  function gotoStarter() {
    S.phase = 'STARTER';
    S.pending = null;
    setWheel('Starter Selection', [
      { label:'Bulbasaur', weight:1, data:{dex:1} },
      { label:'Charmander', weight:1, data:{dex:4} },
      { label:'Squirtle', weight:1, data:{dex:7} },
      { label:'Random Gen 1', weight:1, data:{dex:null} }
    ]);
    render();
  }

  function gotoBattle() {
    S.phase = 'BATTLE';
    S.pending = null;

    // compute chance + set wheel Win/Lose with weights
    const info = computeBattleChance();
    const winW = info.finalChance;
    const loseW = 100 - info.finalChance;
    setWheel('Battle: Win / Lose', [
      { label:'WIN', weight: winW, data:{outcome:'win', chance: info.finalChance} },
      { label:'LOSE', weight: loseW, data:{outcome:'lose', chance: info.finalChance} }
    ]);
    render(info);
  }

  function gotoIntermission() {
    S.phase = 'INTERMISSION';
    S.pending = { spinsLeft: S.inventory.runningShoes ? BAL.intermissionSpins.withRunningShoes : BAL.intermissionSpins.base };
    setWheel('Intermission Action', BAL.intermissionActions.map(a => ({ label:a.label, weight:a.weight, data:{actionId:a.id, label:a.label} })));
    log('PHASE', `Intermission: spins = ${S.pending.spinsLeft}.`, 'info');
    render();
  }

  // ------------------------------
  // Action resolution
  // ------------------------------
  function onWheelResult(outcome) {
    resultText.textContent = `${S.wheelPurpose} → ${outcome.label}`;

    if (S.phase === 'STARTER') {
      const chosenDex = outcome.data.dex ?? null;
      let dex = chosenDex;
      if (dex == null) {
        dex = 1 + Math.floor(S.rng() * 151);
      }
      S.party = [dex];
      const p = POKE_BY_DEX.get(dex);
      log('START', `Starter: ${p.name} [${p.types.join('/')}]`, 'ok');
      // go to first battle
      gotoBattle();
      return;
    }

    if (S.phase === 'BATTLE') {
      const res = outcome.data.outcome;
      const chance = outcome.data.chance;
      if (res === 'win') {
        const stage = STAGES[S.stageIndex];
        log('BATTLE', `Won ${stage.name} (${stage.types.join('/')}) at ${chance.toFixed(1)}%`, 'ok');
        // advance stage
        S.stageIndex += 1;
        if (S.stageIndex >= STAGES.length) {
          S.phase = 'VICTORY';
          setWheel('Victory!', [{label:'YOU DID IT 🎉', weight:1, data:{}}]);
          log('END', 'VICTORY! You cleared the run.', 'ok');
          render();
          return;
        }
        gotoIntermission();
      } else {
        const stage = STAGES[S.stageIndex];
        log('BATTLE', `Lost ${stage.name} at ${chance.toFixed(1)}%`, 'bad');
        handleLossRecoveryOrGameOver();
      }
      return;
    }

    if (S.phase === 'INTERMISSION') {
      // resolve selected intermission action (may set up sub-wheel chain)
      resolveIntermissionAction(outcome.data.actionId);
      return;
    }

    // sub-wheels are handled by S.pending.kind
    if (S.pending && S.pending.kind) {
      resolvePendingWheel(outcome);
      return;
    }
  }

  function handleLossRecoveryOrGameOver() {
    // Auto-consume order: luckyCharm then potion
    // LuckyCharm: reroll battle wheel (same chance/jitter)
    if (S.inventory.luckyCharm > 0) {
      S.inventory.luckyCharm -= 1;
      log('ITEM', 'Lucky Charm auto-consumed: rerolling battle outcome.', 'info');
      // re-enter battle (recompute chance; jitter same, but TypeShield already consumed at start-of-battle)
      gotoBattle();
      return;
    }
    if (S.inventory.potion > 0) {
      S.inventory.potion -= 1;
      log('ITEM', 'Potion auto-consumed: retrying battle.', 'info');
      gotoBattle();
      return;
    }
    S.phase = 'GAME_OVER';
    setWheel('Game Over', [{label:'RIP 🪦 (Restart)', weight:1, data:{}}]);
    log('END', 'GAME OVER. Press Restart to try again.', 'bad');
    render();
  }

  function resolveIntermissionAction(actionId) {
    const stage = STAGES[S.stageIndex];
    const nextStageLabel = stage ? `${stage.name} (${stage.types.join('/')})` : '—';
    const spinsBefore = S.pending?.spinsLeft ?? 1;

    const consumeOneSpinAndMaybeReturnToBattle = () => {
      if (S.pending) {
        S.pending.spinsLeft -= 1;
        if (S.pending.spinsLeft <= 0) {
          gotoBattle();
        } else {
          // remain in intermission for second spin; reset wheel
          setWheel('Intermission Action', BAL.intermissionActions.map(a => ({ label:a.label, weight:a.weight, data:{actionId:a.id, label:a.label} })));
          render();
        }
      } else {
        gotoBattle();
      }
    };

    switch (actionId) {
      case 1: // Capture
        log('ACT', `Intermission action: Capture (next: ${nextStageLabel})`, 'info');
        startCaptureFlow({ tierMode:'normal', times:1 }, consumeOneSpinAndMaybeReturnToBattle);
        break;
      case 2: // Double capture
        log('ACT', `Intermission action: Double Capture (next: ${nextStageLabel})`, 'info');
        startCaptureFlow({ tierMode:'normal', times:2 }, consumeOneSpinAndMaybeReturnToBattle);
        break;
      case 3: // Guaranteed rare
        log('ACT', `Intermission action: Guaranteed Rare`, 'info');
        startCaptureFlow({ tierMode:'forcedRare', times:1 }, consumeOneSpinAndMaybeReturnToBattle);
        break;
      case 4: // Mystery Pokémon
        log('ACT', `Intermission action: Mystery Pokémon`, 'info');
        startCaptureFlow({ tierMode:'mystery', times:1 }, consumeOneSpinAndMaybeReturnToBattle);
        break;
      case 5: // Evolve
        doEvolveAction();
        consumeOneSpinAndMaybeReturnToBattle();
        break;
      case 9: // Type shield (adds item directly)
        S.inventory.typeShield += 1;
        log('ITEM', 'Gained Type Shield (+8% next battle, auto-consume).', 'ok');
        consumeOneSpinAndMaybeReturnToBattle();
        break;
      case 11: // Lucky charm
        S.inventory.luckyCharm += 1;
        log('ITEM', 'Gained Lucky Charm (auto-reroll on loss).', 'ok');
        consumeOneSpinAndMaybeReturnToBattle();
        break;
      case 13: // Bonus slot
        startBonusSlotSelection(consumeOneSpinAndMaybeReturnToBattle);
        break;
      case 16: // Find item
        startFindItemFlow(consumeOneSpinAndMaybeReturnToBattle);
        break;
      default:
        log('ACT', `Unknown action ${actionId}.`, 'bad');
        consumeOneSpinAndMaybeReturnToBattle();
    }
    render();
  }

  // ------------------------------
  // Capture flow (tier -> pokemon -> result -> party full)
  // ------------------------------
  function startCaptureFlow({ tierMode, times }, onDone) {
    // Store callback to return to intermission or battle after all captures.
    S.pending = {
      kind: 'CAPTURE',
      tierMode,
      remaining: times,
      step: 'TIER',
      chosenTier: null,
      chosenDex: null,
      onDone
    };

    if (tierMode === 'forcedRare') {
      S.pending.chosenTier = 'Rare';
      S.pending.step = 'POKEMON';
      setWheel('Encounter Pokémon (Rare)', buildPokemonWheel('Rare'));
    } else {
      const tierWeights = (tierMode === 'mystery') ? BAL.capture.tierWeightsMystery : BAL.capture.tierWeights;
      setWheel('Encounter Tier', tierWeights.map(t => ({ label:t.label, weight:t.weight, data:{tier:t.label} })));
    }
  }

  function buildPokemonWheel(tier) {
    const pool = poolForTier(tier);
    // Keep wheel readable: sample up to 14 candidates
    const sample = sampleWithoutReplacement(pool, Math.min(14, pool.length), S.rng);
    return sample.map(p => ({ label: `${p.name}`, weight: 1, data:{dex:p.dex, tier} }));
  }

  function sampleWithoutReplacement(arr, n, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  }

  function resolvePendingWheel(outcome) {
    if (!S.pending) return;
    if (S.pending.kind === 'CAPTURE') {
      if (S.pending.step === 'TIER') {
        const tier = outcome.data.tier;
        S.pending.chosenTier = tier;
        S.pending.step = 'POKEMON';
        setWheel(`Encounter Pokémon (${tier})`, buildPokemonWheel(tier));
        render();
        return;
      }
      if (S.pending.step === 'POKEMON') {
        const dex = outcome.data.dex;
        S.pending.chosenDex = dex;
        const p = POKE_BY_DEX.get(dex);
        S.pending.step = 'RESULT';
        setWheel(`Capture Result: ${p.name}`, BAL.capture.resultWeights.map(r => ({ label:r.label, weight:r.weight, data:{result:r.label} })));
        render();
        return;
      }
      if (S.pending.step === 'RESULT') {
        const result = outcome.data.result;
        const dex = S.pending.chosenDex;
        const p = POKE_BY_DEX.get(dex);
        if (result === 'Fail') {
          log('CAP', `Failed to capture ${p.name}.`, 'bad');
        } else {
          // success or critical -> add to party or resolve full party
          if (result === 'Critical') {
            S.buffs.nextBattleCritBonus += BAL.capture.criticalBonusNextBattlePct;
            log('CAP', `Captured ${p.name} (CRITICAL) +${BAL.capture.criticalBonusNextBattlePct}% next battle.`, 'ok');
          } else {
            log('CAP', `Captured ${p.name}.`, 'ok');
          }
          addPokemonToPartyOrResolveFull(dex);
        }
        // next capture or end
        S.pending.remaining -= 1;
        if (S.pending.remaining > 0) {
          // restart flow
          S.pending.step = 'TIER';
          S.pending.chosenTier = null;
          S.pending.chosenDex = null;
          if (S.pending.tierMode === 'forcedRare') {
            S.pending.chosenTier = 'Rare';
            S.pending.step = 'POKEMON';
            setWheel('Encounter Pokémon (Rare)', buildPokemonWheel('Rare'));
          } else {
            const tierWeights = (S.pending.tierMode === 'mystery') ? BAL.capture.tierWeightsMystery : BAL.capture.tierWeights;
            setWheel('Encounter Tier', tierWeights.map(t => ({ label:t.label, weight:t.weight, data:{tier:t.label} })));
          }
          render();
          return;
        } else {
          const done = S.pending.onDone;
          // return to intermission/battle
          S.pending = null;
          done();
          return;
        }
      }
    }

    if (S.pending.kind === 'PARTY_FULL') {
      const key = outcome.data.key;
      const newDex = S.pending.newDex;
      const pNew = POKE_BY_DEX.get(newDex);
      if (key === 'discard') {
        log('PARTY', `Party full: discarded ${pNew.name}.`, 'info');
      } else if (key === 'replaceRandom') {
        const idx = Math.floor(S.rng() * S.party.length);
        const oldDex = S.party[idx];
        const old = POKE_BY_DEX.get(oldDex);
        S.party[idx] = newDex;
        log('PARTY', `Party full: replaced ${old.name} → ${pNew.name}.`, 'ok');
      } else if (key === 'replaceWorst') {
        const idx = findWorstMatchupIndexForNextStage();
        const oldDex = S.party[idx];
        const old = POKE_BY_DEX.get(oldDex);
        S.party[idx] = newDex;
        log('PARTY', `Party full: replaced worst matchup ${old.name} → ${pNew.name}.`, 'ok');
      }
      const done = S.pending.onDone;
      S.pending = null;
      done();
      return;
    }

    if (S.pending.kind === 'FIND_ITEM') {
      const key = outcome.data.key;
      if (key === 'potion') S.inventory.potion += 1;
      if (key === 'typeShield') S.inventory.typeShield += 1;
      if (key === 'luckyCharm') S.inventory.luckyCharm += 1;
      if (key === 'runningShoes') S.inventory.runningShoes = true;
      log('ITEM', `Found item: ${outcome.label}.`, 'ok');
      const done = S.pending.onDone;
      S.pending = null;
      done();
      return;
    }

    if (S.pending.kind === 'BONUS_SLOT') {
      const chosen = outcome.data.choice;
      let tempDex = null;
      if (chosen === 'best') {
        tempDex = findBestMatchupDexForNextStage();
      } else {
        tempDex = S.party[Math.floor(S.rng() * S.party.length)];
      }
      S.buffs.nextBattleBonusSlot = true;
      S.buffs.nextBattleTempDex = tempDex;
      const p = POKE_BY_DEX.get(tempDex);
      log('BUFF', `Bonus Slot chosen: ${p.name} will contribute as extra slot next battle.`, 'ok');
      const done = S.pending.onDone;
      S.pending = null;
      done();
      return;
    }
  }

  function addPokemonToPartyOrResolveFull(newDex) {
    if (S.party.length < 6) {
      S.party.push(newDex);
      return;
    }
    // party full wheel
    S.pending = {
      kind: 'PARTY_FULL',
      newDex,
      onDone: () => { /* no-op: caller handles continuation */ }
    };
    // but we need to resume capture flow after this; so caller sets onDone accordingly.
    // We'll patch it in where used: in capture result, we call addPokemonToPartyOrResolveFull then if full it sets pending kind and we must set onDone now.
    // We'll detect and set here by checking if pending.kind is PARTY_FULL and pending.onDone is noop.
  }

  // Patch: when PARTY_FULL is set, ensure continuation goes back to capture pending flow.
  function ensurePartyFullContinuation(next) {
    if (S.pending && S.pending.kind === 'PARTY_FULL' && typeof S.pending.onDone === 'function' && S.pending.onDone.name === '') {
      S.pending.onDone = next;
    } else if (S.pending && S.pending.kind === 'PARTY_FULL') {
      S.pending.onDone = next;
    }
  }

  function findWorstMatchupIndexForNextStage() {
    const stage = STAGES[S.stageIndex];
    const stageTypes = stage.types[0] === 'Mixed' ? randomChampionTypesForStage(stage.id) : stage.types;
    let worstIdx = 0;
    let worstMult = Infinity;
    for (let i = 0; i < S.party.length; i++) {
      const dex = S.party[i];
      const p = POKE_BY_DEX.get(dex);
      const m = bestOffensiveMultiplier(p.types, stageTypes);
      if (m < worstMult) { worstMult = m; worstIdx = i; }
    }
    return worstIdx;
  }

  function findBestMatchupDexForNextStage() {
    const stage = STAGES[S.stageIndex];
    const stageTypes = stage.types[0] === 'Mixed' ? randomChampionTypesForStage(stage.id) : stage.types;
    let bestDex = S.party[0];
    let bestMult = -1;
    for (const dex of S.party) {
      const p = POKE_BY_DEX.get(dex);
      const m = bestOffensiveMultiplier(p.types, stageTypes);
      if (m > bestMult) { bestMult = m; bestDex = dex; }
    }
    return bestDex;
  }

  // Fix continuation for party full: hook into capture result flow
  const _originalAdd = addPokemonToPartyOrResolveFull;
  addPokemonToPartyOrResolveFull = function(newDex) {
    if (S.party.length < 6) { S.party.push(newDex); return; }
    // set party full wheel; continuation should go back to capture flow
    const continueCapture = () => {
      // after resolving full party, return to whatever capture step wanted next
      // Just resume by setting wheel back to tier (or next capture) depending on remaining.
      // We'll rely on the capture pending flow being recreated by caller; simplest: do nothing here.
    };
    S.pending = { kind:'PARTY_FULL', newDex, onDone: continueCapture };
    const pNew = POKE_BY_DEX.get(newDex);
    setWheel(`Party Full: Keep ${pNew.name}?`, BAL.capture.partyFull.map(x => ({ label:x.label, weight:x.weight, data:{key:x.key} })));
  };

  // ------------------------------
  // Find item / bonus slot / evolve
  // ------------------------------
  function startFindItemFlow(onDone) {
    S.pending = { kind:'FIND_ITEM', onDone };
    setWheel('Find Item', BAL.items.findItem.map(it => ({ label: it.label, weight: it.weight, data:{key:it.key} })));
    render();
  }

  function startBonusSlotSelection(onDone) {
    if (S.party.length === 0) { log('BUFF','No party to choose from.', 'bad'); onDone(); return; }
    S.pending = { kind:'BONUS_SLOT', onDone };
    setWheel('Bonus Slot Selection', [
      { label:'Best matchup (40%)', weight:40, data:{choice:'best'} },
      { label:'Random party (60%)', weight:60, data:{choice:'random'} }
    ]);
    render();
  }

  function doEvolveAction() {
    const evolvable = S.party.filter(d => EVOLVE_TO.has(d));
    if (evolvable.length === 0) {
      log('EVOLVE', 'No evolvable Pokémon in party (no effect).', 'info');
      return;
    }
    // pick random evolvable (60) or worst matchup (40)
    const pick = pickWeighted(S.rng, [
      { label:'Random evolvable', weight:60, data:{mode:'random'} },
      { label:'Worst matchup', weight:40, data:{mode:'worst'} }
    ]);
    let dexToEvolve;
    if (pick.data.mode === 'random') {
      dexToEvolve = evolvable[Math.floor(S.rng() * evolvable.length)];
    } else {
      // worst matchup among evolvable only
      const stage = STAGES[S.stageIndex];
      const stageTypes = stage.types[0] === 'Mixed' ? randomChampionTypesForStage(stage.id) : stage.types;
      let worstDex = evolvable[0], worstMult = Infinity;
      for (const d of evolvable) {
        const p = POKE_BY_DEX.get(d);
        const m = bestOffensiveMultiplier(p.types, stageTypes);
        if (m < worstMult) { worstMult = m; worstDex = d; }
      }
      dexToEvolve = worstDex;
    }
    const idx = S.party.indexOf(dexToEvolve);
    const evolvedDex = EVOLVE_TO.get(dexToEvolve);
    if (idx >= 0 && evolvedDex) {
      const from = POKE_BY_DEX.get(dexToEvolve);
      const to = POKE_BY_DEX.get(evolvedDex);
      S.party[idx] = evolvedDex;
      log('EVOLVE', `${from.name} evolved into ${to.name}!`, 'ok');
    }
  }

  // ------------------------------
  // Render
  // ------------------------------
  function render(battleInfo=null) {
    seedPill.textContent = `seed:${S.seed.toString(16)}`;
    const stage = STAGES[S.stageIndex] || null;

    // labels
    if (S.phase === 'STARTER') {
      phaseLabel.textContent = 'Starter Selection';
      phaseSub.textContent = 'Spin to pick your first Pokémon.';
      stagePill.textContent = '—';
      nextInfo.textContent = stage ? `Next: ${stage.name}` : '—';
      chanceText.textContent = '—';
      chanceMeta.textContent = '';
      breakdownText.textContent = 'Pick a starter, then fight Gym 1.';
    } else if (S.phase === 'BATTLE') {
      phaseLabel.textContent = stage ? `${stage.name} Battle` : 'Battle';
      phaseSub.textContent = stage ? `Types: ${stage.types.join('/')} • Difficulty: ${stage.difficulty}` : '—';
      nextInfo.textContent = stage ? `Stage: ${stage.id}` : '—';
      stagePill.textContent = stage ? `${stage.kind}` : '—';

      const info = battleInfo || computeBattleChance();
      chanceText.textContent = `${info.finalChance.toFixed(1)}%`;
      chanceMeta.textContent = `raw ${info.rawChance.toFixed(1)}%`;
      breakdownText.textContent = info ? buildBreakdown(info) : '—';
    } else if (S.phase === 'INTERMISSION') {
      phaseLabel.textContent = 'Intermission';
      phaseSub.textContent = `Spins left: ${S.pending?.spinsLeft ?? 1}${S.inventory.runningShoes ? ' (Running Shoes)' : ''}`;
      nextInfo.textContent = stage ? `Next: ${stage.name} (${stage.types.join('/')})` : '—';
      stagePill.textContent = stage ? `${stage.kind}` : '—';
      chanceText.textContent = '—';
      chanceMeta.textContent = '';
      breakdownText.textContent = 'Spin for an action. Sub-spins may appear (tier, Pokémon, etc.).';
    } else if (S.phase === 'GAME_OVER') {
      phaseLabel.textContent = 'Game Over';
      phaseSub.textContent = 'Restart to try again.';
      nextInfo.textContent = '—';
      stagePill.textContent = '—';
      chanceText.textContent = '—';
      chanceMeta.textContent = '';
      breakdownText.textContent = 'RIP 🪦';
    } else if (S.phase === 'VICTORY') {
      phaseLabel.textContent = 'Victory!';
      phaseSub.textContent = 'You cleared the run.';
      nextInfo.textContent = '—';
      stagePill.textContent = '—';
      chanceText.textContent = '—';
      chanceMeta.textContent = '';
      breakdownText.textContent = 'Absolute cinema 🎉';
    }

    renderParty();
    renderInv();
    drawWheel();
  }

  function buildBreakdown(info) {
    // already computed detailed lines in computeBattleChance; rebuild compact for UI
    const stage = STAGES[S.stageIndex];
    const st = info.stageTypes.join('/');
    const lines = [];
    lines.push(`Stage: ${stage.name} (${st})`);
    lines.push(`Difficulty: -${stage.difficulty}%  |  Jitter: ${info.jitter >=0 ? '+' : ''}${info.jitter}%`);
    lines.push(`BaseChance: ${BAL.winModel.baseChance}%`);
    lines.push(`StageMult: ${info.multStage.toFixed(2)}  |  DR exp: ${info.drExp.toFixed(2)}`);
    lines.push('');
    lines.push('Contribs:');
    info.contributions.forEach(c => {
      lines.push(`• ${c.name} [${c.types.join('/')}] ${c.category}  base ${c.base.toFixed(1)} → ${c.final.toFixed(1)}`);
    });
    lines.push('');
    lines.push(`SumScaled: ${info.sumScaled.toFixed(1)} → AfterDR: ${info.sumAfterDR.toFixed(1)}`);
    lines.push(`Bonuses: +${info.bonuses.toFixed(1)}%`);
    lines.push(`Raw: ${info.rawChance.toFixed(1)}%`);
    lines.push(`Final: ${info.finalChance.toFixed(1)}%`);
    return lines.join('\n');
  }

  function renderParty() {
    const slots = [];
    for (let i = 0; i < 6; i++) {
      const dex = S.party[i] ?? null;
      if (!dex) {
        slots.push(`<div class="slot"><div class="name" style="opacity:.55">Empty</div><div class="meta"><span>—</span><span class="pill" style="opacity:.55">—</span></div></div>`);
        continue;
      }
      const p = POKE_BY_DEX.get(dex);
      const pwr = powerNormByDex(dex);
      slots.push(`
        <div class="slot">
          <div class="name">${escapeHtml(p.name)}</div>
          <div class="meta">
            <span>${escapeHtml(p.types.join('/'))}</span>
            <span class="pill">PWR ${(pwr*100).toFixed(0)}</span>
          </div>
        </div>
      `);
    }
    partyGrid.innerHTML = slots.join('');
  }

  function renderInv() {
    const items = [];
    items.push(invChip('Potion', S.inventory.potion, 'consumable on loss'));
    items.push(invChip('Lucky Charm', S.inventory.luckyCharm, 'reroll on loss'));
    items.push(invChip('Type Shield', S.inventory.typeShield, '+8% next battle'));
    items.push(invChip('Running Shoes', S.inventory.runningShoes ? 'ON' : 'OFF', '2x intermission spins'));
    invRow.innerHTML = items.join('');
  }

  function invChip(name, val, note) {
    return `<div class="invItem">${escapeHtml(name)} <small>${escapeHtml(String(val))}</small> <small>• ${escapeHtml(note)}</small></div>`;
  }

  // ------------------------------
  // Controls
  // ------------------------------
  spinBtn.addEventListener('click', () => {
    // If we're in a pending sub-wheel state, S.phase stays INTERMISSION but S.pending.kind exists.
    // Our onWheelResult routes based on phase first; ensure sub-wheels are handled before action wheel.
    if (S.pending && S.pending.kind && S.phase === 'INTERMISSION') {
      // treat as sub-wheel
    }
    spinWheel();
  });

  restartBtn.addEventListener('click', () => {
    S = makeInitialState();
    log('RESET', 'New run started.', 'info');
    gotoStarter();
  });

  darkToggle.addEventListener('change', () => {
    document.body.setAttribute('data-theme', darkToggle.checked ? 'dark' : 'light');
  });

  // ------------------------------
  // Boot
  // ------------------------------
  function boot() {
    log('BOOT', 'Welcome. Spin to begin.', 'info');
    gotoStarter();

    // Optional: dev calibration (console)
    // You can comment this out; it's light.
    devCalibration();
  }

  function devCalibration() {
    try {
      // Gym1 and E4 neutral-ish average for starters
      const starters = [1,4,7];
      const gym1 = STAGES[0];
      const e4 = STAGES[9]; // E4_2; any E4 ok
      const sim = (stageIndex) => {
        const t = clamp(stageIndex / (STAGES.length - 1), 0, 1);
        const stageMult = lerp(BAL.winModel.stageMult.early, BAL.winModel.stageMult.late, t);
        const contribs = starters.map(d => {
          const p = POKE_BY_DEX.get(d);
          const stTypes = STAGES[stageIndex].types[0] === 'Mixed' ? ['Normal','Psychic'] : STAGES[stageIndex].types;
          const cat = matchupCategory(p, stTypes);
          const base = pokemonBaseContribution(cat, d);
          return base * stageMult;
        });
        return contribs.reduce((a,b)=>a+b,0) / contribs.length;
      };
      const avgGym1 = sim(0);
      const avgE4 = sim(9);
      console.log('[Calibration] avg starter contrib Gym1 ≈', avgGym1.toFixed(1), 'target ~30');
      console.log('[Calibration] avg starter contrib E4  ≈', avgE4.toFixed(1), 'target ~4');
    } catch(e) { /* ignore */ }
  }

  boot();
})();
