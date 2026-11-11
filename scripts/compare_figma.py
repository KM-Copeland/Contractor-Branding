"""Compare Playwright captures with the original Figma JPEG exports.
Requires Pillow. Run from the project root: python scripts/compare_figma.py
These diagnostics do not constitute a pixel-perfect assertion.
"""
from pathlib import Path
import json
from PIL import Image, ImageChops, ImageStat

output = Path("docs/validation/phase2")
output.mkdir(parents=True, exist_ok=True)
pairs = [("121-2753", "no-selection"), ("144-1122", "single-selection"), ("144-1490", "multiple-selection")]
metrics = []
for node, state in pairs:
    with Image.open(Path("docs/figma-source") / (node + ".jpeg")) as source:
        # Figma export includes 10px horizontal and 2px top shadow/export margins.
        reference = source.convert("RGB").crop((10, 2, 1290, 2551))
    with Image.open(output / (state + "-1280.png")) as source:
        browser = source.convert("RGB")
    if browser.size != reference.size:
        raise ValueError(f"{state}: dimensions differ: {browser.size} vs {reference.size}")
    reference.save(output / (state + "-figma.png"))
    difference = ImageChops.difference(reference, browser)
    difference.save(output / (state + "-difference.png"))
    detail = Image.new("RGB", (800, 1000), "white")
    detail.paste(reference.crop((850, 530, 1250, 1530)), (0, 0))
    detail.paste(browser.crop((850, 530, 1250, 1530)), (400, 0))
    detail.save(output / (state + "-panel-comparison.png"))
    metrics.append({
        "state": state, "reference": node,
        "referenceSize": reference.size, "browserSize": browser.size,
        "meanAbsoluteChannelDifference": sum(ImageStat.Stat(difference).mean) / 3,
    })
(output / "comparison-metrics.json").write_text(json.dumps(metrics, indent=2))
print(json.dumps(metrics, indent=2))
