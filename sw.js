// ===== 手続きナビ：電波がなくても開けるようにする仕組み（サービスワーカー） =====
// ファイルを変えたら、この番号を1つ上げる（古い保存分を入れ替えるため）
const CACHE = "tetsuzuki-navi-v1";
const FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

// 初回：ファイルを端末に保存する
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

// 古い番号の保存分を削除する
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// 表示のたび：まずネットから最新版を取りに行き、つながらなければ保存分を使う
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
