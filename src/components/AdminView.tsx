import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Loader2, User, Shield } from 'lucide-react';

interface AdminViewProps {
  onClose: () => void;
  userId: number | null;
}

interface Message {
  id: number;
  user_id: number;
  user_name: string | null;
  message: string;
  reply: string | null;
  status: string;
  created_at: string;
  replied_at: string | null;
}

interface ChatItem {
  type: 'user' | 'admin';
  text: string;
  time: string;
}

export const AdminView: React.FC<AdminViewProps> = ({ onClose, userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  const getUserName = () => {
    const tg = (window as any).Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    if (user) {
      return user.username ? `@${user.username}` : `${user.first_name || ''}`.trim();
    }
    return null;
  };

  const loadMessages = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/my-messages?userId=${userId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // Обновляем каждые 15 секунд, чтобы видеть ответы админа
    const interval = setInterval(loadMessages, 15000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName: getUserName(),
          message: newMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      setNewMessage('');
      loadMessages();
    } catch (err) {
      console.error(err);
      alert('Xatolik yuz berdi');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Собираем все сообщения в один чат (сначала старые)
  const buildChat = (): ChatItem[] => {
    const chat: ChatItem[] = [];
    const sorted = [...messages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sorted.forEach((msg) => {
      chat.push({
        type: 'user',
        text: msg.message,
        time: formatTime(msg.created_at),
      });
      if (msg.reply) {
        chat.push({
          type: 'admin',
          text: msg.reply,
          time: msg.replied_at ? formatTime(msg.replied_at) : '',
        });
      }
    });

    return chat;
  };

  const chat = buildChat();

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100 flex flex-col">
      {/* Заголовок */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-stone-700" />
          </button>
          <div>
            <h1 className="font-bold text-lg text-stone-900">✉️ Administrator</h1>
            <p className="text-xs text-stone-500">Murojaat va takliflar</p>
          </div>
        </div>
      </div>

      {/* Чат */}
              <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          </div>
        ) : chat.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <div className="text-5xl mb-3">💬</div>
            <p className="text-sm">Xabar yozing, administrator javob beradi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chat.map((item, index) => (
              <div
                key={index}
                className={`flex ${item.type === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] ${item.type === 'user' ? '' : 'text-right'}`}>
                  <div className={`flex items-center space-x-1.5 mb-1 text-xs ${
                    item.type === 'user' ? 'text-stone-500' : 'text-emerald-600 justify-end'
                  }`}>
                    {item.type === 'user' ? (
                      <>
                        <User className="w-3 h-3" />
                        <span>Siz</span>
                      </>
                    ) : (
                      <>
                        <span>Administrator</span>
                        <Shield className="w-3 h-3" />
                      </>
                    )}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 text-sm ${
                    item.type === 'user'
                      ? 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm'
                      : 'bg-linear-to-br from-emerald-500 to-green-600 text-white rounded-tr-sm shadow-md'
                  }`}>
                    {item.text}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1">
                    {item.time}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

             {/* Форма ввода */}
      <div className="w-full max-w-2xl mx-auto px-4 pb-32 pt-4">
        <form
          onSubmit={handleSend}
          className="bg-white shadow-2xl border-2 border-amber-200 rounded-3xl px-4 py-3 flex items-end space-x-2"
        >
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Xabar yozing..."
            rows={1}
            className="flex-1 px-4 py-3.5 rounded-2xl border-2 border-stone-200 text-sm focus:outline-hidden focus:border-amber-500 resize-none max-h-32 bg-stone-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as any);
              }
            }}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim() || !userId}
            className="w-14 h-14 rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center disabled:opacity-50 transition shadow-lg shrink-0 active:scale-95"
          >
            {sending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
         </form>
      </div>
    </div>
  );
};