/**
 * EduSphere AI - Enterprise School Onboarding Wizard
 * 10-step interactive wizard for initializing a new campus, fee structures, and academic sessions.
 */

import React, { useState } from "react";
import {
  Building, Palette, Calendar, GraduationCap, Users, CreditCard,
  Shield, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Check
} from "lucide-react";

interface OnboardingWizardProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
}

export default function OnboardingWizard({ onComplete, onCancel }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 10;

  // Form State
  const [formData, setFormData] = useState({
    schoolName: "Beaconhouse Margalla Campus",
    slug: "beaconhouse-isb",
    city: "Islamabad, Pakistan",
    email: "info@beaconhouse.edu.pk",
    phone: "+92 51 111 232 466",
    primaryColor: "#4f46e5",
    academicSession: "2025-2026",
    classes: ["Grade 9", "Grade 10", "Grade 11 (O-Level)", "Grade 12 (A-Level)"],
    sections: ["Section A (Morning)", "Section B (Evening)"],
    subjects: ["Physics", "Mathematics", "Chemistry", "Computer Science", "Urdu", "Islamiyat"],
    monthlyFeePKR: 45000,
    lateFeeFinePKR: 1500,
    adminName: "Campus Principal Office",
    adminEmail: "principal@beaconhouse.edu.pk",
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFinish = () => {
    onComplete(formData);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0f111a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Progress Header */}
        <div className="p-5 border-b border-white/10 bg-[#151824] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">School Onboarding & Setup Wizard</h2>
              <p className="text-xs text-gray-400">Step {currentStep} of {totalSteps}: Campus Initialization</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-xs text-gray-400 hover:text-white">
            Cancel
          </button>
        </div>

        {/* Step Progress Indicator */}
        <div className="w-full bg-white/5 h-1">
          <div
            className="bg-indigo-500 h-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">1. School & Campus Identity</h3>
              <p className="text-gray-400">Enter the official registered name and contact particulars.</p>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-300 font-medium">School / Institution Name</label>
                  <input
                    value={formData.schoolName}
                    onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-medium">Campus Location / City</label>
                  <input
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-300 font-medium">Official Email</label>
                    <input
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 font-medium">PTCL / Mobile Phone</label>
                    <input
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">2. Campus Branding & Visual Identity</h3>
              <p className="text-gray-400">Select your institution's theme color and brand accent.</p>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-300 font-medium">Primary Theme Color</label>
                  <div className="flex gap-3 mt-2">
                    {["#4f46e5", "#0ea5e9", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"].map(color => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, primaryColor: color })}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.primaryColor === color ? "border-white scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">3. Academic Session Configuration</h3>
              <p className="text-gray-400">Define the default academic calendar year.</p>
              <div>
                <label className="text-gray-300 font-medium">Session Title</label>
                <input
                  value={formData.academicSession}
                  onChange={e => setFormData({ ...formData, academicSession: e.target.value })}
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">4. Class & Grade Structure</h3>
              <p className="text-gray-400">Active class levels initialized for student enrollments.</p>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                {formData.classes.map((cls, i) => (
                  <div key={i} className="flex items-center gap-2 text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {cls}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">5. Section Allocation</h3>
              <p className="text-gray-400">Class sections initialized across all grades.</p>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                {formData.sections.map((sec, i) => (
                  <div key={i} className="flex items-center gap-2 text-white">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> {sec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">6. Academic Subject Matrix</h3>
              <p className="text-gray-400">Pakistani Board (Federal / Cambridge) subjects catalog.</p>
              <div className="grid grid-cols-2 gap-2">
                {formData.subjects.map((sub, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {sub}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">7. Fee Voucher & Bank Challan Rules (PKR)</h3>
              <p className="text-gray-400">Standard monthly tuition fee and late payment fine policies.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 font-medium">Standard Tuition Fee (PKR)</label>
                  <input
                    type="number"
                    value={formData.monthlyFeePKR}
                    onChange={e => setFormData({ ...formData, monthlyFeePKR: Number(e.target.value) })}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-medium">Late Payment Fine (PKR)</label>
                  <input
                    type="number"
                    value={formData.lateFeeFinePKR}
                    onChange={e => setFormData({ ...formData, lateFeeFinePKR: Number(e.target.value) })}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">8. Faculty Departments</h3>
              <p className="text-gray-400">Departmental hierarchy for staff assignments.</p>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-white">
                <div>• Science & Laboratories Department</div>
                <div>• Mathematics & Computing Department</div>
                <div>• Humanities & Languages Department</div>
              </div>
            </div>
          )}

          {currentStep === 9 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">9. Principal & Admin Credentials</h3>
              <p className="text-gray-400">Primary administrative account configuration.</p>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-300 font-medium">Administrator Name</label>
                  <input
                    value={formData.adminName}
                    onChange={e => setFormData({ ...formData, adminName: e.target.value })}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-medium">Administrator Email</label>
                  <input
                    value={formData.adminEmail}
                    onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 10 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Onboarding Setup Complete!</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {formData.schoolName} is ready to be launched. All academic session records, fee structures in PKR, and class rosters will be written to SQLite.
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-white/10 bg-[#151824] flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              currentStep === 1 ? "text-gray-600 cursor-not-allowed" : "text-gray-300 hover:text-white bg-white/5"
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Launch School Campus
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
