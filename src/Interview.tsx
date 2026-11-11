import {useEffect,useMemo,useState} from 'react';
import {getAI,getGenerativeModel,GoogleAIBackend} from 'firebase/ai';
import {Bot,LoaderCircle,RotateCcw,ShieldCheck,Volume2} from 'lucide-react';
import {app} from './firebase';
import VoiceInput from './VoiceInput';
import {buildInterviewQuestions} from './lib/interview';
import './interview.css';

type Question=ReturnType<typeof buildInterviewQuestions>[number];
type Feedback={text:string;source:'ai'|'hint'};

function readableError(error:unknown){
  const message=error instanceof Error?error.message:'';
  if(/429|quota|rate.limit/i.test(message))return 'Pulsuz AI sorğu limiti dolub. Bir qədər sonra yenidən cəhd edin.';
  if(/app.check|app-check|attestation|403/i.test(message))return 'Firebase App Check təsdiqi alınmadı. Bir qədər sonra yenidən yoxlayın.';
  return 'AI cavabınızı yoxlaya bilmədi. Sual ipucundan istifadə edə bilərsiniz.';
}

export default function Interview({cv,job}:{cv:string;job:string}){
  const questions=useMemo(()=>buildInterviewQuestions(cv,job),[cv,job]);
  return <section className="work-card interview-section" aria-labelledby="interview-title">
    <span className="small-kicker">AI MOCK INTERVIEW · MÜSAHİBƏ MƏŞQİ</span>
    <h2 id="interview-title">HR sizdən nə soruşa bilər?</h2>
    <p className="interview-muted">CV və vakansiya əsasında suallara yazılı və ya səslə cavab verin, cavabınızı AI ilə qiymətləndirin. Bu, real HR müsahibəsi və işə qəbul zəmanəti deyil.</p>
    {questions.length?<InterviewSession key={JSON.stringify([cv,job])} questions={questions}/>:<div className="info-box">Başlamaq üçün “CV analizi” bölməsində ən azı 30 simvol CV mətni daxil edin. Sonra bu səhifəyə qayıdın.</div>}
  </section>;
}

function InterviewSession({questions}:{questions:Question[]}){
  const [index,setIndex]=useState(0);
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [feedback,setFeedback]=useState<Record<string,Feedback>>({});
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [finished,setFinished]=useState(false);
  const [language,setLanguage]=useState<'az-AZ'|'en-US'>('az-AZ');
  const question=questions[index];
  const answered=questions.filter(q=>answers[q.id]?.trim()).length;
  const reviewed=questions.filter(q=>feedback[q.id]?.source==='ai').length;
  useEffect(()=>()=>{if('speechSynthesis' in window)window.speechSynthesis.cancel();},[]);

  const changeAnswer=(text:string,append=false)=>{
    setAnswers(old=>({...old,[question.id]:append?[old[question.id]?.trimEnd(),text].filter(Boolean).join(' '):text}));
    setFeedback(old=>{const next={...old};delete next[question.id];return next;});
  };
  const evaluate=async()=>{
    const answer=answers[question.id]?.trim()||'';
    if(answer.length<20){setError('Əvvəlcə ən azı 20 simvoldan ibarət cavab yazın və ya səslə daxil edin.');return;}
    setBusy(true);setError('');
    try{
      const ai=getAI(app,{backend:new GoogleAIBackend()});
      const model=getGenerativeModel(ai,{model:'gemini-3.5-flash-lite',systemInstruction:'Sən CVMatch AI müsahibə məşqçisisən. Azərbaycan dilində konkret və konstruktiv rəy ver. 3 başlıqdan istifadə et: Güclü tərəf, Təkmilləşdirmə, Nümunə yanaşma. Namizədin adına təcrübə və nailiyyət uydurma. İşə qəbul zəmanəti vermə. 110 sözdən qısa yaz.'});
      const prompt=`HR sualı: ${question.question.slice(0,700)}\nKateqoriya: ${question.category}\nNamizədin cavabı: ${answer.slice(0,2200)}\nCavabın güclü və zəif tərəflərini qiymətləndir.`;
      const response=await model.generateContent(prompt);
      const result=response.response.text().trim();
      if(!result)throw new Error('Empty AI response');
      setFeedback(old=>({...old,[question.id]:{text:result,source:'ai'}}));
    }catch(e){setError(readableError(e));}finally{setBusy(false);}
  };
  const speak=()=>{
    if(!('speechSynthesis' in window)){setError('Bu brauzerdə səsləndirmə dəstəklənmir.');return;}
    window.speechSynthesis.cancel();const voice=new SpeechSynthesisUtterance(question.question);voice.lang=language;voice.rate=.94;window.speechSynthesis.speak(voice);
  };
  const download=()=>{
    const text=questions.map((q,i)=>`${i+1}. ${q.question}\nCavab: ${answers[q.id]?.trim()||'Cavab yazılmayıb.'}\nRəy: ${feedback[q.id]?.text||'Qiymətləndirilməyib.'}`).join('\n\n');
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='CVMatch_AI_HR_Musahibe.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
  };
  const currentFeedback=feedback[question.id];
  return <>
    <div className="interview-progress"><span>{answered}/{questions.length} cavab · {reviewed} AI rəyi</span><span>Cavablar yalnız bu açıq sessiyada saxlanılır</span></div>
    <div className="interview-meter" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={answered} aria-label="Cavablanan suallar"><span style={{width:`${answered/questions.length*100}%`}}/></div>
    {finished?<div role="status" className="interview-question interview-finished"><Bot size={30}/><h3>Müsahibə məşqi tamamlandı!</h3><p>{answered} suala cavab verdiniz, {reviewed} cavab AI ilə qiymətləndirildi. Cavablarınızı endirə və yenidən baxa bilərsiniz.</p><button className="btn secondary" onClick={()=>{setIndex(0);setFinished(false);}}>Cavablara qayıt <RotateCcw size={15}/></button></div>:<div className="interview-question">
      <div aria-live="polite"><span className="small-kicker">HR · {question.category} · {index+1}/{questions.length}</span><h3>{question.question}</h3><p className="interview-muted">{question.reason}</p></div>
      <div className="interview-tools"><button className="btn ghost" type="button" onClick={speak}><Volume2 size={16}/> Sualı dinlə</button><label>Dil <select aria-label="Səsləndirmə dili" value={language} onChange={e=>setLanguage(e.target.value as 'az-AZ'|'en-US')}><option value="az-AZ">AZ</option><option value="en-US">EN</option></select></label></div>
      <label htmlFor="interview-answer">Sizin cavabınız</label><textarea id="interview-answer" className="input-area" rows={5} maxLength={5000} value={answers[question.id]||''} onChange={e=>changeAnswer(e.target.value)} placeholder="Konkret təcrübəniz və layihələrinizlə cavab verin…"/>
      <VoiceInput key={question.id} label="Müsahibə cavabı" onTranscript={text=>changeAnswer(text,true)}/>
      <div className="interview-review-controls"><button className="btn primary" type="button" onClick={()=>void evaluate()} disabled={busy||!(answers[question.id]||'').trim()}>{busy?<LoaderCircle className="spin" size={16}/>:<Bot size={16}/>} {busy?'AI qiymətləndirir…':'AI ilə cavabımı qiymətləndir'}</button><button className="btn secondary" type="button" onClick={()=>setFeedback(old=>({...old,[question.id]:{text:question.hint,source:'hint'}}))}>Cavab ipucu</button></div>
      {error&&<div role="alert" className="info-box interview-error">{error}</div>}
      {currentFeedback&&<div className="interview-feedback" role="status"><div className="interview-feedback-label"><ShieldCheck size={17}/>{currentFeedback.source==='ai'?'AI məşqçi rəyi':'Cavabı qurmaq üçün ipucu'}</div><p>{currentFeedback.text}</p><small>{currentFeedback.source==='ai'?'AI yanılmış ola bilər; tövsiyələri yoxlayın.':'Bu, AI qiymətləndirməsi deyil.'}</small></div>}
      <div className="interview-actions"><button className="btn ghost" disabled={index===0||busy} onClick={()=>{setIndex(i=>i-1);setError('');}}>Əvvəlki sual</button><button className="btn primary" disabled={busy} onClick={()=>{setError('');if(index===questions.length-1)setFinished(true);else setIndex(i=>i+1);}}>{index===questions.length-1?'Məşqi tamamla':'Növbəti sual'}</button></div>
    </div>}
    <div className="interview-actions"><details className="interview-all"><summary>Bütün sualları göstər ({questions.length})</summary><ol>{questions.map(q=><li key={q.id}>{q.question}</li>)}</ol></details><button className="btn secondary" onClick={download}>Cavabları və rəyləri endir</button></div>
  </>;
}
