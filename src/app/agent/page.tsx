'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Booking={id:string;status:string;provider_name:string|null;pnr:string|null;currency:string|null;total_amount:number|null;created_at:string;updated_at:string};
type Run={id:string;agent_name:string;action:string;status:string;requires_human_approval:boolean;result_reference:string|null;created_at:string};
type Conversation={id:string;subject:string|null;status:string;priority:string;category:string;assigned_agent_id:string|null;created_at:string};
type Payment={id:string;booking_id:string|null;amount:number;currency:string;status:string;created_at:string};

export default function AgentWorkspace(){
 const supabase=useMemo(()=>createSupabaseBrowserClient(),[]);
 const [userId,setUserId]=useState<string|null>(null),[name,setName]=useState('Professional'),[presence,setPresence]=useState('OFFLINE');
 const [bookings,setBookings]=useState<Booking[]>([]),[runs,setRuns]=useState<Run[]>([]),[conversations,setConversations]=useState<Conversation[]>([]),[payments,setPayments]=useState<Payment[]>([]);
 const [loading,setLoading]=useState(true),[notice,setNotice]=useState('');
 async function load(){
  const {data:{user}}=await supabase.auth.getUser(); if(!user){window.location.assign('/access');return;}
  setUserId(user.id);
  const [{data:agent},{data:p},{data:b},{data:r},{data:c},{data:pay}]=await Promise.all([
   supabase.from('agents').select('display_name').eq('id',user.id).maybeSingle(),
   supabase.from('agent_presence').select('status').eq('user_id',user.id).maybeSingle(),
   supabase.from('bookings').select('id,status,provider_name,pnr,currency,total_amount,created_at,updated_at').eq('agent_id',user.id).order('updated_at',{ascending:false}).limit(20),
   supabase.from('agent_runs').select('id,agent_name,action,status,requires_human_approval,result_reference,created_at').eq('agent_id',user.id).order('created_at',{ascending:false}).limit(30),
   supabase.from('support_conversations').select('id,subject,status,priority,category,assigned_agent_id,created_at').or('assigned_agent_id.eq.'+user.id+',status.eq.PENDING').order('created_at',{ascending:false}).limit(30),
   supabase.from('payment_transactions').select('id,booking_id,amount,currency,status,created_at').eq('agent_id',user.id).order('created_at',{ascending:false}).limit(20)
  ]);
  setName(agent?.display_name||'Professional');setPresence(p?.status||'OFFLINE');setBookings((b||[]) as Booking[]);setRuns((r||[]) as Run[]);setConversations((c||[]) as Conversation[]);setPayments((pay||[]) as Payment[]);setLoading(false);
 }
 async function togglePresence(){
  if(!userId)return;
  const next=presence==='ONLINE'?'OFFLINE':'ONLINE';
  const {error}=await supabase.from('agent_presence').upsert({user_id:userId,display_name:name,status:next,specialty:'GENERAL',last_seen_at:new Date().toISOString(),updated_at:new Date().toISOString()});
  setNotice(error?'Presence could not be updated.':'Presence updated.'); if(!error)setPresence(next);
 }
 useEffect(()=>{void load();},[]);
 useEffect(()=>{if(presence!=='ONLINE'||!userId)return;const id=setInterval(()=>{void supabase.from('agent_presence').update({last_seen_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('user_id',userId)},60000);return()=>clearInterval(id)},[presence,userId,supabase]);
 const needsReview=runs.filter(x=>x.requires_human_approval||x.status==='REQUIRES_REVIEW').length;
 const pendingBookings=bookings.filter(x=>['PAYMENT_PENDING','BOOKING_PENDING','TICKETING_PENDING','REQUIRES_REVIEW','AWAITING_CONFIRMATION','VERIFICATION_PENDING'].includes(x.status)).length;
 const pendingPayments=payments.filter(x=>['PENDING','AUTHORIZED'].includes(x.status)).length;
 const openSupport=conversations.filter(x=>x.status==='PENDING'||x.status==='OPEN').length;
 return <main className="agentWorkspacePage">
  <header className="agentWorkspaceHeader"><div><div className="publicEyebrow">EXPODIA PROFESSIONAL WORKSPACE</div><h1>{name}</h1><p>One operational workspace for customers, bookings, payments, documents, support and the Expodia AI workforce.</p></div><div className="agentHeaderActions"><span className={presence==='ONLINE'?'presencePill online':'presencePill'}>{presence}</span><button className="publicSecondary" onClick={()=>void togglePresence()}>{presence==='ONLINE'?'Go offline':'Go online'}</button><Link className="publicSecondary" href="/support">Support desk</Link><Link className="publicSecondary" href="/access">Account</Link></div></header>
  {notice&&<div className="notice" role="status">{notice}</div>}
  <section className="agentMetricGrid">
   <article><span>Bookings needing attention</span><strong>{pendingBookings}</strong><small>Payment, confirmation, ticketing or review states</small></article>
   <article><span>Support queue</span><strong>{openSupport}</strong><small>Pending or open traveler conversations</small></article>
   <article><span>Payment work</span><strong>{pendingPayments}</strong><small>Transactions not yet settled</small></article>
   <article><span>AI work requiring you</span><strong>{needsReview}</strong><small>Approval or reconciliation boundary</small></article>
  </section>
  <section className="agentQuickActions"><Link href="/bookings/new">Find / arrange flight</Link><Link href="/bookings">Bookings</Link><Link href="/documents">Documents</Link><Link href="/tracking">Track journeys</Link><Link href="/aviation">Aviation intelligence</Link><Link href="/map">Geographic intelligence</Link></section>
  <section className="agentWorkspaceGrid">
   <div className="agentMainColumn">
    <section className="agentPanel"><div className="agentPanelHeader"><div><div className="publicEyebrow">BOOKING CONTROL</div><h2>Recent customer work</h2></div><Link href="/bookings">Open all</Link></div>{loading?<p>Loading operational records…</p>:bookings.length===0?<div className="planningEmpty">No booking records exist for this professional account yet. New work appears here only after it is persisted.</div>:<div className="agentRows">{bookings.map(b=><article key={b.id}><div><strong>{b.provider_name||'Provider pending'}</strong><span>{b.pnr||'No provider reference yet'}</span></div><div><strong>{b.status}</strong><span>{b.total_amount!=null?b.currency||''+' '+b.total_amount:'Amount pending'}</span></div><Link href="/bookings">Open</Link></article>)}</div>}</section>
    <section className="agentPanel"><div className="agentPanelHeader"><div><div className="publicEyebrow">HUMAN SUPPORT</div><h2>Traveler queue</h2></div><Link href="/support">Open desk</Link></div>{conversations.length===0?<div className="planningEmpty">No routed traveler conversations are currently visible.</div>:<div className="agentRows">{conversations.slice(0,10).map(c=><article key={c.id}><div><strong>{c.subject||'Traveler support'}</strong><span>{c.category} · {c.priority}</span></div><div><strong>{c.status}</strong><span>{c.assigned_agent_id===userId?'Assigned to you':'Awaiting assignment'}</span></div><Link href="/support">Open</Link></article>)}</div>}</section>
   </div>
   <aside className="agentSideColumn">
    <section className="agentPanel"><div className="agentPanelHeader"><div><div className="publicEyebrow">AI WORKFORCE</div><h2>Work requiring review</h2></div></div>{runs.filter(x=>x.requires_human_approval||x.status==='REQUIRES_REVIEW').slice(0,8).map(r=><article className="agentWorkItem" key={r.id}><strong>{r.agent_name}</strong><span>{r.action}</span><small>{r.status} · {new Date(r.created_at).toLocaleString()}</small>{r.result_reference&&<small>Ref: {r.result_reference}</small>}</article>)}{runs.filter(x=>x.requires_human_approval||x.status==='REQUIRES_REVIEW').length===0&&<div className="planningEmpty">Nothing currently requires human approval.</div>}</section>
    <section className="agentPanel"><div className="agentPanelHeader"><div><div className="publicEyebrow">PAYMENTS</div><h2>Recent payment state</h2></div></div>{payments.slice(0,8).map(p=><article className="agentWorkItem" key={p.id}><strong>{p.currency} {p.amount}</strong><span>{p.status}</span><small>{p.booking_id?'Linked to booking':'Awaiting booking link'} · {new Date(p.created_at).toLocaleString()}</small></article>)}{payments.length===0&&<div className="planningEmpty">No payment transactions recorded yet.</div>}</section>
    <section className="agentPanel"><div className="publicEyebrow">OPERATING RULE</div><p>AI workers prepare, verify, reconcile and route work. You remain the human authority at booking, payment confirmation, check-in, itinerary changes and cancellation/refund boundaries unless an approved provider contract explicitly authorizes automation.</p></section>
   </aside>
  </section>
 </main>;
}
