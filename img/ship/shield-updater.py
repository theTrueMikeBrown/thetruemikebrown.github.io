'''
This script requires Python 3 to run. When run, it will use shield_base_bubble.png
and shield_base_hex.png to regenerate all player shield images in this folder.

If the script fails to run, you may need to open the console (on Windows, you can
do this by hitting CTRL+R, typing "cmd" and pressing Enter) and type the following
command:

    pip install pillow

'''

from os import listdir
import struct
import imghdr
from PIL import Image

# Exclude special player shield images that don't fit the template
blacklist = ("mup_rhyme_a_shields1.png",  "mup_rhyme_b_shields1.png", "mup_rhyme_c_shields1.png", "mupc_turzil_shields1.png")
shieldBase = Image.open(r"shield_base_bubble.png")
shieldHexPattern = Image.open(r"shield_base_hex.png")

def get_png_size(fname):
    with open(fname, 'rb') as fhandle:
        head = fhandle.read(24)
        if len(head) != 24:
            return
        if imghdr.what(fname) == 'png':
            check = struct.unpack('>i', head[4:8])[0]
            if check != 0x0d0a1a0a:
                return
            width, height = struct.unpack('>ii', head[16:24])
        else:
            return
        return width, height

def apply_hex_pattern(shield):
    shieldPixels = shield.load()
    hexOffsetX = (shieldHexPattern.size[0] - shield.size[0])//2
    hexOffsetY = (shieldHexPattern.size[1] - shield.size[1])//2
    for x in range(shield.size[0]):
        for y in range(shield.size[1]):
            hexPixel = shieldHexPattern.getpixel((x + hexOffsetX, y + hexOffsetY))
            if hexPixel[3] > 0:
                shieldPixels[x, y] = (hexPixel[0], hexPixel[1], hexPixel[2], shieldPixels[x, y][3])
    return shield

for shieldName in listdir("."):
    if shieldName.endswith("_shields1.png") and not shieldName in blacklist:
        print(f"Processing {shieldName}")
        shieldReplace = shieldBase.copy().resize(get_png_size(shieldName))
        shieldReplace = apply_hex_pattern(shieldReplace)
        shieldReplace.save(shieldName)
        shieldReplace.close()
