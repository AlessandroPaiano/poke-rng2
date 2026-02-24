
  // -------------------------
  // Utils
  // -------------------------
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
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function pickWeighted(rng, items) {
    const total = items.reduce((s, it) => s + it.weight, 0);
    let r = rng() * total;
    for (const it of items) {
      r -= it.weight;
      if (r <= 0) return it;
    }
    return items[items.length - 1];
  }

  // -------------------------
  // DOM
  // -------------------------
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

  // -------------------------
  // Types + Gen1 effectiveness (same compact chart as before)
  // -------------------------
  const TYPES = [
    'Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison','Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon'
  ];
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
    let best = 1;
    for (const atk of pokemonTypes) {
      let mult = 1;
      for (const def of stageTypes) mult *= eff(atk, def);
      if (mult > best) best = mult;
    }
    return best;
  }

  // -------------------------
  // Stages: difficulty + jitter (rolled once per stage)
  // -------------------------
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

  // -------------------------
  // Balance
  // -------------------------
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
      typeShieldBonusPct: 8
    },
    winModel: {
      baseChance: 10,
      contributionBase: { veryStrong:36, strong:30, neutral:24, resisted:18 },
      stageMult: { early:1.0, late:0.13 },
      clampMin: 5,
      clampMax: 95,
      diminishingReturns: { enabled:true, expEarly:1.0, expLate:0.90 },
      bstNorm: { min: 180, max: 680 },
      statFactor: { min: 0.85, max: 1.15 }
    }
  };

  // -------------------------
  // PokéAPI data (Gen 1)
  // -------------------------
  // We cache in localStorage to avoid 151 requests every refresh.
  const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
  const CACHE_KEY = 'gen1_pokedex_cache_v1';

  /** pokedex entry:
   * { dex, name, types:[...], stats:{hp,attack,defense,spAttack,spDefense,speed}, bst }
   */
  let POKEDEX = [];
  let POKE_BY_DEX = new Map();

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  }

  async function loadPokedexGen1() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.version === 1 && Array.isArray(parsed.pokedex) && parsed.pokedex.length === 151) {
        return parsed.pokedex;
      }
    }

    // Fetch list (151)
    const list = await fetchJson(`${POKEAPI_BASE}/pokemon?limit=151&offset=0`);
    const urls = list.results.map(r => r.url);

    // Concurrency-limited fetch to be polite
    const concurrency = 10;
    const results = [];
    let idx = 0;

    async function worker() {
      while (idx < urls.length) {
        const my = idx++;
        const data = await fetchJson(urls[my]);
        results[my] = normalizePokemon(data);
      }
    }

    const workers = [];
    for (let i = 0; i < concurrency; i++) workers.push(worker());
    await Promise.all(workers);

    // sort by dex and cache
    results.sort((a,b) => a.dex - b.dex);
    localStorage.setItem(CACHE_KEY, JSON.stringify({ version:1, pokedex: results }));
    return results;
  }

  function normalizePokemon(apiPokemon) {
    const dex = apiPokemon.id;
    const name = apiPokemon.name.charAt(0).toUpperCase() + apiPokemon.name.slice(1);
    const types = apiPokemon.types
      .sort((a,b) => a.slot - b.slot)
      .map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1));
    const statMap = {};
    for (const s of apiPokemon.stats) {
      const key = s.stat.name;
      statMap[key] = s.base_stat;
    }
    const stats = {
      hp: statMap['hp'] ?? 50,
      attack: statMap['attack'] ?? 50,
      defense: statMap['defense'] ?? 50,
      spAttack: statMap['special-attack'] ?? 50,
      spDefense: statMap['special-defense'] ?? 50,
      speed: statMap['speed'] ?? 50
    };
    const bst = stats.hp + stats.attack + stats.defense + stats.spAttack + stats.spDefense + stats.speed;
    return { dex, name, types, stats, bst };
  }

  function bstNorm(bst) {
    const mn = BAL.winModel.bstNorm.min, mx = BAL.winModel.bstNorm.max;
    return clamp((bst - mn) / (mx - mn), 0, 1);
  }

  // Evolution mapping (Gen 1) — kept static for now (fast + deterministic).
  // You requested PokéAPI for data; types+stats are from PokéAPI, evolution is rule-based Gen1 map.
  const EVOLVE_TO = new Map([
    [1,2],[2,3],[4,5],[5,6],[7,8],[8,9],[10,11],[11,12],[13,14],[14,15],[16,17],[17,18],[19,20],
    [21,22],[23,24],[25,26],[27,28],[29,30],[30,31],[32,33],[33,34],[35,36],[37,38],[39,40],[41,42],
    [43,44],[44,45],[46,47],[48,49],[50,51],[52,53],[54,55],[56,57],[58,59],[60,61],[61,62],[63,64],[64,65],
    [66,67],[67,68],[69,70],[70,71],[72,73],[74,75],[75,76],[77,78],[79,80],[81,82],[84,85],[86,87],[88,89],
    [90,91],[92,93],[93,94],[96,97],[98,99],[100,101],[102,103],[104,105],[109,110],[111,112],[116,117],
    [118,119],[120,121],[129,130],[133,134],[133,135],[133,136],[138,139],[140,141],[147,148],[148,149]
  ]);

  // -------------------------
  // Rarity pools (from BST) — computed after loading POKEDEX
  // -------------------------
  let POOL_COMMON = [], POOL_UNCOMMON = [], POOL_RARE = [];
  function buildRarityPools() {
    const sorted = [...POKEDEX].sort((a,b) => a.bst - b.bst);
    const commonCut = Math.floor(sorted.length * 0.60);
    const uncommonCut = Math.floor(sorted.length * 0.90);
    POOL_COMMON = sorted.slice(0, commonCut);
    POOL_UNCOMMON = sorted.slice(commonCut, uncommonCut);
    POOL_RARE = sorted.slice(uncommonCut);
  }
  function poolForTier(tier) {
    if (tier === 'Common') return POOL_COMMON;
    if (tier === 'Uncommon') return POOL_UNCOMMON;
    return POOL_RARE;
  }

  // -------------------------
  // Game State
  // -------------------------
  function makeInitialState() {
    const seedStr = String(Date.now()) + '|' + Math.random().toString(16).slice(2);
    const seed = hashStringToSeed(seedStr);
    const rng = mulberry32(seed);
    return {
      seed, rng,
      phase: 'STARTER', // STARTER, BATTLE, INTERMISSION, GAME_OVER, VICTORY
      stageIndex: 0,
      stageJitterById: {},
      party: [], // dex numbers
      inventory: { potion:0, luckyCharm:0, typeShield:0, runningShoes:false },
      buffs: { nextBattleCritBonus:0, nextBattleBonusSlot:false, nextBattleTempDex:null },
      wheelPurpose: '',
      wheel: [],
      pending: null, // sub-wheel state object OR intermission spins tracker
      log: []
    };
  }
  let S = makeInitialState();

  // -------------------------
  // Logging
  // -------------------------
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
        <div style="margin-top:4px;color:var(--muted);font-family:var(--mono);font-size:10px;">${r.ts}</div>
      </div>
    `).join('');
  }

  // -------------------------
  // Wheel rendering + animation
  // -------------------------
  const wheelState = { angle:0, spinning:false, targetAngle:0, startAngle:0, startTime:0, duration:0 };

  function setWheel(purpose, slices) {
    S.wheelPurpose = purpose;
    S.wheel = slices.map(s => ({...s}));
    resultText.textContent = '';
    drawWheel();
  }
  function totalWeight() {
    return (S.wheel || []).reduce((a,s) => a + (s.weight ?? 1), 0);
  }
  function drawWheel() {
    const slices = S.wheel || [];
    const W = wheelCanvas.width, H = wheelCanvas.height;
    const cx = W/2, cy = H/2;
    ctx.clearRect(0,0,W,H);

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

      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.arc(0,0, W*0.45, start, end);
      ctx.closePath();
      ctx.fillStyle = palette[i % palette.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.12)';
      ctx.lineWidth = 2;
      ctx.stroke();

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

  function pickWheelOutcome(rng) {
    return pickWeighted(rng, S.wheel);
  }

  function spinWheel() {
    if (wheelState.spinning) return;
    if (!S.wheel || S.wheel.length === 0) return;

    wheelState.spinning = true;
    spinBtn.disabled = true;

    const outcome = pickWheelOutcome(S.rng);

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
    const spins = 6 + Math.floor(S.rng() * 4);
    const target = (-Math.PI/2 - chosenMid) + spins * Math.PI * 2;

    wheelState.startAngle = wheelState.angle;
    wheelState.targetAngle = target;
    wheelState.startTime = performance.now();
    wheelState.duration = 1400 + Math.floor(S.rng() * 600);

    function anim(now) {
      const t = clamp((now - wheelState.startTime) / wheelState.duration, 0, 1);
      const e = 1 - Math.pow(1 - t, 3);
      wheelState.angle = wheelState.startAngle + (wheelState.targetAngle - wheelState.startAngle) * e;
      drawWheel();
      if (t < 1) requestAnimationFrame(anim);
      else {
        wheelState.spinning = false;
        spinBtn.disabled = false;
        onWheelResult(outcome);
      }
    }
    requestAnimationFrame(anim);
  }

  // -------------------------
  // Win chance model (with stats from PokéAPI)
  // -------------------------
  function stageProgress() {
    return clamp(S.stageIndex / (STAGES.length - 1), 0, 1);
  }
  function stageContributionMultiplier() {
    return lerp(BAL.winModel.stageMult.early, BAL.winModel.stageMult.late, stageProgress());
  }
  function diminishingExponent() {
    return lerp(BAL.winModel.diminishingReturns.expEarly, BAL.winModel.diminishingReturns.expLate, stageProgress());
  }
  function matchupCategory(pkm, stageTypes) {
    const mult = bestOffensiveMultiplier(pkm.types, stageTypes);
    if (mult >= 4) return 'veryStrong';
    if (mult >= 2) return 'strong';
    if (mult <= 0.5) return 'resisted';
    return 'neutral';
  }
  function pokemonBaseContribution(category, pkm) {
    const base = BAL.winModel.contributionBase[category];
    const n = bstNorm(pkm.bst);
    const statFactor = BAL.winModel.statFactor.min + (BAL.winModel.statFactor.max - BAL.winModel.statFactor.min) * n; // 0.85..1.15
    return base * statFactor;
  }

  function randomChampionTypesForStage(stageId) {
    const key = `champTypes:${stageId}`;
    if (!S.stageJitterById[key]) {
      const t1 = TYPES[Math.floor(S.rng() * TYPES.length)];
      const t2 = TYPES[Math.floor(S.rng() * TYPES.length)];
      S.stageJitterById[key] = `${t1}/${t2}`;
    }
    return String(S.stageJitterById[key]).split('/');
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

  function computeBattleChance() {
    const stage = STAGES[S.stageIndex];
    const stageTypes = stage.types[0] === 'Mixed' ? randomChampionTypesForStage(stage.id) : stage.types;

    const jitter = getOrRollStageJitter(stage);

    // start-of-battle auto bonuses (items/buffs)
    let bonuses = 0;
    const bonusLines = [];

    if (S.inventory.typeShield > 0) {
      bonuses += BAL.items.typeShieldBonusPct;
      S.inventory.typeShield -= 1;
      bonusLines.push(`+${BAL.items.typeShieldBonusPct}% (Type Shield auto-consumed)`);
      log('ITEM', `Type Shield auto-consumed (+${BAL.items.typeShieldBonusPct}% this battle).`, 'info');
    }
    if (S.buffs.nextBattleCritBonus > 0) {
      bonuses += S.buffs.nextBattleCritBonus;
      bonusLines.push(`+${S.buffs.nextBattleCritBonus}% (Critical Capture bonus)`);
      log('BUFF', `Critical Capture bonus auto-consumed (+${S.buffs.nextBattleCritBonus}%).`, 'info');
      S.buffs.nextBattleCritBonus = 0;
    }

    let tempDex = null;
    if (S.buffs.nextBattleBonusSlot) {
      tempDex = S.buffs.nextBattleTempDex;
      S.buffs.nextBattleBonusSlot = false;
      S.buffs.nextBattleTempDex = null;
      if (tempDex != null) log('BUFF', `Bonus Slot active: extra contributor = ${POKE_BY_DEX.get(tempDex)?.name ?? tempDex}.`, 'info');
    }

    const multStage = stageContributionMultiplier();
    const contributions = [];
    const dexes = [...S.party];
    if (tempDex != null) dexes.push(tempDex);

    for (const dex of dexes) {
      const p = POKE_BY_DEX.get(dex);
      const cat = matchupCategory(p, stageTypes);
      const base = pokemonBaseContribution(cat, p);
      const scaled = base * multStage;
      contributions.push({ dex, name:p.name, types:p.types, bst:p.bst, category:cat, base, scaled });
    }

    const sumScaled = contributions.reduce((s,c) => s + c.scaled, 0);
    const drExp = BAL.winModel.diminishingReturns.enabled ? diminishingExponent() : 1.0;
    const sumAfterDR = sumScaled <= 0 ? 0 : Math.pow(sumScaled, drExp);

    const rawChance = BAL.winModel.baseChance + sumAfterDR + bonuses;
    const finalChance = clamp(rawChance - stage.difficulty + jitter, BAL.winModel.clampMin, BAL.winModel.clampMax);

    const lines = [];
    lines.push(`Stage: ${stage.name} (${stageTypes.join('/')})`);
    lines.push(`Difficulty: -${stage.difficulty}% | Jitter: ${jitter>=0?'+':''}${jitter}%`);
    lines.push(`BaseChance: ${BAL.winModel.baseChance}%`);
    lines.push(`StageMult: ${multStage.toFixed(2)} | DR exp: ${drExp.toFixed(2)}`);
    lines.push('');
    lines.push('Contribs (always positive):');
    contributions.forEach(c => {
      lines.push(`• ${c.name} [${c.types.join('/')}] BST=${c.bst} cat=${c.category} base=${c.base.toFixed(1)} → ${c.scaled.toFixed(1)}`);
    });
    lines.push('');
    lines.push(`SumScaled: ${sumScaled.toFixed(1)} → AfterDR: ${sumAfterDR.toFixed(1)}`);
    if (bonusLines.length) lines.push(`Bonuses: ${bonusLines.join(' + ')}`);
    lines.push(`Raw: ${rawChance.toFixed(1)}%`);
    lines.push(`Final: ${finalChance.toFixed(1)}%`);

    return { stage, stageTypes, jitter, contributions, sumScaled, sumAfterDR, drExp, bonuses, rawChance, finalChance, breakdown: lines.join('\n') };
  }

  // -------------------------
  // Game state machine
  // -------------------------
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
    const info = computeBattleChance();
    setWheel('Battle: Win / Lose', [
      { label:'WIN',  weight: info.finalChance, data:{outcome:'win', chance: info.finalChance} },
      { label:'LOSE', weight: 100 - info.finalChance, data:{outcome:'lose', chance: info.finalChance} }
    ]);
    render(info);
  }

  function gotoIntermission() {
    S.phase = 'INTERMISSION';
    S.pending = { kind:'INTERMISSION', spinsLeft: S.inventory.runningShoes ? BAL.intermissionSpins.withRunningShoes : BAL.intermissionSpins.base };
    setWheel('Intermission Action', BAL.intermissionActions.map(a => ({ label:a.label, weight:a.weight, data:{actionId:a.id} })));
    log('PHASE', `Intermission: spins=${S.pending.spinsLeft}${S.inventory.runningShoes?' (Running Shoes)':''}.`, 'info');
    render();
  }

  // -------------------------
  // Intermission sub-wheels
  // pending.kind can be: INTERMISSION, CAPTURE, PARTY_FULL, FIND_ITEM, BONUS_SLOT
  // -------------------------
  function startCaptureFlow({ tierMode, times }) {
    S.pending = { kind:'CAPTURE', tierMode, remaining:times, step:'TIER', chosenTier:null, chosenDex:null };
    if (tierMode === 'forcedRare') {
      S.pending.chosenTier = 'Rare';
      S.pending.step = 'POKEMON';
      setWheel('Encounter Pokémon (Rare)', buildPokemonWheel('Rare'));
    } else {
      const tiers = (tierMode === 'mystery') ? BAL.capture.tierWeightsMystery : BAL.capture.tierWeights;
      setWheel('Encounter Tier', tiers.map(t => ({ label:t.label, weight:t.weight, data:{tier:t.label} })));
    }
    render();
  }

  function buildPokemonWheel(tier) {
    const pool = poolForTier(tier);
    const sample = sampleWithoutReplacement(pool, Math.min(14, pool.length), S.rng);
    return sample.map(p => ({ label:p.name, weight:1, data:{dex:p.dex, tier} }));
  }

  function sampleWithoutReplacement(arr, n, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  }

  function startFindItemFlow() {
    S.pending = { kind:'FIND_ITEM' };
    setWheel('Find Item', BAL.items.findItem.map(it => ({ label:it.label, weight:it.weight, data:{key:it.key} })));
    render();
  }

  function startBonusSlotSelection() {
    if (S.party.length === 0) { log('BUFF','No party to choose from.', 'bad'); return; }
    S.pending = { kind:'BONUS_SLOT' };
    setWheel('Bonus Slot Selection', [
      { label:'Best matchup (40%)', weight:40, data:{choice:'best'} },
      { label:'Random party (60%)', weight:60, data:{choice:'random'} }
    ]);
    render();
  }

  function handleIntermissionAction(actionId) {
    const consumeSpin = () => {
      // only if we are still in intermission mode (not in a sub-wheel)
      const p = S.pending;
      if (!p || p.kind !== 'INTERMISSION') return;
      p.spinsLeft -= 1;
      if (p.spinsLeft <= 0) {
        gotoBattle(); // <-- this was your bug in v1: sub-wheels prevented this transition
      } else {
        setWheel('Intermission Action', BAL.intermissionActions.map(a => ({ label:a.label, weight:a.weight, data:{actionId:a.id} })));
        render();
      }
    };

    switch (actionId) {
      case 1: log('ACT','Intermission: Capture.', 'info'); startCaptureFlow({tierMode:'normal', times:1}); break;
      case 2: log('ACT','Intermission: Double Capture.', 'info'); startCaptureFlow({tierMode:'normal', times:2}); break;
      case 3: log('ACT','Intermission: Guaranteed Rare.', 'info'); startCaptureFlow({tierMode:'forcedRare', times:1}); break;
      case 4: log('ACT','Intermission: Mystery Pokémon.', 'info'); startCaptureFlow({tierMode:'mystery', times:1}); break;
      case 5: doEvolveAction(); consumeSpin(); break;
      case 9: S.inventory.typeShield += 1; log('ITEM','Gained Type Shield (+8% next battle).', 'ok'); consumeSpin(); break;
      case 11: S.inventory.luckyCharm += 1; log('ITEM','Gained Lucky Charm (auto-reroll on loss).', 'ok'); consumeSpin(); break;
      case 13: log('BUFF','Intermission: Bonus Slot selection.', 'info'); startBonusSlotSelection(); break;
      case 16: log('ITEM','Intermission: Find Item.', 'info'); startFindItemFlow(); break;
      default: log('ACT',`Unknown intermission action ${actionId}`, 'bad'); consumeSpin();
    }
  }

  function resolveCaptureStep(outcome) {
    const p = S.pending; // CAPTURE
    if (!p || p.kind !== 'CAPTURE') return;

    if (p.step === 'TIER') {
      p.chosenTier = outcome.data.tier;
      p.step = 'POKEMON';
      setWheel(`Encounter Pokémon (${p.chosenTier})`, buildPokemonWheel(p.chosenTier));
      render();
      return;
    }

    if (p.step === 'POKEMON') {
      p.chosenDex = outcome.data.dex;
      const mon = POKE_BY_DEX.get(p.chosenDex);
      p.step = 'RESULT';
      setWheel(`Capture Result: ${mon.name}`, BAL.capture.resultWeights.map(r => ({ label:r.label, weight:r.weight, data:{result:r.label} })));
      render();
      return;
    }

    if (p.step === 'RESULT') {
      const res = outcome.data.result;
      const dex = p.chosenDex;
      const mon = POKE_BY_DEX.get(dex);

      if (res === 'Fail') {
        log('CAP', `Failed to capture ${mon.name}.`, 'bad');
      } else {
        if (res === 'Critical') {
          S.buffs.nextBattleCritBonus += BAL.capture.criticalBonusNextBattlePct;
          log('CAP', `Captured ${mon.name} (CRITICAL) +${BAL.capture.criticalBonusNextBattlePct}% next battle.`, 'ok');
        } else {
          log('CAP', `Captured ${mon.name}.`, 'ok');
        }
        // add to party (may trigger PARTY_FULL)
        if (S.party.length < 6) {
          S.party.push(dex);
        } else {
          // switch to PARTY_FULL sub-wheel but keep capture context to resume after
          const captureContext = { ...p };
          S.pending = { kind:'PARTY_FULL', newDex:dex, captureContext };
          setWheel(`Party Full: Keep ${mon.name}?`, BAL.capture.partyFull.map(x => ({ label:x.label, weight:x.weight, data:{key:x.key} })));
          render();
          return;
        }
      }

      // next capture in double capture?
      p.remaining -= 1;
      if (p.remaining > 0) {
        p.step = 'TIER';
        p.chosenTier = null;
        p.chosenDex = null;

        if (p.tierMode === 'forcedRare') {
          p.chosenTier = 'Rare';
          p.step = 'POKEMON';
          setWheel('Encounter Pokémon (Rare)', buildPokemonWheel('Rare'));
        } else {
          const tiers = (p.tierMode === 'mystery') ? BAL.capture.tierWeightsMystery : BAL.capture.tierWeights;
          setWheel('Encounter Tier', tiers.map(t => ({ label:t.label, weight:t.weight, data:{tier:t.label} })));
        }
        render();
        return;
      }

      // capture flow done -> return to INTERMISSION and consume a spin
      S.pending = { kind:'INTERMISSION', spinsLeft: S.inventory.runningShoes ? BAL.intermissionSpins.withRunningShoes : BAL.intermissionSpins.base };
      // BUT we must not reset spinsLeft; we need to decrement from the current intermission.
      // We'll store intermission spins in S.intermissionSpinsLeft on entry instead for correctness.
      // Simpler: track spinsLeft globally in S.meta during intermission.
      // We'll implement that properly below by keeping S.intermissionSpinsLeft separate.
    }
  }

  // We'll store intermission spins separately to avoid losing state when entering sub-wheels.
  // (Fix: the previous implementation overwrote pending when entering sub-wheels.)
  // So: S.intermissionSpinsLeft is authoritative when phase=INTERMISSION.
  S.intermissionSpinsLeft = 0;

  function enterIntermission() {
    S.phase = 'INTERMISSION';
    S.intermissionSpinsLeft = S.inventory.runningShoes ? BAL.intermissionSpins.withRunningShoes : BAL.intermissionSpins.base;
    S.pending = { kind:'INTERMISSION' };
    setWheel('Intermission Action', BAL.intermissionActions.map(a => ({ label:a.label, weight:a.weight, data:{actionId:a.id} })));
    log('PHASE', `Intermission: spins=${S.intermissionSpinsLeft}${S.inventory.runningShoes?' (Running Shoes)':''}.`, 'info');
    render();
  }

  // Rewire gotoIntermission to use the new approach
  gotoIntermission = enterIntermission;

  function consumeIntermissionSpinAndMaybeBattle() {
    S.intermissionSpinsLeft -= 1;
    if (S.intermissionSpinsLeft <= 0) {
      gotoBattle();
    } else {
      S.pending = { kind:'INTERMISSION' };
      setWheel('Intermission Action', BAL.intermissionActions.map(a => ({ label:a.label, weight:a.weight, data:{actionId:a.id} })));
      render();
    }
  }

  // Update handleIntermissionAction to consume from global counter
  function handleIntermissionAction2(actionId) {
    switch (actionId) {
      case 1: log('ACT','Intermission: Capture.', 'info'); S.pending = { kind:'CAPTURE', tierMode:'normal', remaining:1, step:'TIER', chosenTier:null, chosenDex:null }; setWheel('Encounter Tier', BAL.capture.tierWeights.map(t=>({label:t.label,weight:t.weight,data:{tier:t.label}}))); render(); return;
      case 2: log('ACT','Intermission: Double Capture.', 'info'); S.pending = { kind:'CAPTURE', tierMode:'normal', remaining:2, step:'TIER', chosenTier:null, chosenDex:null }; setWheel('Encounter Tier', BAL.capture.tierWeights.map(t=>({label:t.label,weight:t.weight,data:{tier:t.label}}))); render(); return;
      case 3: log('ACT','Intermission: Guaranteed Rare.', 'info'); S.pending = { kind:'CAPTURE', tierMode:'forcedRare', remaining:1, step:'POKEMON', chosenTier:'Rare', chosenDex:null }; setWheel('Encounter Pokémon (Rare)', buildPokemonWheel('Rare')); render(); return;
      case 4: log('ACT','Intermission: Mystery Pokémon.', 'info'); S.pending = { kind:'CAPTURE', tierMode:'mystery', remaining:1, step:'TIER', chosenTier:null, chosenDex:null }; setWheel('Encounter Tier', BAL.capture.tierWeightsMystery.map(t=>({label:t.label,weight:t.weight,data:{tier:t.label}}))); render(); return;
      case 5: doEvolveAction(); consumeIntermissionSpinAndMaybeBattle(); return;
      case 9: S.inventory.typeShield += 1; log('ITEM','Gained Type Shield (+8% next battle).', 'ok'); consumeIntermissionSpinAndMaybeBattle(); return;
      case 11: S.inventory.luckyCharm += 1; log('ITEM','Gained Lucky Charm (auto-reroll on loss).', 'ok'); consumeIntermissionSpinAndMaybeBattle(); return;
      case 13: log('BUFF','Intermission: Bonus Slot selection.', 'info'); S.pending = { kind:'BONUS_SLOT' }; setWheel('Bonus Slot Selection', [{label:'Best matchup (40%)',weight:40,data:{choice:'best'}},{label:'Random party (60%)',weight:60,data:{choice:'random'}}]); render(); return;
      case 16: log('ITEM','Intermission: Find Item.', 'info'); S.pending = { kind:'FIND_ITEM' }; setWheel('Find Item', BAL.items.findItem.map(it=>({label:it.label,weight:it.weight,data:{key:it.key}}))); render(); return;
      default: log('ACT',`Unknown intermission action ${actionId}`, 'bad'); consumeIntermissionSpinAndMaybeBattle(); return;
    }
  }

  // -------------------------
  // Party full resolution
  // -------------------------
  function findWorstMatchupIndexForNextStage() {
    const stage = STAGES[S.stageIndex];
    const stageTypes = stage.types[0] === 'Mixed' ? randomChampionTypesForStage(stage.id) : stage.types;
    let worstIdx = 0;
    let worstMult = Infinity;
    for (let i = 0; i < S.party.length; i++) {
      const p = POKE_BY_DEX.get(S.party[i]);
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

  function resolvePartyFull(outcome) {
    const p = S.pending; // PARTY_FULL
    const key = outcome.data.key;
    const newDex = p.newDex;
    const newMon = POKE_BY_DEX.get(newDex);

    if (key === 'discard') {
      log('PARTY', `Party full: discarded ${newMon.name}.`, 'info');
    } else if (key === 'replaceRandom') {
      const idx = Math.floor(S.rng() * S.party.length);
      const old = POKE_BY_DEX.get(S.party[idx]);
      S.party[idx] = newDex;
      log('PARTY', `Party full: replaced ${old.name} → ${newMon.name}.`, 'ok');
    } else if (key === 'replaceWorst') {
      const idx = findWorstMatchupIndexForNextStage();
      const old = POKE_BY_DEX.get(S.party[idx]);
      S.party[idx] = newDex;
      log('PARTY', `Party full: replaced worst matchup ${old.name} → ${newMon.name}.`, 'ok');
    }

    // restore capture flow if needed
    if (p.captureContext) {
      S.pending = p.captureContext; // back to CAPTURE
      // After adding/handling, continue capture flow:
      p.captureContext.remaining -= 1;
      if (p.captureContext.remaining > 0) {
        p.captureContext.step = (p.captureContext.tierMode === 'forcedRare') ? 'POKEMON' : 'TIER';
        p.captureContext.chosenTier = (p.captureContext.tierMode === 'forcedRare') ? 'Rare' : null;
        p.captureContext.chosenDex = null;
        if (p.captureContext.step === 'POKEMON') {
          setWheel('Encounter Pokémon (Rare)', buildPokemonWheel('Rare'));
        } else {
          const tiers = (p.captureContext.tierMode === 'mystery') ? BAL.capture.tierWeightsMystery : BAL.capture.tierWeights;
          setWheel('Encounter Tier', tiers.map(t => ({ label:t.label, weight:t.weight, data:{tier:t.label} })));
        }
        render();
        return;
      }
      // capture flow ended
      S.pending = { kind:'INTERMISSION' };
      consumeIntermissionSpinAndMaybeBattle();
      return;
    }

    // if no capture context, go back to intermission wheel
    S.pending = { kind:'INTERMISSION' };
    render();
  }

  // -------------------------
  // Bonus slot / Find item resolution
  // -------------------------
  function resolveFindItem(outcome) {
    const key = outcome.data.key;
    if (key === 'potion') S.inventory.potion += 1;
    if (key === 'typeShield') S.inventory.typeShield += 1;
    if (key === 'luckyCharm') S.inventory.luckyCharm += 1;
    if (key === 'runningShoes') S.inventory.runningShoes = true;
    log('ITEM', `Found item: ${outcome.label}.`, 'ok');
    S.pending = { kind:'INTERMISSION' };
    consumeIntermissionSpinAndMaybeBattle();
  }

  function resolveBonusSlot(outcome) {
    const choice = outcome.data.choice;
    let tempDex;
    if (choice === 'best') tempDex = findBestMatchupDexForNextStage();
    else tempDex = S.party[Math.floor(S.rng() * S.party.length)];
    S.buffs.nextBattleBonusSlot = true;
    S.buffs.nextBattleTempDex = tempDex;
    log('BUFF', `Bonus Slot: ${POKE_BY_DEX.get(tempDex).name} will contribute next battle.`, 'ok');
    S.pending = { kind:'INTERMISSION' };
    consumeIntermissionSpinAndMaybeBattle();
  }

  // -------------------------
  // Evolve action
  // -------------------------
  function doEvolveAction() {
    const evolvable = S.party.filter(d => EVOLVE_TO.has(d));
    if (evolvable.length === 0) {
      log('EVOLVE','No evolvable Pokémon in party (no effect).', 'info');
      return;
    }
    const pick = pickWeighted(S.rng, [
      { label:'Random evolvable', weight:60, data:{mode:'random'} },
      { label:'Worst matchup', weight:40, data:{mode:'worst'} }
    ]);
    let dexToEvolve;
    if (pick.data.mode === 'random') {
      dexToEvolve = evolvable[Math.floor(S.rng() * evolvable.length)];
    } else {
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

  // -------------------------
  // Loss recovery
  // -------------------------
  function handleLossRecoveryOrGameOver() {
    if (S.inventory.luckyCharm > 0) {
      S.inventory.luckyCharm -= 1;
      log('ITEM', 'Lucky Charm auto-consumed: rerolling battle outcome.', 'info');
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
    S.pending = null;
    setWheel('Game Over', [{ label:'RIP 🪦 (Restart)', weight:1, data:{} }]);
    log('END','GAME OVER. Press Restart.', 'bad');
    render();
  }

  // -------------------------
  // Wheel result handler (BUGFIX: sub-wheels must be handled BEFORE intermission main wheel)
  // -------------------------
  function onWheelResult(outcome) {
    resultText.textContent = `${S.wheelPurpose} → ${outcome.label}`;

    // 1) STARTER
    if (S.phase === 'STARTER') {
      let dex = outcome.data.dex;
      if (dex == null) dex = 1 + Math.floor(S.rng() * 151);
      S.party = [dex];
      const p = POKE_BY_DEX.get(dex);
      log('START', `Starter: ${p.name} [${p.types.join('/')}] BST=${p.bst}`, 'ok');
      gotoBattle();
      return;
    }

    // 2) BATTLE
    if (S.phase === 'BATTLE') {
      const res = outcome.data.outcome;
      const chance = outcome.data.chance;
      const stage = STAGES[S.stageIndex];
      if (res === 'win') {
        log('BATTLE', `Won ${stage.name} (${stage.types.join('/')}) at ${chance.toFixed(1)}%`, 'ok');
        S.stageIndex += 1;
        if (S.stageIndex >= STAGES.length) {
          S.phase = 'VICTORY';
          setWheel('Victory!', [{ label:'YOU DID IT 🎉', weight:1, data:{} }]);
          log('END','VICTORY! Cleared the run.', 'ok');
          render();
          return;
        }
        gotoIntermission();
      } else {
        log('BATTLE', `Lost ${stage.name} at ${chance.toFixed(1)}%`, 'bad');
        handleLossRecoveryOrGameOver();
      }
      return;
    }

    // 3) INTERMISSION sub-wheels (BUGFIX)
    if (S.phase === 'INTERMISSION' && S.pending && S.pending.kind && S.pending.kind !== 'INTERMISSION') {
      if (S.pending.kind === 'CAPTURE') {
        // dispatch capture steps
        const p = S.pending;
        if (p.step === 'TIER') {
          p.chosenTier = outcome.data.tier;
          p.step = 'POKEMON';
          setWheel(`Encounter Pokémon (${p.chosenTier})`, buildPokemonWheel(p.chosenTier));
          render();
          return;
        }
        if (p.step === 'POKEMON') {
          p.chosenDex = outcome.data.dex;
          const mon = POKE_BY_DEX.get(p.chosenDex);
          p.step = 'RESULT';
          setWheel(`Capture Result: ${mon.name}`, BAL.capture.resultWeights.map(r => ({ label:r.label, weight:r.weight, data:{result:r.label} })));
          render();
          return;
        }
        if (p.step === 'RESULT') {
          const res = outcome.data.result;
          const dex = p.chosenDex;
          const mon = POKE_BY_DEX.get(dex);

          if (res === 'Fail') {
            log('CAP', `Failed to capture ${mon.name}.`, 'bad');
          } else {
            if (res === 'Critical') {
              S.buffs.nextBattleCritBonus += BAL.capture.criticalBonusNextBattlePct;
              log('CAP', `Captured ${mon.name} (CRITICAL) +${BAL.capture.criticalBonusNextBattlePct}% next battle.`, 'ok');
            } else {
              log('CAP', `Captured ${mon.name}.`, 'ok');
            }

            if (S.party.length < 6) {
              S.party.push(dex);
            } else {
              const captureContext = { ...p };
              S.pending = { kind:'PARTY_FULL', newDex:dex, captureContext };
              setWheel(`Party Full: Keep ${mon.name}?`, BAL.capture.partyFull.map(x => ({ label:x.label, weight:x.weight, data:{key:x.key} })));
              render();
              return;
            }
          }

          // next capture?
          p.remaining -= 1;
          if (p.remaining > 0) {
            p.step = (p.tierMode === 'forcedRare') ? 'POKEMON' : 'TIER';
            p.chosenTier = (p.tierMode === 'forcedRare') ? 'Rare' : null;
            p.chosenDex = null;

            if (p.step === 'POKEMON') {
              setWheel('Encounter Pokémon (Rare)', buildPokemonWheel('Rare'));
            } else {
              const tiers = (p.tierMode === 'mystery') ? BAL.capture.tierWeightsMystery : BAL.capture.tierWeights;
              setWheel('Encounter Tier', tiers.map(t => ({ label:t.label, weight:t.weight, data:{tier:t.label} })));
            }
            render();
            return;
          }

          // capture done -> consume intermission spin
          S.pending = { kind:'INTERMISSION' };
          consumeIntermissionSpinAndMaybeBattle();
          return;
        }
      }

      if (S.pending.kind === 'PARTY_FULL') { resolvePartyFull(outcome); return; }
      if (S.pending.kind === 'FIND_ITEM')  { resolveFindItem(outcome); return; }
      if (S.pending.kind === 'BONUS_SLOT') { resolveBonusSlot(outcome); return; }
    }

    // 4) INTERMISSION main action wheel
    if (S.phase === 'INTERMISSION' && S.pending && S.pending.kind === 'INTERMISSION') {
      handleIntermissionAction2(outcome.data.actionId);
      return;
    }
  }

  // -------------------------
  // Rendering
  // -------------------------
  function render(battleInfo=null) {
    seedPill.textContent = `seed:${S.seed.toString(16)}`;
    const stage = STAGES[S.stageIndex] || null;

    if (S.phase === 'STARTER') {
      phaseLabel.textContent = 'Starter Selection';
      phaseSub.textContent = 'Spin per scegliere il primo Pokémon.';
      nextInfo.textContent = stage ? `Next: ${stage.name}` : '—';
      stagePill.textContent = '—';
      chanceText.textContent = '—';
      chanceMeta.textContent = '';
      breakdownText.textContent = 'Scegli uno starter, poi affronta Gym 1.';
    } else if (S.phase === 'BATTLE') {
      phaseLabel.textContent = stage ? `${stage.name} Battle` : 'Battle';
      phaseSub.textContent = stage ? `Types: ${stage.types.join('/')} • Difficulty: ${stage.difficulty}` : '—';
      nextInfo.textContent = stage ? `Stage: ${stage.id}` : '—';
      stagePill.textContent = stage ? stage.kind : '—';

      const info = battleInfo || computeBattleChance();
      chanceText.textContent = `${info.finalChance.toFixed(1)}%`;
      chanceMeta.textContent = `raw ${info.rawChance.toFixed(1)}%`;
      breakdownText.textContent = info.breakdown;
    } else if (S.phase === 'INTERMISSION') {
      phaseLabel.textContent = 'Intermission';
      phaseSub.textContent = `Spins left: ${S.intermissionSpinsLeft}${S.inventory.runningShoes ? ' (Running Shoes)' : ''}`;
      nextInfo.textContent = stage ? `Next: ${stage.name} (${stage.types.join('/')})` : '—';
      stagePill.textContent = stage ? stage.kind : '—';
      chanceText.textContent = '—';
      chanceMeta.textContent = '';
      breakdownText.textContent = 'Spin per un’azione. Se serve, compariranno sottoruote (tier, Pokémon, ecc.).';
    } else if (S.phase === 'GAME_OVER') {
      phaseLabel.textContent = 'Game Over';
      phaseSub.textContent = 'Restart per riprovare.';
      nextInfo.textContent = '—';
      stagePill.textContent = '—';
      chanceText.textContent = '—';
      chanceMeta.textContent = '';
      breakdownText.textContent = 'RIP 🪦';
    } else if (S.phase === 'VICTORY') {
      phaseLabel.textContent = 'Victory!';
      phaseSub.textContent = 'Run completata.';
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

  function renderParty() {
    const slots = [];
    for (let i = 0; i < 6; i++) {
      const dex = S.party[i] ?? null;
      if (!dex) {
        slots.push(`<div class="slot"><div class="name" style="opacity:.55">Empty</div><div class="meta"><span>—</span><span class="pill" style="opacity:.55">—</span></div></div>`);
        continue;
      }
      const p = POKE_BY_DEX.get(dex);
      const n = bstNorm(p.bst);
      slots.push(`
        <div class="slot">
          <div class="name">${escapeHtml(p.name)}</div>
          <div class="meta">
            <span>${escapeHtml(p.types.join('/'))}</span>
            <span class="pill">BST ${p.bst} • ${(n*100).toFixed(0)}</span>
          </div>
        </div>
      `);
    }
    partyGrid.innerHTML = slots.join('');
  }

  function renderInv() {
    invRow.innerHTML = [
      invChip('Potion', S.inventory.potion, 'retry on loss'),
      invChip('Lucky Charm', S.inventory.luckyCharm, 'reroll on loss'),
      invChip('Type Shield', S.inventory.typeShield, '+8% next battle'),
      invChip('Running Shoes', S.inventory.runningShoes ? 'ON' : 'OFF', '2x intermission spins')
    ].join('');
  }
  function invChip(name, val, note) {
    return `<div class="invItem">${escapeHtml(name)} <small>${escapeHtml(String(val))}</small> <small>• ${escapeHtml(note)}</small></div>`;
  }

  // -------------------------
  // Controls
  // -------------------------
  spinBtn.addEventListener('click', spinWheel);
  restartBtn.addEventListener('click', () => {
    S = makeInitialState();
    S.intermissionSpinsLeft = 0;
    log('RESET','New run started.', 'info');
    gotoStarter();
  });
  darkToggle.addEventListener('change', () => {
    document.body.setAttribute('data-theme', darkToggle.checked ? 'dark' : 'light');
  });

  // -------------------------
  // Boot
  // -------------------------
  async function boot() {
    try {
      phaseLabel.textContent = 'Loading PokéAPI…';
      phaseSub.textContent = 'Scarico Pokédex Gen 1 (151 Pokémon).';
      render();

      POKEDEX = await loadPokedexGen1();
      POKE_BY_DEX = new Map(POKEDEX.map(p => [p.dex, p]));
      buildRarityPools();

      log('BOOT', 'PokéAPI data loaded (Gen 1).', 'ok');
      seedPill.textContent = `seed:${S.seed.toString(16)}`;
      spinBtn.disabled = false;

      gotoStarter();
      devCalibration();
    } catch (e) {
      console.error(e);
      phaseLabel.textContent = 'Errore caricamento PokéAPI';
      phaseSub.textContent = 'Controlla la connessione o riprova più tardi.';
      breakdownText.textContent = String(e);
      spinBtn.disabled = true;
    }
  }

  function devCalibration() {
    try {
      const starters = [1,4,7];
      const sim = (stageIndex) => {
        const t = clamp(stageIndex / (STAGES.length - 1), 0, 1);
        const stageMult = lerp(BAL.winModel.stageMult.early, BAL.winModel.stageMult.late, t);
        const stageTypes = STAGES[stageIndex].types[0] === 'Mixed' ? ['Normal','Psychic'] : STAGES[stageIndex].types;
        const contribs = starters.map(dex => {
          const p = POKE_BY_DEX.get(dex);
          const cat = matchupCategory(p, stageTypes);
          const base = pokemonBaseContribution(cat, p);
          return base * stageMult;
        });
        return contribs.reduce((a,b)=>a+b,0)/contribs.length;
      };
      console.log('[Calibration] avg starter contrib Gym1 ≈', sim(0).toFixed(1), 'target ~30');
      console.log('[Calibration] avg starter contrib E4  ≈', sim(9).toFixed(1), 'target ~4');
    } catch {}
  }

  boot();
