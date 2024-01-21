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
  for await (const line of rl) {
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c >= '0' && c <= '9') {
        s = c.charCodeAt(0) - 48;
        break;
      }
    }
    for (let i = line.length - 1; i >= 0; i--) {
      const c = line[i];
      if (c >= '0' && c <= '9') {
        e = c.charCodeAt(0) - 48;
        break;
      }
    }
    const n = 10 * s + e;
    sum += n;
    console.log(n, sum, s, e, line);
  }
  console.log({ sum })
};

main();

