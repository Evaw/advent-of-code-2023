import fs from 'fs';
import readline from 'readline';

interface Range {
  sourceRangeStart: number;
  range: number;
  sourceRangeEnd: number;
  destinationRangeStart: number;
  destinationRangeEnd: number;
}

class RangeMap {
  ranges: Range[];
  constructor(ranges: Range[]) {
    this.ranges = ranges;
  }
  get(n: number) {
    const [result, _] = this.getWithRangeIndex(n);
    return result;
  }
  getWithRangeIndex(n: number) {
    for (let i = 0; i < this.ranges.length; i++) {
      const range = this.ranges[i]
      if (n >= range.sourceRangeStart && n < range.sourceRangeStart + range.range) {
        return [n - range.sourceRangeStart + range.destinationRangeStart, i];
      }
    }
    return [n, -1];
  }
  getNewRanges(range: Range): Range[] {
    const newRanges: Range[] = [];
    const rangeStart = this.get(range.sourceRangeStart)
    console.log(rangeStart);
    return newRanges;
  }
  getRanges(other: RangeMap): RangeMap {
    const newRanges: Range[] = [];
    for (const otherRange of other.ranges) {
      const returnVal = this.getNewRanges(otherRange);
      newRanges.push(...returnVal)
    }
    return new RangeMap(newRanges);
  }
}

const parseInput = async (fileName: string) => {
  const fileStream = fs.createReadStream(fileName);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  let state = 'parsing-seeds';
  const mapsInfo: Record<string, Range[]> = {};
  let seeds: number[] = [];
  let currentMap = '';
  const orderedMapNames: string[] = [];
  for await (const line of rl) {
    console.log(line)
    if (line.indexOf(':') >= 0) {
      // start definition state
      if (line.indexOf('seeds:') >= 0) {
        state = 'parsing-seeds';
        const [_, seedsStr] = line.split(':');
        seeds = seedsStr
          .split(/\W+/)
          .filter((i: string) => !!i)
          .map((n: string) => parseInt(n, 10));
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
      const mapInfo: Range =
      {
        destinationRangeStart,
        sourceRangeStart,
        range,
        destinationRangeEnd: destinationRangeStart + range,
        sourceRangeEnd: sourceRangeStart + range
      }
      mapsInfo[currentMap].push({
        ...mapInfo
      });
    }
  }
  const maps: Record<string, RangeMap> = {};
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
interface TraverseParams {
  seeds: number[];
  maps: Record<string, RangeMap>;
  orderedMapNames: string[];
}
const traverse = ({ seeds, maps, orderedMapNames }: TraverseParams) => {
  const locations: number[] = []
  for (let i = 0; i < seeds.length; i++) {
    const seedNumber = seeds[i];
    const seedRange = seeds[i + 1];
    i++;
    for (let k = 0; k < seedRange; k++) {
      let curVal: number = seedNumber + k;
      for (let j = 0; j < orderedMapNames.length; j++) {
        const orderedMapName = orderedMapNames[j];
        // console.log({ orderedMapName, curVal })
        curVal = maps[orderedMapName].get(curVal);
      }
      locations.push(curVal);
    }
  }
  return locations;
}

const main = async () => {
  // const { seeds, maps } = await parseInput('./input.txt')
  const { seeds, maps, orderedMapNames } = await parseInput('./given.txt')
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
