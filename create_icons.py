from PIL import Image, ImageDraw

def create_pyramid_icon(size, filename):
    # Dark background
    img = Image.new('RGBA', (size, size), (15, 23, 42, 255))  # slate-900
    draw = ImageDraw.Draw(img)
    
    # Calculate pyramid dimensions (centered)
    margin = size * 0.1
    top = (size / 2, margin)
    bottom_left = (margin, size - margin)
    bottom_right = (size - margin, size - margin)
    
    # Draw pyramid outline
    color = (231, 211, 163, 255)  # #E7D3A3
    line_width = max(2, size // 30)
    
    # Draw triangle
    draw.polygon([top, bottom_left, bottom_right], outline=color, width=line_width)
    
    # Draw lines explicitly for better quality
    draw.line([top, bottom_left], fill=color, width=line_width)
    draw.line([bottom_left, bottom_right], fill=color, width=line_width)
    draw.line([bottom_right, top], fill=color, width=line_width)
    
    # Draw center dot
    center_y = size * 0.52
    dot_radius = max(3, size // 25)
    draw.ellipse([
        size/2 - dot_radius, center_y - dot_radius,
        size/2 + dot_radius, center_y + dot_radius
    ], fill=color)
    
    img.save(filename, 'PNG')
    print(f"Created {filename}")

# Generate PWA icons
create_pyramid_icon(192, '/home/pvrolo/legal-solutions/public/icon-192.png')
create_pyramid_icon(512, '/home/pvrolo/legal-solutions/public/icon-512.png')

print("PWA icons generated!")
