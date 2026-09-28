import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Shield,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AdminUser, SubscriptionPlan } from '../../types';
import { adminDb } from '../../services/adminStorage';
import { db } from '../../services/storage';
import { auditService } from '../../services/auditService';

interface AdminSubscriptionsTabProps {
  admin: AdminUser;
  language: 'bn' | 'en';
  onRefresh: () => void;
}

export const AdminSubscriptionsTab: React.FC<AdminSubscriptionsTabProps> = ({
  admin,
  language,
  onRefresh,
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(adminDb.getPlans());
  const [payments] = useState(adminDb.getPayments());
  const [platformConfig, setPlatformConfig] = useState(adminDb.getPlatformConfig());
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Form states
  const [planName, setPlanName] = useState('');
  const [planNameBn, setPlanNameBn] = useState('');
  const [planPrice, setPlanPrice] = useState(0);
  const [planCycle, setPlanCycle] = useState<SubscriptionPlan['billingCycle']>('monthly');
  const [planTrialDays, setPlanTrialDays] = useState(14);
  const [planStorageMB, setPlanStorageMB] = useState(500);
  const [planDeviceLimit, setPlanDeviceLimit] = useState(2);
  const [planFeatures, setPlanFeatures] = useState('');

  const showToast = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanNameBn(plan.nameBn);
    setPlanPrice(plan.priceBDT);
    setPlanCycle(plan.billingCycle);
    setPlanTrialDays(plan.trialDays);
    setPlanStorageMB(plan.storageLimitMB);
    setPlanDeviceLimit(plan.deviceLimit);
    setPlanFeatures(plan.features.join('\n'));
    setShowPlanModal(true);
  };

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setPlanName('');
    setPlanNameBn('');
    setPlanPrice(199);
    setPlanCycle('monthly');
    setPlanTrialDays(14);
    setPlanStorageMB(500);
    setPlanDeviceLimit(2);
    setPlanFeatures('Feature 1\nFeature 2');
    setShowPlanModal(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const featureList = planFeatures
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingPlan) {
      const previousPrice = editingPlan.priceBDT;
      const updated: SubscriptionPlan = {
        ...editingPlan,
        name: planName,
        nameBn: planNameBn,
        priceBDT: planPrice,
        billingCycle: planCycle,
        trialDays: planTrialDays,
        storageLimitMB: planStorageMB,
        deviceLimit: planDeviceLimit,
        features: featureList,
      };
      const list = plans.map((p) => (p.id === editingPlan.id ? updated : p));
      adminDb.savePlans(list);
      setPlans(list);

      auditService.logAction({
        action: 'PLAN_PRICE_UPDATED',
        category: 'subscription',
        severity: 'warning',
        targetEntity: {
          type: 'plan',
          id: editingPlan.id,
          name: planName,
        },
        changes: {
          field: 'priceBDT',
          previousValue: previousPrice,
          newValue: planPrice,
        },
        details: `Admin ${admin.name} updated subscription plan "${planName}". Price set to ৳${planPrice}/${planCycle}.`,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
        status: 'success',
      });

      showToast('Plan updated successfully');
    } else {
      const newPlan: SubscriptionPlan = {
        id: `plan_${Date.now()}`,
        name: planName,
        nameBn: planNameBn,
        priceBDT: planPrice,
        billingCycle: planCycle,
        trialDays: planTrialDays,
        storageLimitMB: planStorageMB,
        deviceLimit: planDeviceLimit,
        features: featureList,
        isActive: true,
      };
      const list = [...plans, newPlan];
      adminDb.savePlans(list);
      setPlans(list);

      auditService.logAction({
        action: 'PLAN_CREATED',
        category: 'subscription',
        severity: 'info',
        targetEntity: {
          type: 'plan',
          id: newPlan.id,
          name: planName,
        },
        details: `Admin ${admin.name} created new plan "${planName}" (৳${planPrice}/${planCycle}).`,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
        status: 'success',
      });

      showToast('New plan created successfully');
    }
    setShowPlanModal(false);
    onRefresh();
  };

  const handleTogglePaymentMethod = (key: keyof typeof platformConfig.allowedPaymentMethods) => {
    const updated = {
      ...platformConfig,
      allowedPaymentMethods: {
        ...platformConfig.allowedPaymentMethods,
        [key]: !platformConfig.allowedPaymentMethods[key],
      },
    };
    adminDb.savePlatformConfig(updated);
    setPlatformConfig(updated);

    auditService.logAction({
      action: 'PAYMENT_GATEWAY_CONFIGURED',
      category: 'settings',
      severity: 'warning',
      targetEntity: {
        type: 'setting',
        id: `gateway_${key}`,
        name: `Payment Gateway: ${key.toUpperCase()}`,
      },
      details: `Admin ${admin.name} toggled payment method "${key}" to ${updated.allowedPaymentMethods[key] ? 'ENABLED' : 'DISABLED'}.`,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      status: 'success',
    });

    showToast(`Updated payment method ${key}`);
  };

  const totalRevenue = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-5">
      {statusNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/90 border border-emerald-500/50 p-3 text-xs text-emerald-300">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Revenue Snapshot Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Total BDT Revenue Collected</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-num mt-1">৳{totalRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{payments.filter((p) => p.status === 'paid').length} Paid Invoices</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Default Trial Duration</span>
          <p className="text-xl sm:text-2xl font-black text-white font-num mt-1">{platformConfig.defaultTrialDays} Days</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Grace period: {platformConfig.gracePeriodDays} days</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Active Plans Available</span>
          <p className="text-xl sm:text-2xl font-black text-indigo-400 font-num mt-1">{plans.length} Tiers</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Free, Pro, Enterprise</p>
        </div>
      </div>

      {/* Plans Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Subscription Plans & Pricing Tiers</span>
          </h3>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Plan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-4 flex flex-col justify-between bg-slate-900/90 relative ${
                plan.isPopular ? 'border-indigo-500 shadow-lg shadow-indigo-950/40' : 'border-slate-800'
              }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase px-2 py-0.5 tracking-wider shadow-sm">
                  Most Popular
                </span>
              )}

              <div>
                <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                <p className="text-xs text-slate-400">{plan.nameBn}</p>

                <div className="mt-2.5 pb-2.5 border-b border-slate-800">
                  <span className="text-2xl font-black text-white font-num">
                    {plan.priceBDT === 0 ? 'Free' : `৳${plan.priceBDT}`}
                  </span>
                  {plan.priceBDT > 0 && (
                    <span className="text-xs text-slate-400 ml-1">/{plan.billingCycle}</span>
                  )}
                  <p className="text-[11px] text-emerald-400 mt-0.5">
                    {plan.trialDays > 0 ? `${plan.trialDays}-day free trial` : 'Instant free access'}
                  </p>
                </div>

                <div className="py-2.5 text-xs text-slate-300 space-y-1.5">
                  <p className="text-[11px] text-slate-400">
                    Storage: <strong className="text-white">{plan.storageLimitMB} MB</strong> · Devices: <strong className="text-white">{plan.deviceLimit}</strong>
                  </p>
                  <ul className="space-y-1 pt-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => handleOpenEdit(plan)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Gateway Configuration */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Supported Payment Gateways & Methods</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Admin can dynamically toggle accepted payment gateways for subscription purchases.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(
            [
              { key: 'bkash', label: 'bKash MFS' },
              { key: 'nagad', label: 'Nagad MFS' },
              { key: 'rocket', label: 'Rocket DBBL' },
              { key: 'card', label: 'Visa / Mastercard' },
              { key: 'bank', label: 'Direct Bank Transfer' },
            ] as const
          ).map((m) => {
            const isEnabled = platformConfig.allowedPaymentMethods[m.key];
            return (
              <div
                key={m.key}
                onClick={() => handleTogglePaymentMethod(m.key)}
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  isEnabled
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{m.label}</span>
                  <span className={`h-2 w-2 rounded-full ${isEnabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                </div>
                <span className="text-[10px] uppercase font-semibold mt-2">{isEnabled ? 'Active' : 'Disabled'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Edit Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white mb-4">
              {editingPlan ? 'Configure Subscription Plan' : 'Create New Subscription Plan'}
            </h3>

            <form onSubmit={handleSavePlan} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Plan Name (English)</label>
                  <input
                    type="text"
                    required
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Plan Name (বাংলা)</label>
                  <input
                    type="text"
                    required
                    value={planNameBn}
                    onChange={(e) => setPlanNameBn(e.target.value)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Price (BDT)</label>
                  <input
                    type="number"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white font-num focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Billing Cycle</label>
                  <select
                    value={planCycle}
                    onChange={(e) => setPlanCycle(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="free">Free</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Trial (Days)</label>
                  <input
                    type="number"
                    value={planTrialDays}
                    onChange={(e) => setPlanTrialDays(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white font-num focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Storage Limit (MB)</label>
                  <input
                    type="number"
                    value={planStorageMB}
                    onChange={(e) => setPlanStorageMB(parseInt(e.target.value) || 50)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white font-num focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Device Limit</label>
                  <input
                    type="number"
                    value={planDeviceLimit}
                    onChange={(e) => setPlanDeviceLimit(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white font-num focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Features (One per line)</label>
                <textarea
                  rows={4}
                  value={planFeatures}
                  onChange={(e) => setPlanFeatures(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 p-2.5 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
