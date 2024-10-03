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
	let board = gameboard();
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
	display.createBoard(board);
	//Display scores
	display.displayScores(players);
	let activePlayer = players[0];
	const switchPlayer = () => { activePlayer = activePlayer === players[0] ? players[1] : players[0] };
	const getActivePlayer = () => activePlayer;

	const printNewRound = () => {
		console.log("new print", board.printBoard());
		console.log(`It is a new game, now is ${getActivePlayer().name}'s turn`)
		display.displayActivePlayer(activePlayer);
	}

	playAgain = function () {
		//Create a new board 
		board = gameboard();



		//Display the new board
		display.deleteBoard()
		display.createBoard(board)
		display.displayScores(players);
		switchPlayer();
		printNewRound();
	}
	moveIsPossible = function (row, column) {
		return board.getBoard()[row][column].getValue() === 0;
	}
	possibleMoves = function (board) {
		const list = [];
		board.getBoard().forEach(row => row.forEach(cell => cell.getValue() === 0 ? list.push(cell) : false))
		const getList = () => list.length;
		return {
			getList,
		}
	}
	playRound = function (row, column) {
		if (moveIsPossible(row, column)) {
			board.putMark(row, column);
			display.updateBoard(board);

			//Check if win conditions are met
			if (gameWin()) {
				console.log(`${getActivePlayer().name} wins s`);
				getActivePlayer().wincount++;
				display.displayScores(players)
				display.displayEndGame()
				display.winAnim(getActivePlayer())
				return;
			};
			//Check for a draw
			if (!possibleMoves(board).getList() > 0) {
				console.log("Game is a draw")
				display.displayEndGame()
				display.drawAnim()
				return;
			}

			switchPlayer();
			display.displayActivePlayer(activePlayer);
			console.log(board.printBoard());
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
		if ((board.getBoard().filter(row => (row.filter(cell => cell.getValue() === `${getActivePlayer().mark}`).length > 2))).length > 0) {

			return true;
		}

		for (let i = 0; i < 3; i++) {
			//Check columns
			columnArr[i] = [];
			for (let j = 0; j < 3; j++) {
				columnArr[i].push(board.getBoard()[j][i].getValue())
				if (columnArr[i].length > 2 && columnArr[i].every(cell => cell === `${getActivePlayer().mark}`)) {

					return true;
				}
			}
			//Check diagonals
			if ((board.getBoard()[i][i].getValue() === `${getActivePlayer().mark}`)) {
				countDg++
			}
			if ((board.getBoard()[i][2 - i].getValue() === `${getActivePlayer().mark}`)) {
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
		playAgain,
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
	const displayScores = (players) => {
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
	const winAnim = (activePlayer) => {

		const wrapper = document.createElement("div")
		wrapper.classList.add("winAnim");
		gameEl.appendChild(wrapper);
		const divArr = [];
		const activateOrder = [0, 1, 2, 5, 8, 7, 6, 3, 4];
		for (let i = 0; i < 9; i++) {
			const div = document.createElement("div");
			wrapper.appendChild(div);
			divArr.push(div);
		}
		const delayedActivation = (order, iterator) => {
			divArr[order[iterator]].classList.add("turnMainClr");
			//when the last aimation is played, activate player name win animation
			if ((order.length - 1) === iterator) {

				divArr[order[iterator]].classList.add("turnMainClr");

				setTimeout(() => {

					divArr[activateOrder[activateOrder.length - 1]].innerText = activePlayer.name + " wins";
					divArr[activateOrder[activateOrder.length - 1]].classList.add("scale3x");
				}, ((order.length - iterator) * 300));
			}
		}
		for (let j = 0; j < 9; j++) {
			setTimeout(() => { delayedActivation(activateOrder, j) }, ((j) * 300));

		}

	}
	const drawAnim = () => {
		const wrapper = document.createElement("div")
		wrapper.classList.add("winAnim");
		gameEl.appendChild(wrapper);
		const divArr = [];
		const activateOrder = [0, 1, 2, 5, 4, 3, 6, 7, 8];
		for (let i = 0; i < 9; i++) {
			const div = document.createElement("div");
			wrapper.appendChild(div);
			divArr.push(div);
		}
		const delayedActivation = (order, iterator) => {
			//when the last animation is played, activate draw animation
			if (iterator === 4) {

				divArr[order[iterator]].classList.add("turnMainClr");

				setTimeout(() => {

					divArr[4].innerText = "It is a draw"
					divArr[4].classList.add("scale3x");
				}, ((order.length - iterator) * 400));

			}
			else {

				divArr[order[iterator]].classList.add("turnMainClr");
			}
		}
		for (let j = 0; j < 9; j++) {
			//delay variable to delay playing of last animation
			let delay = j;
			setTimeout(() => { delayedActivation(activateOrder, j) }, ((delay) * 400));

		}

	}
	return {
		createBoard,
		deleteBoard,
		updateBoard,
		displayNames,
		displayScores,
		displayActivePlayer,
		displayEndGame,
		drawAnim,
		winAnim,
	};
};
const setPlayerName = (playersObject) => {
	const playerOne = document.getElementById("name-one");
	const playerTwo = document.getElementById("name-two");
	const startButton = document.getElementById("start");
	const top = document.getElementById("top");
	const bottom = document.getElementById("bottom");


	const display = displayGame();
	const changeName = () => {
		//playerOne.value.length != 0 && playerTwo.value.length != 0
		if (1 == 1) {
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


//Add event listener to play again button
const againButton = document.getElementById("restart");
againButton.addEventListener("click", e => game.playAgain());

