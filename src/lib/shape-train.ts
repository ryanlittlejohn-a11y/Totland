import { SHAPES, shuffle } from "./content";

export interface TrainCar { id: string; shape: string }
export interface ShapeTrainSet {
  /** full pattern, left to right */
  cars: TrainCar[];
  /** how many leading cars are already on the track */
  given: number;
  /** extra shape tiles that fit no car (from level 3) */
  decoys: TrainCar[];
}

/**
 * Shape Train: an AB (later ABC) pattern of train cars; the first cars are
 * already hooked up and the child loads the missing ones. Length follows
 * the shapes level: 4 cars (2 missing) → 6 cars (3 missing) → ABC with a decoy.
 */
export function shapeTrainSet(level: number): ShapeTrainSet {
  const unit = shuffle(SHAPES).slice(0, level >= 5 ? 3 : 2).map((s) => s.name);
  const length = level <= 2 ? 4 : 6;
  const cars = Array.from({ length }, (_, i) => ({ id: `car-${i}`, shape: unit[i % unit.length]! }));
  const given = level <= 2 ? 2 : 3;
  const spare = SHAPES.map((s) => s.name).filter((n) => !unit.includes(n));
  const decoys = level >= 3 ? [{ id: "decoy-0", shape: shuffle(spare)[0]! }] : [];
  return { cars, given, decoys };
}
