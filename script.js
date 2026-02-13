// ==========================================
// 1. CONFIGURACIÓN Y CONTENIDO
// ==========================================
const COLOR_FONDO = "#FFF4F2"; 
const COLOR_VINO_TINTO = "#630E16"; 
const COLOR_TRONCO_CAFE = "#4B2C13"; 
const COLOR_ROSADO = "#ff5a7a"; 
const FONT_CLASICA = "'Crimson Text', serif"; 

const musicaAmor = new Audio("valentine.mp3"); 
musicaAmor.loop = true;

const frasesExtra = [
    "Para el amor de mi vida:", "",
    "Si pudiera elegir un lugar, sería a tu lado y vivo sin",
    "arrepentimientos de haberte conocido.", "",
    "Cuanto más tiempo estoy contigo, más te amo", "",
    "                                            - I love You!"
];

const tituloCarta = "I Love You";
const mensajeCarta = [
    "Mi amor, preparé esta sorpresa para",
    "pedirte que seas mi San Valentín.",
    "Sé que no siempre soy el más romántico",
    "ni el más detallista, pero hoy quiero",
    "dejar a un lado las excusas y",
    "abrirte mi corazón.", "",
    "Eres mi razón de ser, la persona que",
    "ilumina mis días y con quien quiero",
    "compartir cada instante de mi vida.", "",
    "Te amo con todo lo que soy, mi bonita. 💗"
];

let cartaAbierta = false, escalaCarta = 0, animacionIniciada = false;
let lineaSueloCompletada = false, progresoLinea = 0, desplazamientoX = 0;
let trazosArbol = [], corazonesCopa = [], petalosCayeron = [];
let mostrarTextoFinal = false, fraseActual = "", mostrarReloj = false;
let progresoRevelado = { dias: 0, horas: 0, minutos: 0, segundos: 0 };
let lineasEscritas = [], fraseExtraActual = "", indiceFraseActual = 0;
let escribiendoLineas = false, yaInicieEscritura = false;
let mouseSobreBoton = false; 
let totalCorazonesMeta = 2700;

const fraseCompleta = "Mi amor por ti comenzó hace...";
const fechaInicio = new Date(2024, 10, 18, 13, 0, 0);

// ==========================================
// 2. MOTOR DE RENDERIZADO
// ==========================================
function loopPrincipal(ctx) {
    if (ctx.canvas.width !== window.innerWidth || ctx.canvas.height !== window.innerHeight) {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
    }

    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const sueloY = window.innerHeight * 0.9, centroX = window.innerWidth / 2;
    let mX = window.innerWidth < 600 ? 30 : 70;

    if (!animacionIniciada) {
        let s = 110 + Math.sin(Date.now() * 0.005) * 15;
        ctx.save(); ctx.translate(centroX, window.innerHeight / 2 - 50);
        dibujarCorazon(ctx, s, COLOR_ROSADO); ctx.restore();
        ctx.fillStyle = COLOR_VINO_TINTO; ctx.textAlign = "center"; 
        ctx.font = `italic 22px ${FONT_CLASICA}`; 
        ctx.fillText("¿Quieres ser mi San Valentine? ❤️", centroX, window.innerHeight / 2 + 160);
    }

    if (animacionIniciada) {
        ctx.beginPath(); ctx.strokeStyle = COLOR_VINO_TINTO; ctx.lineWidth = 4;
        ctx.moveTo(centroX - (window.innerWidth * progresoLinea), sueloY);
        ctx.lineTo(centroX + (window.innerWidth * progresoLinea), sueloY);
        ctx.stroke();
        if (progresoLinea < 0.5) progresoLinea += 0.005;
        else if (!lineaSueloCompletada) { lineaSueloCompletada = true; iniciarArbol(ctx, centroX, sueloY); }
    }

    if (lineaSueloCompletada) {
        petalosCayeron.forEach(p => {
            if (p.y < sueloY - 5) { p.y += p.vy; p.x += Math.sin(p.y / 60 + p.offset) * 1.0; p.rot += p.vRot; } 
            else { p.y = sueloY - 5; }
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); dibujarCorazon(ctx, p.s, p.col); ctx.restore();
        });

        if (corazonesCopa.length > 50 && Math.random() > 0.95) {
            let idx = Math.floor(Math.random() * corazonesCopa.length);
            let c = corazonesCopa.splice(idx, 1)[0];
            petalosCayeron.push({ ...c, x: c.x + desplazamientoX, vy: 0.8 + Math.random() * 1.2, vRot: (Math.random() - 0.5) * 0.05, offset: Math.random() * 100 });
        }

        ctx.save(); ctx.translate(desplazamientoX, 0);
        trazosArbol.forEach(t => {
            ctx.strokeStyle = COLOR_TRONCO_CAFE; 
            ctx.lineWidth = t.w; ctx.lineCap = t.esBase ? "butt" : "round"; 
            ctx.beginPath(); ctx.moveTo(t.p0x, t.p0y); ctx.lineTo(t.p1x, t.p1y); ctx.stroke();
        });
        corazonesCopa.forEach(c => { ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot); dibujarCorazon(ctx, c.s, c.col); ctx.restore(); });
        ctx.restore();
    }

    if (mostrarTextoFinal) {
        ctx.fillStyle = COLOR_VINO_TINTO; ctx.textAlign = "left"; ctx.font = `italic 19px ${FONT_CLASICA}`;
        ctx.fillText(fraseActual, mX, sueloY - 75); 
        if (mostrarReloj) dibujarRelojSecuencial(ctx, mX, sueloY - 35);
    }

    if (escribiendoLineas) {
        ctx.textAlign = "left"; let altoLinea = 30; 
        lineasEscritas.forEach((texto, i) => { 
            const esUltimaLinea = (i === frasesExtra.length - 1);
            if (esUltimaLinea) {
                let latido = 1 + Math.sin(Date.now() * 0.006) * 0.03; 
                ctx.save();
                ctx.fillStyle = mouseSobreBoton ? COLOR_ROSADO : "#000";
                ctx.font = `bold italic 20px ${FONT_CLASICA}`;
                if (indiceFraseActual >= frasesExtra.length) {
                    ctx.translate(mX, 70 + (i * altoLinea));
                    ctx.scale(latido, latido);
                    if (mouseSobreBoton) { ctx.shadowBlur = 10; ctx.shadowColor = COLOR_ROSADO; }
                    ctx.fillText(texto, 0, 0);
                } else {
                    ctx.fillText(texto, mX, 70 + (i * altoLinea));
                }
                ctx.restore();
            } else {
                ctx.fillStyle = COLOR_VINO_TINTO;
                ctx.font = (i === 0) ? `bold italic 22px ${FONT_CLASICA}` : `19px ${FONT_CLASICA}`;
                ctx.fillText(texto, mX, 70 + (i * altoLinea)); 
            }
        });
        if (indiceFraseActual < frasesExtra.length) {
            ctx.fillStyle = COLOR_VINO_TINTO;
            ctx.fillText(fraseExtraActual + (Math.floor(Date.now() / 500) % 2 == 0 ? "|" : ""), mX, 70 + (lineasEscritas.length * altoLinea));
        }
    }

    if (cartaAbierta || escalaCarta > 0) {
        dibujarCartaDiario(ctx);
        if (cartaAbierta && escalaCarta < 1) escalaCarta += 0.08;
        if (!cartaAbierta && escalaCarta > 0) escalaCarta -= 0.08;
    }
    requestAnimationFrame(() => loopPrincipal(ctx));
}

// ==========================================
// 3. DISEÑO Y LÓGICA (AJUSTE MÓVIL)
// ==========================================
function iniciarArbol(ctx, bX, bY) {
    // Tronco más corto para que quepa en pantalla vertical
    const alturaArbol = window.innerHeight * (window.innerWidth < 600 ? 0.35 : 0.55);
    const pT = {x: bX + 30, y: bY - alturaArbol}, cpT = {x: bX, y: bY - (alturaArbol * 0.4)};
    
    let ramasTotales = 5, ramasTerminadas = 0;
    dibujarTrazo(ctx, {x: bX, y: bY}, pT, cpT, 45, 0, 0, true, () => {
        const config = [{t: 0.35, lx: -80, ly: -60, w: 15}, {t: 0.48, lx: 90, ly: -55, w: 12}, {t: 0.6, lx: -70, ly: -70, w: 10}, {t: 0.75, lx: 60, ly: -65, w: 6}, {t: 0.88, lx: -20, ly: -30, w: 4}];
        config.forEach((r, i) => {
            let t = r.t, o = {x: (1-t)**2*bX+2*(1-t)*t*cpT.x+t**2*pT.x, y: (1-t)**2*bY+2*(1-t)*t*cpT.y+t**2*pT.y};
            dibujarTrazo(ctx, o, {x: o.x + r.lx, y: o.y + r.ly}, {x: o.x, y: o.y - 15}, r.w, 0, 300 * i, false, (pf) => {
                let sub = 0;
                for (let j = 0; j < 3; j++) {
                    let tA = 0.3 + (j * 0.25);
                    let rO = {x: (1-tA)**2*o.x+2*(1-tA)*tA*o.x+tA**2*pf.x, y: (1-tA)**2*o.y+2*(1-tA)*tA*(o.y-15)+tA**2*pf.y};
                    let ang = Math.atan2(pf.y-o.y, pf.x-o.x) + (j===0?-0.3:j===1?0.3:-0.5);
                    dibujarTrazo(ctx, rO, {x: rO.x+Math.cos(ang)*30, y: rO.y+Math.sin(ang)*30}, {x: rO.x, y: rO.y-5}, 2, 0, 150, false, () => {
                        sub++; if (sub === 3) { ramasTerminadas++; if (ramasTerminadas === ramasTotales) setTimeout(() => florecerYDesplazar(bX, pT.y + 20), 500); }
                    });
                }
            });
        });
    });
}

function dibujarTrazo(ctx, p0, p1, cp, wI, wF, delay, esTronco, cb) {
    setTimeout(() => {
        let t = 0; const a = () => {
            if (t <= 1) {
                let p = {x: (1-t)**2*p0.x+2*(1-t)*t*cp.x+t**2*p1.x, y: (1-t)**2*p0.y+2*(1-t)*t*cp.y+t**2*p1.y};
                let tp = Math.max(0, t - 0.03), pp = {x: (1-tp)**2*p0.x+2*(1-tp)*tp*cp.x+tp**2*p1.x, y: (1-tp)**2*p0.y+2*(1-tp)*tp*cp.y+tp**2*p1.y};
                trazosArbol.push({p0x: pp.x, p0y: pp.y, p1x: p.x, p1y: p.y, w: wI - (wI - wF) * t, esBase: esTronco && t < 0.1});
                t += 0.02; requestAnimationFrame(a);
            } else if (cb) cb(p1);
        }; a();
    }, delay);
}

function florecerYDesplazar(xC, yC) {
    let generados = 0;
    const esMovil = window.innerWidth < 600;
    const factorEscala = esMovil ? 0.45 : 0.85; 
    for (let i = 0; i < totalCorazonesMeta; i++) {
        setTimeout(() => {
            let r = Math.sqrt(Math.random()), t = Math.random() * Math.PI * 2;
            let x = r * 14 * Math.pow(Math.sin(t), 3), y = -r * (11 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            corazonesCopa.push({ 
                x: (x * (18 * factorEscala) + xC) + (Math.random() - 0.5) * (200 * factorEscala), 
                y: (y * (15 * factorEscala) + yC) + (Math.random() - 0.5) * (80 * factorEscala), 
                s: Math.random() * 4 + 2, col: COLOR_ROSADO, rot: Math.random() * Math.PI * 2 
            });
            generados++;
            if (generados === totalCorazonesMeta) {
                setTimeout(() => {
                    const metaDesplazamiento = esMovil ? window.innerWidth * 0.15 : window.innerWidth * 0.28;
                    const anim = () => { if (desplazamientoX < metaDesplazamiento) { desplazamientoX += 4; requestAnimationFrame(anim); } else escribirFrase(); }; anim();
                }, 1000);
            }
        }, Math.random() * 4000);
    }
}

function dibujarCartaDiario(ctx) {
    const w = window.innerWidth < 500 ? window.innerWidth * 0.9 : 420;
    const h = 480; const x = (window.innerWidth - w * escalaCarta) / 2, y = (window.innerHeight - h * escalaCarta) / 2;
    ctx.save(); ctx.globalAlpha = escalaCarta; ctx.translate(x + (w * escalaCarta) / 2, y + (h * escalaCarta) / 2);
    ctx.scale(escalaCarta, escalaCarta); ctx.translate(-(w / 2), -(h / 2));
    ctx.shadowBlur = 40; ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.fillStyle = "#F2E8D5"; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = COLOR_VINO_TINTO; ctx.lineWidth = 2; ctx.strokeRect(15, 15, w - 30, h - 30);
    if (escalaCarta > 0.9) {
        ctx.textAlign = "center"; ctx.fillStyle = COLOR_VINO_TINTO; ctx.font = `bold 38px ${FONT_CLASICA}`; ctx.fillText(tituloCarta, w/2, 85);
        ctx.fillStyle = "#1A1A1A"; ctx.font = `400 17px ${FONT_CLASICA}`;
        mensajeCarta.forEach((l, i) => ctx.fillText(l, w/2, 145 + (i * 25)));
    }
    ctx.restore();
}

function escribirFrase() { mostrarTextoFinal = true; let i = 0; const int = setInterval(() => { fraseActual = fraseCompleta.slice(0, i); i++; if (i > fraseCompleta.length) { clearInterval(int); mostrarReloj = true; } }, 80); }
function escribirSiguienteLinea() { if (indiceFraseActual < frasesExtra.length) { let i = 0, f = frasesExtra[indiceFraseActual]; let t = setInterval(() => { fraseExtraActual = f.slice(0, i); i++; if (i > f.length) { clearInterval(t); lineasEscritas.push(f); fraseExtraActual = ""; indiceFraseActual++; setTimeout(escribirSiguienteLinea, 300); } }, 40); } }
function dibujarCorazon(ctx, s, col) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-s/2, -s/2, -s, s/3, 0, s); ctx.bezierCurveTo(s, s/3, s/2, -s/2, 0, 0); ctx.fillStyle = col; ctx.fill(); }

function dibujarRelojSecuencial(ctx, x, y) {
    const ahora = new Date(), diff = ahora - fechaInicio;
    const d = Math.floor(diff / 86400000), h = Math.floor((diff / 3600000) % 24), m = Math.floor((diff / 60000) % 60), s = Math.floor((diff / 1000) % 60);
    ctx.font = "bold 21px Arial"; let posX = x;
    const unds = [{v: `${d} Días `, k: 'dias'}, {v: `${h} Horas `, k: 'horas'}, {v: `${m} Minutos `, k: 'minutos'}, {v: `${s} Segundos`, k: 'segundos'}];
    unds.forEach(u => {
        let p = (u.k === 'dias' || (u.k === 'horas' && progresoRevelado.dias >= 1) || (u.k === 'minutos' && progresoRevelado.horas >= 1) || (u.k === 'segundos' && progresoRevelado.minutos >= 1));
        if (p) {
            if (progresoRevelado[u.k] < 1) progresoRevelado[u.k] += 0.02;
            if (u.k === 'segundos' && progresoRevelado.segundos >= 1 && !yaInicieEscritura) { yaInicieEscritura = true; setTimeout(() => { escribiendoLineas = true; escribirSiguienteLinea(); }, 500); }
            ctx.save(); let wT = ctx.measureText(u.v).width;
            ctx.beginPath(); ctx.rect(posX, y - 30, wT * progresoRevelado[u.k], 50); ctx.clip();
            ctx.globalAlpha = progresoRevelado[u.k]; ctx.fillStyle = COLOR_ROSADO; ctx.fillText(u.v, posX, y); ctx.restore(); posX += wT;
        }
    });
}

function getBotonRect(ctx) {
    let mX = window.innerWidth < 600 ? 30 : 70;
    const fraseBoton = "- I love You!";
    const textoCompletoFinal = frasesExtra[frasesExtra.length - 1]; 
    ctx.font = `bold italic 20px ${FONT_CLASICA}`;
    const anchoCompleto = ctx.measureText(textoCompletoFinal).width;
    const anchoBoton = ctx.measureText(fraseBoton).width;
    return { x: mX + (anchoCompleto - anchoBoton), y: 70 + (frasesExtra.length - 1) * 30 - 25, w: anchoBoton, h: 35 };
}

window.onload = function() {
    const cvs = document.getElementById('canvas'); const ctx = cvs.getContext('2d');
    cvs.width = window.innerWidth; cvs.height = window.innerHeight;
    loopPrincipal(ctx);

    cvs.addEventListener('mousemove', (e) => {
        if (!escribiendoLineas || indiceFraseActual < frasesExtra.length) return;
        const r = getBotonRect(ctx);
        if (e.clientX > r.x && e.clientX < r.x + r.w && e.clientY > r.y && e.clientY < r.y + r.h) {
            mouseSobreBoton = true; cvs.style.cursor = 'pointer';
        } else {
            mouseSobreBoton = false; cvs.style.cursor = 'default';
        }
    });

    cvs.addEventListener('mousedown', (e) => {
        if (!animacionIniciada) { animacionIniciada = true; if(musicaAmor.paused) musicaAmor.play(); return; }
        if (cartaAbierta) { cartaAbierta = false; return; }
        const r = getBotonRect(ctx);
        if (e.clientX > r.x && e.clientX < r.x + r.w && e.clientY > r.y && e.clientY < r.y + r.h) {
            cartaAbierta = true;
        }
    });
};
