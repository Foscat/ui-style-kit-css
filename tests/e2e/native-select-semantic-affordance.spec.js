import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const demoUrl = pathToFileURL(path.join(root, "index.html")).href;
const manifest = JSON.parse(
  readFileSync(path.join(root, "manifest.json"), "utf8"),
);

/**
 * Mount real native selects under each supported class namespace without changing their semantics.
 * @param {import('@playwright/test').Page} page Current library demo page.
 * @param {string} prefix Preset-owned class prefix from the public manifest.
 * @returns {Promise<void>} Completion after controls are appended to an owned fixture.
 */
async function mountSelects(page, prefix) {
  await page.evaluate((presetPrefix) => {
    document.getElementById("semantic-select-regression")?.remove();
    const fixture = document.createElement("section");
    fixture.id = "semantic-select-regression";
    for (const [name, className] of [
      ["native", ""],
      ["canonical", "usk-select"],
      ["compatibility", "ui-select"],
      ["prefixed", `${presetPrefix}-select`],
    ]) {
      const label = document.createElement("label");
      label.textContent = `${name} select`;
      const control = document.createElement("select");
      control.id = `select-${name}`;
      control.className = className;
      label.htmlFor = control.id;
      control.innerHTML =
        '<option value="first">First option</option><option value="second">Second option</option>';
      fixture.append(label, control);
    }
    document.body.append(fixture);
  }, prefix);
}

/**
 * Capture actual indicator layers and geometry rather than trusting an attribute or token alone.
 * @param {import('@playwright/test').Locator} control Native select under inspection.
 * @returns {Promise<object>} Rendered indicator evidence.
 */
async function indicator(control) {
  return control.evaluate((element) => {
    const style = getComputedStyle(element);
    const actual = {
      image: style.backgroundImage,
      size: style.backgroundSize,
      position: style.backgroundPosition,
      repeat: style.backgroundRepeat,
      padding: Number.parseFloat(style.paddingInlineEnd),
      width: element.getBoundingClientRect().width,
    };
    actual.appearance = style.appearance;
    return actual;
  });
}

test("semantic select aliases retain native dropdown indicator geometry", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto(demoUrl);
  for (const { id, prefix } of manifest.presets) {
    await page.selectOption("#uiSelect", id);
    await mountSelects(page, prefix);
    for (const mode of ["light", "dark", "contrast"]) {
      await page.selectOption("#modeSelect", mode);
      for (const namespace of [
        "native",
        "canonical",
        "compatibility",
        "prefixed",
      ]) {
        const control = page.locator(`#select-${namespace}`);
        const actual = await indicator(control);
        const context = `${id}/${mode}/${namespace}`;
        if (actual.appearance === "auto") {
          // Neo Noir deliberately keeps the browser's arrow; a second CSS arrow would duplicate it.
          expect(actual.image, `${context} native arrow has no duplicate`).toBe(
            "none",
          );
        } else {
          expect(
            actual.appearance,
            `${context} custom indicator ownership`,
          ).toBe("none");
          expect(actual.image, `${context} image`).not.toBe("none");
          expect(actual.size, `${context} bounded indicator size`).not.toMatch(
            /^auto(?:,\s*auto)*$/,
          );
          expect(actual.position, `${context} indicator placement`).not.toMatch(
            /^0% 0%(?:,\s*0% 0%)*$/,
          );
          expect(
            actual.repeat
              .split(",")
              .some((value) => value.trim() === "no-repeat"),
            `${context} indicator does not tile`,
          ).toBe(true);
          expect(
            actual.padding,
            `${context} text avoids indicator`,
          ).toBeGreaterThanOrEqual(24);
        }
        expect(actual.width, `${context} rendered control`).toBeGreaterThan(0);
      }
    }
    await page.locator("#select-compatibility").selectOption("second");
    await expect(page.locator("#select-compatibility")).toHaveValue("second");
  }
});
