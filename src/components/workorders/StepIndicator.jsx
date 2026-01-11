import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

/**
 * Step indicator showing progress through multi-step form
 * @param {number} currentStep - Current active step (1-indexed)
 * @param {number} totalSteps - Total number of steps
 * @param {string[]} labels - Labels for each step
 */
export default function StepIndicator({ currentStep, totalSteps = 3, labels = [] }) {
    const defaultLabels = ['Client', 'Machine', 'Ordre de travail'];
    const stepLabels = labels.length > 0 ? labels : defaultLabels;

    return (
        <div className="flex items-center justify-between mb-6">
            {Array.from({ length: totalSteps }, (_, i) => {
                const step = i + 1;
                const isCompleted = step < currentStep;
                const isCurrent = step === currentStep;

                return (
                    <div key={step} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                                    isCompleted && 'bg-green-500 text-white',
                                    isCurrent && 'bg-primary text-primary-foreground',
                                    !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                                )}
                            >
                                {isCompleted ? <Check className="h-5 w-5" /> : step}
                            </div>
                            <span className={cn(
                                'text-xs mt-1 text-center',
                                isCurrent && 'font-semibold',
                                !isCompleted && !isCurrent && 'text-muted-foreground'
                            )}>
                                {stepLabels[i]}
                            </span>
                        </div>
                        {step < totalSteps && (
                            <div
                                className={cn(
                                    'flex-1 h-1 mx-2',
                                    isCompleted ? 'bg-green-500' : 'bg-muted'
                                )}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
