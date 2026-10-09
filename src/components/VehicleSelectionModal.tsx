
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import type { AppLanguage } from '@/contexts/LanguageContext';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  plate_number: string;
  status: string;
}

interface VehicleData {
  vehicles: Vehicle[];
  current_vehicle_id: number | null;
  driver_id: number;
}

interface VehicleSelectionModalProps {
  language: AppLanguage;
  onVehicleSelected: (vehicleId: number) => void;
}

export default function VehicleSelectionModal({
  language,
  onVehicleSelected,
}: VehicleSelectionModalProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const labels = {
    nl: {
      title: 'Selecteer uw voertuig',
      subtitle: 'Kies het voertuig waarmee u vandaag rijdt',
      confirm: 'Bevestigen',
      noVehicles: 'Geen voertuigen beschikbaar',
      saveError: 'Voertuig opslaan mislukt',
    },
    fr: {
      title: 'Sélectionnez votre véhicule',
      subtitle: "Choisissez le véhicule avec lequel vous conduisez aujourd'hui",
      confirm: 'Confirmer',
      noVehicles: 'Aucun véhicule disponible',
      saveError: 'Échec de la sauvegarde du véhicule',
    },
    ar: {
      title: 'اختر مركبتك',
      subtitle: 'اختر المركبة التي ستقودها اليوم',
      confirm: 'تأكيد',
      noVehicles: 'لا توجد مركبات متاحة',
      saveError: 'فشل حفظ المركبة',
    },
  } as const;

  const t = labels[language];

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await api.get<VehicleData>('/drivers/vehicles');
        setVehicles(data.vehicles);

        if (data.vehicles.length === 1) {
          setSelectedVehicleId(data.vehicles[0].id);
        } else if (data.current_vehicle_id) {
          setSelectedVehicleId(data.current_vehicle_id);
        }
      } catch (error) {
        console.error("Operation failed");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleConfirm = async () => {
    if (!selectedVehicleId) return;

    setSaving(true);
    try {
      await api.put('/drivers/vehicles', { vehicle_id: selectedVehicleId });
      onVehicleSelected(selectedVehicleId);
    } catch (error) {
      toast.error(t.saveError);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full max-w-lg"
      >
        <div
          className="w-full bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl flex flex-col"
          style={{
            maxHeight: 'calc(100dvh - 60px)',
            paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
          }}
        >
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>

          <div className="px-6 pt-3 pb-4 flex-shrink-0 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.subtitle}</p>
          </div>

          <div
            className="flex-1 overflow-y-auto px-5 pb-2"
            style={{ overscrollBehavior: 'contain' }}
          >
            {vehicles.length === 0 ? (
              <p className="text-center text-slate-500 py-8">{t.noVehicles}</p>
            ) : (
              <div className="space-y-3">
                {vehicles.map((vehicle) => {
                  const isSelected = selectedVehicleId === vehicle.id;
                  return (
                    <motion.button
                      key={vehicle.id}
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      whileTap={{ scale: 0.97 }}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isSelected
                                ? 'bg-amber-400'
                                : 'bg-slate-100 dark:bg-slate-700'
                            }`}
                          >
                            <Car
                              className={`w-5 h-5 ${
                                isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {vehicle.brand} {vehicle.model}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {vehicle.plate_number}
                            </p>
                          </div>
                        </div>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-5 pt-3 pb-2 flex-shrink-0 border-t border-slate-100 dark:border-slate-800">
            <Button
              onClick={handleConfirm}
              disabled={!selectedVehicleId || saving}
              className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-lg text-white"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Check className="w-5 h-5 mr-2" />
              )}
              {t.confirm}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
