'use strict'
// TODO: Implement audio features for mine detonation and victory, also implement
// TODO: An audio mute button 
// * global scope

var gBoard
var gSteps = 0
var gLevel = {
  SIZE: 8,
  MINES: 14
}

// * DATA
var MINE = "MINE"
var CELL = "CELL"
var gRightClick = false
var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  lives: 3,
  detonatedMineCount: 0,
  // This Line is PROBLEMATIC !
  totalCellCounter: gLevel.SIZE * gLevel.SIZE,
  // Not accurate for the relevant difficulty at all.
  // totalCellCounter: 4 * 4, // This Line is PROBLEMATIC !
  flaggedMine: 0
}

// * Visualize/ render definitions
const MINE_IMG = `<img src="img/explosives.png">`
const gFlagString = '<span>🚩</span>'

function onInit() {
  resetAllStats()
  handleLife()
  resetEmoji()
  gBoard = buildBoard()
  renderBoard(gBoard, `.board`)
  // hideNums()
  closeGuide()
}

function onCellClicked(elCell) {
  // Disallow rightclick for opened cells
  blockContextDisplay()
  if (gSteps === 0) {
    startTimer()
  }
  // Initalize game ON
  if (!gGame.isOn) gGame.isOn = true
  gSteps++ // Used to know when to initalize the timer
  // Increment the count property for opened cells 
  var elCellLoc = getLocationFromClass(elCell)
  if (gBoard[elCellLoc.i][elCellLoc.j].isMarked) return
  gGame.shownCount++

  elCell.classList.remove('blank')
  elCell.classList.add('open')

  // Catch cell
  var cell = gBoard[elCellLoc.i][elCellLoc.j]
  // Toggle the .isShown propety to true
  cell.isShown = true
  // Expand the selection to neighboor cells
  expandShown(gBoard, elCell, elCellLoc.i, elCellLoc.j)

  
  // Upon detonating a mine - one life lost each time
  if (cell.isMine) {
    gGame.lives--
    gGame.detonatedMineCount++
    console.log("gGame.detonatedMineCount", gGame.detonatedMineCount)
    killLife() // Visually renders the amount of lives left
    console.log("You have", gGame.lives, "lives left") // testing
    
    // Lose scenario
    if (gGame.lives === 0) {
      // Expose all MINES
      showAllMines()
      checkGameOver()
      gGame.isOn = false
    }
  }
  // Either way, check if a win situation has occurred
  // Only if open cells are larger then half the sum of the cells,
  // then we can start checking for win (there's probably way more efficient methods to this)
  if (gGame.shownCount > (gGame.totalCellCounter / 2)) {
    checkWin()
  }
}

function showAllMines() {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      if (gBoard[i][j].isMine) {
        var elCell = document.querySelector(`.cell-${i}-${j}`)
        elCell.classList.remove('blank')
        elCell.classList.add('open')
      }
    }
  }
}

function expandShown(board, elCell, row, col) {
  // If the clicked cell contains a mine, return without opening any neighboor cells
  if (board[row][col].isMine || board[row][col].isMarked) return

  // Open the clicked cell
  elCell.classList.remove('blank')
  elCell.classList.add('open')

  // If the clicked cell has no mines in the neighboorhood, recursively open its neighbors
  if (board[row][col].minesAroundCount === 0) {
    for (var i = row - 1; i <= row + 1; i++) {
      for (var j = col - 1; j <= col + 1; j++) {
        // Handle edges of the board
        if (i < 0 || j < 0 || i >= board.length || j >= board[0].length) continue
        var neighborCell = board[i][j]
        // Set the isShown definition to true, for each cell opened
        var neighborElCell = document.querySelector(`.cell-${i}-${j}`)
        // If the neighbor cell is already opened or contains a MINE/ FLAG  , skip it
        if (neighborElCell.classList.contains('open') || neighborCell.isMine || neighborCell.isMarked) continue
        neighborCell.isShown = true
        // Otherwise, open the neighbor cell and recursively open its neighbors
        gGame.shownCount++
        neighborElCell.classList.remove('blank')
        neighborElCell.classList.add('open')
        expandShown(board, neighborElCell, i, j)
      }
    }
  }
}

// function expandShown(board, elCell, row, col) {
//   // If the clicked cell contains a mine, return without opening any neighboor cells
//   if (board[row][col].isMine || board[row][col].isShown || board[row][col].isMarked) return

//   // Open the clicked cell
//   elCell.classList.remove('blank')
//   elCell.classList.add('open')

//   // If the clicked cell has no mines in the neighboorhood, start scanning with the loop for legit negs
//   if (board[row][col].minesAroundCount === 0) {
//     for (var i = row - 1; i <= row + 1; i++) {
//       for (var j = col - 1; j <= col + 1; j++) {
//         // Handle edges of the board
//         if (i < 0 || j < 0 || i >= board.length || j >= board[0].length) continue
//         var neighborCell = board[i][j]
//         var neighborElCell = document.querySelector(`.cell-${i}-${j}`)
//         // If the neighbor cell is already opened or contains a mine/ flag, skip it
//         if (neighborElCell.classList.contains('open') || neighborCell.isMine || neighborCell.isMarked) continue
//         // Otherwise, open the neighbor cell and recursively open its neighbors
//         // Set the isShown definition to true, for each cell opened
//         // neighborCell.isShown = true
//         gGame.shownCount++
//         neighborElCell.classList.remove('blank')
//         neighborElCell.classList.add('open')
//         expandShown(board, neighborElCell, i, j)
//       }
//     }
//   }
// }

function checkGameOver() {
  // Game ends when all mines are marked, and all the other cells are shown
  if (gGame.lives === 0) {
    console.log("Sorry, you're dead.")
    playerDead()
  } else {
    console.log("Nicely done!")
  }
}

function placeFlag(elCell, i, j) {
  console.log("placeFlag was called!")

  // Remove '.blank' css properties, add '.flagged' properties instead
  elCell.classList.remove('blank')
  elCell.classList.add('flagged')
  elCell.innerHTML += gFlagString
  // Increment the .isMarked propety for the relevant cell
  gBoard[i][j].isMarked = true
  // Increment the markedCount, to identify WIN scenario
  gGame.markedCount++

  // Validate if it really is a mine underneath 
  if (gBoard[i][j].isMine) {
    gGame.flaggedMine++
    gGame.shownCount++
  }
  return
}

function removeFlag(elCell, i, j) {
  // Undo stats changes
  gGame.shownCount--
  gBoard[i][j].isMarked = false
  // Reverse all actions done, to unmark the cell
  var elSpan = elCell.querySelector('span')
  console.log("removeFlag was called!")
  elCell.classList.add('blank')
  elCell.classList.remove('flagged')

  // If there was a bomb underneath, and user chose to undo his flag ->
  // display the bomb underneath
  if (gBoard[i][j].isMine) {
    elSpan.remove()
    // elSpan.innerHTML = MINE_IMG
  } else {
    // Retrieve the relevant "minesAroundCount" hidden underneath
    elSpan.remove()
    // elSpan.innerHTML = gBoard[i][j].minesAroundCount
    // elCell.removeChild('span')
    // elSpan.innerHTML -= flagString
  }
  return
}

// This is the "onCellMarked" function, simply implemented it with a different name
// This function will simply check for the .isMarked attribute if falsey/ truthy
function onRightClick(elCell) {
  // Retrieve location coordinations from the relevant cell
  var cellLocation = getLocationFromClass(elCell)
  // Disallow placing flag on top of a shown cell
  if (gBoard[cellLocation.i][cellLocation.j].isShown) return
  // If cell isn't marked -> mark it
  if (gBoard[cellLocation.i][cellLocation.j].isMarked === false) {
    placeFlag(elCell, [cellLocation.i], [cellLocation.j])
  } // else if cell is already marked -> unmark it
  else removeFlag(elCell, cellLocation.i, cellLocation.j)
  // Either way, check if a win situation has occurred
  // Only if open cells are larger then half the sum of the cells,
  // then we can start checking for win (there's probably way more efficient methods to this)
  if (gGame.shownCount > (gGame.totalCellCounter / 2)) {
    checkWin()
  }
  
  // Disallow context-menu to pop up, regardless of the functionality above
  blockContextDisplay()
}

function checkWin() {
  var markedMinesCount = countMarkedMines()
  console.log("markedMinesCount", markedMinesCount)
  if (markedMinesCount >= (gLevel.MINES - gGame.detonatedMineCount)) {
    if (gGame.shownCount >= gGame.totalCellCounter && gGame.lives > 0) {
      handleWin()
    }
  }
}

function countMarkedMines() {
  var count = 0
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      if (gBoard[i][j].isMine && gBoard[i][j].isMarked) {
        count++
      }
    }
  }
  return count
}

function handleWin() {
  console.log("handleWin FUNC activated")
  var timeRecord = document.querySelector('.timer').innerText
  console.log(`Congrats, you won at ${timeRecord}!`)
  var emoji = document.querySelector('.restart')
  emoji.innerText = '😎'
  pauseTimer()
}