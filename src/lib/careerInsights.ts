import {extractSkills,scoreResume} from './scoring';
export type QualityFinding={id:string;label:string;detail:string;priority:'high'|'medium'|'low';passed:boolean};
export function evaluateCV(cv:string):{score:number;findings:QualityFinding[];wordCount:number}{
 const text=cv.trim(),words=text.split(/\s+/).filter(Boolean);
 const lines=text.split(/\n/).map(x=>x.trim()).filter(Boolean);
 const email=/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(text);
 const phone=/(?:\+?\d[\d\s()\-]{7,}\d)/.test(text);
 const education=/(education|təhsil|tehsil|universitet|university|bachelor|degree|bakalavr|tədris)/i.test(text);
 const experience=/(experience|təcrübə|tecrube|intern|work history|iş təcrübəsi|employment)/i.test(text);
 const projects=/(project|layihə|layihe|portfolio|github\.com)/i.test(text);
 const quantified=/(\d+\s*(?:%|percent|users|müştəri|istifadəçi|layihə|project|azn|usd|\$|₼|ay|months))/i.test(text);
 const skills=extractSkills(text);
 const findings:QualityFinding[]=[
 {id:'length',label:'CV məzmunu',detail:'Təhsil, bacarıq və təcrübəni kifayət qədər faktlarla izah edin (təxminən 100–850 söz).',passed:words.length>=100&&words.length<=850,priority:'medium'},
 {id:'email',label:'E-poçt ünvanı',detail:'İşəgötürənin əlaqə saxlaya bilməsi üçün peşəkar e-poçt əlavə edin.',passed:email,priority:'high'},
 {id:'phone',label:'Telefon nömrəsi',detail:'Əlçatan telefon nömrəsi əlavə edin.',passed:phone,priority:'medium'},
 {id:'education',label:'Təhsil',detail:'Universitet, ixtisas və təhsil dövrünü qeyd edin.',passed:education,priority:'medium'},
 {id:'experience',label:'Təcrübə',detail:'İş və ya təcrübə proqramı üzrə real rolunuzu və gördüyünüz işləri yazın.',passed:experience,priority:'medium'},
 {id:'projects',label:'Layihə sübutları',detail:'Layihələrin nəticələrini və GitHub/portfolio keçidlərini göstərmək faydalıdır.',passed:projects,priority:'medium'},
 {id:'metrics',label:'Ölçülə bilən nəticələr',detail:'Yalnız həqiqi və yoxlanıla bilən rəqəmlərlə nailiyyətləri göstərin.',passed:quantified,priority:'low'},
 {id:'skills',label:'Texniki bacarıqlar',detail:'Bacarıqları ayrıca bölmədə və real layihələrlə əlaqəli təqdim edin.',passed:skills.length>=2,priority:'high'},
 {id:'format',label:'Oxunaqlılıq',detail:'Uzun sətirlərdən və ardıcıl boşluqlardan qaçın; bölmələr üzrə struktur yaradın.',passed:lines.length>=5&&!lines.some(line=>line.length>350),priority:'low'}
 ];
 const score=Math.round(findings.reduce((sum,x)=>sum+(x.passed?x.priority==='high'?16:x.priority==='medium'?11:7:0),0)/findings.reduce((sum,x)=>sum+(x.priority==='high'?16:x.priority==='medium'?11:7),0)*100);
 return {score,findings,wordCount:words.length};
}
export function compareJob(cv:string,job:string,profileText=''){
 const cvResult=scoreResume(cv,job);
 const profileResult=profileText.trim()?scoreResume(cv+'\n'+profileText,job):cvResult;
 const profileOnly=extractSkills(profileText);
 const cvSkills=extractSkills(cv);
 return {cvResult,combined:profileResult,portfolioSkills:profileOnly.filter(x=>!cvSkills.includes(x)),confidence:cvResult.required.length>=3?'normal':'limited' as 'normal'|'limited'};
}
