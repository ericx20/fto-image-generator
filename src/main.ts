import "cubing/twisty"; // needed if any twisty players are on the page
import { TwistyPlayer } from "cubing/twisty";
import { FULL, LS } from "./masks";
import { downloadScreenshot, isAlgValid } from "./utils";

type MaskOption = "full" | "ls";

class App {
  mainPlayer: TwistyPlayer = document.querySelector("#main-player")!;
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
      if (issues.errors.length) {
        this.downloadButton.disabled = true;
      } else {
        this.downloadButton.disabled = false;
      }
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
    switch (option) {
      case "full":
        this.mainPlayer.experimentalStickeringMaskOrbits = FULL as any;
        this.batchPlayer.experimentalStickeringMaskOrbits = FULL as any;
        break;
      case "ls":
        this.mainPlayer.experimentalStickeringMaskOrbits = LS as any;
        this.batchPlayer.experimentalStickeringMaskOrbits = LS as any;
        break;
    }
  }
}

// Make the app object available in the console for debugging
globalThis.app = new App();
