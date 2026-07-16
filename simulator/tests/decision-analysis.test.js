import assert from "node:assert/strict";
import { analyzeImmediateChoices, findEvaluatedMove } from "../decision-analysis.js";
import { createInitialState } from "../engine.js";
import { createSeededRandom } from "../random.js";

const state = createInitialState({}, createSeededRandom(123));
const analysis = analyzeImmediateChoices(state);

assert.equal(analysis.legalMoves, 15);
assert.equal(analysis.scoringMoves + analysis.zeroRewardMoves, analysis.legalMoves);
assert.ok(analysis.bestMoveCount >= 1);
assert.ok(analysis.nearBestMoveCount >= analysis.bestMoveCount);
assert.ok(analysis.distinctRewardValues >= 1);
assert.ok(findEvaluatedMove(analysis, { direction: "left", index: 0 }));

console.log("Decision analysis tests: OK");
