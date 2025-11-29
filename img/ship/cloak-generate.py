"""Generate cloaks from hull sprites

v1.1

To generate cloak images for a given set of hull sprites:

    $ python cloak_generate.py ship1_base.png ship2_base.png ...

Or drag the images onto this script in file explorer.

To generate cloak images for every hull sprite (every png image ending
with "_base") in the same folder as the script:

    $ python cloak_generate.py

Or double click this script in file explorer.

Offsets for generated cloaks are written to cloakOffsets.xml.

This script works best on hull flats. It will not work correctly
on hulls with glows, since the outline is obscured.
"""

from PIL import Image, ImageFilter
import sys
import os

def luminance(pixel):
    return (0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2])

def is_similar(pixel_a, pixel_b, threshold):
    return abs(luminance(pixel_a) - luminance(pixel_b)) < threshold

outlineThreshold = 1
cloakOutlineColor = (198, 198, 198)
cloakGlowColor = (35, 132, 156)

offsets = open("cloakOffsets.xml", "w")

imageList = None
if len(sys.argv) > 1:
    imageList = sys.argv[1:]
else:
    imageList = os.listdir(".")
for baseName in imageList:
    if baseName.endswith("_base.png"):
        print(f"Processing {baseName}")
        
        base = Image.open(baseName)
        baseX1, baseY1, baseX2, baseY2 = base.getbbox()
        base = base.crop(base.getbbox())
        originalW, originalH = base.size
        
        shadow = Image.new("RGBA", (originalW + 30, originalH + 30))
        outline = Image.new("RGBA", (originalW + 30, originalH + 30))
        
        shadow.paste(base, (15, 15))
        outline.paste(base, (15, 15))
        
        base.close()

        shadowPixels = shadow.load()
        outlinePixels = outline.load()

        for x in range(shadow.size[0]):
            for y in range(shadow.size[1]):
                pixel = shadowPixels[x, y]
                if pixel[3] == 255 and is_similar(pixel, (0, 0, 0), outlineThreshold):
                    shadowPixels[x, y] = (255, 255, 255, 255)
                    outlinePixels[x, y] = cloakOutlineColor + (255,)
                else:
                    shadowPixels[x, y] = (0, 0, 0, 0)
                    outlinePixels[x, y] = (0, 0, 0, 0)

        for _ in range(8):
            shadow = shadow.filter(ImageFilter.BoxBlur(1.2))

        shadowPixels = shadow.load()

        for x in range(shadow.size[0]):
            for y in range(shadow.size[1]):
                if shadowPixels[x, y][3] > 0:
                    shadowPixels[x, y] = cloakGlowColor + (int(1.53*shadowPixels[x, y][3]),)

        shadow.paste(outline, (0, 0), outline)
        x1, y1, x2, y2 = shadow.getbbox()
        shadow = shadow.crop(shadow.getbbox())
        
        cloakName = baseName[:-9]+"_cloak.png"
        shadow.save(cloakName)
        offsets.write(f'<cloak x="{x1 - 15 + baseX1}" y="{y1 - 15 + baseY1}" /> <!-- {cloakName} -->\n')
        
        shadow.close()
        outline.close()

offsets.close()
