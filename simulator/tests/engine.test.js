import assert from "node:assert/strict";
import { applyGravity, applyMove, calculateGroupsReward, createInitialState, findMatchGroups } from "../engine.js";
import { createSeededRandom } from "../random.js";

function testStartingBoardHasNoMatches() {
    for (let seed = 1; seed <= 100; seed++) {
        const state = createInitialState({}, createSeededRandom(seed));
        assert.equal(findMatchGroups(state.board).length, 0);
    }
}

function testMatchRewards() {
    assert.equal(calculateGroupsReward([{ length: 3 }, { length: 4 }, { length: 5 }]), 6);
}

function testCrossScoresAsTwoGroups() {
    const board = [
        [null, 1, null, null, null],
        [1, 1, 1, null, null],
        [null, 1, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null]
    ];
    const groups = findMatchGroups(board);
    assert.equal(groups.length, 2);
    assert.equal(calculateGroupsReward(groups), 2);
}

function testGravity() {
    const board = [
        [null, null, null, null, null],
        [1, null, null, null, null],
        [null, null, null, null, null],
        [2, null, null, null, null],
        [3, null, null, null, null]
    ];
    applyGravity(board);
    assert.deepEqual(board.map((row) => row[0]), [null, null, 1, 2, 3]);
}

function testMoveDoesNotMutateOriginal() {
    const random = createSeededRandom(42);
    const state = createInitialState({}, random);
    const before = JSON.stringify(state);
    applyMove(state, { direction: "left", index: 0 }, random);
    assert.equal(JSON.stringify(state), before);
}

testStartingBoardHasNoMatches();
testMatchRewards();
testCrossScoresAsTwoGroups();
testGravity();
testMoveDoesNotMutateOriginal();
console.log("Simulator engine tests: OK");
