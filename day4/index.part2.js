const fs = require('fs');
const readline = require('readline');
const getWinningMatches = (line) => {
  const [_, allCardNumbers] = line.split(':');
  const [cardNumbers, winningNumbers] = allCardNumbers.split('|');
  const cardNumberArrayStrings = cardNumbers.split(' ').filter(n => !!n);
  const winningNumberArrayStrings = winningNumbers.split(' ').filter(n => !!n)
  const cardNumberArray = cardNumberArrayStrings.map((cardNumber) => parseInt(cardNumber));
  const winningNumberArray = winningNumberArrayStrings.map((winningNumber) => parseInt(winningNumber));
  const winningHash = {};
  for (let i = 0; i < winningNumberArray.length; i++) {
    winningHash[winningNumberArray[i]] = true;
  }
  let cardSum = 0;
  for (let i = 0; i < cardNumberArray.length; i++) {
    if (winningHash[cardNumberArray[i]]) {
      if (cardSum === 0) { cardSum = 1; }
      else {
        cardSum++;
      }
    }
  }
  return cardSum;
}
const main = async () => {
  const fileStream = fs.createReadStream('./input.txt');
  const lines = [];
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const lineScores = [];
  let i = 0;
  for await (const line of rl) {
    const winningMatches = getWinningMatches(line)
    lineScores[i] = (lineScores[i] || 0) + 1;
    for (let k = 0; k < lineScores[i]; k++) {
      for (let j = 0; j < winningMatches; j++) {
        // console.log({
        //   i, j, winningMatches
        // })
        if (!lineScores[i + j + 1]) {
          lineScores[i + j + 1] = 1
        } else {
          lineScores[i + j + 1]++;
        }
      }
      // console.log(`${line} (${winningMatches}) [${lineScores}]`)
    }
    i++;
  }
  // console.log(lineScores)
  console.log(lineScores.reduce((prev, cur) => prev + cur, 0))
}
main();
