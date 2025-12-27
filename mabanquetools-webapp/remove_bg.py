from PIL import Image
import os

def remove_background(image_path):
    try:
        img = Image.open(image_path)
        img = img.convert("RGBA")
        datas = img.getdata()
        
        # Get the background color from the top-left pixel
        bg_color = datas[0]
        
        new_data = []
        threshold = 30 # Tolerance for color matching
        
        for item in datas:
            # Check if the pixel is close to the background color
            if all(abs(item[i] - bg_color[i]) < threshold for i in range(3)):
                new_data.append((255, 255, 255, 0)) # Transparent
            else:
                new_data.append(item)
                
        img.putdata(new_data)
        img.save(image_path, "PNG")
        print(f"Processed {image_path}: Background color {bg_color} removed.")
        return True
    except Exception as e:
        print(f"Failed to process {image_path}: {e}")
        return False

# Files to process
files = [
    "public/assets/images/playground_monster.png",
    "public/assets/images/asset_sacha.png",
    "src/assets/images/playground_monster.png",
    "src/assets/images/asset_sacha.png" # Just in case it's here too, though usually public is the source
]

for f in files:
    if os.path.exists(f):
        remove_background(f)
    else:
        print(f"File not found: {f}")
