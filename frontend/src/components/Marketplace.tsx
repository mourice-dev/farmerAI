import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Store,
  Calendar,
  Phone,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { ForwardContractListing, Language, MarketPriceItem, RwandaDistrict } from '../types';

interface MarketplaceProps {
  prices: MarketPriceItem[];
  contracts: ForwardContractListing[];
  language: Language;
  onAddContract: (contract: ForwardContractListing) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  prices,
  contracts,
  language,
  onAddContract,
}) => {
  const isRw = language === 'rw';

  const [showListingModal, setShowListingModal] = useState<boolean>(false);
  const [crop, setCrop] = useState<string>('Tomatoes');
  const [variety, setVariety] = useState<string>('Anna F1');
  const [quantity, setQuantity] = useState<number>(500);
  const [harvestDate, setHarvestDate] = useState<string>('2026-10-18');
  const [priceRwf, setPriceRwf] = useState<number>(850);
  const [farmerPhone, setFarmerPhone] = useState<string>('+250 788 123 456');
  const [district, setDistrict] = useState<RwandaDistrict>('Muhanga');

  const handlePostListing = (e: React.FormEvent) => {
    e.preventDefault();
    const newListing: ForwardContractListing = {
      id: `fwd-${Date.now()}`,
      farmerName: 'Jean-Pierre Habimana',
      district,
      crop: crop as any,
      variety,
      availableKg: quantity,
      harvestDate,
      askingPricePerKgRwf: priceRwf,
      contactNumber: farmerPhone,
      isVerifiedSmallholder: true,
    };

    onAddContract(newListing);
    setShowListingModal(false);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 16,
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
            }}>
              MODULE 5
            </span>
            <h2 style={{ fontSize: '1.4rem' }}>
              {isRw ? 'Amasoko n\'Ibiciro Byihuse (Market AI & Forward Marketplace)' : 'Live Market Intelligence & Forward Contracts'}
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem' }}>
            {isRw
              ? 'Ibiciro biri ku masoko ya Kigali na Musanze, no guhuza abahinzi n\'abaguzi mbere y\'isarura.'
              : 'Real-time wholesale market ticker (Kimironko, Nyabugogo) and pre-harvest forward sales to eliminate exploitative middlemen.'}
          </p>
        </div>

        <button
          onClick={() => setShowListingModal(true)}
          className="btn btn-primary btn-sm"
          style={{ gap: 6 }}
        >
          <PlusCircle size={14} />
          <span>{isRw ? 'Tangaza Umusaruro Wenda Kwera' : 'List Upcoming Harvest'}</span>
        </button>
      </div>

      {/* Live Market Price Ticker Cards */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>
          {isRw ? 'Ibiciro by\'Uyu Munsi ku Masoko Makuru (Live Kigali & District Ticker):' : 'Today\'s Live Market Price Ticker:'}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 12,
        }}>
          {prices.map((item, idx) => {
            const isUp = item.trend === 'up';
            const isDown = item.trend === 'down';
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.marketName}</span>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: isUp ? '#ffffff' : isDown ? '#ffffff' : 'var(--text-muted)',
                    }}>
                      {isUp && <TrendingUp size={12} />}
                      {isDown && <TrendingDown size={12} />}
                      {!isUp && !isDown && <Minus size={12} />}
                      {isUp ? '+12%' : isDown ? '-6%' : 'Stable'}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.92rem', color: '#fff', marginBottom: 2 }}>{item.commodity}</h4>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.variety}</div>
                </div>

                <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                    {item.pricePerKgRwf} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>RWF/kg</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{item.lastUpdated}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forward Contract Listings / Pre-Order Board */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>
          {isRw ? 'Amasezerano yo Kugura mbere y\'Isarura (Farm-to-Fork Forward Pre-Orders):' : 'Pre-Harvest Forward Bookings (Direct to Restaurants & Wholesalers):'}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: 14,
        }}>
          {contracts.map((listing) => (
            <div
              key={listing.id}
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {listing.district} District
                    </span>
                    <h4 style={{ fontSize: '1.05rem', color: '#fff' }}>
                      {listing.crop} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({listing.variety})</span>
                    </h4>
                  </div>
                  <span className="badge badge-risk-low" style={{ background: 'rgba(255, 255, 255, 0.12)' }}>
                    <ShieldCheck size={12} />
                    Verified Farmer
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '10px 0', background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 6 }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Available Quantity</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{listing.availableKg} kg</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ready Date</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{listing.harvestDate}</div>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 10,
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Asking Price</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    {listing.askingPricePerKgRwf} RWF/kg
                  </div>
                </div>

                <a
                  href={`tel:${listing.contactNumber}`}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: 6 }}
                >
                  <Phone size={13} color="var(--primary)" />
                  <span>Call Farmer</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Listing Modal */}
      {showListingModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20,
        }}>
          <div className="glass-panel" style={{ maxWidth: 500, width: '100%', padding: 24 }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 6 }}>
              {isRw ? 'Tangaza Umusaruro Witegura Gusarura' : 'List Upcoming Harvest for Pre-Order'}
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: 16 }}>
              {isRw
                ? 'Shyira umusaruro wawe ku isoko mbere y\'uko wera, amatsinda n\'amahoteli abe yagusaba mbere.'
                : 'Connect directly with buyers and restaurants before harvest to secure guaranteed pricing.'}
            </p>

            <form onSubmit={handlePostListing} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Crop</label>
                  <select value={crop} onChange={(e) => setCrop(e.target.value)}>
                    <option value="Tomatoes">Tomatoes</option>
                    <option value="Irish Potatoes">Irish Potatoes</option>
                    <option value="Maize">Maize</option>
                    <option value="Climbing Beans">Climbing Beans</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Variety</label>
                  <input type="text" value={variety} onChange={(e) => setVariety(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Quantity (kg)</label>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Expected Harvest Date</label>
                  <input type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Asking Price (RWF/kg)</label>
                  <input type="number" value={priceRwf} onChange={(e) => setPriceRwf(parseInt(e.target.value))} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Contact Phone</label>
                  <input type="text" value={farmerPhone} onChange={(e) => setFarmerPhone(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowListingModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Publish Harvest Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
