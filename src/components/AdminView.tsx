import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Loader2, MessageSquare, CheckCircle } from 'lucide-react';

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

export const AdminView: React.FC<AdminViewProps> = ({ onClose, userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  const getUserName = () => {
    const tg = (window as any).Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    if (user) {
      return user.username ? `@${user.username}` : `${user.first_name || ''} ${user.last_name || ''}`.trim();
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
  }, [userId]);

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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
      {/* Заголовок */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-stone-700" />
          </button>
          <h1 className="font-bold text-2xl text-stone-900">✉️ Administrator</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Форма отправки */}
        <form onSubmit={handleSend} className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4">
          <div>
            <h2 className="font-bold text-lg text-stone-900 mb-1">
              Murojaat yuborish
            </h2>
            <p className="text-xs text-stone-500">
              Shikoyat, taklif yoki savolingizni yozing
            </p>
          </div>

          <textarea
            required
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Xabaringizni yozing..."
            rows={4}
            className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-hidden focus:border-amber-500 resize-none"
          />

          <button
            type="submit"
            disabled={sending || !newMessage.trim() || !userId}
            className="w-full py-3 bg-linear-to-br from-amber-500 to-orange-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50 transition shadow-lg"
          >
            {sending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Yuborilmoqda...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Yuborish</span>
              </>
            )}
          </button>
        </form>

        {/* История сообщений */}
        <div>
          <h2 className="font-bold text-lg text-stone-900 mb-3 flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Mening murojaatlarim</span>
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-sm">
              Hozircha murojaatlar yo'q
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-stone-400">
                      {formatDate(msg.created_at)}
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      msg.status === 'answered'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {msg.status === 'answered' ? 'Javob berildi' : 'Kutilmoqda'}
                    </div>
                  </div>

                  <div className="bg-stone-50 rounded-2xl p-3 text-sm text-stone-700">
                    {msg.message}
                  </div>

                  {msg.reply && (
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-2xl p-3 space-y-1">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Administrator javobi:</span>
                      </div>
                      <div className="text-sm text-stone-700">
                        {msg.reply}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};