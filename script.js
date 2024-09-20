function gameboard() {
	const row = 3;
	const column = 3;
	const board = [];

	for (let i = 0; i < row; i++) {
		board[i] = [];
		for (let e = 0; e < column; e++) {
			board[i].push(cell());
		}
	}

	const getBoard = () => board;

	const printBoard = () => board.map((row) => row.map(cell => cell.getValue()));

	const putMark = (row, column) => board[row][column].setValue(game.getActivePlayer().mark);

	return {
		getBoard,
		printBoard,
		putMark,
	};
}
function cell() {
	let value = 0;

	const setValue = (player) => value = player;

	const getValue = () => value;

	return {
		setValue,
		getValue
	}
}
//Save boards
const boardArr = [gameboard()];
const gameController = (playerOneName = "PlayerOne", playerTwoName = "PlayerTwo") => {
	const display = displayGame();
	const players = [
		{
			name: playerOneName,
			mark: "X",
			wincount: 0,
			playernumb: 0
		},
		{
			name: playerTwoName,
			mark: "O",
			wincount: 0,
			playernumb: 1
		}
	];
	//Record player entered names
	setPlayerName(players);
	//Display the board 
	display.createBoard(boardArr[boardArr.length - 1]);
	//Display scores
	display.displayScores(players);
	let activePlayer = players[0];
	const switchPlayer = () => { activePlayer = activePlayer === players[0] ? players[1] : players[0] };
	const getActivePlayer = () => activePlayer;

	const printNewRound = () => {
		console.log("new print", boardArr[boardArr.length - 1].printBoard());
		console.log(`It is a new game, now is ${getActivePlayer().name}'s turn`)
		display.displayActivePlayer(activePlayer);
	}

	playAgain = function () {
		//Create a new board 
		board = gameboard();
		boardArr.push(board);


		//Display the new board
		display.deleteBoard()
		display.createBoard(boardArr[boardArr.length - 1])
		console.log(getActivePlayer())
		switchPlayer();
		console.log(getActivePlayer())
		printNewRound();
	}
	moveIsPossible = function (row, column) {
		return boardArr[boardArr.length - 1].getBoard()[row][column].getValue() === 0;
	}
	possibleMoves = function (boardArrObject) {
		const list = [];
		boardArrObject.getBoard().forEach(row => row.forEach(cell => cell.getValue() === 0 ? list.push(cell) : false))
		const getList = () => list.length;
		return {
			getList,
		}
	}
	playRound = function (row, column) {
		if (moveIsPossible(row, column)) {
			boardArr[boardArr.length - 1].putMark(row, column);
			display.updateBoard(boardArr[boardArr.length - 1]);

			//Check if win conditions are met
			if (gameWin()) {
				console.log(`${getActivePlayer().name} wins s`);
				getActivePlayer().wincount++;
				display.displayScores(players)
				display.displayEndGame()
				return;
			};
			if (!possibleMoves(boardArr[boardArr.length - 1]).getList() > 0) {
				console.log("Game is a draw")
				display.displayEndGame()
				return;
			}

			switchPlayer();
			display.displayActivePlayer(activePlayer);
			console.log(boardArr[boardArr.length - 1].printBoard());
			console.log(`It is ${getActivePlayer().name}'s turn`)
		}
		else {
			alert("Can not put a mark there.");
			console.log("Can not put a mark there.")
		}

	}
	const gameWin = () => {
		let countDg = 0;
		let countDg1 = 0;
		let columnArr = [];
		//Check rows
		if ((boardArr[boardArr.length - 1].getBoard().filter(row => (row.filter(cell => cell.getValue() === `${getActivePlayer().mark}`).length > 2))).length > 0) {

			return true;
		}

		for (let i = 0; i < 3; i++) {
			//Check columns
			columnArr[i] = [];
			for (let j = 0; j < 3; j++) {
				columnArr[i].push(boardArr[boardArr.length - 1].getBoard()[j][i].getValue())
				if (columnArr[i].length > 2 && columnArr[i].every(cell => cell === `${getActivePlayer().mark}`)) {

					return true;
				}
			}
			//Check diagonals
			if ((boardArr[boardArr.length - 1].getBoard()[i][i].getValue() === `${getActivePlayer().mark}`)) {
				countDg++
			}
			if ((boardArr[boardArr.length - 1].getBoard()[i][2 - i].getValue() === `${getActivePlayer().mark}`)) {
				countDg1++
			}
		}
		//Return true if diagonal win is achieved 
		if (countDg > 2 || countDg1 > 2) {
			return true;
		}

	}


	return {
		playRound,
		getActivePlayer,
		players,
		playAgain
	}
}
//Function for displaying the game state on page
const displayGame = () => {
	const gameEl = document.querySelector("#game");

	//Create divs equal to number of cells on board, display them on id.game
	createBoard = function (boardObject) {
		const rowLength = boardObject.getBoard().length;
		const columnLength = boardObject.getBoard()[0].length;
		gameEl.style.grid = `grid: repeat("${rowLength}", 1fr)/repeat("${columnLength}", 1fr);`;

		for (let i = 0; i < rowLength * columnLength; i++) {
			let el = `<button type="button" row="${Math.trunc(i / rowLength)}" col="${i % columnLength}"></button>`;


			gameEl.innerHTML += el;
		}
		//Add eventlisteners to get user input 
		const cells = document.querySelectorAll("#game > button");
		cells.forEach(cell => cell.classList.add("hover"));
		cells.forEach(node => node.addEventListener("click", (node) => {
			game.playRound(node.target.getAttribute("row"), node.target.getAttribute("col"));
		}));
	}
	const deleteBoard = () => gameEl.innerHTML = "";
	//Update displayed game board 
	updateBoard = function (boardObject) {
		const cells = document.querySelectorAll("#game > button");
		const rowLength = boardObject.getBoard().length;
		const columnLength = boardObject.getBoard()[0].length;


		for (let i = 0; i < rowLength; i++) {
			{
				for (let j = 0; j < columnLength; j++) {

					Array.from(cells).filter(cell =>
						parseInt(cell.getAttribute("row")) === i && parseInt(cell.getAttribute("col")) === j)[0]
						.innerText = boardObject.getBoard()[i][j].getValue() === 0 ? "" : boardObject.getBoard()[i][j].getValue();
				}
			}

		}

	};
	const displayNames = (players) => {
		const title = document.getElementById("player-one");
		const title1 = document.getElementById("player-two");
		title.innerText = players[0].name;
		title1.innerText = players[1].name;
	}
	displayScores = function (players) {
		const score = document.getElementById("score-one");
		const score1 = document.getElementById("score-two");
		score.innerText = players[0].wincount;
		score1.innerText = players[1].wincount;
	}
	const displayActivePlayer = (activePlayer) => {
		const playerListEls = document.querySelectorAll("#title > div");
		playerListEls[1 - activePlayer.playernumb].classList.remove("active-player");
		playerListEls[activePlayer.playernumb].classList.add("active-player");
	}
	const displayEndGame = () => {
		const elArr = document.querySelectorAll("#game > button");
		elArr.forEach(el => {
			el.disabled = true;
			el.classList.remove("hover")
		})

	}
	return {
		createBoard,
		deleteBoard,
		updateBoard,
		displayNames,
		displayScores,
		displayActivePlayer,
		displayEndGame,
	};
};
const setPlayerName = (playersObject) => {
	const playerOne = document.getElementById("name-one");
	const playerTwo = document.getElementById("name-two");
	const startButton = document.getElementById("start");
	const top = document.getElementById("top");
	const bottom = document.getElementById("bottom");
	//Add event listener to play again button
	const againButton = document.getElementById("restart");


	const display = displayGame();
	const changeName = () => {
		if (playerOne.value.length != 0 && playerTwo.value.length != 0) {
			againButton.addEventListener("click", e => gameController().playAgain());
			//Save player entered names
			playersObject[0].name = playerOne.value;
			playersObject[1].name = playerTwo.value;
			//Add animations to main screen 
			startButton.classList.add("disappear");
			top.classList.add("slide-right");
			bottom.classList.add("slide-left");
			//Display player entered names 
			display.displayNames(playersObject)
		}
		else {
			alert("Please enter a name for both of players")
		}
	};

	startButton.addEventListener("click", (e) => {
		changeName()
	})


}
const game = gameController();

// FIX SCORE NOT DISPLAYING CORRECTLY AFTER PLAYAGAIN 