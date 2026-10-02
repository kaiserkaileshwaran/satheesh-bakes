import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, Send, CheckCircle2, Sparkles, ArrowLeft, RotateCcw, Store
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { FranchiseEnquiry } from '../../types';

/* ─── Types ─────────────────────────────────────────────────────────── */
type Stage = 'form' | 'submitting' | 'success' | 'error';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
}

/* ─── Confetti particle ──────────────────────────────────────────────── */
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle';
}

const CONFETTI_COLORS = ['#D4A017', '#F5E6C8', '#6B3A2A', '#E8834B', '#FFFDF7', '#B8860B'];

/* ─── Confetti Component ─────────────────────────────────────────────── */
const ConfettiCanvas: React.FC<{ active: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  const createParticles = useCallback(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 4 + Math.random() * 7,
        angle: Math.random() * Math.PI * 2,
        speed: 1.5 + Math.random() * 2.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    if (!active) { cancelAnimationFrame(rafRef.current); return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particlesRef.current.forEach(p => {
        if (p.y > canvas.height + 30) return;
        alive = true;
        p.y += p.speed;
        p.x += Math.sin(p.angle + p.y * 0.01) * 0.8;
        p.rotation += p.rotationSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.y / (canvas.height * 0.85));
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      if (alive) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, createParticles]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
};

/* ─── Premium Loading Spinner ────────────────────────────────────────── */
const Spinner: React.FC = () => (
  <motion.div
    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
    animate={{ rotate: 360 }}
    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    aria-hidden="true"
  />
);

/* ─── Validation ─────────────────────────────────────────────────────── */
function validate(data: Record<string, string>): FormErrors {
  const errs: FormErrors = {};
  if (!data.name.trim()) errs.name = 'Full name is required.';
  else if (data.name.trim().length < 2) errs.name = 'Please enter your full name.';

  if (!data.email.trim()) errs.email = 'Email address is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = 'Please enter a valid email address.';

  if (!data.phone.trim()) errs.phone = 'Phone number is required.';
  else if (!/^[\d\s+\-()]{7,15}$/.test(data.phone.trim())) errs.phone = 'Please enter a valid phone number.';

  if (!data.location.trim()) errs.location = 'Proposed location is required.';

  return errs;
}

/* ─── Input field component ──────────────────────────────────────── */
const Field: React.FC<{
  label: string; id: string; required?: boolean;
  type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; onBlur: () => void;
  error?: string; inputRef?: React.Ref<HTMLInputElement>;
}> = ({ label, id, required, type = 'text', placeholder, value, onChange, onBlur, error, inputRef }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-sm font-bold text-bakery-chocolate/80 dark:text-bakery-cream/80">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      ref={inputRef as React.Ref<HTMLInputElement>}
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`w-full px-4 py-3 rounded-xl border transition-all text-sm outline-none bg-white dark:bg-black/20 text-bakery-chocolate dark:text-bakery-cream focus:ring-2 ${
        error
          ? 'border-rose-400 focus:ring-rose-200 dark:focus:ring-rose-900'
          : 'border-bakery-beige focus:ring-bakery-gold'
      }`}
    />
    <AnimatePresence>
      {error && (
        <motion.p
          id={`${id}-error`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-rose-500 flex items-center gap-1.5 font-medium"
          role="alert"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────────── */
export const Franchise: React.FC = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);

  const [stage, setStage] = useState<Stage>('form');
  const [showConfetti, setShowConfetti] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', location: '',
    investmentBudget: '15L - 25L', hasExperience: 'false', message: '',
  });

  const set = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validate({ ...formData, [field]: value })[field as keyof FormErrors] }));
    }
  };

  const blur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validate(formData)[field as keyof FormErrors] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = { name: true, email: true, phone: true, location: true };
    setTouched(allTouched);
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStage('submitting');

    try {
      // Save locally
      const enquiry: FranchiseEnquiry = {
        id: `franchise-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        investmentBudget: formData.investmentBudget,
        hasExperience: formData.hasExperience === 'true',
        message: formData.message,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      StorageService.saveFranchiseEnquiry(enquiry);

      // Send to Formspree
      const response = await fetch('https://formspree.io/f/xeeywoav', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          investmentBudget: formData.investmentBudget,
          hasExperience: formData.hasExperience === 'true' ? 'Yes' : 'No',
          message: formData.message || 'N/A',
        }),
      });

      if (!response.ok) throw new Error('Formspree error');

      // Small pause for cinematic effect
      await new Promise(r => setTimeout(r, 600));
      setStage('success');
      setTimeout(() => { setShowConfetti(true); }, 400);
      setTimeout(() => { setShowConfetti(false); }, 4500);
    } catch {
      setStage('error');
    }
  };

  const resetForm = () => {
    setStage('form');
    setErrors({});
    setTouched({});
    setFormData({ name: '', email: '', phone: '', location: '', investmentBudget: '15L - 25L', hasExperience: 'false', message: '' });
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => firstInputRef.current?.focus(), 400);
    }, 300);
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ConfettiCanvas active={showConfetti} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-16 space-y-4"
      >
        <span className="text-xs font-bold text-bakery-gold uppercase tracking-wider inline-flex items-center gap-2">
          <Store className="w-4 h-4" /> Partner With Us
        </span>
        <h1 className="font-serif font-bold text-4xl sm:text-5xl text-bakery-chocolate dark:text-bakery-cream">
          Satheesh Bakery Franchise
        </h1>
        <p className="text-lg text-bakery-chocolate/80 dark:text-bakery-cream/80">
          Join Namakkal's most trusted artisanal bakery chain. We are expanding and looking for passionate business partners to grow with us.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto" ref={formSectionRef}>
          <AnimatePresence mode="wait">

            {/* ── FORM STATE ─────────────────────────────────────── */}
            {(stage === 'form' || stage === 'submitting' || stage === 'error') && (
              <motion.div
                key="form-card"
                initial={{ opacity: 0, y: 24 }}
                animate={{
                  opacity: stage === 'submitting' ? 0.55 : 1,
                  y: 0,
                  scale: stage === 'submitting' ? 0.985 : 1,
                  filter: stage === 'submitting' ? 'blur(1px)' : 'blur(0px)',
                }}
                exit={{ opacity: 0, scale: 0.94, y: -16, filter: 'blur(4px)', transition: { duration: 0.45, ease: 'easeInOut' } }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-bakery-chocolate border border-bakery-beige shadow-warm-lg relative overflow-hidden"
              >
                {/* Shimmer overlay while submitting */}
                <AnimatePresence>
                  {stage === 'submitting' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent z-10 pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                <h2 className="font-serif font-bold text-2xl text-bakery-chocolate dark:text-bakery-cream mb-6">
                  Franchise Application Form
                </h2>

                {/* Error Banner */}
                <AnimatePresence>
                  {stage === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                      className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3"
                      role="alert"
                    >
                      <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-rose-700 dark:text-rose-300">Unable to Send Enquiry</p>
                        <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">Something went wrong. Your data is safe — please try again in a few moments.</p>
                      </div>
                      <button
                        onClick={() => setStage('form')}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
                        aria-label="Retry submission"
                      >
                        Retry
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  noValidate
                  aria-label="Franchise enquiry form"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field
                      label="Full Name" id="name" required
                      value={formData.name} onChange={v => set('name', v)} onBlur={() => blur('name')}
                      error={errors.name} placeholder="e.g. Ravi Kumar"
                      inputRef={firstInputRef}
                    />
                    <Field
                      label="Phone Number" id="phone" required type="tel"
                      value={formData.phone} onChange={v => set('phone', v)} onBlur={() => blur('phone')}
                      error={errors.phone} placeholder="+91 99426 45000"
                    />
                  </div>

                  <Field
                    label="Email Address" id="email" required type="email"
                    value={formData.email} onChange={v => set('email', v)} onBlur={() => blur('email')}
                    error={errors.email} placeholder="you@example.com"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field
                      label="Proposed Location" id="location" required
                      value={formData.location} onChange={v => set('location', v)} onBlur={() => blur('location')}
                      error={errors.location} placeholder="e.g. Salem, Tamil Nadu"
                    />
                    <div className="space-y-1.5">
                      <label htmlFor="investmentBudget" className="text-sm font-bold text-bakery-chocolate/80 dark:text-bakery-cream/80">
                        Investment Budget <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="investmentBudget"
                        value={formData.investmentBudget}
                        onChange={e => set('investmentBudget', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-bakery-beige bg-white dark:bg-black/20 focus:ring-2 focus:ring-bakery-gold outline-none transition-all text-sm text-bakery-chocolate dark:text-bakery-cream"
                      >
                        <option value="15L - 25L">₹15 Lakhs – ₹25 Lakhs</option>
                        <option value="25L - 50L">₹25 Lakhs – ₹50 Lakhs</option>
                        <option value="50L+">₹50 Lakhs+</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="hasExperience" className="text-sm font-bold text-bakery-chocolate/80 dark:text-bakery-cream/80">
                      Prior F&amp;B Experience? <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="hasExperience"
                      value={formData.hasExperience}
                      onChange={e => set('hasExperience', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-bakery-beige bg-white dark:bg-black/20 focus:ring-2 focus:ring-bakery-gold outline-none transition-all text-sm text-bakery-chocolate dark:text-bakery-cream"
                    >
                      <option value="false">No, I am new to F&B</option>
                      <option value="true">Yes, I have F&B experience</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-sm font-bold text-bakery-chocolate/80 dark:text-bakery-cream/80">
                      Additional Details <span className="text-xs font-normal text-bakery-chocolate/40 dark:text-bakery-cream/40">(Optional)</span>
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={e => set('message', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-bakery-beige bg-white dark:bg-black/20 focus:ring-2 focus:ring-bakery-gold outline-none transition-all text-sm h-28 resize-none text-bakery-chocolate dark:text-bakery-cream"
                      placeholder="Tell us about yourself or the proposed location..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={stage === 'submitting'}
                    whileHover={stage !== 'submitting' ? { scale: 1.015 } : {}}
                    whileTap={stage !== 'submitting' ? { scale: 0.985 } : {}}
                    className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 relative overflow-hidden ${
                      stage === 'submitting'
                        ? 'bg-bakery-brown/60 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-bakery-brown to-bakery-chocolate text-bakery-cream shadow-warm hover:shadow-warm-lg'
                    }`}
                    aria-label={stage === 'submitting' ? 'Submitting your enquiry…' : 'Submit franchise enquiry'}
                  >
                    {/* Shimmer sweep */}
                    {stage !== 'submitting' && (
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
                        animate={{ translateX: ['−100%', '200%'] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                        aria-hidden="true"
                      />
                    )}
                    {stage === 'submitting' ? (
                      <>
                        <Spinner />
                        <span>Sending Enquiry…</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Enquiry</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ── SUCCESS STATE ───────────────────────────────────── */}
            {stage === 'success' && (
              <motion.div
                key="success-card"
                initial={{ opacity: 0, scale: 0.9, y: 30, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative p-8 sm:p-12 rounded-3xl overflow-hidden text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,253,247,0.97) 0%, rgba(245,230,200,0.97) 100%)',
                  boxShadow: '0 32px 80px rgba(107,58,42,0.18), 0 0 0 1px rgba(212,160,23,0.2)',
                  backdropFilter: 'blur(20px)',
                }}
                role="status"
                aria-live="polite"
                aria-label="Enquiry submitted successfully"
              >
                {/* Background shimmer */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(212,160,23,0.12) 0%, transparent 65%)',
                  }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  aria-hidden="true"
                />

                {/* ── Animated success icon ── */}
                <div className="flex items-center justify-center mb-8 relative">
                  {/* Outer glow ring */}
                  <motion.div
                    className="absolute w-28 h-28 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.25) 0%, transparent 70%)' }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    aria-hidden="true"
                  />
                  {/* Ring */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute w-24 h-24 rounded-full border-2 border-bakery-gold/30"
                    aria-hidden="true"
                  />
                  {/* Main circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.15, 1] }}
                    transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-20 h-20 rounded-full flex items-center justify-center relative z-10"
                    style={{ background: 'linear-gradient(135deg, #D4A017 0%, #6B3A2A 100%)', boxShadow: '0 8px 32px rgba(212,160,23,0.4)' }}
                  >
                    <motion.div
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ delay: 0.65, duration: 0.5 }}
                    >
                      <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </motion.div>
                  </motion.div>
                </div>

                {/* ── Stagger text content ── */}
                <motion.div
                  variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.55 } } }}
                  initial="hidden"
                  animate="show"
                  className="space-y-4 relative z-10"
                >
                  {/* Thank You */}
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}
                  >
                    <motion.span
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-bakery-brown/70 uppercase tracking-widest mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-bakery-gold" /> Enquiry Received
                    </motion.span>
                    <h2 className="font-serif font-bold text-3xl sm:text-4xl text-bakery-chocolate">
                      Thank You!
                    </h2>
                  </motion.div>

                  <motion.p
                    variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}
                    className="text-base text-bakery-chocolate/80 font-medium"
                  >
                    Your franchise enquiry has been sent successfully.
                  </motion.p>

                  <motion.p
                    variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}
                    className="text-sm text-bakery-chocolate/70 max-w-md mx-auto leading-relaxed"
                  >
                    Our franchise development team has received your request. We appreciate your interest in becoming a part of the <span className="font-semibold text-bakery-brown">Satheesh Bakery</span> family.
                  </motion.p>

                  <motion.p
                    variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}
                    className="text-sm text-bakery-chocolate/60 max-w-sm mx-auto leading-relaxed"
                  >
                    Our team will carefully review your enquiry and contact you as soon as possible. Please keep an eye on your email and phone for further communication.
                  </motion.p>

                  {/* Status pill */}
                  <motion.div
                    variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(212,160,23,0.15)', border: '1px solid rgba(212,160,23,0.3)', color: '#6B3A2A' }}
                  >
                    <motion.span
                      className="w-2 h-2 rounded-full bg-emerald-500"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    ✓ Request Submitted Successfully
                  </motion.div>

                  {/* Action buttons */}
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
                  >
                    <motion.button
                      onClick={() => navigate('/')}
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-bakery-cream flex items-center justify-center gap-2 shadow-warm"
                      style={{ background: 'linear-gradient(135deg, #6B3A2A 0%, #3E2723 100%)' }}
                      aria-label="Return to home page"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Return to Home
                    </motion.button>
                    <motion.button
                      onClick={resetForm}
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-bakery-brown/30 text-bakery-brown hover:bg-bakery-brown/5 transition-colors"
                      aria-label="Submit another franchise enquiry"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Submit Another Enquiry
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
  );
};
