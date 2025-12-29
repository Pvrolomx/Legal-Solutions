from PIL import Image, ImageDraw, ImageFont

def create_icon(size, filename):
    # Create image with dark slate background
    img = Image.new('RGB', (size, size), '#0f172a')
    draw = ImageDraw.Draw(img)
    
    # Draw scale/balance symbol (simplified)
    center_x = size // 2
    center_y = size // 2
    
    # Colors
    gold = '#fbbf24'
    white = '#f8fafc'
    
    # Scale factor
    s = size / 512
    
    # Draw the balance base (triangle)
    base_points = [
        (center_x - 80*s, center_y + 150*s),
        (center_x + 80*s, center_y + 150*s),
        (center_x, center_y + 50*s)
    ]
    draw.polygon(base_points, fill=gold)
    
    # Draw vertical pole
    draw.rectangle([center_x - 8*s, center_y - 120*s, center_x + 8*s, center_y + 50*s], fill=gold)
    
    # Draw horizontal bar
    draw.rectangle([center_x - 150*s, center_y - 130*s, center_x + 150*s, center_y - 110*s], fill=gold)
    
    # Draw left scale pan
    draw.ellipse([center_x - 180*s, center_y - 30*s, center_x - 80*s, center_y + 30*s], fill=white, outline=gold, width=int(4*s))
    # Left chain
    draw.line([(center_x - 130*s, center_y - 120*s), (center_x - 130*s, center_y - 30*s)], fill=gold, width=int(4*s))
    
    # Draw right scale pan
    draw.ellipse([center_x + 80*s, center_y - 30*s, center_x + 180*s, center_y + 30*s], fill=white, outline=gold, width=int(4*s))
    # Right chain
    draw.line([(center_x + 130*s, center_y - 120*s), (center_x + 130*s, center_y - 30*s)], fill=gold, width=int(4*s))
    
    img.save(filename, 'PNG')
    print(f'Created {filename}')

# Create icons
create_icon(192, '/home/pvrolo/legal-solutions/public/icon-192.png')
create_icon(512, '/home/pvrolo/legal-solutions/public/icon-512.png')
print('Icons created!')
