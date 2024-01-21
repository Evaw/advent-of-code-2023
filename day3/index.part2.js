const fs = require('fs');
const readline = require('readline');
const isDigit = (char) => {
  const charcode = char.charCodeAt(0);
  return charcode - 48 >= 0 && charcode - 48 <= 9
}
const hasCharacterSurrounding = (text, row, startCol, endCol, starMap) => {
  const dx = [-1, 0, 1];
  const dy = [-1, 0, 1];
  for (let col = startCol; col < endCol; col++) {
    for (let i = 0; i < dy.length; i++) {
      for (let j = 0; j < dx.length; j++) {
        const x = col + dx[j];
        const y = row + dy[i];
        const inBound = y >= 0 && y < text.length && x >= 0 && x < text[y].length;
        const insideNumber = x >= startCol && x < endCol && y === row;
        if (text[row].substring(startCol, endCol) === '854') {

          console.log(`text[${y},${x}] = ${text[y][x]} ${inBound} ${insideNumber}`);
        }
        if (inBound && !isDigit(text[y][x]) && text[y][x] === '*' && !insideNumber) {
          console.log(`add number: [${row}, ${startCol}]: ${text[row].substring(startCol, endCol)} due to [${y}, ${x}]${text[y][x]}`)
          const starKey = `${y},${x},${text[y][x]}`;
          starMap[starKey] = starMap[starKey] || [];
          starMap[starKey].push(parseInt(text[row].substring(startCol, endCol)));
          return
        }
      }
    }
  }
  console.log(`no adjacent char for [${row}, ${startCol}-${endCol}] ${text[row].substring(startCol, endCol)}`)
  return false;
}
const sumNumbersWithAdjacentSymbol = (text) => {
  let sum = 0;
  const starMap = {};
  for (let row = 0; row < text.length; row++) {
    for (let col = 0; col < text[row].length; col++) {
      let c = text[row][col];
      let startNumberCol = col;
      let endNumberCol = col + 1;
      if (isDigit(c)) {
        // number
        while (col < text[row].length && isDigit(c)) {
          col++;
          c = text[row][col];
          if (!c) {
            // console.log(`no char ${row}, ${col}, started with :${startNumberCol}`)
          }
        }
        endNumberCol = col;
        hasCharacterSurrounding(text, row, startNumberCol, endNumberCol, starMap)
      }
    }
  }
  console.log(starMap);
  let acc = 0;
  Object.values(starMap).forEach((value) => {
    if (value.length === 2) {
      acc += value[0] * value[1];
    }
  });
  console.log(acc);
}

const main = async () => {
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  text = [];
  for await (const line of rl) {
    text.push(line)
  }
  sumNumbersWithAdjacentSymbol(text)
}
main();
