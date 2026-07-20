// Tarifa padrão de energia elétrica (R$/kWh) — referência ANEEL 2024
export const DEFAULT_TARIFF = 0.75;

// Unidades da Federação — usado nos seletores de UF do Dashboard e SolarSimulator
export const UFS = [
  { sigla: 'AC', nome: 'Acre' },           { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },          { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },          { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },{ sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },          { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },   { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },        { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },     { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' }, { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },{ sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },        { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },      { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' },
];

// Fator de emissão de CO₂ (kgCO₂/kWh) — MCTI/SEEG, fator médio brasileiro da rede elétrica
export const CO2_EMISSION_FACTOR = 0.0839;

// Consumo médio residencial brasileiro (kWh/mês) — ANEEL
export const AVERAGE_CONSUMPTION_BR = 166;

// Especificações do painel solar fotovoltaico padrão de mercado
export const PANEL_POWER_W = 350;      // Watts por painel
export const PANEL_COST_BRL = 4500;   // Custo médio por painel instalado (R$)
export const PANEL_EFFICIENCY = 0.80; // Eficiência do sistema (perdas de cabos, inversor, temperatura)

// Irradiação solar média por região do Brasil (kWh/m²/dia) — CRESESB / Atlas Solarimétrico
export const SOLAR_IRRADIATION = {
  norte:        { label: 'Norte',        value: 5.0 },
  nordeste:     { label: 'Nordeste',     value: 5.5 },
  centro_oeste: { label: 'Centro-Oeste', value: 5.3 },
  sudeste:      { label: 'Sudeste',      value: 4.8 },
  sul:          { label: 'Sul',          value: 4.2 },
};

// Lista pré-cadastrada de eletrodomésticos com potências médias de mercado
export const APPLIANCE_LIST = [
  { id: 'ac',         nome: 'Ar-condicionado (18.000 BTU)',      potencia_w: 1500, icone: '❄️' },
  { id: 'chuveiro',   nome: 'Chuveiro Elétrico',                 potencia_w: 5500, icone: '🚿' },
  { id: 'geladeira',  nome: 'Geladeira Frost Free',              potencia_w: 150,  icone: '🧊' },
  { id: 'lavadora',   nome: 'Máquina de Lavar (ciclo completo)', potencia_w: 1000, icone: '🌊' },
  { id: 'tv',         nome: 'Televisão 55"',                     potencia_w: 120,  icone: '📺' },
  { id: 'microondas', nome: 'Micro-ondas',                       potencia_w: 1200, icone: '🍽️' },
  { id: 'desktop',    nome: 'Computador Desktop',                potencia_w: 300,  icone: '🖥️' },
  { id: 'notebook',   nome: 'Notebook',                          potencia_w: 65,   icone: '💻' },
  { id: 'ferro',      nome: 'Ferro de Passar',                   potencia_w: 1000, icone: '👔' },
  { id: 'lampada',    nome: 'Iluminação (por lâmpada LED 9W)',   potencia_w: 9,    icone: '💡' },
  { id: 'ventilador', nome: 'Ventilador de Teto',                potencia_w: 150,  icone: '🌀' },
  { id: 'bomba',      nome: "Bomba d'água",                      potencia_w: 750,  icone: '💧' },
  { id: 'forno',      nome: 'Forno Elétrico',                    potencia_w: 2000, icone: '🔥' },
  { id: 'secador',    nome: 'Secador de Cabelo',                 potencia_w: 2000, icone: '💨' },
];
