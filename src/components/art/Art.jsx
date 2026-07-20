// Arte vetorial ORIGINAL estilo Apple — TEMA ESCURO (dark premium).
// Todos os SVGs desenhados à mão, paleta de sistema da Apple sobre fundo espacial.
// Usam traços/claros suaves para combinar com o glass dark do EnergyTrack.
import React from 'react';

const BLUE = '#0a84ff';
const BLUE_LIGHT = '#6fa8f4';
const GREEN = '#30d158';
const ORANGE = '#ff9f0a';
const CLOUD = '#f5f5f7';
const MUTED = '#86868b';
const LINE = 'rgba(255,255,255,0.14)';

/* ----------------------------- HERO ----------------------------- */
export function HeroArt({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 560 420" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Monitoramento de energia residencial">
      <defs>
        <linearGradient id="heroScreen" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#0b1020" />
          <stop offset="1" stopColor="#161a2b" />
        </linearGradient>
        <linearGradient id="heroArc" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={BLUE} stopOpacity="0" />
          <stop offset="0.5" stopColor={BLUE_LIGHT} />
          <stop offset="1" stopColor={BLUE} stopOpacity="0" />
        </linearGradient>
        <radialGradient id="heroGlow" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#0a84ff" stopOpacity="0.30" />
          <stop offset="1" stopColor="#0a84ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="houseWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5f5f7" />
          <stop offset="1" stopColor="#c9c9d2" />
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      <rect x="-40" y="-40" width="640" height="500" fill="url(#heroGlow)" />

      {/* arcos de fluxo elétrico com brilho */}
      <g className="art-arc-group" stroke="url(#heroArc)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.95" filter="url(#soft)">
        <path className="art-arc" d="M150 290 C 110 190, 250 150, 340 190" />
        <path className="art-arc" d="M140 320 C 80 220, 250 170, 350 215" />
        <path className="art-arc" d="M170 265 C 150 180, 240 155, 330 170" />
      </g>

      {/* casa com profundidade e jardim */}
      <g transform="translate(350 150)">
        <ellipse cx="40" cy="118" rx="70" ry="14" fill="#0a84ff" opacity="0.18" />
        <path d="M-6 64 L40 18 L86 64 Z" fill={CLOUD} />
        <path d="M-6 64 L40 18 L86 64 Z" fill="url(#houseWall)" opacity="0.15" />
        <rect x="8" y="62" width="64" height="56" rx="5" fill="#101018" stroke={CLOUD} strokeWidth="2.5" />
        <rect x="30" y="80" width="18" height="38" rx="3" fill={BLUE_LIGHT} />
        <rect x="56" y="70" width="16" height="16" rx="3" fill={BLUE} />
        <rect x="56" y="70" width="16" height="16" rx="3" fill={BLUE} opacity="0.5" />
        <circle cx="62" cy="62" r="10" fill="#ffd60a" opacity="0.8" />
      </g>

      {/* smartphone com dashboard rico */}
      <g transform="translate(150 70)">
        <rect x="-6" y="-6" width="192" height="252" rx="34" fill="#0a0a0f" opacity="0.6" />
        <rect x="0" y="0" width="180" height="240" rx="30" fill="#16161d" stroke={LINE} strokeWidth="2" />
        <rect x="10" y="12" width="160" height="216" rx="22" fill="url(#heroScreen)" />
        <rect x="74" y="20" width="32" height="6" rx="3" fill={LINE} />
        <rect x="26" y="40" width="84" height="11" rx="5" fill={CLOUD} />
        <rect x="26" y="58" width="52" height="7" rx="3.5" fill={MUTED} />
        {/* cartões de consumo */}
        <rect x="26" y="78" width="74" height="44" rx="10" fill="#0a0a0f" stroke={LINE} strokeWidth="1.2" />
        <rect x="34" y="88" width="40" height="6" rx="3" fill={MUTED} />
        <rect x="34" y="100" width="54" height="10" rx="4" fill={BLUE_LIGHT} />
        <rect x="112" y="78" width="74" height="44" rx="10" fill="#0a0a0f" stroke={LINE} strokeWidth="1.2" />
        <rect x="120" y="88" width="40" height="6" rx="3" fill={MUTED} />
        <rect x="120" y="100" width="54" height="10" rx="4" fill={GREEN} />
        {/* gráfico de barras */}
        <g>
          <rect x="26" y="150" width="20" height="44" rx="4" fill={BLUE} />
          <rect x="54" y="130" width="20" height="64" rx="4" fill={GREEN} />
          <rect x="82" y="108" width="20" height="86" rx="4" fill={ORANGE} />
          <rect x="110" y="138" width="20" height="56" rx="4" fill={BLUE_LIGHT} />
          <rect x="138" y="124" width="20" height="70" rx="4" fill={BLUE} />
        </g>
        <path d="M26 100 L66 88 L106 76 L146 64" stroke={BLUE_LIGHT} strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="26" y="204" width="128" height="20" rx="6" fill="#0a0a0f" stroke={LINE} strokeWidth="1.5" />
        <circle cx="40" cy="214" r="5" fill={BLUE} />
        <rect x="52" y="209" width="64" height="6" rx="3" fill={MUTED} />
      </g>
    </svg>
  );
}

/* --------------------------- APPLIANCES --------------------------- */
export function AppliancesArt({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 440 320" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Aparelhos domésticos">
      <defs>
        <linearGradient id="appGlass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a22" />
          <stop offset="1" stopColor="#0e0e14" />
        </linearGradient>
        <radialGradient id="appGlow" cx="0.5" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#0a84ff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#0a84ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-20" y="-20" width="480" height="360" fill="url(#appGlow)" />

      <g stroke={LINE} strokeWidth="2">
        {/* geladeira com detalhe */}
        <g transform="translate(28 70)">
          <rect x="0" y="0" width="74" height="196" rx="14" fill="url(#appGlass)" />
          <line x1="0" y1="74" x2="74" y2="74" />
          <rect x="10" y="20" width="8" height="34" rx="4" fill={CLOUD} stroke="none" />
          <rect x="10" y="92" width="8" height="46" rx="4" fill={CLOUD} stroke="none" />
          <rect x="22" y="14" width="34" height="44" rx="4" fill="#0a0a0f" />
        </g>
        {/* ar condicionado */}
        <g transform="translate(140 28)">
          <rect x="0" y="0" width="150" height="50" rx="14" fill="url(#appGlass)" />
          <line x1="22" y1="40" x2="128" y2="40" stroke={BLUE} strokeWidth="2.5" />
          <circle cx="124" cy="25" r="6" fill={BLUE} stroke="none" />
          <circle cx="124" cy="25" r="11" fill="none" stroke={BLUE} strokeOpacity="0.4" />
        </g>
        {/* TV com moldura fina */}
        <g transform="translate(320 80)">
          <rect x="0" y="0" width="86" height="56" rx="8" fill="#16161d" />
          <rect x="7" y="7" width="72" height="42" rx="4" fill={BLUE} opacity="0.45" />
          <rect x="7" y="7" width="72" height="42" rx="4" fill="url(#cell2)" opacity="0.15" />
          <rect x="36" y="56" width="14" height="16" fill={CLOUD} stroke="none" />
          <line x1="20" y1="74" x2="62" y2="74" />
        </g>
        {/* lâmpada com foco */}
        <g transform="translate(150 180)">
          <circle cx="30" cy="30" r="30" fill="url(#appGlass)" />
          <circle cx="30" cy="30" r="30" fill="#fff7e0" opacity="0.06" />
          <path d="M30 6 a24 24 0 0 1 0 48 a24 24 0 0 1 0 -48" fill="#fff7e0" stroke="none" opacity="0.9" />
          <circle cx="30" cy="30" r="30" fill="none" stroke={ORANGE} strokeOpacity="0.5" strokeWidth="2" />
          <rect x="22" y="56" width="16" height="14" rx="3" fill={CLOUD} stroke="none" />
          <line x1="22" y1="84" x2="38" y2="84" />
        </g>
        {/* máquina de lavar */}
        <g transform="translate(286 182)">
          <rect x="0" y="0" width="84" height="104" rx="14" fill="url(#appGlass)" />
          <circle cx="42" cy="48" r="27" fill="#0a0a0f" />
          <circle cx="42" cy="48" r="27" fill="none" stroke={BLUE} strokeOpacity="0.5" strokeWidth="2" />
          <circle cx="42" cy="48" r="6" fill={CLOUD} stroke="none" />
          <rect x="16" y="86" width="52" height="6" rx="3" fill={MUTED} stroke="none" />
        </g>
      </g>
      <path className="art-arc" d="M70 280 C 210 300, 270 270, 340 270" stroke={BLUE} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/* ----------------------------- DASHBOARD ----------------------------- */
export function DashboardArt({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 440 320" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Painel de consumo">
      <defs>
        <linearGradient id="dashFill" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={BLUE} stopOpacity="0.35" />
          <stop offset="1" stopColor={BLUE} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="dashPanel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#181820" />
          <stop offset="1" stopColor="#0e0e14" />
        </linearGradient>
        <radialGradient id="dashGlow" cx="0.5" cy="0.2" r="0.9">
          <stop offset="0" stopColor="#0a84ff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#0a84ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-20" y="-20" width="480" height="360" fill="url(#dashGlow)" />

      <rect x="20" y="28" width="400" height="256" rx="26" fill="url(#dashPanel)" stroke={LINE} strokeWidth="2" />
      <rect x="20" y="28" width="400" height="256" rx="26" fill={BLUE} opacity="0.04" />

      {/* área do gráfico com preenchimento */}
      <path d="M56 200 L106 175 L156 150 L206 122 L256 95 L306 70 L356 55 L356 210 L56 210 Z" fill="url(#dashFill)" />
      <g>
        <rect x="56" y="178" width="34" height="32" rx="7" fill={BLUE} />
        <rect x="106" y="153" width="34" height="57" rx="7" fill={GREEN} />
        <rect x="156" y="128" width="34" height="82" rx="7" fill={ORANGE} />
        <rect x="206" y="100" width="34" height="110" rx="7" fill={BLUE_LIGHT} />
        <rect x="256" y="73" width="34" height="137" rx="7" fill={BLUE} />
        <rect x="306" y="48" width="34" height="162" rx="7" fill={GREEN} />
      </g>
      <path d="M56 178 L106 153 L156 128 L206 100 L256 73 L306 48 L356 28" stroke={CLOUD} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {[[56,178],[106,153],[156,128],[206,100],[256,73],[306,48],[356,28]].map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r="5.5" fill={CLOUD} />
      ))}

      {/* cabeçalho do painel */}
      <rect x="56" y="56" width="120" height="12" rx="6" fill={CLOUD} />
      <rect x="56" y="76" width="80" height="8" rx="4" fill={MUTED} />
      <circle cx="356" cy="64" r="14" fill={BLUE} opacity="0.18" />
      <circle cx="356" cy="64" r="6" fill={BLUE} />
    </svg>
  );
}

/* ----------------------------- SOLAR ----------------------------- */
export function SolarPanelArt({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 440 320" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placa solar fotovoltaica">
      <defs>
        <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a84ff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#0a84ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cell2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0a84ff" />
          <stop offset="0.55" stopColor="#0066cc" />
          <stop offset="1" stopColor="#004e9e" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd60a" />
          <stop offset="0.6" stopColor="#ff9f0a" />
          <stop offset="1" stopColor="#ff9f0a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="-20" y="-20" width="480" height="200" fill="url(#sky2)" />
      <ellipse cx="220" cy="250" rx="190" ry="40" fill="url(#sky2)" />

      {/* suporte */}
      <g stroke={MUTED} strokeWidth="4" strokeLinecap="round">
        <line x1="150" y1="170" x2="128" y2="250" />
        <line x1="300" y1="170" x2="322" y2="250" />
        <line x1="120" y1="250" x2="330" y2="250" />
      </g>

      {/* painel em perspectiva com moldura e brilho */}
      <g transform="translate(60 40)">
        <polygon points="40,40 330,40 308,152 20,152" fill="#101018" stroke={LINE} strokeWidth="1.5" />
        <polygon points="52,50 316,50 294,142 34,142" fill="url(#cell2)" />
        {/* grade de células 6x3 */}
        <g stroke="#bfe0ff" strokeWidth="1.4" opacity="0.8">
          {[0,1,2,3,4,5].map((i) => {
            const x1 = 52 + (264/6)*i;
            const x2 = 34 + (260/6)*i;
            return <line key={`v${i}`} x1={x1} y1="50" x2={x2} y2="142" />;
          })}
          {[0,1,2].map((j) => {
            const t = (92/3)*j;
            return <line key={`h${j}`} x1="40" y1={40 + t} x2="320" y2={40 + t} />;
          })}
        </g>
        {/* brilho que varre (reflexo animado) */}
        <polygon className="art-shine" points="80,50 150,50 108,142 48,142" fill="#ffffff" opacity="0.16" />
      </g>

      {/* sol com halo */}
      <g transform="translate(350 70)">
        <circle cx="0" cy="0" r="40" fill="url(#sun)" />
        <circle cx="0" cy="0" r="20" fill="#ffd60a" />
        {[0,45,90,135,180,225,270,315].map((a) => (
          <line key={a} x1="0" y1="-30" x2="0" y2="-44" stroke="#ffd60a" strokeWidth="3" strokeLinecap="round" transform={`rotate(${a})`} />
        ))}
      </g>
    </svg>
  );
}

/* ----------------------------- REPORT ----------------------------- */
export function ReportArt({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 440 320" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Relatório de energia">
      <defs>
        <linearGradient id="repGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a84ff" stopOpacity="0.14" />
          <stop offset="1" stopColor="#0a84ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="repSheet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b1b24" />
          <stop offset="1" stopColor="#101018" />
        </linearGradient>
      </defs>
      <rect x="-20" y="-20" width="480" height="360" fill="url(#repGlow)" />

      <g transform="rotate(-4 220 160)">
        <rect x="90" y="34" width="260" height="252" rx="18" fill="url(#repSheet)" stroke={LINE} strokeWidth="2" />
        {/* cabeçalho */}
        <rect x="118" y="62" width="130" height="13" rx="6" fill={CLOUD} />
        <rect x="118" y="84" width="84" height="8" rx="4" fill={MUTED} />
        <circle cx="318" cy="70" r="18" fill={BLUE} opacity="0.18" />
        <circle cx="318" cy="70" r="9" fill={BLUE} />
        <path d="M309 70 l7 7 l14 -14" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* bloco de gráfico */}
        <rect x="118" y="110" width="204" height="84" rx="12" fill="#0a0a0f" stroke={LINE} strokeWidth="1.5" />
        <rect x="130" y="150" width="22" height="32" rx="4" fill={BLUE} />
        <rect x="162" y="134" width="22" height="48" rx="4" fill={GREEN} />
        <rect x="194" y="118" width="22" height="64" rx="4" fill={ORANGE} />
        <rect x="226" y="142" width="22" height="40" rx="4" fill={BLUE_LIGHT} />
        <rect x="258" y="126" width="22" height="56" rx="4" fill={BLUE} />
        {/* linhas placeholder */}
        <rect x="118" y="208" width="204" height="8" rx="4" fill={LINE} />
        <rect x="118" y="226" width="160" height="8" rx="4" fill="#26262e" />
        <rect x="118" y="244" width="184" height="8" rx="4" fill="#26262e" />
        <rect x="118" y="262" width="120" height="8" rx="4" fill="#26262e" />
      </g>
    </svg>
  );
}
