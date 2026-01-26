import xml.etree.ElementTree as ET
import os

# CONFIGURATION: Exact IDs requested by User, mapped to Reference Image
# Generator: Left side cabinet (approx 15% x, 40% y)
# MIV: Inlet pipe before spiral (approx 35% x, 48% y)
# Spiral Case: Main volute text (approx 65% x, 35% y)
# Runner: Center hub (approx 62% x, 45% y)
# Shaft Seal: Above runner (approx 62% x, 28% y)
# HPU: Back left platform (approx 25% x, 15% y)
# Draft Tube: Bottom elbow (approx 50% x, 75% y)

MARKERS = {
    "group-generator":   {"x": 180, "y": 420, "label": "Generator"},
    "group-miv":         {"x": 380, "y": 450, "label": "Main Inlet Valve"},
    "group-spiral-case": {"x": 750, "y": 380, "label": "Spiral Case"},
    "group-runner":      {"x": 720, "y": 480, "label": "Runner"},
    "group-seal":        {"x": 730, "y": 280, "label": "Shaft Seal"},
    "group-hpu":         {"x": 280, "y": 120, "label": "HPU"},
    "group-draft-tube":  {"x": 580, "y": 750, "label": "Draft Tube"}
}

TEMPLATE_SVG_PATH = "public/assets/schematics/francis-h5/Francis_manje_5.svg"
OUTPUT_SVG_PATH = "public/assets/schematics/francis-h5/Francis_manje_5.svg"

def inject_markers():
    print(f"🔧 Starting Final Manual Marker Injection into {TEMPLATE_SVG_PATH}")
    
    ET.register_namespace('', "http://www.w3.org/2000/svg")
    try:
        tree = ET.parse(TEMPLATE_SVG_PATH)
        root = tree.getroot()
        
        # 0. CRITICAL: FORCE VIEWBOX FOR SCALING
        if 'viewBox' not in root.attrib:
            w = root.get('width', '1184').replace('px','')
            h = root.get('height', '864').replace('px','')
            root.set('viewBox', f"0 0 {w} {h}")
            print(f"   + Added missing viewBox='0 0 {w} {h}'")
            
        root.set('width', '100%')
        root.set('height', '100%')

    except Exception as e:
        print(f"❌ Error parsing SVG: {e}")
        return

    # 1. CLEANUP
    for child in list(root):
        cid = child.get('id', '')
        if cid.startswith('group-') or cid.startswith('FR-') or cid.startswith('marker-') or 'auto-injected' in child.get('class', ''):
            root.remove(child)
            
    # 2. INJECT PROFESSIONAL CSS
    style_content = """
        .manual-group { cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .manual-group:hover .marker-core { fill: #22d3ee; stroke-width: 3px; r: 6px; }
        .manual-group:hover .marker-target { opacity: 1; r: 25px; stroke: #22d3ee; }
        
        .marker-pulse { animation: pulse 3s infinite; transform-origin: center; fill: none; stroke: #06b6d4; stroke-width: 1px; opacity: 0.6; }
        .marker-target { fill: none; stroke: #06b6d4; stroke-width: 1px; stroke-dasharray: 4 2; opacity: 0.4; transition: all 0.3s; }
        .marker-core { fill: #0b1121; stroke: #06b6d4; stroke-width: 2px; transition: all 0.3s; }
        
        .marker-label-bg { fill: #0b1121; fill-opacity: 0.8; stroke: #06b6d4; stroke-width: 0.5px; rx: 4px; }
        .marker-text { font-family: 'JetBrains Mono', monospace; font-size: 12px; fill: #22d3ee; font-weight: 500; letter-spacing: 0.5px; pointer-events: none; }
        
        @keyframes pulse { 
            0% { r: 8px; opacity: 0.8; stroke-width: 2px; }
            50% { r: 18px; opacity: 0; stroke-width: 0px; }
            100% { r: 8px; opacity: 0; stroke-width: 0px; }
        }
    """
    style_elem = root.find('{http://www.w3.org/2000/svg}style')
    if style_elem is None:
        style_elem = ET.Element('style')
        root.insert(0, style_elem)
    style_elem.text = style_content

    # 3. INJECT MARKERS
    for marker_id, data in MARKERS.items():
        g = ET.Element('g')
        g.set('id', marker_id)
        g.set('class', 'manual-group')
        
        # Target/Crosshair effect
        c_pulse = ET.Element('circle')
        c_pulse.set('cx', str(data['x']))
        c_pulse.set('cy', str(data['y']))
        c_pulse.set('r', '8')
        c_pulse.set('class', 'marker-pulse')
        
        c_target = ET.Element('circle')
        c_target.set('cx', str(data['x']))
        c_target.set('cy', str(data['y']))
        c_target.set('r', '15')
        c_target.set('class', 'marker-target')
        
        # Solid inner core
        c_core = ET.Element('circle')
        c_core.set('cx', str(data['x']))
        c_core.set('cy', str(data['y']))
        c_core.set('r', '4')
        c_core.set('class', 'marker-core')
        
        # Label Group
        label_g = ET.Element('g')
        label_w = len(data['label']) * 7 + 10 # Approx width
        
        rect = ET.Element('rect')
        rect.set('x', str(data['x'] + 15))
        rect.set('y', str(data['y'] - 10))
        rect.set('width', str(label_w))
        rect.set('height', '20')
        rect.set('class', 'marker-label-bg')
        
        txt = ET.Element('text')
        txt.set('x', str(data['x'] + 20))
        txt.set('y', str(data['y'] + 4))
        txt.set('class', 'marker-text')
        txt.text = data['label']
        
        label_g.append(rect)
        label_g.append(txt)
        
        g.append(c_pulse)
        g.append(c_target)
        g.append(c_core)
        g.append(label_g)
        
        root.append(g)
        print(f"   + Injected {marker_id} at ({data['x']}, {data['y']})")

    tree.write(OUTPUT_SVG_PATH, encoding='UTF-8', xml_declaration=True)
    print("✅ Final Manual Injection Complete.")

if __name__ == "__main__":
    inject_markers()
