// 🧪 Утилита для отладки userId
// На компе в браузере Telegram не даёт initDataUnsafe.user
// Поэтому можно подменить userId через URL: ?userId=988368940

export const getUserId = (): number | null => {
  // 1️⃣ Пытаемся получить из Telegram
  const tg = (window as any).Telegram?.WebApp;
  const tgId = tg?.initDataUnsafe?.user?.id;
  if (tgId) {
    return Number(tgId);
  }

  // 2️⃣ Fallback: из URL (?userId=...)
  const urlParams = new URLSearchParams(window.location.search);
  const debugId = urlParams.get('userId');
  if (debugId) {
    console.warn('🧪 DEBUG: userId из URL =', debugId);
    return Number(debugId);
  }

  // 3️⃣ Ничего не нашли
  console.warn('⚠️ userId не получен (ни Telegram, ни URL)');
  return null;
};