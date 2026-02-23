'use client';

import { LanguageProvider, useLanguage } from "@/components/LanguageProvider";
import LandingLanguageSwitcher from "@/components/LandingLanguageSwitcher";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";

function ForgixContent() {
  const { forgixDict: dict } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const rafRef = useRef<number>(0);

  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setIsScrolled(window.scrollY > 50));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('active'); }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .reveal-zoom, .reveal-rotate, .reveal-slide-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-[#2C3A50] overflow-hidden font-[var(--font-jakarta)]">
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg py-2" : "bg-transparent py-4"}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm">
              <Image src="/forgix/logo-forgix.png" alt="FORGIX" width={140} height={40} className="h-8 w-auto object-contain" priority />
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <Link href="/" className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${isScrolled ? 'text-[#2C3A50] hover:bg-gray-100' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>{dict.nav.home}</Link>
            <button onClick={() => scrollToSection('about')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${isScrolled ? 'text-[#2C3A50] hover:bg-gray-100' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>{dict.nav.about}</button>
            <button onClick={() => scrollToSection('services')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${isScrolled ? 'text-[#2C3A50] hover:bg-gray-100' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>{dict.nav.services}</button>
            <button onClick={() => scrollToSection('products')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${isScrolled ? 'text-[#2C3A50] hover:bg-gray-100' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>{dict.nav.product}</button>
            <button onClick={() => scrollToSection('contact')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${isScrolled ? 'text-[#2C3A50] hover:bg-gray-100' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>{dict.nav.contact}</button>
          </div>

          <div className="flex items-center gap-3">
            <LandingLanguageSwitcher theme="forgix" isScrolled={isScrolled} />
            <Link href="/login" className={`hidden md:flex items-center px-5 py-2 text-sm font-medium rounded-full border transition-all hover:-translate-y-0.5 ${isScrolled ? 'border-[#2C3A50]/30 text-[#2C3A50] hover:border-[#2C3A50] hover:bg-gray-50' : 'border-white/50 text-white hover:border-white hover:bg-white/10'}`}>{dict.nav.login}</Link>
            <Link href="/register" className="hidden md:flex items-center px-5 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-[#2FAEB7] to-[#20C5D0] text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all">{dict.nav.get_started}</Link>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`lg:hidden p-2 rounded-lg transition-colors ${isScrolled ? 'text-[#2C3A50] hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMobileMenuOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-72 bg-white transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 pt-20">
            <nav className="space-y-2">
              <Link href="/" className="block w-full text-left px-4 py-3 text-base font-medium text-[#2C3A50] hover:bg-gray-100 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>{dict.nav.home}</Link>
              <button onClick={() => scrollToSection('about')} className="block w-full text-left px-4 py-3 text-base font-medium text-[#2C3A50] hover:bg-gray-100 rounded-lg">{dict.nav.about}</button>
              <button onClick={() => scrollToSection('services')} className="block w-full text-left px-4 py-3 text-base font-medium text-[#2C3A50] hover:bg-gray-100 rounded-lg">{dict.nav.services}</button>
              <button onClick={() => scrollToSection('products')} className="block w-full text-left px-4 py-3 text-base font-medium text-[#2C3A50] hover:bg-gray-100 rounded-lg">{dict.nav.product}</button>
              <a href="https://wa.me/6285179598393" className="block w-full text-left px-4 py-3 text-base font-medium text-[#2C3A50] hover:bg-gray-100 rounded-lg">{dict.nav.contact}</a>
            </nav>
            <div className="mt-8 pt-8 border-t border-gray-200 space-y-3">
              <Link href="/login" className="block w-full px-4 py-3 text-center text-base font-medium text-[#2C3A50] border border-gray-200 hover:bg-gray-50 rounded-full" onClick={() => setIsMobileMenuOpen(false)}>{dict.nav.login}</Link>
              <Link href="/register" className="block w-full px-4 py-3 text-center text-base font-semibold rounded-full bg-gradient-to-r from-[#2FAEB7] to-[#20C5D0] text-white" onClick={() => setIsMobileMenuOpen(false)}>{dict.nav.get_started}</Link>
            </div>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a3f] via-[#2C4A50] to-[#1a3a3f]" />
          <div className="absolute inset-0 opacity-60" style={{ background: 'linear-gradient(135deg, #2FAEB7 0%, transparent 50%, #20C5D0 100%)' }} />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 py-32 text-center">
          <div className="reveal">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-8 tracking-tight text-white">
              {dict.hero.title_1}<br />{dict.hero.title_2}
            </h1>
            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-3xl mx-auto leading-relaxed">{dict.hero.subtitle}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="#products" className="inline-flex items-center gap-2 px-8 py-4 bg-[#2C3A50] text-white font-semibold rounded-full hover:bg-[#1a2a3a] hover:-translate-y-0.5 transition-all shadow-lg">
                {dict.hero.cta_primary}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <a href="https://wa.me/6285179598393?text=Halo%20Forgix!" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#2FAEB7] to-[#20C5D0] text-white font-semibold rounded-full hover:-translate-y-0.5 transition-all shadow-lg shadow-teal-500/30">
                {dict.hero.cta_secondary}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-24 bg-gray-50 bg-geometric-pattern">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal-zoom">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image src="/forgix/about-us.png" alt="Forgix Team" width={600} height={400} className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C3A50]/60 to-transparent" />
              </div>
            </div>
            <div className="reveal-blur delay-200">
              <span className="inline-block px-4 py-2 bg-[#2FAEB7]/10 text-[#2FAEB7] text-sm font-semibold rounded-full mb-4">{dict.about.badge}</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#2C3A50]">
                {dict.about.title_1}<br /><span className="bg-gradient-to-r from-[#2FAEB7] to-[#20C5D0] bg-clip-text text-transparent">{dict.about.title_2}</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">{dict.about.description_1}</p>
              <p className="text-gray-600 leading-relaxed mb-8">{dict.about.description_2}</p>
              <Link href="#services" className="inline-flex items-center gap-2 text-[#2FAEB7] font-semibold hover:gap-4 transition-all">
                {dict.about.cta}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </div>
          <div className="mt-20 pt-12 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500 mb-8">{dict.about.supported_by}</p>
            <div className="flex flex-wrap justify-center items-center gap-12">
              <Image src="/forgix/logo-telkom-hitam.png" alt="Telkom University" width={150} height={50} className="h-12 w-auto object-contain" />
              <Image src="/forgix/logo-fte-telkom.png" alt="Fakultas Teknik Elektro" width={200} height={50} className="h-12 w-auto object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="py-24 bg-white bg-geometric-pattern">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16 reveal">
            <span className="inline-block px-4 py-2 bg-[#2FAEB7]/10 text-[#2FAEB7] text-sm font-semibold rounded-full mb-4">{dict.services.badge}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2C3A50] mb-4">{dict.services.title}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{dict.services.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="reveal delay-100 group bg-white rounded-2xl p-8 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl hover:border-[#2FAEB7]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2FAEB7] to-[#20C5D0] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Image src="/forgix/icon-briefcase.png" alt="Briefcase" width={28} height={28} className="w-7 h-7 object-contain" />
              </div>
              <h3 className="text-xl font-bold text-[#2C3A50] mb-3">{dict.services.card_1.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{dict.services.card_1.description}</p>
            </div>
            <div className="reveal delay-200 group bg-white rounded-2xl p-8 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl hover:border-[#2FAEB7]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2FAEB7] to-[#20C5D0] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Image src="/forgix/icon-cpu.png" alt="CPU" width={28} height={28} className="w-7 h-7 object-contain" />
              </div>
              <h3 className="text-xl font-bold text-[#2C3A50] mb-3">{dict.services.card_2.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{dict.services.card_2.description}</p>
            </div>
            <div className="reveal delay-300 group bg-white rounded-2xl p-8 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl hover:border-[#2FAEB7]/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2FAEB7] to-[#20C5D0] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Image src="/forgix/icon-report.png" alt="Report" width={28} height={28} className="w-7 h-7 object-contain" />
              </div>
              <h3 className="text-xl font-bold text-[#2C3A50] mb-3">{dict.services.card_3.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{dict.services.card_3.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section id="products" className="py-24 bg-[#1a2332] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 w-64 h-64 bg-[#2FAEB7]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-[#2FAEB7]/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-16 reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{dict.products.title}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{dict.products.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* TIFA Product */}
            <div className="reveal delay-100 group relative bg-gradient-to-b from-[#2a3444] to-[#1e2836] rounded-3xl overflow-hidden border border-white/10 hover:border-[#2FAEB7]/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#2FAEB7]/10 flex flex-col h-full">
              <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                <div className="w-6 h-px bg-[#2FAEB7]" />
                <span className="text-xs text-gray-400 font-medium tracking-wide">{dict.products.category_amr}</span>
              </div>
              <div className="pt-16 pb-8 px-8 bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef] flex items-center justify-center h-[280px]">
                <Image src="/forgix/tifa-profile-1.png" alt="TIFA Robot" width={220} height={280} className="w-auto h-56 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-xl" />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-2 text-white min-h-[56px]">{dict.products.tifa.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-grow">{dict.products.tifa.description}</p>
                <div className="flex items-center gap-4 mt-6">
                  <Link href="/tifa" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2FAEB7] text-white text-sm font-semibold rounded-lg hover:bg-[#26a0a8] transition-colors shadow-lg shadow-[#2FAEB7]/20">{dict.products.tifa.cta_learn}</Link>
                  <a href="https://wa.me/6285179598393?text=Halo%20saya%20tertarik%20dengan%20TIFA!" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gray-400 text-sm font-medium hover:text-white transition-colors">
                    {dict.products.tifa.cta_contact}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </a>
                </div>
              </div>
            </div>
            {/* AMR Load */}
            <div className="reveal delay-200 group relative bg-gradient-to-b from-[#2a3444] to-[#1e2836] rounded-3xl overflow-hidden border border-white/10 hover:border-[#2FAEB7]/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#2FAEB7]/10 flex flex-col h-full">
              <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                <div className="w-6 h-px bg-[#2FAEB7]" />
                <span className="text-xs text-gray-400 font-medium tracking-wide">{dict.products.category_amr}</span>
              </div>
              <div className="pt-16 pb-8 px-8 bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef] flex items-center justify-center h-[280px]">
                <div className="w-48 h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-2 text-white min-h-[56px]">{dict.products.amr_load.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-grow">{dict.products.amr_load.description}</p>
                <div className="flex items-center gap-4 mt-6">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2FAEB7] text-white text-sm font-semibold rounded-lg opacity-60 cursor-not-allowed">{dict.products.tifa.cta_learn}</span>
                  <a href="https://wa.me/6285179598393?text=Halo%20saya%20tertarik%20dengan%20Industrial%20AMR!" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gray-400 text-sm font-medium hover:text-white transition-colors">
                    {dict.products.tifa.cta_contact}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </a>
                </div>
              </div>
            </div>
            {/* 5-Axis Arm */}
            <div className="reveal delay-300 group relative bg-gradient-to-b from-[#2a3444] to-[#1e2836] rounded-3xl overflow-hidden border border-white/10 hover:border-[#2FAEB7]/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#2FAEB7]/10 flex flex-col h-full">
              <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                <div className="w-6 h-px bg-[#2FAEB7]" />
                <span className="text-xs text-gray-400 font-medium tracking-wide">{dict.products.category_amr}</span>
              </div>
              <div className="pt-16 pb-8 px-8 bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef] flex items-center justify-center h-[280px]">
                <div className="w-48 h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-2 text-white min-h-[56px]">{dict.products.arm_robot.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-grow">{dict.products.arm_robot.description}</p>
                <div className="flex items-center gap-4 mt-6">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2FAEB7] text-white text-sm font-semibold rounded-lg opacity-60 cursor-not-allowed">{dict.products.tifa.cta_learn}</span>
                  <a href="https://wa.me/6285179598393?text=Halo%20saya%20tertarik%20dengan%205-Axis%20Arm!" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gray-400 text-sm font-medium hover:text-white transition-colors">
                    {dict.products.tifa.cta_contact}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIFA FEATURED SECTION */}
      <section className="py-24 bg-[#1a2332] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#2FAEB7]/5 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-[#2FAEB7]/5 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div className="reveal"><h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">{dict.tifa_featured.title_1}<br />{dict.tifa_featured.title_2}</h2></div>
            <div className="reveal delay-100"><p className="text-gray-400 leading-relaxed text-lg">{dict.tifa_featured.description}</p></div>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="reveal delay-200">
              <div className="relative bg-gradient-to-br from-[#2a3444] to-[#1e2836] rounded-3xl overflow-hidden border border-white/10 p-8">
                <div className="relative mb-8"><Image src="/forgix/tifa-head-new.png" alt="TIFA Head" width={400} height={300} className="w-full h-auto object-contain rounded-2xl" /></div>
                <div className="mb-8">
                  <h3 className="text-4xl md:text-5xl font-bold tracking-wide mb-2">{dict.tifa_featured.card_title}</h3>
                  <p className="text-gray-500 text-sm">{dict.tifa_featured.card_subtitle}</p>
                </div>
                <div className="flex items-center gap-6">
                  <Link href="/tifa" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2FAEB7] text-white text-sm font-semibold rounded-lg hover:bg-[#26a0a8] transition-colors shadow-lg shadow-[#2FAEB7]/20">{dict.tifa_featured.cta_explore}</Link>
                  <a href="https://wa.me/6285179598393?text=Halo%20saya%20tertarik%20dengan%20TIFA!" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gray-400 text-sm font-medium hover:text-white transition-colors">
                    {dict.tifa_featured.cta_contact}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="reveal delay-300">
              <div className="relative h-full bg-gradient-to-br from-[#2a3444] to-[#1e2836] rounded-3xl overflow-hidden border border-white/10 flex items-center justify-center min-h-[400px]">
                <div className="text-center px-8">
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-[0.2em] text-white/80 mb-4">{dict.tifa_featured.video_title}</h3>
                  <p className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.15em] text-white/60">{dict.tifa_featured.video_placeholder}</p>
                </div>
                <button className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#2FAEB7] to-[#20C5D0] flex items-center justify-center shadow-lg shadow-teal-500/50 hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-white bg-geometric-pattern">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16 reveal-blur">
            <span className="inline-block px-4 py-2 bg-[#2FAEB7]/10 text-[#2FAEB7] text-sm font-semibold rounded-full mb-4">{dict.testimonials.badge}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2C3A50]">{dict.testimonials.title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[dict.testimonials.review_1, dict.testimonials.review_2, dict.testimonials.review_3].map((review, idx) => (
              <div key={idx} className={`reveal-rotate delay-${(idx + 1) * 100} bg-gray-50 rounded-2xl p-8 border border-gray-100 parallax-float`}>
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (<svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2FAEB7] to-[#20C5D0] flex items-center justify-center text-white font-bold">{review.name.split(' ').map(n => n[0]).join('')}</div>
                  <div><p className="font-semibold text-[#2C3A50]">{review.name}</p><p className="text-sm text-gray-500">{review.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section id="contact" className="py-16 bg-gray-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="reveal bg-gradient-to-br from-[#1a2332] to-[#2a3444] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#2FAEB7] to-[#5DD3DB] bg-clip-text text-transparent">{dict.cta.title}</h2>
            <a href="https://wa.me/6285179598393?text=Halo%20Forgix!" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#1a2332] font-semibold rounded-full hover:bg-gray-100 hover:-translate-y-0.5 transition-all shadow-lg">
              {dict.cta.button}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1a2332] text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#2FAEB7] to-[#20C5D0] flex items-center justify-center text-white text-xl font-bold">F</div>
                <div><h3 className="text-xl font-bold">Forgix</h3><p className="text-sm text-gray-400">{dict.footer.tagline}</p></div>
              </div>
              <p className="text-gray-400 max-w-sm leading-relaxed">{dict.footer.description}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{dict.footer.quick_links}</h4>
              <ul className="space-y-3 text-gray-400">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-[#2FAEB7] transition-colors">{dict.footer.about_us}</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-[#2FAEB7] transition-colors">{dict.footer.services}</button></li>
                <li><button onClick={() => scrollToSection('products')} className="hover:text-[#2FAEB7] transition-colors">{dict.footer.products}</button></li>
                <li><Link href="/tifa" className="hover:text-[#2FAEB7] transition-colors">TIFA</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{dict.footer.contact}</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2"><svg className="w-5 h-5 text-[#2FAEB7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>forgixroboticsolution@gmail.com</li>
                <li className="flex items-center gap-2"><svg className="w-5 h-5 text-[#2FAEB7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>+62 851-7959-8393</li>
                <li className="flex items-center gap-2"><svg className="w-5 h-5 text-[#2FAEB7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Bandung, Indonesia</li>
                <li><a href="https://wa.me/6285179598393" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#2FAEB7] transition-colors"><svg className="w-5 h-5 text-[#2FAEB7]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>{dict.footer.whatsapp}</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} {dict.footer.copyright}</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-[#2FAEB7] transition-colors text-sm">{dict.footer.privacy}</a>
              <a href="#" className="text-gray-400 hover:text-[#2FAEB7] transition-colors text-sm">{dict.footer.terms}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ForgixLandingPage() {
  return (
    <LanguageProvider>
      <ForgixContent />
    </LanguageProvider>
  );
}
