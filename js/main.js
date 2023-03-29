'use strict'

// * global scope
const gLevel = {
  SIZE: 6,
  MINES: 2
}

// * DATA
var gBoard
var MINE = "MINE"
var CELL = "MINE"
var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0
}

// * Visualize/ render
var MINE_IMG = `<img src="img/explosives.png">`


function onInit() {
  gBoard = buildBoard()
  renderBoard(gBoard, `.board`)
  hideNums()
}

function onCellClicked(elCell, i, j) {
  // Called when a cell is clicked
  gGame.isOn = true
  var showThis = elCell.querySelector('p')
  showThis.classList.remove('hide')
  elCell.classList.remove('blank')
  elCell.classList.add('open')
  var elCellLoc = getLocationFromClass(elCell)
  expandShown(gBoard, elCell, elCellLoc.i, elCellLoc.j)
}

function expandShown(board, elCell, row, col) {
  /* When user clicks a cell with no mines around, we need to open not only that cell,
  but also its neighbors. NOTE: start with a basic implementation that only
  opens the non-mine 1st degree neighbors */
  // TODO: Check if there are mines around
  var count = 0
  for (var i = row - 1; i <= row + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = col - 1; j <= col + 1; j++) {
      // Handle edges of the board
      if (i === row && j === col) continue
      if (i < 0 || j >= board[0].length || j < 0) continue
      var currCell = board[i][j]
      console.log(currCell)
      if (currCell.minesAroundCount > 0) {
        showNums(elCell)
      }
    }
  }
  return count
  // TODO: if true, open neighboor cells as well
}

// function expandShown(board, elCell, i, j) {
//   /* When user clicks a cell with no mines around, we need to open not only that cell,
//   but also its neighbors. NOTE: start with a basic implementation that only
//   opens the non-mine 1st degree neighbors */
//   // TODO: Check if there are mines around
//   var count = 0
//   for (var rowIdx = i - 1; rowIdx <= i + 1; rowIdx++) {
//     if (rowIdx < 0 || rowIdx >= board.length) continue
//     for (var colIdx = j - 1; colIdx <= j + 1; colIdx++) {
//       // Handle edges of the board
//       if (rowIdx === i && colIdx === j) continue
//       if (rowIdx < 0 || colIdx >= board[0].length) continue
//       var currCell = board[rowIdx][colIdx]
//       // console.log(currCell)
//       if (currCell.minesAroundCount > 0) {
//         showNums(elCell)
//       }
//     }
//   }
//   return count
//   // TODO: if true, open neighboor cells as well
// }

function onCellMarked(elCell) {
  // Called when a cell is right-clicked,
  // See how you can hide the context menu on right click
}


  function checkGameOver() {
    // Game ends when all mines are marked, and all the other cells are shown
  }











/* for (var row = 0; row < gBoard.length; row++)
   for (var col = 0; col < gBoard[0].length; col++) {
     var currCell = board[row][col]
     if (currCell.minesAroundCount > 0) {
       console.log(currCell)
       elCell.classList.remove('blank')
       elCell.classList.add('open')
     }
   } */