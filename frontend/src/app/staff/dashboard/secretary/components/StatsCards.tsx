'use client';

import { Users, Calendar, Clock, CheckCircle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  badge?: number;
}

interface StatsCardsProps {
  stats: {
    pendingAppointments: number;
    todayAppointments: number;
    totalPatients: number;
    confirmedAppointments: number;
  };
  loading?: boolean;
}

const StatCard = ({ title, value, icon, bgColor, textColor, badge }: StatCardProps) => {
  return (
    <div className={`${bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>
      {/* Badge si > 5 pour RDV en attente */}
      {badge !== undefined && badge > 5 && (
        <div className="absolute top-3 right-3">
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            +{badge - 5}
          </span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <p className={`${textColor} text-sm font-medium opacity-80 mb-2`}>{title}</p>
          <p className={`${textColor} text-4xl font-bold`}>{value}</p>
        </div>
        <div className={`${textColor} opacity-20`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const StatsCards = ({ stats, loading = false }: StatsCardsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-200 rounded-xl p-6 animate-pulse h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* RDV en attente */}
      <StatCard
        title="RDV en attente"
        value={stats.pendingAppointments}
        icon={<Clock size={48} />}
        bgColor="bg-gradient-to-br from-orange-400 to-orange-600"
        textColor="text-white"
        badge={stats.pendingAppointments}
      />

      {/* RDV du jour */}
      <StatCard
        title="RDV du jour"
        value={stats.todayAppointments}
        icon={<Calendar size={48} />}
        bgColor="bg-gradient-to-br from-blue-400 to-blue-600"
        textColor="text-white"
      />

      {/* Total patients */}
      <StatCard
        title="Total patients"
        value={stats.totalPatients}
        icon={<Users size={48} />}
        bgColor="bg-gradient-to-br from-[#006D65] to-[#004d47]"
        textColor="text-white"
      />

      {/* RDV confirmés */}
      <StatCard
        title="RDV confirmés"
        value={stats.confirmedAppointments}
        icon={<CheckCircle size={48} />}
        bgColor="bg-gradient-to-br from-green-400 to-green-600"
        textColor="text-white"
      />
    </div>
  );
};

export default StatsCards;