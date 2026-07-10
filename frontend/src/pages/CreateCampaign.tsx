import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateCampaign } from '@/hooks/useCampaigns';
import { useWallet } from '@/hooks/useWallet';
import { useAI } from '@/hooks/useAI';
import { useAdminStore } from '@/store/adminStore';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useNotification } from '@/contexts/NotificationContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Send,
  ListPlus,
  Info,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';

// ─── Admin Gate Modal ─────────────────────────────────────────────────────────
const AdminGate: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const login = useAdminStore((s) => s.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(password);
    if (ok) {
      onUnlock();
    } else {
      setError('Incorrect admin password.');
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/80 backdrop-blur-xl border border-stellar-500/30 rounded-2xl p-8 shadow-2xl shadow-stellar-500/10">
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stellar-600 to-aurora-purple flex items-center justify-center shadow-glow">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Admin Access Required</h2>
            <p className="text-slate-400 text-sm text-center">
              Only admins can create campaigns. Enter your admin password to continue.
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
              Unlock Campaign Creator
            </motion.button>

            <p className="text-center text-xs text-slate-500 mt-1">
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

// ─── Campaign Creator Form ────────────────────────────────────────────────────
const CampaignForm: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const { isConnected, address, signTransaction, connect } = useWallet();
  const { mutate: createCampaign, isPending: isDeploying } = useCreateCampaign();
  const adminWallet = useAdminStore((s) => s.adminWalletAddress);

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Environment');
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('30');
  const [milestones, setMilestones] = useState('3');
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState<string[]>(['', '']);

  const ai = useAI();

  const handleNextStep = () => {
    if (step === 1) {
      if (!title || !goal || Number(goal) <= 0) {
        notify.error('Please enter a valid campaign title and funding goal.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!description || description.length < 50) {
        notify.error('Please write a detailed description or generate one with AI.');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => setStep((prev) => Math.max(1, prev - 1));

  const handleAddHighlight = () => setHighlights([...highlights, '']);

  const handleHighlightChange = (i: number, val: string) => {
    const next = [...highlights];
    next[i] = val;
    setHighlights(next);
  };

  const handleGenerateAI = async () => {
    if (!title || !goal) {
      notify.error('Title and Goal are required to generate an AI description.');
      return;
    }
    try {
      const generated = await ai.generate({
        title,
        category,
        goalAmount: goal,
        highlights: highlights.filter(Boolean),
      });
      setDescription(generated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    // Use admin wallet as creator if configured, otherwise use connected wallet
    const creatorAddress = adminWallet || address;

    createCampaign(
      {
        params: {
          title,
          description,
          goalAmount: goal,
          deadline,
          milestoneCount: Number(milestones),
        },
        creatorAddress,
        signTx: signTransaction,
      },
      {
        onSuccess: (newCampaignId) => {
          notify.success('Campaign created! All donations will route to the admin wallet.');
          navigate(`/campaigns/${newCampaignId}`);
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-aurora-purple" />
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
            Create Campaign
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Admin-only: Campaigns you create will receive donations directly into the admin wallet.
          {adminWallet && (
            <span className="ml-1 text-stellar-400 font-mono">
              ({adminWallet.slice(0, 10)}...{adminWallet.slice(-6)})
            </span>
          )}
        </p>
      </div>

      {/* Step Stepper */}
      <div className="flex justify-between items-center bg-slate-900/60 border border-glass-border p-4 rounded-xl">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s
                  ? 'bg-button-gradient text-white shadow-glow shadow-stellar-500/30'
                  : step > s
                  ? 'bg-aurora-emerald text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {s}
            </div>
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                step === s ? 'text-stellar-300' : 'text-slate-500'
              }`}
            >
              {s === 1 ? 'Details' : s === 2 ? 'AI Copy' : 'Confirm'}
            </span>
            {s < 3 && <div className="w-8 h-[1px] bg-slate-800 hidden sm:block" />}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <Card hoverEffect={false}>
        {/* Step 1 */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <h3 className="text-sm font-bold text-slate-200 border-b border-glass-border/30 pb-2">
              Campaign Specifications
            </h3>

            <Input
              label="Campaign Title"
              placeholder="e.g. Solar panels for Greenfield community schools"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-slate-900/50 border border-glass-border rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-stellar-500/50 focus:border-stellar-500 transition"
                >
                  {['Environment', 'Education', 'Technology', 'Health', 'Infrastructure'].map(
                    (cat) => (
                      <option key={cat} value={cat} className="bg-slate-950">
                        {cat}
                      </option>
                    )
                  )}
                </select>
              </div>

              <Input
                label="Funding Goal (XLM)"
                type="number"
                placeholder="e.g. 5000"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                min="1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Campaign Duration (Days)"
                type="number"
                placeholder="e.g. 30"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min="1"
                required
              />

              <Input
                label="Milestone Release Steps"
                type="number"
                placeholder="e.g. 3"
                value={milestones}
                onChange={(e) => setMilestones(e.target.value)}
                min="1"
                max="10"
                required
              />
            </div>

            <div className="flex justify-end pt-3">
              <Button onClick={handleNextStep} className="flex items-center gap-2">
                Configure Copy <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <h3 className="text-sm font-bold text-slate-200 border-b border-glass-border/30 pb-2">
              Write or Generate Copy
            </h3>

            <div className="flex flex-col gap-3.5 bg-slate-950/40 p-4 rounded-xl border border-glass-border/40">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-stellar-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-aurora-cyan animate-pulse" />
                  StellarFlow AI description designer
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={handleGenerateAI}
                  isLoading={ai.isLoading}
                  className="text-[10px] py-1 bg-stellar-600/10 hover:bg-stellar-600/20 text-stellar-300"
                >
                  Generate Content
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                  Deliverables Highlights (Optional)
                </span>
                {highlights.map((h, i) => (
                  <input
                    key={i}
                    type="text"
                    value={h}
                    onChange={(e) => handleHighlightChange(i, e.target.value)}
                    placeholder={`e.g. Buy 10 solar batteries (Highlight ${i + 1})`}
                    className="bg-slate-900/40 border border-glass-border rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-stellar-500"
                  />
                ))}
                <button
                  type="button"
                  onClick={handleAddHighlight}
                  className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-200 mt-1 font-semibold"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  Add highlight row
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Full Description (Markdown supported)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project here, or use the generate button above..."
                className="bg-slate-900/50 border border-glass-border rounded-xl p-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-stellar-500/50 focus:border-stellar-500 transition h-48 resize-none font-sans leading-relaxed"
                required
              />
            </div>

            <div className="flex justify-between pt-3">
              <Button variant="secondary" onClick={handlePrevStep} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button onClick={handleNextStep} className="flex items-center gap-2">
                Review & Deploy <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <h3 className="text-sm font-bold text-slate-200 border-b border-glass-border/30 pb-2">
              Review Campaign Configuration
            </h3>

            <div className="grid grid-cols-2 gap-4 bg-slate-950/40 border border-glass-border p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-500 block">Title</span>
                <span className="font-bold text-slate-200">{title}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Category</span>
                <span className="font-bold text-slate-300">{category}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Goal Target</span>
                <span className="font-extrabold text-stellar-300">{goal} XLM</span>
              </div>
              <div>
                <span className="text-slate-500 block">Duration</span>
                <span className="font-bold text-slate-300">{deadline} Days</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Milestone Count</span>
                <span className="font-bold text-slate-300">{milestones} Steps</span>
              </div>
            </div>

            {/* Admin Wallet Notice */}
            {adminWallet && (
              <div className="bg-stellar-500/10 border border-stellar-500/30 rounded-xl p-3 flex gap-2 text-xs text-stellar-300">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold">Donations route to Admin Wallet</h5>
                  <p className="mt-1 font-mono break-all">{adminWallet}</p>
                </div>
              </div>
            )}

            {!isConnected ? (
              <div className="bg-aurora-amber/10 border border-aurora-amber/20 rounded-xl p-3 flex gap-2 text-xs text-aurora-amber">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold">Wallet not connected</h5>
                  <p className="mt-1 leading-relaxed">
                    Connect your Freighter wallet to deploy this campaign to Stellar Testnet.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-aurora-emerald/10 border border-aurora-emerald/20 rounded-xl p-3 flex gap-2 text-xs text-aurora-emerald">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold">Ready for deployment</h5>
                  <p className="mt-1 leading-relaxed font-semibold">Deployer: {address}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-3">
              <Button variant="secondary" onClick={handlePrevStep} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>

              {!isConnected ? (
                <Button variant="primary" type="button" onClick={() => connect()}>
                  Connect Wallet
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  isLoading={isDeploying}
                  className="flex items-center gap-2 bg-success-gradient"
                >
                  <Send className="w-4 h-4" />
                  Deploy Campaign
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── Main Page with Admin Gate ────────────────────────────────────────────────
export const CreateCampaign: React.FC = () => {
  const isAdminLoggedIn = useAdminStore((s) => s.isAdminLoggedIn);
  const [unlocked, setUnlocked] = useState(isAdminLoggedIn);

  return (
    <AnimatePresence mode="wait">
      {!unlocked ? (
        <motion.div key="gate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <AdminGate onUnlock={() => setUnlocked(true)} />
        </motion.div>
      ) : (
        <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <CampaignForm />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateCampaign;
