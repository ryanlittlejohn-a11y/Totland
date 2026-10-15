import boat from "@/assets/jigsaw-vehicles/boat.jpg";
import bus from "@/assets/jigsaw-vehicles/bus.jpg";
import car from "@/assets/jigsaw-vehicles/car.jpg";
import plane from "@/assets/jigsaw-vehicles/plane.jpg";
import tractor from "@/assets/jigsaw-vehicles/tractor.jpg";
import train from "@/assets/jigsaw-vehicles/train.jpg";
import type { JigsawAnimal } from "./jigsaw-animals";

/** Simple Jigsaw's own picture set (all Spanish nouns masculine: "el"/"un"). */
export const JIGSAW_VEHICLES: JigsawAnimal[] = [
  { id: "bus", emoji: "🚌", en: "bus", es: "autobús", image: bus },
  { id: "train", emoji: "🚂", en: "train", es: "tren", image: train },
  { id: "boat", emoji: "⛵", en: "boat", es: "barco", image: boat },
  { id: "plane", emoji: "✈️", en: "plane", es: "avión", image: plane },
  { id: "car", emoji: "🚗", en: "car", es: "coche", image: car },
  { id: "tractor", emoji: "🚜", en: "tractor", es: "tractor", image: tractor },
];
