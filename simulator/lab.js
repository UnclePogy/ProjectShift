import { rankBalanceResults } from './balance-score.js';
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const CORE_AGENTS = [
  ['aggressive', 'Aggressive'], ['blocker', 'Blocker'], ['builder', 'Builder'],
  ['balanced', 'Balanced'], ['opportunist', 'Opportunist'], ['human-like', 'Human-like']
];
const FAMILIES = ['aggressive', 'defensive', 'builder', 'balanced', 'human'];

let worker = null;
let latestResults = [];
let running = false;

function getBalanceScoreConfig() {
  return {
    unresolvedWeight: Number($('#scoreUnresolvedWeight').value) / 100,
    lengthWeight: Number($('#scoreLengthWeight').value) / 100,
    fairnessWeight: Number($('#scoreFairnessWeight').value) / 100,
    targetTurns: Number($('#scoreTargetTurns').value),
    pointsLostPerTurn: Number($('#scoreTurnPenalty').value)
  };
}

function saveBalanceScoreConfig() {
  localStorage.setItem('projectShiftBalanceScoreConfig', JSON.stringify(getBalanceScoreConfig()));
}

function restoreBalanceScoreConfig() {
  try {
    const config = JSON.parse(localStorage.getItem('projectShiftBalanceScoreConfig'));
    if (!config) return;
    $('#scoreUnresolvedWeight').value = Math.round((config.unresolvedWeight ?? 0.5) * 100);
    $('#scoreLengthWeight').value = Math.round((config.lengthWeight ?? 0.3) * 100);
    $('#scoreFairnessWeight').value = Math.round((config.fairnessWeight ?? 0.2) * 100);
    $('#scoreTargetTurns').value = config.targetTurns ?? 70;
    $('#scoreTurnPenalty').value = config.pointsLostPerTurn ?? 1;
  } catch { /* ignore invalid local data */ }
}

function selectedValues(name, parser = (value) => value) {
  return $$(`input[name="${name}"]:checked`).map((input) => parser(input.value));
}

function populationIds(perFamily) {
  return FAMILIES.flatMap((family) => Array.from({ length: perFamily }, (_, index) => `${family}-${String(index + 1).padStart(2, '0')}`));
}

function selectedAgentIds() {
  if ($('#agentSet').value === 'population20') return populationIds(Number($('#perFamily').value));
  return selectedValues('agents');
}

function buildPayload() {
  const agentIds = selectedAgentIds();
  if (agentIds.length < 2) throw new Error('Vyber alespoň dva agenty.');
  const matrix = {
    boardSizes: selectedValues('boardSizes', Number),
    symbolCounts: selectedValues('symbolCounts', Number),
    queueSizes: selectedValues('queueSizes', Number),
    sharedQueueModes: selectedValues('sharedQueueModes', (v) => v === 'true'),
    topInsertionModes: [$('#topInsertion').checked],
    bottomInsertionModes: selectedValues('bottomInsertionModes', (v) => v === 'true'),
    startingScores: selectedValues('startingScores', Number),
    baseConfig: {
      maxTurns: Number($('#maxTurns').value),
      noScoreTurnLimit: Number($('#noScoreLimit').value),
      repetitionLimit: Number($('#repetitionLimit').value)
    }
  };
  for (const [key, values] of Object.entries(matrix)) {
    if (key !== 'baseConfig' && values.length === 0) throw new Error(`Chybí volba: ${key}`);
  }
  return {
    seed: Number($('#seed').value),
    gamesPerOrder: Number($('#gamesPerOrder').value),
    includeMirrors: $('#includeMirrors').checked,
    agentSet: $('#agentSet').value,
    perFamily: Number($('#perFamily').value),
    agentIds,
    matrix,
    filters: {
      maxAverageUnresolvedRate: Number($('#maxUnresolved').value) / 100,
      maxAverageTurns: Number($('#filterMaxTurns').value),
      maxFirstPlayerDeviation: Number($('#maxP1Deviation').value) / 100
    }
  };
}

function countProduct(arrays) {
  return arrays.reduce((product, values) => product * values.length, 1);
}

function estimate() {
  try {
    const payload = buildPayload();
    const m = payload.matrix;
    const configurations = countProduct([
      m.boardSizes, m.symbolCounts, m.queueSizes, m.sharedQueueModes,
      m.topInsertionModes, m.bottomInsertionModes, m.startingScores
    ]);
    const n = payload.agentIds.length;
    const matchupOrders = payload.includeMirrors ? n * n : n * (n - 1);
    const games = configurations * matchupOrders * payload.gamesPerOrder;
    $('#estimate').innerHTML = `<strong>${configurations.toLocaleString('cs-CZ')}</strong> konfigurací · <strong>${matchupOrders.toLocaleString('cs-CZ')}</strong> pořadí matchupů · <strong>${games.toLocaleString('cs-CZ')}</strong> partií`;
    $('#warning').textContent = games > 250000 ? 'Velmi velký test. Začni raději rychlým režimem.' : games > 50000 ? 'Středně náročný test.' : 'Rozumný rozsah pro první spuštění.';
    $('#warning').className = games > 250000 ? 'warning danger' : games > 50000 ? 'warning caution' : 'warning ok';
    return games;
  } catch (error) {
    $('#estimate').textContent = error.message;
    return 0;
  }
}

function applyPreset(name) {
  const presets = {
    quick: { games: 2, set: 'core', mirrors: false, symbols: [8], boards: [5], queues: [2], shared: ['false'], bottom: ['false'] },
    screening: { games: 10, set: 'core', mirrors: true, symbols: [6,7,8,9,10,11,12], boards: [4,5,6], queues: [1,2,3], shared: ['false','true'], bottom: ['false','true'] },
    candidates: { games: 20, set: 'population20', mirrors: true, symbols: [7,8,9], boards: [5], queues: [2,3], shared: ['false','true'], bottom: ['false','true'] }
  };
  const preset = presets[name];
  $('#gamesPerOrder').value = preset.games;
  $('#agentSet').value = preset.set;
  $('#includeMirrors').checked = preset.mirrors;
  setChecks('symbolCounts', preset.symbols.map(String));
  setChecks('boardSizes', preset.boards.map(String));
  setChecks('queueSizes', preset.queues.map(String));
  setChecks('sharedQueueModes', preset.shared);
  setChecks('bottomInsertionModes', preset.bottom);
  updateAgentMode();
  estimate();
}

function setChecks(name, values) {
  $$(`input[name="${name}"]`).forEach((input) => { input.checked = values.includes(input.value); });
}

function updateAgentMode() {
  const population = $('#agentSet').value === 'population20';
  $('#coreAgents').hidden = population;
  $('#populationOptions').hidden = !population;
  estimate();
}

function setRunningState(isRunning) {
  running = isRunning;
  $('#startBtn').disabled = isRunning;
  $('#pauseBtn').disabled = !isRunning;
  $('#stopBtn').disabled = !isRunning;
}

function startRun() {
  const payload = buildPayload();
  const estimatedGames = estimate();
  if (estimatedGames > 250000 && !confirm(`Test obsahuje ${estimatedGames.toLocaleString('cs-CZ')} partií. Opravdu ho spustit?`)) return;
  latestResults = [];
  renderResults([]);
  worker?.terminate();
  const workerUrl = new URL('./lab-worker.js', import.meta.url);
  worker = new Worker(workerUrl, { type: 'module' });
  worker.onmessage = handleWorkerMessage;
  worker.onerror = (event) => {
    event.preventDefault();
    const details = [
      event.message || 'Worker se nepodařilo načíst.',
      event.filename ? `Soubor: ${event.filename}` : '',
      event.lineno ? `Řádek: ${event.lineno}` : ''
    ].filter(Boolean).join('\n');
    showError(details);
  };
  worker.onmessageerror = () => showError('Prohlížeč nedokázal přečíst zprávu ze simulátoru.');
  setRunningState(true);
  $('#status').textContent = 'Spouštím…';
  $('#progress').value = 0;
  worker.postMessage({ type: 'start', payload });
}

function handleWorkerMessage(event) {
  const message = event.data;
  if (message.type === 'started') $('#status').textContent = `Běží ${message.totals.games.toLocaleString('cs-CZ')} partií`;
  if (message.type === 'progress') {
    const percent = message.totalGames ? (message.completedGames / message.totalGames) * 100 : 0;
    $('#progress').value = percent;
    $('#progressText').textContent = `${percent.toFixed(1)} % · konfigurace ${message.configIndex}/${message.totalConfigurations} · ${message.currentMatchup}`;
  }
  if (message.type === 'configurationComplete') {
    latestResults.push(message.result);
    saveCheckpoint();
    renderResults(latestResults);
  }
  if (message.type === 'complete' || message.type === 'stopped') {
    setRunningState(false);
    $('#status').textContent = message.type === 'complete' ? 'Test dokončen' : 'Test zastaven';
    $('#progressText').textContent = `${message.completedGames.toLocaleString('cs-CZ')} odehraných partií`;
  }
  if (message.type === 'error') showError(message.message);
}

function showError(message) {
  setRunningState(false);
  $('#status').textContent = 'Chyba';
  alert(message);
}

function aggregateConfig(result) {
  const summaries = result.matchups.map((m) => m.summary);
  const totalGames = summaries.reduce((sum, s) => sum + s.games, 0);
  const unresolvedGames = summaries.reduce((sum, s) => sum + s.winnerCounts.unresolved, 0);
  const resolvedGames = summaries.reduce((sum, s) => sum + s.resolvedGames, 0);
  const player1Wins = summaries.reduce((sum, s) => sum + s.winnerCounts.player1, 0);
  const weightedAverage = (selector) => totalGames
    ? summaries.reduce((sum, s) => sum + selector(s) * s.games, 0) / totalGames
    : 0;

  return {
    unresolved: totalGames ? unresolvedGames / totalGames : 0,
    turns: weightedAverage((s) => s.turns.average),
    cascades: weightedAverage((s) => s.averagesPerGame.cascades),
    p1: resolvedGames ? player1Wins / resolvedGames : null,
    scoring: weightedAverage((s) => s.decisionQuality.chosenScoringRate),
    resolvedGames,
    totalGames
  };
}

const FILTER_LABELS = {
  too_many_unresolved_games: 'moc nedokončených her',
  games_too_long: 'příliš dlouhé partie',
  first_player_imbalance: 'nerovnováha začínajícího hráče',
  no_resolved_games: 'žádná dokončená hra'
};

function formatFilter(result) {
  if (result.screening.passed) return '<span class="badge pass">prošlo</span>';
  const reasons = result.screening.reasons.map((reason) => FILTER_LABELS[reason] ?? reason);
  return `<span class="badge fail">neprošlo</span><div class="filter-reasons">${reasons.join('<br>')}</div>`;
}

function describeConfig(config) {
  return `${config.boardSize}×${config.boardSize} · ${config.symbolCount} kamenů · fronta ${config.queueSize} · ${config.sharedQueueEnabled ? 'společná' : 'oddělená'}`;
}

function rankedResults(results) {
  const entries = results.map((result) => {
    const aggregate = aggregateConfig(result);
    return {
      result,
      aggregate,
      metrics: {
        unresolvedRate: aggregate.unresolved,
        averageTurns: aggregate.turns,
        firstPlayerWinRateResolved: aggregate.p1
      }
    };
  });
  return rankBalanceResults(entries, getBalanceScoreConfig());
}

function renderRecommendation(ranked) {
  const panel = $('#balanceSummary');
  if (!ranked.length) {
    panel.hidden = true;
    return;
  }

  panel.hidden = false;
  const best = ranked[0];
  const second = ranked[1];
  const lead = second ? best.balanceScore.total - second.balanceScore.total : 0;
  const score = best.balanceScore;
  $('#bestConfig').textContent = describeConfig(best.result.config);
  $('#bestScore').textContent = score.total.toFixed(1);
  $('#bestDetails').innerHTML = `Nedokončeno <strong>${(best.aggregate.unresolved * 100).toFixed(1)} %</strong> · průměr <strong>${best.aggregate.turns.toFixed(1)} tahů</strong> · P1 <strong>${best.aggregate.p1 === null ? '—' : `${(best.aggregate.p1 * 100).toFixed(1)} %`}</strong>`;
  $('#bestLead').textContent = second
    ? `Náskok před druhým místem: ${lead.toFixed(1)} bodu.`
    : 'Pro srovnání spusť alespoň dvě konfigurace.';
  $('#scoreBreakdown').textContent = `Dílčí skóre: dokončení ${score.unresolvedScore.toFixed(1)} · délka ${score.lengthScore.toFixed(1)} · férovost ${score.fairnessScore.toFixed(1)}`;
}

function renderResults(results) {
  const body = $('#resultsBody');
  body.innerHTML = '';
  const ranked = rankedResults(results);
  ranked.forEach((entry, index) => {
    const { result, aggregate: a, balanceScore } = entry;
    const c = result.config;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${index + 1}.</strong></td><td><strong>${balanceScore.total.toFixed(1)}</strong></td>
      <td>${c.boardSize}×${c.boardSize}</td><td>${c.symbolCount}</td><td>${c.queueSize}</td>
      <td>${c.sharedQueueEnabled ? 'společná' : 'oddělená'}</td><td>${c.bottomInsertionEnabled ? 'ano' : 'ne'}</td>
      <td>${(a.unresolved * 100).toFixed(1)} %</td><td>${a.turns.toFixed(1)}</td><td>${a.cascades.toFixed(2)}</td>
      <td>${a.p1 === null ? '—' : `${(a.p1 * 100).toFixed(1)} %`}</td><td>${(a.scoring * 100).toFixed(1)} %</td>
      <td>${formatFilter(result)}</td>`;
    body.appendChild(row);
  });
  renderRecommendation(ranked);
  $('#resultCount').textContent = `${results.length} dokončených konfigurací`;
  $('#exportJson').disabled = !results.length;
  $('#exportCsv').disabled = !results.length;
}

function saveCheckpoint() {
  localStorage.setItem('projectShiftBalanceLabResults', JSON.stringify({ savedAt: new Date().toISOString(), results: latestResults }));
}

function restoreCheckpoint() {
  try {
    const stored = JSON.parse(localStorage.getItem('projectShiftBalanceLabResults'));
    if (stored?.results?.length) {
      latestResults = stored.results;
      renderResults(latestResults);
      $('#status').textContent = `Načten poslední výsledek (${latestResults.length} konfigurací)`;
    }
  } catch { /* ignore invalid local data */ }
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportCsv() {
  const header = ['rank','balanceScore','boardSize','symbolCount','queueSize','queueMode','bottomInsertion','unresolvedRate','averageTurns','cascades','firstPlayerWinRateResolved','chosenScoringRate','passed','filterReasons'];
  const rows = rankedResults(latestResults).map((entry, index) => {
    const { result, aggregate: a, balanceScore } = entry; const c = result.config;
    return [index + 1,balanceScore.total,c.boardSize,c.symbolCount,c.queueSize,c.sharedQueueEnabled?'shared':'separate',c.bottomInsertionEnabled,a.unresolved,a.turns,a.cascades,a.p1 ?? '',a.scoring,result.screening.passed,result.screening.reasons.join('|')];
  });
  download('project-shift-balance-lab.csv', [header, ...rows].map((row) => row.join(',')).join('\n'), 'text/csv');
}

function initializeAgents() {
  $('#coreAgents').innerHTML = CORE_AGENTS.map(([id, name]) => `<label class="chip"><input type="checkbox" name="agents" value="${id}" checked> ${name}</label>`).join('');
}

initializeAgents();
restoreBalanceScoreConfig();
restoreCheckpoint();
updateAgentMode();
estimate();

$('#agentSet').addEventListener('change', updateAgentMode);
$('#presetQuick').addEventListener('click', () => applyPreset('quick'));
$('#presetScreening').addEventListener('click', () => applyPreset('screening'));
$('#presetCandidates').addEventListener('click', () => applyPreset('candidates'));
$('#startBtn').addEventListener('click', () => {
  try {
    startRun();
  } catch (error) {
    showError(error?.message || String(error));
  }
});
$('#pauseBtn').addEventListener('click', () => {
  const pausedNow = $('#pauseBtn').dataset.paused === 'true';
  worker?.postMessage({ type: pausedNow ? 'resume' : 'pause' });
  $('#pauseBtn').dataset.paused = String(!pausedNow);
  $('#pauseBtn').textContent = pausedNow ? 'Pozastavit' : 'Pokračovat';
  $('#status').textContent = pausedNow ? 'Test pokračuje' : 'Test pozastaven';
});
$('#stopBtn').addEventListener('click', () => worker?.postMessage({ type: 'stop' }));
$('#exportJson').addEventListener('click', () => download('project-shift-balance-lab.json', JSON.stringify(latestResults, null, 2), 'application/json'));
$('#exportCsv').addEventListener('click', exportCsv);
$('#clearResults').addEventListener('click', () => { latestResults = []; localStorage.removeItem('projectShiftBalanceLabResults'); renderResults([]); });
$$('input, select').forEach((element) => element.addEventListener('change', estimate));
$$('.score-setting').forEach((element) => element.addEventListener('change', () => { saveBalanceScoreConfig(); renderResults(latestResults); }));
