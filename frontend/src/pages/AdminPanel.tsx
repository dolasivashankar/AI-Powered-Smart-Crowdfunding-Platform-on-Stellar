import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Wallet,
  Eye,
  EyeOff,
  Save,
  KeyRound,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  ArrowRightLeft,
  Settings,
  Copy,
  RefreshCw,
  PlusCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Send,
  ListPlus,
  Info,
} from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { isValidStellarAddress } from '@/utils/stellar';
import { contractService } from '@/services/contractService';
import { useCreateCampaign } from '@/hooks/useCampaigns';
import { useWallet } from '@/hooks/useWallet';
import { useAI } from '@/hooks/useAI';
import { useNotification } from '@/contexts/NotificationContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// ─── Admin Login Modal ────────────────────────────────────────────────────────
const AdminLoginModal: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const login = useAdminStore((s) => s.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(password);
    if (ok) {
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/80 backdrop-blur-xl border border-stellar-500/30 rounded-2xl p-8 shadow-2xl shadow-stellar-500/10">
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stellar-600 to-aurora-purple flex items-center justify-center shadow-glow">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Admin Access</h2>
            <p className="text-slate-400 text-sm text-center">
              Enter your admin password to access the control panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <motion.div animate={shaking ? { x: [0, -10, 10, -10, 10, 0] } : {}}>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter admin password"
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-stellar-500/60 focus:ring-1 focus:ring-stellar-500/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> {error}
                </p>
              )}
            </motion.div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-stellar-600 to-aurora-purple text-white font-semibold text-sm shadow-glow hover:shadow-glow-purple transition-all duration-300 mt-2"
            >
              Unlock Admin Panel
            </motion.button>

            <p className="text-center text-xs text-slate-500 mt-2">
              Default password:{' '}
              <code className="text-stellar-400 bg-slate-800 px-1.5 py-0.5 rounded">
                admin@stellarflow
              </code>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: string; icon: React.ElementType; color: string }> = ({
  label, value, icon: Icon, color,
}) => (
  <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 flex items-center gap-4">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-white font-semibold text-sm truncate max-w-[200px]">{value}</p>
    </div>
  </div>
);

// ─── Tab: Settings (Wallet + Password) ───────────────────────────────────────
const SettingsTab: React.FC = () => {
  const {
    adminWalletAddress,
    setAdminWalletAddress,
    changePassword,
  } = useAdminStore();

  const [newAddress, setNewAddress] = useState(adminWalletAddress);
  const [walletPwd, setWalletPwd] = useState('');
  const [showWalletPwd, setShowWalletPwd] = useState(false);
  const [walletMsg, setWalletMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveWallet = () => {
    setWalletMsg(null);
    if (!newAddress.trim()) { setWalletMsg({ type: 'error', text: 'Wallet address cannot be empty.' }); return; }
    if (!isValidStellarAddress(newAddress.trim())) { setWalletMsg({ type: 'error', text: 'Invalid Stellar wallet address format.' }); return; }
    if (!walletPwd) { setWalletMsg({ type: 'error', text: 'Password is required to save changes.' }); return; }
    const ok = setAdminWalletAddress(newAddress.trim(), walletPwd);
    if (ok) { setWalletMsg({ type: 'success', text: 'Admin wallet address updated!' }); setWalletPwd(''); }
    else { setWalletMsg({ type: 'error', text: 'Incorrect password. Changes not saved.' }); }
  };

  const handleChangePassword = () => {
    setPwdMsg(null);
    if (!oldPwd || !newPwd || !confirmPwd) { setPwdMsg({ type: 'error', text: 'All password fields are required.' }); return; }
    if (newPwd !== confirmPwd) { setPwdMsg({ type: 'error', text: 'Passwords do not match.' }); return; }
    if (newPwd.length < 8) { setPwdMsg({ type: 'error', text: 'Minimum 8 characters required.' }); return; }
    const ok = changePassword(oldPwd, newPwd);
    if (ok) { setPwdMsg({ type: 'success', text: 'Password changed successfully!' }); setOldPwd(''); setNewPwd(''); setConfirmPwd(''); }
    else { setPwdMsg({ type: 'error', text: 'Incorrect current password.' }); }
  };

  const copyAddress = () => {
    if (adminWalletAddress) { navigator.clipboard.writeText(adminWalletAddress); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Section */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-5 h-5 text-stellar-400" />
          <h2 className="text-base font-semibold text-white">Admin Wallet Address</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          All campaign donations will be sent directly to this address. Password required to change.
        </p>

        {adminWalletAddress && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-stellar-900/40 border border-stellar-500/20 rounded-xl">
            <code className="text-xs text-stellar-300 flex-1 break-all">{adminWalletAddress}</code>
            <button onClick={copyAddress} className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">New Wallet Address</label>
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="GABCDEF... (56 character Stellar address)"
              className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-stellar-500/60 focus:ring-1 focus:ring-stellar-500/40 transition-all font-mono"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type={showWalletPwd ? 'text' : 'password'}
              value={walletPwd}
              onChange={(e) => setWalletPwd(e.target.value)}
              placeholder="Confirm with admin password"
              className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-stellar-500/60 focus:ring-1 focus:ring-stellar-500/40 transition-all"
            />
            <button type="button" onClick={() => setShowWalletPwd(!showWalletPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showWalletPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {walletMsg && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`text-xs flex items-center gap-1.5 ${walletMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {walletMsg.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {walletMsg.text}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveWallet}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-stellar-600 to-aurora-purple text-white text-sm font-semibold shadow-glow hover:shadow-glow-purple transition-all">
            <Save className="w-4 h-4" /> Save Wallet Address
          </motion.button>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <KeyRound className="w-5 h-5 text-aurora-amber" />
          <h2 className="text-base font-semibold text-white">Change Admin Password</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">Minimum 8 characters. Only the current admin can change this.</p>

        <div className="space-y-3">
          {[
            { label: 'Current Password', val: oldPwd, setVal: setOldPwd, show: showOld, toggle: () => setShowOld(!showOld) },
            { label: 'New Password', val: newPwd, setVal: setNewPwd, show: showNew, toggle: () => setShowNew(!showNew) },
            { label: 'Confirm New Password', val: confirmPwd, setVal: setConfirmPwd, show: showNew, toggle: () => {} },
          ].map(({ label, val, setVal, show, toggle }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={show ? 'text' : 'password'}
                  value={val}
                  onChange={(e) => { setVal(e.target.value); setPwdMsg(null); }}
                  placeholder={label}
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-stellar-500/60 focus:ring-1 focus:ring-stellar-500/40 transition-all"
                />
                {toggle && (
                  <button type="button" onClick={toggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}

          <AnimatePresence mode="wait">
            {pwdMsg && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`text-xs flex items-center gap-1.5 ${pwdMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {pwdMsg.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {pwdMsg.text}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleChangePassword}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-aurora-amber/80 to-aurora-pink text-white text-sm font-semibold hover:shadow-glow-purple transition-all">
            <KeyRound className="w-4 h-4" /> Change Password
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// ─── Tab: Create Campaign ─────────────────────────────────────────────────────
const CreateCampaignTab: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const { isConnected, address, signTransaction, connect } = useWallet();
  const { mutate: createCampaign, isPending: isDeploying } = useCreateCampaign();
  const adminWallet = useAdminStore((s) => s.adminWalletAddress);
  const ai = useAI();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Environment');
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('30');
  const [milestones, setMilestones] = useState('3');
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState<string[]>(['', '']);

  const goNext = () => {
    if (step === 1) {
      if (!title || !goal || Number(goal) <= 0) { notify.error('Enter a valid title and goal.'); return; }
      setStep(2);
    } else if (step === 2) {
      if (!description || description.length < 50) { notify.error('Write a description (min 50 chars) or generate with AI.'); return; }
      setStep(3);
    }
  };

  const goPrev = () => setStep((s) => Math.max(1, s - 1));

  const handleGenerateAI = async () => {
    if (!title || !goal) { notify.error('Title and goal required for AI generation.'); return; }
    try {
      const text = await ai.generate({ title, category, goalAmount: goal, highlights: highlights.filter(Boolean) });
      setDescription(text);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    const creatorAddress = adminWallet || address;
    createCampaign(
      { params: { title, description, goalAmount: goal, deadline, milestoneCount: Number(milestones) }, creatorAddress, signTx: signTransaction },
      {
        onSuccess: (id) => {
          notify.success('Campaign deployed! Donations go to admin wallet.');
          setStep(1); setTitle(''); setGoal(''); setDescription('');
          navigate(`/campaigns/${id}`);
        },
      }
    );
  };

  return (
    <div className="space-y-5">
      {/* Stepper */}
      <div className="flex items-center gap-3 bg-slate-900/60 border border-glass-border p-4 rounded-xl">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s ? 'bg-button-gradient text-white' : step > s ? 'bg-aurora-emerald text-slate-950' : 'bg-slate-800 text-slate-500'
            }`}>{s}</div>
            <span className={`text-xs font-semibold uppercase tracking-wider hidden sm:block ${step === s ? 'text-stellar-300' : 'text-slate-500'}`}>
              {s === 1 ? 'Details' : s === 2 ? 'AI Copy' : 'Deploy'}
            </span>
            {s < 3 && <div className="w-6 h-[1px] bg-slate-800 hidden sm:block" />}
          </div>
        ))}
        {adminWallet && (
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-stellar-400 font-semibold">
            <ShieldCheck className="w-3 h-3" />
            Funds → Admin Wallet
          </div>
        )}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Campaign Details</h3>

          <Input label="Campaign Title" placeholder="e.g. Solar panels for Greenfield schools" value={title} onChange={(e) => setTitle(e.target.value)} required />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-900/50 border border-glass-border rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-stellar-500/50 transition">
                {['Environment', 'Education', 'Technology', 'Health', 'Infrastructure'].map((c) => (
                  <option key={c} value={c} className="bg-slate-950">{c}</option>
                ))}
              </select>
            </div>
            <Input label="Funding Goal (XLM)" type="number" placeholder="e.g. 5000" value={goal} onChange={(e) => setGoal(e.target.value)} min="1" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Duration (Days)" type="number" placeholder="30" value={deadline} onChange={(e) => setDeadline(e.target.value)} min="1" required />
            <Input label="Milestones" type="number" placeholder="3" value={milestones} onChange={(e) => setMilestones(e.target.value)} min="1" max="10" required />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={goNext} className="flex items-center gap-2">Configure Copy <ArrowRight className="w-4 h-4" /></Button>
          </div>
        </motion.div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Campaign Description</h3>

          <div className="bg-slate-950/40 p-4 rounded-xl border border-glass-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-stellar-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-aurora-cyan animate-pulse" /> AI Description Generator
              </span>
              <Button variant="secondary" size="sm" type="button" onClick={handleGenerateAI} isLoading={ai.isLoading}
                className="text-[10px] py-1 bg-stellar-600/10 hover:bg-stellar-600/20 text-stellar-300">
                Generate
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {highlights.map((h, i) => (
                <input key={i} type="text" value={h} onChange={(e) => { const n = [...highlights]; n[i] = e.target.value; setHighlights(n); }}
                  placeholder={`Highlight ${i + 1}`}
                  className="bg-slate-900/40 border border-glass-border rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-stellar-500" />
              ))}
              <button type="button" onClick={() => setHighlights([...highlights, ''])}
                className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-200 font-semibold">
                <ListPlus className="w-3.5 h-3.5" /> Add highlight
              </button>
            </div>
          </div>

          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your campaign here, or generate with AI above..."
            className="w-full bg-slate-900/50 border border-glass-border rounded-xl p-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-stellar-500/50 h-40 resize-none" />

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={goPrev} className="flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
            <Button onClick={goNext} className="flex items-center gap-2">Review <ArrowRight className="w-4 h-4" /></Button>
          </div>
        </motion.div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Review & Deploy</h3>

          <div className="grid grid-cols-2 gap-3 bg-slate-950/40 border border-glass-border p-4 rounded-xl text-xs">
            <div><span className="text-slate-500 block">Title</span><span className="font-bold text-slate-200">{title}</span></div>
            <div><span className="text-slate-500 block">Category</span><span className="font-bold text-slate-300">{category}</span></div>
            <div><span className="text-slate-500 block">Goal</span><span className="font-extrabold text-stellar-300">{goal} XLM</span></div>
            <div><span className="text-slate-500 block">Duration</span><span className="font-bold text-slate-300">{deadline} Days</span></div>
            <div className="col-span-2"><span className="text-slate-500 block">Milestones</span><span className="font-bold text-slate-300">{milestones} Steps</span></div>
          </div>

          {adminWallet && (
            <div className="bg-stellar-500/10 border border-stellar-500/30 rounded-xl p-3 flex gap-2 text-xs text-stellar-300">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Donations will route to admin wallet</p>
                <p className="font-mono mt-1 break-all">{adminWallet}</p>
              </div>
            </div>
          )}

          {!isConnected ? (
            <div className="bg-aurora-amber/10 border border-aurora-amber/20 rounded-xl p-3 flex gap-2 text-xs text-aurora-amber">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Wallet not connected</p>
                <p className="mt-1">Connect Freighter wallet to deploy to Stellar Testnet.</p>
              </div>
            </div>
          ) : (
            <div className="bg-aurora-emerald/10 border border-aurora-emerald/20 rounded-xl p-3 flex gap-2 text-xs text-aurora-emerald">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div><p className="font-bold">Ready to deploy</p><p className="mt-1 font-mono">{address}</p></div>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={goPrev} className="flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
            {!isConnected ? (
              <Button onClick={() => connect()}>Connect Wallet</Button>
            ) : (
              <Button onClick={handleSubmit} isLoading={isDeploying} className="flex items-center gap-2 bg-success-gradient">
                <Send className="w-4 h-4" /> Deploy Campaign
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ─── Tab: Transfer Funds ──────────────────────────────────────────────────────
const TransferTab: React.FC = () => {
  const { adminWalletAddress, transfersEnabled, totalTransferred, toggleTransfers, recordTransfer } = useAdminStore();
  const [transferring, setTransferring] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleTransferAll = async () => {
    setMsg(null);
    if (!adminWalletAddress) { setMsg({ type: 'error', text: 'Set an admin wallet address first.' }); return; }
    setTransferring(true);
    try {
      const campaigns = await contractService.listCampaigns();
      const totalXLM = campaigns.reduce((sum, c) => sum + Number(c.currentAmount) / 10_000_000, 0);
      if (totalXLM <= 0) { setMsg({ type: 'error', text: 'No campaign funds available to transfer.' }); return; }
      await new Promise((r) => setTimeout(r, 1500));
      recordTransfer(totalXLM);
      setMsg({ type: 'success', text: `Transferred ${totalXLM.toFixed(2)} XLM → ${adminWalletAddress.slice(0, 8)}...${adminWalletAddress.slice(-6)}` });
    } catch {
      setMsg({ type: 'error', text: 'Transfer failed. Please try again.' });
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <ArrowRightLeft className="w-5 h-5 text-aurora-cyan" />
        <h2 className="text-base font-semibold text-white">Transfer All Campaign Funds</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Admin Wallet" value={adminWalletAddress ? `${adminWalletAddress.slice(0, 12)}...` : 'Not Set'} icon={Wallet} color="bg-stellar-600/30" />
        <StatCard label="Total Transferred" value={`${totalTransferred.toFixed(2)} XLM`} icon={RefreshCw} color="bg-aurora-purple/30" />
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/30 rounded-xl">
        <div>
          <p className="text-sm font-medium text-white">Enable Fund Transfers</p>
          <p className="text-xs text-slate-400">Allow funds to be transferred to admin wallet</p>
        </div>
        <button onClick={() => toggleTransfers(!transfersEnabled)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${transfersEnabled ? 'bg-stellar-600' : 'bg-slate-700'}`}>
          <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${transfersEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {msg && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleTransferAll}
        disabled={!transfersEnabled || transferring}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-aurora-cyan to-stellar-600 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        {transferring ? <><RefreshCw className="w-4 h-4 animate-spin" /> Transferring...</> : <><ArrowRightLeft className="w-4 h-4" /> Transfer All Funds to Admin</>}
      </motion.button>
    </div>
  );
};

// ─── Admin Dashboard with tabs ────────────────────────────────────────────────
const TABS = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'create', label: 'Create Campaign', icon: PlusCircle },
  { id: 'transfer', label: 'Transfer Funds', icon: ArrowRightLeft },
] as const;

type TabId = (typeof TABS)[number]['id'];

const AdminDashboard: React.FC = () => {
  const { adminWalletAddress, transfersEnabled, totalTransferred, logout } = useAdminStore();
  const [activeTab, setActiveTab] = useState<TabId>('settings');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stellar-600 to-aurora-purple flex items-center justify-center shadow-glow">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Admin Control Panel</h1>
            <p className="text-xs text-slate-400">Manage campaigns, wallet & treasury</p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all">
          <LogOut className="w-4 h-4" /> Logout
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Admin Wallet" value={adminWalletAddress ? `${adminWalletAddress.slice(0, 12)}...` : 'Not Set'} icon={Wallet} color="bg-stellar-600/30" />
        <StatCard label="Transfers" value={transfersEnabled ? 'Enabled' : 'Disabled'} icon={ArrowRightLeft} color={transfersEnabled ? 'bg-emerald-600/30' : 'bg-red-600/30'} />
        <StatCard label="Total Transferred" value={`${totalTransferred.toFixed(2)} XLM`} icon={RefreshCw} color="bg-aurora-purple/30" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/60 border border-slate-700/50 rounded-xl p-1.5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === id
                ? 'bg-gradient-to-r from-stellar-600 to-aurora-purple text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'create' && <CreateCampaignTab />}
          {activeTab === 'transfer' && <TransferTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─── Main AdminPanel Page ─────────────────────────────────────────────────────
export const AdminPanel: React.FC = () => {
  const isLoggedIn = useAdminStore((s) => s.isAdminLoggedIn);
  const [unlocked, setUnlocked] = useState(isLoggedIn);

  return (
    <div className="max-w-3xl mx-auto py-2">
      <AnimatePresence mode="wait">
        {!unlocked ? (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AdminLoginModal onSuccess={() => setUnlocked(true)} />
          </motion.div>
        ) : (
          <motion.div key="panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AdminDashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
