import xml.etree.ElementTree as ET
import os

TARGET_SVG = "public/assets/schematics/francis-h5/geno_fr_h_manje_od_5.svg"

def repair_detail_view():
    print(f"🔧 Repairing Generator Detail View: {TARGET_SVG}")
    
    ET.register_namespace('', "http://www.w3.org/2000/svg")
    try:
        tree = ET.parse(TARGET_SVG)
        root = tree.getroot()
        
        # Force ViewBox if missing
        if 'viewBox' not in root.attrib:
            # Fallback to standard dimensions if width/height are percent or missing
            # The main hall is 1184x864, assuming generator detail is similar scale or standard 1080p
            # User provided asset might be 1184 864 or similar. 
            # Let's try to parse width/height if they exist as pixels
            w = root.get('width', '1184').replace('px', '').replace('%', '')
            h = root.get('height', '864').replace('px', '').replace('%', '')
            
            # If they were 100%, fallback to 1184 864
            if w == '100': w = '1184'
            if h == '100': h = '864'
            
            root.set('viewBox', f"0 0 {w} {h}")
            print(f"   + Added viewBox='0 0 {w} {h}'")
            
        # Force Full Size
        root.set('width', '100%')
        root.set('height', '100%')
        
        tree.write(TARGET_SVG, encoding='UTF-8', xml_declaration=True)
        print("✅ Generator Detail Repaired.")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    repair_detail_view()
