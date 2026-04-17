import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskSummary } from '@/types';

interface VerificationStatusProps {
  status: TaskSummary['verificationStatus'];
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig = {
  success: {
    icon: CheckCircle2,
    label: 'Verified',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    iconColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    iconColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    iconColor: 'text-yellow-600',
    borderColor: 'border-yellow-200',
  },
  inconclusive: {
    icon: HelpCircle,
    label: 'Inconclusive',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    iconColor: 'text-gray-600',
    borderColor: 'border-gray-200',
  },
};

const sizeConfig = {
  sm: {
    icon: 'h-4 w-4',
    text: 'text-xs',
    padding: 'px-2 py-1',
  },
  md: {
    icon: 'h-5 w-5',
    text: 'text-sm',
    padding: 'px-3 py-1.5',
  },
  lg: {
    icon: 'h-6 w-6',
    text: 'text-base',
    padding: 'px-4 py-2',
  },
};

export function VerificationStatus({
  status,
  showLabel = true,
  size = 'md',
  className,
}: VerificationStatusProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border font-medium transition-all duration-200 animate-scale-in',
        config.bgColor,
        config.borderColor,
        config.textColor,
        sizeStyles.padding,
        className
      )}
    >
      <Icon className={cn(sizeStyles.icon, config.iconColor)} />
      {showLabel && <span className={sizeStyles.text}>{config.label}</span>}
    </div>
  );
}

export function VerificationStatusBadge({
  status,
  className,
}: {
  status: TaskSummary['verificationStatus'];
  className?: string;
}) {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all duration-200',
        config.bgColor,
        config.borderColor,
        config.textColor,
        className
      )}
    >
      {config.label.toUpperCase()}
    </div>
  );
}
