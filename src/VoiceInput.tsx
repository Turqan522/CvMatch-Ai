import {useEffect,useRef,useState} from 'react';
import {Mic,MicOff} from 'lucide-react';

type SpeechResult={isFinal:boolean;[index:number]:{transcript:string}};
type SpeechEvent={resultIndex:number;results:ArrayLike<SpeechResult>};
type SpeechError={error:string};
type Recognizer={lang:string;continuous:boolean;interimResults:boolean;onresult:((event:SpeechEvent)=>void)|null;onerror:((event:SpeechError)=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void;abort:()=>void};
type RecognitionClass=new()=>Recognizer;
type SpeechWindow=Window&{SpeechRecognition?:RecognitionClass;webkitSpeechRecognition?:RecognitionClass};

export default function VoiceInput({label,onTranscript}:{label:string;onTranscript:(text:string)=>void}){
  const recognition=useRef<Recognizer|null>(null);
  const [recording,setRecording]=useState(false),[error,setError]=useState(''),[lang,setLang]=useState('az-AZ');
  const supported=typeof window!=='undefined'&&Boolean((window as SpeechWindow).SpeechRecognition||(window as SpeechWindow).webkitSpeechRecognition);
  useEffect(()=>()=>{if(recognition.current){recognition.current.onend=null;recognition.current.onresult=null;recognition.current.onerror=null;recognition.current.abort();recognition.current=null;}},[]);
  const toggle=()=>{
    if(recording){recognition.current?.stop();setRecording(false);return;}
    const Recognition=(window as SpeechWindow).SpeechRecognition||(window as SpeechWindow).webkitSpeechRecognition;
    if(!Recognition){setError('Bu brauzer səs tanımanı dəstəkləmir. Chrome və ya Edge ilə yoxlayın.');return;}
    setError('');
    const instance=new Recognition();recognition.current=instance;instance.lang=lang;instance.continuous=true;instance.interimResults=false;
    instance.onresult=event=>{const phrases:string[]=[];for(let i=event.resultIndex;i<event.results.length;i++){if(event.results[i].isFinal)phrases.push(event.results[i][0].transcript.trim());}if(phrases.length)onTranscript(phrases.join(' '));};
    instance.onerror=event=>{const messages:Record<string,string>={'not-allowed':'Mikrofon icazəsi verilmədi. Brauzer ayarlarından icazə verin.','audio-capture':'Mikrofon tapılmadı.','network':'Səs xidmətinə bağlantı alınmadı.','language-not-supported':'Seçilmiş dil dəstəklənmir.'};if(event.error!=='no-speech'&&event.error!=='aborted')setError(messages[event.error]||'Nitq tanıma dayandı. Yenidən cəhd edin.');setRecording(false);};
    instance.onend=()=>{setRecording(false);recognition.current=null;};
    try{instance.start();setRecording(true);}catch{setRecording(false);setError('Mikrofon başladılmadı. Yenidən cəhd edin.');}
  };
  return <div className="voice-widget"><div className="voice-controls"><button type="button" className={`voice-button ${recording?'listening':''}`} onClick={toggle} disabled={!supported} aria-label={`${label}: ${recording?'Səs daxil etməni dayandır':'Səslə mətn daxil et'}`} aria-pressed={recording}>{recording?<MicOff size={16}/>:<Mic size={16}/>} {recording?'Dinlənilir · Dayandır':'Səslə daxil et'}</button><select aria-label={`${label}: nitq dili`} value={lang} disabled={recording||!supported} onChange={e=>setLang(e.target.value)}><option value="az-AZ">AZ</option><option value="en-US">EN</option><option value="tr-TR">TR</option></select></div>{!supported&&<span className="voice-message">Brauzeriniz səs tanımanı dəstəkləmir.</span>}{recording&&<span role="status" className="voice-message">Danışın — tanınan sözlər mətnin sonuna əlavə olunacaq.</span>}{error&&<span role="alert" className="voice-message error">{error}</span>}<p className="voice-privacy">Qeyd: Nitq tanıma brauzerdən asılıdır; audio brauzerin səs xidmətinə göndərilə bilər. Məxfi məlumatları səsləndirməyin.</p></div>;
}
