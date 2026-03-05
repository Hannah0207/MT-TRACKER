import React, { useState, useEffect } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { IntervalType, Weekday, MaintenanceItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface MaintenanceItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: {
    name: string;
    lastMaintenanceDate: string;
    intervalType: IntervalType;
    intervalValue: number;
    specificWeekday?: Weekday;
    specificDayOfMonth?: number;
    specificMonth?: number;
  }) => void;
  initialData?: MaintenanceItem;
}

export const MaintenanceItemModal: React.FC<MaintenanceItemModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  initialData 
}) => {
  const [name, setName] = useState('');
  const [lastDate, setLastDate] = useState(new Date().toISOString().split('T')[0]);
  const [intervalType, setIntervalType] = useState<IntervalType>('days');
  const [intervalValue, setIntervalValue] = useState(7);
  const [specificWeekday, setSpecificWeekday] = useState<Weekday>(Weekday.Monday);
  const [specificDayOfMonth, setSpecificDayOfMonth] = useState(1);
  const [specificMonth, setSpecificMonth] = useState(0);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setLastDate(new Date(initialData.lastMaintenanceDate).toISOString().split('T')[0]);
      setIntervalType(initialData.intervalType);
      setIntervalValue(initialData.intervalValue);
      if (initialData.specificWeekday !== undefined) setSpecificWeekday(initialData.specificWeekday);
      if (initialData.specificDayOfMonth !== undefined) setSpecificDayOfMonth(initialData.specificDayOfMonth);
      if (initialData.specificMonth !== undefined) setSpecificMonth(initialData.specificMonth);
    } else {
      setName('');
      setLastDate(new Date().toISOString().split('T')[0]);
      setIntervalType('days');
      setIntervalValue(7);
      setSpecificWeekday(Weekday.Monday);
      setSpecificDayOfMonth(1);
      setSpecificMonth(0);
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name,
      lastMaintenanceDate: new Date(lastDate).toISOString(),
      intervalType,
      intervalValue,
      specificWeekday: intervalType === 'weeks' ? specificWeekday : undefined,
      specificDayOfMonth: (intervalType === 'months' || intervalType === 'years') ? specificDayOfMonth : undefined,
      specificMonth: intervalType === 'years' ? specificMonth : undefined,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {initialData ? '修改追踪项目' : '添加新追踪'}
              </h2>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">项目名称</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：汽车保养"
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900 transition-all outline-none text-lg font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">上次维护日期</label>
                <input
                  type="date"
                  required
                  value={lastDate}
                  onChange={(e) => setLastDate(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900 transition-all outline-none text-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">频率</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={intervalValue}
                    onChange={(e) => setIntervalValue(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900 transition-all outline-none text-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">单位</label>
                  <select
                    value={intervalType}
                    onChange={(e) => setIntervalType(e.target.value as IntervalType)}
                    className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900 transition-all outline-none text-lg font-medium appearance-none"
                  >
                    <option value="days">天</option>
                    <option value="weeks">周</option>
                    <option value="months">个月</option>
                    <option value="years">年</option>
                  </select>
                </div>
              </div>

              {intervalType === 'weeks' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">指定周几</label>
                  <div className="flex flex-wrap gap-2">
                    {['日', '一', '二', '三', '四', '五', '六'].map((day, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSpecificWeekday(idx as Weekday)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                          specificWeekday === idx 
                            ? 'bg-gray-900 text-white shadow-lg' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {(intervalType === 'months' || intervalType === 'years') && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">指定日期</label>
                  <div className="flex items-center gap-2">
                    {intervalType === 'years' && (
                      <select
                        value={specificMonth}
                        onChange={(e) => setSpecificMonth(parseInt(e.target.value))}
                        className="flex-1 px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900 outline-none text-lg font-medium appearance-none"
                      >
                        {['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'].map((m, i) => (
                          <option key={i} value={i}>{m}</option>
                        ))}
                      </select>
                    )}
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={specificDayOfMonth}
                      onChange={(e) => setSpecificDayOfMonth(parseInt(e.target.value) || 1)}
                      className="w-24 px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900 outline-none text-lg font-medium"
                    />
                    <span className="text-gray-500 font-bold">日</span>
                  </div>
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
              >
                {initialData ? <Save size={24} /> : <Plus size={24} />}
                {initialData ? '保存修改' : '确认添加'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
