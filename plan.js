// Genera el plan de cada día a partir de las respuestas de bienvenida (config/perfil).
(function () {
  const TIPOS = { descanso: 'Descanso', correr: 'Correr', largo: 'Tirada larga', gym: 'Gym', padel: 'Pádel', bici: 'Bici' };
  function perfil() {
    try { const s = JSON.parse(localStorage.getItem('jdb')) || {}; return s['config/perfil'] || null; } catch (e) { return null; }
  }
  function ritmoMas(r, seg) { // "6:00" + 15 s -> "6:15"
    const m = /^(\d{1,2}):(\d{2})$/.exec(r || ''); if (!m) return null;
    const t = Number(m[1]) * 60 + Number(m[2]) + seg; return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  }
  function planDoc(fecha, p) {
    const [y, mo, dd] = fecha.split('-').map(Number);
    const day = Date.UTC(y, mo - 1, dd), wd = new Date(day).getUTCDay();
    const [iy, im, id] = p.inicio.split('-').map(Number);
    const semana = Math.max(0, Math.floor((day - Date.UTC(iy, im - 1, id)) / (7 * 864e5)) + 1);
    const base = { fecha, semana, hecho: null, km: null, min: null, pasos: null, dolor: null, peso: null, km_plan: null, min_plan: null, extras: [], zapa: null };
    const tipo = (p.semana && p.semana[wd]) || 'descanso';
    const km = Math.max(1, Number(p.kmBase) || 5), r = p.ritmo;
    let t;
    if (tipo === 'correr') t = { plan: km + ' km cómodo', km_plan: km, detalle: r ? 'A ' + r + '–' + ritmoMas(r, 20) + '/km' : 'Ritmo cómodo, que puedas hablar' };
    else if (tipo === 'largo') {
      const tope = Math.max(km, Number(p.largoMax) || km), l = Math.min(tope, km + Math.floor(Math.max(0, semana - 1) / 2));
      t = { plan: 'Tirada larga ' + l + ' km', km_plan: l, detalle: r ? 'Suave, ' + ritmoMas(r, 15) + '–' + ritmoMas(r, 30) + '/km' : 'Suave, más lento que tus rodajes' };
    }
    else if (tipo === 'gym') t = { plan: 'Gym fuerza y core', min_plan: 45, detalle: 'Rutina de la pestaña Gym · 3×8–12' };
    else if (tipo === 'bici') t = { plan: 'Bici 45 min', min_plan: 45, detalle: 'Ritmo cómodo, sin impacto' };
    else if (tipo === 'padel') t = { plan: 'Pádel', min_plan: 60, detalle: 'Calienta 10 min antes' };
    else t = wd === 0 ? { plan: 'Descanso activo', detalle: 'Caminar o bici tranquila · pésate en ayunas' } : { plan: 'Descanso', detalle: 'Caminar 20–30 min' };
    return Object.assign(base, { tipo }, t);
  }
  window.SP = { TIPOS, perfil, planDoc };
})();
