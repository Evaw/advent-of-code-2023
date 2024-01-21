
const fs = require('fs');
const readline = require('readline');
const main = async () => {
  const getIsGamePossible = (avail, trials) => {
    for (let i = 0; i < trials.length; i++) {
      const trial = trials[i]
      const colors = Object.keys(trial)

      for (let j = 0; j < colors.length; j++) {
        const color = colors[j]
        // console.log(color, colors, trial, trial[color], avail[color])
        if (trial[color] > avail[color]) {
          return false;
        }
      }
    }
    return true;
  }
  const parseGame = (gameText) => {
    const trimmed = gameText.trim();
    const trials = trimmed.split(', ');
    const colors = {}
    for (let i = 0; i < trials.length; i++) {
      const [numberText, color] = trials[i].split(' ')
      const number = parseInt(numberText, 10);
      if (colors[color]) {
        process.exit(1)
      }
      colors[color] = number;
    }
    return colors;
  }
  // const fileStream = fs.createReadStream('./input.txt');
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  let possibleGameCount = 0;
  for await (const line of rl) {
    const [gameIDtext, gamesText] = line.split(':');
    const gameID = parseInt(gameIDtext.split(' ')[1])
    const games = gamesText.split(';').map(parseGame);
    const avail = {
      red: 12,
      green: 13,
      blue: 14,
    }
    const isPossible = getIsGamePossible(avail, games)
    if (isPossible) {
      possibleGameCount += gameID;
    }
    console.log(gameID, games, isPossible, possibleGameCount)
  }
  console.log(possibleGameCount)
}
main();
