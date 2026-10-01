import React, { useState } from 'react';
import { Scale, X, Check } from 'lucide-react';

interface WeightModalProps {
  currentWeight: number;
  weightUnit: string;
  onSaveWeight: (weight: number) => void;
  onClose: () => void;
}

export const WeightModal: React.FC<WeightModalProps> = ({
  currentWeight,
  weightUnit,
  onSaveWeight,
  onClose,
}) => {
  const [val, setVal] = useState<string>(currentWeight ? currentWeight.toString() : '71.5');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      onSaveWeight(num);
      onClose();
    }
  };

  const adjust = (delta: number) => {
    const cur = parseFloat(val) || 70;
    setVal((cur + delta).toFixed(1));
  };

  return (
    <div className="fixed inset-0 bg-[#050B18]/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="glass-panel border border-white/[0.12] rounded-3xl max-w-sm w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00D9B5]/15 text-[#00D9B5] flex items-center justify-center border border-[#00D9B5]/30 shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#F5F7FA] text-lg">Log Today's Weight</h3>
          </div>
          <button onClick={onClose} className="text-[#9AA8BC] hover:text-[#F5F7FA] p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6 pt-5">
          <div className="flex items-center justify-center gap-4 py-2">
            <button
              type="button"
              onClick={() => adjust(-0.1)}
              className="w-11 h-11 rounded-2xl glass-panel-subtle hover:bg-white/[0.10] text-[#F5F7FA] text-xl font-bold border border-white/[0.10] active:scale-95 transition-all"
            >
              -
            </button>
            <div className="flex items-baseline gap-1.5">
              <input
                type="number"
                step="0.1"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                autoFocus
                className="w-32 text-center text-3xl font-black bg-white/[0.04] border border-white/[0.12] rounded-2xl px-2 py-1 text-[#F5F7FA] focus:outline-none focus:border-[#00D9B5]"
              />
              <span className="text-sm font-semibold text-[#9AA8BC]">{weightUnit}</span>
            </div>
            <button
              type="button"
              onClick={() => adjust(0.1)}
              className="w-11 h-11 rounded-2xl glass-panel-subtle hover:bg-white/[0.10] text-[#F5F7FA] text-xl font-bold border border-white/[0.10] active:scale-95 transition-all"
            >
              +
            </button>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl glass-panel-subtle hover:bg-white/[0.08] text-[#9AA8BC] hover:text-[#F5F7FA] font-semibold text-sm transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00D9B5] to-[#00C8FF] hover:opacity-90 text-[#050B18] font-bold text-sm shadow-lg shadow-[#00D9B5]/25 transition flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
