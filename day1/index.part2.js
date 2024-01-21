const fs = require('fs');
const readline = require('readline');
const main = async () => {
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  let sum = 0;
  let s = 0;
  let e = 0;
  const words = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  ];
  const wordsToNum = {
    "0": 0, "1": 1, "2": 2, "3": 3, "4": 4,
    "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9,
  };
  for await (const line of rl) {
    let min = Infinity
    let minN = 0;
    let max = -1
    let maxN = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const idx = line.indexOf(word);
      const lastIdx = line.lastIndexOf(word);
      if (idx >= 0 && min > idx) {
        min = idx;
        minN = word;
      }
      if (lastIdx >= 0 && max < lastIdx) {
        max = lastIdx;
        maxN = word;
      }
    }
    const s = wordsToNum[minN];
    const e = wordsToNum[maxN];
    const n = 10 * s + e;
    sum += n;
    console.log(n, sum, s, e, line);
  }
  console.log({ sum })
};

main();

