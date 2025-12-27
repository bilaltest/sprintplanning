from PIL import Image
import sys
import collections

def remove_background_aggressive(image_path, tolerance=20):
    try:
        img = Image.open(image_path).convert("RGBA")
        width, height = img.size
        pixels = img.load()
        
        # Sample the top-left 50x50 area (or max) to find checkerboard colors
        bg_colors = []
        sample_w = min(50, width)
        sample_h = min(50, height)
        
        for x in range(sample_w):
            for y in range(sample_h):
                bg_colors.append(pixels[x, y])
        
        # Count most common colors to identify the checkerboard pattern
        # Usually checking the boundary is enough, but deeper is safer for big squares
        counter = collections.Counter(bg_colors)
        common_colors = [c for c, count in counter.most_common(5) if count > 0] # unique colors
        
        # Filter these common colors to ensure they are "background-like" by checking strict corner connectivity
        # Actually, let's just take the top-left pixel and any color appearing frequently in that corner region
        # Assuming the monster is centered and not in the top-left 50x50 block.
        
        distinct_bg_colors = common_colors
        print(f"Targeting background colors: {distinct_bg_colors}")

        # Flood fill
        queue = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
        visited = set(queue)
        
        # Smart flood fill: if a pixel matches ANY of the target colors, remove it and continue
        
        dirs = [(0, 1), (0, -1), (1, 0), (-1, 0)]
        
        while queue:
            x, y = queue.pop(0)
            
            pixels[x, y] = (0, 0, 0, 0)
            
            for dx, dy in dirs:
                nx, ny = x + dx, y + dy
                
                if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                    current_color = pixels[nx, ny]
                    
                    is_bg = False
                    for bg_c in distinct_bg_colors:
                         # Strict matching or tolerance
                         if sum(abs(current_color[i] - bg_c[i]) for i in range(3)) < tolerance:
                             is_bg = True
                             break
                    
                    if is_bg:
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
        img.save(image_path)
        print(f"Processed {image_path} with aggressive flood fill.")
        return True

    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return False

# Paths
target_file = "public/assets/images/playground_monster.png"
if __name__ == "__main__":
    remove_background_aggressive(target_file)
    # Copy to src
    import shutil
    try:
        shutil.copy(target_file, "src/assets/images/playground_monster.png")
        print("Copied to src/assets/images/")
    except Exception as e:
        print(f"Copy failed: {e}")
