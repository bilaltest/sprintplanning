from PIL import Image
import sys

def remove_background_floodfill(image_path, tolerance=30):
    try:
        img = Image.open(image_path).convert("RGBA")
        width, height = img.size
        pixels = img.load()
        
        # Identify background colors from corners
        # Usually checkerboards have 2 colors. Let's sample a few points near the corner
        # to find the two dominant background colors.
        bg_colors = set()
        
        # Sample the top-left 20x20 area to find the checkerboard colors
        sample_size = min(20, width, height)
        for x in range(sample_size):
            for y in range(sample_size):
                bg_colors.add(pixels[x, y])
        
        # Filter similar colors to get distinct ones (e.g., the two checkerboard colors)
        distinct_bg_colors = []
        for c in bg_colors:
            is_distinct = True
            for existing in distinct_bg_colors:
                if sum(abs(c[i] - existing[i]) for i in range(3)) < tolerance:
                    is_distinct = False
                    break
            if is_distinct:
                distinct_bg_colors.append(c)
                
        print(f"Detected {len(distinct_bg_colors)} distinct background colors in corner: {distinct_bg_colors}")

        # Flood fill
        queue = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
        visited = set(queue)
        
        # Directions for neighbors (4-connectivity)
        dirs = [(0, 1), (0, -1), (1, 0), (-1, 0)]
        
        while queue:
            x, y = queue.pop(0)
            
            # Make transparent
            pixels[x, y] = (0, 0, 0, 0)
            
            for dx, dy in dirs:
                nx, ny = x + dx, y + dy
                
                if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                    current_color = pixels[nx, ny]
                    
                    # Check if this pixel matches any of the background colors
                    is_bg = False
                    for bg_c in distinct_bg_colors:
                         if sum(abs(current_color[i] - bg_c[i]) for i in range(3)) < tolerance:
                             is_bg = True
                             break
                    
                    if is_bg:
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
        img.save(image_path)
        print(f"Processed {image_path} with flood fill.")
        return True

    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return False

# Re-process the original generated file to avoid artifacts from previous run
# We assume the original was saved at 'public/assets/images/playground_monster.png' or we need to restore it?
# The previous script OVERWROTE the file. 
# Identifying the checkerboard colors might fail if the previous script already messed up some pixels (made them transparent).
# However, the previous script removed ONE color (top-left). So the other color of the checkerboard remains.
# The "removed" pixels are now (255, 255, 255, 0) or whatever.
# The `convert("RGBA")` might have kept them as transparent.
# Transparency is (r,g,b,0).
# The flood fill should treat "already transparent" as background too?
# Actually, if the previous script removed one color, the file now has transparent pixels and "checkerboard color 2" pixels.
# Let's try to handle that.

# But wait, the user's screenshot shows the checkerboard is remarkably intact. 
# My previous script might have failed to save or the user is looking at a cached version? 
# Or my previous script picked a color that wasn't exactly the checkerboard ones (maybe a compression artifact?).
# Let's assume the file currently has the checkerboard.

# Paths
target_file = "public/assets/images/playground_monster.png"
if __name__ == "__main__":
    remove_background_floodfill(target_file)
    # Also copy to src
    import shutil
    try:
        shutil.copy(target_file, "src/assets/images/playground_monster.png")
        print("Copied to src/assets/images/")
    except Exception as e:
        print(f"Copy failed: {e}")
