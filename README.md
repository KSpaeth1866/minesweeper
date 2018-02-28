# Minesweeper

- Runs entirely in the browser, does not require any backend code
- All state needs to be in the browser (localStorage)
- Let the player control the size of the board and number of mines added
- Use only jQuery

![](./assets/mine-example.png)

## Rules
- Game goal is to find/mark all mines
- When a square is clicked reveal if its a mine or reveal all bordering squares with the number adjacent mines
- When a square not bordering a mine is clicked reveal all bordering empty and bordering mine squares
- Let users mark squares they think have a mine

## Running
- npm install
- npm start
- view at http://localhost:8080/

All game code can be found in the public directory. i.e. `game.js` `game.html` `game.css`
