
const fs = require('fs');
const readline = require('readline');
const main = async () => {
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
  const getMinPerColor = (trials) => {
    const colors = {
      red: 0,
      green: 0,
      blue: 0,
    }
    for (let i = 0; i < trials.length; i++) {
      const trial = trials[i];
      const trialColors = Object.keys(trial);
      for (j = 0; j < trialColors.length; j++) {
        const trialColor = trialColors[j];
        const colorCubeCount = trial[trialColor]
        // console.log(colorCubeCount, trial, trialColor)
        if (colorCubeCount > colors[trialColor]) {
          colors[trialColor] = colorCubeCount
        }
      }

    }
    return colors;
  }
  let sumOfPower = 0;
  for await (const line of rl) {
    const [gameIDtext, gamesText] = line.split(':');
    const gameID = parseInt(gameIDtext.split(' ')[1])
    const games = gamesText.split(';').map(parseGame);
    const minPerColor = getMinPerColor(games)
    const powerOfSet = Object.values(minPerColor).reduce((prev, cur) => {
      return prev * cur;
    }, 1)
    console.log(gameID, games, minPerColor, powerOfSet)
    sumOfPower += powerOfSet;
  }
  console.log(sumOfPower)
}
main();
