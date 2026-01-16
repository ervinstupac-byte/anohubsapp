import xml.etree.ElementTree as ET
import os

# CONFIGURATION: Hardcoded "Manual" Coordinates based on visual inspection of standard Francis layout
# These coordinates are normalized to the 1000x1000 grid often used in these SVGs.
# Adjusted based on previous centroid calculations:
# Generator: Top Center (~589, 232)
# MIV: Right side (~850, 500)
# Spiral Case: Center surrounding runner (~500, 500)
# Runner: Dead Center (~500, 600)
# Shaft Seal: Below Generator, above Runner (~500, 400)
# HPU: Bottom Left/Right (~200, 800)
# Draft Tube: Bottom Center (~500, 850)

MARKERS = {
    "FR-GEN-01":  {"x": 589, "y": 232, "label": "Generator"},
    "FR-SPIRAL-01": {"x": 500, "y": 550, "label": "Spiral Case"},
    "FR-RUNNER-01": {"x": 600, "y": 600, "label": "Runner"},
    "FR-SEAL-01": {"x": 589, "y": 350, "label": "Shaft Seal"},
    "FR-MIV-01": {"x": 900, "y": 500, "label": "MIV"},
    "FR-HPU-01": {"x": 200, "y": 700, "label": "HPU"},
    "FR-DRAFT-01": {"x": 550, "y": 800, "label": "Draft Tube"}
}

TEMPLATE_SVG_PATH = "public/assets/schematics/francis-h5/Francis_manje_5.svg"
OUTPUT_SVG_PATH = "public/assets/schematics/francis-h5/Francis_manje_5.svg"

def inject_markers():
    print(f"🔧 Starting Manual Marker Injection into {TEMPLATE_SVG_PATH}")
    
    ET.register_namespace('', "http://www.w3.org/2000/svg")
    try:
        tree = ET.parse(TEMPLATE_SVG_PATH)
        root = tree.getroot()
    except Exception as e:
        print(f"❌ Error parsing SVG: {e}")
        return

    # 1. CLEANUP: Remove any existing markers or injected groups
    for child in list(root):
        cid = child.get('id', '')
        if cid.startswith('FR-') or cid.startswith('marker-FR-') or 'auto-injected' in child.get('class', ''):
            root.remove(child)
            
    # 2. INJECT CSS
    style_content = """
        .marker-group { cursor: pointer; transition: all 0.3s ease; }
        .marker-group:hover .marker-core { r: 8px; fill: #22d3ee; }
        .marker-pulse { animation: pulse 2s infinite; transform-origin: center; fill: none; stroke: #06b6d4; stroke-width: 2px; }
        .marker-core { fill: #06b6d4; stroke: white; stroke-width: 2px; transition: all 0.3s; }
        .marker-text { font-family: monospace; font-size: 14px; fill: #a5f3fc; font-weight: bold; text-shadow: 0 0 3px black; pointer-events: none; }
        @keyframes pulse { 
            0% { r: 6px; opacity: 1; stroke-width: 2px; } 
            100% { r: 20px; opacity: 0; stroke-width: 0px; } 
        }
    """
    # Check if style exists
    style_elem = root.find('{http://www.w3.org/2000/svg}style')
    if style_elem is None:
        style_elem = ET.Element('style')
        root.insert(0, style_elem)
    style_elem.text = style_content

    # 3. INJECT MARKERS
    for marker_id, data in MARKERS.items():
        g = ET.Element('g')
        g.set('id', marker_id) # The requested ID: FR-GEN-01
        g.set('class', 'marker-group')
        
        # Pulsing outer ring
        c_pulse = ET.Element('circle')
        c_pulse.set('cx', str(data['x']))
        c_pulse.set('cy', str(data['y']))
        c_pulse.set('r', '6')
        c_pulse.set('class', 'marker-pulse')
        
        # Solid inner core
        c_core = ET.Element('circle')
        c_core.set('cx', str(data['x']))
        c_core.set('cy', str(data['y']))
        c_core.set('r', '6')
        c_core.set('class', 'marker-core')
        
        # Text Label
        txt = ET.Element('text')
        txt.set('x', str(data['x'] + 15))
        txt.set('y', str(data['y'] + 5))
        txt.set('class', 'marker-text')
        txt.text = data['label'] # "Generator" etc
        
        g.append(c_pulse)
        g.append(c_core)
        g.append(txt)
        
        root.append(g)
        print(f"   + Injected {marker_id} at ({data['x']}, {data['y']})")

    tree.write(OUTPUT_SVG_PATH, encoding='UTF-8', xml_declaration=True)
    print("✅ Surgical Injection Complete.")

if __name__ == "__main__":
    inject_markers()
