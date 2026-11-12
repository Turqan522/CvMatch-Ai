export type CVTemplate='classic'|'modern'|'compact';
export const CV_TEMPLATES:[CVTemplate,string][]=[['classic','Classic ATS'],['modern','Modern Professional'],['compact','Compact One-page']];
export function buildOptimizedResume(cv:string,summary:string,skills:string[]):string{
 const lines=cv.split('\n').map(l=>l.trim()).filter(Boolean);
 const cleanedSummary=summary.trim();
 return [lines[0]||'CV','','PEŞƏKAR XÜLASƏ',cleanedSummary,'','BACARIQLAR',skills.join(', ')||'CV-də qeyd edilməyib','',...lines.slice(1)].join('\n');
}
function save(blob:Blob,name:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function sections(text:string){
 const lines=text.replace(/\r\n/g,'\n').split('\n');
 const heading=/^(?:education|experience|skills|projects|certifications|summary|contact|references|təhsil|tecrube|təcrübə|bacarıqlar|layihələr|sertifikatlar|haqqımda|peşəkar xülasə|iş təcrübəsi|eğitim|deneyim|beceriler|projeler|sertifikalar)\s*:?$/i;
 return lines.map((raw,index)=>({text:raw.trim(),isTitle:index===0,isHeading:index!==0&&heading.test(raw.trim())}));
}
export async function downloadDocx(content:string,template:CVTemplate='classic'){
 const {Document,HeadingLevel,Packer,Paragraph,TextRun,AlignmentType}=await import('docx');
 const list=sections(content);
 const compact=template==='compact',modern=template==='modern';
 const children=list.map(line=>new Paragraph({
  children:[new TextRun({text:line.text,bold:line.isTitle||line.isHeading,color:line.isTitle?(modern?'176F83':'17263C'):line.isHeading?(modern?'176F83':'203C55'):'243247',size:line.isTitle?(compact?30:36):line.isHeading?23:compact?19:21})],
  heading:line.isTitle?HeadingLevel.TITLE:undefined,
  alignment:line.isTitle&&modern?AlignmentType.CENTER:AlignmentType.LEFT,
  spacing:{before:line.isHeading?160:0,after:line.isTitle?200:line.isHeading?110:line.text?(compact?40:85):140},
 }));
 const document=new Document({sections:[{properties:{page:{margin:{top:compact?650:850,right:compact?750:950,bottom:compact?650:850,left:compact?750:950}}},children}]});
 save(await Packer.toBlob(document),'CVMatch_'+template+'.docx');
}
export function downloadPdf(content:string,template:CVTemplate='classic'){
 // Print via the browser Unicode pipeline (Azerbaijani characters supported).
 const win=window.open('','_blank');
 if(!win)throw new Error('PDF üçün pop-up pəncərəsinə icazə verin.');
 const escapeHtml=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
 const block=sections(content).map(x=>x.isTitle?'<h1>'+escapeHtml(x.text)+'</h1>':x.isHeading?'<h2>'+escapeHtml(x.text)+'</h2>':x.text?'<p>'+escapeHtml(x.text)+'</p>':'<div class="space"></div>').join('');
 const compact=template==='compact',modern=template==='modern';
 const css=`@page{size:A4;margin:${compact?'10':'14'}mm}
 body{font-family:Arial,Helvetica,sans-serif;font-size:${compact?'9':'10.5'}pt;color:#18283b;line-height:${compact?'1.32':'1.5'};margin:0;padding:2mm 1mm;overflow-wrap:anywhere}
 h1{font-size:${compact?'19':'23'}pt;color:${modern?'#176f83':'#17283c'};letter-spacing:-.4px;margin:0 0 14px;${modern?'text-align:center':''}}
 h2{font-size:11pt;letter-spacing:.6px;text-transform:uppercase;border-bottom:${modern?'2px solid #176f83':'1px solid #c8d3dc'};margin:18px 0 8px;padding-bottom:4px;break-after:avoid}
 p{white-space:pre-wrap;margin:0 0 ${compact?'3':'6'}px;orphans:2;widows:2}
 .space{height:${compact?'4':'8'}px}`;
 win.document.write('<!doctype html><html lang="az"><head><meta charset="utf-8"><title>CVMatch AI CV</title><style>'+css+'</style></head><body>'+block+'</body></html>');
 win.document.close();win.focus();setTimeout(()=>win.print(),350);
}
