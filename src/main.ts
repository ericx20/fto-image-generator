import "cubing/twisty"; // needed if any twisty players are on the page
import { TwistyPlayer } from "cubing/twisty";
import { FULL, LAST_CENTER, LAST_LAYER, LAST_SLOT } from "./masks";
import { downloadScreenshot, isAlgValid } from "./utils";

// TODO: put options in URL to make bookmarking possible
// TODO: very simple editor that shows numbers all over the cube and you enter indices of pieces to show/hide

const MASKS = {
  full: FULL,
  ls: LAST_SLOT,
  lc: LAST_CENTER,
  ll: LAST_LAYER,
}

type MaskOption = keyof typeof MASKS;

class App {
  mainPlayer: TwistyPlayer = document.querySelector("#main-player")!;
  // batchPlayer is never shown in the UI, it exists purely to generate images for batch generator
  batchPlayer: TwistyPlayer;
  algInput = document.querySelector("#alg-input") as HTMLInputElement;
  batchAlgInput = document.querySelector(
    "#batch-alg-input"
  ) as HTMLTextAreaElement;
  downloadButton = document.querySelector("#download") as HTMLButtonElement;
  resetCameraButton = document.querySelector(
    "#reset-camera"
  ) as HTMLButtonElement;

  batchDownloadButton = document.querySelector(
    "#batch-download"
  ) as HTMLButtonElement;
  enableCameraMoveCheckbox = document.querySelector(
    "#enable-camera-move"
  ) as HTMLInputElement;
  maskSelect = document.querySelector("#select-mask") as HTMLSelectElement;

  batchAlgs: string[] = [];

  constructor() {
    this.batchPlayer = new TwistyPlayer({
      puzzle: "fto",
      experimentalSetupAlg: "LFDv Fv",
      experimentalSetupAnchor: "end",
      cameraLatitudeLimit: 180,
    });
    this.downloadButton.addEventListener("click", () => this.download());
    this.batchDownloadButton.addEventListener("click", () =>
      this.batchDownload()
    );

    this.enableCameraMoveCheckbox.addEventListener("change", (e) => {
      const enabled = (e.target as HTMLInputElement).checked;
      this.mainPlayer.experimentalDragInput = enabled ? "auto" : "none";
    });

    this.resetCameraButton.addEventListener("click", async () => {
      // In the future with more masks, the default coordinates may be different
      this.mainPlayer.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set(
        { latitude: 30, longitude: 0 }
      );
    });

    this.algInput.addEventListener("input", async (e) => {
      const inputAlg = (e.target as HTMLInputElement).value;
      this.mainPlayer.alg = inputAlg;
      const { issues } =
        await this.mainPlayer.experimentalModel.puzzleAlg.get();
      this.downloadButton.disabled = issues.errors.length > 0;
    });

    this.batchAlgInput.addEventListener("input", async (e) => {
      const inputAlgs = (e.target as HTMLTextAreaElement).value
        .split("\n")
        .map((alg) => alg.trim())
        .filter((alg) => alg);

      const validationResults = await Promise.all(inputAlgs.map(isAlgValid));
      const valid = validationResults.every((result) => result);
      if (valid) {
        this.batchAlgs = inputAlgs;
        this.batchDownloadButton.disabled = !inputAlgs.length;
      } else {
        this.batchDownloadButton.disabled = true;
      }
    });
    this.maskSelect.addEventListener("change", (e) => {
      this.handleMaskSelect(
        (e.target as HTMLSelectElement).value as MaskOption
      );
    });
  }

  async download() {
    downloadScreenshot(
      this.mainPlayer,
      (await this.mainPlayer.experimentalModel.puzzleAlg.get()).alg.toString()
    );
  }

  async batchDownload() {
    // copy the camera angle of the main player
    const coords =
      await this.mainPlayer.experimentalModel.twistySceneModel.orbitCoordinatesRequest.get();
    this.batchPlayer.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set(
      coords
    );
    for (let i = 0; i < this.batchAlgs.length; ++i) {
      this.batchPlayer.alg = this.batchAlgs[i];
      await downloadScreenshot(this.batchPlayer, `${i + 1}`);
    }
  }

  handleMaskSelect(option: MaskOption) {
    // TODO: depending on the mask maybe we should change the default camera angle as well
    const mask = MASKS[option] as any;
    if (!mask) {
      console.warn("Could not find mask corresponding to option", option)
      return;
    }
    this.mainPlayer.experimentalStickeringMaskOrbits = mask;
    this.batchPlayer.experimentalStickeringMaskOrbits = mask;
  }
}

// Make the app object available in the console for debugging
globalThis.app = new App();
