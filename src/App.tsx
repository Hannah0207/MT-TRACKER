import { useState, useEffect } from 'react';
import { Plus, Bell, Search, Clock } from 'lucide-react';
import { MaintenanceItem } from './types';
import { calculateNextDueDate } from './utils/dateUtils';
import { MaintenanceCard } from './components/MaintenanceCard';
import { MaintenanceItemModal } from './components/MaintenanceItemModal';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MaintenanceItem | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('maintenance_items');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved items', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('maintenance_items', JSON.stringify(items));
  }, [items]);

  // Notification Check
  useEffect(() => {
    const checkNotifications = async () => {
      if (!('Notification' in window)) return;
      
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      if (Notification.permission === 'granted') {
        items.forEach(item => {
          const nextDue = new Date(item.nextDueDate);
          const now = new Date();
          const diff = nextDue.getTime() - now.getTime();
          const oneDay = 24 * 60 * 60 * 1000;

          // Notify if due within 24 hours and not already notified today
          if (diff > 0 && diff < oneDay) {
            const lastNotified = localStorage.getItem(`notified_${item.id}`);
            const todayStr = now.toDateString();
            
            if (lastNotified !== todayStr) {
              new Notification('维护提醒', {
                body: `项目 "${item.name}" 即将到期，请及时处理。`,
                icon: '/favicon.ico'
              });
              localStorage.setItem(`notified_${item.id}`, todayStr);
            }
          }
        });
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 1000 * 60 * 60); // Check every hour
    return () => clearInterval(interval);
  }, [items]);

  const handleSaveItem = (itemData: Omit<MaintenanceItem, 'id' | 'nextDueDate'>) => {
    if (editingItem) {
      // Update existing item
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === editingItem.id) {
            const nextDueDate = calculateNextDueDate(itemData);
            return {
              ...itemData,
              id: item.id,
              nextDueDate,
            };
          }
          return item;
        })
      );
      setEditingItem(undefined);
    } else {
      // Add new item
      const nextDueDate = calculateNextDueDate(itemData);
      const newItem: MaintenanceItem = {
        ...itemData,
        id: crypto.randomUUID(),
        nextDueDate,
      };
      setItems((prev) => [...prev, newItem]);
    }
  };

  const handleMarkDone = (id: string) => {
    // Clear notification flag for this item so it can notify again in the next cycle
    localStorage.removeItem(`notified_${id}`);

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedLastDate = new Date().toISOString();
          const updatedNextDate = calculateNextDueDate({
            ...item,
            lastMaintenanceDate: updatedLastDate,
          });
          return {
            ...item,
            lastMaintenanceDate: updatedLastDate,
            nextDueDate: updatedNextDate,
          };
        }
        return item;
      })
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个追踪项目吗？')) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      localStorage.removeItem(`notified_${id}`);
    }
  };

  const handleEdit = (item: MaintenanceItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const sortedItems = [...items]
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

  const overdueCount = items.filter(item => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(item.nextDueDate) < today;
  }).length;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-32">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-6">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-gray-900">Maintenance Tracker</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-0.5">
              {overdueCount > 0 ? (
                <span className="text-red-500">{overdueCount} 个项目已逾期</span>
              ) : (
                '所有项目状态良好'
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors">
              <Bell size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-8">
        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input
            type="text"
            placeholder="搜索追踪项目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl shadow-none focus:ring-2 focus:ring-gray-900 transition-all outline-none font-medium"
          />
        </div>

        {/* List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {sortedItems.length > 0 ? (
              sortedItems.map((item) => (
                <MaintenanceCard
                  key={item.id}
                  item={item}
                  onMarkDone={handleMarkDone}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Clock size={24} className="text-gray-200" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">暂无追踪项目</h3>
                <p className="text-gray-400 text-sm mt-2">
                  点击下方的按钮开始添加您的第一个维护项目。
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 left-0 right-0 px-6 pointer-events-none">
        <div className="max-w-2xl mx-auto flex justify-center">
          <button
            onClick={() => {
              setEditingItem(undefined);
              setIsModalOpen(true);
            }}
            className="pointer-events-auto px-8 h-16 bg-gray-900 text-white rounded-2xl shadow-2xl shadow-gray-200 flex items-center justify-center gap-3 active:scale-95 transition-all font-bold"
            aria-label="添加新项目"
          >
            <Plus size={24} />
            <span>添加新项目</span>
          </button>
        </div>
      </div>

      <MaintenanceItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(undefined);
        }}
        onSave={handleSaveItem}
        initialData={editingItem}
      />
    </div>
  );
}
