import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'hi' | 'mr';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    mr: string;
  };
}

const translations: Translations = {
  // Navbar
  'nav.home': { en: 'Home', hi: 'होम', mr: 'होम' },
  'nav.features': { en: 'Features', hi: 'फीचर्स', mr: 'वैशिष्ट्ये' },
  'nav.pricing': { en: 'Pricing', hi: 'मूल्य निर्धारण', mr: 'किंमत' },
  'nav.howItWorks': { en: 'How It Works', hi: 'यह कैसे काम करता है', mr: 'हे कसे कार्य करते' },
  'nav.dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड', mr: 'डॅशबोर्ड' },
  'nav.contact': { en: 'Contact', hi: 'संपर्क करें', mr: 'संपर्क' },
  'nav.login': { en: 'Login', hi: 'लॉग इन', mr: 'लॉगिन' },
  'nav.startTrial': { en: 'Start Free Trial', hi: 'फ्री ट्रायल शुरू करें', mr: 'फ्री ट्रायल सुरू करा' },
  
  // Hero
  'hero.title': { 
    en: 'Stop Dead Stock. Free Your Cash. Predict Inventory Before It Hurts.', 
    hi: 'डेड स्टॉक रोकें। अपना कैश मुक्त करें। इन्वेंटरी की भविष्यवाणी करें।',
    mr: 'डेड स्टॉक थांबवा. तुमचे पैसे मुक्त करा. इन्व्हेंटरी अगोदर अंदाज करा.'
  },
  'hero.subtitle': { 
    en: 'AI powered inventory intelligence for modern eCommerce sellers.', 
    hi: 'आधुनिक ई-कॉमर्स विक्रेताओं के लिए AI संचालित इन्वेंटरी इंटेलिजेंस।',
    mr: 'आधुनिक ई-कॉमर्स विक्रेत्यांसाठी AI चालित इन्व्हेंटरी इंटेलिजेंस.'
  },
  'hero.startTrial': { en: 'Start Free Trial', hi: 'फ्री ट्रायल शुरू करें', mr: 'फ्री ट्रायल सुरू करा' },
  'hero.bookDemo': { en: 'Book Demo', hi: 'डेमो बुक करें', mr: 'डेमो बुक करा' },
  
  // Problem Section
  'problem.title': { 
    en: 'Is Your Inventory Blocking Your Growth?', 
    hi: 'क्या आपकी इन्वेंटरी आपकी वृद्धि को रोक रही है?',
    mr: 'तुमची इन्व्हेंटरी तुमच्या वाढीस अडथळा आणत आहे का?'
  },
  'problem.moneyStuck': { 
    en: 'Money stuck in unsold products', 
    hi: 'न बिके उत्पादों में फंसा पैसा',
    mr: 'न विकलेल्या उत्पादनांमध्ये अडकलेले पैसे'
  },
  'problem.stockouts': { 
    en: 'Sudden stockouts', 
    hi: 'अचानक स्टॉकआउट',
    mr: 'अचानक स्टॉकआउट'
  },
  'problem.excelForecasting': { 
    en: 'Manual Excel forecasting', 
    hi: 'मैनुअल एक्सेल पूर्वानुमान',
    mr: 'मॅन्युअल एक्सेल अंदाज'
  },
  'problem.noVisibility': { 
    en: 'No capital visibility', 
    hi: 'पूंजी की कोई दृश्यता नहीं',
    mr: 'भांडवल दृश्यता नाही'
  },
  
  // Features
  'features.title': { en: 'Powerful Features', hi: 'शक्तिशाली फीचर्स', mr: 'शक्तिशाली वैशिष्ट्ये' },
  'features.deadStock': { en: 'Dead Stock Detection', hi: 'डेड स्टॉक डिटेक्शन', mr: 'डेड स्टॉक शोध' },
  'features.aiForecasting': { en: 'AI Demand Forecasting', hi: 'AI डिमांड पूर्वानुमान', mr: 'AI मागणी अंदाज' },
  'features.reorder': { en: 'Smart Reorder Suggestions', hi: 'स्मार्ट रीऑर्डर सुझाव', mr: 'स्मार्ट रीऑर्डर सूचना' },
  'features.blockedCapital': { en: 'Blocked Capital Tracker', hi: 'ब्लॉक कैपिटल ट्रैकर', mr: 'ब्लॉक भांडवल ट्रॅकर' },
  
  // Dashboard
  'dashboard.totalValue': { en: 'Total Inventory Value', hi: 'कुल इन्वेंटरी मूल्य', mr: 'एकूण इन्व्हेंटरी मूल्य' },
  'dashboard.blockedCapital': { en: 'Blocked Capital', hi: 'ब्लॉक कैपिटल', mr: 'ब्लॉक भांडवल' },
  'dashboard.predictedSales': { en: 'Predicted Next 30 Day Sales', hi: 'अगले 30 दिनों की बिक्री का पूर्वानुमान', mr: 'पुढील 30 दिवसांच्या विक्रीचा अंदाज' },
  'dashboard.stockoutRisk': { en: 'Stockout Risk Products', hi: 'स्टॉकआउट जोखिम उत्पाद', mr: 'स्टॉकआउट जोखीम उत्पादने' },
  
  // Pricing
  'pricing.title': { en: 'Choose Your Plan', hi: 'अपना प्लान चुनें', mr: 'तुमची योजना निवडा' },
  'pricing.starter': { en: 'Starter', hi: 'स्टार्टर', mr: 'स्टार्टर' },
  'pricing.growth': { en: 'Growth', hi: 'ग्रोथ', mr: 'ग्रोथ' },
  'pricing.pro': { en: 'Pro', hi: 'प्रो', mr: 'प्रो' },
  
  // Footer
  'footer.built': { 
    en: 'Built for Indian eCommerce sellers', 
    hi: 'भारतीय ई-कॉमर्स विक्रेताओं के लिए बनाया गया',
    mr: 'भारतीय ई-कॉमर्स विक्रेत्यांसाठी तयार केले'
  },
  
  // Common
  'common.learnMore': { en: 'Learn More', hi: 'और जानें', mr: 'अधिक जाणून घ्या' },
  'common.getStarted': { en: 'Get Started', hi: 'शुरू करें', mr: 'सुरू करा' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
