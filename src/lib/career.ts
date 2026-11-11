import {scoreResume} from './scoring';

export type GithubRepo={name:string;description:string|null;language:string|null;html_url:string;stargazers_count:number;fork:boolean;updated_at:string};
export type GithubProfile={login:string;name:string|null;bio:string|null;public_repos:number;html_url:string;blog:string|null;repos:GithubRepo[]};
export type CareerFinding={area:'CV'|'LinkedIn'|'GitHub'|'Ümumi';tone:'good'|'improve';message:string};
export type CareerReport={skills:string[];roles:string[];findings:CareerFinding[]};
export type JobListing={id:number;title:string;company_name:string;url:string;candidate_required_location:string;description:string;publication_date:string;category:string};
export type ProfileAuditItem={id:string;title:string;detail:string;complete:boolean;priority:'high'|'medium';source:'LinkedIn'|'GitHub'};

export function profileAudit(linkedin:string,github:GithubProfile|null):ProfileAuditItem[]{
  const has=(re:RegExp)=>re.test(linkedin);
  const repos=github?.repos||[];
  return [
    {id:'li-headline',source:'LinkedIn',title:'Aydın peşəkar başlıq',detail:'Headline hissəsində hədəf rolunuzu və 2–3 əsas bacarığınızı yazın.',complete:has(/headline|başlıq|başliq|[|][^\n]{8,}/i),priority:'high'},
    {id:'li-about',source:'LinkedIn',title:'Dəyər yaradan About bölməsi',detail:'Kim olduğunuzu, güclü tərəflərinizi və real nəticənizi 3–5 cümlədə izah edin.',complete:has(/about|haqqımda|haqqimda|summary/i)&&linkedin.trim().length>=180,priority:'high'},
    {id:'li-experience',source:'LinkedIn',title:'Təcrübə və layihə sübutları',detail:'Experience/Projects hissəsinə rolunuzu, texnologiyanı və ölçülə bilən nəticəni əlavə edin.',complete:has(/experience|təcrübə|tecrube|projects|layihə|layihe/i),priority:'high'},
    {id:'li-skills',source:'LinkedIn',title:'Bacarıqlar və sertifikatlar',detail:'Skills və sertifikatları hədəf vakansiyaya uyğun sıralayın.',complete:has(/skills|bacarıq|bacariq|certificat|sertifikat/i),priority:'medium'},
    {id:'gh-bio',source:'GitHub',title:'GitHub bio və portfolio linki',detail:'Bio-da ixtisasınızı, blog/portfolio linkində isə ən güclü işinizi göstərin.',complete:!!github?.bio&&!!github?.blog,priority:'high'},
    {id:'gh-projects',source:'GitHub',title:'Ən azı 3 orijinal açıq layihə',detail:'Kiçik tapşırıqlardan əlavə 3 real problem həll edən layihə paylaşın.',complete:repos.length>=3,priority:'high'},
    {id:'gh-descriptions',source:'GitHub',title:'Layihələrin qısa təsvirləri',detail:'Hər açıq repoya məqsədini, stack-ini və nəticəsini izah edən təsvir əlavə edin.',complete:repos.length>0&&repos.every(repo=>!!repo.description?.trim()),priority:'medium'},
    {id:'gh-updated',source:'GitHub',title:'Aktual layihə fəaliyyəti',detail:'Portfolio layihələrini müntəzəm yeniləyin; köhnə layihələri arxivləşdirin və ya sənədləşdirin.',complete:repos.some(repo=>Number.isFinite(Date.parse(repo.updated_at))&&Date.now()-Date.parse(repo.updated_at)<1000*60*60*24*90),priority:'medium'}
  ];
}

const roles=[
  {name:'Python Developer',words:['python','django','flask','fastapi']},
  {name:'Data Analyst',words:['sql','excel','power bi','tableau','pandas','data analysis','analytics']},
  {name:'Machine Learning Engineer',words:['machine learning','pytorch','tensorflow','scikit-learn','deep learning']},
  {name:'Frontend Developer',words:['react','typescript','javascript','html','css']},
  {name:'Backend Developer',words:['c#','asp.net','node.js','java','spring','api']},
  {name:'DevOps Engineer',words:['docker','kubernetes','aws','terraform','ci/cd']},
  {name:'QA Engineer',words:['testing','selenium','playwright','pytest','automation']},
];
export const knownSkills=[...new Set(roles.flatMap(role=>role.words).concat(['git','github','postgresql','mongodb','c++','firebase','azure','linux','numpy','gitlab','rest api']))];

export function githubUsername(input:string):string|null{
  const value=input.trim().replace(/\/$/,'');
  if(!value)return null;
  let username=value;
  if(/^https?:\/\//i.test(value)){
    try{const url=new URL(value);if(!['github.com','www.github.com'].includes(url.hostname.toLowerCase()))return null;username=url.pathname.split('/').filter(Boolean)[0]||'';}catch{return null;}
  }
  return /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)?username:null;
}

export async function fetchGithubProfile(input:string):Promise<GithubProfile>{
  const username=githubUsername(input);
  if(!username)throw new Error('GitHub istifadəçi adını və ya github.com/istifadəçi linkini düzgün daxil edin.');
  const [profileResponse,reposResponse]=await Promise.all([
    fetch(`https://api.github.com/users/${encodeURIComponent(username)}`,{headers:{Accept:'application/vnd.github+json'}}),
    fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,{headers:{Accept:'application/vnd.github+json'}})
  ]);
  if(profileResponse.status===404)throw new Error('GitHub profili tapılmadı.');
  if(!profileResponse.ok||!reposResponse.ok)throw new Error('GitHub məlumatlarını almaq olmadı. Bir az sonra yenidən yoxlayın.');
  const profile=await profileResponse.json();const repos=await reposResponse.json();
  return {login:String(profile.login),name:profile.name||null,bio:profile.bio||null,public_repos:Number(profile.public_repos)||0,html_url:String(profile.html_url),blog:profile.blog||null,repos:Array.isArray(repos)?repos.filter((repo:GithubRepo)=>!repo.fork).map((repo:GithubRepo)=>({name:repo.name,description:repo.description,language:repo.language,html_url:repo.html_url,stargazers_count:repo.stargazers_count,fork:repo.fork,updated_at:repo.updated_at})):[]};
}

export function createCareerReport(cv:string,linkedIn:string,github:GithubProfile|null):CareerReport{
  const text=[cv,linkedIn,github?.bio||'',...(github?.repos||[]).flatMap(repo=>[repo.name,repo.description||'',repo.language||''])].join(' ').toLowerCase();
  const skills=knownSkills.filter(skill=>new RegExp(`(^|[^a-z0-9])${skill.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}($|[^a-z0-9])`,'i').test(text));
  const sorted=roles.map(role=>({name:role.name,score:role.words.filter(word=>skills.includes(word)).length})).sort((a,b)=>b.score-a.score);
  const recommended=sorted.filter(item=>item.score>0).slice(0,3).map(item=>item.name);
  const findings:CareerFinding[]=[];
  if(cv.trim().length<100)findings.push({area:'CV',tone:'improve',message:'CV-də təhsil, təcrübə, layihə və ölçülə bilən nəticələri daha ətraflı göstərin.'});
  else findings.push({area:'CV',tone:'good',message:'CV mətniniz analiz üçün kifayət qədər məlumat verir.'});
  if(!/project|layihə|portfolio/i.test(cv))findings.push({area:'CV',tone:'improve',message:'Layihələrinizi və hər layihədə konkret töhfənizi CV-yə əlavə edin.'});
  if(!linkedIn.trim())findings.push({area:'LinkedIn',tone:'improve',message:'LinkedIn məzmunu daxil edilməyib. Headline, About, Experience və Skills bölmələrini əlavə edin.'});
  else{
    if(linkedIn.length<180)findings.push({area:'LinkedIn',tone:'improve',message:'LinkedIn haqqında məlumat çox qısadır. Peşəkar xülasə, layihə nəticələri və bacarıqları genişləndirin.'});
    if(!/about|haqqımda|summary|headline|başlıq/i.test(linkedIn))findings.push({area:'LinkedIn',tone:'improve',message:'LinkedIn Headline və About mətnini daxil edib aydın ixtisas və karyera hədəfi göstərin.'});
    if(linkedIn.length>=180)findings.push({area:'LinkedIn',tone:'good',message:'LinkedIn məzmunu müqayisəyə daxil edildi. CV-dəki bacarıq və təcrübələrlə uyğun saxlayın.'});
  }
  if(!github)findings.push({area:'GitHub',tone:'improve',message:'GitHub profilini analizə qoşun ki, açıq layihələr üzrə tövsiyələr verilsin.'});
  else{
    if(!github.bio)findings.push({area:'GitHub',tone:'improve',message:'GitHub profilinin Bio hissəsini ixtisasınız və texniki maraqlarınızla doldurun.'});
    if(github.repos.length===0)findings.push({area:'GitHub',tone:'improve',message:'Profilinizdə açıq, özünüzə məxsus layihə görünmür. Portfolio layihəsi əlavə edin.'});
    const withoutDescription=github.repos.filter(repo=>!repo.description).length;
    if(withoutDescription)findings.push({area:'GitHub',tone:'improve',message:`${withoutDescription} açıq repozitoriyada təsvir yoxdur. Məqsəd, texnologiyalar və işə salma addımlarını README-də də izah edin.`});
    if(github.repos.length>0)findings.push({area:'GitHub',tone:'good',message:`${github.repos.length} şəxsi açıq repozitoriya nəzərdən keçirildi. Ən güclü layihələri CV və LinkedIn-də vurğulayın.`});
  }
  if(skills.length<3)findings.push({area:'Ümumi',tone:'improve',message:'CV, LinkedIn və GitHub məzmununda texniki bacarıqların sübutunu artırın.'});
  if(recommended.length)findings.push({area:'Ümumi',tone:'good',message:`Məlumatlarınıza əsasən ilkin istiqamətlər: ${recommended.join(', ')}.`});
  return {skills,roles:recommended.length?recommended:['Software Developer','IT Intern'],findings};
}

export function scoreJobMatch(cv:string,linkedin:string,github:GithubProfile|null,job:JobListing):number{
  const profile=[cv,linkedin,github?.bio||'',...(github?.repos||[]).flatMap(repo=>[repo.description||'',repo.language||'',repo.name])].join(' ');
  const description=job.description.replace(/<[^>]*>/g,' ');
  const score=scoreResume(profile,`${job.title}. ${description}`);
  return score.required.length?Math.round(score.keywordCoverage):0;
}

export async function fetchRemoteJobs():Promise<JobListing[]>{
  const response=await fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=100');
  if(!response.ok)throw new Error('Beynəlxalq vakansiya mənbəyi hazırda cavab vermir.');
  const data=await response.json();
  if(!Array.isArray(data.jobs))throw new Error('Vakansiya məlumatlarının formatı düzgün deyil.');
  return data.jobs.filter((job:JobListing)=>/^https:\/\//i.test(job.url)).map((job:JobListing)=>({id:job.id,title:job.title,company_name:job.company_name,url:job.url,candidate_required_location:job.candidate_required_location,description:job.description||'',publication_date:job.publication_date,category:job.category}));
}

export function localJobSearchUrl(role:string,provider:'linkedin'|'hellojob'|'boss'|'google'){
  const query=encodeURIComponent(`${role} Bakı Azərbaycan vakansiya`);
  if(provider==='linkedin')return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role)}&location=${encodeURIComponent('Azerbaijan')}`;
  if(provider==='hellojob')return `https://www.google.com/search?q=${encodeURIComponent(`site:hellojob.az/vakansiyalar/ ${role}`)}`;
  if(provider==='boss')return `https://www.google.com/search?q=${encodeURIComponent(`site:boss.az ${role} vakansiya`)}`;
  return `https://www.google.com/search?q=${query}`;
}
