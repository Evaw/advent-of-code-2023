const fs = require('fs');
const readline = require('readline');
const main = async () => {
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    console.log(line)
  }
}
main();
