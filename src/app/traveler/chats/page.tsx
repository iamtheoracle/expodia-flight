'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Mode = 'all' | 'groups' | 'support';
type Group = { id: string; name: string };
type SupportConversation = { id: string; subject: string | null; status: string; created_at: string };
type Message = { id: string; body: string; sender_user_id: string; created_at?: string };

export default function TravelerChatsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [support, setSupport] = useState<SupportConversation[]>([]);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [activeSupport, setActiveSupport] = useState<SupportConversation | null>(null);
  const [groupMessages, setGroupMessages] = useState<Message[]>([]);
  const [supportMessages, setSupportMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<Mode>('all');
  const [groupName, setGroupName] = useState('');
  const [memberUsername, setMemberUsername] = useState('');
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const [{ data: groupRows }, { data: supportRows }] = await Promise.all([
      supabase.from('traveler_groups').select('id,name').order('created_at', { ascending: false }),
      supabase.from('support_conversations').select('id,subject,status,created_at').order('updated_at', { ascending: false }).limit(50),
    ]);
    setGroups(groupRows ?? []);
    setSupport(supportRows ?? []);
    if (!activeGroup && groupRows?.[0]) setActiveGroup(groupRows[0].id);
    if (!activeSupport && supportRows?.[0]) setActiveSupport(supportRows[0]);
  }

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    if (!activeGroup) return;
    supabase.from('traveler_group_messages').select('id,body,sender_user_id,created_at').eq('group_id', activeGroup).order('created_at', { ascending: true })
      .then(({ data }) => setGroupMessages(data ?? []));
  }, [activeGroup, supabase]);

  useEffect(() => {
    if (!activeSupport) return;
    supabase.from('support_messages').select('id,body,sender_user_id,created_at').eq('conversation_id', activeSupport.id).order('created_at', { ascending: true })
      .then(({ data }) => setSupportMessages(data ?? []));
  }, [activeSupport, supabase]);

  async function createGroup() {
    if (!userId || !groupName.trim()) return;
    const { data, error: createError } = await supabase.from('traveler_groups').insert({ created_by: userId, name: groupName.trim() }).select('id,name').single();
    if (createError || !data) { setError('The group could not be created.'); return; }
    await supabase.from('traveler_group_members').insert({ group_id: data.id, user_id: userId, member_role: 'OWNER' });
    setGroups(current => [data, ...current]);
    setActiveGroup(data.id);
    setMode('groups');
    setGroupName('');
  }

  async function addMember() {
    if (!userId || !activeGroup || !memberUsername.trim()) return;
    const { data, error: lookupError } = await supabase.rpc('find_traveler_by_username', { p_username: memberUsername.trim() });
    const profile = data?.[0];
    if (lookupError || !profile) { setError('That traveler username could not be found.'); return; }
    const { error: memberError } = await supabase.from('traveler_group_members').insert({ group_id: activeGroup, user_id: profile.user_id, member_role: 'MEMBER' });
    setError(memberError ? 'The traveler could not be added.' : '');
    setMemberUsername('');
  }

  async function sendGroupMessage() {
    if (!userId || !activeGroup || !draft.trim()) return;
    const { data, error: sendError } = await supabase.from('traveler_group_messages').insert({ group_id: activeGroup, sender_user_id: userId, body: draft.trim() }).select('id,body,sender_user_id,created_at').single();
    if (sendError || !data) { setError('Your group message could not be sent.'); return; }
    setGroupMessages(current => [...current, data]);
    setDraft('');
  }

  async function sendSupportMessage() {
    if (!userId || !activeSupport || !draft.trim()) return;
    const { data, error: sendError } = await supabase.from('support_messages').insert({ conversation_id: activeSupport.id, sender_user_id: userId, body: draft.trim() }).select('id,body,sender_user_id,created_at').single();
    if (sendError || !data) { setError('Your message could not be sent.'); return; }
    setSupportMessages(current => [...current, data]);
    setDraft('');
  }

  const showGroups = mode === 'all' || mode === 'groups';
  const showSupport = mode === 'all' || mode === 'support';

  return (
    <main className="travelerApp">
      <header className="travelerAppHeader">
        <Link href="/traveler" className="travelerAppBrand">Expodia</Link>
        <span className="travelerHeaderTitle">Chats</span>
      </header>
      <section className="travelerWorkspace travelerChatsPage">
        <div className="publicEyebrow">CHATS</div>
        <h1>Conversations in one place.</h1>
        <p className="travelerChatsIntro">Friends, travel groups and Expodia support all live under Chats. Start a group from here or continue an existing conversation.</p>
        <div className="travelerChatFilters" role="tablist" aria-label="Chat types">
          {(['all', 'groups', 'support'] as Mode[]).map(item => <button key={item} className={mode === item ? 'active' : ''} onClick={() => setMode(item)}>{item === 'all' ? 'All' : item === 'groups' ? 'Groups' : 'Expodia support'}</button>)}
        </div>
        <div className="travelerChatLayout">
          <aside className="travelerChatList">
            {showGroups && (
              <section>
                <div className="travelerChatListHeading">Groups</div>
                <div className="travelerChatCreate"><input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Create a group" /><button onClick={createGroup} disabled={!groupName.trim()}>Create</button></div>
                {groups.map(group => <button key={group.id} className={activeGroup === group.id ? 'active' : ''} onClick={() => { setActiveGroup(group.id); setMode('groups'); }}>{group.name}</button>)}
                {!groups.length && <div className="planningEmpty">No groups yet.</div>}
              </section>
            )}
            {showSupport && (
              <section>
                <div className="travelerChatListHeading">Expodia support</div>
                {support.map(conversation => <button key={conversation.id} className={activeSupport?.id === conversation.id ? 'active' : ''} onClick={() => { setActiveSupport(conversation); setMode('support'); }}>{conversation.subject || 'Traveler support'}<small>{conversation.status}</small></button>)}
                {!support.length && <div className="planningEmpty">No support conversations yet.</div>}
              </section>
            )}
          </aside>
          <section className="travelerChatPanel">
            {mode === 'support' && activeSupport ? (
              <>
                <header><div><div className="publicEyebrow">SUPPORT</div><h2>{activeSupport.subject || 'Traveler support'}</h2></div><span>{activeSupport.status}</span></header>
                <div className="travelerConversationMessages">{supportMessages.map(message => <div key={message.id} className={message.sender_user_id === userId ? 'travelerConversationMessage own' : 'travelerConversationMessage'}>{message.body}</div>)}</div>
                <div className="groupComposer"><input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && void sendSupportMessage()} placeholder="Message support…" /><button className="publicPrimary" onClick={() => void sendSupportMessage()}>Send</button></div>
              </>
            ) : mode !== 'support' && activeGroup ? (
              <>
                <header><div><div className="publicEyebrow">GROUP</div><h2>{groups.find(group => group.id === activeGroup)?.name}</h2></div><div className="travelerChatInvite"><input value={memberUsername} onChange={e => setMemberUsername(e.target.value)} placeholder="Traveler username" /><button onClick={addMember}>Add</button></div></header>
                <div className="travelerConversationMessages">{groupMessages.map(message => <div key={message.id} className={message.sender_user_id === userId ? 'travelerConversationMessage own' : 'travelerConversationMessage'}>{message.body}</div>)}</div>
                <div className="groupComposer"><input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && void sendGroupMessage()} placeholder="Message the group…" /><button className="publicPrimary" onClick={() => void sendGroupMessage()}>Send</button></div>
              </>
            ) : (
              <div className="planningEmpty">Choose a conversation. Chats are for conversations; travel research, bookings and marketplace actions remain in their own areas.</div>
            )}
          </section>
        </div>
        {error && <div className="notice" role="alert">{error}</div>}
      </section>
    </main>
  );
}
