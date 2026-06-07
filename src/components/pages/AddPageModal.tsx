import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Page, PageContract, UserRole } from '../../data/store';
import Modal from '../common/Modal';
import { Input, Select, Textarea } from '../common/Input';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPageModal({ isOpen, onClose }: Props) {
  const { users, addPage } = useApp();
  const [form, setForm] = useState({
    name: '', instagramHandle: '', category: '', monthlyGoal: '',
    clientId: '', adminId: '', scriptwriterId: '', cameramanId: '', editorId: '',
    contractAmount: '', extraReelCost: '', monthlyReels: '12',
    contractStart: '', contractEnd: '',
  });

  const clientUsers = users.filter(u => u.role === 'client');
  const adminUsers = users.filter(u => u.role === 'admin');
  const scriptwriterUsers = users.filter(u => u.role === 'scriptwriter');
  const cameramanUsers = users.filter(u => u.role === 'cameraman');
  const editorUsers = users.filter(u => u.role === 'editor');

  const makeOptions = (list: typeof users) => [
    { value: '', label: '-- انتخاب کنید --' },
    ...list.map(u => ({ value: u.id, label: u.name })),
  ];

  const handleSubmit = () => {
    if (!form.name || !form.instagramHandle) return;
    const pageId = `p${Date.now()}`;
    const contract: PageContract = {
      id: `c${Date.now()}`,
      pageId,
      startDate: form.contractStart,
      endDate: form.contractEnd,
      monthlyReelsCount: parseInt(form.monthlyReels) || 12,
      contractAmount: parseInt(form.contractAmount) || 0,
      extraReelCost: parseInt(form.extraReelCost) || 0,
      goals: [form.monthlyGoal],
      instagramConnected: false,
    };
    const page: Page = {
      id: pageId,
      name: form.name,
      instagramHandle: form.instagramHandle,
      category: form.category,
      monthlyGoal: form.monthlyGoal,
      clientId: form.clientId,
      adminId: form.adminId,
      scriptwriterId: form.scriptwriterId,
      cameramanId: form.cameramanId,
      editorId: form.editorId,
      contract,
      followers: 0,
      totalViews: 0,
      reels: [],
    };
    addPage(page);
    onClose();
    setForm({ name: '', instagramHandle: '', category: '', monthlyGoal: '', clientId: '', adminId: '', scriptwriterId: '', cameramanId: '', editorId: '', contractAmount: '', extraReelCost: '', monthlyReels: '12', contractStart: '', contractEnd: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="افزودن پیج جدید" size="lg">
      <div className="space-y-3">
        <p className="text-xs text-slate-500 bg-slate-700/30 rounded-lg p-2">اطلاعات پایه</p>
        <Input label="نام پیج" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="کلینیک دکتر..." />
        <Input label="آیدی اینستاگرام" value={form.instagramHandle} onChange={e => setForm({ ...form, instagramHandle: e.target.value })} placeholder="@username" />
        <Input label="دسته‌بندی" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="پزشکی، غذا، فشن..." />
        <Input label="هدف ماهانه" value={form.monthlyGoal} onChange={e => setForm({ ...form, monthlyGoal: e.target.value })} placeholder="برندسازی، افزایش فروش..." />

        <p className="text-xs text-slate-500 bg-slate-700/30 rounded-lg p-2 mt-4">تیم</p>
        <Select label="کارفرما" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} options={makeOptions(clientUsers)} />
        <Select label="ادمین" value={form.adminId} onChange={e => setForm({ ...form, adminId: e.target.value })} options={makeOptions(adminUsers)} />
        <Select label="سناریونویس" value={form.scriptwriterId} onChange={e => setForm({ ...form, scriptwriterId: e.target.value })} options={makeOptions(scriptwriterUsers)} />
        <Select label="فیلمبردار" value={form.cameramanId} onChange={e => setForm({ ...form, cameramanId: e.target.value })} options={makeOptions(cameramanUsers)} />
        <Select label="تدوینگر" value={form.editorId} onChange={e => setForm({ ...form, editorId: e.target.value })} options={makeOptions(editorUsers)} />

        <p className="text-xs text-slate-500 bg-slate-700/30 rounded-lg p-2 mt-4">قرارداد</p>
        <Input label="تاریخ شروع قرارداد" value={form.contractStart} onChange={e => setForm({ ...form, contractStart: e.target.value })} placeholder="1403/10/01" />
        <Input label="تاریخ پایان قرارداد" value={form.contractEnd} onChange={e => setForm({ ...form, contractEnd: e.target.value })} placeholder="1403/12/30" />
        <Input label="تعداد ریلز ماهانه (طبق قرارداد)" type="number" value={form.monthlyReels} onChange={e => setForm({ ...form, monthlyReels: e.target.value })} placeholder="12" />
        <Input label="مبلغ قرارداد (تومان)" type="number" value={form.contractAmount} onChange={e => setForm({ ...form, contractAmount: e.target.value })} placeholder="15000000" />
        <Input label="هزینه هر ریلز اضافه (تومان)" type="number" value={form.extraReelCost} onChange={e => setForm({ ...form, extraReelCost: e.target.value })} placeholder="800000" />

        <button onClick={handleSubmit} className="w-full py-3 gradient-bg text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity mt-2">
          ثبت پیج جدید
        </button>
      </div>
    </Modal>
  );
}
