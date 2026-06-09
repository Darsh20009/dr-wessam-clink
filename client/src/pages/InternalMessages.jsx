import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiSend, FiUser, FiCheck, FiMessageSquare, FiSearch } from 'react-icons/fi';
import { format, isToday, isYesterday } from 'date-fns';
import { ar } from 'date-fns/locale';

const ROLE_LABELS = { doctor: '🩺 الطبيب', employee: '👤 موظف', receptionist: 'استقبال', assistant: 'مساعد', accountant: 'محاسب' };

const STYLE = `
  .im-wrap { display: flex; height: calc(100vh - 130px); background: white; border-radius: 18px; border: 1.5px solid #e2e8f0; overflow: hidden; font-family: 'Cairo', sans-serif; }
  .im-sidebar { width: 260px; border-left: 1px solid #e2e8f0; display: flex; flex-direction: column; flex-shrink: 0; }
  .im-sidebar-header { padding: 16px 14px; border-bottom: 1px solid #f1f5f9; }
  .im-sidebar-title { font-size: 15px; font-weight: 800; color: #0f172a; }
  .im-contact { display: flex; align-items: center; gap: 10px; padding: 12px 14px; cursor: pointer; transition: background 0.15s; border-radius: 0; position: relative; }
  .im-contact:hover { background: #f8fafc; }
  .im-contact.active { background: #eff6ff; }
  .im-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #06b6d4); display: flex; align-items: center; justify-content: center; color: white; font-size: 15px; font-weight: 800; flex-shrink: 0; }
  .im-chat { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .im-chat-header { padding: 14px 18px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px; }
  .im-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 8px; background: #f8fafc; }
  .im-msg { max-width: 70%; padding: 10px 14px; border-radius: 16px; font-size: 13.5px; line-height: 1.6; position: relative; }
  .im-msg.mine { background: #2563eb; color: white; border-bottom-left-radius: 4px; align-self: flex-start; }
  .im-msg.theirs { background: white; color: #1e293b; border-bottom-right-radius: 4px; border: 1px solid #e2e8f0; align-self: flex-end; }
  .im-msg-time { font-size: 10px; opacity: 0.6; margin-top: 4px; display: flex; align-items: center; justify-content: flex-end; gap: 4px; }
  .im-msg.theirs .im-msg-time { color: #64748b; justify-content: flex-start; }
  .im-read-tick { display: inline-flex; align-items: center; gap: 1px; }
  .im-input-row { padding: 12px 14px; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; background: white; }
  .im-textarea { flex: 1; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 22px; font-size: 14px; font-family: 'Cairo', sans-serif; resize: none; outline: none; max-height: 120px; overflow-y: auto; line-height: 1.5; transition: border 0.2s; }
  .im-textarea:focus { border-color: #2563eb; }
  .im-send-btn { width: 42px; height: 42px; border-radius: 50%; background: #2563eb; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; align-self: flex-end; transition: background 0.2s; }
  .im-send-btn:hover { background: #1d4ed8; }
  .im-send-btn:disabled { background: #94a3b8; cursor: not-allowed; }
  .im-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; gap: 12px; }
  .im-unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #2563eb; flex-shrink: 0; }
  @media (max-width: 640px) {
    .im-wrap { height: calc(100vh - 80px); }
    .im-sidebar { width: 60px; }
    .im-sidebar .im-contact-name { display: none; }
    .im-sidebar-header .im-sidebar-title { display: none; }
    .im-sidebar-header { padding: 12px 8px; }
    .im-contact { padding: 10px 8px; justify-content: center; }
  }
`;

function formatMsgTime(date) {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'أمس ' + format(d, 'h:mm a');
  return format(d, 'd MMM', { locale: ar });
}

export default function InternalMessages() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get('/messages/conversations');
      setContacts(data.conversations || []);
      setAllStaff(data.staff || []);
    } catch {}
    setLoading(false);
  };

  const fetchMessages = useCallback(async (contactId) => {
    if (!contactId) return;
    try {
      const { data } = await axios.get(`/messages?with=${contactId}`);
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    } catch {}
  }, [scrollToBottom]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!activeContact) return;
    fetchMessages(activeContact._id);
    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchMessages(activeContact._id), 4000);
    return () => clearInterval(pollRef.current);
  }, [activeContact, fetchMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeContact) return;
    setSending(true);
    try {
      const { data } = await axios.post('/messages', { receiverId: activeContact._id, text: text.trim() });
      setMessages(prev => [...prev, data]);
      setText('');
      setTimeout(scrollToBottom, 100);
      fetchConversations();
    } catch { toast.error('خطأ في الإرسال'); }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
  };

  const selectContact = (contact) => {
    setActiveContact(contact);
    setMessages([]);
  };

  const allContacts = [
    ...contacts.map(c => ({ ...c.other, lastMessage: c.lastMessage })),
    ...allStaff,
  ].filter(Boolean);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>جاري التحميل...</div>;

  return (
    <>
      <style>{STYLE}</style>
      <h1 className="page-title" style={{ marginBottom: 16 }}>💬 الرسائل الداخلية</h1>
      <div className="im-wrap">
        <div className="im-sidebar">
          <div className="im-sidebar-header">
            <div className="im-sidebar-title">المحادثات</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {allContacts.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>لا يوجد موظفون آخرون</div>
            ) : allContacts.map(contact => (
              <div
                key={contact._id}
                className={`im-contact${activeContact?._id === contact._id ? ' active' : ''}`}
                onClick={() => selectContact(contact)}
              >
                <div className="im-avatar">{contact.name?.[0] || <FiUser size={16} />}</div>
                <div style={{ flex: 1, minWidth: 0 }} className="im-contact-name">
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{contact.role === 'doctor' ? '🩺 الطبيب' : ROLE_LABELS[contact.employeeRole] || 'موظف'}</div>
                  {contact.lastMessage && (
                    <div style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{contact.lastMessage.text}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="im-chat">
          {!activeContact ? (
            <div className="im-empty">
              <FiMessageSquare size={48} />
              <div style={{ fontSize: 16, fontWeight: 700 }}>اختر محادثة</div>
              <div style={{ fontSize: 13, textAlign: 'center' }}>اختر موظفاً من القائمة للبدء في المحادثة</div>
            </div>
          ) : (
            <>
              <div className="im-chat-header">
                <div className="im-avatar" style={{ width: 38, height: 38, fontSize: 14 }}>{activeContact.name?.[0]}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{activeContact.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{activeContact.role === 'doctor' ? '🩺 الطبيب' : ROLE_LABELS[activeContact.employeeRole] || 'موظف'}</div>
                </div>
              </div>
              <div className="im-messages">
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: 20 }}>ابدأ المحادثة الآن</div>
                ) : messages.map(msg => {
                  const isMine = msg.senderId?.toString() === user?._id?.toString() || msg.senderName === user?.name;
                  return (
                    <div key={msg._id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-start' : 'flex-end' }}>
                      <div className={`im-msg ${isMine ? 'mine' : 'theirs'}`}>
                        {msg.text}
                        <div className="im-msg-time">
                          <span>{formatMsgTime(msg.createdAt)}</span>
                          {isMine && (
                            <span className="im-read-tick" style={{ color: msg.readAt ? '#60a5fa' : 'rgba(255,255,255,0.5)' }}>
                              <FiCheck size={10} />
                              <FiCheck size={10} style={{ marginRight: -4 }} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSend} className="im-input-row">
                <textarea
                  className="im-textarea"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب رسالتك... (Enter للإرسال)"
                  rows={1}
                />
                <button type="submit" className="im-send-btn" disabled={sending || !text.trim()}>
                  <FiSend size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
