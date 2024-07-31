import { maskStringToMask } from "./utils";

export const FULL =
  "C4RNER:------,CENTERS:------------------------,EDGES:------------";

// Bencisco
export const FIRST_CENTER = maskStringToMask(
  "iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii-iiiiiiiiiiiiiiiiii-iiiiii-iiii---i---i"
);
export const FIRST_TWO_TRIPLES = maskStringToMask(
  "iiiiiiiiiiiiiiiii-iiiiiiii-iiii--d--iiiiiiiiiiiiiii-d-iiiiid-i-iddd-ddd-"
);
export const SECOND_CENTER = maskStringToMask(
  "ii-iiiiiiiiiiiiiidiiiiiiiidiiiidddddi---i---iii-iiidddii-iiddididddddddd"
);
export const LAST_TWO_CENTERS = maskStringToMask(
  "iidii-i-ii---i---di---i---di-i-dddddidddidddiiidii-dddiidiidd-didddddddd"
);
export const LAST_BOTTOM_TRIPLE = maskStringToMask(
  "iidiididiidddiddddidddiddddididdddddidddiddd-iid--dddd--diidddd-dddddddd"
);
export const LAST_THREE_TRIPLES = maskStringToMask(
  "--d--d-d--ddd-dddd-ddd-dddd-d-dddddd-ddd-dddd--dddddddddd--ddddddddddddd"
);

// Last Slot & Last Layer
export const LAST_SLOT = maskStringToMask(
  "idddidddiiiiiiddddiiiiid-d-iddddddd-iiiiiddddiddddddd-ddddidddddddd--ddd"
);
export const LAST_CENTER =
  "C4RNER:IIIIII,CENTERS:I-I--I-I-IIIII----IIIIII,EDGES:I-I-I-IIIIII";
export const LAST_LAYER =
  "C4RNER:-I-I-I,CENTERS:I-I--I-I-IIIII----IIIIII,EDGES:I-I-I-IIIIII";
