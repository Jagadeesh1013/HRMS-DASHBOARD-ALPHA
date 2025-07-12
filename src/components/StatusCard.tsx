import React from 'react';
import { motion } from 'framer-motion';

interface StatusCardProps {
  title: string;
  value: number;
  subtitle: string;
  color: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  subtitle,
  color,
  icon,
  onClick,
  isSelected = false,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-6 rounded-xl shadow-sm border transition-all cursor-pointer ${
        isSelected 
          ? 'border-blue-300 shadow-md bg-blue-50' 
          : 'border-gray-100 hover:shadow-md bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon && <div className="w-5 h-5 text-white">{icon}</div>}
          <div className={`w-3 h-3 rounded-full ${color.replace('bg-', 'bg-').split(' ')[0]}`}></div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-1">{title}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </motion.div>
  );
};

export default StatusCard;
