import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(projectRoot, 'dist');
const excludedDirectories = new Set(['.git', '.openai', 'node_modules', 'tmp', '.tmp', 'previews', 'artifacts']);
const errors = [];
let referenceCount = 0;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory() && !excludedDirectories.has(entry.name)) files.push(...await walk(filename));
    else if (entry.isFile()) files.push(filename);
  }
  return files;
}

const label = filename => path.relative(projectRoot, filename).split(path.sep).join('/');

async function checkReference(reference, sourceFile) {
  const trimmed = reference.trim().replace(/&amp;/g, '&');
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(trimmed) || trimmed.includes('${')) return;
  const beforeQuery = trimmed.split(/[?#]/, 1)[0];
  if (!beforeQuery) return;
  let localPath;
  try {
    localPath = decodeURIComponent(beforeQuery);
  } catch {
    errors.push(`${label(sourceFile)}: referência inválida ${reference}`);
    return;
  }
  const target = localPath.startsWith('/') ? path.resolve(distRoot, `.${localPath}`) : path.resolve(path.dirname(sourceFile), localPath);
  const relative = path.relative(distRoot, target);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    errors.push(`${label(sourceFile)}: referência fora de dist: ${reference}`);
    return;
  }
  referenceCount += 1;
  try {
    let info = await stat(target);
    if (info.isDirectory()) info = await stat(path.join(target, 'index.html'));
    if (!info.isFile()) throw new Error('não é arquivo');
  } catch {
    errors.push(`${label(sourceFile)}: destino local ausente: ${reference}`);
  }
}

function collectReferences(source, extension) {
  const references = new Set();
  if (extension === '.html') {
    for (const match of source.matchAll(/\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi)) references.add(match[1]);
    for (const match of source.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/gi)) {
      if (!match[1].trim().startsWith('data:')) {
        for (const candidate of match[1].split(',')) references.add(candidate.trim().split(/\s+/)[0]);
      }
    }
  }
  if (extension === '.css' || extension === '.html') {
    for (const match of source.matchAll(/url\(\s*["']?([^\s)'";]+)["']?\s*\)/gi)) references.add(match[1]);
    for (const match of source.matchAll(/@import\s+["']([^"']+)["']/gi)) references.add(match[1]);
  }
  if (['.js', '.mjs', '.cjs'].includes(extension)) {
    for (const match of source.matchAll(/\b(?:import|export)\s+(?:[^;\n]*?\s+from\s*)?["']([^"']+)["']/g)) {
      if (match[1].startsWith('.') || match[1].startsWith('/')) references.add(match[1]);
    }
    for (const match of source.matchAll(/\bimport\s*\(\s*["']([^"']+)["']/g)) references.add(match[1]);
    for (const match of source.matchAll(/["'`]([^"'`\r\n]+\.(?:avif|webp|png|jpe?g|gif|svg|ico|woff2?|ttf|otf|mp4|webm|json|js|mjs|css|html)(?:[?#][^"'`\r\n]*)?)["'`]/gi)) {
      if (match[1].startsWith('.') || match[1].startsWith('/')) references.add(match[1]);
    }
  }
  return references;
}

try {
  const files = await walk(projectRoot);
  const scripts = files.filter(filename => /\.(?:js|mjs|cjs)$/i.test(filename));
  for (const filename of scripts) {
    const result = spawnSync(process.execPath, ['--check', filename], { encoding: 'utf8' });
    if (result.status !== 0) errors.push(`${label(filename)}: sintaxe inválida\n${result.stderr || result.error?.message || 'Falha ao executar node --check.'}`);
  }

  try {
    await stat(path.join(distRoot, 'index.html'));
  } catch {
    errors.push('dist/index.html ausente: a Home ainda não está pronta.');
  }

  const frontendFiles = files.filter(filename => {
    const relative = path.relative(distRoot, filename);
    return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative) && /\.(?:html|css|js|mjs|cjs)$/i.test(filename);
  });
  for (const filename of frontendFiles) {
    const source = await readFile(filename, 'utf8');
    for (const reference of collectReferences(source, path.extname(filename).toLowerCase())) await checkReference(reference, filename);
  }

  const catalogFile = path.join(distRoot, 'data', 'catalog.js');
  try {
    const catalog = await import(pathToFileURL(catalogFile).href);
    if (!Array.isArray(catalog.products) || catalog.products.length !== 10) {
      errors.push('O catálogo precisa exportar products com os 10 registros preservados.');
    } else {
      const ids = catalog.products.map(product => product.id);
      if (ids.some(id => typeof id !== 'string' || !id.trim()) || new Set(ids).size !== 10) errors.push('O catálogo precisa ter 10 IDs de produto não vazios e únicos.');
      for (const product of catalog.products) {
        if (typeof product.image === 'string') await checkReference(product.image, catalogFile);
      }
      for (const combination of catalog.combinations ?? []) {
        if (!Array.isArray(combination.productIds) || combination.productIds.some(id => !ids.includes(id))) errors.push(`Combinação ${combination.id ?? '(sem ID)'} possui produto ausente no catálogo.`);
      }
    }
  } catch (error) {
    errors.push(`Não foi possível importar dist/data/catalog.js: ${error.message}`);
  }

  if (errors.length) {
    console.error(`Verificação falhou (${errors.length}):\n${errors.map(error => `- ${error}`).join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log(`Verificação concluída: ${scripts.length} arquivos JS com sintaxe válida, ${referenceCount} referências locais existentes e catálogo importável com 10 IDs únicos.`);
    console.log('Esta verificação é estrutural. A revisão visual e os fluxos da Home precisam ser conferidos no navegador.');
  }
} catch (error) {
  console.error(`Não foi possível concluir a verificação: ${error.message}`);
  process.exitCode = 1;
}
