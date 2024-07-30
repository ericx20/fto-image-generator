import { Alg } from "cubing/alg";
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

export function processRawAlgInput(input: string): string {
  return input.replaceAll(/’|‘|`/g, "'");
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mapChar = {
  "-": "regular",
  d: "dim",
  i: "ignored",
  o: "oriented"
}

export const maskStringToMask = (maskString: string) => {
  const maskArray = maskString.split("").map(char => mapChar[char])
  return {
    orbits: {
      C4RNER: {
        pieces: [
          {
            facelets: [
              maskArray[0],
              maskArray[9],
              maskArray[58],
              maskArray[40],
            ],
          },
          {
            facelets: [
              maskArray[63],
              maskArray[49],
              maskArray[44],
              maskArray[54],
            ],
          },
          {
            facelets: [
              maskArray[4],
              maskArray[36],
              maskArray[45],
              maskArray[22],
            ],
          },
          {
            facelets: [
              maskArray[71],
              maskArray[62],
              maskArray[17],
              maskArray[31],
            ],
          },
          {
            facelets: [
              maskArray[8],
              maskArray[18],
              maskArray[27],
              maskArray[13],
            ],
          },
          {
            facelets: [
              maskArray[67],
              maskArray[35],
              maskArray[26],
              maskArray[53],
            ],
          },
        ],
      },
      CENTERS: {
        pieces: [
          {
            facelets: [maskArray[42]],
          },
          {
            facelets: [maskArray[37]],
          },
          {
            facelets: [maskArray[24]],
          },
          {
            facelets: [maskArray[10]],
          },
          {
            facelets: [maskArray[21]],
          },
          {
            facelets: [maskArray[51]],
          },
          {
            facelets: [maskArray[3]],
          },
          {
            facelets: [maskArray[48]],
          },
          {
            facelets: [maskArray[6]],
          },
          {
            facelets: [maskArray[57]],
          },
          {
            facelets: [maskArray[34]],
          },
          {
            facelets: [maskArray[46]],
          },
          {
            facelets: [maskArray[32]],
          },
          {
            facelets: [maskArray[29]],
          },
          {
            facelets: [maskArray[39]],
          },
          {
            facelets: [maskArray[19]],
          },
          {
            facelets: [maskArray[12]],
          },
          {
            facelets: [maskArray[1]],
          },
          {
            facelets: [maskArray[60]],
          },
          {
            facelets: [maskArray[15]],
          },
          {
            facelets: [maskArray[65]],
          },
          {
            facelets: [maskArray[55]],
          },
          {
            facelets: [maskArray[70]],
          },
          {
            facelets: [maskArray[68]],
          },
        ],
      },
      EDGES: {
        pieces: [
          {
            facelets: [maskArray[41], maskArray[47]],
          },
          {
            facelets: [maskArray[38], maskArray[2]],
          },
          {
            facelets: [maskArray[23], maskArray[30]],
          },
          {
            facelets: [maskArray[11], maskArray[5]],
          },
          {
            facelets: [maskArray[25], maskArray[50]],
          },
          {
            facelets: [maskArray[20], maskArray[7]],
          },
          {
            facelets: [maskArray[64], maskArray[52]],
          },
          {
            facelets: [maskArray[14], maskArray[61]],
          },
          {
            facelets: [maskArray[69], maskArray[33]],
          },
          {
            facelets: [maskArray[16], maskArray[28]],
          },
          {
            facelets: [maskArray[43], maskArray[56]],
          },
          {
            facelets: [maskArray[66], maskArray[59]],
          },
        ],
      },
    },
  };
};
