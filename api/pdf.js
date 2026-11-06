// Gera o PDF de um relatório do Fechamento mensal com o Chrome (vetorial, igual à impressão do navegador).
// Recebe { html } e devolve application/pdf. Só para quem está logado na agenda (token do Supabase).
// A página é desenhada sem JavaScript e sem acesso à internet, exceto as fontes do Google.
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const SB_URL = 'https://zkkblwefgfviapidkvrn.supabase.co';
const SB_CHAVE = 'sb_publishable_c4yeQniM4ekjBwAkPMzneA_j9VEriB-';
const MAX_HTML = 4 * 1024 * 1024;
const PERMITIDO = /^(data:|https:\/\/fonts\.googleapis\.com\/|https:\/\/fonts\.gstatic\.com\/)/;

let navegador = null;   // reaproveitado enquanto a função continua "quente"
async function abrirNavegador() {
  if (navegador && navegador.connected) return navegador;
  navegador = await puppeteer.launch({
    args: chromium.args,
    executablePath: process.env.CHROME_LOCAL || await chromium.executablePath(),
    headless: true
  });
  return navegador;
}

async function usuarioValido(token) {
  if (!token) return false;
  try {
    const r = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_CHAVE, Authorization: `Bearer ${token}` } });
    return r.ok;
  } catch (e) { return false; }
}

export default async function handler(req, res) {
  // a agenda também roda aberta do computador (arquivo mestre): libera outras origens; o acesso depende do token
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ erro: 'Use POST.' }); }
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!await usuarioValido(token)) return res.status(401).json({ erro: 'Entre com seu login na agenda para gerar os PDFs.' });
  const html = req.body && typeof req.body.html === 'string' ? req.body.html : '';
  if (!html || html.length > MAX_HTML) return res.status(400).json({ erro: 'Relatório vazio ou grande demais.' });

  let pagina = null;
  try {
    const b = await abrirNavegador();
    pagina = await b.newPage();
    await pagina.setJavaScriptEnabled(false);
    await pagina.setRequestInterception(true);
    pagina.on('request', r => (PERMITIDO.test(r.url()) ? r.continue() : r.abort()));
    await pagina.setContent(html, { waitUntil: 'networkidle0', timeout: 25000 });
    const pdf = await pagina.pdf({ printBackground: true, preferCSSPageSize: true, timeout: 25000 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(Buffer.from(pdf));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: 'Não foi possível gerar o PDF: ' + (e && e.message || e) });
  } finally {
    if (pagina) await pagina.close().catch(() => {});
  }
}
