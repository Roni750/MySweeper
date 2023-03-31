'use strict'
// TODO: Implement audio features for mine detonation and victory, also implement
// TODO: An audio mute button 
// * global scope

var gLevel = {
  SIZE: 8,
  MINES: 14
}

// * DATA
var gBoard
var MINE = "MINE"
// ? var CELL = "MINE"
// Not sure why, this was configured like wise ^
// if any problems come up, consider switching it back.
// If all good on the final version, these comments will be deleted
var CELL = "CELL"
var FLAG = "🚩"
var gRightClick = false
var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  lives: 3,
  detonatedMineCount: 0,
  totalCellCounter: gLevel.SIZE * gLevel.SIZE,
  flaggedMine: 0
}

// * Visualize/ render definitions
var MINE_IMG = `<img src="img/explosives.png">`


function onInit() {
  resetEmoji()
  gBoard = buildBoard()
  startTimer()
  renderBoard(gBoard, `.board`)
  // hideNums()
  closeGuide()
  handleLife()
}

function onCellClicked(elCell, i, j) {
  var elCellLoc = getLocationFromClass(elCell)
  if (gBoard[elCellLoc.i][elCellLoc.j].isMarked) return false
  gGame.shownCount++ // Increment the count property for opened cells 
  // Set the game mode to ON
  gGame.isOn = true
  
  elCell.classList.remove('blank')
  elCell.classList.add('open')
  
  // Expand the selection to neighboor cells
  expandShown(gBoard, elCell, elCellLoc.i, elCellLoc.j)
  var cell = gBoard[elCellLoc.i][elCellLoc.j]

  // Toggle the .isShown propety to true
  cell.isShown = true

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
}

function showAllMines() {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      if (gBoard[i][j].isMine) {
        var elCell = document.querySelector(`.cell-${i}-${j}`)
        elCell.classList.remove('blank')
        elCell.classList.add('open')
        // console.log(elCell)
      }
    }
  }
}

function expandShown(board, elCell, row, col) {
  gGame.shownCount++
  // If the clicked cell contains a mine, return without opening any neighboor cells
  if (board[row][col].isMine) return

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
        neighborCell.isShown = true
        var neighborElCell = document.querySelector(`.cell-${i}-${j}`)
        // If the neighbor cell is already opened or contains a mine, skip it
        if (neighborElCell.classList.contains('open') || neighborCell.isMine) continue
        // Otherwise, open the neighbor cell and recursively open its neighbors
        neighborElCell.classList.remove('blank')
        neighborElCell.classList.add('open')
        expandShown(board, neighborElCell, i, j)
      }
    }
  }
}

function checkGameOver() {
  // Game ends when all mines are marked, and all the other cells are shown
  if (gGame.lives === 0) {
    console.log("Sorry, you're dead.")
    playerDead()
  } else {
    console.log("Nicely done!")
  }
}

// This is the "onCellMarked" function, accidentally implemented it with the wrong name
function onRightClick(elCell) {
  // Toggle right click switch ON/ OFF
  gRightClick = !gRightClick
  // Retrieve location coordinations from the desired cell
  const cellLocation = getLocationFromClass(elCell)
  // Disallow placing flag on top of an opened cell
  if (gBoard[cellLocation.i][cellLocation.j].isShown) return

  // Select the relevant cell
  var elP = elCell.querySelector('p')

  if (gRightClick) {
    // Remove '.blank' css properties, add '.flagged' properties instead
    elCell.classList.remove('blank')
    elCell.classList.add('flagged')
    elP.innerHTML = FLAG
    // Increment the .isMarked propety for the relevant cell
    gBoard[cellLocation.i][cellLocation.j].isMarked = true
    // Increment the markedCount, to identify WIN scenario
    gGame.markedCount++

    // Validate if it really is a mine underneath 
    if (gBoard[cellLocation.i][cellLocation.j].isMine) {
      gGame.flaggedMine++
    }
  } else if (!gRightClick) {
    // Reverse all actions done above (toggle-off mechanism)
    elCell.classList.add('blank')
    elCell.classList.remove('flagged')

    // If there was a bomb underneath, and user chose to undo his flag ->
    // display the bomb underneath
    if (gBoard[cellLocation.i][cellLocation.j].isMine) {
      elP.innerHTML = MINE_IMG
    } else {
      // Retrieve the relevant "minesAroundCount" hidden underneath
      elP.innerHTML = gBoard[cellLocation.i][cellLocation.j].minesAroundCount
    }
  }

  var markedMinesCount = countMarkedMines()
  if (markedMinesCount >= (gLevel.MINES - gGame.detonatedMineCount)) {
    checkWin()
  }

  // Disallow context-menu to pop up, regardless of the functionality above
  blockContextDisplay()
  gRightClick = !gRightClick
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

function checkWin() {
  var markedMinesCount = 0

  // Count for marked mines
  if (gGame.markedCount >= (gLevel.MINES - gGame.detonatedMineCount)) {
    for (var i = 0; i < gLevel.SIZE; i++) {
      for (var j = 0; j < gLevel.SIZE; j++) {
        if (gBoard[i][j].isMine && gBoard[i][j].isMarked) {
          markedMinesCount++
        }
      }
    }
    if (markedMinesCount >= (gLevel.MINES - gGame.detonatedMineCount)) {
      var timeRecord = document.querySelector('.timer').innerText
      console.log(`Congrats, you won at ${timeRecord}!`)
      var emoji = document.querySelector('.restart')
      emoji.innerText = '😎'
      pauseTimer()
    }
  } return
}