const fs = require('fs');
const readline = require('readline');

class RangeMap {
  constructor(ranges) {
    this.ranges = ranges;
  }
  get(n) {
    for (let i = 0; i < this.ranges.length; i++) {
      const range = this.ranges[i]
      if (n >= range.sourceRangeStart && n < range.sourceRangeStart + range.range) {
        return n - range.sourceRangeStart + range.destinationRangeStart;
      }
    }
    return n;
  }
}

const parseInput = async (fileName) => {
  const fileStream = fs.createReadStream(fileName);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  let state = 'parsing-seeds';
  const mapsInfo = {};
  let seeds = [];
  let currentMap = '';
  const orderedMapNames = [];
  for await (const line of rl) {
    console.log(line)
    if (line.indexOf(':') >= 0) {
      // start definition state
      if (line.indexOf('seeds:') >= 0) {
        state = 'parsing-seeds';
        const [_, seedsStr] = line.split(':');
        seeds = seedsStr
          .split(/\W+/)
          .filter(i => !!i)
          .map((n) => parseInt(n, 10));
      } else {
        state = 'parsing-map';
        const mapName = line;
        currentMap = mapName;
        orderedMapNames.push(mapName);
      }
    } else if (line.trim().length === 0) {
      // skip
    } else {
      // parse current map
      const [destinationRangeStart, sourceRangeStart, range] = line.split(/\W+/).map(n => parseInt(n, 10));
      mapsInfo[currentMap] = mapsInfo[currentMap] || [];
      const mapInfo =
        { destinationRangeStart, sourceRangeStart, range }
      mapsInfo[currentMap].push({
        ...mapInfo
      });
    }
  }
  const maps = {};
  for (let i = 0; i < orderedMapNames.length; i++) {
    const mapName = orderedMapNames[i];
    const mapInfo = mapsInfo[mapName];
    maps[mapName] = new RangeMap(mapInfo);
  }
  return {
    seeds,
    mapsInfo,
    maps,
    orderedMapNames,
  }
}

const traverse = ({ seeds, maps, orderedMapNames }) => {
  const locations = []
  for (let i = 0; i < seeds.length; i++) {
    let curVal = seeds[i];
    for (let j = 0; j < orderedMapNames.length; j++) {
      const orderedMapName = orderedMapNames[j];
      console.log({ orderedMapName, curVal })
      curVal = maps[orderedMapName].get(curVal);
    }
    locations.push(curVal);
  }
  return locations;
}

const main = async () => {
  // const { seeds, maps } = await parseInput('./input.txt')
  const { seeds, maps, orderedMapNames } = await parseInput('./input.txt')
  console.log(orderedMapNames);
  console.log(seeds)
  console.log(maps)
  const locations = traverse({ seeds, maps, orderedMapNames })
  console.log(locations)
  let smallestLocation = Infinity;
  for (let i = 0; i < locations.length; i++) {
    const location = locations[i]
    if (location < smallestLocation) {
      smallestLocation = location
    }
  }
  console.log(smallestLocation)
}

main();
