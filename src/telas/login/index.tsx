import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft,
  Fingerprint, CloudOff, AlertCircle, RefreshCw, CheckCircle,
  User, X,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────

export type AuthScreen =
  | "splash"
  | "onboarding"
  | "login"
  | "create-account"
  | "forgot-password"
  | "verify-code"
  | "new-password"
  | "password-changed";

type LoginVariant =
  | "default"
  | "focused"
  | "filled"
  | "password-visible"
  | "error-validation"
  | "error-credential"
  | "loading"
  | "offline"
  | "locked"
  | "biometric";

// ── Tokens ────────────────────────────────────────────────────────

const T = {
  bg: "#0F1115",
  surface: "#171A21",
  elevated: "#1E222B",
  border: "#262B36",
  text: "#E8EAED",
  sub: "#9AA0AC",
  placeholder: "#6B7280",
  brand: "#4F6BED",
  success: "#3FB27F",
  warning: "#D9A441",
  error: "#D9534F",
};

// ── SplashScreen ──────────────────────────────────────────────────

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 1800;
    const raf = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / duration, 1);
      setProgress(pct);
      if (pct < 1) requestAnimationFrame(raf);
      else setTimeout(onDone, 150);
    };
    requestAnimationFrame(raf);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center justify-center h-full" style={{ background: T.bg }}>
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        {/* Logo mark */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
          style={{ background: T.brand }}
        >
          <span className="text-white font-bold text-3xl" style={{ letterSpacing: "-1px" }}>O</span>
        </div>
        <p className="font-semibold text-[28px]" style={{ color: T.text, letterSpacing: "-0.4px" }}>Ordena</p>
        <p className="text-[13px]" style={{ color: T.sub }}>Organize. Priorize. Entregue.</p>
      </div>

      {/* Progress bar */}
      <div className="w-full px-0 pb-0">
        <div className="h-[2px]" style={{ background: T.border }}>
          <div
            className="h-full transition-none"
            style={{ width: `${progress * 100}%`, background: T.brand }}
          />
        </div>
      </div>
    </div>
  );
}

// ── OnboardingScreen ──────────────────────────────────────────────

const ONBOARDING_SLIDES = [
  {
    title: "Organize tudo em um lugar",
    body: "Crie tarefas, adicione subtarefas e agrupe por projeto. Sua lista, do jeito que funciona para você.",
    illustration: (
      <svg width="200" height="140" viewBox="0 0 200 140" fill="none">
        <rect x="20" y="20" width="160" height="100" rx="8" stroke="#4F6BED" strokeWidth="1.5" />
        <rect x="36" y="40" width="80" height="2" rx="1" fill="#9AA0AC" />
        <rect x="36" y="54" width="60" height="2" rx="1" fill="#9AA0AC" />
        <rect x="36" y="68" width="100" height="2" rx="1" fill="#9AA0AC" />
        <rect x="36" y="82" width="70" height="2" rx="1" fill="#9AA0AC" />
        <circle cx="26" cy="40" r="3.5" stroke="#4F6BED" strokeWidth="1.5" />
        <circle cx="26" cy="54" r="3.5" stroke="#4F6BED" strokeWidth="1.5" />
        <circle cx="26" cy="68" r="3.5" fill="#4F6BED" />
        <circle cx="26" cy="82" r="3.5" stroke="#4F6BED" strokeWidth="1.5" />
        <rect x="130" y="40" width="34" height="16" rx="4" stroke="#3FB27F" strokeWidth="1.5" />
        <rect x="130" y="62" width="34" height="16" rx="4" stroke="#D9A441" strokeWidth="1.5" />
        <rect x="130" y="84" width="34" height="16" rx="4" stroke="#4F6BED" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Priorize pelo que importa",
    body: "A Matriz de Eisenhower distribui automaticamente suas tarefas nos quadrantes certos. Foque no que é urgente e importante.",
    illustration: (
      <svg width="200" height="140" viewBox="0 0 200 140" fill="none">
        <line x1="100" y1="10" x2="100" y2="130" stroke="#262B36" strokeWidth="1.5" />
        <line x1="10" y1="70" x2="190" y2="70" stroke="#262B36" strokeWidth="1.5" />
        <text x="55" y="40" textAnchor="middle" fontSize="9" fill="#D9534F">Fazer agora</text>
        <text x="145" y="40" textAnchor="middle" fontSize="9" fill="#4F6BED">Agendar</text>
        <text x="55" y="105" textAnchor="middle" fontSize="9" fill="#D9A441">Interrupções</text>
        <text x="145" y="105" textAnchor="middle" fontSize="9" fill="#9AA0AC">Baixo impacto</text>
        <rect x="18" y="18" width="72" height="42" rx="6" stroke="#D9534F" strokeWidth="1.5" strokeDasharray="0" opacity="0.7" />
        <rect x="110" y="18" width="72" height="42" rx="6" stroke="#4F6BED" strokeWidth="1.5" opacity="0.7" />
        <rect x="18" y="78" width="72" height="42" rx="6" stroke="#D9A441" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.5" />
        <rect x="110" y="78" width="72" height="42" rx="6" stroke="#9AA0AC" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.3" />
      </svg>
    ),
  },
  {
    title: "Funciona sem internet",
    body: "Suas tarefas ficam salvas no próprio aparelho, então você usa o app mesmo sem conexão.",
    illustration: (
      <svg width="200" height="140" viewBox="0 0 200 140" fill="none">
        <rect x="72" y="20" width="56" height="72" rx="8" stroke="#9AA0AC" strokeWidth="1.5" />
        <rect x="80" y="28" width="40" height="4" rx="2" fill="#9AA0AC" opacity="0.5" />
        <rect x="80" y="38" width="30" height="4" rx="2" fill="#9AA0AC" opacity="0.4" />
        <rect x="80" y="48" width="36" height="4" rx="2" fill="#9AA0AC" opacity="0.3" />
        <rect x="80" y="58" width="24" height="4" rx="2" fill="#9AA0AC" opacity="0.2" />
        <circle cx="100" cy="110" r="18" stroke="#4F6BED" strokeWidth="1.5" />
        <path d="M93 110 L98 115 L108 105" stroke="#3FB27F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M55 80 L40 95 M40 95 L55 95" stroke="#4F6BED" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M145 80 L160 95 M160 95 L145 95" stroke="#4F6BED" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </svg>
    ),
  },
];

export function OnboardingScreen({ onDone, onSkip }: { onDone: () => void; onSkip: () => void }) {
  const [slide, setSlide] = useState(0);
  const current = ONBOARDING_SLIDES[slide];
  const isLast = slide === ONBOARDING_SLIDES.length - 1;

  return (
    <div className="flex flex-col h-full px-6" style={{ background: T.bg }}>
      {/* Status bar spacer */}
      <div className="flex justify-end pt-4 pb-2">
        <button
          onClick={onSkip}
          className="text-[13px] font-medium"
          style={{ color: T.sub }}
        >
          Pular
        </button>
      </div>

      {/* Illustration */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-10 flex items-center justify-center">
          {current.illustration}
        </div>

        <h2 className="text-[22px] font-semibold text-center mb-3" style={{ color: T.text }}>
          {current.title}
        </h2>
        <p className="text-[14px] text-center leading-[22px]" style={{ color: T.sub, maxWidth: 300 }}>
          {current.body}
        </p>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {ONBOARDING_SLIDES.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === slide ? 20 : 6,
              height: 6,
              background: i === slide ? T.brand : T.border,
            }}
          />
        ))}
      </div>

      {/* Button */}
      <div className="pb-10">
        <button
          onClick={() => isLast ? onDone() : setSlide(s => s + 1)}
          className="w-full h-[52px] rounded-[10px] flex items-center justify-center gap-2 font-semibold text-[15px] transition-colors"
          style={{ background: T.brand, color: "#fff" }}
        >
          {isLast ? "Começar" : "Avançar"}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ── LoginScreen ───────────────────────────────────────────────────

function PasswordStrengthBar({ password }: { password: string }) {
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  const colors = ["", T.error, T.warning, T.warning, T.success];
  const labels = ["", "Fraca", "Média", "Boa", "Forte"];

  if (!password) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : T.border }}
          />
        ))}
      </div>
      {score > 0 && (
        <p className="text-[11px]" style={{ color: colors[score] }}>{labels[score]}</p>
      )}
    </div>
  );
}

export function LoginScreen({
  onLogin,
  onCreateAccount,
  onForgotPassword,
}: {
  onLogin: () => void;
  onCreateAccount: () => void;
  onForgotPassword: () => void;
}) {
  const [variant, setVariant] = useState<LoginVariant>("default");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [lockTimer, setLockTimer] = useState(120);
  const [attempts, setAttempts] = useState(0);
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const lockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isOffline = variant === "offline";
  const isLocked = variant === "locked";
  const isLoading = variant === "loading";
  const isBiometric = variant === "biometric";

  useEffect(() => {
    if (isLocked) {
      setLockTimer(120);
      lockIntervalRef.current = setInterval(() => {
        setLockTimer(t => {
          if (t <= 1) {
            clearInterval(lockIntervalRef.current!);
            setVariant("default");
            setAttempts(0);
            return 120;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (lockIntervalRef.current) clearInterval(lockIntervalRef.current); };
  }, [isLocked]);

  const fmtTimer = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleLogin = () => {
    if (!email.includes("@")) {
      setEmailError("Informe um e-mail válido");
      setVariant("error-validation");
      return;
    }
    setEmailError("");
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (newAttempts >= 5) { setVariant("locked"); return; }
    setVariant("loading");
    setTimeout(() => {
      if (email === "lucas@email.com" && password === "senha123") {
        onLogin();
      } else {
        setVariant("error-credential");
      }
    }, 1400);
  };

  const inputBase = (focused: boolean, hasError: boolean) => ({
    background: T.surface,
    border: `1px solid ${hasError ? T.error : focused ? T.brand : T.border}`,
    borderRadius: 10,
    color: T.text,
    outline: "none",
  });

  const labelColor = (focused: boolean, hasError: boolean) =>
    hasError ? T.error : focused ? T.brand : T.sub;

  return (
    <div className="relative flex flex-col h-full" style={{ background: T.bg }}>
      {/* Offline banner */}
      {isOffline && (
        <div
          className="flex items-center gap-2 px-4 py-0 flex-none"
          style={{ height: 44, background: T.elevated, borderBottom: `1px solid ${T.border}` }}
        >
          <CloudOff size={13} style={{ color: T.sub }} />
          <p className="text-[12px]" style={{ color: T.sub }}>
            Sem conexão. É necessário estar online para entrar.
          </p>
        </div>
      )}

      {/* Credential error banner */}
      {variant === "error-credential" && (
        <div
          className="flex items-center gap-2 px-4 flex-none"
          style={{ height: 44, background: "#2A1A1C", borderLeft: `3px solid ${T.error}` }}
        >
          <AlertCircle size={13} style={{ color: T.error }} />
          <p className="text-[12px]" style={{ color: "#F4B8B8" }}>
            E-mail ou senha incorretos. Verifique e tente novamente.
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-6 pb-8">
        {/* Brand */}
        <div className="mb-10 mt-2">
          <p
            className="font-semibold mb-1"
            style={{ fontSize: 28, letterSpacing: "-0.4px", color: T.text }}
          >
            Ordena
          </p>
          <p style={{ fontSize: 13, color: T.sub }}>Organize. Priorize. Entregue.</p>
        </div>

        {/* Title */}
        <h1 className="font-semibold mb-1" style={{ fontSize: 26, color: T.text }}>
          Entrar
        </h1>
        <p className="mb-8" style={{ fontSize: 14, color: T.sub }}>
          Acesse sua conta para continuar
        </p>

        {/* Email field */}
        <div className="mb-4">
          <label
            className="block text-[13px] font-medium mb-1.5"
            style={{ color: labelColor(emailFocused, !!emailError) }}
          >
            E-mail
          </label>
          <div
            className="flex items-center gap-3 px-4"
            style={{ ...inputBase(emailFocused, !!emailError), height: 52 }}
          >
            <Mail size={18} style={{ color: T.placeholder, flexShrink: 0 }} />
            <input
              ref={emailRef}
              type="email"
              placeholder="seu@email.com"
              value={email}
              disabled={isLoading || isLocked}
              onChange={e => { setEmail(e.target.value); setEmailError(""); setVariant("filled"); }}
              onFocus={() => { setEmailFocused(true); setVariant("focused"); }}
              onBlur={() => setEmailFocused(false)}
              className="flex-1 bg-transparent text-[14px] outline-none"
              style={{ color: T.text, opacity: (isLoading || isLocked) ? 0.6 : 1 }}
            />
          </div>
          {emailError && (
            <div className="flex items-center gap-1 mt-1">
              <AlertCircle size={13} style={{ color: T.error }} />
              <p className="text-[12px]" style={{ color: T.error }}>{emailError}</p>
            </div>
          )}
        </div>

        {/* Password field */}
        <div className="mb-3">
          <label
            className="block text-[13px] font-medium mb-1.5"
            style={{ color: labelColor(passFocused, false) }}
          >
            Senha
          </label>
          <div
            className="flex items-center gap-3 px-4"
            style={{ ...inputBase(passFocused, false), height: 52 }}
          >
            <Lock size={18} style={{ color: T.placeholder, flexShrink: 0 }} />
            <input
              ref={passRef}
              type={showPass || variant === "password-visible" ? "text" : "password"}
              placeholder="Sua senha"
              value={password}
              disabled={isLoading || isLocked}
              onChange={e => { setPassword(e.target.value); setVariant(email ? "filled" : "default"); }}
              onFocus={() => setPassFocused(true)}
              onBlur={() => setPassFocused(false)}
              className="flex-1 bg-transparent text-[14px] outline-none"
              style={{ color: T.text, opacity: (isLoading || isLocked) ? 0.6 : 1 }}
            />
            <button
              onClick={() => {
                setShowPass(s => !s);
                setVariant(v => v === "password-visible" ? "filled" : "password-visible");
              }}
              className="flex-none"
              style={{ color: T.placeholder }}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div className="flex justify-end mb-8">
          <button
            onClick={onForgotPassword}
            className="text-[13px] font-medium"
            style={{ color: T.brand }}
          >
            Esqueci minha senha
          </button>
        </div>

        {/* Locked state */}
        {isLocked && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-[10px] mb-4"
            style={{ background: T.elevated, border: `1px solid ${T.border}` }}
          >
            <Lock size={16} style={{ color: T.error }} />
            <p className="text-[13px] flex-1" style={{ color: T.text }}>
              Muitas tentativas. Tente novamente em{" "}
              <span className="font-semibold font-mono" style={{ color: T.error }}>
                {fmtTimer(lockTimer)}
              </span>
            </p>
          </div>
        )}

        {/* Primary button */}
        <button
          onClick={isLocked || isOffline ? undefined : handleLogin}
          disabled={isLocked || isOffline}
          className="w-full flex items-center justify-center gap-2 font-semibold text-[15px] rounded-[10px] mb-4 transition-all"
          style={{
            height: 52,
            background: (isLocked || isOffline) ? T.elevated : T.brand,
            color: (isLocked || isOffline) ? T.sub : "#fff",
            opacity: (isLocked || isOffline) ? 0.7 : 1,
            cursor: (isLocked || isOffline) ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              Entrando...
            </>
          ) : "Entrar"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: T.border }} />
          <p className="text-[12px]" style={{ color: T.sub }}>ou</p>
          <div className="flex-1 h-px" style={{ background: T.border }} />
        </div>

        {/* Google button */}
        <button
          className="w-full flex items-center justify-center gap-2.5 font-medium text-[14px] rounded-[10px] mb-3 transition-colors"
          style={{
            height: 52,
            border: `1px solid ${T.border}`,
            background: "transparent",
            color: T.text,
          }}
        >
          {/* Google "G" mark */}
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continuar com Google
        </button>

        {/* Biometrics button */}
        <button
          onClick={() => setVariant("biometric")}
          className="w-full flex items-center justify-center gap-2.5 font-medium text-[14px] rounded-[10px] transition-colors"
          style={{
            height: 52,
            border: `1px solid ${T.border}`,
            background: "transparent",
            color: T.text,
          }}
        >
          <Fingerprint size={20} style={{ color: T.brand }} />
          Entrar com biometria
        </button>

        {/* Test credentials hint */}
        <p className="text-center mt-4 text-[11px] font-mono" style={{ color: T.border }}>
          lucas@email.com / senha123
        </p>
      </div>

      {/* Footer */}
      <div className="flex-none py-5 flex items-center justify-center gap-1">
        <span className="text-[14px]" style={{ color: T.sub }}>Não tem uma conta?</span>
        <button
          onClick={onCreateAccount}
          className="text-[14px] font-semibold"
          style={{ color: T.brand }}
        >
          Criar conta
        </button>
      </div>

      {/* Biometric overlay */}
      {isBiometric && (
        <div
          className="absolute inset-0 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.6)", zIndex: 50 }}
          onClick={e => { if (e.target === e.currentTarget) setVariant("default"); }}
        >
          <div
            className="w-full rounded-t-3xl p-6 pb-10 flex flex-col items-center"
            style={{ background: T.surface }}
          >
            <div className="w-10 h-1 rounded-full mb-5" style={{ background: T.border }} />
            <Fingerprint size={48} style={{ color: T.brand }} className="mb-4" />
            <p className="font-semibold text-[18px] mb-2 text-center" style={{ color: T.text }}>
              Confirme sua identidade
            </p>
            <p className="text-[14px] text-center mb-8" style={{ color: T.sub }}>
              Use sua digital para entrar no Ordena
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setVariant("default")}
                className="flex-1 h-[52px] rounded-[10px] font-medium text-[14px]"
                style={{ border: `1px solid ${T.border}`, color: T.text }}
              >
                Cancelar
              </button>
              <button
                onClick={onLogin}
                className="flex-1 h-[52px] rounded-[10px] font-semibold text-[14px]"
                style={{ background: T.brand, color: "#fff" }}
              >
                Usar senha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CreateAccountScreen ───────────────────────────────────────────

export function CreateAccountScreen({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const rules = [
    { label: "Mínimo de 8 caracteres", ok: hasLength },
    { label: "Uma letra maiúscula", ok: hasUpper },
    { label: "Um número", ok: hasNumber },
    { label: "Um caractere especial", ok: hasSpecial },
  ];

  const submit = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Informe seu nome completo";
    if (!email.includes("@")) e.email = "Informe um e-mail válido";
    if (!hasLength) e.password = "A senha não atende aos requisitos mínimos";
    if (password !== confirm) e.confirm = "As senhas não coincidem";
    if (!agreed) e.agreed = "Você precisa aceitar os termos para continuar";
    if (Object.keys(e).length) { setErrors(e); return; }
    onDone();
  };

  const inp = (err?: string) => ({
    background: T.surface,
    border: `1px solid ${err ? T.error : T.border}`,
    borderRadius: 10,
    color: T.text,
    outline: "none",
    height: 52,
  });

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {/* Nav */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 flex-none">
        <button onClick={onBack} className="p-2 -ml-2" style={{ color: T.sub }}>
          <ChevronLeft size={22} />
        </button>
        <p className="font-semibold text-[17px]" style={{ color: T.text }}>Criar conta</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-8">
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: T.sub }}>Nome completo</label>
            <div className="flex items-center gap-3 px-4" style={inp(errors.name)}>
              <User size={18} style={{ color: T.placeholder }} />
              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
                className="flex-1 bg-transparent text-[14px] outline-none"
                style={{ color: T.text }}
              />
            </div>
            {errors.name && <p className="text-[12px] mt-1" style={{ color: T.error }}>{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: T.sub }}>E-mail</label>
            <div className="flex items-center gap-3 px-4" style={inp(errors.email)}>
              <Mail size={18} style={{ color: T.placeholder }} />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                className="flex-1 bg-transparent text-[14px] outline-none"
                style={{ color: T.text }}
              />
            </div>
            {errors.email && <p className="text-[12px] mt-1" style={{ color: T.error }}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: T.sub }}>Senha</label>
            <div className="flex items-center gap-3 px-4" style={inp(errors.password)}>
              <Lock size={18} style={{ color: T.placeholder }} />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Crie uma senha forte"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                className="flex-1 bg-transparent text-[14px] outline-none"
                style={{ color: T.text }}
              />
              <button onClick={() => setShowPass(s => !s)} style={{ color: T.placeholder }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <PasswordStrengthBar password={password} />
            {password && (
              <div className="mt-2 space-y-1">
                {rules.map(r => (
                  <div key={r.label} className="flex items-center gap-1.5">
                    <CheckCircle size={12} style={{ color: r.ok ? T.success : T.sub }} />
                    <p className="text-[12px]" style={{ color: r.ok ? T.success : T.sub }}>{r.label}</p>
                  </div>
                ))}
              </div>
            )}
            {errors.password && <p className="text-[12px] mt-1" style={{ color: T.error }}>{errors.password}</p>}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: T.sub }}>Confirmar senha</label>
            <div className="flex items-center gap-3 px-4" style={inp(errors.confirm)}>
              <Lock size={18} style={{ color: T.placeholder }} />
              <input
                type="password"
                placeholder="Repita a senha"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: "" })); }}
                className="flex-1 bg-transparent text-[14px] outline-none"
                style={{ color: T.text }}
              />
            </div>
            {errors.confirm && <p className="text-[12px] mt-1" style={{ color: T.error }}>{errors.confirm}</p>}
          </div>

          {/* Terms */}
          <div>
            <button
              onClick={() => setAgreed(a => !a)}
              className="flex items-start gap-3 w-full text-left"
            >
              <div
                className="w-5 h-5 rounded flex items-center justify-center flex-none mt-0.5 transition-colors"
                style={{
                  border: `1.5px solid ${agreed ? T.brand : errors.agreed ? T.error : T.border}`,
                  background: agreed ? T.brand : "transparent",
                }}
              >
                {agreed && <CheckCircle size={12} color="#fff" />}
              </div>
              <p className="text-[13px]" style={{ color: T.sub }}>
                Li e aceito os{" "}
                <span style={{ color: T.brand }}>Termos de Uso</span>
                {" "}e a{" "}
                <span style={{ color: T.brand }}>Política de Privacidade</span>
              </p>
            </button>
            {errors.agreed && <p className="text-[12px] mt-1" style={{ color: T.error }}>{errors.agreed}</p>}
          </div>

          {/* Submit */}
          <button
            onClick={submit}
            className="w-full h-[52px] rounded-[10px] font-semibold text-[15px]"
            style={{ background: T.brand, color: "#fff" }}
          >
            Criar conta
          </button>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1 pt-2">
            <span className="text-[14px]" style={{ color: T.sub }}>Já tem conta?</span>
            <button onClick={onBack} className="text-[14px] font-semibold" style={{ color: T.brand }}>
              Entrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ForgotPasswordScreen ──────────────────────────────────────────

export function ForgotPasswordScreen({ onBack, onSend }: { onBack: () => void; onSend: () => void }) {
  const [email, setEmail] = useState("");

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 flex-none">
        <button onClick={onBack} className="p-2 -ml-2" style={{ color: T.sub }}>
          <ChevronLeft size={22} />
        </button>
        <p className="font-semibold text-[17px]" style={{ color: T.text }}>Recuperar senha</p>
      </div>

      <div className="flex-1 px-6 pt-8">
        {/* Icon */}
        <div className="flex items-center justify-center mb-8">
          <div
            className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
            style={{ border: `1.5px solid ${T.border}` }}
          >
            <Lock size={32} style={{ color: T.brand }} strokeWidth={1.5} />
          </div>
        </div>

        <h2 className="font-semibold text-[22px] text-center mb-2" style={{ color: T.text }}>
          Esqueceu sua senha?
        </h2>
        <p className="text-[14px] text-center mb-8 leading-[22px]" style={{ color: T.sub }}>
          Informe seu e-mail e enviaremos um link para você criar uma nova senha.
        </p>

        <div className="mb-6">
          <label className="block text-[13px] font-medium mb-1.5" style={{ color: T.sub }}>E-mail</label>
          <div
            className="flex items-center gap-3 px-4"
            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, height: 52 }}
          >
            <Mail size={18} style={{ color: T.placeholder }} />
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 bg-transparent text-[14px] outline-none"
              style={{ color: T.text }}
            />
          </div>
        </div>

        <button
          onClick={email.includes("@") ? onSend : undefined}
          className="w-full h-[52px] rounded-[10px] font-semibold text-[15px] mb-4"
          style={{
            background: email.includes("@") ? T.brand : T.elevated,
            color: email.includes("@") ? "#fff" : T.sub,
          }}
        >
          Enviar link de recuperação
        </button>

        <button
          onClick={onBack}
          className="w-full text-center text-[14px] font-medium"
          style={{ color: T.brand }}
        >
          Voltar para o login
        </button>
      </div>
    </div>
  );
}

// ── VerifyCodeScreen ──────────────────────────────────────────────

export function VerifyCodeScreen({ onBack, onVerify }: { onBack: () => void; onVerify: () => void }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(45);
  const [error, setError] = useState(false);
  const r0 = useRef<HTMLInputElement>(null);
  const r1 = useRef<HTMLInputElement>(null);
  const r2 = useRef<HTMLInputElement>(null);
  const r3 = useRef<HTMLInputElement>(null);
  const r4 = useRef<HTMLInputElement>(null);
  const r5 = useRef<HTMLInputElement>(null);
  const refs = [r0, r1, r2, r3, r4, r5];

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleDigit = (i: number, val: string) => {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    setError(false);
    if (d && i < 5) refs[i + 1].current?.focus();
    if (next.every(x => x)) {
      if (next.join("") === "123456") setTimeout(onVerify, 200);
      else setError(true);
    }
  };

  const handleKey = (i: number, key: string) => {
    if (key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };

  const fmtTimer = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 flex-none">
        <button onClick={onBack} className="p-2 -ml-2" style={{ color: T.sub }}>
          <ChevronLeft size={22} />
        </button>
        <p className="font-semibold text-[17px]" style={{ color: T.text }}>Verificar e-mail</p>
      </div>

      <div className="flex-1 px-6 pt-6">
        <p className="font-semibold text-[22px] mb-2" style={{ color: T.text }}>Verifique seu e-mail</p>
        <p className="text-[14px] mb-10 leading-[22px]" style={{ color: T.sub }}>
          Enviamos um código para{" "}
          <span style={{ color: T.text }}>lucas@email.com</span>
        </p>

        {/* Code boxes */}
        <div className="flex gap-2.5 mb-3 justify-center">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKey(i, e.key)}
              className="w-[48px] h-[56px] rounded-[10px] text-center text-[22px] font-semibold outline-none"
              style={{
                background: T.surface,
                border: `1.5px solid ${error ? T.error : d ? T.brand : T.border}`,
                color: T.text,
              }}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-1 justify-center mb-4">
            <AlertCircle size={13} style={{ color: T.error }} />
            <p className="text-[12px]" style={{ color: T.error }}>Código incorreto. Tente: 123456</p>
          </div>
        )}

        {/* Resend */}
        <div className="text-center mb-6">
          {countdown > 0 ? (
            <p className="text-[13px]" style={{ color: T.sub }}>
              Reenviar código em{" "}
              <span className="font-mono font-semibold" style={{ color: T.text }}>{fmtTimer(countdown)}</span>
            </p>
          ) : (
            <button
              onClick={() => setCountdown(45)}
              className="text-[13px] font-semibold"
              style={{ color: T.brand }}
            >
              Reenviar código
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── NewPasswordScreen ─────────────────────────────────────────────

export function NewPasswordScreen({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const allOk = hasLength && hasUpper && hasNumber && hasSpecial && password === confirm;

  const rules = [
    { label: "Mínimo de 8 caracteres", ok: hasLength },
    { label: "Uma letra maiúscula", ok: hasUpper },
    { label: "Um número", ok: hasNumber },
    { label: "Um caractere especial", ok: hasSpecial },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 flex-none">
        <button onClick={onBack} className="p-2 -ml-2" style={{ color: T.sub }}>
          <ChevronLeft size={22} />
        </button>
        <p className="font-semibold text-[17px]" style={{ color: T.text }}>Nova senha</p>
      </div>

      <div className="flex-1 px-6 pt-4 space-y-4">
        <div>
          <label className="block text-[13px] font-medium mb-1.5" style={{ color: T.sub }}>Nova senha</label>
          <div
            className="flex items-center gap-3 px-4"
            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, height: 52 }}
          >
            <Lock size={18} style={{ color: T.placeholder }} />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Crie uma nova senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="flex-1 bg-transparent text-[14px] outline-none"
              style={{ color: T.text }}
            />
            <button onClick={() => setShowPass(s => !s)} style={{ color: T.placeholder }}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Rules */}
          <div className="mt-3 space-y-1.5">
            {rules.map(r => (
              <div key={r.label} className="flex items-center gap-2">
                <CheckCircle
                  size={13}
                  style={{ color: r.ok ? T.success : T.sub }}
                  fill={r.ok ? T.success : "none"}
                />
                <p className="text-[12px]" style={{ color: r.ok ? T.success : T.sub }}>{r.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium mb-1.5" style={{ color: T.sub }}>Confirmar nova senha</label>
          <div
            className="flex items-center gap-3 px-4"
            style={{
              background: T.surface,
              border: `1px solid ${confirm && password !== confirm ? T.error : T.border}`,
              borderRadius: 10,
              height: 52,
            }}
          >
            <Lock size={18} style={{ color: T.placeholder }} />
            <input
              type="password"
              placeholder="Repita a nova senha"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="flex-1 bg-transparent text-[14px] outline-none"
              style={{ color: T.text }}
            />
          </div>
          {confirm && password !== confirm && (
            <p className="text-[12px] mt-1" style={{ color: T.error }}>As senhas não coincidem</p>
          )}
        </div>

        <button
          onClick={allOk ? onDone : undefined}
          className="w-full h-[52px] rounded-[10px] font-semibold text-[15px]"
          style={{
            background: allOk ? T.brand : T.elevated,
            color: allOk ? "#fff" : T.sub,
          }}
        >
          Redefinir senha
        </button>
      </div>
    </div>
  );
}

// ── PasswordChangedScreen ─────────────────────────────────────────

export function PasswordChangedScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center" style={{ background: T.bg }}>
      <div
        className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-6"
        style={{ border: `1.5px solid ${T.success}` }}
      >
        <CheckCircle size={36} style={{ color: T.success }} strokeWidth={1.5} />
      </div>
      <h2 className="font-semibold text-[22px] mb-3" style={{ color: T.text }}>Senha redefinida</h2>
      <p className="text-[14px] mb-10 leading-[22px]" style={{ color: T.sub }}>
        Sua senha foi alterada com sucesso. Use-a para acessar sua conta.
      </p>
      <button
        onClick={onLogin}
        className="w-full h-[52px] rounded-[10px] font-semibold text-[15px]"
        style={{ background: T.brand, color: "#fff" }}
      >
        Ir para o login
      </button>
    </div>
  );
}

// ── AuthFlow (orchestrator) ───────────────────────────────────────

export default function AuthFlow({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [screen, setScreen] = useState<AuthScreen>("splash");

  const go = useCallback((s: AuthScreen) => setScreen(s), []);

  if (screen === "splash") return <SplashScreen onDone={() => go("onboarding")} />;
  if (screen === "onboarding") return <OnboardingScreen onDone={() => go("login")} onSkip={() => go("login")} />;

  if (screen === "login")
    return (
      <LoginScreen
        onLogin={onAuthenticated}
        onCreateAccount={() => go("create-account")}
        onForgotPassword={() => go("forgot-password")}
      />
    );

  if (screen === "create-account")
    return <CreateAccountScreen onBack={() => go("login")} onDone={onAuthenticated} />;

  if (screen === "forgot-password")
    return <ForgotPasswordScreen onBack={() => go("login")} onSend={() => go("verify-code")} />;

  if (screen === "verify-code")
    return <VerifyCodeScreen onBack={() => go("forgot-password")} onVerify={() => go("new-password")} />;

  if (screen === "new-password")
    return <NewPasswordScreen onBack={() => go("verify-code")} onDone={() => go("password-changed")} />;

  if (screen === "password-changed")
    return <PasswordChangedScreen onLogin={() => go("login")} />;

  return null;
}
