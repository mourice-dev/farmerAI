import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sprout,
  Droplets,
  FlaskConical,
  ShieldAlert,
  Clock,
  ChevronRight,
  Sun,
  CloudRain,
  Flame,
} from 'lucide-react';
import { CropType, FarmProfile, Language, RwandaDistrict, WeatherData } from '../types';

interface SeasonalAgroPlannerProps {
  farm: FarmProfile;
  weather: WeatherData;
  language: Language;
}

interface SeasonStage {
  weekRange: string;
  stageName: string;
  stageNameRw: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  description: string;
  descriptionRw: string;
  rabActionPoints: string[];
  rabActionPointsRw: string[];
  fungalRisk: 'LOW' | 'MODERATE' | 'HIGH';
  fertilizerRecommendation: string;
}

export const SeasonalAgroPlanner: React.FC<SeasonalAgroPlannerProps> = ({
  farm,
  weather,
  language,
}) => {
  const isRw = language === 'rw';
  const [selectedSeason, setSelectedSeason] = useState<'A' | 'B' | 'C'>('A');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    'step-0': true,
    'step-1': true,
  });

  const toggleStep = (key: string) => {
    setCompletedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const stagesSeasonA: SeasonStage[] = [
    {
      weekRange: 'Week 1 - 2 (Early Sept)',
      stageName: 'Land Tillage & Travertine Liming',
      stageNameRw: 'Guhirika Ubutaka & Gushyiramo Ingwa (Chaux)',
      status: 'COMPLETED',
      description: 'Deep tillage to 25cm. Apply agricultural lime (travertine) to correct acidic soil pH (< 5.5 common in Muhanga & Northern Province).',
      descriptionRw: 'Hinga byimbitse santimetero 25. Shyiramo ingwa (chaux) toni 2.5/ha kugira ngo ubutaka busharije bugabanuke.',
      rabActionPoints: [
        'Apply 150-200 kg travertine per hectare 2 weeks before sowing',
        'Incorporate well-decomposed farmyard manure (10 tons/ha)',
        'Dig contour drainage ditches (imikoki) on hill slopes to avoid soil erosion',
      ],
      rabActionPointsRw: [
        'Shyiramo ifumbire y\'imborera iboze neza mbere yo gutera',
        'Cukura imikoki irwanya isuri ku misozi ihanamye',
      ],
      fungalRisk: 'LOW',
      fertilizerRecommendation: 'Travertine lime + Organic manure incorporation',
    },
    {
      weekRange: 'Week 3 - 4 (Late Sept - Early Oct)',
      stageName: 'Basal Fertilizer & Certified Sowing',
      stageNameRw: 'Gutera Imbuto Zujuje Ubuziranenge & DAP',
      status: 'IN_PROGRESS',
      description: 'Sow certified high-yield hybrid seed (RAB certified). Apply basal DAP or NPK at planting depth beneath seed.',
      descriptionRw: 'Tera imbuto zujuje ubuziranenge (RAB certified). Shyiramo ifumbire ya DAP mu mwobo hasi y\'imbuto.',
      rabActionPoints: [
        'Maize spacing: 75cm between rows, 25cm between hills (1 seed/hill)',
        'Potato spacing: 75cm ridges, 30cm spacing (RAB Kinigi seed)',
        'Apply 50 kg DAP / ha directly in furrow, covering lightly with soil before seed placement',
      ],
      rabActionPointsRw: [
        'Ibigori: Intera ya 75cm hagati y\'imirongo na 25cm hagati y\'ibiti',
        'Shyiramo DAP 50kg/ha mu mwobo mbere yo gushyiramo imbuto',
      ],
      fungalRisk: 'LOW',
      fertilizerRecommendation: 'DAP 50 kg/ha or NPK 17-17-17 (75 kg/ha)',
    },
    {
      weekRange: 'Week 5 - 7 (Late Oct - Nov)',
      stageName: 'First Weeding & Urea Top-Dressing',
      stageNameRw: 'Kubagara bwa mbere & Gushyiramo Urea',
      status: 'UPCOMING',
      description: 'Eliminate weed competition when plants reach knee-height (30-40cm). Apply first split of Urea top-dressing when soil is damp.',
      descriptionRw: 'Bagara ucyurira ibyatsi igihe ibihingwa bigeze mu mavi. Shyiramo Urea ubutaka buhehereye.',
      rabActionPoints: [
        'First mechanical weeding before weeds produce seeds',
        'Side-dress Urea (30 kg/ha) 5cm away from plant stem; do not let granules touch leaves',
        'Scout weekly for Fall Armyworm whorl chewing or Early Blight target spots',
      ],
      rabActionPointsRw: [
        'Bagara mbere y\'uko ibyatsi byera imbuto',
        'Shyiramo Urea ku ruhande rw\'igiti (5cm) ku butaka buhehereye',
        'Genzura niba nta Nkongwa idasanzwe mu mutima w\'ibigori',
      ],
      fungalRisk: 'MODERATE',
      fertilizerRecommendation: 'Urea (46% N) at 30-40 kg/ha side-dressed',
    },
    {
      weekRange: 'Week 8 - 12 (Dec - Early Jan)',
      stageName: 'Earthing Up & Fungal Spore Defense Window',
      stageNameRw: 'Kusasira / Guhingira & Kwirinda Indwara z\'Ibibabi',
      status: 'UPCOMING',
      description: 'Heavy rainfall increases humidity (>80%). Elevated risk of Late Blight and Anthracnose. Hill up ridges.',
      descriptionRw: 'Imvura nyinshi izamura ubuhehere. Ibyago bya Late Blight biriyongera. Hingira ibirayi neza.',
      rabActionPoints: [
        'Hill up soil well over potato ridges to prevent tuber greening and spore wash-down',
        'Preventative foliar spray of Mancozeb 80% WP during 24h clear weather windows',
        'Ensure terrace drainage furrows are unblocked after heavy rains',
      ],
      rabActionPointsRw: [
        'Hingira ibirayi kugira ngo ibijumba biticwa n\'izuba cyangwa imvura',
        'Tera Mancozeb mu gihe ikirere gituje kitarimo imvura',
      ],
      fungalRisk: 'HIGH',
      fertilizerRecommendation: 'Potassium foliar boost (K-rich) for fruit/tuber expansion',
    },
    {
      weekRange: 'Week 13 - 16 (Late Jan - Feb)',
      stageName: 'Maturity, Harvest & Post-Harvest Curing',
      stageNameRw: 'Gusarura, Kuanika & Guhumbika',
      status: 'UPCOMING',
      description: 'Harvest on dry mornings. Cure produce properly to achieve Grade A standard and minimize post-harvest mold.',
      descriptionRw: 'Sarura mu gitondo cy\'umucyo. Anika neza kugira ngo ugere kuri Grade A ku isoko.',
      rabActionPoints: [
        'Dry maize down to 13.5% moisture content to prevent aflatoxin contamination',
        'Cure Irish potatoes in shade for 7-10 days to toughen skins before bagging',
        'Grade into Grade A (high commercial price) and Grade B',
      ],
      rabActionPointsRw: [
        'Anika ibigori bigere ku buhehere bwa 13.5% kwirinda aflatoxin',
        'Kanimba ibirayi mu gicucu iminsi 10 uruhu rukomere mbere yo gupakira',
      ],
      fungalRisk: 'LOW',
      fertilizerRecommendation: 'Zero fertilizer. Prepare land immediately for Season B.',
    },
  ];

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              MODULE 9 • AGRO-SEASONAL CALENDAR
            </span>
            <h2 style={{ fontSize: '1.4rem' }}>
              {isRw ? 'Iteganyamurimo ry\'Igihembwe cy\'Ihinga (Seasons A, B, C)' : 'Rwandan Agro-Ecological Season Planner'}
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem' }}>
            {isRw
              ? 'Gahunda y\'ubuhinzi bukurikije ibihembwe by\'u Rwanda (Urugaryi, Itumba, Icyi) n\'amabwiriza y\'ubumenyi ya RAB.'
              : 'Official MINAGRI / RAB agricultural calendar mapping week-by-week land prep, liming, fertilizer splits, and disease vigilance windows.'}
          </p>
        </div>

        {/* Current Active Season Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255, 255, 255, 0.12)', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
          <Clock size={15} color="#ffffff" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
            {isRw ? 'Igihembwe kiriho: Season A (Urugaryi)' : 'Active: Season A (Urugaryi)'}
          </span>
        </div>
      </div>

      {/* Season Selection Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          {
            id: 'A',
            title: 'Season A (Urugaryi)',
            sub: 'Sept – Feb • Major Staple Season',
            crops: 'Maize, Irish Potatoes, Climbing Beans',
            active: true,
            icon: Sprout,
          },
          {
            id: 'B',
            title: 'Season B (Itumba)',
            sub: 'March – June • Heavy Rain Season',
            crops: 'Beans, Sorghum, High Blight Vigilance',
            active: false,
            icon: CloudRain,
          },
          {
            id: 'C',
            title: 'Season C (Icyi)',
            sub: 'July – Sept • Marshland / Ibishanga',
            crops: 'Tomatoes, Cabbage, Horticulture Drip',
            active: false,
            icon: Sun,
          },
        ].map((s) => {
          const Icon = s.icon;
          const isSelected = selectedSeason === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSeason(s.id as any)}
              style={{
                background: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.25)',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: isSelected ? '#ffffff' : '#fff' }}>
                  {s.title}
                </span>
                <Icon size={16} color={isSelected ? '#ffffff' : 'var(--text-muted)'} />
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--accent-gold)', marginBottom: 4 }}>
                {s.sub}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {s.crops}
              </div>
            </button>
          );
        })}
      </div>

      {/* Synchronized Agro-Meteorological Advisory Banner */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05) 0%, rgba(14, 165, 233, 0.04) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Droplets size={20} color="#ffffff" />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
              {isRw
                ? `Iteganyagihe cy'i ${farm.district}: Ubuhehere bw'ubutaka ni ${weather.soilMoisturePercentage}%, Imvura iri ku kigereranyo cya ${weather.rainChance24h}%`
                : `District ${farm.district} Sync: Soil Moisture ${weather.soilMoisturePercentage}%, Rain chance ${weather.rainChance24h}%`}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {isRw
                ? 'Ikirere cyiza cyo gushyira ifumbire ya DAP mu buhinzi bwa Season A mbere y\'uko imvura yiyongera.'
                : 'Optimal conditions for planting & basal fertilizer placement. Ensure seed is planted before heavy storm downpours.'}
            </div>
          </div>
        </div>

        <span className="badge badge-risk-low" style={{ background: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}>
          Meteo Rwanda Live Link
        </span>
      </div>

      {/* Week-by-Week Action Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {stagesSeasonA.map((stage, idx) => {
          const stepKey = `step-${idx}`;
          const isDone = !!completedSteps[stepKey];
          return (
            <div
              key={idx}
              style={{
                background: isDone ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.3)',
                border: isDone ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 18px',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    onClick={() => toggleStep(stepKey)}
                    style={{
                      background: isDone ? '#ffffff' : 'transparent',
                      border: isDone ? 'none' : '2px solid var(--text-muted)',
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      flexShrink: 0,
                    }}
                    title="Toggle Task Completion"
                  >
                    {isDone && <CheckCircle2 size={15} />}
                  </button>

                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                      {stage.weekRange}
                    </div>
                    <h3 style={{ fontSize: '1.05rem', color: isDone ? '#9ca3af' : '#fff', textDecoration: isDone ? 'line-through' : 'none' }}>
                      {isRw ? stage.stageNameRw : stage.stageName}
                    </h3>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span
                    className={`badge ${
                      stage.fungalRisk === 'HIGH'
                        ? 'badge-risk-critical'
                        : stage.fungalRisk === 'MODERATE'
                        ? 'badge-risk-moderate'
                        : 'badge-risk-low'
                    }`}
                  >
                    <ShieldAlert size={12} /> Fungal Risk: {stage.fungalRisk}
                  </span>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: stage.status === 'COMPLETED' ? 'rgba(255, 255, 255, 0.12)' : stage.status === 'IN_PROGRESS' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255,255,255,0.08)',
                      color: stage.status === 'COMPLETED' ? '#ffffff' : stage.status === 'IN_PROGRESS' ? '#ffffff' : 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    {stage.status}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 12, paddingLeft: 32 }}>
                {isRw ? stage.descriptionRw : stage.description}
              </p>

              {/* Action Points Box */}
              <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginLeft: 32, marginBottom: 10 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', marginBottom: 4 }}>
                  {isRw ? 'Amabwiriza y\'ingenzi ya RAB:' : 'Key RAB Scientific Action Checklist:'}
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                  {(isRw ? stage.rabActionPointsRw : stage.rabActionPoints).map((pt, pIdx) => (
                    <li key={pIdx}>{pt}</li>
                  ))}
                </ul>
              </div>

              {/* Fertilizer Recommendation Tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: 32 }}>
                <FlaskConical size={14} color="#ffffff" />
                <span>
                  <strong>Target Nutrient:</strong> {stage.fertilizerRecommendation}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
