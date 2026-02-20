import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface WizardStepProps {
    title: string;
    description?: string;
    icon?: React.ElementType;
    iconColor?: string; // e.g. "text-brand-orange"
    iconBgColor?: string; // e.g. "bg-brand-orange/10"
    currentStep: number;
    totalSteps: number;
    stepNumber: number;
    isActive: boolean;
    isCompleted: boolean;
    children: React.ReactNode;
    className?: string;
}

export function WizardStep({
    title,
    description,
    icon: Icon,
    iconColor = "text-brand-black",
    iconBgColor = "bg-brand-gray/10",
    currentStep,
    totalSteps,
    stepNumber,
    isActive,
    isCompleted,
    children,
    className
}: WizardStepProps) {
    if (!isActive) return null;

    return (
        <div className={cn("space-y-6 animate-in fade-in slide-in-from-right-8 duration-500", className)}>
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    {Icon && (
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", iconBgColor)}>
                            <Icon size={28} className={cn(iconColor)} />
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl font-black text-brand-black uppercase tracking-tighter">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-brand-slate font-bold text-sm opacity-60 uppercase tracking-wide mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate/40">Step</p>
                    <p className="text-4xl font-black text-brand-orange/20 tracking-tighter leading-none">
                        {stepNumber}<span className="text-lg text-brand-slate/10">/{totalSteps}</span>
                    </p>
                </div>
            </div>

            {/* Progress Bar (Mobile/Active) */}
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-brand-orange transition-all duration-500 ease-out"
                    style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
                />
            </div>

            {/* Content Body */}
            <div className="pt-4">
                {children}
            </div>
        </div>
    );
}
