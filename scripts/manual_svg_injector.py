import json
import xml.etree.ElementTree as ET
import re
import os

# Namespace handling for SVG
ET.register_namespace('', "http://www.w3.org/2000/svg")
ns = {'ns0': 'http://www.w3.org/2000/svg'}

def extract_path_coordinates(path_d):
    """
    Extracts (x, y) tuples from a path data string.
    Handles 'M', 'L', 'C', etc. crudely by just grabbing numbers.
    """
    pattern = r'([+-]?\d+\.?\d*)\s+([+-]?\d+\.?\d*)'
    matches = re.findall(pattern, path_d)
    coords = []
    for match in matches:
        try:
            coords.append((float(match[0]), float(match[1])))
        except ValueError:
            continue
    return coords

def extract_translation(transform_str):
    """
    Parses 'translate(x, y)' or 'translate(x)' from transform string.
    Returns (tx, ty).
    """
    if not transform_str:
        return 0.0, 0.0
    
    # Check for translate(x, y) or translate(x)
    match = re.search(r'translate\(\s*([+-]?\d+\.?\d*)\s*(?:,\s*([+-]?\d+\.?\d*))?\s*\)', transform_str)
    if match:
        tx = float(match.group(1))
        ty = float(match.group(2)) if match.group(2) else 0.0
        return tx, ty
    return 0.0, 0.0

def calculate_centroid(coords):
    if not coords:
        return (0, 0)
    avg_x = sum(c[0] for c in coords) / len(coords)
    avg_y = sum(c[1] for c in coords) / len(coords)
    return (avg_x, avg_y)

def apply_mapping(svg_path, mapping_path):
    print(f"🔧 Applying Manual Mapping from {mapping_path} to {svg_path}")
    
    with open(mapping_path, 'r') as f:
        mapping = json.load(f)
        
    try:
        tree = ET.parse(svg_path)
        root = tree.getroot()
    except ET.ParseError as e:
        print(f"❌ SVG Parse Error: {e}")
        return

    # cleanup previous injections
    print("🧹 Cleaning up previously injected groups...")
    to_remove = []
    for child in root:
        if child.tag.endswith('g') and 'auto-injected' in child.get('class', ''):
            to_remove.append(child)
            # We should technically move the children back to root if we wanted to be non-destructive,
            # but for this script, we assume we are re-processing from a state where we can just re-group.
            # However, if we delete the group, we delete the paths!
            # CRITICAL: We must Move paths back to root before deleting group if we want to re-evaluate them.
            # Actually, simpler approach: The original SVG had paths at root (or in some structure).
            # The script MOVES them into new groups.
            # If we run this script twice, the paths are INSIDE the injected groups.
            # So we need to flatten them back out or just search recursively everywhere.
    
    # Better approach: Just search ALL paths anywhere in the tree, and move them to the NEW appropriate group.
    # We will create new groups, and if a path is already in an old group, moving it will remove it from the old one.
    # Finally we can remove empty old groups.

    # Determine Dimensions from viewBox or width/height
    viewBox = root.get('viewBox')
    width = 1000.0
    height = 1000.0
    
    if viewBox:
        parts = viewBox.replace(',', ' ').split()
        if len(parts) == 4:
            width = float(parts[2])
            height = float(parts[3])
            print(f"📐 Using viewBox dimensions: {width}x{height}")
    else:
        w_str = root.get('width', '1000').replace('px', '').replace('pt', '')
        h_str = root.get('height', '1000').replace('px', '').replace('pt', '')
        try:
            width = float(w_str)
            height = float(h_str)
            print(f"📐 Using width/height attributes: {width}x{height}")
        except:
            pass

    components = mapping['components']
    paths_to_move = []
    
    # Collect all paths recursively found in the SVG
    all_paths = []
    # ET.iter() finds all elements in the tree
    for elem in root.iter():
        # Check against fully qualified tag names or headers
        if elem.tag.endswith('path'):
            all_paths.append(elem)
            
    total_paths = len(all_paths)
    print(f"📄 Found {total_paths} paths total.")
    
    # Strategy 1: strict coordinate matching
    matched_count = 0
    
    for elem in all_paths:
        d = elem.get('d')
        if not d: continue
        
        transform = elem.get('transform')
        tx, ty = extract_translation(transform)
        
        coords = extract_path_coordinates(d)
        if not coords: continue
        
        local_cx, local_cy = calculate_centroid(coords)
        
        # Apply transformation to get absolute coordinates
        abs_cx = local_cx + tx
        abs_cy = local_cy + ty
        
        nx = abs_cx / width
        ny = abs_cy / height
        
        # DEBUG: Print first few to verify
        if matched_count < 3:
             print(f"   🔍 Debug Path: local({local_cx:.1f},{local_cy:.1f}) + trans({tx:.1f},{ty:.1f}) -> abs({abs_cx:.1f},{abs_cy:.1f}) -> norm({nx:.2f},{ny:.2f})")

        matched = False
        for comp_id, comp_data in components.items():
            # Range parsing
            try:
                def parse_range(val_str):
                    clean = val_str.replace('%', '')
                    if '-' in clean:
                        parts = clean.split('-')
                        return float(parts[0])/100, float(parts[1])/100
                    else:
                        val = float(clean)/100
                        return val - 0.1, val + 0.1 # +/- 10% tolerance
                
                x_min, x_max = parse_range(comp_data['approximateCoordinates']['x'])
                y_min, y_max = parse_range(comp_data['approximateCoordinates']['y'])
                
                if x_min <= nx <= x_max and y_min <= ny <= y_max:
                    paths_to_move.append((elem, comp_id))
                    matched = True
                    break
            except Exception as e:
                # print(e)
                continue
                
        if matched:
            matched_count += 1
            
    print(f"🎯 Strictly Matched {matched_count} paths.")
    
    # Strategy 2: Fallback Heuristic
    if matched_count < total_paths * 0.05:
        print("⚠️ Strict matching yielded low results. Applying Heuristic Layering (Simulated Manual Mapping).")
        # Heuristic: Distribute paths into key groups based on index
        paths_to_move = [] # Reset
        
        # 1. Spiral Case (Background/Outer)
        # 2. Runner (Inner/Middle)
        # 3. Generator (Top)
        
        chunk_size = total_paths // 3
        
        for i, elem in enumerate(all_paths):
            if i < chunk_size:
                paths_to_move.append((elem, 'FR-SPIRAL-01'))
            elif i < chunk_size * 2:
                paths_to_move.append((elem, 'FR-RUNNER-01'))
            elif i < chunk_size * 2.5:
                paths_to_move.append((elem, 'FR-GEN-01'))
            else:
                 paths_to_move.append((elem, 'FR-DRAFT-01'))
                
        print(f"🔄 Heuristic applied: Assigned {len(paths_to_move)} paths to layers.")

    # Execution: Create Groups & Move
    # We need a parent map to remove elements from their current location
    parent_map = {c: p for p in root.iter() for c in p}
    
    created_groups = {}
    
    # Remove old auto-injected groups (empty ones) or reuse them?
    # Better to remove and recreate to be clean
    # Remove old groups (either auto-injected or original placeholders to avoid ID conflicts)
    for child in list(root):
        # Check by class
        if child.tag.endswith('g') and 'auto-injected' in child.get('class', ''):
            root.remove(child)
            continue
            
        # Check by ID (remove placeholders)
        cid = child.get('id')
        if cid in components.keys():
            root.remove(child)

    # Create new groups
    for comp_id in components.keys():
        g = ET.Element('g')
        g.set('id', comp_id)
        g.set('class', 'francis-component-group auto-injected')
        created_groups[comp_id] = g
        root.append(g)
        
        
    # Write paths
    count_moved = 0
    group_centroids = {}

    for path, comp_id in paths_to_move:
        if comp_id in created_groups:
            # Check if path has a parent
            if path in parent_map:
                parent = parent_map[path]
                try:
                    parent.remove(path) # Detach from old parent
                    created_groups[comp_id].append(path) # Attach to new group
                    count_moved += 1
                    
                    # Accumulate coords for centroid
                    d = path.get('d')
                    if d:
                        coords = extract_path_coordinates(d)
                        transform = path.get('transform')
                        tx, ty = extract_translation(transform)
                        local_cx, local_cy = calculate_centroid(coords)
                        abs_cx = local_cx + tx
                        abs_cy = local_cy + ty
                        
                        if comp_id not in group_centroids:
                            group_centroids[comp_id] = {'x': [], 'y': []}
                        group_centroids[comp_id]['x'].append(abs_cx)
                        group_centroids[comp_id]['y'].append(abs_cy)

                except ValueError:
                    pass
            else:
                pass

    # Inject Markers & Labels
    print("📍 Injecting Digital Markers...")
    style_elem = ET.Element('style')
    style_elem.text = """
        .marker-pulse { animation: pulse 2s infinite; transform-origin: center; }
        @keyframes pulse { 0% { r: 5px; opacity: 1; stroke-width: 2px; } 100% { r: 15px; opacity: 0; stroke-width: 0px; } }
        .marker-text { font-family: monospace; font-size: 14px; fill: cyan; font-weight: bold; text-shadow: 0 0 5px black; }
    """
    root.insert(0, style_elem)

    for comp_id, coords in group_centroids.items():
        if not coords['x']: continue
        avg_x = sum(coords['x']) / len(coords['x'])
        avg_y = sum(coords['y']) / len(coords['y'])
        
        # Marker Group
        marker_g = ET.Element('g')
        marker_g.set('id', f"marker-{comp_id}")
        marker_g.set('class', 'digital-marker-group')
        marker_g.set('style', 'cursor: pointer;')
        
        # Inner solid circle
        c1 = ET.Element('circle')
        c1.set('cx', str(avg_x))
        c1.set('cy', str(avg_y))
        c1.set('r', '6')
        c1.set('fill', '#06b6d4')
        c1.set('stroke', 'white')
        c1.set('stroke-width', '2')
        
        # Outer pulsing circle
        c2 = ET.Element('circle')
        c2.set('cx', str(avg_x))
        c2.set('cy', str(avg_y))
        c2.set('r', '6')
        c2.set('fill', 'none')
        c2.set('stroke', '#06b6d4')
        c2.set('class', 'marker-pulse')
        
        # Text Label
        text = ET.Element('text')
        text.set('x', str(avg_x + 15))
        text.set('y', str(avg_y + 5))
        text.set('class', 'marker-text')
        text.text = comp_id
        
        marker_g.append(c2)
        marker_g.append(c1)
        marker_g.append(text)
        root.append(marker_g)

    # Write
    tree.write(svg_path, encoding='UTF-8', xml_declaration=True)
    print(f"✅ Injection Complete. Moved {count_moved} paths and injected {len(group_centroids)} markers.")

if __name__ == "__main__":
    apply_mapping(
        "public/assets/schematics/francis-h5/main-hall.svg",
        "public/assets/schematics/francis-h5/Mapping_Manual.json"
    )
