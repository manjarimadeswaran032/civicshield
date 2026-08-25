import React from 'react';
import { Eye, Shield, CheckCircle } from 'lucide-react';

export const AccessibilityPage = () => {
  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-900">Accessibility Statement</h1>
          <p className="text-slate-600 text-sm">WCAG 2.1 Level AA Compliance Commitment</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            CivicShield is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone, applying relevant accessibility standards.
          </p>
          <h3 className="text-base font-bold text-slate-900 pt-2">Conformance Measures</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>High-contrast typography with clear hierarchy and font weights</li>
            <li>Keyboard-navigable interactive controls and modal focus traps</li>
            <li>Descriptive ARIA attributes and screen-reader accessible forms</li>
            <li>Responsive layouts supporting up to 200% browser zoom without clipping</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
