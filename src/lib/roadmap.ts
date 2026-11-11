export type RoadmapRole={name:string;skills:string[];tasks:[string[],string[],string[]]};
export const ROADMAP_ROLES:RoadmapRole[]=[
  {name:'Data Analyst',skills:['Excel','SQL','Python','Pandas','Power BI','Statistika'],tasks:[['Excel-də data cleaning və pivot cədvəlləri məşq et','SQL SELECT, JOIN, GROUP BY tapşırıqlarını həll et','Kiçik dataset üzrə EDA apar'],['Python və Pandas ilə analitik notebook hazırla','Matplotlib/Seaborn ilə vizuallaşdırmalar yarat','Power BI dashboard hazırlayıb nəticələri izah et'],['Real dataset üzrə end-to-end layihə tamamla','GitHub README və portfolio əlavə et','3 vakansiya tələbi üzrə CV-ni uyğunlaşdır']]},
  {name:'Machine Learning Engineer',skills:['Python','NumPy','Pandas','Scikit-learn','Model qiymətləndirmə','Deployment'],tasks:[['Python, NumPy və Pandas məşqləri et','Train/test split və data leakage mövzularını öyrən','Regression və classification nümunələri hazırla'],['Scikit-learn Pipeline və cross-validation öyrən','Precision, recall, F1 və ROC-AUC müqayisə et','Kiçik ML layihəsinin nəticələrini sənədləşdir'],['Modeli FastAPI ilə təqdim et','GitHub repo və təkrar istehsal olunan README hazırla','ML müsahibə sualları ilə məşq et']]},
  {name:'Frontend Developer',skills:['HTML','CSS','JavaScript','TypeScript','React','Testing'],tasks:[['Semantik HTML və responsive CSS məşq et','JavaScript DOM və asinxron kodu öyrən','Bir mobil uyğun səhifə hazırla'],['React komponentləri və state öyrən','TypeScript ilə form və validasiya yaz','API-dən data çəkən kiçik tətbiq qur'],['UI testləri və accessibility yoxla','Layihəni GitHub Pages-də yayımla','Portfolio və CV-ni güncəllə']]},
  {name:'Backend Developer',skills:['C#','ASP.NET Core','SQL','REST API','Authentication','Testing'],tasks:[['C# OOP və LINQ məşqləri et','SQL əlaqələri və JOIN mövzularını öyrən','Sadə REST API endpoint-ləri yaz'],['ASP.NET Core ilə CRUD tətbiqi qur','Validation və error handling əlavə et','JWT və ya cookie-based auth prinsiplərini öyrən'],['Unit və integration testlər yaz','API documentation və README hazırla','Backend müsahibə məşqi et']]},
  {name:'DevOps Engineer',skills:['Linux','Git','Docker','CI/CD','Cloud','Monitoring'],tasks:[['Linux terminal və Git workflow məşq et','Şəbəkə və HTTP əsaslarını təkrarla','Docker image və container yarat'],['GitHub Actions ilə CI qur','Containerized layihə yayımla','Cloud IAM və secret management öyrən'],['Monitoring və log alətləri ilə məşq et','Infrastructure-as-code nümunəsi hazırla','Portfolio-da deploy prosesini sənədləşdir']]},
  {name:'QA Engineer',skills:['Test cases','JavaScript','API testing','Playwright','Automation','CI/CD'],tasks:[['Test case və bug report yazmağı məşq et','Manual test plan hazırla','API testlərini öyrən'],['Playwright ilə end-to-end testlər yaz','Regression və boundary testlərini tətbiq et','Test nəticələrini sənədləşdir'],['GitHub Actions-da avtomatik test qur','Demo bug report portfolio hazırla','QA müsahibə məşqi et']]}
];

export function normalizeSkill(value:string){return value.toLocaleLowerCase('en-US').replace(/[^a-z0-9+#.]+/g,' ').trim();}
export function roadmapSkillGaps(cv:string,role:RoadmapRole){
  const normalized=normalizeSkill(cv);
  const found=role.skills.filter(skill=>normalized.includes(normalizeSkill(skill)));
  return {found,missing:role.skills.filter(skill=>!found.includes(skill))};
}
export function roadmapTasks(role:RoadmapRole){return role.tasks.map((tasks,i)=>({period:[30,60,90][i],tasks}));}
export function recommendedRoadmapRole(roles:string[]){return ROADMAP_ROLES.find(role=>roles.includes(role.name))?.name||null;}
export function combinedRoadmapSkillGaps(cv:string,evidence:string[],role:RoadmapRole){
  const cvGaps=roadmapSkillGaps(cv,role);
  const fromProfiles=role.skills.filter(skill=>!cvGaps.found.includes(skill)&&evidence.some(item=>normalizeSkill(item)===normalizeSkill(skill)));
  return {fromCv:cvGaps.found,fromProfiles,found:[...cvGaps.found,...fromProfiles],missing:cvGaps.missing.filter(skill=>!fromProfiles.includes(skill))};
}
