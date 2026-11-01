// Base de datos sencilla guardada en este móvil (localStorage).
// Imita la API que usaban las páginas originales: doc(path).get/set/update/onSnapshot y collection(name).onSnapshot.
(function () {
  const KEY = 'jdb';
  let store = null;
  function load() {
    if (store) return store;
    try { store = JSON.parse(localStorage.getItem(KEY)); } catch (e) { store = null; }
    if (!store || typeof store !== 'object') {
      store = JSON.parse(JSON.stringify(window.SEED || {}));
      persist();
    }
    return store;
  }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
  const docSubs = {}, colSubs = {};
  const clone = (v) => v == null ? v : JSON.parse(JSON.stringify(v));
  function colOf(path) { return path.split('/').slice(0, -1).join('/'); }
  function docSnap(path) { const v = load()[path]; return { id: path.split('/').pop(), exists: v != null, data: () => clone(v) }; }
  function colSnap(col) {
    const s = load(), pre = col + '/';
    const docs = Object.keys(s).filter((k) => k.startsWith(pre) && !k.slice(pre.length).includes('/')).sort()
      .map((k) => ({ id: k.slice(pre.length), data: () => clone(s[k]) }));
    return { docs, size: docs.length, empty: !docs.length };
  }
  function notify(path) {
    (docSubs[path] || []).forEach((cb) => { try { cb(docSnap(path)); } catch (e) {} });
    const c = colOf(path);
    (colSubs[c] || []).forEach((cb) => { try { cb(colSnap(c)); } catch (e) {} });
  }
  const db = {
    doc(path) {
      return {
        async get() { return docSnap(path); },
        async set(data) { load()[path] = clone(data); persist(); notify(path); },
        async update(patch) { const s = load(); s[path] = Object.assign({}, s[path] || {}, clone(patch)); persist(); notify(path); },
        async delete() { delete load()[path]; persist(); notify(path); },
        onSnapshot(cb) { (docSubs[path] = docSubs[path] || []).push(cb); setTimeout(() => cb(docSnap(path)), 0); return () => {}; }
      };
    },
    collection(col) {
      return {
        async get() { return colSnap(col); },
        onSnapshot(cb) { (colSubs[col] = colSubs[col] || []).push(cb); setTimeout(() => cb(colSnap(col)), 0); return () => {}; }
      };
    }
  };
  window.claude = { use: async (name) => name === 'db' ? db : null };
})();
