import {
  CO2_EMISSION_FACTOR,
  PANEL_POWER_W,
  PANEL_COST_BRL,
  PANEL_EFFICIENCY,
  SOLAR_IRRADIATION,
} from '../constants';

// Consumo mensal de UMA unidade: kWh = (P_watts × h_dia × dias_mes) / 1000
export function calcKwh(potencia_w, horas_dia, dias_mes) {
  return (potencia_w * horas_dia * dias_mes) / 1000;
}

// Consumo mensal de um item já considerando quantidade (default 1).
export function calcItemKwh(item) {
  const qty = Number(item.quantidade) || 1;
  return calcKwh(item.potencia_w, item.horas_dia, item.dias_mes) * qty;
}

// Custo em R$: custo = kWh × tarifa
export function calcCost(kwh, tariff) {
  return kwh * tariff;
}

// Emissão de CO₂ em kg: CO₂ = kWh × fator_emissão (0,0839 kgCO₂/kWh — MCTI/SEEG)
export function calcCO2(kwh) {
  return kwh * CO2_EMISSION_FACTOR;
}

// Totais consolidados da lista de aparelhos do usuário (multiplica por quantidade).
export function calcTotals(userAppliances, tariff) {
  return userAppliances.reduce(
    (acc, item) => {
      const kwh = calcItemKwh(item);
      acc.totalKwh  += kwh;
      acc.totalCost += calcCost(kwh, tariff);
      acc.totalCO2  += calcCO2(kwh);
      return acc;
    },
    { totalKwh: 0, totalCost: 0, totalCO2: 0 }
  );
}

// Número de painéis necessários para cobrir o consumo mensal
// Geração diária por painel = (P_W / 1000) × irradiação × eficiência
// Painéis = ceil(consumo_diário_kWh / geração_diária_por_painel)
export function calcSolarPanelsFromIrradiation(monthlyKwh, irradiation) {
  const dailyKwh       = monthlyKwh / 30;
  const kwhPerPanelDay = (PANEL_POWER_W / 1000) * irradiation * PANEL_EFFICIENCY;
  return Math.max(1, Math.ceil(dailyKwh / kwhPerPanelDay));
}

export function calcSolarPanels(monthlyKwh, region) {
  const irradiation = SOLAR_IRRADIATION[region]?.value ?? 4.8;
  return calcSolarPanelsFromIrradiation(monthlyKwh, irradiation);
}

// Payback em meses: custo_total_instalação / economia_mensal
export function calcPaybackMonths(numPanels, monthlySavings) {
  if (monthlySavings <= 0) return null;
  return (numPanels * PANEL_COST_BRL) / monthlySavings;
}

// Recomendações personalizadas ordenadas pelo maior potencial de economia (kWh)
export function generateRecommendations(userAppliances, tariff) {
  const recs = [];
  const find = (id) => userAppliances.find((a) => a.applianceId === id);

  const chuveiro = find('chuveiro');
  if (chuveiro) {
    const qty = Number(chuveiro.quantidade) || 1;
    const kwhAtual = calcKwh(chuveiro.potencia_w, chuveiro.horas_dia, chuveiro.dias_mes) * qty;

    // > 15 min/dia (0,25 h) é considerado uso elevado para chuveiro elétrico
    if (chuveiro.horas_dia > 0.25) {
      const kwhReduzido = calcKwh(chuveiro.potencia_w, Math.max(0.1, chuveiro.horas_dia - 0.2), chuveiro.dias_mes) * qty;
      recs.push({
        id: 'chuveiro_tempo',
        titulo: 'Reduza o tempo de banho',
        descricao: `Seu chuveiro é usado ${(chuveiro.horas_dia * 60).toFixed(0)} min/dia. Reduzir em 12 minutos economiza ${(kwhAtual - kwhReduzido).toFixed(1)} kWh/mês (≈ R$ ${calcCost(kwhAtual - kwhReduzido, tariff).toFixed(2)}).`,
        economiaKwh: kwhAtual - kwhReduzido,
        icone: '🚿',
      });
    }

    recs.push({
      id: 'aquecedor_solar',
      titulo: 'Considere aquecedor solar de água',
      descricao: `Substituir o chuveiro elétrico por um sistema solar elimina ~${kwhAtual.toFixed(0)} kWh/mês (R$ ${calcCost(kwhAtual, tariff).toFixed(2)}/mês). O payback costuma ser de 2–4 anos.`,
      economiaKwh: kwhAtual,
      icone: '☀️',
    });
  }

  const ac = find('ac');
  if (ac) {
    const qty = Number(ac.quantidade) || 1;
    const kwhAc = calcKwh(ac.potencia_w, ac.horas_dia, ac.dias_mes) * qty;

    if (ac.horas_dia > 8) {
      const economia = calcKwh(ac.potencia_w, ac.horas_dia - 2, ac.dias_mes) * qty;
      recs.push({
        id: 'ac_horas',
        titulo: 'Reduza o uso do ar-condicionado',
        descricao: `Com ${ac.horas_dia}h/dia, o AC é um dos maiores consumidores. Reduzir 2h/dia economiza ${(kwhAc - economia).toFixed(1)} kWh/mês.`,
        economiaKwh: kwhAc - economia,
        icone: '❄️',
      });
    }

    recs.push({
      id: 'ac_temperatura',
      titulo: 'Ajuste o AC para 23°C e limpe os filtros',
      descricao: 'Cada grau abaixo de 23°C aumenta o consumo em ~5%. Filtros sujos reduzem a eficiência em até 15%. Limpe mensalmente.',
      economiaKwh: kwhAc * 0.10,
      icone: '🌡️',
    });
  }

  const forno = find('forno');
  if (forno) {
    const kwhForno = calcItemKwh(forno);
    recs.push({
      id: 'forno_microondas',
      titulo: 'Prefira o micro-ondas ao forno elétrico',
      descricao: 'O micro-ondas consome até 5× menos energia que o forno para reaquecimento. Reserve o forno para preparações que realmente exigem calor seco.',
      economiaKwh: kwhForno * 0.35,
      icone: '🍽️',
    });
  }

  const lavadora = find('lavadora');
  if (lavadora) {
    const kwhLava = calcItemKwh(lavadora);
    recs.push({
      id: 'lavadora_cheia',
      titulo: 'Use a máquina de lavar sempre cheia',
      descricao: 'Lavar com carga incompleta desperdiça até 30% de energia e água. Acumule roupas e faça menos ciclos por mês.',
      economiaKwh: kwhLava * 0.20,
      icone: '🌊',
    });
  }

  // Recomendação geral sempre presente
  const totalKwh = userAppliances.reduce((s, a) => s + calcItemKwh(a), 0);
  recs.push({
    id: 'standby',
    titulo: 'Elimine o consumo fantasma (standby)',
    descricao: 'Aparelhos em modo standby consomem até 10% da sua conta. Use filtros de linha com interruptor e desligue aparelhos que não estão em uso.',
    economiaKwh: totalKwh * 0.06,
    icone: '🔌',
  });

  return recs.sort((a, b) => b.economiaKwh - a.economiaKwh);
}
