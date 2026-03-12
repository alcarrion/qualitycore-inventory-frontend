import { validateImage } from "../validateImage";
import { IMAGE_CONFIG } from "../../constants/config";

// ─── Mock browser APIs ────────────────────────────────────────────────────────
// URL.createObjectURL must exist before the module loads
global.URL.createObjectURL = jest.fn(() => "blob:fake-url");
global.URL.revokeObjectURL = jest.fn();

// Create a controllable Image mock
type ImageCallback = () => void;

class MockImage {
  onload: ImageCallback | null = null;
  onerror: ImageCallback | null = null;
  width = 500;
  height = 500;
  private static _width = 500;
  private static _height = 500;

  static setDimensions(w: number, h: number) {
    MockImage._width = w;
    MockImage._height = h;
  }

  set src(_: string) {
    // Copy static dimensions to instance so onload can read this.width/height
    this.width = MockImage._width;
    this.height = MockImage._height;
    if (MockImage._width === -1) {
      setTimeout(() => this.onerror?.(), 0);
    } else {
      setTimeout(() => this.onload?.(), 0);
    }
  }
}

Object.defineProperty(global, "Image", { value: MockImage, writable: true });

// ─── Helper: create fake File ─────────────────────────────────────────────────
const makeFile = (type = "image/jpeg", sizeMB = 0.5): File => {
  const bytes = new Uint8Array(Math.round(sizeMB * 1024 * 1024));
  return new File([bytes], "test.jpg", { type });
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("validateImage", () => {
  let showError: jest.Mock;

  beforeEach(() => {
    showError = jest.fn();
    MockImage.setDimensions(500, 500); // valid dimensions by default
  });

  test("rejects file with unsupported type", async () => {
    const file = makeFile("image/gif");
    const result = await validateImage(file, showError);
    expect(result).toBe(false);
    expect(showError).toHaveBeenCalled();
  });

  test("rejects file exceeding max size", async () => {
    const oversizedFile = makeFile("image/jpeg", IMAGE_CONFIG.MAX_SIZE_MB + 1);
    const result = await validateImage(oversizedFile, showError);
    expect(result).toBe(false);
    expect(showError).toHaveBeenCalled();
  });

  test("rejects image with dimensions below minimum", async () => {
    MockImage.setDimensions(IMAGE_CONFIG.MIN_WIDTH - 1, IMAGE_CONFIG.MIN_HEIGHT - 1);
    const file = makeFile("image/jpeg");
    const result = await validateImage(file, showError);
    expect(result).toBe(false);
    expect(showError).toHaveBeenCalled();
  });

  test("rejects image with dimensions above maximum", async () => {
    MockImage.setDimensions(IMAGE_CONFIG.MAX_WIDTH + 1, IMAGE_CONFIG.MAX_HEIGHT + 1);
    const file = makeFile("image/jpeg");
    const result = await validateImage(file, showError);
    expect(result).toBe(false);
    expect(showError).toHaveBeenCalled();
  });

  test("accepts a valid jpeg within size and dimension limits", async () => {
    MockImage.setDimensions(600, 600);
    const file = makeFile("image/jpeg");
    const result = await validateImage(file, showError);
    expect(result).toBe(true);
    expect(showError).not.toHaveBeenCalled();
  });

  test("accepts a valid png", async () => {
    const file = makeFile("image/png");
    const result = await validateImage(file, showError);
    expect(result).toBe(true);
  });

  test("calls showError when image fails to load", async () => {
    MockImage.setDimensions(-1, -1); // triggers onerror
    const file = makeFile("image/jpeg");
    const result = await validateImage(file, showError);
    expect(result).toBe(false);
    expect(showError).toHaveBeenCalled();
  });
});
