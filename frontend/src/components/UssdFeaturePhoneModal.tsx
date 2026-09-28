import React, { useState } from 'react';
import {
  Phone,
  X,
  MessageSquare,
  Signal,
  Battery,
  WifiOff,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { FarmProfile, Language, WeatherData } from '../types';

interface UssdFeaturePhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: FarmProfile;
  weather: WeatherData;
  language: Language;
}

export const UssdFeaturePhoneModal: React.FC<UssdFeaturePhoneModalProps> = ({
  isOpen,
  onClose,
  farm,
  weather,
  language,
}) => {
  if (!isOpen) return null;

  const isRw = language === 'rw';

  // USSD Session State
  const [screenText, setScreenText] = useState<string>(
    isRw
      ? `AgriMind Rwanda (*844#)\n------------------\n1. Ikirere n'Imvura (${farm.district})\n2. Gusuzuma Indwara\n3. Ibiciro ku Masoko (RWF)\n4. Ifumbire n'Ingwa (Lime)\n5. Saba Agronome w'Umurenge\n\nAndika umubare:`
      : `AgriMind Rwanda (*844#)\n------------------\n1. Weather & Spray (${farm.district})\n2. Symptom Disease Checker\n3. Market Prices (RWF)\n4. Fertilizer & Lime Dose\n5. Request District Agronomist\n\nEnter option:`
  );

  const [inputVal, setInputVal] = useState<string>('');
  const [sessionActive, setSessionActive] = useState<boolean>(true);
  const [sessionStep, setSessionStep] = useState<string>('MAIN');

  const handleKeyPress = (num: string) => {
    setInputVal((prev) => prev + num);
  };

  const handleClear = () => {
    setInputVal('');
  };

  const handleSend = () => {
    const choice = inputVal.trim();
    setInputVal('');

    if (sessionStep === 'MAIN') {
      if (choice === '1') {
        // Weather
        setSessionStep('WEATHER');
        setScreenText(
          isRw
            ? `Ikirere i ${farm.district}:\nUbuhehere: ${weather.humidityPercentage}%\nAmahirwe y'imvura: ${weather.rainChance24h}%\n\nInama: ${weather.isRainExpectedNext24h ? 'Ntukuhire uyu munsi kubera imvura. Witera umuti.' : 'Kuhira bisanzwe mu gitondo.'}\n\n0. Subira inyuma`
            : `Weather in ${farm.district}:\nHumidity: ${weather.humidityPercentage}%\nRain chance: ${weather.rainChance24h}%\n\nAdvice: ${weather.isRainExpectedNext24h ? 'Do not irrigate today (Rain expected). Avoid foliar sprays.' : 'Safe to spray contact treatments.'}\n\n0. Back`
        );
      } else if (choice === '2') {
        // Symptoms
        setSessionStep('DISEASE_CROP');
        setScreenText(
          isRw
            ? `Hitamo Igihingwa cyawe:\n1. Inyanya (Tomatoes)\n2. Ibigori (Maize)\n3. Ibirayi (Irish Potatoes)\n4. Ibishyimbo (Beans)\n\n0. Subira inyuma`
            : `Select Your Crop:\n1. Tomatoes\n2. Maize\n3. Irish Potatoes\n4. Climbing Beans\n\n0. Back`
        );
      } else if (choice === '3') {
        // Market
        setSessionStep('MARKET');
        setScreenText(
          isRw
            ? `Ibiciro by'Umusaruro (RWF/kg):\n- Inyanya: 900 RWF (Kigali)\n- Ibirayi (Kinigi): 620 RWF (Musanze)\n- Ibigori byumye: 450 RWF (Nyagatare)\n- Ibishyimbo: 1,150 RWF\n\n0. Subira inyuma`
            : `Market Prices (RWF/kg):\n- Tomatoes: 900 RWF (Kigali)\n- Irish Potato: 620 RWF (Musanze)\n- Dry Maize: 450 RWF (Nyagatare)\n- Climbing Beans: 1,150 RWF\n\n0. Back`
        );
      } else if (choice === '4') {
        // Fertilizer
        setSessionStep('FERTILIZER');
        setScreenText(
          isRw
            ? `Ifumbire ya ${farm.crop} (${farm.district}):\n- Itera: DAP 50kg/ha\n- Gukura (amavi): Urea 35kg/ha\n- Ubutaka busharije: Ingwa 150kg/ha\n\n0. Subira inyuma`
            : `Fertilizer Guide for ${farm.crop} in ${farm.district}:\n- Basal: DAP 50kg/ha\n- Top-dressing: Urea 35kg/ha\n- Acidic soil: Travertine lime 150kg/ha\n\n0. Back`
        );
      } else if (choice === '5') {
        // Request Agronomist
        setSessionStep('AGRONOMIST_SENT');
        setScreenText(
          isRw
            ? `Ubusabe bwoherejwe!\nAgronome w'Umurenge azaguhamagara kuri ${farm.farmerPhone} mu masaha 2 ari imbere.\n\n0. Subira ahabanza`
            : `Request Received!\nThe Sector Agronomist will call your phone (${farm.farmerPhone}) within 2 hours.\n\n0. Back to Main Menu`
        );
      } else {
        setScreenText(
          isRw
            ? `Guhitamo kutari kwo. Andika 1-5 cyangwa 0:\n\n0. Subira ahabanza`
            : `Invalid option. Enter 1-5 or 0:\n\n0. Back`
        );
      }
    } else if (sessionStep === 'DISEASE_CROP') {
      if (choice === '1') {
        // Tomatoes symptoms
        setSessionStep('DISEASE_TOMATO');
        setScreenText(
          isRw
            ? `Inyanya - Ibyo ubona ku bibabi:\n1. Ibibara by'umukara bifite uruziga rw'umuhondo (Early Blight)\n2. Ibibabi biranyirirwa bigatutumba (Late Blight)\n3. Ibibabi bihinduka umuhondo bikifunga (TYLCV)\n\n0. Subira inyuma`
            : `Tomato Symptoms:\n1. Dark circular target spots on lower leaves (Early Blight)\n2. Water-soaked black patches (Late Blight)\n3. Leaves yellow & curl upward (TYLCV)\n\n0. Back`
        );
      } else if (choice === '2') {
        setSessionStep('DISEASE_MAIZE');
        setScreenText(
          isRw
            ? `Ibigori - Ibyo ubona:\n1. Uburere bw'imyobo mu mutima n'imyanda y'umuhondo (Nkongwa / Fall Armyworm)\n2. Ibibara by'ikinyugunyugu (Gray Leaf Spot)\n\n0. Subira inyuma`
            : `Maize Symptoms:\n1. Whorl chewed with sawdust frass (Fall Armyworm)\n2. Rectangular tan lesions (Gray Leaf Spot)\n\n0. Back`
        );
      } else if (choice === '0') {
        resetToMain();
      }
    } else if (sessionStep === 'DISEASE_TOMATO') {
      if (choice === '1') {
        setSessionStep('PRESCRIPTION');
        setScreenText(
          isRw
            ? `Early Blight y'Inyanya:\n1. Kura amashami yo hasi ari munsi ya 30cm\n2. Tera Mancozeb 80% WP cyangwa Kocide 2000 ku bibabi byumutse\n3. Witera umuti imvura yegereje\n\nSMS y'inama yoherejwe kuri telefoni yawe.`
            : `Early Blight Prescription:\n1. Prune lower leaves below 30cm\n2. Spray Mancozeb 80% WP or Kocide 2000 once leaves are dry\n3. Avoid spraying before rain\n\nFree SMS summary sent to your phone.`
        );
      } else {
        resetToMain();
      }
    } else {
      resetToMain();
    }
  };

  const resetToMain = () => {
    setSessionStep('MAIN');
    setScreenText(
      isRw
        ? `AgriMind Rwanda (*844#)\n------------------\n1. Ikirere n'Imvura (${farm.district})\n2. Gusuzuma Indwara\n3. Ibiciro ku Masoko (RWF)\n4. Ifumbire n'Ingwa (Lime)\n5. Saba Agronome w'Umurenge\n\nAndika umubare:`
        : `AgriMind Rwanda (*844#)\n------------------\n1. Weather & Spray (${farm.district})\n2. Symptom Disease Checker\n3. Market Prices (RWF)\n4. Fertilizer & Lime Dose\n5. Request District Agronomist\n\nEnter option:`
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #18221c 0%, #0d1510 100%)',
          borderRadius: 36,
          width: '100%',
          maxWidth: 380,
          border: '4px solid #2d3e33',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(16, 185, 129, 0.2)',
          padding: '24px 20px',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* Feature Phone Speaker & Brand */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ width: 44, height: 4, background: '#374151', borderRadius: 2, margin: '0 auto 8px' }} />
          <div style={{ fontSize: '0.72rem', letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700 }}>
            AgriMind 2G • USSD Offline System
          </div>
        </div>

        {/* Phone LCD Screen */}
        <div
          style={{
            background: '#1a3324',
            borderRadius: 12,
            border: '3px solid #10b981',
            padding: 14,
            boxShadow: 'inset 0 0 16px rgba(0, 0, 0, 0.6)',
            marginBottom: 16,
          }}
        >
          {/* LCD Status Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(16, 185, 129, 0.3)', paddingBottom: 6, marginBottom: 8, fontSize: '0.68rem', color: '#6ee7b7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Signal size={12} />
              <span>MTN RW / Airtel</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <WifiOff size={11} />
              <span>Offline (2G)</span>
              <Battery size={12} />
            </div>
          </div>

          {/* Screen Text */}
          <pre
            style={{
              fontFamily: 'Courier, monospace',
              fontSize: '0.75rem',
              color: '#a7f3d0',
              lineHeight: 1.45,
              whiteSpace: 'pre-wrap',
              minHeight: 165,
              margin: 0,
            }}
          >
            {screenText}
          </pre>

          {/* User Input Bar */}
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', borderTop: '1px solid rgba(16, 185, 129, 0.3)', paddingTop: 6 }}>
            <span style={{ color: '#34d399', fontWeight: 700, marginRight: 6 }}>&gt;</span>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', minHeight: 18 }}>
              {inputVal || <span style={{ color: 'rgba(255,255,255,0.3)' }}>_</span>}
            </span>
          </div>
        </div>

        {/* Action Call & Reset Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <button
            onClick={handleSend}
            style={{
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Phone size={14} /> Send / Ohereza
          </button>

          <button
            onClick={resetToMain}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <RotateCcw size={14} /> End / Ahabanza
          </button>
        </div>

        {/* Feature Phone Keypad Buttons (0-9, *, #) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            padding: '4px',
          }}
        >
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
            <button
              key={k}
              onClick={() => handleKeyPress(k)}
              style={{
                background: 'linear-gradient(180deg, #27372d 0%, #1c2720 100%)',
                border: '1px solid #3d5244',
                color: '#e5e7eb',
                borderRadius: 8,
                padding: '12px 6px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)',
                transition: 'all 0.1s',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(1px)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Clear Button */}
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <button
            onClick={handleClear}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: '0.74rem',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Clear input
          </button>
        </div>

        {/* Explanation Footer */}
        <div style={{ marginTop: 12, borderTop: '1px solid #2d3e33', paddingTop: 10, textAlign: 'center', fontSize: '0.72rem', color: '#9ca3af' }}>
          💡 <strong>Inclusion First:</strong> Serves the 70%+ of Rwandan smallholders without internet via zero-rated GSM USSD gateway.
        </div>
      </div>
    </div>
  );
};
