import { TwistyPlayer } from "cubing/twisty";

export async function downloadURL(
  dataURL: string,
  fileName: string
): Promise<void> {
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = fileName;
  a.click();
  a.remove();
}

const validationTwisty = new TwistyPlayer({ puzzle: "fto" });

// this is a hack, not sure how to do this without instantiating a TwistyPlayer
export async function isAlgValid(alg: string): Promise<boolean> {
  validationTwisty.alg = alg;
  return (
    (await validationTwisty.experimentalModel.puzzleAlg.get()).issues.errors
      .length === 0
  );
}

export function replaceBadApostrophes(input: string): string {
  return input.replaceAll(/’|‘|`/g, "'");
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
