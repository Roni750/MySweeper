'use strict'

function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                location: { i, j }
            }
        }
    }

    // Place fixed mines
    board[1][2].isMine = true
    board[3][1].isMine = true
    return board
}

function renderBoard(board, selector) {
    setMinesNegsCount(board)
    var strHTML = '<table><tbody>'
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            const className = (cell.isMine) ? `blank mine cell-${i}-${j}` : `blank cell-${i}-${j}`
            var isMine = (cell.isMine) ? MINE_IMG : cell.minesAroundCount
            strHTML += `<td onclick="onCellClicked(this)" class="${className}"><p>${isMine}</p></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

function getAmountOfNegsMine(board, row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j > board[i].length - 1 || (i === row && j === col)) continue
            board[i][j].minesAroundCount++
        }
    }
    return
}

function setMinesNegsCount(board) {
    // Count mines around each cell and set the cell's minesAroundCount
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            const currCell = board[i][j]
            if (currCell.isMine) getAmountOfNegsMine(board, i, j)
        }
    }
    return
}

// location is an object like this - { i: 2, j: 7 }
function renderCell(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

function renderCherry(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

function showElement(elem, elem2, msg) {
    var elShowModal = document.querySelector(elem)
    elShowModal.querySelector(elem2).innerText = msg
    elShowModal.classList.remove('hide')
}

function hideElement(elem) {
    var elHideModal = document.querySelector(elem)
    elHideModal.classList.add('hide')
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function findEmptyCells(board) {
    const emptyCells = [];

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j] === ' ') {
                emptyCells.push({ i, j });
            }
        }
    }
    return emptyCells;
}

function getLocationFromClass(element) {
    const classString = element.className;
    const match = classString.match(/cell-(\d+)-(\d+)/);
    if (!match) {
        return null;
    }
    const [_, i, j] = match;
    return { i: parseInt(i), j: parseInt(j) };
}

function hideNums() {
    var nums = document.querySelectorAll('p')
    for (var i = 0; i < nums.length; i++) {
        var num = nums[i]
        num.classList.add('hide')
    }
}

function showNums(currCell) {
    var nums = document.querySelectorAll('p')
    for (var i = 0; i < nums.length; i++) {
        var num = nums[i]
        num.classList.remove('hide')
    }
}