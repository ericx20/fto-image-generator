import "cubing/twisty"; // needed if any twisty players are on the page
import { TwistyPlayer } from "cubing/twisty";
import { FIRST_CENTER, FIRST_TWO_TRIPLES, FULL, LAST_BOTTOM_TRIPLE, LAST_CENTER, LAST_LAYER, LAST_SLOT, LAST_THREE_TRIPLES, LAST_TWO_CENTERS, SECOND_CENTER } from "./masks";
import {
  downloadURL,
  isAlgValid,
  processRawAlgInput,
  sleep,
  maskStringToMask,
} from "./utils";
import { downloadZip } from "client-zip";

// TODO: put options in URL to make bookmarking possible
// TODO: very simple editor that shows numbers all over the cube and you enter indices of pieces to show/hide

const MASKS = {
  full: FULL,
  // Bencisco
  fc: FIRST_CENTER,
  f2t: FIRST_TWO_TRIPLES,
  sc: SECOND_CENTER,
  l2c: LAST_TWO_CENTERS,
  lbt: LAST_BOTTOM_TRIPLE,
  l3t: LAST_THREE_TRIPLES,
  // Last Slot & Last Layer
  ls: LAST_SLOT,
  lc: LAST_CENTER,
  ll: LAST_LAYER,
};

const FACES = ["U", "L", "R", "F", "B", "BR", "BL", "D"] as const;

type MaskOption = keyof typeof MASKS;

// for 3x3 this would be something like x2 to get yellow on top
const FTO_PERMANENT_SETUP = "LBLv";

class App {
  // model
  mainPlayer = document.querySelector("#main-player") as TwistyPlayer;
  customMaskPlayer = document.querySelector(
    "#custom-mask-player"
  ) as TwistyPlayer;
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
  setupAlgInput = document.querySelector(
    "#setup-alg-input"
  ) as HTMLInputElement;
  hintFaceletToggle = document.querySelector("#hint-facelet-toggle") as HTMLInputElement;
  customMaskInputs = {
    U: document.querySelector("#u-face") as HTMLInputElement,
    L: document.querySelector("#l-face") as HTMLInputElement,
    R: document.querySelector("#r-face") as HTMLInputElement,
    F: document.querySelector("#f-face") as HTMLInputElement,
    B: document.querySelector("#b-face") as HTMLInputElement,
    BR: document.querySelector("#br-face") as HTMLInputElement,
    BL: document.querySelector("#bl-face") as HTMLInputElement,
    D: document.querySelector("#d-face") as HTMLInputElement,
  };
  customMaskSection = document.querySelector(
    "#custom-mask-section"
  ) as HTMLElement;

  #batchLoading = false;
  #showCustomMaskEditor = false;

  get showCustomMaskEditor() {
    return this.#showCustomMaskEditor;
  }

  set showCustomMaskEditor(value: boolean) {
    this.#showCustomMaskEditor = value;
    if (value) {
      this.customMaskSection.classList.remove("hidden");
    } else {
      this.customMaskSection.classList.add("hidden");
    }
  }

  constructor() {
    this.batchPlayer = new TwistyPlayer({
      puzzle: "fto",
      experimentalSetupAlg: FTO_PERMANENT_SETUP,
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
    this.setupAlgInput.addEventListener("input", (e) => {
      this.handleSetupAlgInput((e.target as HTMLInputElement).value);
    });
    this.hintFaceletToggle.addEventListener("change", (e) => {
      this.handleHintFaceletToggle((e.target as HTMLInputElement).checked)
    })

    FACES.forEach((face) => {
      this.customMaskInputs[face].addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        target.value = target.value.replace(/[^-dio]/g, "");
        this.updateCustomMask();
        this.setCustomMaskInUrl();
      });
    });

    this.loadCustomMaskFromURL();

    addEventListener("popstate", (event) => {
      this.loadCustomMaskFromURL();
    });

    // this.customMaskInput.addEventListener("input", (e) => {
    //   this.handleCustomMaskInput((e.target as HTMLInputElement).value);
    // })

    // subscribe to the mainPlayer model
    const twistyModel = this.mainPlayer.experimentalModel;
    twistyModel.twistySceneModel.orbitCoordinates.addFreshListener(
      ({ latitude, longitude, distance }) => {
        this.latitudeInput.value = latitude.toFixed(0);
        this.longitudeInput.value = longitude.toFixed(0);
        this.distanceInput.value = distance.toFixed(1);
      }
    );
    twistyModel.twistySceneModel.hintFacelet.addFreshListener((style) => {
      this.hintFaceletToggle.checked = style !== "none"
    })
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
    const dataURL = await this.mainPlayer.experimentalScreenshot({
      width: 256,
      height: 256,
    });
    const filename =
      (
        await this.mainPlayer.experimentalModel.puzzleAlg.get()
      ).alg.toString() || "image";

    downloadURL(dataURL, filename);
  }

  async batchDownload() {
    this.batchLoading = true;

    // Ugly hack to make the UI update with loading state first, before blocking main thread
    await sleep(1);

    const mainModel = this.mainPlayer.experimentalModel;
    const batchModel = this.batchPlayer.experimentalModel;
    // copy the options of the main player that we use
    const coords = await mainModel.twistySceneModel.orbitCoordinates.get();
    batchModel.twistySceneModel.orbitCoordinatesRequest.set(
      coords
    );
    const hintFacelet = await mainModel.twistySceneModel.hintFacelet.get();
    batchModel.twistySceneModel.hintFacelet.set(hintFacelet);

    const setupAlg = (await mainModel.setupAlg.get()).alg;
    batchModel.setupAlg.set(setupAlg);

    const algImageURLs: string[] = [];
    for (let i = 0; i < this.batchAlgs.length; ++i) {
      this.batchPlayer.alg = this.batchAlgs[i];
      const dataURL = await this.batchPlayer.experimentalScreenshot({
        width: 256,
        height: 256,
      });
      algImageURLs.push(dataURL);
    }

    const files = await Promise.all(
      algImageURLs.map(async (dataURL, index) => {
        const blob = await (await fetch(dataURL)).blob();
        const alg = this.batchAlgs[index];
        return {
          name: `${index + 1} ${alg}.png`,
          input: blob,
        };
      })
    );

    const zipBlob = await downloadZip(files).blob();
    await downloadURL(URL.createObjectURL(zipBlob), "batch.zip");

    this.batchLoading = false;
  }

  get batchLoading() {
    return this.#batchLoading;
  }

  set batchLoading(loading: boolean) {
    this.#batchLoading = loading;
    this.batchAlgInput.disabled = loading;
    this.batchDownloadButton.disabled = loading;
  }

  setMask(mask: any) {
    this.mainPlayer.experimentalStickeringMaskOrbits = mask;
    this.batchPlayer.experimentalStickeringMaskOrbits = mask;
    this.customMaskPlayer.experimentalStickeringMaskOrbits = mask;
  }

  resetCameraAngle() {
    // In the future with more masks, the default coordinates may be different
    this.mainPlayer.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set(
      { latitude: 35, longitude: 0, distance: 5.9 }
    );
  }

  async handleMainInput(input: string) {
    this.mainPlayer.alg = processRawAlgInput(input);
    const { issues } = await this.mainPlayer.experimentalModel.puzzleAlg.get();
    this.downloadButton.disabled = issues.errors.length > 0;
  }

  async handleBatchInput(input: string) {
    const inputAlgs = input
      .split("\n")
      .map((alg) => processRawAlgInput(alg.trim()))
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

  handleLatitudeInput(latitude: number) {
    this.mainPlayer.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set(
      {
        latitude,
      }
    );
  }

  handleLongitudeInput(longitude: number) {
    this.mainPlayer.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set(
      {
        longitude,
      }
    );
  }

  handleDistanceInput(distance: number) {
    this.mainPlayer.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set(
      { distance }
    );
  }

  handleSetupAlgInput(setup: string) {
    this.mainPlayer.experimentalSetupAlg = `${FTO_PERMANENT_SETUP} ${setup}`;
  }

  handleHintFaceletToggle(showHintFacelets: boolean) {
    this.mainPlayer.experimentalModel.twistySceneModel.hintFacelet.set(showHintFacelets ? "floating" : "none"); 
  }

  updateCustomMask() {
    let maskString = "";
    FACES.forEach((face) => {
      maskString += this.customMaskInputs[face].value.padEnd(9, "-");
    });
    const mask = maskStringToMask(maskString);
    this.setMask(mask);
  }

  setCustomMaskInUrl() {
    const inputState = FACES.map(
      (face) => this.customMaskInputs[face].value
    ).join(",");
    const url = new URL(window.location.href);
    url.searchParams.set("customStickering", inputState);
    history.replaceState(null, "", url);
  }

  loadCustomMaskFromURL() {
    const queryParams = new URLSearchParams(window.location.search);
    const inputState = queryParams.get("customStickering");
    if (!inputState) {
      return;
    }
    this.maskSelect.value = "custom";
    this.showCustomMaskEditor = true;
    const inputFieldValues = inputState
      .split(",")
      .slice(0, 8)
      .map((val) => val.replace(/[^-dio]/g, "").slice(0, 9));
    FACES.forEach(
      (face, index) =>
        (this.customMaskInputs[face].value = inputFieldValues[index])
    );
    this.updateCustomMask();
  }

  clearCustomMaskFromURL() {
    const url = new URL(window.location.href);
    url.searchParams.delete("customStickering");
    window.history.pushState(null, "", url);
  }

  handleMaskSelect(option: MaskOption | "custom") {
    if (option === "custom") {
      this.showCustomMaskEditor = true;
      this.updateCustomMask();
      return;
    }
    this.showCustomMaskEditor = false;
    this.clearCustomMaskFromURL();
    let selectedMask = MASKS[option] as any;
    if (!selectedMask) {
      console.warn("Could not find mask corresponding to option", option);
      return;
    }
    this.setMask(selectedMask);
  }
}

// Make the app object available in the console for debugging
globalThis.app = new App();
