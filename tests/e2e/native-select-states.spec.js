import { expect, test } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

/** Verify the changed select chrome without replacing native keyboard, disabled or list-box semantics. */
test("semantic select retains keyboard, disabled, multiple and RTL behavior", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setContent(
    '<!doctype html><html dir="ltr"><body data-ui="minimal-saas" data-mode="dark"><label for="choice">Choose a part</label><select id="choice" class="ui-select"><option value="one">First part</option><option value="two">Second part</option></select><label for="disabled">Unavailable selector</label><select id="disabled" class="ui-select" disabled><option>Disabled part</option></select><label for="multiple">Multiple parts</label><select id="multiple" class="ui-select" multiple><option>First part</option><option>Second part</option></select></body></html>',
  );
  await page.addStyleTag({
    path: path.join(root, "dist/ui-style-kit.visual.css"),
  });
  const choice = page.getByRole("combobox", { name: "Choose a part" });
  await choice.focus();
  await expect(choice).toBeFocused();
  await choice.press("End");
  await choice.press("Enter");
  await expect(choice).toHaveValue("two");
  await expect(
    page.getByRole("combobox", { name: "Unavailable selector" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("listbox", { name: "Multiple parts" }),
  ).toHaveAttribute("multiple", "");
  expect(
    await page
      .locator("#multiple")
      .evaluate((element) => getComputedStyle(element).backgroundImage),
  ).toBe("none");
  await expect
    .poll(() =>
      choice.evaluate(
        (element) => getComputedStyle(element).backgroundPosition,
      ),
    )
    .toContain("100%");
  const ltr = await choice.evaluate(
    (element) => getComputedStyle(element).backgroundPosition,
  );
  await page.locator("html").evaluate((element) => {
    element.dir = "rtl";
  });
  await expect
    .poll(() =>
      choice.evaluate(
        (element) => getComputedStyle(element).backgroundPosition,
      ),
    )
    .toMatch(/^[\d.]+px 50%, [\d.]+px 50%$/);
  const rtl = await choice.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      direction: style.direction,
      position: style.backgroundPosition,
      gutter: style.paddingInlineEnd,
    };
  });
  expect(rtl.direction).toBe("rtl");
  expect(rtl.position).not.toContain("100%");
  expect(rtl.position).not.toBe(ltr);
  expect(Number.parseFloat(rtl.gutter)).toBeGreaterThanOrEqual(24);
});
