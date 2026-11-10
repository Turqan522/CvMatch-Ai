import {useState} from 'react';
import {getAI,getGenerativeModel,GoogleAIBackend} from 'firebase/ai';
import {ArrowUpRight,Bot,LoaderCircle,Send,ShieldCheck,Sparkles,Trash2,UserRound} from 'lucide-react';
import {app} from './firebase';
import './assistant.css';

type Message={role:'user'|'assistant';text:string};
const examples=['CV-m ATS sistemindən niyə keçmir?','LinkedIn profilimdə nəyi düzəldim?','Təcrübəm yoxdursa hansı vakansiyalara müraciət edim?','GitHub portfoliomu necə gücləndirim?'];
function savedCv(userId:string){try{const data=JSON.parse(localStorage.getItem('cvmatch_draft_v1_'+userId)||'{}');return typeof data.cv==='string'?data.cv:'';}catch{return '';}}
function errorMessage(error:unknown){const description=error instanceof Error?error.message:'';if(/app.check|app-check|attestation|403/i.test(description))return 'Firebase App Check icazəsi tamamlanmayıb. Layihə sahibi AI Logic və App Check quraşdırmasını bitirməlidir.';if(/429|quota|rate.limit/i.test(description))return 'Pulsuz AI limiti dolub. Bir qədər sonra yenidən yoxlayın.';return 'AI xidmətinə qoşulmaq alınmadı. Firebase AI Logic (Gemini Developer API) aktivləşdirilməli və tətbiq üçün App Check qurulmalıdır.';}
export default function AIAssistant({userId}:{userId:string}){
  const [messages,setMessages]=useState<Message[]>([{role:'assistant',text:'Salam! Mən CVMatch AI karyera köməkçisiyəm. CV, LinkedIn, GitHub, vakansiya seçimi və iş müsahibəsi ilə bağlı sualını yaz. Birlikdə konkret addımlar tapaq.'}]);
  const [input,setInput]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[includeCv,setIncludeCv]=useState(false);
  const cv=savedCv(userId);
  const ask=async(value=input)=>{
    const question=value.trim();if(!question||busy)return;
    const next=[...messages,{role:'user' as const,text:question}];setMessages(next);setInput('');setBusy(true);setError('');
    try{
      const ai=getAI(app,{backend:new GoogleAIBackend()});
      const model=getGenerativeModel(ai,{model:'gemini-3.8-flash',systemInstruction:'Sən CVMatch AI daxilində fəaliyyət göstərən peşəkar, mehriban karyera məsləhətçisisən. Azərbaycan dilində, anlaşılan və konkret cavab ver. CV, ATS, LinkedIn, GitHub, vakansiyalar, bacarıqlar, müsahibə və texniki problemlər üzrə addım-addım kömək et. Heç vaxt olmayan təcrübə və ya bacarıq uydurmağı məsləhət görmə. İşə qəbul zəmanəti və əsassız faizlər vermə. İstifadəçidən şifrə, API açarı və həssas sənəd istəmə. Sual tam aydın deyilsə, qısa dəqiqləşdirmə istə. Maksimum 250 sözlə cavab ver.'});
      const context=next.slice(-8).map(m=>`${m.role==='user'?'Namizəd':'Köməkçi'}: ${m.text}`).join('\n');
      const prompt=`Söhbət:\n${context}${includeCv&&cv.trim()?`\n\nNamizədin öz razılığı ilə göndərdiyi CV mətni:\n${cv.slice(0,8000)}`:''}\n\nSon suala cavab ver.`;
      const response=await model.generateContent(prompt);
      const answer=response.response.text().trim();
      if(!answer)throw new Error('Empty AI response');
      setMessages(old=>[...old,{role:'assistant',text:answer}]);
    }catch(e){setError(errorMessage(e));}finally{setBusy(false);}
  };
  return <main className="app-shell assistant-page"><section className="assistant-layout">
    <div className="assistant-heading"><span className="small-kicker"><Sparkles size={14}/> CAREER INTELLIGENCE</span><h1><Bot size={33}/> AI Karyera Köməkçisi</h1><p>Problemini yaz, AI ilə həll yollarını araşdır. CV, ATS, LinkedIn, GitHub və iş axtarışı barədə suallar ver.</p><span className="assistant-status"><ShieldCheck size={14}/> Gemini · Firebase AI Logic · pulsuz limitlər daxilində</span></div>
    <div className="assistant-chat"><div className="assistant-chat-header"><div><Bot size={20}/><strong>Namizəd dəstəyi</strong></div><button className="text-button" onClick={()=>{setMessages([{role:'assistant',text:'Yeni söhbətə başlayaq! Nə barədə kömək lazımdır?'}]);setError('');}}><Trash2 size={15}/> Təmizlə</button></div>
      <div className="assistant-messages" aria-live="polite">{messages.map((m,i)=><div className={'assistant-message '+m.role} key={i}><span className="assistant-avatar">{m.role==='user'?<UserRound size={17}/>:<Bot size={17}/>}</span><p>{m.text}</p></div>)}{busy&&<div className="assistant-message assistant"><span className="assistant-avatar"><Bot size={17}/></span><p><LoaderCircle size={16} className="spin"/> Cavab hazırlanır...</p></div>}</div>
      {error&&<div className="assistant-error" role="alert"><b>AI bağlantısı:</b> {error} <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">Firebase Console <ArrowUpRight size={12}/></a></div>}
      <div className="assistant-suggestions">{examples.map(s=><button key={s} onClick={()=>void ask(s)} disabled={busy}>{s}</button>)}</div>
      <label className="assistant-consent"><input type="checkbox" checked={includeCv} onChange={e=>setIncludeCv(e.target.checked)}/><span>CV mətnimi də AI sorğusuna əlavə et {cv?'(istəyə bağlı)':'(əvvəl CV daxil edilməlidir)'}. Şəxsi məlumatlarım AI xidmətinə göndəriləcək.</span></label>
      <form className="assistant-form" onSubmit={e=>{e.preventDefault();void ask();}}><textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Məsələn: 10 vakansiyaya müraciət etdim, niyə cavab almıram?" maxLength={3000} rows={3} aria-label="AI köməkçiyə sual"/><button className="btn primary" disabled={!input.trim()||busy} type="submit">{busy?<LoaderCircle className="spin" size={17}/>:<Send size={17}/>} Göndər</button></form>
      <p className="assistant-disclaimer">AI cavabları səhv ola bilər. Söhbət bu səhifə açıq olduqca saxlanılır. CV mətni yalnız yuxarıdakı seçimi aktivləşdirsəniz sorğuya əlavə edilir.</p>
    </div>
  </section></main>;
}
