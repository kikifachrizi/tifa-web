'use client';

import { LanguageProvider, useLanguage } from "@/components/LanguageProvider";
import LandingLanguageSwitcher from "@/components/LandingLanguageSwitcher";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";

function TIFAContent() {
    const { tifaDict: dict } = useLanguage();
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
        document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        setIsMobileMenuOpen(false);
    };

    const journeyItems = [
        { title: dict.journey.item_1.title, description: dict.journey.item_1.description, image: "/tifa/tifa-head.png", align: "left" },
        { title: dict.journey.item_2.title, description: dict.journey.item_2.description, image: "/tifa/tifa-head.png", align: "right" },
        { title: dict.journey.item_3.title, description: dict.journey.item_3.description, image: "/tifa/tifa-head.png", align: "left" },
        { title: dict.journey.item_4.title, description: dict.journey.item_4.description, image: "/tifa/tifa-head.png", align: "right" },
    ];

    return (
        <div className="min-h-screen bg-[#1F1F1F] text-white overflow-hidden font-[var(--font-jakarta)] tifa-theme">
            {/* NAVBAR - TIFA Theme */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-[#1F1F1F]/95 backdrop-blur-md shadow-lg py-2" : "bg-transparent py-4"}`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
                    <Link href="/tifa" className="flex items-center group">
                        <Image src="/logo-tifa-full.png" alt="TIFA" width={200} height={100} className="h-[100px] w-auto object-contain" priority />
                    </Link>
                    <div className="hidden lg:flex items-center gap-1">
                        <Link href="/tifa" className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all">{dict.nav.home}</Link>
                        <button onClick={() => scrollToSection('about')} className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all">{dict.nav.about}</button>
                        <button onClick={() => scrollToSection('services')} className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all">{dict.nav.services}</button>
                        <button onClick={() => scrollToSection('product')} className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all">{dict.nav.product}</button>
                        <button onClick={() => scrollToSection('contact')} className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all">{dict.nav.contact}</button>
                    </div>
                    <div className="flex items-center gap-3">
                        <LandingLanguageSwitcher theme="tifa" isScrolled={isScrolled} />
                        <Link href="/login" className="hidden md:flex items-center px-5 py-2 text-sm font-medium rounded-full border border-white/50 text-white hover:border-white hover:bg-white/10 transition-all hover:-translate-y-0.5">{dict.nav.login}</Link>
                        <Link href="/register" className="hidden md:flex items-center px-5 py-2 text-sm font-semibold rounded-full bg-[#B6252A] text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all">{dict.nav.get_started}</Link>
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
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
                <div className={`absolute top-0 right-0 h-full w-72 bg-[#1F1F1F] transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-6 pt-20">
                        <nav className="space-y-2">
                            <Link href="/tifa" className="block w-full text-left px-4 py-3 text-base font-medium text-white hover:bg-white/10 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>{dict.nav.home}</Link>
                            <button onClick={() => scrollToSection('about')} className="block w-full text-left px-4 py-3 text-base font-medium text-white hover:bg-white/10 rounded-lg">{dict.nav.about}</button>
                            <button onClick={() => scrollToSection('services')} className="block w-full text-left px-4 py-3 text-base font-medium text-white hover:bg-white/10 rounded-lg">{dict.nav.services}</button>
                            <button onClick={() => scrollToSection('product')} className="block w-full text-left px-4 py-3 text-base font-medium text-white hover:bg-white/10 rounded-lg">{dict.nav.product}</button>
                            <a href="https://wa.me/6285179598393" className="block w-full text-left px-4 py-3 text-base font-medium text-white hover:bg-white/10 rounded-lg">{dict.nav.contact}</a>
                        </nav>
                        <div className="mt-8 pt-8 border-t border-white/20 space-y-3">
                            <Link href="/login" className="block w-full px-4 py-3 text-center text-base font-medium border border-white/50 text-white hover:bg-white/10 rounded-full" onClick={() => setIsMobileMenuOpen(false)}>{dict.nav.login}</Link>
                            <Link href="/register" className="block w-full px-4 py-3 text-center text-base font-semibold rounded-full bg-[#B6252A] text-white" onClick={() => setIsMobileMenuOpen(false)}>{dict.nav.get_started}</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a0a0a] to-[#2a0a0a]" />
                    <div className="absolute top-[10%] right-[20%] w-[500px] h-[500px] bg-[#B6252A]/15 rounded-full blur-[150px]" />
                    <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] bg-[#B6252A]/10 rounded-full blur-[120px]" />
                </div>
                <div className="relative z-10 flex-1 max-w-7xl mx-auto px-6 lg:px-12 py-24 pt-32">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[70vh]">
                        <div className="reveal order-2 lg:order-1">
                            <div className="hero-badge mb-8">
                                <Image src="/tifa/logo-tifa-red.png" alt="TIFA" width={24} height={24} className="w-6 h-6" />
                                <span>{dict.hero.badge}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 leading-[1.1]">
                                <span className="text-white">{dict.hero.title_1}</span><br />
                                <span className="text-[#B6252A] font-extrabold">{dict.hero.title_2}</span><br />
                                <span className="text-[#B6252A] font-extrabold">{dict.hero.title_3}</span>
                                <span className="text-white"> {dict.hero.title_4}</span>
                            </h1>
                            <p className="text-base md:text-lg text-gray-400 mb-10 max-w-lg leading-relaxed">{dict.hero.subtitle}</p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/dashboard" className="btn-tifa inline-flex items-center gap-2 hover-lift">
                                    {dict.hero.cta_dashboard}
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </Link>
                                <a href="https://wa.me/6285179598393?text=Halo%20saya%20tertarik%20dengan%20TIFA!" target="_blank" rel="noopener noreferrer" className="btn-outline border-white/30 text-white hover:bg-white/10 inline-flex items-center gap-2">{dict.hero.cta_contact}</a>
                            </div>
                        </div>
                        <div className="relative reveal-right delay-200 order-1 lg:order-2 flex justify-center lg:justify-end">
                            <div className="relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#B6252A]/20 rounded-full blur-[100px]" />
                                <Image src="/tifa/tifa-profile.png" alt="TIFA Robot" width={400} height={500} className="relative z-10 w-[220px] md:w-[280px] lg:w-[340px] h-auto object-contain drop-shadow-2xl animate-float" priority />
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-gradient-to-r from-transparent via-[#B6252A]/50 to-transparent rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 w-full">
                    <div className="supported-by-section">
                        <p className="text-gray-500 text-sm font-medium text-center mb-8">{dict.hero.powered_by}</p>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
                            <Image src="/tifa/logo_telkom_hitam.png" alt="Telkom University" width={140} height={45} className="h-9 md:h-11 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                            <Image src="/tifa/logo-btp.png" alt="Bandung Techno Park" width={120} height={45} className="h-9 md:h-11 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                            <Image src="/tifa/logo-fte.png" alt="Fakultas Teknik Elektro" width={120} height={50} className="h-11 md:h-14 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                            <Image src="/tifa/logo_PDA.png" alt="PDA" width={100} height={45} className="h-9 md:h-11 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                            <Image src="/tifa/logo-telucoffee.png" alt="Telu Coffee" width={70} height={70} className="h-11 md:h-14 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Start Your Journey Section */}
            <section id="about" className="relative py-20 lg:py-28 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1a0a0a] via-[#3a0f0f] to-[#B6252A]" />
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }} />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
                        <div className="flex-1 reveal text-center lg:text-left">
                            <p className="text-gray-300 text-xl md:text-2xl italic mb-6">{dict.about.subtitle}</p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                                {dict.about.title_1}<br />{dict.about.title_2}<br /><span className="font-black">{dict.about.title_3}</span>
                            </h2>
                        </div>
                        <div className="flex-1 relative reveal-right delay-200">
                            <div className="relative w-full max-w-[550px] mx-auto lg:mx-0 lg:ml-auto">
                                <div className="relative">
                                    <Image src="/tifa/TIFA_SIDE_PROF.png" alt="TIFA Robot" width={550} height={750} className="w-[400px] md:w-[480px] lg:w-[550px] h-auto object-contain drop-shadow-2xl mx-auto" priority />
                                </div>
                                <div className="absolute top-[25%] right-[-50px] md:right-[-70px] lg:right-[-90px] z-20 animate-float">
                                    <div className="bg-[#2a2a2a] rounded-2xl p-3 shadow-2xl border border-gray-700/50">
                                        <Image src="/tifa/TIFA_SIDE_PROF 2.png" alt="TIFA Side Profile" width={250} height={200} className="w-[180px] md:w-[220px] lg:w-[250px] h-auto object-contain rounded-xl" />
                                    </div>
                                </div>
                                <div className="absolute top-[50%] left-[-40px] md:left-[-60px] lg:left-[-80px] z-20 animate-float" style={{ animationDelay: '0.5s' }}>
                                    <div className="bg-[#2a2a2a] rounded-2xl p-3 shadow-2xl border border-gray-700/50">
                                        <Image src="/tifa/tifa-head.png" alt="TIFA Head" width={250} height={200} className="w-[180px] md:w-[220px] lg:w-[250px] h-auto object-contain rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Journey of TIFA Section */}
            <section id="journey" className="relative py-24 overflow-hidden">
                <div className="absolute inset-0">
                    <Image src="/tifa/journey-image.png" alt="Journey Background" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/80" />
                </div>
                <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12">
                    <div className="text-center mb-12 reveal">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">{dict.journey.title}</h2>
                        <p className="text-gray-300 max-w-4xl mx-auto leading-relaxed text-base md:text-lg">{dict.journey.description}</p>
                    </div>
                    <div className="text-center mb-16 reveal">
                        <p className="text-[#B6252A] italic text-lg md:text-xl max-w-3xl mx-auto">{dict.journey.quote}</p>
                    </div>
                    <div className="relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#B6252A] via-[#B6252A] to-transparent transform -translate-x-1/2 hidden lg:block" />
                        <div className="space-y-16 lg:space-y-24">
                            {journeyItems.map((item, index) => (
                                <div key={index} className={`relative flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${item.align === 'right' ? 'lg:flex-row-reverse' : ''}`}>
                                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#B6252A] rounded-full border-4 border-[#1a1a1a] z-10 hidden lg:block" />
                                    <div className={`flex-1 ${item.align === 'left' ? 'lg:pr-12' : 'lg:pl-12'} reveal-${item.align === 'left' ? 'left' : 'right'}`}>
                                        <div className="relative rounded-2xl overflow-hidden bg-[#2a2a2a] p-4 shadow-2xl border border-gray-700/30 max-w-md mx-auto lg:mx-0 lg:ml-auto">
                                            <Image src={item.image} alt={item.title} width={350} height={280} className="w-full h-auto object-contain rounded-xl" />
                                        </div>
                                    </div>
                                    <div className={`flex-1 ${item.align === 'left' ? 'lg:pl-12 lg:text-left' : 'lg:pr-12 lg:text-right'} text-center reveal-${item.align === 'left' ? 'right' : 'left'} delay-200`}>
                                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 underline decoration-[#B6252A] decoration-2 underline-offset-8">{item.title}</h3>
                                        <p className="text-gray-400 leading-relaxed text-sm md:text-base">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Exclusive Restaurant Robot Section */}
            <section id="services" className="py-20 lg:py-28 relative overflow-hidden">
                <div className="absolute inset-0">
                    <Image src="/tifa/tifa-blur.png" alt="TIFA in Restaurant" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1F1F1F] via-[#1F1F1F]/80 to-[#1F1F1F]/40" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="reveal">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                                <span className="text-white">{dict.features.title_1}</span><br />
                                <span className="text-[#B6252A] font-extrabold">{dict.features.title_2}</span><br />
                                <span className="text-white">{dict.features.title_3}</span>
                            </h2>
                            <p className="text-gray-400 leading-relaxed text-base md:text-lg max-w-md">{dict.features.subtitle}</p>
                        </div>
                        <div className="reveal-right delay-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[dict.features.card_1, dict.features.card_2, dict.features.card_3, dict.features.card_4].map((card, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-shadow">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-10 h-10 flex-shrink-0 bg-[#B6252A]/10 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-[#B6252A]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                            </div>
                                            <h3 className="text-[#1F1F1F] font-bold text-lg leading-tight">{card.title}</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">{card.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Improving Service Quality Section */}
            <section className="py-24 bg-[#1F1F1F]">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="text-center mb-12 reveal">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{dict.video.title}</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">{dict.video.subtitle}</p>
                    </div>
                    <div className="reveal-scale delay-200">
                        <div className="relative rounded-2xl overflow-hidden bg-[#151515] aspect-video flex items-center justify-center group cursor-pointer border border-white/10 hover:border-[#B6252A]/30 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#B6252A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-center z-10">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#B6252A]/20 group-hover:scale-110 transition-all">
                                    <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                                <p className="text-white font-semibold text-2xl">{dict.video.placeholder}</p>
                                <p className="text-gray-500 text-sm mt-2">{dict.video.play_text}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Overview Section */}
            <section id="product" className="py-24 bg-white text-[#1F1F1F]">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="text-center mb-16 reveal">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">{dict.product.title}</h2>
                        <p className="text-gray-600">{dict.product.subtitle}</p>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="reveal-left">
                            <div className="relative">
                                <Image src="/tifa/tifa-profile.png" alt="TIFA Robot" width={400} height={500} className="w-80 mx-auto h-auto object-contain drop-shadow-2xl" />
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#B6252A]/20 rounded-full blur-3xl -z-10" />
                            </div>
                        </div>
                        <div className="reveal-right delay-200">
                            <div className="bg-gray-50 rounded-2xl p-8">
                                <h3 className="text-xl font-bold mb-6 text-[#B6252A]">{dict.product.specs_title}</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
                                        <span className="font-semibold text-gray-800">{dict.product.specs.feature}</span>
                                        <span className="text-gray-600">{dict.product.specs.value}</span>
                                        <span className="text-gray-600">{dict.product.specs.details}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                        <span className="font-medium text-gray-700">{dict.product.specs.payload}</span>
                                        <span className="text-gray-600">{dict.product.specs.payload_value}</span>
                                        <span className="text-gray-500 text-sm">{dict.product.specs.payload_details}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                        <span className="font-medium text-gray-700">{dict.product.specs.battery}</span>
                                        <span className="text-gray-600">{dict.product.specs.battery_value}</span>
                                        <span className="text-gray-500 text-sm">{dict.product.specs.battery_details}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                        <span className="font-medium text-gray-700">{dict.product.specs.navigation}</span>
                                        <span className="text-gray-600">{dict.product.specs.navigation_value}</span>
                                        <span className="text-gray-500 text-sm">{dict.product.specs.navigation_details}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                        <span className="font-medium text-gray-700">{dict.product.specs.speed}</span>
                                        <span className="text-gray-600">{dict.product.specs.speed_value}</span>
                                        <span className="text-gray-500 text-sm">{dict.product.specs.speed_details}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                        <span className="font-medium text-gray-700">{dict.product.specs.display}</span>
                                        <span className="text-gray-600">{dict.product.specs.display_value}</span>
                                        <span className="text-gray-500 text-sm">{dict.product.specs.display_details}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 py-3">
                                        <span className="font-medium text-gray-700">{dict.product.specs.voice}</span>
                                        <span className="text-gray-600">{dict.product.specs.voice_value}</span>
                                        <span className="text-gray-500 text-sm">{dict.product.specs.voice_details}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex gap-4">
                                <a href="https://wa.me/6285179598393?text=Halo%20saya%20ingin%20order%20TIFA!" target="_blank" rel="noopener noreferrer" className="btn-tifa inline-flex items-center gap-2">
                                    {dict.product.cta_order}
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </a>
                                <Link href="/dashboard" className="btn-outline border-[#1F1F1F] text-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-white">{dict.product.cta_dashboard}</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="contact" className="py-16 lg:py-24 bg-white">
                <div className="max-w-5xl mx-auto px-6 lg:px-12">
                    <div className="reveal">
                        <div className="relative bg-gradient-to-br from-[#1a1a1a] via-[#252525] to-[#1a1a1a] rounded-3xl px-8 py-12 md:px-16 md:py-16 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50" />
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-center md:text-left leading-tight">
                                    <span className="text-[#B6252A]">{dict.cta.title_1}</span><br /><span className="text-[#B6252A]">{dict.cta.title_2}</span>
                                </h2>
                                <a href="https://wa.me/6285179598393?text=Halo%20saya%20tertarik%20dengan%20TIFA!" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#1F1F1F] font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                                    {dict.cta.button}
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#151515] text-white py-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <Image src="/tifa/logo-tifa-red.png" alt="TIFA" width={48} height={48} className="w-12 h-12" />
                                <div><span className="text-xl font-bold">TIFA</span><p className="text-xs text-gray-500">{dict.footer.brand_tagline}</p></div>
                            </div>
                            <p className="text-gray-400 leading-relaxed max-w-md mb-6">{dict.footer.description}</p>
                            <Link href="/" className="inline-flex items-center gap-2 text-[#2FAEB7] font-semibold hover:gap-3 transition-all">
                                {dict.footer.back_to_forgix}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </Link>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-6">{dict.footer.quick_links}</h4>
                            <ul className="space-y-4 text-gray-400">
                                <li><Link href="/" className="hover:text-[#B6252A] transition-colors">{dict.footer.home}</Link></li>
                                <li><a href="#journey" className="hover:text-[#B6252A] transition-colors">{dict.footer.journey}</a></li>
                                <li><a href="#product" className="hover:text-[#B6252A] transition-colors">{dict.footer.specifications}</a></li>
                                <li><Link href="/dashboard" className="hover:text-[#B6252A] transition-colors">{dict.footer.dashboard}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-6">{dict.footer.contact}</h4>
                            <ul className="space-y-4 text-gray-400">
                                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-[#B6252A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>forgixroboticsolution@gmail.com</li>
                                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-[#B6252A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>+62 851-7959-8393</li>
                                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-[#B6252A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Bandung, Indonesia</li>
                                <li><a href="https://wa.me/6285179598393?text=Halo%20saya%20tertarik%20dengan%20TIFA!" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>{dict.footer.whatsapp}</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 text-sm">© {new Date().getFullYear()} {dict.footer.copyright}</p>
                        <div className="flex gap-6 text-gray-500 text-sm">
                            <a href="#" className="hover:text-white transition-colors">{dict.footer.privacy}</a>
                            <a href="#" className="hover:text-white transition-colors">{dict.footer.terms}</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default function TIFAJourneyPage() {
    return (
        <LanguageProvider>
            <TIFAContent />
        </LanguageProvider>
    );
}
