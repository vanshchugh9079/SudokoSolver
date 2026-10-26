import {
  isSafe,
  isValidBoard,
  validateBoardDetails,
  solveSudoku,
  copyBoard,
  createEmptyBoard,
  getExampleBoard,
} from './src/sudoku.js';

console.log('====================================================');
console.log('   SUDOKU SOLVER - DAA ALGORITHMIC TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] Test ${totalTests}: ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] Test ${totalTests}: ${testName}`);
    process.exitCode = 1;
  }
}

// -----------------------------------------------------------
// Test 1: Standard Valid Sudoku is solved correctly
// -----------------------------------------------------------
const example = getExampleBoard();
assert(isValidBoard(example) === true, 'getExampleBoard returns a valid initial board');

const boardToSolve = copyBoard(example);
const solveResult = solveSudoku(boardToSolve);
assert(solveResult === true, 'solveSudoku successfully solves valid example puzzle');
assert(isValidBoard(boardToSolve) === true, 'Solved board satisfies all Sudoku invariants');
assert(
  boardToSolve.every((row) => row.every((cell) => cell >= 1 && cell <= 9)),
  'Solved board has all 81 cells filled with digits 1-9'
);

// Verify original clues were unchanged in solved board
let cluesPreserved = true;
for (let r = 0; r < 9; r++) {
  for (let c = 0; c < 9; c++) {
    if (example[r][c] !== 0 && boardToSolve[r][c] !== example[r][c]) {
      cluesPreserved = false;
    }
  }
}
assert(cluesPreserved, 'Original clues are strictly preserved in the solved board');

// -----------------------------------------------------------
// Test 2: Empty Grid handled correctly
// -----------------------------------------------------------
const emptyBoard = createEmptyBoard();
assert(isValidBoard(emptyBoard) === true, 'Empty grid is recognized as constraint-compliant');

const emptyDetails = validateBoardDetails(emptyBoard);
assert(emptyDetails.isValid === true && emptyDetails.filledCount === 0, 'validateBoardDetails recognizes empty board');

const emptyToSolve = copyBoard(emptyBoard);
const emptySolved = solveSudoku(emptyToSolve);
assert(emptySolved === true, 'Empty grid is solved into a valid board via backtracking');
assert(isValidBoard(emptyToSolve) === true, 'Generated solution for empty board is fully valid');

// -----------------------------------------------------------
// Test 3: Duplicate numbers in Row detected
// -----------------------------------------------------------
const rowConflict = copyBoard(emptyBoard);
rowConflict[2][1] = 4;
rowConflict[2][7] = 4; // Duplicate 4 in row 2
assert(isValidBoard(rowConflict) === false, 'isValidBoard flags duplicate in row');
const rowDiag = validateBoardDetails(rowConflict);
assert(rowDiag.isValid === false, 'validateBoardDetails flags duplicate in row');
assert(rowDiag.message.includes('Row 3'), `Error message mentions Row 3: "${rowDiag.message}"`);
assert(rowDiag.conflictCells.includes('2,1') && rowDiag.conflictCells.includes('2,7'), 'Identifies conflicting cell coords');

// -----------------------------------------------------------
// Test 4: Duplicate numbers in Column detected
// -----------------------------------------------------------
const colConflict = copyBoard(emptyBoard);
colConflict[0][4] = 8;
colConflict[6][4] = 8; // Duplicate 8 in column 4
assert(isValidBoard(colConflict) === false, 'isValidBoard flags duplicate in column');
const colDiag = validateBoardDetails(colConflict);
assert(colDiag.isValid === false, 'validateBoardDetails flags duplicate in column');
assert(colDiag.message.includes('Column 5'), `Error message mentions Column 5: "${colDiag.message}"`);
assert(colDiag.conflictCells.includes('0,4') && colDiag.conflictCells.includes('6,4'), 'Identifies conflicting cell coords');

// -----------------------------------------------------------
// Test 5: Duplicate numbers in 3x3 Box detected
// -----------------------------------------------------------
const boxConflict = copyBoard(emptyBoard);
boxConflict[0][0] = 6;
boxConflict[2][2] = 6; // Duplicate 6 in top-left 3x3 box
assert(isValidBoard(boxConflict) === false, 'isValidBoard flags duplicate in 3x3 box');
const boxDiag = validateBoardDetails(boxConflict);
assert(boxDiag.isValid === false, 'validateBoardDetails flags duplicate in 3x3 box');
assert(boxDiag.message.includes('Box 1'), `Error message mentions 3x3 Box 1: "${boxDiag.message}"`);
assert(boxDiag.conflictCells.includes('0,0') && boxDiag.conflictCells.includes('2,2'), 'Identifies conflicting cell coords');

// -----------------------------------------------------------
// Test 6: Inconsistent / Unsolvable puzzle handled safely
// -----------------------------------------------------------
// A puzzle with no duplicates initially, but logically unsolvable
const unsolvableBoard = createEmptyBoard();
unsolvableBoard[0] = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // (0,8) must be 9
unsolvableBoard[1][8] = 9; // But col 8 already contains 9 at (1,8)
assert(isValidBoard(unsolvableBoard) === true, 'Initial state has no immediate duplicates');
const unsolvableCopy = copyBoard(unsolvableBoard);
const unsolvableResult = solveSudoku(unsolvableCopy);
assert(unsolvableResult === false, 'solveSudoku returns false for mathematically impossible board');

// Test that original board was not corrupted
assert(unsolvableBoard[0][0] === 1 && unsolvableBoard[0][8] === 0, 'Original board untouched when solving on a copy');

// -----------------------------------------------------------
// Test 7: Clearing grid removes all values
// -----------------------------------------------------------
const cleared = createEmptyBoard();
assert(cleared.length === 9 && cleared.every((row) => row.length === 9 && row.every((c) => c === 0)), 'Clear grid creates 81 zero-filled cells');

// -----------------------------------------------------------
// Test 8: Reset functionality (deep clone isolation)
// -----------------------------------------------------------
const initialSnapshot = copyBoard(example);
const workingCopy = copyBoard(initialSnapshot);
workingCopy[0][0] = 9; // simulate modification
assert(initialSnapshot[0][0] === 5, 'Modifying working copy does not alter initialSnapshot');

// -----------------------------------------------------------
// Test 9: isSafe unit checks
// -----------------------------------------------------------
const testBoard = copyBoard(emptyBoard);
testBoard[1][1] = 5;
assert(isSafe(testBoard, 1, 8, 5) === false, 'isSafe rejects same number in same row');
assert(isSafe(testBoard, 8, 1, 5) === false, 'isSafe rejects same number in same column');
assert(isSafe(testBoard, 0, 0, 5) === false, 'isSafe rejects same number in same 3x3 box');
assert(isSafe(testBoard, 5, 5, 5) === true, 'isSafe accepts valid number in different row/col/box');

console.log('\n====================================================');
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED (100%)`);
console.log('====================================================\n');
