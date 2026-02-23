/* ============================================================
   Gen 1 RNG Gym Run — app.js
   Vanilla JS, no build step, GitHub Pages compatible
   ============================================================ */

// ── Global State ──────────────────────────────────────────────
let G = {}; // game state
let DATA = {}; // loaded JSON data

// ── Data Loading ──────────────────────────────────────────────
async function loadData() {
  const [pokedex, typeChart, stages, balance] = await Promise.all([
    fetch('./data/pokedex_gen1.json').then(r => r.json()),
    fetch('./data/type_chart_gen1.json').then(r => r.json()),
    fetch('./data/stages_kanto.json').then(r => r.json()),
    fetch('./data/balance_config.json').then(r => r.json()),
  ]);
  DATA.pokedex = pokedex;
  DATA.typeChart = typeChart;
  DATA.stages = stages;
  DATA.balance = balance;

  // Pre-sort pokedex by tier
  DATA.byTier = { Common: [], Uncommon: [], Rare: [] };
  for (const p of DATA.pokedex) {
    DATA.byTier[p.tier].push(p);
  }

  // Build dex map
  DATA.dexMap = {};
  for (const p of DATA.pokedex) DATA.dexMap[p.dexNumber] = p;
}

// ── Wheel Engine ───────────────────────────────────────────────
const canvas = document.getElementById('wheel-canvas');
const ctx = canvas.getContext('2d');

const WHEEL_COLORS_DARK = [
  '#c03060','#e06020','#b8a020','#208050','#2060c0','#803090','#c05050','#2090a0',
  '#a04080','#50a030','#d04030','#3060a0'
];
const WHEEL_COLORS_LIGHT = [
  '#f06090','#f0a060','#d8c040','#60c080','#6090e0','#c070d0','#e08080','#60c0d0',
  '#d070a0','#80d070','#f07060','#6080d0'
];

let wheelState = {
  slices: [],       // [{label, weight, color}]
  angle: 0,         // current rotation radians
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
  const total = slices.reduce((s, x) => s + x.weight, 0);
  let colorIdx = 0;
  return slices.map((s, i) => ({
    ...s,
    proportion: s.weight / total,
    color: colors[i % colors.length]
  }));
}

function drawWheel(slices, angle) {
  const W = canvas.width;
  const H = canvas.height;
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

    // Slice
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    if (sweep > 0.12) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      const labelR = r * 0.65;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      ctx.fillStyle = isDark ? '#fff' : '#000';
      ctx.shadowColor = isDark ? '#000' : '#fff';
      ctx.shadowBlur = 4;

      const maxLen = 14;
      let label = s.label.length > maxLen ? s.label.slice(0, maxLen - 1) + '…' : s.label;
      const fontSize = Math.max(8, Math.min(13, sweep * 40));
      ctx.font = `bold ${fontSize}px 'VT323', monospace`;
      ctx.fillText(label, labelR, 0);
      ctx.restore();
    }

    start = end;
  }

  // Center circle
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.strokeStyle = '#f8e71c';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function animateSpin(timestamp) {
  if (!wheelState.spinning) return;
  const elapsed = timestamp - wheelState.startTime;
  const progress = Math.min(elapsed / wheelState.duration, 1);
  const easedProgress = easeOut(progress);
  wheelState.angle = wheelState.startAngle + (wheelState.targetAngle - wheelState.startAngle) * easedProgress;
  drawWheel(wheelState.slices, wheelState.angle);

  if (progress < 1) {
    requestAnimationFrame(animateSpin);
  } else {
    wheelState.spinning = false;
    canvas.classList.remove('wheel-spinning');
    if (wheelState.onDone) wheelState.onDone();
  }
}

// Returns the winning slice index after spin
function spinWheel(slices, onDone) {
  if (wheelState.spinning) return;
  if (!slices || slices.length === 0) return;

  const built = buildWheel(slices);
  wheelState.slices = built;

  // Pick a random weighted winner
  const total = slices.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  let winnerIdx = 0;
  for (let i = 0; i < slices.length; i++) {
    r -= slices[i].weight;
    if (r <= 0) { winnerIdx = i; break; }
  }

  // Compute target angle so winner is at top (pointer)
  // pointer is at top (0 deg = -π/2). We want the winner slice mid to be at top.
  const totalW = slices.reduce((s, x) => s + x.weight, 0);
  let accAngle = 0;
  for (let i = 0; i < winnerIdx; i++) accAngle += (slices[i].weight / totalW) * 2 * Math.PI;
  const winnerMid = accAngle + (slices[winnerIdx].weight / totalW) * Math.PI;
  // We want winnerMid - newAngle = 0 (mod 2π), so newAngle = winnerMid
  // Current angle = wheelState.angle - π/2 is offset; we need pointer at top
  // Pointer is at top = angle=0 in our draw coord; slice start = angle - π/2
  // For pointer (top) to hit winnerMid: draw start of wheel = -winnerMid
  const spins = 4 + Math.random() * 4;
  const target = wheelState.angle + spins * 2 * Math.PI + (2 * Math.PI - winnerMid - (wheelState.angle % (2 * Math.PI)) + Math.PI * 2) % (Math.PI * 2) - Math.PI / 2;

  wheelState.startAngle = wheelState.angle;
  // Simpler: just ensure we spin enough and land on winner
  const currentNorm = ((wheelState.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const wantAngle = (2 * Math.PI - winnerMid + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
  const diff = (wantAngle - currentNorm + 2 * Math.PI) % (2 * Math.PI);
  wheelState.targetAngle = wheelState.angle + (spins * 2 * Math.PI) + diff;

  wheelState.spinning = true;
  wheelState.startTime = performance.now();
  wheelState.duration = 2800 + Math.random() * 1000;
  wheelState.onDone = () => onDone(winnerIdx, built[winnerIdx]);
  canvas.classList.add('wheel-spinning');
  requestAnimationFrame(animateSpin);
}

// ── Type Effectiveness ─────────────────────────────────────────
function getEffectiveness(attackType, defType) {
  const row = DATA.typeChart[attackType];
  if (!row) return 1;
  return row[defType] ?? 1;
}

// How good is this pokemon vs stage types (offensive: pokemon attacks stage)
function getPokemonMatchup(pokemon, stageTypes) {
  // For win model: we consider how well the pokemon's types cover stage types
  // If pokemon type super-effective vs any stage type → advantage
  const pokemonTypes = [pokemon.type1, pokemon.type2].filter(Boolean);
  const stageTypesFiltered = stageTypes.filter(t => t !== 'Mixed');

  let best = 0;
  for (const pt of pokemonTypes) {
    for (const st of stageTypesFiltered) {
      const eff = getEffectiveness(pt, st);
      if (eff > best) best = eff;
    }
  }

  // Count how many pokemon types are super-effective
  let superCount = 0;
  for (const pt of pokemonTypes) {
    for (const st of stageTypesFiltered) {
      if (getEffectiveness(pt, st) >= 2) superCount++;
    }
  }

  const bal = DATA.balance.winModel.contributions;
  if (superCount >= 2) return { category: 'VeryStrong', value: bal.VeryStrong };
  if (best >= 2) return { category: 'Strong', value: bal.Strong };
  if (best >= 1) return { category: 'Neutral', value: bal.Neutral };
  return { category: 'Resisted', value: bal.Resisted };
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

  const clamped = Math.max(bal.clamp[0], Math.min(bal.clamp[1], chance));
  return { chance: clamped, breakdown, raw: chance };
}

// ── Game Init ──────────────────────────────────────────────────
function initGame() {
  G = {
    phase: 'STARTER', // STARTER | INTERMISSION | BATTLE | END
    stageIndex: 0,
    party: [],        // [{...pokemon, tempBonus?}]
    inventory: {
      Potion: 0,
      LuckyCharm: 0,
      TypeShield: 0,
      RunningShoes: false,
    },
    bonuses: {         // per-battle bonuses
      criticalBonus: false,
      typeShield: false,
      bonusSlot: null, // pokemon object
    },
    intermissionSpinsLeft: 0,
    spinQueue: [],    // queued spin operations
    running: false,   // spin in progress
    runEnded: false,
    runLog: [],
  };
  renderAll();
  drawWheel([], 0);
  setupStarterWheel();
}

// ── Starter Wheel ──────────────────────────────────────────────
function setupStarterWheel() {
  const starters = [
    DATA.dexMap[1],   // Bulbasaur
    DATA.dexMap[4],   // Charmander
    DATA.dexMap[7],   // Squirtle
  ];
  const slices = starters.map(p => ({ label: p.name, weight: 1 }));
  setPhaseLabel('Starter Selection', '');
  setWheelResult('Spin to choose your starter!');
  setSpinHandler(() => {
    spinWheel(slices, (idx, slice) => {
      const chosen = starters[idx];
      log('🎰', `Starter chosen: ${chosen.name}!`, 'log-capture');
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
  const stage = DATA.stages[G.stageIndex];
  setPhaseLabel('Intermission', `Preparing for: ${stage.stageName}`);
  updateSpinQueueLabel();

  const bw = DATA.balance.intermissionWheel;
  const slices = Object.entries(bw).map(([key, w]) => ({
    label: formatActionLabel(key),
    weight: w,
    action: key
  }));

  setSpinHandler(() => {
    if (G.intermissionSpinsLeft <= 0) return;
    spinWheel(slices, (idx, slice) => {
      G.intermissionSpinsLeft--;
      updateSpinQueueLabel();
      log('🎡', `Intermission spin: ${slice.label}`, 'log-info');
      setWheelResult(slice.label);
      resolveIntermissionAction(slice.action, () => {
        renderAll();
        if (G.intermissionSpinsLeft > 0) {
          setTimeout(() => setupIntermissionWheel(), 600);
        } else {
          // Go to battle
          setTimeout(() => setupBattlePhase(), 800);
        }
      });
    });
  });
}

function formatActionLabel(key) {
  const labels = {
    Capture: 'Capture!',
    DoubleCapture: 'Double Capture!',
    GuaranteedRareEncounter: 'Rare Encounter!',
    MysteryPokemon: 'Mystery Pokémon!',
    EvolvePartyPokemon: 'Evolve!',
    TypeShield: 'Type Shield!',
    LuckyCharm: 'Lucky Charm!',
    BonusSlotNextBattle: 'Bonus Slot!',
    FindItem: 'Find Item!',
  };
  return labels[key] || key;
}

function updateSpinQueueLabel() {
  const el = document.getElementById('spin-queue-label');
  if (G.phase === 'INTERMISSION') {
    el.textContent = `Spins left: ${G.intermissionSpinsLeft}`;
  } else {
    el.textContent = '';
  }
}

// ── Action Resolver ────────────────────────────────────────────
function resolveIntermissionAction(action, cb) {
  switch(action) {
    case 'Capture':
      doCapture(false, false, cb); break;
    case 'DoubleCapture':
      doCapture(false, false, () => {
        setTimeout(() => doCapture(false, false, cb), 500);
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
      log('🛡️', 'Type Shield added to bag!', 'log-item');
      cb(); break;
    case 'LuckyCharm':
      G.inventory.LuckyCharm++;
      log('🍀', 'Lucky Charm added to bag!', 'log-item');
      cb(); break;
    case 'BonusSlotNextBattle':
      doBonusSlot(cb); break;
    case 'FindItem':
      doFindItem(cb); break;
    default:
      cb();
  }
}

// ── Capture System ─────────────────────────────────────────────
function doCapture(forceRare, mystery, cb) {
  if (forceRare) {
    // Guaranteed Rare: force Rare tier, spin pokemon, then result
    log('⭐', 'Guaranteed Rare Encounter!', 'log-capture');
    const rarePool = DATA.byTier['Rare'];
    const pokeSlices = rarePool.map(p => ({ label: p.name, weight: 1 }));
    setWheelResult('Rare Pokémon!');
    setTimeout(() => {
      spinWheel(pokeSlices, (idx, slice) => {
        const caught = rarePool[idx];
        log('🎰', `Rare Pokémon: ${caught.name}`, 'log-capture');
        doCaptureResult(caught, cb);
      });
    }, 400);
    return;
  }

  if (mystery) {
    // Mystery: pick from mystery tier weights
    log('❓', 'Mystery Pokémon!', 'log-capture');
    const mw = DATA.balance.mysteryTierWeights;
    const tierSlices = Object.entries(mw).map(([t, w]) => ({ label: t, weight: w, tier: t }));
    setTimeout(() => {
      spinWheel(tierSlices, (idx, slice) => {
        const tier = slice.tier;
        const pool = DATA.byTier[tier];
        const pokeSlices = pool.map(p => ({ label: p.name, weight: 1 }));
        log('🎡', `Mystery Tier: ${tier}`, 'log-capture');
        setTimeout(() => {
          spinWheel(pokeSlices, (idx2, slice2) => {
            const caught = pool[idx2];
            log('🎰', `Mystery: ${caught.name}`, 'log-capture');
            doCaptureResult(caught, cb);
          });
        }, 400);
      });
    }, 400);
    return;
  }

  // Standard capture: Tier → Pokémon → Result
  const tw = DATA.balance.captureTierWeights;
  const tierSlices = Object.entries(tw).map(([t, w]) => ({ label: t, weight: w, tier: t }));
  log('🎣', 'Capture! Spinning tier...', 'log-capture');
  setTimeout(() => {
    spinWheel(tierSlices, (idx, slice) => {
      const tier = slice.tier;
      log('🎡', `Tier: ${tier}`, 'log-capture');
      const pool = DATA.byTier[tier];
      const pokeSlices = pool.map(p => ({ label: p.name, weight: 1 }));
      setTimeout(() => {
        spinWheel(pokeSlices, (idx2, slice2) => {
          const caught = pool[idx2];
          log('🎰', `Encounter: ${caught.name}`, 'log-capture');
          doCaptureResult(caught, cb);
        });
      }, 400);
    });
  }, 400);
}

function doCaptureResult(pokemon, cb) {
  const rw = DATA.balance.captureResultWeights;
  const resultSlices = Object.entries(rw).map(([r, w]) => ({ label: r, weight: w }));
  log('🎯', 'Spinning capture result...', 'log-capture');
  setTimeout(() => {
    spinWheel(resultSlices, (idx, slice) => {
      const result = slice.label;
      if (result === 'Fail') {
        log('💨', `Capture failed! ${pokemon.name} escaped.`, 'log-lose');
        setWheelResult(`${pokemon.name} escaped!`);
        cb();
      } else if (result === 'Critical') {
        log('💥', `Critical capture! ${pokemon.name} + battle bonus!`, 'log-crit');
        G.bonuses.criticalBonus = true;
        setWheelResult(`Critical! ${pokemon.name} caught!`);
        addToParty(pokemon, cb);
      } else {
        log('✅', `Success! ${pokemon.name} caught!`, 'log-win');
        setWheelResult(`${pokemon.name} caught!`);
        addToParty(pokemon, cb);
      }
    });
  }, 400);
}

function addToParty(pokemon, cb) {
  if (G.party.length < 6) {
    G.party.push({ ...pokemon });
    log('➕', `${pokemon.name} added to party!`, 'log-capture');
    renderAll();
    cb();
  } else {
    // Party full — spin replacement wheel
    doPartyFullSpin(pokemon, cb);
  }
}

function doPartyFullSpin(newPokemon, cb) {
  const pfw = DATA.balance.partyFullWheel;
  const slices = Object.entries(pfw).map(([k, w]) => ({ label: formatPartyFullLabel(k), weight: w, action: k }));
  log('📦', 'Party full! Spinning decision...', 'log-info');
  const stage = DATA.stages[G.stageIndex];
  setTimeout(() => {
    spinWheel(slices, (idx, slice) => {
      const action = slice.action;
      if (action === 'DiscardNew') {
        log('🗑️', `${newPokemon.name} discarded (party full).`, 'log-info');
        setWheelResult(`${newPokemon.name} discarded!`);
        cb();
      } else if (action === 'ReplaceRandom') {
        const replIdx = Math.floor(Math.random() * G.party.length);
        const removed = G.party[replIdx];
        G.party[replIdx] = { ...newPokemon };
        log('🔄', `Replaced ${removed.name} with ${newPokemon.name} (random).`, 'log-info');
        setWheelResult(`${removed.name} → ${newPokemon.name}`);
        renderAll();
        cb();
      } else { // ReplaceWorstMatchup
        const stageTypes = stage.stageTypes;
        let worstIdx = 0;
        let worstVal = Infinity;
        G.party.forEach((p, i) => {
          const { value } = getPokemonMatchup(p, stageTypes);
          if (value < worstVal) { worstVal = value; worstIdx = i; }
        });
        const removed = G.party[worstIdx];
        G.party[worstIdx] = { ...newPokemon };
        log('🔄', `Replaced worst ${removed.name} with ${newPokemon.name}.`, 'log-info');
        setWheelResult(`${removed.name} → ${newPokemon.name}`);
        renderAll();
        cb();
      }
    });
  }, 400);
}

function formatPartyFullLabel(key) {
  const m = { ReplaceRandom: 'Replace Random', ReplaceWorstMatchup: 'Replace Worst', DiscardNew: 'Discard New' };
  return m[key] || key;
}

// ── Evolve ─────────────────────────────────────────────────────
function doEvolve(cb) {
  const evolvable = G.party.filter(p => p.evolvesTo !== null && p.evolvesTo !== undefined);
  if (evolvable.length === 0) {
    log('❌', 'No evolvable Pokémon in party.', 'log-info');
    setWheelResult('No evolutions available!');
    cb();
    return;
  }

  const stage = DATA.stages[G.stageIndex];
  const stageTypes = stage.stageTypes;

  // Spin: Random evolvable 60, Worst matchup 40
  const slices = [
    { label: 'Random Evolvable', weight: 60, action: 'random' },
    { label: 'Worst Matchup', weight: 40, action: 'worst' },
  ];
  setTimeout(() => {
    spinWheel(slices, (idx, slice) => {
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
        const partyIdx = G.party.findIndex(p => p.dexNumber === target.dexNumber);
        if (partyIdx >= 0) {
          G.party[partyIdx] = { ...evolved };
          log('✨', `${target.name} evolved into ${evolved.name}!`, 'log-evolve');
          setWheelResult(`${target.name} → ${evolved.name}!`);
          renderAll();
        }
      }
      cb();
    });
  }, 400);
}

// ── Find Item ──────────────────────────────────────────────────
function doFindItem(cb) {
  const fw = DATA.balance.findItemWheel;
  const slices = Object.entries(fw).map(([k, w]) => ({ label: k === 'RunningShoes' ? 'Running Shoes' : k, weight: w, item: k }));
  log('🔍', 'Finding an item...', 'log-item');
  setTimeout(() => {
    spinWheel(slices, (idx, slice) => {
      const item = slice.item;
      if (item === 'RunningShoes') {
        G.inventory.RunningShoes = true;
        log('👟', 'Running Shoes found! Extra intermission spin!', 'log-item');
        setWheelResult('Running Shoes!');
      } else {
        G.inventory[item]++;
        log('🎒', `Found ${slice.label}!`, 'log-item');
        setWheelResult(`Found ${slice.label}!`);
      }
      renderAll();
      cb();
    });
  }, 400);
}

// ── Bonus Slot ─────────────────────────────────────────────────
function doBonusSlot(cb) {
  if (G.party.length === 0) {
    log('❌', 'No party members for bonus slot.', 'log-info');
    cb(); return;
  }
  const stage = DATA.stages[G.stageIndex];
  const stageTypes = stage.stageTypes;
  const slices = [
    { label: 'Best Matchup', weight: 40, action: 'best' },
    { label: 'Random Party', weight: 60, action: 'random' },
  ];
  setTimeout(() => {
    spinWheel(slices, (idx, slice) => {
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
      log('⭐', `Bonus slot: ${chosen.name} for next battle!`, 'log-item');
      setWheelResult(`Bonus: ${chosen.name}!`);
      renderAll();
      cb();
    });
  }, 400);
}

// ── Battle Phase ───────────────────────────────────────────────
function setupBattlePhase() {
  const stage = DATA.stages[G.stageIndex];
  G.phase = 'BATTLE';
  setPhaseLabel(stage.stageKind === 'GYM' ? 'Gym Battle' : stage.stageKind === 'E4' ? 'Elite Four' : 'Champion', stage.stageName);
  renderAll();

  // Apply bonuses
  const activeBonuses = [];
  if (G.bonuses.typeShield || G.inventory.TypeShield > 0) {
    if (G.inventory.TypeShield > 0) {
      G.inventory.TypeShield--;
      activeBonuses.push({ label: 'Type Shield', category: 'Shield', value: DATA.balance.typeShieldBonus });
      log('🛡️', `Type Shield auto-used! +${DATA.balance.typeShieldBonus}%`, 'log-item');
    }
  }
  if (G.bonuses.criticalBonus) {
    activeBonuses.push({ label: 'Crit Bonus', category: 'Bonus', value: DATA.balance.criticalBonus });
    log('💥', `Critical bonus applied! +${DATA.balance.criticalBonus}%`, 'log-crit');
    G.bonuses.criticalBonus = false;
  }

  // Bonus slot
  const battleParty = [...G.party];
  if (G.bonuses.bonusSlot) {
    battleParty.push({ ...G.bonuses.bonusSlot, _isBonus: true });
    log('⭐', `Bonus slot active: ${G.bonuses.bonusSlot.name}`, 'log-item');
  }

  // Handle Champion "Mixed" stageTypes
  let stageTypes = stage.stageTypes;
  if (stageTypes.includes('Mixed')) {
    const allTypes = Object.keys(DATA.typeChart);
    stageTypes = [allTypes[Math.floor(Math.random() * allTypes.length)], allTypes[Math.floor(Math.random() * allTypes.length)]];
    log('🌀', `Champion uses: ${stageTypes.join(' / ')}`, 'log-info');
  }

  const { chance, breakdown } = computeWinChance(battleParty, stageTypes, activeBonuses);
  renderBattleBreakdown(breakdown, chance);

  const slices = [
    { label: 'WIN!', weight: chance },
    { label: 'LOSE...', weight: 100 - chance },
  ];
  setWheelResult(`Win chance: ${chance}%`);

  setSpinHandler(() => {
    log('⚔️', `Battle vs ${stage.stageName} (${chance}% win)`, 'log-info');
    spinWheel(slices, (idx, slice) => {
      // Clear bonus slot
      G.bonuses.bonusSlot = null;
      if (slice.label === 'WIN!') {
        log('🏆', `VICTORY vs ${stage.stageName}!`, 'log-win');
        setWheelResult(`Victory! ${stage.badge ? stage.badge + ' earned!' : 'Defeated!'}`);
        advanceStage();
      } else {
        log('💀', `DEFEAT vs ${stage.stageName}...`, 'log-lose');
        setWheelResult('Defeat! Checking items...');
        handleDefeat(stage, stageTypes, activeBonuses, chance);
      }
      renderAll();
    });
  });
}

function handleDefeat(stage, stageTypes, alreadyApplied, origChance) {
  // Auto-consume order: LuckyCharm → Potion → End
  if (G.inventory.LuckyCharm > 0) {
    G.inventory.LuckyCharm--;
    log('🍀', 'Lucky Charm used! Rerolling battle...', 'log-item');
    setTimeout(() => retryBattle(stage, stageTypes, alreadyApplied, origChance, true), 600);
  } else if (G.inventory.Potion > 0) {
    G.inventory.Potion--;
    log('🧪', 'Potion used! Retrying battle...', 'log-item');
    setTimeout(() => retryBattle(stage, stageTypes, alreadyApplied, origChance, false), 600);
  } else {
    // Run ends
    endRun(false, stage.stageName);
  }
}

function retryBattle(stage, stageTypes, alreadyApplied, origChance, isCharm) {
  const { chance, breakdown } = computeWinChance(
    [...G.party, ...(G.bonuses.bonusSlot ? [G.bonuses.bonusSlot] : [])],
    stageTypes,
    []
  );
  renderBattleBreakdown(breakdown, chance);
  const slices = [
    { label: 'WIN!', weight: chance },
    { label: 'LOSE...', weight: 100 - chance },
  ];
  setWheelResult(`Retry! Win chance: ${chance}%`);
  log('🔄', `Retry battle ${chance}%`, 'log-info');
  spinWheel(slices, (idx, slice) => {
    if (slice.label === 'WIN!') {
      log('🏆', `VICTORY on retry vs ${stage.stageName}!`, 'log-win');
      setWheelResult('Victory on retry!');
      advanceStage();
    } else {
      if (!isCharm && G.inventory.Potion > 0) {
        // Try potion
        G.inventory.Potion--;
        log('🧪', 'Potion used! Retrying again...', 'log-item');
        setTimeout(() => retryBattle(stage, stageTypes, [], chance, false), 600);
      } else {
        endRun(false, stage.stageName);
      }
    }
    renderAll();
  });
}

function advanceStage() {
  G.stageIndex++;
  if (G.stageIndex >= DATA.stages.length) {
    // Beat Champion
    endRun(true, 'Champion');
    return;
  }
  G.phase = 'INTERMISSION';
  G.intermissionSpinsLeft = getIntermissionSpins();
  renderAll();
  setTimeout(() => setupIntermissionWheel(), 800);
}

function endRun(win, stageName) {
  G.phase = 'END';
  G.runEnded = true;
  const overlay = document.getElementById('overlay');
  const title = document.getElementById('overlay-title');
  const msg = document.getElementById('overlay-msg');
  overlay.classList.remove('hidden');
  if (win) {
    title.textContent = '🏆 CHAMPION!';
    msg.textContent = `You conquered all of Kanto! Hall of Fame: ${G.party.map(p=>p.name).join(', ')}`;
    log('🏆', 'RUN COMPLETE! You are the Pokémon Champion!', 'log-win');
  } else {
    title.textContent = '💀 RUN OVER';
    msg.textContent = `Defeated by ${stageName}. Better luck next time! Party: ${G.party.map(p=>p.name).join(', ') || 'empty'}`;
    log('💀', `Run ended at: ${stageName}`, 'log-lose');
  }
}

// ── Render ─────────────────────────────────────────────────────
function renderAll() {
  renderParty();
  renderInventory();
  renderStageInfo();
  renderWinChance();
  renderLog();
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

      // Contribution vs current stage
      if (G.stageIndex < DATA.stages.length) {
        const stage = DATA.stages[G.stageIndex];
        let stageTypes = stage.stageTypes.filter(t => t !== 'Mixed');
        if (stageTypes.length === 0) stageTypes = ['Normal'];
        const { category, value } = getPokemonMatchup(p, stageTypes);
        const contEl = document.createElement('div');
        contEl.className = 'slot-contrib';
        contEl.textContent = `+${value} (${category.charAt(0)})`;
        slot.appendChild(contEl);
      }
    } else {
      slot.classList.add('empty');
    }
  });

  // Bonus slot indicator
  if (G.bonuses.bonusSlot && G.phase !== 'END') {
    const bonusDiv = document.createElement('div');
    bonusDiv.style.gridColumn = '1/-1';
    bonusDiv.style.padding = '4px';
    bonusDiv.style.fontFamily = 'var(--pixel-font)';
    bonusDiv.style.fontSize = '0.38rem';
    bonusDiv.style.color = 'var(--accent2)';
    bonusDiv.style.borderTop = '1px solid var(--border)';
    bonusDiv.style.marginTop = '4px';
    bonusDiv.textContent = `⭐ Bonus: ${G.bonuses.bonusSlot.name}`;
    grid.appendChild(bonusDiv);
  }
}

function renderInventory() {
  const list = document.getElementById('inventory-list');
  list.innerHTML = '';
  const items = [
    { key: 'Potion', icon: '🧪', name: 'Potion' },
    { key: 'TypeShield', icon: '🛡️', name: 'Type Shield' },
    { key: 'LuckyCharm', icon: '🍀', name: 'Lucky Charm' },
  ];
  items.forEach(({ key, icon, name }) => {
    const row = document.createElement('div');
    row.className = 'inv-row';
    row.innerHTML = `<span class="inv-name">${icon} ${name}</span><span class="inv-count">×${G.inventory[key]}</span>`;
    list.appendChild(row);
  });
  // Running shoes
  const shoes = document.createElement('div');
  shoes.className = 'inv-row';
  shoes.innerHTML = `<span class="inv-name">👟 Running Shoes</span><span class="inv-permanent">${G.inventory.RunningShoes ? '✓ Active' : '—'}</span>`;
  list.appendChild(shoes);

  // Bonuses
  if (G.bonuses.criticalBonus) {
    const cb = document.createElement('div');
    cb.className = 'inv-row';
    cb.innerHTML = `<span class="inv-name">💥 Crit Bonus</span><span class="inv-permanent">+${DATA.balance.criticalBonus}%</span>`;
    list.appendChild(cb);
  }
}

function renderStageInfo() {
  const info = document.getElementById('stage-info');
  if (G.stageIndex >= DATA.stages.length) {
    info.innerHTML = '<strong>🏆 All stages cleared!</strong>';
    return;
  }
  const stage = DATA.stages[G.stageIndex];
  info.innerHTML = `
    <div><strong>${stage.stageName}</strong></div>
    <div>${stage.stageKind} — ${stage.stageTypes.join(' / ')}</div>
    ${stage.leader ? `<div>Leader: ${stage.leader}</div>` : ''}
    ${stage.badge ? `<div>Badge: ${stage.badge}</div>` : ''}
    <div style="margin-top:4px;color:var(--text2);font-size:0.9em;">${G.stageIndex + 1} / ${DATA.stages.length}</div>
  `;
}

function renderWinChance() {
  if (G.party.length === 0 || G.stageIndex >= DATA.stages.length) {
    document.getElementById('win-chance-pct').textContent = '—%';
    document.getElementById('win-chance-fill').style.width = '0%';
    document.getElementById('battle-breakdown').innerHTML = '';
    return;
  }
  const stage = DATA.stages[G.stageIndex];
  let stageTypes = stage.stageTypes.filter(t => t !== 'Mixed');
  if (stageTypes.length === 0) stageTypes = ['Normal'];
  const battleParty = [...G.party];
  if (G.bonuses.bonusSlot) battleParty.push({ ...G.bonuses.bonusSlot });
  const bonuses = [];
  if (G.inventory.TypeShield > 0) bonuses.push({ label: 'Type Shield', category: 'Shield', value: DATA.balance.typeShieldBonus });
  if (G.bonuses.criticalBonus) bonuses.push({ label: 'Crit Bonus', category: 'Bonus', value: DATA.balance.criticalBonus });
  const { chance, breakdown } = computeWinChance(battleParty, stageTypes, bonuses);
  renderBattleBreakdown(breakdown, chance);
}

function renderBattleBreakdown(breakdown, chance) {
  const pct = document.getElementById('win-chance-pct');
  const fill = document.getElementById('win-chance-fill');
  const bd = document.getElementById('battle-breakdown');
  pct.textContent = `${chance}%`;
  fill.style.width = `${chance}%`;
  // Color the bar
  if (chance >= 70) fill.style.background = 'var(--accent3)';
  else if (chance >= 40) fill.style.background = '#f8d030';
  else fill.style.background = 'var(--accent2)';

  const base = DATA.balance.winModel.baseChance;
  let html = `<div class="contrib-row"><span>Base</span><span class="contrib-vs">+${base}</span></div>`;
  for (const row of breakdown) {
    const cls = row.bonus ? 'contrib-bonus' : 'contrib-vs';
    html += `<div class="contrib-row"><span>${row.name} <small style="color:var(--text2)">(${row.category})</small></span><span class="${cls}">+${row.value}</span></div>`;
  }
  html += `<div class="contrib-row" style="font-family:var(--pixel-font);font-size:0.4rem;border-top:1px solid var(--border);margin-top:4px;padding-top:4px"><span>Total</span><span>${chance}%</span></div>`;
  bd.innerHTML = html;
}

function renderLog() {
  const logEl = document.getElementById('run-log');
  // Already rendered by log() calls; just scroll to bottom
  logEl.scrollTop = logEl.scrollHeight;
}

function log(icon, msg, cls = 'log-info') {
  G.runLog.push({ icon, msg, cls });
  const logEl = document.getElementById('run-log');
  const entry = document.createElement('div');
  entry.className = `log-entry ${cls}`;
  entry.innerHTML = `<span class="log-icon">${icon}</span>${msg}`;
  logEl.appendChild(entry);
  logEl.scrollTop = logEl.scrollHeight;
}

// ── Spin Button Handler ────────────────────────────────────────
let _spinHandler = null;

function setSpinHandler(fn) {
  _spinHandler = fn;
  const btn = document.getElementById('spinBtn');
  btn.disabled = false;
}

function setPhaseLabel(phase, stage) {
  document.getElementById('phase-label').textContent = phase;
  document.getElementById('stage-label').textContent = stage;
}

function setWheelResult(text) {
  document.getElementById('wheel-result-label').textContent = text;
}

document.getElementById('spinBtn').addEventListener('click', () => {
  if (wheelState.spinning || G.runEnded) return;
  if (_spinHandler) {
    document.getElementById('spinBtn').disabled = true;
    _spinHandler();
  }
});

// Re-enable spin button when wheel stops (handled in onDone callbacks mostly)
// But also ensure it re-enables after each sequence
function enableSpinAfterDelay(ms = 200) {
  setTimeout(() => {
    if (!wheelState.spinning && !G.runEnded) {
      document.getElementById('spinBtn').disabled = false;
    }
  }, ms);
}

// ── Dark Mode Toggle ───────────────────────────────────────────
document.getElementById('darkModeToggle').addEventListener('click', () => {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  document.getElementById('darkModeToggle').textContent = next === 'dark' ? '☾' : '☀';
  if (wheelState.slices.length > 0) {
    drawWheel(wheelState.slices, wheelState.angle);
  }
});

// ── Restart ────────────────────────────────────────────────────
function doRestart() {
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('run-log').innerHTML = '';
  document.getElementById('spinBtn').disabled = false;
  _spinHandler = null;
  initGame();
}

document.getElementById('restartBtn').addEventListener('click', doRestart);
document.getElementById('overlay-restart').addEventListener('click', doRestart);

// ── Spin re-enable patch ───────────────────────────────────────
// Wrap spinWheel to re-enable btn after done
const _origSpinWheel = spinWheel;
// patch onDone calls after each chain ends — already handled in callbacks
// We patch the btn enable inside intermission/battle setup via setSpinHandler

// ── Init ───────────────────────────────────────────────────────
(async () => {
  try {
    await loadData();
    initGame();
  } catch (e) {
    console.error('Failed to load data:', e);
    document.body.innerHTML = `
      <div style="padding:32px;font-family:monospace;color:#f00;background:#000;min-height:100vh">
        <h2>⚠️ Error Loading Game Data</h2>
        <p>Could not load JSON data files. If running locally, you need a local server.</p>
        <p>Try: <code>python3 -m http.server 8000</code> then open <code>http://localhost:8000</code></p>
        <p style="color:#888;margin-top:16px">Error: ${e.message}</p>
      </div>
    `;
  }
})();
