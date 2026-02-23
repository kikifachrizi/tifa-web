"use client";

import { useState } from "react";
import { signUp } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<"admin" | "operator">("operator");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { dict } = useLanguage();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const result = await signUp(email, password, role);

    if (!result.success) {
      setError(result.error || "Registration failed");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left Side - Forgix Branding */}
      <div className="relative hidden lg:flex flex-col justify-end p-12 overflow-hidden bg-gradient-to-br from-[#2C3A50] to-[#1a252f]">
        {/* Decorative Elements */}
        <div className="absolute top-[30%] left-[20%] w-96 h-96 bg-[#20C5D0]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-[#2FAEB7]/15 rounded-full blur-[80px]" />

        {/* Decorative circles */}
        <div className="absolute top-[25%] left-[30%] w-56 h-56 border border-white/10 rounded-full" />
        <div className="absolute top-[35%] left-[35%] w-40 h-40 border border-[#2FAEB7]/20 rounded-full" />

        {/* Content */}
        <div className="relative z-10 max-w-lg mb-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2FAEB7]/20 border border-[#2FAEB7]/30 text-[#20C5D0] text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20C5D0] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2FAEB7]"></span>
            </span>
            {dict.common.online}
          </div>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#2FAEB7] to-[#20C5D0] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              F
            </div>
            <span className="text-3xl font-bold text-white">Forgix</span>
          </div>

          <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
            {dict.landing.hero.status}
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-md">
            {dict.auth.register.subtitle}
          </p>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none"></div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex items-center justify-center p-6 lg:p-12 relative z-10 bg-white">
        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm text-gray-500 hover:text-[#2FAEB7] transition-colors group"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {dict.auth.back_to_home}
        </Link>

        {/* Switchers */}
        <div className="absolute top-6 right-6 z-20 flex gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-md space-y-6 animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#2FAEB7] to-[#20C5D0] flex items-center justify-center text-white text-xl font-bold">
                F
              </div>
              <span className="text-2xl font-bold text-[#2C3A50]">Forgix</span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[#2C3A50] mb-2">
              {dict.auth.register.title}
            </h2>
            <p className="text-sm text-gray-500">
              {dict.auth.register.subtitle}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider pl-1">
                  {dict.auth.roles.label}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`relative p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === "admin"
                      ? "border-[#2FAEB7] bg-[#2FAEB7]/10 text-[#2FAEB7]"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-600 hover:text-gray-800"
                      }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div className="text-center">
                      <div className="font-semibold text-sm">{dict.auth.roles.admin}</div>
                      <div className="text-[10px] opacity-70 leading-tight mt-0.5">{dict.auth.roles.admin_desc}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("operator")}
                    className={`relative p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === "operator"
                      ? "border-[#20C5D0] bg-[#20C5D0]/10 text-[#20C5D0]"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-600 hover:text-gray-800"
                      }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    <div className="text-center">
                      <div className="font-semibold text-sm">{dict.auth.roles.operator}</div>
                      <div className="text-[10px] opacity-70 leading-tight mt-0.5">{dict.auth.roles.operator_desc}</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider pl-1">
                  {dict.auth.register.email_label}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-[#2FAEB7] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-gray-50 border border-gray-200 text-[#2C3A50] placeholder:text-gray-400 focus:border-[#2FAEB7] focus:ring-2 focus:ring-[#2FAEB7]/20 focus:outline-none transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider pl-1">
                  {dict.auth.register.password_label}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-[#2FAEB7] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl text-sm bg-gray-50 border border-gray-200 text-[#2C3A50] placeholder:text-gray-400 focus:border-[#2FAEB7] focus:ring-2 focus:ring-[#2FAEB7]/20 focus:outline-none transition-all"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#2FAEB7] transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider pl-1">
                  {dict.auth.register.confirm_password_label}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-[#2FAEB7] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl text-sm bg-gray-50 border border-gray-200 text-[#2C3A50] placeholder:text-gray-400 focus:border-[#2FAEB7] focus:ring-2 focus:ring-[#2FAEB7]/20 focus:outline-none transition-all"
                    placeholder="Repeat password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#2FAEB7] transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-[#2FAEB7] to-[#20C5D0] hover:from-[#20C5D0] hover:to-[#2FAEB7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2FAEB7] shadow-lg shadow-[#2FAEB7]/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-[1.01]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{dict.common.loading}</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  {dict.auth.register.submit}
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            {dict.auth.register.has_account}{" "}
            <Link href="/login" className="font-semibold text-[#2FAEB7] hover:text-[#20C5D0] transition-colors">
              {dict.auth.register.login_link}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
