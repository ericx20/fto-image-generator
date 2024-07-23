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
};

type MaskOption = keyof typeof MASKS;

class App {
  // model
  mainPlayer: TwistyPlayer = document.querySelector("#main-player")!;
  // batchPlayer is never shown in the UI, it exists purely to generate images for batch generator
  batchPlayer: TwistyPlayer;
  batchAlgs: string[] = [];

  // DOM elements
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
  // lockCameraCheckbox = document.querySelector(
  //   "#lock-camera"
  // ) as HTMLInputElement;
  maskSelect = document.querySelector("#select-mask") as HTMLSelectElement;
  latitudeInput = document.querySelector(
    "#camera-latitude"
  ) as HTMLInputElement;
  longitudeInput = document.querySelector(
    "#camera-longitude"
  ) as HTMLInputElement;
  distanceInput = document.querySelector(
    "#camera-distance"
  ) as HTMLInputElement;

  constructor() {
    this.batchPlayer = new TwistyPlayer({
      puzzle: "fto",
      experimentalSetupAlg: "LFDv Fv",
      experimentalSetupAnchor: "end",
      cameraLatitudeLimit: 180,
    });
    this.mainPlayer.addEventListener("mouseup", () =>
      this.temporarilyDisableDownloadButton()
    );
    this.downloadButton.addEventListener("click", () => this.download());
    this.batchDownloadButton.addEventListener("click", () =>
      this.batchDownload()
    );

    // this.lockCameraCheckbox.addEventListener("change", (e) => {
    //   this.lockCamera((e.target as HTMLInputElement).checked);
    // });

    this.resetCameraButton.addEventListener("click", () => {
      this.resetCameraAngle();
    });

    this.algInput.addEventListener("input", async (e) => {
      this.handleMainInput((e.target as HTMLInputElement).value);
    });

    this.batchAlgInput.addEventListener("input", async (e) => {
      this.handleBatchInput((e.target as HTMLTextAreaElement).value);
    });
    this.maskSelect.addEventListener("change", (e) => {
      this.handleMaskSelect(
        (e.target as HTMLSelectElement).value as MaskOption
      );
    });
    this.latitudeInput.addEventListener("input", (e) => {
      this.handleLatitudeInput(Number((e.target as HTMLInputElement).value));
    });
    this.longitudeInput.addEventListener("input", (e) => {
      this.handleLongitudeInput(Number((e.target as HTMLInputElement).value));
    });
    this.distanceInput.addEventListener("input", (e) => {
      this.handleDistanceInput(Number((e.target as HTMLInputElement).value));
    });

    // subscribe to the mainPlayer model
    const twistyModel = this.mainPlayer.experimentalModel;
    twistyModel.twistySceneModel.orbitCoordinates.addFreshListener(
      ({ latitude, longitude, distance }) => {
        this.latitudeInput.value = latitude.toFixed(0);
        this.longitudeInput.value = longitude.toFixed(0);
        this.distanceInput.value = distance.toFixed(1);
      }
    );
  }

  // unfortunate hack: prevents button from being triggered
  // when user drags on the cube and lets go above the button
  temporarilyDisableDownloadButton() {
    if (this.downloadButton.disabled) return;
    this.downloadButton.disabled = true;
    setTimeout(() => {
      this.downloadButton.disabled = false;
    }, 1);
  }

  async download() {
    const filename =
      (
        await this.mainPlayer.experimentalModel.puzzleAlg.get()
      ).alg.toString() || "image";
    downloadScreenshot(this.mainPlayer, filename);
  }

  async batchDownload() {
    // copy the camera angle of the main player
    const coords =
      await this.mainPlayer.experimentalModel.twistySceneModel.orbitCoordinates.get();
    this.batchPlayer.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set(
      coords
    );
    for (let i = 0; i < this.batchAlgs.length; ++i) {
      this.batchPlayer.alg = this.batchAlgs[i];
      await downloadScreenshot(this.batchPlayer, `${i + 1}`);
    }
  }

  // lockCamera(lock: boolean) {
  //   this.mainPlayer.experimentalDragInput = lock ? "none" : "auto";
  // }

  resetCameraAngle() {
    // In the future with more masks, the default coordinates may be different
    this.mainPlayer.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set(
      { latitude: 35, longitude: 0, distance: 5.9 }
    );
  }

  async handleMainInput(input: string) {
    this.mainPlayer.alg = input;
    const { issues } = await this.mainPlayer.experimentalModel.puzzleAlg.get();
    this.downloadButton.disabled = issues.errors.length > 0;
  }

  async handleBatchInput(input: string) {
    const inputAlgs = input
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
  }

  async handleLatitudeInput(latitude: number) {
    this.mainPlayer.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set(
      {
        latitude,
      }
    );
  }

  async handleLongitudeInput(longitude: number) {
    this.mainPlayer.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set(
      {
        longitude,
      }
    );
  }

  async handleDistanceInput(distance: number) {
    this.mainPlayer.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set(
      { distance }
    );
  }

  handleMaskSelect(option: MaskOption) {
    // TODO: depending on the mask maybe we should change the default camera angle as well
    const mask = MASKS[option] as any;
    if (!mask) {
      console.warn("Could not find mask corresponding to option", option);
      return;
    }
    this.mainPlayer.experimentalStickeringMaskOrbits = mask;
    this.batchPlayer.experimentalStickeringMaskOrbits = mask;
  }
}

// Make the app object available in the console for debugging
globalThis.app = new App();
