import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Home, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Settings, 
  PieChart as PieIcon, 
  BarChart3, 
  Users, 
  Coffee, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  CheckCircle2,
  Calendar,
  Save,
  RotateCcw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

// البيانات الافتراضية الأولية المستوحاة من السوق السعودي
const INITIAL_VENUES = [
  {
    id: '1',
    name: 'قاعة الأحلام للأفراح',
    type: 'قاعة أفراح',
    distance: 1.2,
    rating: 4.5,
    price: 15000,
    services: 'شاملة الضيافة والبوفيه والصبابات',
    notes: 'موقف سيارات واسع، ديكور حديث، إضاءة ممتازة',
  },
  {
    id: '2',
    name: 'قاعة الملكة',
    type: 'قاعة أفراح',
    distance: 2.5,
    rating: 4.0,
    price: 12000,
    services: 'القاعة فقط مع العمالة الأساسية',
    notes: 'تحتاج إلى تجديد بفرش الكوشة والإضاءة',
  },
  {
    id: '3',
    name: 'قاعة الأسطورة',
    type: 'قاعة أفراح',
    distance: 3.1,
    rating: 4.8,
    price: 18000,
    services: 'خدمة في آي بي متكاملة مع ضيافة فاخرة',
    notes: 'منافس قوي في الفئة الفاخرة',
  },
  {
    id: '4',
    name: 'استراحة الريم',
    type: 'استراحة',
    distance: 0.8,
    rating: 4.2,
    priceWeekday: 800,
    price: 1200, // سعر نهاية الأسبوع كمرجع
    services: 'مسبح + قسمين رجال ونساء + ألعاب أطفال',
    notes: 'منافس مباشر للاستراحة الخاصة بنا',
  },
  {
    id: '5',
    name: 'استراحة النخيل',
    type: 'استراحة',
    distance: 1.5,
    rating: 3.8,
    priceWeekday: 600,
    price: 900,
    services: 'قسم واحد ومجلس كبير ومسبح مغلق',
    notes: 'مستوى متوسط وأقل سعراً',
  },
  {
    id: '6',
    name: 'استراحة الجوهرة الفاخرة',
    type: 'استراحة',
    distance: 2.0,
    rating: 4.6,
    priceWeekday: 1100,
    price: 1600,
    services: 'مسطحات خضراء واسعة ومسبح وملعب كرة',
    notes: 'ممتازة للعائلات الكبيرة',
  }
];

const INITIAL_EXPENSES = [
  {
    id: 'exp-1',
    bookingId: 'BK-1001',
    date: '2026-11-01',
    clientName: 'أحمد بن عبدالله العتيبي',
    venueType: 'قاعة أفراح',
    revenue: 13000,
    laborCost: 1500, // المباشرين والعمالة
    hospitalityCost: 800, // القهوة والمشروبات
    extraCost: 2000, // الكوشة والتجهيزات الإضافية
    notes: 'حجز قاعة كامل مع ضيافة خاصة'
  },
  {
    id: 'exp-2',
    bookingId: 'BK-1002',
    date: '2026-11-03',
    clientName: 'خالد بن محمد الغامدي',
    venueType: 'استراحة',
    revenue: 1000,
    laborCost: 250,
    hospitalityCost: 150,
    extraCost: 100,
    notes: 'حجز يوم واحد قسمين'
  },
  {
    id: 'exp-3',
    bookingId: 'BK-1003',
    date: '2026-11-07',
    clientName: 'سعود الفايز',
    venueType: 'قاعة أفراح',
    revenue: 13000,
    laborCost: 1600,
    hospitalityCost: 950,
    extraCost: 1200,
    notes: 'تنسيق كوشة زرقاء وديكور مخصص'
  }
];

const DEFAULT_BASE_PRICES = {
  hall: 13000,
  resort: 1000
};

export default function App() {
  // State variables
  const [activeTab, setActiveTab] = useState('venues'); // 'venues' | 'expenses' | 'analytics'
  const [venues, setVenues] = useState(() => {
    const saved = localStorage.getItem('app_venues');
    return saved ? JSON.parse(saved) : INITIAL_VENUES;
  });
  
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('app_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [basePrices, setBasePrices] = useState(() => {
    const saved = localStorage.getItem('app_base_prices');
    return saved ? JSON.parse(saved) : DEFAULT_BASE_PRICES;
  });

  // Venue Filters
  const [venueSearch, setVenueSearch] = useState('');
  const [venueTypeFilter, setVenueTypeFilter] = useState('الكل');
  const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'price' | 'rating'

  // Modal States
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Form States for Venue
  const [venueForm, setVenueForm] = useState({
    name: '',
    type: 'قاعة أفراح',
    distance: '',
    rating: 4.5,
    price: '',
    priceWeekday: '',
    services: '',
    notes: ''
  });

  // Form States for Expense
  const [expenseForm, setExpenseForm] = useState({
    bookingId: '',
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    venueType: 'قاعة أفراح',
    revenue: '',
    laborCost: '',
    hospitalityCost: '',
    extraCost: '',
    notes: ''
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('app_venues', JSON.stringify(venues));
  }, [venues]);

  useEffect(() => {
    localStorage.setItem('app_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('app_base_prices', JSON.stringify(basePrices));
  }, [basePrices]);

  // Venue helper functions
  const openAddVenueModal = () => {
    setEditingVenue(null);
    setVenueForm({
      name: '',
      type: 'قاعة أفراح',
      distance: '1.0',
      rating: 4.5,
      price: '',
      priceWeekday: '',
      services: '',
      notes: ''
    });
    setShowVenueModal(true);
  };

  const openEditVenueModal = (venue) => {
    setEditingVenue(venue);
    setVenueForm({
      name: venue.name,
      type: venue.type,
      distance: venue.distance,
      rating: venue.rating,
      price: venue.price,
      priceWeekday: venue.priceWeekday || '',
      services: venue.services,
      notes: venue.notes
    });
    setShowVenueModal(true);
  };

  const handleSaveVenue = (e) => {
    e.preventDefault();
    if (!venueForm.name || !venueForm.price) return;

    if (editingVenue) {
      setVenues(venues.map(v => v.id === editingVenue.id ? {
        ...v,
        ...venueForm,
        distance: parseFloat(venueForm.distance) || 0,
        rating: parseFloat(venueForm.rating) || 4.0,
        price: parseFloat(venueForm.price) || 0,
        priceWeekday: venueForm.priceWeekday ? parseFloat(venueForm.priceWeekday) : undefined
      } : v));
    } else {
      const newV = {
        id: Date.now().toString(),
        ...venueForm,
        distance: parseFloat(venueForm.distance) || 0,
        rating: parseFloat(venueForm.rating) || 4.0,
        price: parseFloat(venueForm.price) || 0,
        priceWeekday: venueForm.priceWeekday ? parseFloat(venueForm.priceWeekday) : undefined
      };
      setVenues([newV, ...venues]);
    }
    setShowVenueModal(false);
  };

  const handleDeleteVenue = (id) => {
    if (window.confirm('هل أنت تأكد من إزالة هذا المكان من القائمة؟')) {
      setVenues(venues.filter(v => v.id !== id));
    }
  };

  // Expense helper functions
  const openAddExpenseModal = () => {
    setEditingExpense(null);
    const newBookingNumber = `BK-${1000 + expenses.length + 1}`;
    setExpenseForm({
      bookingId: newBookingNumber,
      date: new Date().toISOString().split('T')[0],
      clientName: '',
      venueType: 'قاعة أفراح',
      revenue: basePrices.hall,
      laborCost: '',
      hospitalityCost: '',
      extraCost: '',
      notes: ''
    });
    setShowExpenseModal(true);
  };

  const openEditExpenseModal = (exp) => {
    setEditingExpense(exp);
    setExpenseForm({
      bookingId: exp.bookingId,
      date: exp.date,
      clientName: exp.clientName,
      venueType: exp.venueType,
      revenue: exp.revenue,
      laborCost: exp.laborCost,
      hospitalityCost: exp.hospitalityCost,
      extraCost: exp.extraCost,
      notes: exp.notes
    });
    setShowExpenseModal(true);
  };

  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.clientName) return;

    const formattedExpense = {
      ...expenseForm,
      revenue: parseFloat(expenseForm.revenue) || 0,
      laborCost: parseFloat(expenseForm.laborCost) || 0,
      hospitalityCost: parseFloat(expenseForm.hospitalityCost) || 0,
      extraCost: parseFloat(expenseForm.extraCost) || 0,
    };

    if (editingExpense) {
      setExpenses(expenses.map(e => e.id === editingExpense.id ? {
        ...e,
        ...formattedExpense
      } : e));
    } else {
      setExpenses([{
        id: Date.now().toString(),
        ...formattedExpense
      }, ...expenses]);
    }
    setShowExpenseModal(false);
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الحجز والمصروفات الخاصة به؟')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  // Automated Analytics & Pricing Calculations
  const getVenueAnalysis = (venue) => {
    const base = venue.type === 'قاعة أفراح' ? basePrices.hall : basePrices.resort;
    const diff = venue.price - base;
    const percent = Math.round((diff / base) * 100);
    
    let status = 'منافس مباشر';
    let badgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
    let icon = <Minus className="w-3.5 h-3.5 text-amber-600" />;

    if (percent > 5) {
      status = `أعلى منا بـ ${percent}%`;
      badgeBg = 'bg-rose-100 text-rose-800 border-rose-300';
      icon = <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />;
    } else if (percent < -5) {
      status = `أقل منا بـ ${Math.abs(percent)}%`;
      badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      icon = <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />;
    }

    return { diff, percent, status, badgeBg, icon, basePrice: base };
  };

  // Filtered & Sorted Venues
  const filteredVenues = useMemo(() => {
    return venues
      .filter(v => {
        const matchesType = venueTypeFilter === 'الكل' || v.type === venueTypeFilter;
        const matchesSearch = v.name.includes(venueSearch) || (v.services && v.services.includes(venueSearch)) || (v.notes && v.notes.includes(venueSearch));
        return matchesType && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') return a.distance - b.distance;
        if (sortBy === 'price') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [venues, venueTypeFilter, venueSearch, sortBy]);

  // Statistics Calculations
  const stats = useMemo(() => {
    const halls = venues.filter(v => v.type === 'قاعة أفراح');
    const resorts = venues.filter(v => v.type === 'استراحة');

    const avgHallPrice = halls.length ? Math.round(halls.reduce((a, b) => a + b.price, 0) / halls.length) : 0;
    const avgResortPrice = resorts.length ? Math.round(resorts.reduce((a, b) => a + b.price, 0) / resorts.length) : 0;

    const nearestVenue = [...venues].sort((a, b) => a.distance - b.distance)[0];

    // Expense stats
    const totalRevenue = expenses.reduce((a, b) => a + b.revenue, 0);
    const totalLabor = expenses.reduce((a, b) => a + b.laborCost, 0);
    const totalHospitality = expenses.reduce((a, b) => a + b.hospitalityCost, 0);
    const totalExtra = expenses.reduce((a, b) => a + b.extraCost, 0);
    const totalExpenses = totalLabor + totalHospitality + totalExtra;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    return {
      totalVenues: venues.length,
      avgHallPrice,
      avgResortPrice,
      nearestVenue,
      totalBookings: expenses.length,
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      totalLabor,
      totalHospitality,
      totalExtra
    };
  }, [venues, expenses]);

  // Chart Data Preparation
  const venueChartData = useMemo(() => {
    return filteredVenues.map(v => {
      const base = v.type === 'قاعة أفراح' ? basePrices.hall : basePrices.resort;
      return {
        name: v.name.length > 12 ? v.name.substring(0, 12) + '...' : v.name,
        'سعر المنافس': v.price,
        'سعرنا المعتمد': base,
        fullName: v.name
      };
    });
  }, [filteredVenues, basePrices]);

  const expensePieData = useMemo(() => {
    return [
      { name: 'المباشرين والعمالة', value: stats.totalLabor, color: '#3B82F6' },
      { name: 'الضيافة والقهوة', value: stats.totalHospitality, color: '#10B981' },
      { name: 'التجهيزات والكوشة', value: stats.totalExtra, color: '#F59E0B' },
    ];
  }, [stats]);

  // Export Data Functions
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ venues, expenses, basePrices }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `تقرير_القاعات_والاستراحات_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  const resetData = () => {
    if (window.confirm('هل تريد إعادة الملف للبيانات التجريبية الأصلية؟ سيفقد أي بيانات مضافة حالياً.')) {
      setVenues(INITIAL_VENUES);
      setExpenses(INITIAL_EXPENSES);
      setBasePrices(DEFAULT_BASE_PRICES);
      localStorage.removeItem('app_venues');
      localStorage.removeItem('app_expenses');
      localStorage.removeItem('app_base_prices');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans dir-rtl" dir="rtl">
      
      {/* Top Header Navigation */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 border-b border-amber-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo & Title */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-xl flex items-center justify-center shadow-md text-slate-950 font-bold">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-wide text-white flex items-center gap-2">
                 منصة القاعات والاستراحات لمجموعة الكوثر الاستثمارية
                  <span className="text-xs font-normal bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    المملكة العربية السعودية
                  </span>
                </h1>
                <p className="text-xs text-slate-400">إدارة القاعات والاستراحات وتحليل المنافسين والمصروفات</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="p-2.5 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 text-sm"
                title="إعدادات الأسعار المعتمدة"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden md:inline">أسعارنا المعتمدة</span>
              </button>

              <button 
                onClick={handleExportJSON}
                className="p-2.5 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 text-sm"
                title="تصدير البيانات"
              >
                <Download className="w-5 h-5" />
                <span className="hidden md:inline">تصدير</span>
              </button>

              <button 
                onClick={handlePrint}
                className="p-2.5 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 text-sm"
                title="طباعة التقرير"
              >
                <Printer className="w-5 h-5" />
                <span className="hidden md:inline">طباعة</span>
              </button>

              <button 
                onClick={resetData}
                className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
                title="إعادة ضبط البيانات"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Navigation Tabs */}
          <div className="flex border-t border-slate-800 space-x-8 space-x-reverse overflow-x-auto">
            <button
              onClick={() => setActiveTab('venues')}
              className={`py-3.5 px-2 font-bold text-sm border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'venues'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              دراسة السوق والتسعير (القاعات والاستراحات)
              <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full mr-1">
                {venues.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-3.5 px-2 font-bold text-sm border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'expenses'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              المصروفات التشغيلية والحجوزات
              <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full mr-1">
                {expenses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3.5 px-2 font-bold text-sm border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              الرسوم البيانية والتحليل الشامل
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* SECTION 1: VENUES COMPARISON & PRICING TOOL */}
        {activeTab === 'venues' && (
          <div className="space-y-6">

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">متوسط أسعار القاعات في السوق</p>
                  <p className="text-2xl font-black text-slate-900">{stats.avgHallPrice.toLocaleString()} <span className="text-xs font-normal text-slate-500">ر.س</span></p>
                  <p className="text-xs text-amber-600 mt-1">سعرنا المعتمد: {basePrices.hall.toLocaleString()} ر.س</p>
                </div>
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">متوسط أسعار الاستراحات في السوق</p>
                  <p className="text-2xl font-black text-slate-900">{stats.avgResortPrice.toLocaleString()} <span className="text-xs font-normal text-slate-500">ر.س</span></p>
                  <p className="text-xs text-emerald-600 mt-1">سعرنا المعتمد: {basePrices.resort.toLocaleString()} ر.س</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">أقرب منافس لك</p>
                  <p className="text-lg font-bold text-slate-900 truncate max-w-[150px]">
                    {stats.nearestVenue ? stats.nearestVenue.name : 'لا يوجد'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">يبعد {stats.nearestVenue ? stats.nearestVenue.distance : 0} كم فقط</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">إجمالي المنافسين المرصودين</p>
                  <p className="text-2xl font-black text-slate-900">{stats.totalVenues} <span className="text-xs font-normal text-slate-500">مكان</span></p>
                  <p className="text-xs text-indigo-600 mt-1">تحديث دوري مستمر</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Filter and Actions Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search & Filter */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    placeholder="بحث باسم المكان أو الخدمة..."
                    value={venueSearch}
                    onChange={(e) => setVenueSearch(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <select
                    value={venueTypeFilter}
                    onChange={(e) => setVenueTypeFilter(e.target.value)}
                    className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    <option value="الكل">كل الأماكن</option>
                    <option value="قاعة أفراح">قاعات الأفراح</option>
                    <option value="استراحة">الاستراحات</option>
                  </select>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="distance">الترتيب حسب الأقرب (كم)</option>
                  <option value="price">الترتيب حسب الأعلى سعراً</option>
                  <option value="rating">الترتيب حسب الأعلى تقييماً</option>
                </select>
              </div>

              {/* Add Button */}
              <button
                onClick={openAddVenueModal}
                className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-5 py-2.5 rounded-xl shadow border border-amber-500/30 flex items-center justify-center gap-2 text-sm transition"
              >
                <Plus className="w-4 h-4" />
                إضافة قاعة / استراحة منافسة
              </button>

            </div>

            {/* Venues Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-900 text-slate-300 text-xs font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-4">اسم المكان</th>
                      <th className="px-4 py-4">النوع</th>
                      <th className="px-4 py-4">البعد (كم)</th>
                      <th className="px-4 py-4">التقييم</th>
                      <th className="px-4 py-4">السعر (ر.س)</th>
                      <th className="px-4 py-4">التحليل التنافسي الذكي</th>
                      <th className="px-4 py-4">الخدمات والشروط</th>
                      <th className="px-4 py-4">ملاحظات / نقاط القوة</th>
                      <th className="px-4 py-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVenues.length > 0 ? (
                      filteredVenues.map((venue) => {
                        const analysis = getVenueAnalysis(venue);
                        return (
                          <tr key={venue.id} className="hover:bg-slate-50/80 transition">
                            <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                              {venue.name}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
                                venue.type === 'قاعة أفراح' 
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {venue.type === 'قاعة أفراح' ? <Building2 className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                                {venue.type}
                              </span>
                            </td>
                            <td className="px-4 py-4 font-semibold text-slate-700 whitespace-nowrap">
                              {venue.distance} كم
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <span className="text-amber-500">★</span>
                                <span className="font-bold text-slate-800">{venue.rating}</span>
                                <span className="text-slate-400 text-xs">/5</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 font-black text-slate-900 whitespace-nowrap">
                              {venue.price.toLocaleString()} ر.س
                              {venue.priceWeekday && (
                                <div className="text-xs font-normal text-slate-500">
                                  وسط الأسبوع: {venue.priceWeekday.toLocaleString()} ر.س
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${analysis.badgeBg}`}>
                                {analysis.icon}
                                {analysis.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-slate-600 max-w-xs truncate" title={venue.services}>
                              {venue.services || '-'}
                            </td>
                            <td className="px-4 py-4 text-slate-600 max-w-xs truncate" title={venue.notes}>
                              {venue.notes || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                                <button
                                  onClick={() => openEditVenueModal(venue)}
                                  className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                  title="تعديل"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteVenue(venue.id)}
                                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="حذف"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-12 text-slate-400">
                          لا توجد بيانات مطابقة لخيارات البحث
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* SECTION 2: BOOKING EXPENSE TRACKER */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">

            {/* Expense KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">إجمالي الإيرادات المسجلة</p>
                  <p className="text-2xl font-black text-slate-900">{stats.totalRevenue.toLocaleString()} <span className="text-xs font-normal text-slate-500">ر.س</span></p>
                  <p className="text-xs text-emerald-600 mt-1">من {stats.totalBookings} حجوزات</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">إجمالي المصروفات المباشرة</p>
                  <p className="text-2xl font-black text-rose-600">{stats.totalExpenses.toLocaleString()} <span className="text-xs font-normal text-slate-500">ر.س</span></p>
                  <p className="text-xs text-rose-500 mt-1">عمالة وضيافة وتجهيزات</p>
                </div>
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">صافي الربح التقديري</p>
                  <p className="text-2xl font-black text-indigo-900">{stats.netProfit.toLocaleString()} <span className="text-xs font-normal text-slate-500">ر.س</span></p>
                  <p className="text-xs text-indigo-600 mt-1">بعد خصم جميع المصاريف</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">متوسط هامش الربح</p>
                  <p className="text-2xl font-black text-amber-600">{stats.profitMargin}%</p>
                  <p className="text-xs text-amber-600 mt-1">نسبة الربحية من الإيراد</p>
                </div>
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <PieIcon className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Header & Add Expense Button */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">جدول المصروفات المباشرة المقترنة بالحجوزات</h3>
                <p className="text-xs text-slate-500">ربط تكاليف العمالة والضيافة والكوشة بكل حجز لحساب صافي الربح الدقيق</p>
              </div>

              <button
                onClick={openAddExpenseModal}
                className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-5 py-2.5 rounded-xl shadow border border-amber-500/30 flex items-center justify-center gap-2 text-sm transition"
              >
                <Plus className="w-4 h-4" />
                تسجيل مصروف حجز جديد
              </button>
            </div>

            {/* Expense Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-900 text-slate-300 text-xs font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-4">رقم الحجز</th>
                      <th className="px-4 py-4">التاريخ</th>
                      <th className="px-5 py-4">اسم العميل</th>
                      <th className="px-4 py-4">نوع المكان</th>
                      <th className="px-4 py-4">قيمة الحجز (الإيراد)</th>
                      <th className="px-4 py-4">المباشرين والعمالة</th>
                      <th className="px-4 py-4">الضيافة والقهوة</th>
                      <th className="px-4 py-4">التجهيزات والكوشة</th>
                      <th className="px-4 py-4">إجمالي المصروفات</th>
                      <th className="px-4 py-4">صافي الربح</th>
                      <th className="px-4 py-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.length > 0 ? (
                      expenses.map((exp) => {
                        const totalExp = exp.laborCost + exp.hospitalityCost + exp.extraCost;
                        const profit = exp.revenue - totalExp;
                        return (
                          <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                            <td className="px-4 py-4 font-mono font-bold text-amber-700 bg-amber-50/50 rounded-lg">
                              {exp.bookingId}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                              {exp.date}
                            </td>
                            <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                              {exp.clientName}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                                {exp.venueType}
                              </span>
                            </td>
                            <td className="px-4 py-4 font-bold text-slate-900 whitespace-nowrap">
                              {exp.revenue.toLocaleString()} ر.س
                            </td>
                            <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                              {exp.laborCost.toLocaleString()} ر.س
                            </td>
                            <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                              {exp.hospitalityCost.toLocaleString()} ر.س
                            </td>
                            <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                              {exp.extraCost.toLocaleString()} ر.س
                            </td>
                            <td className="px-4 py-4 font-bold text-rose-600 whitespace-nowrap">
                              {totalExp.toLocaleString()} ر.س
                            </td>
                            <td className="px-4 py-4 font-black text-emerald-600 whitespace-nowrap">
                              {profit.toLocaleString()} ر.س
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                                <button
                                  onClick={() => openEditExpenseModal(exp)}
                                  className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                  title="تعديل"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteExpense(exp.id)}
                                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="حذف"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="11" className="text-center py-12 text-slate-400">
                          لا توجد مصروفات مسجلة حتى الآن
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* SECTION 3: CHARTS & ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Price Comparison Bar Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-amber-500" />
                      مقارنة أسعار المنافسين مع سعرنا المعتمد
                    </h3>
                    <p className="text-xs text-slate-500">تحليل مرئي يتوضح فيه فارق الأسعار بجميع الأماكن المجاورة</p>
                  </div>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={venueChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                      <Tooltip 
                        formatter={(value) => [`${value.toLocaleString()} ر.س`, '']}
                        labelFormatter={(label) => `المكان: ${label}`}
                        contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', border: 'none' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar dataKey="سعر المنافس" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="سعرنا المعتمد" fill="#0F172A" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Expense Breakdown Pie Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <PieIcon className="w-5 h-5 text-emerald-500" />
                      توزيع المصروفات التشغيلية المباشرة
                    </h3>
                    <p className="text-xs text-slate-500">نسبة تكلفة العمالة مقابل الضيافة والتجهيزات</p>
                  </div>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {expensePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value.toLocaleString()} ر.س`, 'المبلغ']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Strategic Summary Box */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-amber-500/30">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-amber-400 mb-1">ملخص وتوصيات التسعير الذكي</h4>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    بناءً على تحليلات السوق الحالية، يبلغ متوسط سعر القاعات المجاورة <strong className="text-white">{stats.avgHallPrice.toLocaleString()} ر.س</strong> مقترنة بسعركم المعتمد <strong className="text-amber-300">{basePrices.hall.toLocaleString()} ر.س</strong>. بينما متوسط الاستراحات هو <strong className="text-white">{stats.avgResortPrice.toLocaleString()} ر.س</strong> مقابل سعركم <strong className="text-amber-300">{basePrices.resort.toLocaleString()} ر.س</strong>.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">
                      نسبة هامش الربح الحالي: <strong className="text-emerald-400">{stats.profitMargin}%</strong>
                    </span>
                    <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">
                      أكبر بنود المصروفات: <strong className="text-amber-400">رواتب المباشرين والعمالة</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* MODAL 1: ADD / EDIT VENUE */}
      {showVenueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-amber-500/30">
              <h3 className="font-bold text-lg text-amber-400 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {editingVenue ? 'تعديل بيانات المكان المنافس' : 'إضافة قاعة / استراحة منافسة جديدة'}
              </h3>
              <button 
                onClick={() => setShowVenueModal(false)}
                className="text-slate-400 hover:text-white transition text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVenue} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المكان / المنافس *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: قاعة الأحلام للأفراح"
                  value={venueForm.name}
                  onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">النوع</label>
                  <select
                    value={venueForm.type}
                    onChange={(e) => setVenueForm({ ...venueForm, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                  >
                    <option value="قاعة أفراح">قاعة أفراح</option>
                    <option value="استراحة">استراحة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المسافة عنا (بالكيلومتر)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="مثال: 1.5"
                    value={venueForm.distance}
                    onChange={(e) => setVenueForm({ ...venueForm, distance: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">السعر المعتمد / نهاية الأسبوع (ر.س) *</label>
                  <input
                    type="number"
                    required
                    placeholder="مثال: 14000"
                    value={venueForm.price}
                    onChange={(e) => setVenueForm({ ...venueForm, price: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سعر وسط الأسبوع (اختياري)</label>
                  <input
                    type="number"
                    placeholder="مثال: 800"
                    value={venueForm.priceWeekday}
                    onChange={(e) => setVenueForm({ ...venueForm, priceWeekday: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التقييم (من 5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={venueForm.rating}
                  onChange={(e) => setVenueForm({ ...venueForm, rating: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الخدمات المضمنة بالسعر</label>
                <input
                  type="text"
                  placeholder="مثال: شاملة الضيافة والبوفيه والعمالة"
                  value={venueForm.services}
                  onChange={(e) => setVenueForm({ ...venueForm, services: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات / نقاط القوة والضعف</label>
                <textarea
                  rows="2"
                  placeholder="مثال: القاعة تجديدها حديث، موقف سيارات واسع"
                  value={venueForm.notes}
                  onChange={(e) => setVenueForm({ ...venueForm, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVenueModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-900 text-amber-400 hover:bg-slate-800 rounded-xl text-sm font-bold shadow transition"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT EXPENSE */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-amber-500/30">
              <h3 className="font-bold text-lg text-amber-400 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {editingExpense ? 'تعديل مصروفات الحجز' : 'تسجيل مصروفات حجز جديد'}
              </h3>
              <button 
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-white transition text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الحجز</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.bookingId}
                    onChange={(e) => setExpenseForm({ ...expenseForm, bookingId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الحجز</label>
                  <input
                    type="date"
                    required
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم العميل *</label>
                  <input
                    type="text"
                    required
                    placeholder="اسم صاحب الحجز"
                    value={expenseForm.clientName}
                    onChange={(e) => setExpenseForm({ ...expenseForm, clientName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع المكان المحجوز</label>
                  <select
                    value={expenseForm.venueType}
                    onChange={(e) => {
                      const type = e.target.value;
                      setExpenseForm({ 
                        ...expenseForm, 
                        venueType: type,
                        revenue: type === 'قاعة أفراح' ? basePrices.hall : basePrices.resort
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                  >
                    <option value="قاعة أفراح">قاعة أفراح</option>
                    <option value="استراحة">استراحة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">قيمة الحجز الإجمالية / الإيراد (ر.س) *</label>
                <input
                  type="number"
                  required
                  placeholder="المبلغ المستلم من العميل"
                  value={expenseForm.revenue}
                  onChange={(e) => setExpenseForm({ ...expenseForm, revenue: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-amber-700 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  تفاصيل المصروفات التشغيلية المباشرة:
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">المباشرين والعمالة</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={expenseForm.laborCost}
                      onChange={(e) => setExpenseForm({ ...expenseForm, laborCost: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">الضيافة والقهوة</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={expenseForm.hospitalityCost}
                      onChange={(e) => setExpenseForm({ ...expenseForm, hospitalityCost: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">الكوشة والتجهيزات</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={expenseForm.extraCost}
                      onChange={(e) => setExpenseForm({ ...expenseForm, extraCost: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات الحجز</label>
                <input
                  type="text"
                  placeholder="أي تفاصيل إضافية للحجز..."
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-900 text-amber-400 hover:bg-slate-800 rounded-xl text-sm font-bold shadow transition"
                >
                  حفظ المصروفات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SETTINGS (BASE PRICING) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-amber-500/30">
              <h3 className="font-bold text-lg text-amber-400 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                ضبط أسعارنا المعتمدة (المرجعية)
              </h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white transition text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                هذه الأسعار تُستخدم كمقياس مرجعي لحساب نسبة الفارق والتنافسية أوتوماتيكياً مع القاعات والاستراحات المنافسة في الجدول.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سعر قاعتنا المعتمد (ر.س)</label>
                <input
                  type="number"
                  value={basePrices.hall}
                  onChange={(e) => setBasePrices({ ...basePrices, hall: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سعر استراحتنا المعتمد (ر.س)</label>
                <input
                  type="number"
                  value={basePrices.resort}
                  onChange={(e) => setBasePrices({ ...basePrices, resort: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-6 py-2 bg-slate-900 text-amber-400 hover:bg-slate-800 rounded-xl text-sm font-bold shadow transition"
                >
                  حفظ وتطبيق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}