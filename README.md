# Sudoku Solver Using Backtracking Algorithm
### Design and Analysis of Algorithms (DAA) — Academic Laboratory Project

[![Technology](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20ES6+-1e3a8a.svg)](https://react.dev)
[![Algorithm](https://img.shields.io/badge/Algorithm-Recursive%20Backtracking-2563eb.svg)](https://en.wikipedia.org/wiki/Backtracking)
[![UI Layout](https://img.shields.io/badge/UI-Single--Screen%20Workbench-0284c7.svg)](#ui-design--single-screen-layout)
[![Tests](https://img.shields.io/badge/Tests-30%2F30%20Passing-15803d.svg)](#test-suite--verification)

---

## 1. Project Objective

The primary objective of this project is to implement, visualize, and analyze the **Recursive Backtracking Algorithm** for solving constraint satisfaction problems (CSPs) through the domain of standard 9×9 Sudoku puzzles. 

This is strictly an **algorithmic demonstration and analysis project** designed for college coursework in **Design and Analysis of Algorithms (DAA)**. It deliberately contains **no game-oriented mechanics** (no scores, no timers, no leaderboards, no difficulty levels, no hints, and no lives). The application focuses purely on:
- Grid constraint representation and invariant enforcement.
- Pure recursive state-space exploration with depth-first search (DFS).
- Backtracking through explicit state restoration on dead-end branches.
- Clear visual distinction between original puzzle clues and solver-generated assignments.
- **Single-Screen Workbench UI:** Optimized layout where the board, controls, diagnostics, and algorithm theory fit within the viewport height without page scrolling.

---

## 2. Problem Statement

A standard **Sudoku** puzzle is a constraint-satisfaction grid problem defined over a $9 \times 9$ matrix partitioned into nine $3 \times 3$ subgrids (blocks). The grid begins with several pre-assigned clues with values in $\{1, 2, \dots, 9\}$. 

The objective is to fill all empty cells such that the following three fundamental invariants are simultaneously satisfied:

1. **Row Invariant:** Each row of 9 cells must contain each integer from $1$ to $9$ exactly once without repetition.
2. **Column Invariant:** Each column of 9 cells must contain each integer from $1$ to $9$ exactly once without repetition.
3. **Subgrid (Box) Invariant:** Each of the nine $3 \times 3$ non-overlapping subgrids must contain each integer from $1$ to $9$ exactly once without repetition.

Given an initial grid configuration $B \in \{0, 1, \dots, 9\}^{9 \times 9}$ where $0$ represents an unassigned cell, find an assignment $B^* \in \{1, \dots, 9\}^{9 \times 9}$ satisfying all invariants, or determine that no such valid assignment exists.

---

## 3. Algorithm Explanation: Recursive Backtracking

Backtracking is a systematic algorithmic technique for solving constraint satisfaction problems by incrementally building candidate solutions and abandoning ("backtracking" from) a candidate as soon as it is determined that the candidate cannot possibly lead to a valid full solution.

### State Space Tree
The search space can be visualized as an $n$-ary decision tree:
- Each node represents a partial board assignment.
- Each branch corresponds to choosing a candidate digit ($1$ through $9$) for an unassigned cell.
- The depth of the tree corresponds to the number of empty cells $m$ ($0 \le m \le 81$).
- A leaf represents either a complete valid board (solution found) or an invalid partial board where no candidates in $\{1, \dots, 9\}$ satisfy the local constraints.

### Algorithmic Execution Steps
1. **Find Unassigned Cell:** Scan the grid row by row to locate the next empty cell `(row, col)` where `board[row][col] == 0`.
2. **Base Case Check:** If no empty cells remain, every cell has been legally populated. Return `true` (success).
3. **Candidate Enumeration:** Iterate through candidate digits `num` from $1$ to $9$.
4. **Safety Check (`isSafe`):** Check whether placing `num` at `board[row][col]` maintains the row, column, and $3 \times 3$ subgrid constraints.
5. **Tentative Assignment & Recursion:** If `isSafe()` evaluates to `true`, tentatively assign `board[row][col] = num` and invoke `solveSudoku(board)` recursively.
6. **Solution Propagation:** If the recursive call returns `true`, propagate success up the call stack immediately.
7. **Backtrack (Undo Assignment):** If the recursive call returns `false` (dead end), undo the assignment by resetting `board[row][col] = 0` and evaluate the next candidate.
8. **Failure Return:** If all digits $1$ through $9$ fail, return `false` to notify the parent call frame to backtrack.

---

## 4. Backtracking Pseudocode

```text
Algorithm: SolveSudoku(board)
Input: 9x9 matrix board with values in {0..9}, where 0 denotes an unassigned cell.
Output: Boolean indicating whether a valid assignment exists (modifies board in-place).

Function SolveSudoku(board):
    For row from 0 to 8:
        For col from 0 to 8:
            If board[row][col] == 0:
                For num from 1 to 9:
                    If IsSafe(board, row, col, num) == true:
                        board[row][col] = num           // Tentative assignment

                        If SolveSudoku(board) == true:
                            Return true                 // Solution found

                        board[row][col] = 0             // Backtrack (undo choice)

                Return false                            // Dead end: backtrack to previous cell

    Return true                                         // Base case: All cells filled safely

Function IsSafe(board, row, col, num):
    // 1. Check Row Constraint
    For c from 0 to 8:
        If c != col and board[row][c] == num:
            Return false

    // 2. Check Column Constraint
    For r from 0 to 8:
        If r != row and board[r][col] == num:
            Return false

    // 3. Check 3x3 Box Constraint
    startRow = (row / 3) * 3
    startCol = (col / 3) * 3
    For r from 0 to 2:
        For c from 0 to 2:
            If (startRow + r != row or startCol + c != col) and board[startRow + r][startCol + c] == num:
                Return false

    Return true
```

---

## 5. Complexity Analysis

### Time Complexity
- **Worst-Case Upper Bound:** $\mathcal{O}(9^m)$, where $m$ is the count of unassigned cells ($0 \le m \le 81$). For a completely blank grid ($m = 81$), naive exhaustive search has a theoretical bound of $9^{81} \approx 1.96 \times 10^{77}$ states.
- **Average/Practical Complexity:** $\mathcal{O}(c^m)$ where $c \ll 9$. The `isSafe` constraint check actively **prunes entire subtrees** early in the recursion tree, reducing real-world runtime from exponential scale down to **under 25 milliseconds** for typical puzzles.

### Auxiliary Space Complexity
- **Call Stack Depth:** $\mathcal{O}(m)$ auxiliary space, where $m$ is the count of empty cells.
- Since each recursive call corresponds to placing a digit in an unassigned cell, the maximum call stack depth cannot exceed $81$.
- Because $81$ is a fixed problem parameter, the auxiliary space is strictly bounded by $\mathcal{O}(1)$ with respect to external input size, requiring less than a few kilobytes of stack memory.

---

## 6. UI Design & Single-Screen Layout

The user interface uses a **Split-Pane Workbench Layout** that guarantees the entire application fits neatly into a **single screen** on desktop and laptop displays:

- **Height Optimization (`100vh` Fit):** The Sudoku board dynamically scales via `width: min(min(52vh, 450px), 42vw)` and `height: min(min(52vh, 450px), 42vw)`.
- **Left Pane:** Displays the 9×9 Sudoku grid, visual legend, and control buttons in one consolidated view.
- **Right Pane:** Displays real-time diagnostic status banners, solving performance metrics (runtime and cells solved), and the complete DAA theory breakdown with a custom micro-scrollbar.
- **Mobile Adaptivity:** Automatically transitions to a stacked scrollable layout on screens under 960px.

---

## 7. Technology Stack

- **Framework:** React.js 18 (Functional Components & React Hooks)
- **Bundler & Tooling:** Vite 5
- **Language:** JavaScript (ES6+ Modules, Sets, Maps)
- **Styling:** Modern CSS3 (CSS Grid, Flexbox, Viewport Units, Custom Properties)
- **Runtime:** Node.js (v18+)

---

## 8. Project Structure

```text
sudoku-solver/
├── public/
│   └── favicon.svg           # Application SVG icon
├── src/
│   ├── App.jsx               # React interface, state orchestration, UI controls
│   ├── App.css               # Clean academic stylesheet, single-screen CSS Grid
│   ├── sudoku.js             # Pure backtracking algorithm and validation functions
│   ├── main.jsx              # Application bootstrap entry point
│   └── index.css             # Global typography, color variables, and CSS reset
├── test-runner.js            # Automated algorithmic test suite (30 assertions)
├── index.html                # HTML5 document wrapper
├── package.json              # Project dependencies and npm scripts
├── vite.config.js            # Vite build configuration
└── README.md                 # Academic report and documentation
```

---

## 9. Installation and Execution Instructions

### Quick Start
1. Open terminal in project root:
   ```bash
   cd c:\Users\Administrator\Desktop\daa_project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```

4. Run the automated algorithmic test suite:
   ```bash
   npm test
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 10. Test Suite & Verification Scenarios

The test suite in `test-runner.js` systematically verifies all 10 formal scenarios:

1. **Valid Puzzle Solving:** Verified with `getExampleBoard()` — solved in ~20 ms with invariants preserved.
2. **Empty Grid Handling:** Verified — safely solved without falsely claiming uniqueness.
3. **Row Duplicate Detection:** Verified — flags duplicate numbers and exact row numbers.
4. **Column Duplicate Detection:** Verified — flags duplicate numbers and exact column numbers.
5. **3×3 Box Duplicate Detection:** Verified — flags duplicates in subgrids.
6. **Unsolvable Puzzle Handling:** Verified — mathematically impossible boards return `false` safely without crashing.
7. **Grid Clear Verification:** Verified — all 81 cells zeroed.
8. **Reset Clue Preservation:** Verified — deep cloning protects original clues.
9. **`isSafe` Correctness:** Verified — individual constraint checks tested.
10. **Device Responsiveness:** Verified — single screen fit on desktop, smooth scaling on mobile.
