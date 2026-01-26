import fs from 'fs';
import path from 'path';

const MIGRATIONS_DIR = path.join('supabase','migrations');
const outCsv = path.join('scripts','db_audit_report.csv');
const outSuggested = path.join('supabase','migrations','20260123_harden_trash_suggested.sql');

function listSqlFiles(dir){
  return fs.readdirSync(dir).filter(f=>f.endsWith('.sql')).map(f=>path.join(dir,f));
}

function readFiles(files){
  return files.map(f=>({file:f, content: fs.readFileSync(f,'utf8')}));
}

function parseTables(files){
  const tables = {}; // name -> {files:[], hasIndex:false, hasFK:false, hasPolicy:false}
  files.forEach(({file,content})=>{
    const tableRegex = /CREATE TABLE IF NOT EXISTS public\.([a-z0-9_]+)/gi;
    let m;
    while((m=tableRegex.exec(content))){
      const t = m[1];
      if(!tables[t]) tables[t]={name:t,files:new Set(),hasIndex:false,hasFK:false,hasPolicy:false};
      tables[t].files.add(path.basename(file));
    }
  });
  // detect indexes
  files.forEach(({file,content})=>{
    const idxRegex = /CREATE INDEX IF NOT EXISTS .* ON public\.([a-z0-9_]+)/gi;
    let m;
    while((m=idxRegex.exec(content))){
      const t = m[1]; if(!tables[t]) tables[t]={name:t,files:new Set(),hasIndex:false,hasFK:false,hasPolicy:false};
      tables[t].hasIndex = true; tables[t].files.add(path.basename(file));
    }
  });
  // detect FK references
  files.forEach(({file,content})=>{
    const refRegex = /REFERENCES public\.([a-z0-9_]+)/gi;
    let m;
    while((m=refRegex.exec(content))){
      const t = m[1]; if(!tables[t]) tables[t]={name:t,files:new Set(),hasIndex:false,hasFK:false,hasPolicy:false};
      // mark referencer? We'll mark referenced table hasFK = true meaning someone references it
      tables[t].hasFK = true; tables[t].files.add(path.basename(file));
    }
  });
  // detect policies
  files.forEach(({file,content})=>{
    const polRegex = /CREATE POLICY .* ON public\.([a-z0-9_]+)/gi;
    let m;
    while((m=polRegex.exec(content))){
      const t = m[1]; if(!tables[t]) tables[t]={name:t,files:new Set(),hasIndex:false,hasFK:false,hasPolicy:false};
      tables[t].hasPolicy = true; tables[t].files.add(path.basename(file));
    }
  });

  return Object.values(tables).map(t=>({
    name: t.name,
    files: Array.from(t.files).join(';'),
    hasIndex: t.hasIndex ? 'yes' : 'no',
    hasFK: t.hasFK ? 'yes' : 'no',
    hasPolicy: t.hasPolicy ? 'yes' : 'no'
  }));
}

function writeCsv(rows){
  const hdr = 'table,has_index,has_fk,has_rls,files\n';
  const body = rows.map(r=>`${r.name},${r.hasIndex},${r.hasFK},${r.hasPolicy},"${r.files}"`).join('\n');
  fs.mkdirSync(path.dirname(outCsv),{recursive:true});
  fs.writeFileSync(outCsv,hdr+body,'utf8');
  console.log('Wrote', outCsv);
}

function writeSuggested(rows){
  const lines = [];
  lines.push('-- Suggested hardening migration (generated)');
  lines.push('-- Review before applying. This will ENABLE RLS on tables that currently lack policies.');
  lines.push('\nBEGIN;\n');
  rows.forEach(r=>{
    if(r.hasPolicy==='no'){
      lines.push(`-- Harden table: ${r.name}`);
      lines.push(`ALTER TABLE public.${r.name} ENABLE ROW LEVEL SECURITY;`);
      lines.push(`-- NOTE: Add precise policies for ownership/roles. Example (requires owner_id column):`);
      lines.push(`-- CREATE POLICY "owner_select" ON public.${r.name} FOR SELECT TO authenticated USING (owner_id = auth.uid());`);
      lines.push(`-- For asset-owned tables, consider policies tying asset_id to claims or service roles.`);
      lines.push('');
    }
    if(r.hasIndex==='no'){
      lines.push(`-- Suggest index for ${r.name} (if common query column exists)`);
      lines.push(`-- CREATE INDEX IF NOT EXISTS idx_${r.name}_asset ON public.${r.name}(asset_id);`);
      lines.push('');
    }
    if(r.hasFK==='no'){
      lines.push(`-- Suggest adding FK constraints to ${r.name} where applicable.`);
      lines.push(`-- Example: ALTER TABLE public.${r.name} ADD CONSTRAINT fk_${r.name}_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;`);
      lines.push('');
    }
  });
  lines.push('\nCOMMIT;\n');
  fs.writeFileSync(outSuggested, lines.join('\n'),'utf8');
  console.log('Wrote suggested migration to', outSuggested);
}

function main(){
  const files = listSqlFiles(MIGRATIONS_DIR);
  const fdata = readFiles(files);
  const rows = parseTables(fdata);
  writeCsv(rows);
  writeSuggested(rows);
}

main();
