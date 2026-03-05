import React from 'react';
import { CheckCircle2, Calendar, Clock, Trash2, Edit2 } from 'lucide-react';
import { MaintenanceItem } from '../types';
import { formatDate, getStatus, getWeekdayName, getMonthName } from '../utils/dateUtils';
import { motion } from 'motion/react';

interface MaintenanceCardProps {
  item: MaintenanceItem;
  onMarkDone: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (item: MaintenanceItem) => void;
}

export const MaintenanceCard: React.FC<MaintenanceCardProps> = ({ item, onMarkDone, onDelete, onEdit }) => {
  const status = getStatus(item.nextDueDate);
  
  const statusConfig = {
    overdue: {
      bg: 'bg-white',
      text: 'text-red-600',
      badge: 'bg-red-500',
      label: '已逾期',
      border: 'border-red-100',
    },
    'due-soon': {
      bg: 'bg-white',
      text: 'text-amber-600',
      badge: 'bg-amber-500',
      label: '即将到期',
      border: 'border-amber-100',
    },
    safe: {
      bg: 'bg-white',
      text: 'text-emerald-600',
      badge: 'bg-emerald-500',
      label: '状态良好',
      border: 'border-gray-100',
    },
  };

  const config = statusConfig[status];

  const getIntervalLabel = () => {
    const unitMap = { days: '天', weeks: '周', months: '个月', years: '年' };
    let label = `每 ${item.intervalValue} ${unitMap[item.intervalType]}`;
    
    if (item.intervalType === 'weeks' && item.specificWeekday !== undefined) {
      label += ` (${getWeekdayName(item.specificWeekday)})`;
    } else if (item.intervalType === 'months' && item.specificDayOfMonth !== undefined) {
      label += ` (${item.specificDayOfMonth}号)`;
    } else if (item.intervalType === 'years' && item.specificMonth !== undefined && item.specificDayOfMonth !== undefined) {
      label += ` (${getMonthName(item.specificMonth)}${item.specificDayOfMonth}日)`;
    }
    return label;
  };

  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleDoneClick = () => {
    setIsSuccess(true);
    onMarkDone(item.id);
    setTimeout(() => setIsSuccess(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative overflow-hidden rounded-2xl border ${config.border} p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all ${config.bg}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.name}</h3>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${config.badge}`}>
              {config.label}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => onEdit(item)}
            className="p-2 text-gray-300 hover:text-gray-600 transition-colors"
            aria-label="修改项目"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={() => onDelete(item.id)}
            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
            aria-label="删除项目"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-2.5 mb-6">
        <div className="flex items-center text-sm text-gray-500 gap-2">
          <Calendar size={14} className="text-gray-300" />
          <span>上次维护: <span className="font-medium text-gray-700">{formatDate(item.lastMaintenanceDate)}</span></span>
        </div>
        <div className="flex items-center text-sm text-gray-500 gap-2">
          <Clock size={14} className="text-gray-300" />
          <span>下次维护: <span className={`font-bold ${config.text}`}>{formatDate(item.nextDueDate)}</span></span>
        </div>
        <div className="text-xs text-gray-400 font-medium bg-gray-50 inline-block px-2 py-1 rounded-md">
          {getIntervalLabel()}
        </div>
      </div>

      <button
        onClick={handleDoneClick}
        disabled={isSuccess}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white shadow-lg active:scale-[0.98] transition-all ${
          isSuccess 
            ? 'bg-emerald-500 shadow-emerald-100' 
            : 'bg-gray-900 shadow-gray-200 hover:bg-black'
        }`}
      >
        {isSuccess ? (
          <>
            <CheckCircle2 size={18} />
            已完成重置
          </>
        ) : (
          <>
            <CheckCircle2 size={18} />
            标记为已完成
          </>
        )}
      </button>
    </motion.div>
  );
};
