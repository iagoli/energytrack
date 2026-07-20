import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useAppliances } from './hooks/useAppliances';
import { useSettings } from './hooks/useSettings';
import { useTheme } from './hooks/useTheme';
import NavBar from './components/NavBar';
import Reveal from './components/Reveal';
import ApplianceForm from './components/ApplianceForm';
import Dashboard from './components/Dashboard';
import SolarSimulator from './components/SolarSimulator';
import ExportReport from './components/ExportReport';
import AuthScreen from './components/auth/AuthScreen';
import LoadingSpinner from './components/ui/LoadingSpinner';
import Footer from './components/Footer';
import { HeroArt, AppliancesArt, DashboardArt, SolarPanelArt, ReportArt } from './components/art/Art';

function Splash() {
  return (
    <div className="min-h-screen grid place-items-center bg-space-deep">
      <LoadingSpinner size="lg" className="text-apple-500" />
    </div>
  );
}

/* ---------------------- Página base (hero + arte) ---------------------- */
const TONE_CLASS = {
  blue: 'scene-blue',
  violet: 'scene-violet',
  green: 'scene-green',
};

function PageHero({ eyebrow, title, lead, art, reverse = false, tone = 'blue' }) {
  const toneClass = TONE_CLASS[tone] || 'scene-blue';
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <Reveal className={reverse ? 'lg:order-2' : 'lg:order-1'}>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-cloud-soft bg-white/[0.06] border border-surface-line px-4 py-1.5 rounded-full backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-apple-500 animate-pulse" />
              {eyebrow}
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.025em] leading-[1.05]">
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-cloud-soft leading-relaxed">{lead}</p>
          </Reveal>
          <Reveal delay={1} className={reverse ? 'lg:order-1' : 'lg:order-2'}>
            <div className={`relative rounded-none border border-white/[0.08] ${toneClass} p-6 sm:p-8 shadow-card overflow-hidden`}>
              <div className="apple-art is-visible">{art}</div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------------- Hero vertical (página inicial) ---------------------- */
function VerticalHero({ eyebrow, title, lead, art, tone = 'blue' }) {
  const toneClass = TONE_CLASS[tone] || 'scene-blue';
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-5 pt-28 pb-12 sm:pt-36 sm:pb-16 text-center">
        <Reveal
          as="span"
          className="inline-flex items-center gap-2 text-xs font-medium text-cloud-soft bg-white/[0.06] border border-surface-line px-4 py-1.5 rounded-full backdrop-blur"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-apple-500 animate-pulse" />
          {eyebrow}
        </Reveal>

        <Reveal
          as="h1"
          delay={1}
          className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.03em] leading-[1.04]"
        >
          {title}
        </Reveal>

        <Reveal
          as="p"
          delay={2}
          className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-cloud-soft leading-relaxed"
        >
          {lead}
        </Reveal>

        <Reveal delay={3} className="mt-12">
          <div className={`relative rounded-none border border-white/[0.08] ${toneClass} p-6 sm:p-8 shadow-card overflow-hidden`}>
            <div className="apple-art is-visible">{art}</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------- Páginas ----------------------------- */
function AppliancesPage({ appliances }) {
  return (
    <>
      <VerticalHero
        eyebrow="Passo 01 · Cadastro"
        title={<>Entenda o seu consumo de{' '}<span className="text-gradient">energia</span> em tempo real</>}
        lead="Cadastre seus aparelhos, veja o impacto na conta e simule quantos painéis solares você precisaria para economizar de verdade."
        art={<HeroArt className="w-full max-w-xl mx-auto" />}
        tone="blue"
      />
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <ApplianceForm
          userAppliances={appliances.items}
          onAdd={appliances.add}
          onUpdate={appliances.update}
          onRemove={appliances.remove}
        />
      </section>
    </>
  );
}

function DashboardPage({ appliances, settings, setTariff, setUf, setDistribuidora, onNavigate }) {
  return (
    <>
      <PageHero
        eyebrow="Passo 02 · Análise"
        title={<>Painel de <span className="text-gradient">consumo</span></>}
        lead="Veja o quanto cada aparelho pesa na conta, compare com a média nacional e receba recomendações personalizadas."
        art={<DashboardArt className="w-full max-w-xl mx-auto" />}
        reverse
        tone="violet"
      />
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <Dashboard
          userAppliances={appliances.items}
          tariff={settings.tariff}
          tariffSource={settings.tariffSource}
          setTariff={setTariff}
          uf={settings.uf}
          setUf={setUf}
          distribuidora={settings.distribuidora}
          setDistribuidora={setDistribuidora}
          onNavigate={onNavigate}
        />
      </section>
    </>
  );
}

function SolarPage({ appliances, settings, setSolarRegion, setCep, setLocation, onNavigate }) {
  return (
    <>
      <PageHero
        eyebrow="Passo 03 · Simulação"
        title={<>Energia <span className="text-gradient">solar</span></>}
        lead="Com base no seu consumo, simulamos o sistema fotovoltaico ideal, o investimento e o tempo de retorno."
        art={<SolarPanelArt className="w-full max-w-xl mx-auto" />}
        tone="green"
      />
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <SolarSimulator
          userAppliances={appliances.items}
          tariff={settings.tariff}
          solarRegion={settings.solarRegion}
          setSolarRegion={setSolarRegion}
          cep={settings.cep}
          setCep={setCep}
          location={settings.location}
          setLocation={setLocation}
          onNavigate={onNavigate}
        />
      </section>
    </>
  );
}

function ReportPage({ appliances, settings, onNavigate }) {
  return (
    <>
      <PageHero
        eyebrow="Passo 04 · Documento"
        title={<>Relatório <span className="text-gradient">mensal</span></>}
        lead="Gere um documento completo para imprimir ou salvar em PDF, com resumo, tabela de aparelhos e simulação solar."
        art={<ReportArt className="w-full max-w-xl mx-auto" />}
        reverse
        tone="blue"
      />
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <ExportReport
          userAppliances={appliances.items}
          tariff={settings.tariff}
          solarRegion={settings.solarRegion}
          onNavigate={onNavigate}
        />
      </section>
    </>
  );
}

/* ----------------------------- App ----------------------------- */
function MainApp() {
  const { user, logout } = useAuth();
  const appliances = useAppliances(true);
  const { settings, patch: patchSettings, loading: settingsLoading } = useSettings(true);
  const [route, setRoute] = useState('aparelhos');
  const { theme, toggle: toggleTheme } = useTheme();

  const setTariff = (v, source = 'manual') => patchSettings({ tariff: Number(v), tariffSource: source });
  const setUf = (v) => patchSettings({ uf: v });
  const setDistribuidora = (v) => patchSettings({ distribuidora: v });
  const setCep = (v) => patchSettings({ cep: v });
  const setLocation = (v) => patchSettings({ location: v });
  const setSolarRegion = (v) => patchSettings({ solarRegion: v });

  if (settingsLoading) return <Splash />;

  // As páginas são sempre renderizadas por completo — inclusive a PageHero com
  // a arte/ilustração — mesmo sem aparelhos cadastrados. Cada componente interno
  // (Dashboard, SolarSimulator, ExportReport) exibe seu próprio aviso de
  // "cadastre aparelhos" logo abaixo da hero, sem ficar cortado pela navbar.
  let page;
  switch (route) {
    case 'painel':
      page = (
        <DashboardPage
          appliances={appliances}
          settings={settings}
          setTariff={setTariff}
          setUf={setUf}
          setDistribuidora={setDistribuidora}
          onNavigate={setRoute}
        />
      );
      break;
    case 'solar':
      page = (
        <SolarPage
          appliances={appliances}
          settings={settings}
          setSolarRegion={setSolarRegion}
          setCep={setCep}
          setLocation={setLocation}
          onNavigate={setRoute}
        />
      );
      break;
    case 'relatorio':
      page = <ReportPage appliances={appliances} settings={settings} onNavigate={setRoute} />;
      break;
    default:
      page = <AppliancesPage appliances={appliances} />;
  }

  return (
    <div className="min-h-screen bg-space-deep text-cloud flex flex-col">
      <NavBar user={user} logout={logout} route={route} onNavigate={setRoute} theme={theme} onToggleTheme={toggleTheme} />
      <main className="flex-1">{page}</main>
      <Footer route={route} onNavigate={setRoute} user={user} />
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <AuthScreen />;
  return <MainApp />;
}
