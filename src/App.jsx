import React, { useState, useRef } from 'react';
import {
  isSafe,
  isValidBoard,
  validateBoardDetails,
  solveSudoku,
  copyBoard,
  createEmptyBoard,
  getExampleBoard,
} from './sudoku';
import './App.css';

export default function App() {
  // Current working 9x9 board state
  const [board, setBoard] = useState(() => getExampleBoard());

  // Snapshot of original clues before solving or manual modifications
  // Used to distinguish original clues vs solver-generated numbers, and to support Reset
  const [initialBoard, setInitialBoard] = useState(() => getExampleBoard());

  // Whether the board currently displays a completed solution
  const [isSolved, setIsSolved] = useState(false);

  // Status message state
  const [status, setStatus] = useState({
    type: 'info',
    message: 'Example puzzle ready. Click "Solve Sudoku" to run Backtracking.',
    detail: 'You can also edit cells, validate constraints, or enter a custom puzzle.',
  });

  // Array of conflicting cell coordinates: ["row,col"]
  const [conflictCells, setConflictCells] = useState([]);

  // Solving statistics (execution time, cells solved)
  const [stats, setStats] = useState(null);

  // Reference for input elements to support keyboard navigation
  const inputRefs = useRef({});

  /**
   * Handle cell input changes.
   * Restricts input strictly to digits 1-9 or empty string (0).
   */
  const handleCellChange = (r, c, rawVal) => {
    // If the board was previously solved, any manual edit exits solved mode
    if (isSolved) {
      setIsSolved(false);
      setStats(null);
    }

    // Clear conflict indicators when user edits
    if (conflictCells.length > 0) {
      setConflictCells([]);
    }

    // Erase cell if empty
    if (rawVal === '' || rawVal === '0') {
      const newBoard = copyBoard(board);
      newBoard[r][c] = 0;
      setBoard(newBoard);

      const newInitial = copyBoard(initialBoard);
      newInitial[r][c] = 0;
      setInitialBoard(newInitial);
      return;
    }

    // Only allow single character from 1 to 9
    const cleaned = rawVal.replace(/[^1-9]/g, '');
    if (!cleaned) {
      return;
    }

    const digit = parseInt(cleaned[cleaned.length - 1], 10);

    const newBoard = copyBoard(board);
    newBoard[r][c] = digit;
    setBoard(newBoard);

    const newInitial = copyBoard(initialBoard);
    newInitial[r][c] = digit;
    setInitialBoard(newInitial);
  };

  /**
   * Supports smooth keyboard navigation across the 9x9 grid via arrow keys
   */
  const handleKeyDown = (e, r, c) => {
    let targetR = r;
    let targetC = c;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        targetR = Math.max(0, r - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        targetR = Math.min(8, r + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        targetC = Math.max(0, c - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        targetC = Math.min(8, c + 1);
        break;
      case 'Backspace':
      case 'Delete':
        if (board[r][c] !== 0) {
          e.preventDefault();
          handleCellChange(r, c, '');
        }
        return;
      default:
        return;
    }

    const key = `${targetR}-${targetC}`;
    if (inputRefs.current[key]) {
      inputRefs.current[key].focus();
      inputRefs.current[key].select();
    }
  };

  /**
   * Solve Sudoku using the Recursive Backtracking Algorithm
   */
  const handleSolve = () => {
    // 1. Validate the current board state first
    const validation = validateBoardDetails(board);

    if (!validation.isValid) {
      setConflictCells(validation.conflictCells);
      setStatus({
        type: 'error',
        message: 'Cannot solve: Board contains rule violations!',
        detail: validation.message,
      });
      return;
    }

    // 2. Check if already completely filled
    if (validation.filledCount === 81) {
      setStatus({
        type: 'info',
        message: 'Board is already completely solved.',
        detail: 'All 81 cells are filled and satisfy all Sudoku constraints.',
      });
      return;
    }

    // 3. Preserve the current board as initialBoard before solving
    const currentClues = copyBoard(board);
    setInitialBoard(currentClues);

    // 4. Solve on a deep copy to never corrupt user input on failure
    const boardClone = copyBoard(board);
    const emptyCount = 81 - validation.filledCount;

    const startTime = performance.now();
    const isSolvable = solveSudoku(boardClone);
    const endTime = performance.now();
    const elapsedMs = (endTime - startTime).toFixed(2);

    if (isSolvable) {
      setBoard(boardClone);
      setIsSolved(true);
      setConflictCells([]);
      setStats({
        timeMs: elapsedMs,
        emptyCount,
      });

      if (validation.filledCount === 0) {
        setStatus({
          type: 'success',
          message: 'Solution generated from empty grid using Backtracking!',
          detail: `Solved in ${elapsedMs} ms. (First valid configuration found by search order).`,
        });
      } else {
        setStatus({
          type: 'success',
          message: 'Puzzle successfully solved using Backtracking!',
          detail: `Filled ${emptyCount} empty cells in ${elapsedMs} ms with zero constraint violations.`,
        });
      }
    } else {
      // Puzzle is mathematically unsolvable with given initial configuration
      setConflictCells([]);
      setStatus({
        type: 'error',
        message: 'Unsolvable puzzle: No valid solution exists.',
        detail: 'The backtracking algorithm exhausted all candidate values without finding a conflict-free state.',
      });
    }
  };

  /**
   * Validate the current Sudoku board for any constraint violations.
   */
  const handleValidate = () => {
    const validation = validateBoardDetails(board);

    if (validation.isValid) {
      setConflictCells([]);
      setStatus({
        type: 'success',
        message: 'Validation Successful: No rule violations detected!',
        detail: validation.message,
      });
    } else {
      setConflictCells(validation.conflictCells);
      setStatus({
        type: 'error',
        message: 'Validation Error: Rule violation detected!',
        detail: validation.message,
      });
    }
  };

  /**
   * Loads the standard known valid example puzzle
   */
  const handleLoadExample = () => {
    const example = getExampleBoard();
    setBoard(copyBoard(example));
    setInitialBoard(copyBoard(example));
    setIsSolved(false);
    setConflictCells([]);
    setStats(null);
    setStatus({
      type: 'info',
      message: 'Standard valid example puzzle loaded (30 clues).',
      detail: 'Click "Solve Sudoku" to run the recursive backtracking algorithm.',
    });
  };

  /**
   * Resets the board back to its original clue state before solving
   */
  const handleReset = () => {
    setBoard(copyBoard(initialBoard));
    setIsSolved(false);
    setConflictCells([]);
    setStats(null);
    setStatus({
      type: 'info',
      message: 'Puzzle restored to initial clues.',
      detail: 'Solver-generated numbers removed while preserving original entries.',
    });
  };

  /**
   * Clears all 81 cells to blank/zero
   */
  const handleClearGrid = () => {
    const empty = createEmptyBoard();
    setBoard(empty);
    setInitialBoard(empty);
    setIsSolved(false);
    setConflictCells([]);
    setStats(null);
    setStatus({
      type: 'info',
      message: 'Grid cleared. All 81 cells are empty.',
      detail: 'Enter your custom clues or click "Load Example".',
    });
  };

  return (
    <div className="app-shell">
      {/* Top Application Bar */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
          </div>
          <div>
            <h1 className="brand-title">Sudoku Solver</h1>
            <p className="brand-subtitle">Design and Analysis of Algorithms — Backtracking</p>
          </div>
        </div>

        <div className="topbar-meta">
          <span className="academic-tag">College DAA Project</span>
        </div>
      </header>

      {/* Main Single-Screen Workspace */}
      <main className="workspace">
        {/* Left Pane: Interactive Sudoku Board & Controls */}
        <section className="pane-solver" aria-label="Sudoku Board and Controls">
          {/* 9x9 Sudoku Board */}
          <div className="board-container">
            <div className="sudoku-grid" role="grid" aria-label="Sudoku 9x9 Grid">
              {board.map((row, r) =>
                row.map((val, c) => {
                  const isConflict = conflictCells.includes(`${r},${c}`);
                  const isOriginal = initialBoard[r][c] !== 0;
                  const isGenerated = isSolved && !isOriginal && val !== 0;

                  let cellClass = 'sudoku-cell';
                  if (isConflict) cellClass += ' cell-conflict';
                  else if (isGenerated) cellClass += ' cell-generated';
                  else if (isOriginal) cellClass += ' cell-original';

                  // 3x3 Box Boundary Thick Borders
                  if (r === 2 || r === 5) cellClass += ' border-box-bottom';
                  if (c === 2 || c === 5) cellClass += ' border-box-right';

                  return (
                    <div key={`${r}-${c}`} className={cellClass}>
                      <input
                        ref={(el) => (inputRefs.current[`${r}-${c}`] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[1-9]*"
                        maxLength={1}
                        value={val === 0 ? '' : val}
                        onChange={(e) => handleCellChange(r, c, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, r, c)}
                        onFocus={(e) => e.target.select()}
                        aria-label={`Row ${r + 1}, Column ${c + 1}`}
                        className="cell-input"
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Visual Legend */}
          <div className="grid-legend">
            <div className="legend-item">
              <span className="legend-swatch swatch-original"></span>
              <span className="legend-text">Original Clue</span>
            </div>
            <div className="legend-item">
              <span className="legend-swatch swatch-generated"></span>
              <span className="legend-text">Solver Generated</span>
            </div>
            <div className="legend-item">
              <span className="legend-swatch swatch-conflict"></span>
              <span className="legend-text">Rule Conflict</span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="controls-group">
            <button
              type="button"
              onClick={handleSolve}
              className="btn btn-primary"
              title="Solve puzzle using recursive backtracking"
            >
              <span className="btn-icon">⚡</span>
              Solve Sudoku
            </button>

            <button
              type="button"
              onClick={handleValidate}
              className="btn btn-secondary"
              title="Check row, column, and 3x3 box constraints"
            >
              <span className="btn-icon">✓</span>
              Validate
            </button>

            <button
              type="button"
              onClick={handleLoadExample}
              className="btn btn-secondary"
              title="Load standard 30-clue Sudoku puzzle"
            >
              <span className="btn-icon">📋</span>
              Load Example
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary"
              title="Restore initial clues and clear solver-generated numbers"
            >
              <span className="btn-icon">↺</span>
              Reset
            </button>

            <button
              type="button"
              onClick={handleClearGrid}
              className="btn btn-outline"
              title="Clear all 81 cells"
            >
              <span className="btn-icon">🗑</span>
              Clear Grid
            </button>
          </div>
        </section>

        {/* Right Pane: Live Diagnostics, Metrics & DAA Theory */}
        <section className="pane-analysis" aria-label="Status and Algorithm Analysis">
          {/* Status Message Banner */}
          <div className={`status-banner status-${status.type}`} role="alert" aria-live="polite">
            <div className="status-icon">
              {status.type === 'success' && '✓'}
              {status.type === 'error' && '✕'}
              {status.type === 'info' && 'ℹ'}
            </div>
            <div className="status-text">
              <p className="status-title">{status.message}</p>
              {status.detail && <p className="status-subtitle">{status.detail}</p>}
            </div>
          </div>

          {/* Real-Time Performance Metrics Bar */}
          {stats && (
            <div className="stats-row">
              <div className="stat-pill">
                <span className="stat-k">Algorithm:</span>
                <span className="stat-v">Backtracking</span>
              </div>
              <div className="stat-pill">
                <span className="stat-k">Runtime:</span>
                <span className="stat-v">{stats.timeMs} ms</span>
              </div>
              <div className="stat-pill">
                <span className="stat-k">Solved Cells:</span>
                <span className="stat-v">{stats.emptyCount} / 81</span>
              </div>
            </div>
          )}

          {/* DAA Algorithmic Information Cards */}
          <div className="theory-scroll-area">
            {/* Algorithm & Definition */}
            <div className="theory-card">
              <div className="card-tag">Algorithm Paradigm</div>
              <h2 className="card-heading">Backtracking Algorithm</h2>
              <p className="card-body">
                <strong>Definition:</strong> Backtracking is an algorithmic technique that builds a solution step by step and reverses a choice whenever it cannot lead to a valid solution.
              </p>
              <p className="card-body-secondary">
                Applied to Sudoku, it performs depth-first state-space search over candidate numbers, pruning any branch that violates row, column, or 3×3 box constraints.
              </p>
            </div>

            {/* Working Steps */}
            <div className="theory-card">
              <div className="card-tag">Execution Flow</div>
              <h2 className="card-heading">Step-by-Step Working</h2>
              <ol className="steps-list">
                <li>
                  <span className="step-badge">1</span>
                  <span><strong>Find an empty cell:</strong> Locate the next cell with value <code>0</code>.</span>
                </li>
                <li>
                  <span className="step-badge">2</span>
                  <span><strong>Try a number:</strong> Iterate through candidate digits <code>1</code> to <code>9</code>.</span>
                </li>
                <li>
                  <span className="step-badge">3</span>
                  <span><strong>Check constraints:</strong> Verify with <code>isSafe()</code> across row, column, and 3×3 box.</span>
                </li>
                <li>
                  <span className="step-badge">4</span>
                  <span><strong>Recurse if valid:</strong> Tentatively place candidate and recursively call <code>solveSudoku()</code>.</span>
                </li>
                <li>
                  <span className="step-badge">5</span>
                  <span><strong>Undo choice on failure:</strong> If a dead end is reached, reset cell to <code>0</code> and test next digit.</span>
                </li>
                <li>
                  <span className="step-badge">6</span>
                  <span><strong>Termination:</strong> Return <code>true</code> when all 81 cells are safely filled.</span>
                </li>
              </ol>
            </div>

            {/* Time & Space Complexity */}
            <div className="theory-card">
              <div className="card-tag">Theoretical Complexity</div>
              <h2 className="card-heading">Complexity Analysis</h2>
              
              <div className="complexity-row">
                <div className="complexity-label">Time Complexity:</div>
                <code className="complexity-code">O(9^m) (Worst Case)</code>
              </div>
              <p className="card-body-secondary" style={{ marginTop: '0.25rem' }}>
                Where <code>m</code> is the number of empty cells (0 ≤ m ≤ 81). While 9^m is a loose theoretical upper bound for naive search, constraint checks (pruning) reject invalid paths early, resolving typical puzzles in &lt; 25 ms.
              </p>

              <div className="complexity-row" style={{ marginTop: '0.65rem' }}>
                <div className="complexity-label">Auxiliary Space:</div>
                <code className="complexity-code">O(m) (Call Stack)</code>
              </div>
              <p className="card-body-secondary" style={{ marginTop: '0.25rem' }}>
                Bounded by the maximum recursive call depth (m ≤ 81), requiring negligible memory overhead (O(1) relative to external inputs).
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Subtle Micro-Footer */}
      <footer className="micro-footer">
        <span>Sudoku Solver • College DAA Laboratory Project • Recursive Backtracking</span>
      </footer>
    </div>
  );
}
