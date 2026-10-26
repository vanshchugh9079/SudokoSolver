/**
 * Sudoku Solver Core Algorithmic Module
 * 
 * College DAA (Design and Analysis of Algorithms) Project
 * Topic: Backtracking Algorithm
 *
 * Implements:
 * - isSafe: Constraint checking across row, column, and 3x3 subgrid
 * - isValidBoard: Verifies complete board against Sudoku rules
 * - validateBoardDetails: Returns detailed diagnostic feedback and conflict cell positions
 * - solveSudoku: Standard recursive Backtracking solver
 * - createEmptyBoard: Generates a blank 9x9 matrix initialized with zeros
 * - getExampleBoard: Returns a known valid, solvable 9x9 puzzle
 * - copyBoard: Deep clones a 9x9 board to preserve original input
 */

/**
 * Checks whether it is safe to place `num` at `board[row][col]`.
 * 
 * Algorithmic Constraints:
 * 1. Row Constraint: `num` must not already appear in row `row`.
 * 2. Column Constraint: `num` must not already appear in column `col`.
 * 3. Box Constraint: `num` must not already appear in the 3x3 subgrid.
 *
 * @param {number[][]} board - 9x9 2D array representing the board
 * @param {number} row - Row index (0-8)
 * @param {number} col - Column index (0-8)
 * @param {number} num - Candidate number to place (1-9)
 * @returns {boolean} True if the placement is safe, false otherwise
 */
export function isSafe(board, row, col, num) {
  // 1. Check Row Constraint
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) {
      return false;
    }
  }

  // 2. Check Column Constraint
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) {
      return false;
    }
  }

  // 3. Check 3x3 Subgrid / Box Constraint
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const currRow = startRow + r;
      const currCol = startCol + c;
      if ((currRow !== row || currCol !== col) && board[currRow][currCol] === num) {
        return false;
      }
    }
  }

  // All constraints satisfied
  return true;
}

/**
 * Validates the entire board for any rule violations.
 * Empty cells (0) are permitted and ignored during uniqueness checks.
 *
 * @param {number[][]} board - 9x9 2D array
 * @returns {boolean} True if the board has no duplicate numbers in any row, column, or 3x3 box
 */
export function isValidBoard(board) {
  if (!board || !Array.isArray(board) || board.length !== 9) {
    return false;
  }

  for (let r = 0; r < 9; r++) {
    if (!Array.isArray(board[r]) || board[r].length !== 9) {
      return false;
    }
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (typeof val !== 'number' || !Number.isInteger(val) || val < 0 || val > 9) {
        return false;
      }
    }
  }

  // Check row uniqueness
  for (let r = 0; r < 9; r++) {
    const seen = new Set();
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val !== 0) {
        if (seen.has(val)) return false;
        seen.add(val);
      }
    }
  }

  // Check column uniqueness
  for (let c = 0; c < 9; c++) {
    const seen = new Set();
    for (let r = 0; r < 9; r++) {
      const val = board[r][c];
      if (val !== 0) {
        if (seen.has(val)) return false;
        seen.add(val);
      }
    }
  }

  // Check 3x3 subgrid uniqueness
  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const seen = new Set();
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const val = board[boxRow + r][boxCol + c];
          if (val !== 0) {
            if (seen.has(val)) return false;
            seen.add(val);
          }
        }
      }
    }
  }

  return true;
}

/**
 * Detailed board validator that identifies specific constraint violations and conflicting cells.
 * Useful for displaying precise diagnostic messages and highlighting conflicting cells in the UI.
 *
 * @param {number[][]} board - 9x9 2D array
 * @returns {{ isValid: boolean, message: string, conflictCells: string[], filledCount: number }}
 */
export function validateBoardDetails(board) {
  if (!board || !Array.isArray(board) || board.length !== 9) {
    return {
      isValid: false,
      message: 'Invalid board structure: Expected a 9x9 grid.',
      conflictCells: [],
      filledCount: 0,
    };
  }

  let filledCount = 0;
  const conflictSet = new Set();
  const errors = [];

  // 1. Check data types and ranges
  for (let r = 0; r < 9; r++) {
    if (!Array.isArray(board[r]) || board[r].length !== 9) {
      return {
        isValid: false,
        message: `Row ${r + 1} is invalid. Expected 9 cells.`,
        conflictCells: [],
        filledCount,
      };
    }
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (typeof val !== 'number' || !Number.isInteger(val) || val < 0 || val > 9) {
        conflictSet.add(`${r},${c}`);
        errors.push(`Cell (Row ${r + 1}, Col ${c + 1}) contains invalid value "${val}".`);
      } else if (val > 0) {
        filledCount++;
      }
    }
  }

  // 2. Check Rows
  for (let r = 0; r < 9; r++) {
    const seen = new Map();
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val !== 0) {
        if (seen.has(val)) {
          const prevCol = seen.get(val);
          conflictSet.add(`${r},${prevCol}`);
          conflictSet.add(`${r},${c}`);
          errors.push(`Duplicate number ${val} in Row ${r + 1} (Columns ${prevCol + 1} and ${c + 1}).`);
        } else {
          seen.set(val, c);
        }
      }
    }
  }

  // 3. Check Columns
  for (let c = 0; c < 9; c++) {
    const seen = new Map();
    for (let r = 0; r < 9; r++) {
      const val = board[r][c];
      if (val !== 0) {
        if (seen.has(val)) {
          const prevRow = seen.get(val);
          conflictSet.add(`${prevRow},${c}`);
          conflictSet.add(`${r},${c}`);
          errors.push(`Duplicate number ${val} in Column ${c + 1} (Rows ${prevRow + 1} and ${r + 1}).`);
        } else {
          seen.set(val, r);
        }
      }
    }
  }

  // 4. Check 3x3 Boxes
  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const seen = new Map();
      const boxNumber = Math.floor(boxRow / 3) * 3 + Math.floor(boxCol / 3) + 1;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const currR = boxRow + r;
          const currC = boxCol + c;
          const val = board[currR][currC];
          if (val !== 0) {
            if (seen.has(val)) {
              const prev = seen.get(val);
              conflictSet.add(`${prev.r},${prev.c}`);
              conflictSet.add(`${currR},${currC}`);
              errors.push(`Duplicate number ${val} in 3×3 Box ${boxNumber} (Cells (${prev.r + 1}, ${prev.c + 1}) and (${currR + 1}, ${currC + 1})).`);
            } else {
              seen.set(val, { r: currR, c: currC });
            }
          }
        }
      }
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      message: errors[0], // Return the first primary error message
      conflictCells: Array.from(conflictSet),
      filledCount,
    };
  }

  if (filledCount === 0) {
    return {
      isValid: true,
      message: 'Grid is empty. No constraint violations found.',
      conflictCells: [],
      filledCount: 0,
    };
  }

  if (filledCount === 81) {
    return {
      isValid: true,
      message: 'Board is complete and fully valid according to all Sudoku constraints.',
      conflictCells: [],
      filledCount: 81,
    };
  }

  return {
    isValid: true,
    message: `Validation successful: All ${filledCount} placed numbers satisfy row, column, and 3×3 box constraints.`,
    conflictCells: [],
    filledCount,
  };
}

/**
 * Standard Recursive Backtracking Sudoku Solver
 * 
 * Algorithm:
 * 1. Scans for an empty cell (value 0).
 * 2. If no empty cell is found, the puzzle is solved (Base Case -> returns true).
 * 3. Iterates through candidate numbers 1 to 9.
 * 4. Checks if candidate is safe via isSafe(board, row, col, num).
 * 5. If safe, assigns the candidate to board[row][col].
 * 6. Recursively calls solveSudoku(board).
 * 7. If the recursive call succeeds, returns true.
 * 8. If the recursive call fails (leads to dead end), backtracks by resetting
 *    board[row][col] = 0 and tries the next candidate.
 * 9. If no candidates (1-9) succeed, returns false to backtrack to previous cell.
 *
 * @param {number[][]} board - 9x9 board (modified in place)
 * @returns {boolean} True if puzzle is solved, false if unsolvable
 */
export function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;

            if (solveSudoku(board)) {
              return true;
            }

            // Backtracking: undo the incorrect choice
            board[row][col] = 0;
          }
        }

        return false;
      }
    }
  }

  return true;
}

/**
 * Creates a deep copy of a 9x9 board.
 * Ensures the solver works on a clone without corrupting the user's input.
 *
 * @param {number[][]} board - Source 9x9 board
 * @returns {number[][]} Cloned 9x9 board
 */
export function copyBoard(board) {
  return board.map((row) => [...row]);
}

/**
 * Creates an empty 9x9 Sudoku board filled with 0s.
 *
 * @returns {number[][]} 9x9 matrix filled with zeros
 */
export function createEmptyBoard() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

/**
 * Returns a standard valid Sudoku puzzle with 30 clues.
 * Guaranteed to be solvable and adhere to standard Sudoku rules.
 *
 * @returns {number[][]} 9x9 board with known valid clues
 */
export function getExampleBoard() {
  return [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ];
}
