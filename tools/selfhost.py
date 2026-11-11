import re,sys,os,shutil,urllib.parse,glob
SITE,NM=sys.argv[1],sys.argv[2]
fontdir=os.path.join(SITE,'assets/fonts');os.makedirs(fontdir,exist_ok=True)
faces=set()
def parse(url):
    q=urllib.parse.urlparse(url.replace('&amp;','&')).query
    for fam in urllib.parse.parse_qs(q)['family']:
        name,_,spec=fam.partition(':')
        name=name.replace('+',' ')
        if not spec: faces.add((name,400,'normal'));continue
        axes,_,vals=spec.partition('@');axes=axes.split(',')
        for v in vals.split(';'):
            d=dict(zip(axes,v.split(',')))
            faces.add((name,int(d.get('wght',400)),'italic' if d.get('ital')=='1' else 'normal'))
for f in [x for x in glob.glob(SITE+'/games/*/*.html') if not x.endswith('/index.html')]:
    s=open(f,encoding='utf-8').read()
    for u in re.findall(r'href="(https://fonts\.googleapis\.com/css2\?[^"]+)"',s): parse(u)
    s=re.sub(r'<link[^>]*href="https://fonts\.(googleapis|gstatic)\.com[^"]*"[^>]*>\s*','',s)
    s=re.sub(r'@import\s+url\([^)]*fonts\.googleapis[^)]*\);?','',s)
    if '/assets/fonts.css' not in s: s=s.replace('<head>','<head>\n<link rel="stylesheet" href="/assets/fonts.css">',1) if '<head>' in s else re.sub(r'(<head[^>]*>)',r'\1\n<link rel="stylesheet" href="/assets/fonts.css">',s,1)
    s=s.replace('https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js','/assets/vendor/peerjs.min.js')
    open(f,'w',encoding='utf-8').write(s)
css=[];miss=[]
for name,w,st in sorted(faces):
    pid=name.lower().replace(' ','-')
    src=None
    for sub in ('latin',):
        p=f'{NM}/@fontsource/{pid}/files/{pid}-{sub}-{w}-{st}.woff2'
        if os.path.exists(p): src=p
    if not src: miss.append((name,w,st));continue
    for sub in ('latin','latin-ext'):
        p=f'{NM}/@fontsource/{pid}/files/{pid}-{sub}-{w}-{st}.woff2'
        if not os.path.exists(p): continue
        shutil.copy(p,fontdir)
        rng='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD' if sub=='latin' else 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'
        css.append(f"@font-face{{font-family:'{name}';font-style:{st};font-weight:{w};font-display:swap;src:url(/assets/fonts/{os.path.basename(p)}) format('woff2');unicode-range:{rng}}}")
fp=os.path.join(SITE,'assets/fonts.css');old=open(fp).read().splitlines() if os.path.exists(fp) else []
old=[l.replace('url(fonts/','url(/assets/fonts/') for l in old]
merged=old+[c for c in css if c not in old]
open(fp,'w').write('\n'.join(l.replace('url(/assets/fonts/','url(fonts/') for l in merged)+'\n')
print(len(faces),'faces; missing:',miss)
