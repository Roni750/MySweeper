'use strict'

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
  setDifficulty()
  startTimer()
  gBoard = buildBoard()
  renderBoard(gBoard, `.board`)
  // hideNums()
  closeGuide()
  handleLife()
}

function setDifficulty() {
  pauseTimer()
  var easyRadio = document.getElementById('easy')
  var mediumRadio = document.getElementById('medium')
  var hardRadio = document.getElementById('hard')
  if (easyRadio.checked) {
    gLevel.SIZE = 4
    gLevel.MINES = 2
  } else if (mediumRadio.checked) {
    gLevel.SIZE = 8
    gLevel.MINES = 14
  } else if (hardRadio.checked) {
    gLevel.SIZE = 12
    gLevel.MINES = 32
  }
  return
}

function onCellClicked(elCell, i, j) {

  gGame.shownCount++ // Increment the count property for opened cells 
  // Set the game mode to ON
  gGame.isOn = true
  // Disallow flagged cells to be opened
  // ! if (gBoard[elCellLoc.i][elCellLoc.j].isMarked) return THIS CAUSED ME SO MUCH TROUBLES,
  // ! Will implement itproperly  on the next patch

  elCell.classList.remove('blank')
  elCell.classList.add('open')
  var elCellLoc = getLocationFromClass(elCell)

  // Expand the selection to neighboor cells
  expandShown(gBoard, elCell, elCellLoc.i, elCellLoc.j)
  var cell = gBoard[elCellLoc.i][elCellLoc.j]

  // Toggle the .isShown propety to true
  cell.isShown = true

  // Upon detonating a mine - one life lost each time
  if (cell.isMine) {
    gGame.lives--
    gGame.detonatedMineCount++
    killLife() // Visually renders the amount of lives left
    console.log("You have", gGame.lives, "lives left") // testing
    if (gGame.lives === 0) {
      // Lose scenario
      gGame.isOn = false
      checkGameOver()
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