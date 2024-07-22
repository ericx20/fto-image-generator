import { TwistyPlayer } from "cubing/twisty";

export async function downloadScreenshot(twisty: TwistyPlayer, filename: string): Promise<void> {
  const dataURL = await twisty.experimentalScreenshot({ width: 256, height: 256});
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = `${filename}.png`;
  a.click();
}

const validationTwisty = new TwistyPlayer({ puzzle: "fto" })

// this is a hack, not sure how to do this without instantiating a TwistyPlayer
export async function isAlgValid(alg: string) {
  validationTwisty.alg = alg;
  return (await validationTwisty.experimentalModel.puzzleAlg.get()).issues.errors.length === 0;
}