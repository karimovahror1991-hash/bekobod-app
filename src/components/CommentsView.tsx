import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';

interface Comment {
  id: number;
  user_id: number;
  user_name: string | null;
  text: string;
  created_at: string;
}

interface Announcement {
  id: number;
  text: string;
  created_at: string;
}

interface CommentsViewProps {
  announcementId: number;
}

export const CommentsView: React.FC<CommentsViewProps> = ({ announcementId }) => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  // Получаем данные пользователя из Telegram
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    if (user?.id) {
      setUserId(user.id);
      setUserName(user.username ? `@${user.username}` : user.first_name || null);
    }
  }, []);

  // Загружаем объявление + комментарии
  const loadData = async () => {
    try {
      const [annRes, comRes] = await Promise.all([
        fetch(`${API_URL}/api/announcements/${announcementId}`),
        fetch(`${API_URL}/api/announcements/${announcementId}/comments`),
      ]);
      const annData = await annRes.json();
      const comData = await comRes.json();
      setAnnouncement(annData.announcement || null);
      setComments(comData.comments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Автообновление каждые 10 секунд
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [announcementId]);

  // Автоскролл вниз при новых комментариях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  // Отправить комментарий
  const handleSend = async () => {
    if (!newComment.trim() || !userId) return;
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/announcements/${announcementId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName,
          text: newComment.trim(),
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      setNewComment('');
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Xatolik yuz berdi');
    } finally {
      setSending(false);
    }
  };

  // Закрыть Mini App (назад в бот)
  const handleClose = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.close) {
      tg.close();
    } else {
      window.history.back();
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'hozir';
    if (diffMin < 60) return `${diffMin} daqiqa oldin`;
    if (diffHrs < 24) return `${diffHrs} soat oldin`;
    if (diffDays < 7) return `${diffDays} kun oldin`;
    return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Заголовок */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center space-x-3">
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-stone-700" />
          </button>
          <div>
            <h1 className="font-bold text-lg text-stone-900">Комментарии</h1>
            <p className="text-xs text-stone-500">{comments.length} комментариев</p>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Объявление сверху */}
          {announcement && (
            <div className="bg-white rounded-2xl p-4 mb-4 border border-stone-200 shadow-sm">
              <div className="text-xs text-amber-700 font-semibold mb-2">
                📢 Объявление от администрации
              </div>
              <p className="text-sm text-stone-800 whitespace-pre-wrap leading-relaxed">
                {announcement.text}
              </p>
              <div className="text-xs text-stone-400 mt-2">
                {formatTime(announcement.created_at)}
              </div>
            </div>
          )}

          {/* Список комментариев */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-sm">Пока комментариев нет. Будьте первым!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                      {(c.user_name || 'U').replace('@', '').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-stone-900">
                        {c.user_name || 'Foydalanuvchi'}
                      </div>
                      <div className="text-xs text-stone-400">
                        {formatTime(c.created_at)}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed pl-10">
                    {c.text}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Поле ввода */}
      <div className="bg-white border-t border-stone-200 sticky bottom-0 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-end space-x-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Написать комментарий..."
            rows={1}
            className="flex-1 px-4 py-3 rounded-2xl border-2 border-stone-200 text-sm focus:outline-none focus:border-amber-500 resize-none max-h-32 bg-stone-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !newComment.trim()}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center disabled:opacity-50 transition shadow-lg shrink-0 active:scale-95"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};