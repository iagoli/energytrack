// UF -> [{ label, sigAgente }]
// `label` é o nome amigável exibido no dropdown; `sigAgente` é o nome canônico
// usado pelo dataset CKAN da ANEEL (campo SigAgente). Estrutura também serve
// como fallback estático quando o backend não consegue consultar a ANEEL.
export const DISTRIBUIDORAS_POR_UF = {
  AC: [{ label: 'Energisa Acre', sigAgente: 'EAC' }],
  AL: [{ label: 'Equatorial Alagoas', sigAgente: 'EQUATORIAL AL' }],
  AP: [{ label: 'CEA Equatorial', sigAgente: 'CEA' }],
  AM: [{ label: 'Amazonas Energia', sigAgente: 'AME' }],
  BA: [{ label: 'Neoenergia Coelba', sigAgente: 'COELBA' }],
  CE: [{ label: 'Enel Ceará', sigAgente: 'ENEL CE' }],
  DF: [{ label: 'Neoenergia Brasília', sigAgente: 'Neoenergia Brasília' }],
  ES: [{ label: 'EDP Espírito Santo', sigAgente: 'EDP ES' }],
  GO: [{ label: 'Equatorial Goiás', sigAgente: 'EQUATORIAL GO' }],
  MA: [{ label: 'Equatorial Maranhão', sigAgente: 'EQUATORIAL MA' }],
  MT: [{ label: 'Energisa Mato Grosso', sigAgente: 'EMT' }],
  MS: [{ label: 'Energisa Mato Grosso do Sul', sigAgente: 'EMS' }],
  MG: [{ label: 'Cemig Distribuição', sigAgente: 'CEMIG-D' }],
  PA: [{ label: 'Equatorial Pará', sigAgente: 'EQUATORIAL PA' }],
  PB: [{ label: 'Energisa Paraíba', sigAgente: 'EPB' }],
  PR: [{ label: 'Copel Distribuição', sigAgente: 'COPEL-DIS' }],
  PE: [{ label: 'Neoenergia Pernambuco', sigAgente: 'Neoenergia PE' }],
  PI: [{ label: 'Equatorial Piauí', sigAgente: 'EQUATORIAL PI' }],
  RJ: [
    { label: 'Enel Rio', sigAgente: 'ENEL RJ' },
    { label: 'Light', sigAgente: 'LIGHT SESA' },
  ],
  RN: [{ label: 'Neoenergia Cosern', sigAgente: 'COSERN' }],
  RO: [{ label: 'Energisa Rondônia', sigAgente: 'ERO' }],
  RR: [{ label: 'Roraima Energia', sigAgente: 'BOA VISTA' }],
  RS: [
    { label: 'CEEE Equatorial', sigAgente: 'CEEE-D' },
    { label: 'RGE', sigAgente: 'RGE' },
  ],
  SC: [{ label: 'Celesc Distribuição', sigAgente: 'CELESC' }],
  SP: [
    { label: 'Enel SP', sigAgente: 'ELETROPAULO' },
    { label: 'CPFL Paulista', sigAgente: 'CPFL-PAULISTA' },
    { label: 'CPFL Piratininga', sigAgente: 'CPFL-PIRATINING' },
    { label: 'EDP São Paulo', sigAgente: 'EDP SP' },
    { label: 'Elektro', sigAgente: 'ELEKTRO' },
    { label: 'CPFL Santa Cruz', sigAgente: 'CPFL Santa Cruz' },
  ],
  SE: [{ label: 'Energisa Sergipe', sigAgente: 'ESE' }],
  TO: [{ label: 'Energisa Tocantins', sigAgente: 'ETO' }],
};

// Tarifa residencial média B1 (R$/kWh) por UF — último fallback offline.
export const TARIFA_MEDIA_UF = {
  AC: 0.87, AL: 0.81, AP: 0.81, AM: 0.84, BA: 0.88, CE: 0.75, DF: 0.83,
  ES: 0.79, GO: 0.89, MA: 0.84, MT: 0.90, MS: 0.99, MG: 0.86, PA: 0.98,
  PB: 0.68, PR: 0.64, PE: 0.77, PI: 0.95, RJ: 0.97, RN: 0.78, RS: 0.82,
  RO: 0.84, RR: 0.79, SC: 0.70, SP: 0.75, SE: 0.75, TO: 0.93,
};
