import xml.etree.ElementTree as ET
import os

# CONFIGURATION: Inspection Points for Generator
# Estimates based on standard vertical hydro generator layout
# DE Bearing: Top (Drive End)
# NDE Bearing: Bottom (Non-Drive End)
# Stator: Outer ring
# Rotor: Center
# Cooler: Side

MARKERS = {
    "insp-de-bearing":   {"x": 600, "y": 250, "label": "DE Bearing (Upper)"},
    "insp-nde-bearing":  {"x": 600, "y": 650, "label": "NDE Bearing (Lower)"},
    "insp-stator":       {"x": 350, "y": 450, "label": "Stator Core"},
    "insp-rotor":        {"x": 600, "y": 450, "label": "Rotor Poles"},
    "insp-lube-oil":     {"x": 850, "y": 700, "label": "Lube Oil Unit"}
}

TEMPLATE_SVG_PATH = "public/assets/schematics/francis-h5/geno_fr_h_manje_od_5.svg"
OUTPUT_SVG_PATH = "public/assets/schematics/francis-h5/geno_fr_h_manje_od_5.svg"

def inject_inspection_markers():
    print(f"🔧 Starting Generator Inspection Marker Injection into {TEMPLATE_SVG_PATH}")
    
    ET.register_namespace('', "http://www.w3.org/2000/svg")
    try:
        tree = ET.parse(TEMPLATE_SVG_PATH)
        root = tree.getroot()
        
    except Exception as e:
        print(f"❌ Error parsing SVG: {e}")
        return

    # 1. CLEANUP
    for child in list(root):
        cid = child.get('id', '')
        if cid.startswith('insp-'):
            root.remove(child)
            
    # 2. INJECT CSS (Reuse specific inspection style if needed, or rely on existing if shared context? 
    # Since this is a swapped file, we need to inject CSS here too)
    style_content = """
        .insp-group { cursor: pointer; transition: all 0.3s ease; }
        .insp-group:hover .marker-core { fill: #facc15; stroke-width: 3px; r: 6px; } /* Yellow for Inspection */
        .insp-group:hover .marker-target { opacity: 1; r: 20px; stroke: #facc15; }
        
        .marker-pulse { animation: pulse 3s infinite; transform-origin: center; fill: none; stroke: #eab308; stroke-width: 1px; opacity: 0.6; }
        .marker-target { fill: none; stroke: #eab308; stroke-width: 1px; stroke-dasharray: 4 2; opacity: 0.4; transition: all 0.3s; }
        .marker-core { fill: #0b1121; stroke: #eab308; stroke-width: 2px; transition: all 0.3s; }
        
        .marker-label-bg { fill: #0b1121; fill-opacity: 0.9; stroke: #eab308; stroke-width: 0.5px; rx: 4px; }
        .marker-text { font-family: 'JetBrains Mono', monospace; font-size: 11px; fill: #facc15; font-weight: 500; pointer-events: none; }
        
        @keyframes pulse { 
            0% { r: 6px; opacity: 0.8; stroke-width: 2px; }
            50% { r: 16px; opacity: 0; stroke-width: 0px; }
            100% { r: 6px; opacity: 0; stroke-width: 0px; }
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
        g.set('class', 'insp-group')
        
        c_pulse = ET.Element('circle')
        c_pulse.set('cx', str(data['x']))
        c_pulse.set('cy', str(data['y']))
        c_pulse.set('r', '6')
        c_pulse.set('class', 'marker-pulse')
        
        c_target = ET.Element('circle')
        c_target.set('cx', str(data['x']))
        c_target.set('cy', str(data['y']))
        c_target.set('r', '12')
        c_target.set('class', 'marker-target')
        
        c_core = ET.Element('circle')
        c_core.set('cx', str(data['x']))
        c_core.set('cy', str(data['y']))
        c_core.set('r', '3')
        c_core.set('class', 'marker-core')
        
        label_g = ET.Element('g')
        label_w = len(data['label']) * 7 + 10
        
        rect = ET.Element('rect')
        rect.set('x', str(data['x'] + 15))
        rect.set('y', str(data['y'] - 10))
        rect.set('width', str(label_w))
        rect.set('height', '18')
        rect.set('class', 'marker-label-bg')
        
        txt = ET.Element('text')
        txt.set('x', str(data['x'] + 20))
        txt.set('y', str(data['y'] + 3))
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
    print("✅ Generator Detail Markers Injected.")

if __name__ == "__main__":
    inject_inspection_markers()
