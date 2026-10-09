
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, CheckCircle, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  plate_number: string;
  status: string;
  company_id: number;
}

interface VehicleSelectorProps {
  companyId: number;
  currentVehicleId?: number | null;
  driverName: string;
  language: 'nl' | 'fr';
  onVehicleSelected: (vehicleId: number) => void;
}

export default function VehicleSelector({
  companyId,
  currentVehicleId,
  driverName,
  language,
  onVehicleSelected,
}: VehicleSelectorProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(currentVehicleId || null);
  const [saving, setSaving] = useState(false);

  const labels = {
    nl: {
      title: 'Selecteer uw voertuig',
      subtitle: 'Kies het voertuig waarmee u vandaag rijdt',
      confirm: 'Bevestigen',
      loading: 'Voertuigen laden...',
      noVehicles: 'Geen voertuigen beschikbaar',
      greeting: `Welkom, ${driverName}!`,
    },
    fr: {
      title: 'Sélectionnez votre véhicule',
      subtitle: "Choisissez le véhicule avec lequel vous conduisez aujourd'hui",
      confirm: 'Confirmer',
      loading: 'Chargement des véhicules...',
      noVehicles: 'Aucun véhicule disponible',
      greeting: `Bienvenue, ${driverName}!`,
    },
  };

  const t = labels[language];

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await api.get<Vehicle[]>(`/vehicles?company_id=${companyId}`);
        const active = (data || []).filter((v) => v.status === 'active');
        setVehicles(active);
        // If only one vehicle, auto-select it
        if (active.length === 1) {
          setSelectedId(active[0].id);
        }
      } catch (error) {
        console.error("Operation failed");
        toast.error(language === 'nl' ? 'Fout bij laden voertuigen' : 'Erreur lors du chargement des véhicules');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [companyId, language]);

  const handleConfirm = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await api.put('/drivers/me', { current_vehicle_id: selectedId });
      onVehicleSelected(selectedId);
    } catch (error) {
      console.error("Operation failed");
      // Even if save fails, proceed with selection
      onVehicleSelected(selectedId);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-950 via-amber-950 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
          <p className="text-amber-200 text-sm">{t.loading}</p>
        </div>
      </div>
    );
  }

  // If only one vehicle, skip selector
  if (vehicles.length <= 1) {
    if (vehicles.length === 1 && !currentVehicleId) {
      onVehicleSelected(vehicles[0].id);
    }
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-950 via-amber-950 to-slate-900 p-4"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-amber-500/40"
          >
            <Car className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-black text-white mb-1">{t.greeting}</h2>
          <h3 className="text-lg font-bold text-amber-300 mb-1">{t.title}</h3>
          <p className="text-sm text-slate-400">{t.subtitle}</p>
        </motion.div>

        {/* Vehicle List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-1"
        >
          {vehicles.map((vehicle, index) => (
            <motion.button
              key={vehicle.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedId(vehicle.id)}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${
                selectedId === vehicle.id
                  ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                selectedId === vehicle.id
                  ? 'bg-amber-400/30'
                  : 'bg-white/10'
              }`}>
                <Car className={`w-6 h-6 ${selectedId === vehicle.id ? 'text-amber-300' : 'text-slate-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-base truncate ${selectedId === vehicle.id ? 'text-amber-200' : 'text-white'}`}>
                  {vehicle.brand} {vehicle.model}
                </p>
                <p className={`text-sm font-mono ${selectedId === vehicle.id ? 'text-amber-300' : 'text-slate-400'}`}>
                  {vehicle.plate_number}
                </p>
              </div>
              <AnimatePresence>
                {selectedId === vehicle.id && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <CheckCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </motion.div>

        {/* Confirm Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleConfirm}
            disabled={!selectedId || saving}
            className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-2xl shadow-amber-500/30 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <ChevronRight className="w-5 h-5 mr-2" />
            )}
            {t.confirm}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
