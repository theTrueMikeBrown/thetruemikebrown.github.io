"""Add glow to a map icon

v1.0

To add the glow to a given map icon:

    $ python map-icon-setup.py map_icon_ship.png
    
You can also drag the image onto this script file to apply the
glow to that icon. A no-fuel variant will also be created when
applying the glow.
"""

import sys
import os
import re
from PIL import Image, ImageFilter

class ImageProcessor:
    def __init__(self):
        self.canvas = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
        self.canvas_glow = None
        self.canvas_shadow = None
        self.canvas_red = Image.open('map_icon_fuel_glow.png').convert('RGBA')

    def remove_alpha_pixels(self):
        # Remove all non-opaque pixels
        for x in range(self.canvas.size[0]):
            for y in range(self.canvas.size[1]):
                r, g, b, a = self.canvas.getpixel((x, y))
                if 1 <= a <= 254:
                    self.canvas.putpixel((x, y), (0, 0, 0, 0))

    def draw_glow(self, alpha=255):
        # Draw the blue glow around the ship
        self.canvas_glow = self.canvas.copy()
        for _ in range(8):
            self.canvas_glow = self.canvas_glow.filter(ImageFilter.BoxBlur(1.05))
        for x in range(self.canvas_glow.size[0]):
            for y in range(self.canvas_glow.size[1]):
                pixel = self.canvas_glow.getpixel((x, y))
                if pixel[3] > 0:
                    self.canvas_glow.putpixel((x, y), (121, 242, 253) + (int(1.08*pixel[3]),))

    def draw_shadow(self, alpha=255):
        # Draw the red glow around the ship
        self.canvas_shadow = self.canvas.copy()
        for _ in range(8):
            self.canvas_shadow = self.canvas_shadow.filter(ImageFilter.BoxBlur(0.4))
        for x in range(self.canvas_shadow.size[0]):
            for y in range(self.canvas_shadow.size[1]):
                pixel = self.canvas_shadow.getpixel((x, y))
                if pixel[3] > 0:
                    self.canvas_shadow.putpixel((x, y), (0, 0, 0) + (int(0.8*pixel[3]),))
    
    def save_images(self, output_path):
        # Save normal image
        normal = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
        normal.alpha_composite(self.canvas_shadow, dest=(3, 4), source=(0, 0))
        normal.alpha_composite(self.canvas_glow)
        normal.alpha_composite(self.canvas)
        normal.save(output_path)
        
        # Save nofuel image
        normal = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
        normal.alpha_composite(self.canvas_shadow, dest=(3, 4), source=(0, 0))
        normal.alpha_composite(self.canvas_red)
        normal.alpha_composite(self.canvas)
        normal.save(output_path[:-4] + '_fuel.png')

# Generate map icon
path = sys.argv[1]
processor = ImageProcessor()
processor.canvas = Image.open(path).convert('RGBA')
processor.remove_alpha_pixels()
processor.draw_glow()
processor.draw_shadow()
processor.save_images(path)
