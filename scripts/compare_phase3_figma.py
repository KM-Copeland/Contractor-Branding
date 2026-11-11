"""Compare the six Playwright Step 2 captures with their Figma exports.

Pillow is required. Pixel metrics are diagnostics; manual review remains the
acceptance check because browser text rasterization and JPEG compression vary.
"""
from pathlib import Path
import json
from PIL import Image, ImageChops, ImageStat

references = Path("docs/figma-source")
captures = Path("docs/validation/phase3")
pairs = [
    ("step2-no-imprint-collapsed", "step2-no-imprint-collapsed"),
    ("step2-no-imprint-expanded", "step2-no-imprint-expanded"),
    ("step2-populated-collapsed", "step2-populated-collapsed"),
    ("step2-populated-expanded", "step2-populated-expanded"),
    ("step2-active-collapsed", "step2-active-collapsed"),
    ("step2-active-expanded", "step2-active-expanded"),
]
metrics = []
for reference_name, capture_name in pairs:
    with Image.open(references / f"{reference_name}.jpeg") as source:
        reference = source.convert("RGB").crop((10, 2, source.width - 10, source.height))
    with Image.open(captures / f"{capture_name}-1280.png") as source:
        browser = source.convert("RGB")
    width = min(reference.width, browser.width)
    height = min(reference.height, browser.height)
    ref_common = reference.crop((0, 0, width, height))
    browser_common = browser.crop((0, 0, width, height))
    difference = ImageChops.difference(ref_common, browser_common)
    difference.save(captures / f"{capture_name}-difference.png")
    side_by_side = Image.new("RGB", (width * 2, max(reference.height, browser.height)), "white")
    side_by_side.paste(reference, (0, 0))
    side_by_side.paste(browser, (width, 0))
    side_by_side.save(captures / f"{capture_name}-comparison.png")
    metrics.append({
        "state": capture_name,
        "referenceSize": list(reference.size),
        "browserSize": list(browser.size),
        "browserHeightDelta": browser.height - reference.height,
        "meanAbsoluteChannelDifferenceInCommonArea": round(sum(ImageStat.Stat(difference).mean) / 3, 3),
    })
(captures / "comparison-metrics.json").write_text(json.dumps(metrics, indent=2))
print(json.dumps(metrics, indent=2))
