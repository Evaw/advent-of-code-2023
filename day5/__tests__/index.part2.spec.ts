import { describe, it } from "node:test";
import {
  Range,
  RangeMapping,
  createRange,
  splitRangeToMappings,
} from "../index.part2";
import assert from "node:assert";
// node --test-only --require ts-node/register __tests__/index.part2.spec.ts
// node  --require ts-node/register __tests__/index.part2.spec.ts

const cr = createRange;
const cm = (start: number, end: number): RangeMapping => {
  return {
    destinationRangeEnd: 0,
    destinationRangeStart: 0,
    sourceRangeStart: start,
    sourceRangeEnd: end,
    range: end - start,
  };
};
/*
 *                       |------range----|
 * 1      |--mapping-|
 * 2                   |---mapping-|
 * 3                   |------mapping--------|
 * 4                        |-mapping-|
 * 5                        |-mapping--------|
 * 6                                            |--mapping--|
 */
it("1", () => {
  const actual = splitRangeToMappings(cr(50, 100), [cm(0, 25)]);
  assert.deepStrictEqual(actual, [{ start: 50, end: 100, range: 50 }]);
});
it("2", () => {
  const actual = splitRangeToMappings(cr(50, 100), [cm(25, 75)]);
  console.log(actual);
  assert.deepStrictEqual(actual, [
    { start: 50, end: 75, range: 25 },
    { start: 75, end: 100, range: 25 },
  ]);
});

it("3", () => {
  const actual = splitRangeToMappings(cr(50, 100), [cm(0, 150)]);
  console.log(actual);
  assert.deepStrictEqual(actual, [{ start: 50, end: 100, range: 50 }]);
});

it("4", () => {
  const actual = splitRangeToMappings(cr(50, 100), [cm(60, 70)]);
  console.log(actual);
  assert.deepStrictEqual(actual, [
    { start: 50, end: 60, range: 10 },
    { start: 60, end: 70, range: 10 },
    { start: 70, end: 100, range: 30 },
  ]);
});

it("5", () => {
  const actual = splitRangeToMappings(cr(50, 100), [cm(75, 125)]);
  console.log(actual);
  assert.deepStrictEqual(actual, [
    { start: 50, end: 75, range: 25 },
    { start: 75, end: 100, range: 25 },
  ]);
});

it("6", () => {
  const actual = splitRangeToMappings(cr(50, 100), [cm(125, 150)]);
  console.log(actual);
  assert.deepStrictEqual(actual, [{ start: 50, end: 100, range: 50 }]);
});
it("all", () => {
  const actual = splitRangeToMappings(cr(50, 100), [
    cm(0, 25),
    cm(25, 75),
    cm(75, 125),
    cm(125, 150),
  ]);
  console.log(actual);
  assert.deepStrictEqual(actual, [cr(50, 75), cr(75, 100)]);
});
it("given", () => {
  const actual = splitRangeToMappings(cr(79, 79 + 14), [
    cm(98, 98 + 2),
    cm(50, 50 + 48),
  ]);
  console.log(actual);
  assert.deepStrictEqual(actual, [cr(79, 79 + 14)]);
});
it("given 2", () => {
  const actual = splitRangeToMappings(cr(55, 55 + 13), [
    cm(98, 98 + 2),
    cm(50, 50 + 48),
  ]);
  console.log(actual);
  assert.deepStrictEqual(actual, [cr(55, 55 + 13)]);
});
it("given 3", () => {
  const actual = splitRangeToMappings(cr(81, 95), [
    cm(98, 98 + 2),
    cm(50, 50 + 48),
  ]);
  console.log(actual);
  assert.deepStrictEqual(actual, [cr(81, 95)]);
});
