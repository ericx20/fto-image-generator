import { maskStringToMask } from "./utils";

const FULL =
  "C4RNER:------,CENTERS:------------------------,EDGES:------------";

// Bencisco
const FIRST_CENTER = maskStringToMask(
  "iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii-iiiiiiiiiiiiiiiiii-iiiiii-iiii---i---i"
);
const FIRST_TWO_TRIPLES = maskStringToMask(
  "iiiiiiiiiiiiiiiii-iiiiiiii-iiii--d--iiiiiiiiiiiiiii-d-iiiiid-i-iddd-ddd-"
);
const SECOND_CENTER = maskStringToMask(
  "ii-iiiiiiiiiiiiiidiiiiiiiidiiiidddddi---i---iii-iiidddii-iiddididddddddd"
);
const LAST_TWO_CENTERS = maskStringToMask(
  "iidii-i-ii---i---di---i---di-i-dddddidddidddiiidii-dddiidiidd-didddddddd"
);
const LAST_BOTTOM_TRIPLE = maskStringToMask(
  "iidiididiidddiddddidddiddddididdddddidddiddd-iid--dddd--diidddd-dddddddd"
);
const LAST_THREE_TRIPLES = maskStringToMask(
  "--d--d-d--ddd-dddd-ddd-dddd-d-dddddd-ddd-dddd--dddddddddd--ddddddddddddd"
);

// Nautilus

const FIRST_BLOCK = maskStringToMask(
  "iiiiiiiiiiiiii--i-iiiiiiiiiiiii-iiiiiiiiii---iiii-iiii----i-----i--iii--"
);
const CENTERS = maskStringToMask(
  "i---i---iiiiiidd-diiiii-i-ii---d---iiiiii-dddi---d---iddddiddddd-ddii-dd"
);
const LAST_TRIPLE = maskStringToMask(
  "idddidddiiiiiiddddiiiiid-d-iddddddd-iiiiiddddiddddddd-ddddidddddddd--ddd"
);
const LAST_SIX_TRIANGLES =
  "C4RNER:IIIIII,CENTERS:I-I--I-I-IIIII----IIIIII,EDGES:I-I-I-IIIIII";
const LAST_LAYER =
  "C4RNER:-I-I-I,CENTERS:I-I--I-I-IIIII----IIIIII,EDGES:I-I-I-IIIIII";

export const MASKS = {
  full: FULL,
  // Bencisco
  fc: FIRST_CENTER,
  f2t: FIRST_TWO_TRIPLES,
  sc: SECOND_CENTER,
  l2c: LAST_TWO_CENTERS,
  lbt: LAST_BOTTOM_TRIPLE,
  l3t: LAST_THREE_TRIPLES,
  // Nautilus
  fb: FIRST_BLOCK,
  c: CENTERS,
  lt: LAST_TRIPLE,
  l6x: LAST_SIX_TRIANGLES,
  ll: LAST_LAYER,
};
