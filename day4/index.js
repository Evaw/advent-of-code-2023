const fs = require('fs');
const readline = require('readline');
const main = async () => {
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  let sum = 0;
  for await (const line of rl) {
    const [cardName, allCardNumbers] = line.split(':');
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
          cardSum *= 2;
        }
      }
    }
    console.log(`${cardName}: ${cardNumberArray} | ${winningNumberArray} [${cardSum}] -- ${cardNumberArrayStrings.join(' ')} | ${winningNumberArrayStrings.join(' ')}`)
    sum += cardSum;
  }
  console.log(sum)
}
main();
