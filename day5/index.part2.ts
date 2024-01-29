//  node  --require ts-node/register index.part2.ts
import fs from "fs";
import readline from "readline";
import util from "node:util";
export interface Range {
  start: number;
  end: number;
  range: number;
}
export interface RangeMapping {
  sourceRangeStart: number;
  range: number;
  sourceRangeEnd: number;
  destinationRangeStart: number;
  destinationRangeEnd: number;
}
const isWithinMappingSource = (n: number, rangeMapping: RangeMapping) => {
  // ?<=
  return n >= rangeMapping.sourceRangeStart && n < rangeMapping.sourceRangeEnd;
};
const getNMapping = (n: number, rangeMapping: RangeMapping): number => {
  if (isWithinMappingSource(n, rangeMapping)) {
    return (
      n - rangeMapping.sourceRangeStart + rangeMapping.destinationRangeStart
    );
  }
  throw new Error("n is not in range of mapping");
};
export const createRange = (start: number, end: number): Range => {
  return {
    start,
    end,
    range: end - start,
  };
};
export const splitRangeToMappings = (
  rangeIn: Range,
  rangeMappings: RangeMapping[]
): Range[] => {
  const dbg = (...args: any[]): void => {
    console.log(`splitRangeToMappings`, ...args);
  };
  const splitRanges: Range[] = [];
  const range: Range = { ...rangeIn };
  dbg({ range, rangeMappings });
  for (let i = 0; i < rangeMappings.length; i++) {
    /*
     *                       |------range----|
     * 1      |--mapping-|
     * 2                   |---mapping-|
     * 3                   |------mapping--------|
     * 4                        |-mapping-|
     * 5                        |-mapping--------|
     * 6                                            |--mapping--|
     */
    const curRangeMapping = rangeMappings[i];
    if (isWithinMappingSource(range.start, curRangeMapping)) {
      /*
       *                       |------range----|
       * 2                   |---mapping-|
       * 3                   |------mapping--------|
       */
      dbg("2,3");
      const newRange: Range = {
        start: range.start,
        end: Infinity,
        range: Infinity,
      };
      if (isWithinMappingSource(range.end, curRangeMapping)) {
        /*
         *                       |------range----|
         * 3                   |------mapping--------|
         */
        // end matched first mapping so add it
        dbg("3");
        newRange.end = range.end;
        newRange.range = newRange.end - newRange.start;
        if (newRange.range) {
          splitRanges.push(newRange);
        }
      } else {
        /*
         *                       |------range----|
         * 2                   |---mapping-|
         */
        // end did not match, end new range here and modify the range to try next
        dbg("2");
        newRange.end = curRangeMapping.sourceRangeEnd;
        newRange.range = newRange.end - newRange.start;
        if (newRange.range) {
          splitRanges.push(newRange);
        }
        if (
          i === rangeMappings.length - 1 &&
          newRange.start !== curRangeMapping.sourceRangeEnd
        ) {
          dbg("2:last");
          const newRange = createRange(curRangeMapping.sourceRangeEnd, range.end);
          if (newRange.range) {
            splitRanges.push(newRange);
          }
          return splitRanges;
        }
        range.start = curRangeMapping.sourceRangeEnd;
      }
    } else {
      // start is not within mappings
      /*
       *                       |------range----|
       * 1      |--mapping-|
       * 4                        |-mapping-|
       * 5                        |-mapping--------|
       * 6                                            |--mapping--|
       */
      dbg("1,4,5,6", i);
      if (isWithinMappingSource(range.end, curRangeMapping)) {
        // end is in mapping
        /*
         *                       |------range----|
         * 5                        |-mapping--------|
         */
        dbg("5");
        const newRange1 =createRange(range.start, curRangeMapping.sourceRangeStart);
        const newRange2 =createRange(curRangeMapping.sourceRangeStart, range.end);
        if (newRange1.range) {
          splitRanges.push(newRange1);
        }
        if (newRange2.range) {
          splitRanges.push(newRange2);
        }
      } else {
        /*
         *                       |------range----|
         * 1      |--mapping-|
         * 4                        |-mapping-|
         * 6                                            |--mapping--|
         */
        if (
          curRangeMapping.sourceRangeStart >= range.start &&
          // ?<=
          curRangeMapping.sourceRangeEnd <= range.end
        ) {
          dbg("4");
          splitRanges.push(...[
            createRange(range.start, curRangeMapping.sourceRangeStart),
            createRange(
              curRangeMapping.sourceRangeStart,
              curRangeMapping.sourceRangeEnd
            ),
            createRange(curRangeMapping.sourceRangeEnd, range.end)
            ].filter(r => r.range));
        } else if (i === rangeMappings.length - 1) {
          // last range, since no more next need to add range
          dbg("1,6: last");
          const newRange: Range = createRange(range.start, range.end);
          if (splitRanges.length) {
            const lastRange = splitRanges[splitRanges.length - 1];
            if (
              lastRange.start !== newRange.start &&
              lastRange.end !== newRange.end
            ) {
              splitRanges.push(newRange);
            }
            return splitRanges;
          } else {
            if (newRange.range) {
              splitRanges.push(newRange);
            }
          }
        }
      }
    }
  }
  return splitRanges;
};
const getNewRanges = (
  range: Range,
  rangeMappings: RangeMapping[],
  newRanges: Range[]
): Range[] => {
  const splitRanges: Range[] = [];
  for (let i = 0; i < rangeMappings.length; i++) {
    const curRangeMapping = rangeMappings[i];
    if (isWithinMappingSource(range.start, curRangeMapping)) {
      const newRange: Range = {
        start: curRangeMapping.destinationRangeStart,
        end: Infinity,
        range: Infinity,
      };
      if (isWithinMappingSource(range.end, curRangeMapping)) {
        // end matched first mapping so add it
        newRange.end = getNMapping(range.end, curRangeMapping);
        newRange.range = newRange.end - newRange.start;
        splitRanges.push(newRange);
      } else {
        // did not match, since sorted it must be before any mappings, so same as the range provided
        newRange.end = range.end;
        newRange.range = newRange.end - newRange.start;
        splitRanges.push(newRange);
      }
    }
  }

  return [];
};
class RangeMap {
  rangeMappings: RangeMapping[];
  constructor(rangeMappings: RangeMapping[]) {
    rangeMappings.sort((a, b) => {
      return a.sourceRangeStart - b.sourceRangeStart;
    });
    this.rangeMappings = rangeMappings;
  }
  get(n: number, includeEnd?: boolean) {
    const [result, _] = this.getWithRangeIndex(n, includeEnd);
    return result;
  }
  getWithRangeIndex(n: number, includeEnd?: boolean) {
    for (let i = 0; i < this.rangeMappings.length; i++) {
      const range = this.rangeMappings[i];
      // ?<=
      const condition = includeEnd ?
        n >= range.sourceRangeStart && n <= range.sourceRangeEnd
        :
        n >= range.sourceRangeStart && n < range.sourceRangeEnd
      if (condition) {
        return [n - range.sourceRangeStart + range.destinationRangeStart, i];
      }
    }
    return [n, -1];
  }

  getNewRangesBack(range: Range, newRanges: Range[]) {
    if (
      this.rangeMappings[0] &&
      !isWithinMappingSource(range.start, this.rangeMappings[0])
    ) {
      // start is not within the first range source, since sorted all other ranges are above
      const newRange: Range = {
        start: range.start,
        end: Infinity,
        range: Infinity,
      };
      if (isWithinMappingSource(range.end, this.rangeMappings[0])) {
        // end matched first mapping so add it
        newRange.end = getNMapping(range.end, this.rangeMappings[0]);
        newRange.range = newRange.end - newRange.start;
        newRanges.push(newRange);
      } else {
        // did not match, since sorted it must be before any mappings, so same as the range provided
        newRange.end = range.end;
        newRange.range = newRange.end - newRange.start;
        newRanges.push(newRange);
      }
    }
    for (let i = 0; i < this.rangeMappings.length; i++) {
      let curRangeMapping = this.rangeMappings[i];
      if (isWithinMappingSource(range.start, curRangeMapping)) {
        // start range matched
        const newRange: Range = {
          start: curRangeMapping.destinationRangeStart,
          end: Infinity,
          range: Infinity,
        };
        if (isWithinMappingSource(range.end, curRangeMapping)) {
          (newRange.end = curRangeMapping.destinationRangeEnd),
            (newRange.range =
              curRangeMapping.destinationRangeEnd -
              curRangeMapping.destinationRangeStart);
          newRanges.push();
        } else {
          // try next, end prev mapping and create a new start
          if (i < this.rangeMappings.length) {
            //
          }
        }
      }
    }
  }
  getRanges(other: Range[]): Range[] {
    const newRanges: Range[] = [];
    for (const otherRange of other) {
      const ans: Range[] = [];
      // getNewRanges(otherRange, ans);
      newRanges.push(...ans);
    }
    return newRanges;
  }
}

const parseInput = async (fileName: string) => {
  const fileStream = fs.createReadStream(fileName);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  let state = "parsing-seeds";
  const mapsInfo: Record<string, RangeMapping[]> = {};
  const seeds: Range[] = [];
  let currentMap = "";
  const orderedMapNames: string[] = [];
  for await (const line of rl) {
    console.log(line);
    if (line.indexOf(":") >= 0) {
      // start definition state
      if (line.indexOf("seeds:") >= 0) {
        state = "parsing-seeds";
        const [_, seedsStr] = line.split(":");
        const seedsRaw = seedsStr
          .split(/\W+/)
          .filter((i: string) => !!i)
          .map((n: string) => parseInt(n, 10));
        for (let i = 0; i < seedsRaw.length; i += 2) {
          seeds.push({
            start: seedsRaw[i],
            end: seedsRaw[i] + seedsRaw[i + 1],
            range: seedsRaw[i + 1],
          });
        }
      } else {
        state = "parsing-map";
        const mapName = line;
        currentMap = mapName;
        orderedMapNames.push(mapName);
      }
    } else if (line.trim().length === 0) {
      // skip
    } else {
      // parse current map
      const [destinationRangeStart, sourceRangeStart, range] = line
        .split(/\W+/)
        .map((n: string) => parseInt(n, 10));
      mapsInfo[currentMap] = mapsInfo[currentMap] || [];
      const mapInfo: RangeMapping = {
        sourceRangeStart,
        sourceRangeEnd: sourceRangeStart + range,
        range,
        destinationRangeStart,
        destinationRangeEnd: destinationRangeStart + range,
      };
      mapsInfo[currentMap].push({
        ...mapInfo,
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
  };
};
interface TraverseParams {
  seeds: Range[];
  maps: Record<string, RangeMap>;
  orderedMapNames: string[];
}
interface TraverseRangeParams {
  seeds: Range[];
  maps: Record<string, RangeMap>;
  orderedMapNames: string[];
}
const traverseRange = ({
  seeds,
  maps,
  orderedMapNames,
}: TraverseRangeParams) => {
  const dbg = (...args: any[]): void => {
    console.log(`traverse `, ...args);
  };
  const locations: number[] = [];
  let curRanges: Range[] = [...seeds];
  for (let j = 0; j < orderedMapNames.length; j++) {
    const orderedMapName = orderedMapNames[j];
    const currentMappingMap = maps[orderedMapName];
    const newSplitRanges: Range[] = [];
    // console.log({ orderedMapName, curVal })
    for (let k = 0; k < curRanges.length; k++) {
      const splitRanges = splitRangeToMappings(
        curRanges[k],
        currentMappingMap.rangeMappings
      );
      newSplitRanges.push(...splitRanges);
    }
    dbg("splitting", {
      orderedMapName,
      curRanges,
      newSplitRanges,
      currentMappingMap: currentMappingMap.rangeMappings,
    });
    curRanges = newSplitRanges.map((r) => {
      return createRange(
        currentMappingMap.get(r.start),
        currentMappingMap.get(r.end, true)
      );
    });
    dbg("new ranges ", orderedMapName, curRanges);
  }
  return curRanges;
};
const traverse = ({ seeds, maps, orderedMapNames }: TraverseParams) => {
  const locations: number[] = [];
  for (let i = 0; i < seeds.length; i++) {
    for (let k = 0; k < seeds[i].range; k++) {
      let curVal: number = seeds[i].start + k;
      for (let j = 0; j < orderedMapNames.length; j++) {
        const orderedMapName = orderedMapNames[j];
        // console.log({ orderedMapName, curVal })
        curVal = maps[orderedMapName].get(curVal);
      }
      locations.push(curVal);
    }
  }
  return locations;
};

const main = async () => {
  // const { seeds, maps, mapsInfo, orderedMapNames } = await parseInput(
  //   "./given.txt"
  // );
  const { seeds, maps, mapsInfo, orderedMapNames } = await parseInput(
    "./input.txt"
  );
  console.log(orderedMapNames);
  console.log(seeds);
  console.log(
    util.inspect(maps, { showHidden: false, depth: null, colors: true })
  );
  const locations = traverseRange({ seeds, maps, orderedMapNames });
  console.log(locations);
  let smallestLocation = Infinity;
  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    if (location.start < smallestLocation) {
      smallestLocation = location.start;
    }
  }
  console.log(smallestLocation);
};

main();
