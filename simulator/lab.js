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
  if (agentIds.length < 2) throw new Error('Select at least two agents.');
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
    if (key !== 'baseConfig' && values.length === 0) throw new Error(`Missing selection: ${key}`);
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
    $('#estimate').innerHTML = `<strong>${configurations.toLocaleString('en-US')}</strong> configurations · <strong>${matchupOrders.toLocaleString('en-US')}</strong> matchup orders · <strong>${games.toLocaleString('en-US')}</strong> games`;
    $('#warning').textContent = games > 250000 ? 'Very large test. Start with Quick Check instead.' : games > 50000 ? 'Moderately demanding test.' : 'Reasonable scope for a first run.';
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
  if (estimatedGames > 250000 && !confirm(`This test contains ${estimatedGames.toLocaleString('en-US')} games. Run it anyway?`)) return;
  latestResults = [];
  renderResults([]);
  worker?.terminate();
  const workerUrl = new URL('./lab-worker.js', import.meta.url);
  worker = new Worker(workerUrl, { type: 'module' });
  worker.onmessage = handleWorkerMessage;
  worker.onerror = (event) => {
    event.preventDefault();
    const details = [
      event.message || 'The worker could not be loaded.',
      event.filename ? `File: ${event.filename}` : '',
      event.lineno ? `Line: ${event.lineno}` : ''
    ].filter(Boolean).join('\n');
    showError(details);
  };
  worker.onmessageerror = () => showError('The browser could not read the simulator message.');
  setRunningState(true);
  $('#status').textContent = 'Starting…';
  $('#progress').value = 0;
  worker.postMessage({ type: 'start', payload });
}

function handleWorkerMessage(event) {
  const message = event.data;
  if (message.type === 'started') $('#status').textContent = `Running ${message.totals.games.toLocaleString('en-US')} games`;
  if (message.type === 'progress') {
    const percent = message.totalGames ? (message.completedGames / message.totalGames) * 100 : 0;
    $('#progress').value = percent;
    $('#progressText').textContent = `${percent.toFixed(1)} % · configuration ${message.configIndex}/${message.totalConfigurations} · ${message.currentMatchup}`;
  }
  if (message.type === 'configurationComplete') {
    latestResults.push(message.result);
    saveCheckpoint();
    renderResults(latestResults);
  }
  if (message.type === 'complete' || message.type === 'stopped') {
    setRunningState(false);
    $('#status').textContent = message.type === 'complete' ? 'Test complete' : 'Test stopped';
    $('#progressText').textContent = `${message.completedGames.toLocaleString('en-US')} games played`;
  }
  if (message.type === 'error') showError(message.message);
}

function showError(message) {
  setRunningState(false);
  $('#status').textContent = 'Error';
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
  too_many_unresolved_games: 'too many unresolved games',
  games_too_long: 'games are too long',
  first_player_imbalance: 'first-player imbalance',
  no_resolved_games: 'no resolved games'
};

function formatFilter(result) {
  if (result.screening.passed) return '<span class="badge pass">passed</span>';
  const reasons = result.screening.reasons.map((reason) => FILTER_LABELS[reason] ?? reason);
  return `<span class="badge fail">failed</span><div class="filter-reasons">${reasons.join('<br>')}</div>`;
}

function describeConfig(config) {
  return `${config.boardSize}×${config.boardSize} · ${config.symbolCount} symbols · queue ${config.queueSize} · ${config.sharedQueueEnabled ? 'shared' : 'separate'}`;
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
  $('#bestDetails').innerHTML = `Unresolved <strong>${(best.aggregate.unresolved * 100).toFixed(1)} %</strong> · average <strong>${best.aggregate.turns.toFixed(1)} turns</strong> · P1 <strong>${best.aggregate.p1 === null ? '—' : `${(best.aggregate.p1 * 100).toFixed(1)} %`}</strong>`;
  $('#bestLead').textContent = second
    ? `Lead over second place: ${lead.toFixed(1)} points.`
    : 'Run at least two configurations for comparison.';
  $('#scoreBreakdown').textContent = `Component scores: completion ${score.unresolvedScore.toFixed(1)} · length ${score.lengthScore.toFixed(1)} · fairness ${score.fairnessScore.toFixed(1)}`;
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
      <td>${c.sharedQueueEnabled ? 'shared' : 'separate'}</td><td>${c.bottomInsertionEnabled ? 'yes' : 'no'}</td>
      <td>${(a.unresolved * 100).toFixed(1)} %</td><td>${a.turns.toFixed(1)}</td><td>${a.cascades.toFixed(2)}</td>
      <td>${a.p1 === null ? '—' : `${(a.p1 * 100).toFixed(1)} %`}</td><td>${(a.scoring * 100).toFixed(1)} %</td>
      <td>${formatFilter(result)}</td>`;
    body.appendChild(row);
  });
  renderRecommendation(ranked);
  $('#resultCount').textContent = `${results.length} completed configurations`;
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
      $('#status').textContent = `Loaded latest result (${latestResults.length} configurations)`;
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
  $('#pauseBtn').textContent = pausedNow ? 'Pause' : 'Resume';
  $('#status').textContent = pausedNow ? 'Test running' : 'Test paused';
});
$('#stopBtn').addEventListener('click', () => worker?.postMessage({ type: 'stop' }));
$('#exportJson').addEventListener('click', () => download('project-shift-balance-lab.json', JSON.stringify(latestResults, null, 2), 'application/json'));
$('#exportCsv').addEventListener('click', exportCsv);
$('#clearResults').addEventListener('click', () => { latestResults = []; localStorage.removeItem('projectShiftBalanceLabResults'); renderResults([]); });
$$('input, select').forEach((element) => element.addEventListener('change', estimate));
$$('.score-setting').forEach((element) => element.addEventListener('change', () => { saveBalanceScoreConfig(); renderResults(latestResults); }));
