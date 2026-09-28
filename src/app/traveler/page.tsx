'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { addLocalPlanningItem, readLocalPlanningItems, removeLocalPlanningItem, type PlanningItem, type PlanningItemType } from '@/lib/traveler/planning-store';

const TRAVELER_INACTIVITY_MS = 10 * 60 * 1000;
const TRAVELER_LAST_ACTIVITY_KEY = 'expodia_last_activity_at';
const TRAVELER_LOCK_KEY = 'expodia_app_locked';

const intents:Array<[PlanningItemType,string,string]>=[
  ['FLIGHT','Flight','Find or arrange a flight'],['STAY','Stay','Hotel or accommodation'],['EVENT','Event','Concert, sport, theatre or festival'],
  ['ACTIVITY','Activity','Tours, attractions or experiences'],['TRANSPORT','Transport','Car, rail, bus or transfer'],['INSURANCE','Protection','Travel insurance or protection'],['REQUIREMENT','Requirements','Visa, transit or entry information']
];
type Tab='home'|'groups'|'inbox';

export default function TravelerPlanningPage(){
  const supabase=useMemo(()=>createSupabaseBrowserClient(),[]);
  const [session,setSession]=useState<{userId:string|null}>({userId:null});
  const [profile,setProfile]=useState<{username:string}|null>(null);
  const [items,setItems]=useState<PlanningItem[]>([]);
  const [groups,setGroups]=useState<Array<{id:string;name:string}>>([]);
  const [activeGroup,setActiveGroup]=useState<string|null>(null);
  const [messages,setMessages]=useState<Array<{id:string;body:string;sender_user_id:string}>>([]);
  const [inbox,setInbox]=useState<Array<{id:string;subject:string|null;status:string;created_at:string}>>([]);
  const [groupName,setGroupName]=useState(''); const [memberUsername,setMemberUsername]=useState(''); const [message,setMessage]=useState(''); const [planText,setPlanText]=useState('');
  const [tab,setTab]=useState<Tab>('home'); const [drawer,setDrawer]=useState(false);
  const [notice,setNotice]=useState(''); const [researchQuery,setResearchQuery]=useState(''); const [researchAnswer,setResearchAnswer]=useState(''); const [researchSources,setResearchSources]=useState<string[]>([]); const [researchLoading,setResearchLoading]=useState(false);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('view') === 'groups'
    ) {
      setTab('groups');
    }
  }, []);

  useEffect(()=>{
    if(typeof window==='undefined')return;
    const markActivity=()=>{
      if(localStorage.getItem(TRAVELER_LOCK_KEY)!=='1')localStorage.setItem(TRAVELER_LAST_ACTIVITY_KEY,String(Date.now()));
    };
    if(localStorage.getItem(TRAVELER_LOCK_KEY)!=='1'&&!localStorage.getItem(TRAVELER_LAST_ACTIVITY_KEY))markActivity();
    const activityEvents=['pointerdown','keydown','touchstart','scroll','input'];
    activityEvents.forEach(event=>window.addEventListener(event,markActivity,{passive:true}));
    const timer=window.setInterval(()=>{
      if(localStorage.getItem(TRAVELER_LOCK_KEY)==='1')return;
      const last=Number(localStorage.getItem(TRAVELER_LAST_ACTIVITY_KEY)||0);
      if(last>0&&Date.now()-last>=TRAVELER_INACTIVITY_MS){
        localStorage.setItem(TRAVELER_LOCK_KEY,'1');
        localStorage.removeItem(TRAVELER_LAST_ACTIVITY_KEY);
        setPinMode('unlock');
      }
    },1000);
    return()=>{activityEvents.forEach(event=>window.removeEventListener(event,markActivity));window.clearInterval(timer);};
  },[]);

  useEffect(()=>{
    let mounted=true;
    supabase.auth.getUser().then(async({data})=>{
      if(!mounted)return;
      if(!data.user){setItems(readLocalPlanningItems());return;}
      setSession({userId:data.user.id});
      const [{data:profileRow},{data:savedRows},{data:groupRows},{data:inboxRows},{data:security}]=await Promise.all([
        supabase.from('traveler_profiles').select('username').eq('user_id',data.user.id).maybeSingle(),
        supabase.from('traveler_saved_items').select('id,item_type,title,description,source_url,action_label,created_at').eq('user_id',data.user.id).order('created_at',{ascending:false}),
        supabase.from('traveler_groups').select('id,name').order('created_at',{ascending:false}),
        supabase.from('support_conversations').select('id,subject,status,created_at').order('updated_at',{ascending:false}).limit(20)
      ]);
      if(!mounted)return;
      setProfile(profileRow??null);
      if(savedRows)setItems(savedRows.map(item=>({id:item.id,type:item.item_type as PlanningItemType,title:item.title,description:item.description??undefined,sourceUrl:item.source_url??undefined,actionLabel:item.action_label??undefined,createdAt:item.created_at})));
      if(groupRows)setGroups(groupRows);
      if(inboxRows)setInbox(inboxRows);

    });
    return()=>{mounted=false;};
  },[supabase]);

  useEffect(()=>{if(!activeGroup)return;supabase.from('traveler_group_messages').select('id,body,sender_user_id').eq('group_id',activeGroup).order('created_at',{ascending:true}).then(({data})=>setMessages(data??[]));},[activeGroup,supabase]);

  async function addPlan(type:PlanningItemType,title:string,description:string){
    const next=addLocalPlanningItem({type,title,description});
    if(session.userId){const {data}=await supabase.from('traveler_saved_items').insert({user_id:session.userId,item_type:type,title,description}).select('id,created_at').single();if(data){next.id=data.id;next.createdAt=data.created_at;}}
    setItems(current=>[next,...current]);
  }
  function addFreePlan(){const value=planText.trim();if(!value)return;void addPlan('OTHER',value,session.userId?'Saved to your traveler space.':'Planning item saved on this device.');setPlanText('');}
  async function createGroup(){if(!session.userId||!groupName.trim())return;const {data,error}=await supabase.from('traveler_groups').insert({created_by:session.userId,name:groupName.trim()}).select('id,name').single();if(!error&&data){await supabase.from('traveler_group_members').insert({group_id:data.id,user_id:session.userId,member_role:'OWNER'});setGroups(current=>[data,...current]);setActiveGroup(data.id);setGroupName('');}}
  async function addMember(){if(!session.userId||!activeGroup||!memberUsername.trim())return;const {data,error}=await supabase.rpc('find_traveler_by_username',{p_username:memberUsername.trim()});const profileRow=data?.[0];if(error||!profileRow){setNotice('That traveler username could not be found.');return;}const {error:memberError}=await supabase.from('traveler_group_members').insert({group_id:activeGroup,user_id:profileRow.user_id,member_role:'MEMBER'});setNotice(memberError?'The traveler could not be added.':'Traveler added to the group.');setMemberUsername('');}
  async function sendMessage(){if(!session.userId||!activeGroup||!message.trim())return;const {data}=await supabase.from('traveler_group_messages').insert({group_id:activeGroup,sender_user_id:session.userId,body:message.trim()}).select('id,body,sender_user_id').single();if(data)setMessages(current=>[...current,data]);setMessage('');}
  async function researchGroup(){const value=researchQuery.trim();if(!value)return;setResearchLoading(true);setResearchAnswer('');setResearchSources([]);try{const response=await fetch('/api/travel-intelligence',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:value,mode:'group',context:groups.find(g=>g.id===activeGroup)?.name||'shared travel group'})});const data=await response.json();setResearchAnswer(response.ok?(data.answer||'No verified answer was returned.'):(data.error||'Travel research is temporarily unavailable.'));setResearchSources(Array.isArray(data.sources)?data.sources:[]);}catch{setResearchAnswer('Travel research is temporarily unavailable.');}finally{setResearchLoading(false);}}
  async function savePin(){if(!/^\d{4}$/.test(pin)||pin!==pinConfirm){setNotice('Create and confirm a four-digit PIN.');return;}const {data,error}=await supabase.rpc('set_traveler_security',{p_pin:pin});if(error||data!==true){setNotice('Your PIN could not be saved.');return;}localStorage.removeItem(TRAVELER_LOCK_KEY);localStorage.setItem(TRAVELER_LAST_ACTIVITY_KEY,String(Date.now()));setPinMode(null);setPin('');setPinConfirm('');setNotice('Your personal PIN is active.');}
  async function unlock(){if(!/^\d{4}$/.test(pin)){setNotice('Enter your four-digit PIN.');return;}const {data}=await supabase.rpc('verify_traveler_security',{p_pin:pin});if(data!==true){setNotice('PIN verification failed.');setPin('');return;}localStorage.removeItem(TRAVELER_LOCK_KEY);localStorage.setItem(TRAVELER_LAST_ACTIVITY_KEY,String(Date.now()));setPinMode(null);setPin('');setNotice('');}
  async function signOut(){localStorage.removeItem(TRAVELER_LOCK_KEY);localStorage.removeItem(TRAVELER_LAST_ACTIVITY_KEY);await supabase.auth.signOut();setSession({userId:null});setProfile(null);setGroups([]);setActiveGroup(null);setInbox([]);}

  return <main className="travelerApp">
    <header className="travelerAppHeader">
  <button className="travelerMenuButton" onClick={()=>setDrawer(true)} aria-label="Open Expodia tools">•••</button>
  <Link href="/traveler" className="travelerAppBrand">Expodia</Link>
  <nav className="travelerPrimaryNav" aria-label="Traveler navigation">
    <Link href="/traveler">Home</Link><Link href="/explore">Explore</Link><Link href="/traveler/chats">Chats</Link><Link href="/traveler/profile">Profile</Link>
  </nav>
</header>
    {drawer&&<div className="travelerDrawerBackdrop" onClick={()=>setDrawer(false)}><aside className="travelerDrawer" onClick={e=>e.stopPropagation()}><div className="travelerDrawerProfile"><div className="travelerAvatar">{profile?.username?.slice(0,1).toUpperCase()||'E'}</div><div><strong>@{profile?.username||'traveler'}</strong><span>Private traveler space</span></div></div><nav className="travelerDrawerNav"><Link href="/explore" onClick={()=>setDrawer(false)}>Start a flight search</Link><Link href="/marketplace" onClick={()=>setDrawer(false)}>Explore marketplace</Link><Link href="/track" onClick={()=>setDrawer(false)}>Check flight tracking</Link><Link href="/assistant" onClick={()=>setDrawer(false)}>Ask Virtual Agent</Link><Link href="/traveler/profile" onClick={()=>setDrawer(false)}>Profile & security</Link></nav><div className="travelerDrawerFooter"><button onClick={()=>{localStorage.setItem(TRAVELER_LOCK_KEY,'1');localStorage.removeItem(TRAVELER_LAST_ACTIVITY_KEY);setPinMode('unlock');setDrawer(false)}}>Lock app</button><button onClick={signOut}>Sign out</button></div></aside></div>}
    <section className="travelerAppIntro">
  <div><div className="publicEyebrow">TRAVELER SPACE</div><h1>{profile?.username?'Welcome back, @'+profile.username+'.':'Plan your journey.'}</h1><p>Research, trips, documents, marketplace services and conversations live in one private travel workspace.</p></div>
</section>
    {notice&&<div className="notice travelerNotice" role="status">{notice}</div>}
    {tab==='home'&&<section className="travelerWorkspace"><div className="travelerFeedLayout"><div className="travelerFeedMain"><div className="travelerFeedCard"><div className="travelerFeedMeta"><span className="travelerStatusDot"></span><span>EXPODIA INTELLIGENCE</span><span>·</span><span>LIVE WORKSPACE</span></div><h2>What do you want to solve for this journey?</h2><p>Ask the Virtual Agent, research a route, track a flight, save a stay, or build a trip with others.</p><div className="travelerFeedActions"><Link href="/assistant">Ask Expodia</Link><Link href="/track">Track a flight</Link><Link href="/traveler/chats">Open chats</Link></div></div><div className="planningComposer"><div><span className="publicEyebrow">PLAN</span><h2>What are you planning?</h2><p>Start with an intent. Expodia keeps the pieces together as your journey grows.</p></div><div className="intentGrid">{intents.map(([type,title,description])=><button key={type} onClick={()=>addPlan(type,title,description)}><strong>{title}</strong><small>{description}</small></button>)}</div><div className="freePlanRow"><input value={planText} onChange={e=>setPlanText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')addFreePlan();}} placeholder="Tell Expodia what you are planning…"/><button className="publicPrimary" onClick={addFreePlan}>Add</button></div></div><div className="planningSection"><div className="sectionHeading"><div><div className="publicEyebrow">YOUR SPACE</div><h2>Saved journey pieces</h2></div><span className="plannerStatus">{session.userId?'Saved to your account':'Saved on this device'}</span></div>{items.length===0?<div className="planningEmpty">Nothing saved yet. Start with a flight, stay, activity, transport or requirement.</div>:<div className="planningList">{items.map(item=><article className="planningItem" key={item.id}><div><span>{item.type}</span><h3>{item.title}</h3><p>{item.description}</p></div><div className="planningItemActions">{item.sourceUrl&&<a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.actionLabel??'Open'}</a>}<button onClick={async()=>{if(session.userId)await supabase.from('traveler_saved_items').delete().eq('id',item.id);removeLocalPlanningItem(item.id);setItems(readLocalPlanningItems());}}>Remove</button></div></article>)}</div>}</div></div><aside className="travelerFeedRail"><div className="travelerRailCard"><span className="publicEyebrow">YOUR SPACE</span><strong>@{profile?.username||'traveler'}</strong><span>Private account · PIN protected</span><Link href="/traveler/profile">Open profile</Link></div><div className="travelerRailCard"><span className="publicEyebrow">WORKSPACE</span><strong>One place for the journey.</strong><span>Search, research, tracking, marketplace, documents and Chats remain connected to this traveler space.</span></div></aside></div></section>}
    {tab==='groups'&&<section className="travelerWorkspace"><div className="groupWorkspace"><div className="groupList"><div className="groupCreate"><input value={groupName} onChange={e=>setGroupName(e.target.value)} placeholder="New travel group" disabled={!session.userId}/><button className="publicPrimary" onClick={createGroup} disabled={!session.userId||!groupName.trim()}>Create</button></div>{groups.map(group=><button key={group.id} className={activeGroup===group.id?'groupRow active':'groupRow'} onClick={()=>setActiveGroup(group.id)}>{group.name}</button>)}{!groups.length&&<div className="planningEmpty">Create a group when you are travelling with other people.</div>}</div><div className="groupChat">{!activeGroup?<div className="planningEmpty">Choose a group to open its shared travel conversation.</div>:<><div className="groupChatHeader"><div><div className="publicEyebrow">GROUP TRAVEL</div><h2>{groups.find(group=>group.id===activeGroup)?.name}</h2></div><div className="groupInvite"><input value={memberUsername} onChange={e=>setMemberUsername(e.target.value)} placeholder="Traveler username"/><button onClick={addMember}>Add</button></div></div><div className="groupResearch"><div><div className="publicEyebrow">TRAVEL RESEARCH</div><strong>Ask Expodia to research the group trip</strong></div><div className="groupResearchForm"><input value={researchQuery} onChange={e=>setResearchQuery(e.target.value)} placeholder="Hotels, airports, activities, entry rules…"/><button className="publicSecondary" onClick={()=>void researchGroup()} disabled={researchLoading}>{researchLoading?'Researching…':'Research'}</button></div>{researchAnswer&&<div className="groupResearchAnswer">{researchAnswer}{researchSources.length>0&&<div className="groupResearchSources">{researchSources.map(source=><a key={source} href={source} target="_blank" rel="noreferrer">{source}</a>)}</div>}</div>}</div><div className="groupMessages">{messages.map(item=><div className={item.sender_user_id===session.userId?'groupMessage own':'groupMessage'} key={item.id}>{item.body}</div>)}</div><div className="groupComposer"><input value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')sendMessage();}} placeholder="Message the group…"/><button className="publicPrimary" onClick={sendMessage}>Send</button></div></>}</div></div></section>}
    {tab==='inbox'&&<section className="travelerWorkspace"><div className="travelerInbox"><div className="publicEyebrow">INBOX</div><h2>Expodia conversations</h2><p>Support and Virtual Agent handoffs stay inside your traveler space.</p>{inbox.length===0?<div className="planningEmpty">Your inbox is empty.</div>:inbox.map(c=><Link href="/traveler/inbox" className="travelerInboxRow" key={c.id}><div><strong>{c.subject||'Traveler support'}</strong><span>{c.status}</span></div><small>{new Date(c.created_at).toLocaleString()}</small></Link>)}</div></section>}
  </main>;
}
