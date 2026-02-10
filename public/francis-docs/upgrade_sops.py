import os
import re

# Standard SOP Template (Industrial Dark Mode)
TEMPLATE_START = """<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SOP: {title_en}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');

        body {{
            font-family: 'JetBrains Mono', monospace;
            background-color: #0c0a09; /* Industrial Dark Mode */
            color: #d6d3d1;
        }}

        .procedure-card {{
            background: #1c1917;
            border: 1px solid #292524;
            padding: 24px;
            margin-bottom: 16px;
            border-left: 4px solid #44403c;
        }}

        .procedure-card.critical {{
            border-left-color: #dc2626;
            background: #2a1210;
        }}

        .step-num {{
            color: #3b82f6;
            font-weight: bold;
            margin-right: 8px;
        }}

        .btn-return {{
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #1c1917;
            border: 1px solid #44403c;
            color: #78716c;
            padding: 8px 16px;
            font-size: 12px;
            text-transform: uppercase;
            font-weight: bold;
            border-radius: 4px;
            transition: all 0.2s;
        }}

        .btn-return:hover {{
            border-color: #3b82f6;
            color: white;
        }}
    </style>
</head>

<body class="p-6 md:p-12 max-w-4xl mx-auto">

    <!-- Header -->
    <header class="mb-10 pb-6 border-b border-stone-800 flex justify-between items-start">
        <div>
            <div class="flex items-center gap-2 mb-2">
                <span class="px-2 py-1 rounded bg-blue-900/30 text-blue-400 text-[10px] font-bold border border-blue-900 uppercase">SOP-GEN-00X</span>
                <span class="text-[10px] text-stone-500 uppercase font-bold">REV 3.0</span>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2" data-i18n="title">{title_en}</h1>
            <p class="text-stone-500 text-sm" data-i18n="subtitle">{subtitle}</p>
        </div>
        
        <!-- Standard Return Button -->
        <a href="Francis_Horizontal_Dashboard.html" class="btn-return">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> <span data-i18n="return">Back to Dashboard</span>
        </a>
    </header>

    <!-- Content -->
    <div class="space-y-6">
"""

TEMPLATE_END = """
    </div>

    <!-- Hidden Translation Data -->
    <script>
        lucide.createIcons();

        // Check global lang preference
        const ml = localStorage.getItem('anohub_lang_pref') || 'en';

        const i18n = {{
            en: {{
                title: "{title_en}",
                subtitle: "{subtitle}",
                return: "Back to Dashboard"
            }},
            bs: {{
                title: "{title_bs}",
                subtitle: "{subtitle_bs}",
                return: "Povratak na Kontrolnu Tablu"
            }}
        }};

        if(ml === 'bs') {{
            document.querySelectorAll('[data-i18n]').forEach(el => {{
                const key = el.getAttribute('data-i18n');
                if(i18n.bs[key]) el.innerText = i18n.bs[key];
            }});
        }}
    </script>
</body>
</html>
"""

# Simple offline translation dictionary for Titles
# (In a real scenario, this would call an API, but here we hardcode key system terms)
TRANS_MAP = {
    "Ležajevi": "Bearings",
    "Hlađenje": "Cooling",
    "Glavni": "Main",
    "Sistem": "System",
    "Vratila": "Shaft",
    "Zaptivač": "Seal",
    "Oporavak": "Recovery",
    "Sigurnost": "Safety",
    "Kontrola": "Control",
    "Misije": "Mission",
    "Dnevnik": "Log",
    "Operatera": "Operator",
    "Udar": "Hammer",
    "Hidraulični": "Hydraulic",
    "Pritisak": "Pressure",
    "Cjevovod": "Penstock",
    "Zahvat": "Intake",
    "Protok": "Flow",
    "Drenaža": "Drainage",
    "Pumpe": "Pumps",
    "Kočenje": "Braking",
    "Podmazivanje": "Lubrication",
    "Logika": "Logic",
    "Ispad": "Trip",
    "Tereta": "Load",
    "Kritični": "Critical"
}

def translate_title(text):
    res = []
    for word in text.split():
        clean = word.strip(":,")
        if clean in TRANS_MAP:
            res.append(TRANS_MAP[clean])
        else:
            res.append(clean) # Keep original if unknown to preserve meaning partially
    return " ".join(res)

def process_file(filepath):
    print(f"Processing {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Create Backup
    with open(filepath + ".bak", 'w', encoding='utf-8') as f:
        f.write(content)

    # Scrape Title (Usually in h1)
    title_match = re.search(r'<h1>(.*?)<\/h1>', content, re.DOTALL)
    title_raw = title_match.group(1).strip() if title_match else "SOP PROCEDURE"
    
    # Scrape Subtitle (Usually in h2)
    sub_match = re.search(r'<h2>(.*?)<\/h2>', content, re.DOTALL)
    subtitle_raw = sub_match.group(1).strip() if sub_match else "Standard Operation Protocol"

    # Minimal Translation Attempt
    title_en = translate_title(title_raw)
    
    # Extract Content Blocks (Look for 'module' classes from old CSS)
    # We will try to map divs with class 'module' to 'procedure-card'
    # And 'module critical' to 'procedure-card critical'
    
    body_content = ""
    
    # Regex to find modules
    modules = re.findall(r'<div class="module(.*?)">(.*?)<\/div>', content, re.DOTALL)
    
    count = 1
    for mod_class, mod_inner in modules:
        is_critical = "critical" in mod_class
        
        # Clean tags inside
        # Replace h3 with standard header logic
        mod_inner = re.sub(r'<h3>(.*?)<\/h3>', r'<h3 class="text-white font-bold mb-2"><span class="step-num">{:02d}</span> \1</h3>'.format(count), mod_inner)
        
        # Style lists
        mod_inner = mod_inner.replace('<ul>', '<ul class="list-disc pl-5 text-sm text-stone-400 space-y-2">')
        mod_inner = mod_inner.replace('<ol>', '<ol class="list-decimal pl-5 text-sm text-stone-400 space-y-2">')
        mod_inner = mod_inner.replace('<li>', '<li>') # No change needed for li if ul is styled
        
        # Paragraphs
        mod_inner = mod_inner.replace('<p>', '<p class="text-sm text-stone-400 mb-2">')
        
        card_class = "procedure-card critical" if is_critical else "procedure-card"
        
        body_content += f'<div class="{card_class}">\n{mod_inner}\n</div>\n'
        count += 1
        
    if not body_content:
        # Fallback for files like Water Hammer which used 'panel-critical'
        panels = re.findall(r'<div class="panel-critical(.*?)">(.*?)<\/div>', content, re.DOTALL)
        for p_class, p_inner in panels:
             p_inner = re.sub(r'<h3(.*?)>(.*?)<\/h3>', r'<h3 class="text-red-500 font-bold mb-2 flex items-center gap-2"><i data-lucide="alert-triangle"></i> \2</h3>', p_inner)
             body_content += f'<div class="procedure-card critical">\n{p_inner}\n</div>\n'

    # Assemble
    final_html = TEMPLATE_START.format(title_en=title_en, subtitle=subtitle_raw)
    final_html += body_content
    final_html += TEMPLATE_END.format(
        title_en=title_en, title_bs=title_raw,
        subtitle=subtitle_raw, subtitle_bs=subtitle_raw # Assuming subtitle didn't translate
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(final_html)

# List of files to process 
# (Excluding Recovery since manually done, and Dashboard/Logger files)
target_files = [
    "Francis_SOP_Water_Hammer.html",
    "Francis_SOP_MIV_Distributor_Detail.html",
    "Francis_SOP_Penstock.html",
    "Francis_SOP_Intake.html",
    "Francis_SOP_Cooling_Water.html",
    "Francis_SOP_Drainage_Pumps.html",
    "Francis_SOP_Bearings.html",
    "Francis_SOP_Shaft_Alignment.html",
    "Francis_SOP_Lubrication.html",
    "Francis_SOP_Braking_System.html",
    "Francis_Safety_System_Integrity.html",
    "Francis_SOP_Gov_Logic.html",
    "Francis_Logic_Load_Rejection.html",
    "Francis_SOP_DC_Systems.html"
]

root_dir = r"c:\Users\Home\OneDrive\getting started\Documents\GitHub\anohubs-site\anohubs-site\src\Turbine_Friend"

for filename in target_files:
    path = os.path.join(root_dir, filename)
    if os.path.exists(path):
        process_file(path)
    else:
        print(f"Skipping {filename}, not found.")

print("Batch processing complete.")
