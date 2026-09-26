import http from 'node:http';
import {readFile} from 'node:fs/promises';
const html=await readFile(new URL('./public/index.html',import.meta.url));
const allowed=/^(matches(?:\/\d+)?|competitions\/(?:[A-Z0-9]+)\/matches)$/;
export function createServer(upstreamFetch=fetch){return http.createServer(async(req,res)=>{
 const send=(status,body,type='application/json')=>{res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'"});res.end(body)};
 const error=(s,message)=>send(s,JSON.stringify({message}));
 try{
 if(req.method!=='GET')return error(405,'Only GET is supported.');
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/')return send(200,html,'text/html; charset=utf-8');
 if(url.pathname==='/health')return send(200,'{"ok":true}');
 if(!url.pathname.startsWith('/api/'))return error(404,'Not found.');
 const path=url.pathname.slice(5);
 if(!allowed.test(path))return error(400,'Unsupported API endpoint.');
 const keys=new Set(['dateFrom','dateTo','competitions']);
 if([...url.searchParams.keys()].some(k=>!keys.has(k)))return error(400,'Unsupported query parameter.');
 for(const [k,v] of url.searchParams){if(k.startsWith('date')?!/^\d{4}-\d{2}-\d{2}$/.test(v):! /^[A-Z0-9,]{1,150}$/.test(v))return error(400,'Invalid filter.');}
 const token=req.headers['x-auth-token'];
 if(typeof token!=='string'||!token.trim()||token.length>256)return error(401,'Enter your Football-data.org token.');
 // Only forward to this fixed provider. Never log or persist credentials.
 const upstream=await upstreamFetch('https://api.football-data.org/v4/'+path+url.search,{headers:{'X-Auth-Token':token,Accept:'application/json'},signal:AbortSignal.timeout(20000),redirect:'error'});
 const text=await upstream.text();let data;
 try{data=JSON.parse(text)}catch{return error(502,'The football provider returned an unreadable response.');}
 send(upstream.status,JSON.stringify(data));
 }catch(e){error(e.name==='TimeoutError'?504:502,e.name==='TimeoutError'?'Football provider timed out. Try again.':'Could not connect to the football provider. Try again later.');}
})}
if(process.env.NODE_ENV!=='test'){createServer().listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Roman football server ready'));}
