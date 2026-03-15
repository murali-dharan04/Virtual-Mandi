import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
    en: {
        translation: {
            "nav": {
                "dashboard": "Dashboard",
                "listings": "My Listings",
                "add_listing": "Add Listing",
                "orders": "Orders",
                "logout": "Sign Out",
                "farmer_dashboard": "Farmer Dashboard"
            },
            "dashboard": {
                "title": "Farmer Dashboard",
                "welcome": "Welcome",
                "subtitle": "Here is what's happening with your crops today.",
                "stats": {
                    "active": "Active Produce",
                    "orders": "Total Orders",
                    "revenue": "Total Revenue",
                    "pending": "Pending Orders",
                    "items": "items"
                },
                "actions": {
                    "add": "Add Produce",
                    "orders": "Current Orders",
                    "inventory": "Inventory",
                    "support": "Get Help"
                },
                "sections": {
                    "insights": "Quick Insights",
                    "advisory": "Farmer's Advisory",
                    "pricing": "Pricing Strategy",
                    "forecaster": "AI Price Forecaster",
                    "benchmarks": "National Benchmarks",
                    "niche": "Niche Market Watch",
                    "sales": "Weekly Sales Overview",
                    "recent_orders": "Recent Orders"
                },
                "weather": {
                    "title": "Hyperlocal Weather Advisory",
                    "clear": "Clear skies. Good time for harvesting.",
                    "rain": "Rain expected soon. Secure open crops.",
                    "cloudy": "Cloudy weather. Monitor crop moisture.",
                    "default": "Weather is stable. Proceed with daily activities.",
                    "market_demand_title": "Market Demand",
                    "market_demand_desc": "High demand for rice in your region. Consider updating availability."
                },
                "advisory": {
                    "pro_tip_title": "Today's Pro-Tip",
                    "pro_tip_desc": "\"Early morning harvest reduces petal bruising in vegetables by 12%.\"",
                    "blog": "Advisory Blog",
                    "read_more": "Read More"
                },
                "pricing": {
                    "market": "MARKET",
                    "yours": "YOURS",
                    "no_produce": "Add produce to see pricing alerts"
                },
                "forecaster": {
                    "seven_day": "7-Day Prediction",
                    "advice": "Strategic Advice: AI predicts a 15% price surge by Saturday. Consider holding stock until then."
                },
                "benchmarks": {
                    "delhi": "Azadpur (Delhi)",
                    "tomato": "Tomato",
                    "mumbai": "Vashi (Mumbai)",
                    "rice": "Rice",
                    "chennai": "Koyambedu (Chennai)",
                    "onion": "Onion"
                },
                "niche": {
                    "poultry": "Poultry",
                    "eggs": "Eggs",
                    "urea": "Urea",
                    "stable": "Stable",
                    "view_full": "View Full Niche Index"
                },
                "orders": {
                    "view_all": "View All",
                    "buyer": "Buyer",
                    "no_recent": "No recent orders found."
                }
            },
            "listings": {
                "title": "My Listings",
                "subtitle": "Manage your produce listings",
                "add": "Add Listing",
                "search": "Search crops...",
                "crop": "Crop",
                "price": "Price",
                "grade": "Grade",
                "location": "Location",
                "status": "Status",
                "actions": "Actions",
                "edit": "Edit",
                "delete": "Delete",
                "form": {
                    "new_title": "Add New Listing",
                    "edit_title": "Edit Listing",
                    "crop_name": "Crop Name",
                    "category": "Category",
                    "price_per_unit": "Price per unit",
                    "quantity": "Quantity",
                    "unit": "Unit (e.g. kg)",
                    "quality": "Quality Grade",
                    "submit": "Save Listing",
                    "cancel": "Cancel",
                    "photo": "Product Photo",
                    "upload_tip": "Upload a clear photo of your produce for better visibility."
                }
            }
        }
    },
    hi: {
        translation: {
            "nav": {
                "dashboard": "डैशबोर्ड",
                "listings": "मेरी लिस्टिंग",
                "add_listing": "लिस्टिंग जोड़ें",
                "orders": "ऑर्डर",
                "logout": "साइन आउट",
                "farmer_dashboard": "किसान डैशबोर्ड"
            },
            "dashboard": {
                "title": "किसान डैशबोर्ड",
                "welcome": "स्वागत है",
                "subtitle": "आज आपकी फसलों के साथ क्या हो रहा है.",
                "stats": {
                    "active": "सक्रिय उपज",
                    "orders": "कुल ऑर्डर",
                    "revenue": "कुल आय",
                    "pending": "लंबित ऑर्डर",
                    "items": "आइटम"
                },
                "actions": {
                    "add": "उपज जोड़ें",
                    "orders": "वर्तमान ऑर्डर",
                    "inventory": "इन्वेंटरी",
                    "support": "मदद लें"
                },
                "sections": {
                    "insights": "त्वरित अंतर्दृष्टि",
                    "advisory": "किसान सलाह",
                    "pricing": "मूल्य निर्धारण रणनीति",
                    "forecaster": "एआई मूल्य पूर्वानुमानकर्ता",
                    "benchmarks": "राष्ट्रीय बेंचमार्क",
                    "niche": "आला बाजार निगरानी",
                    "sales": "साप्ताहिक बिक्री अवलोकन",
                    "recent_orders": "हाल के आदेश"
                },
                "weather": {
                    "title": "हाइपरलोकल मौसम सलाह",
                    "clear": "साफ आसमान. कटाई का अच्छा समय.",
                    "rain": "जल्द बारिश की उम्मीद है. खुले फसलों को सुरक्षित करें.",
                    "cloudy": "बादल छाए रहेंगे. फसल की नमी पर नजर रखें.",
                    "default": "मौसम स्थिर है. दैनिक गतिविधियों के साथ आगे बढ़ें.",
                    "market_demand_title": "बाजार की मांग",
                    "market_demand_desc": "आपके क्षेत्र में चावल की भारी मांग है। उपलब्धता अद्यतन करने पर विचार करें।"
                },
                "advisory": {
                    "pro_tip_title": "आज का प्रो-टिप",
                    "pro_tip_desc": "\"सुबह जल्दी कटाई करने से सब्जियों में पंखुड़ी के खरोंच में 12% की कमी आती है।\"",
                    "blog": "सलाहकारी ब्लॉग",
                    "read_more": "और पढ़ें"
                },
                "pricing": {
                    "market": "बाज़ार",
                    "yours": "आपका",
                    "no_produce": "मूल्य निर्धारण अलर्ट देखने के लिए उपज जोड़ें"
                },
                "forecaster": {
                    "seven_day": "7-दिवसीय भविष्यवाणी",
                    "advice": "रणनीतिक सलाह: एआई शनिवार तक कीमतों में 15% उछाल की भविष्यवाणी करता है। तब तक स्टॉक रखने पर विचार करें।"
                },
                "benchmarks": {
                    "delhi": "आज़ादपुर (दिल्ली)",
                    "tomato": "टमाटर",
                    "mumbai": "वाशी (मुंबई)",
                    "rice": "चावल",
                    "chennai": "कोयम्बेडु (चेन्नई)",
                    "onion": "प्याज"
                },
                "niche": {
                    "poultry": "कुक्कुट",
                    "eggs": "अंडे",
                    "urea": "यूरिया",
                    "stable": "स्थिर",
                    "view_full": "पूर्ण आला सूचकांक देखें"
                },
                "orders": {
                    "view_all": "सभी देखें",
                    "buyer": "क्रेता",
                    "no_recent": "हाल ही में कोई आदेश नहीं मिला।"
                }
            },
            "listings": {
                "title": "मेरी लिस्टिंग",
                "subtitle": "अपनी उपज सूची प्रबंधित करें",
                "add": "लिस्टिंग जोड़ें",
                "search": "फसलें खोजें...",
                "crop": "फसल",
                "price": "कीमत",
                "grade": "ग्रेड",
                "location": "स्थान",
                "status": "स्थिति",
                "actions": "कार्रवाई",
                "edit": "संपादित करें",
                "delete": "हटाएं",
                "form": {
                    "new_title": "नई लिस्टिंग जोड़ें",
                    "edit_title": "लिस्टिंग संपादित करें",
                    "crop_name": "फसल का नाम",
                    "category": "श्रेणी",
                    "price_per_unit": "प्रति इकाई मूल्य",
                    "quantity": "मात्रा",
                    "unit": "इकाई (जैसे किलो)",
                    "quality": "गुणवत्ता ग्रेड",
                    "submit": "लिस्टिंग सहेजें",
                    "cancel": "रद्द करें",
                    "photo": "उत्पाद फोटो",
                    "upload_tip": "बेहतर दृश्यता के लिए अपनी उपज की स्पष्ट फोटो अपलोड करें।"
                }
            }
        }
    },
    ta: {
        translation: {
            "nav": {
                "dashboard": "டாஷ்போர்டு",
                "listings": "எனது பட்டியல்கள்",
                "add_listing": "பட்டியலைச் சேர்",
                "orders": "ஆர்டர்கள்",
                "logout": "வெளியேறு",
                "farmer_dashboard": "விவசாயி டாஷ்போர்டு"
            },
            "dashboard": {
                "title": "விவசாயி டாஷ்போர்டு",
                "welcome": "வரவேற்கிறோம்",
                "subtitle": "இன்று உங்கள் பயிர்களின் நிலவரம்.",
                "stats": {
                    "active": "செயலில் உள்ள விளைபொருட்கள்",
                    "orders": "மொத்த ஆர்டர்கள்",
                    "revenue": "மொத்த வருவாய்",
                    "pending": "நிலுவையிலுள்ள ஆர்டர்கள்",
                    "items": "பொருட்கள்"
                },
                "actions": {
                    "add": "பயிரைச் சேர்",
                    "orders": "தற்போதைய ஆர்டர்கள்",
                    "inventory": "சரக்கு",
                    "support": "உதவி பெறு"
                },
                "sections": {
                    "insights": "விரைவான நுண்ணறிவுகள்",
                    "advisory": "விவசாயிகளின் ஆலோசனை",
                    "pricing": "விலை உத்தி",
                    "forecaster": "AI விலை கணிப்பு",
                    "benchmarks": "தேசிய அளவுகோல்கள்",
                    "niche": "முக்கிய சந்தை கண்காணிப்பு",
                    "sales": "வாராந்திர விற்பனை கண்ணோட்டம்",
                    "recent_orders": "சமீபத்திய ஆர்டர்கள்"
                },
                "weather": {
                    "title": "உள்ளூர் வானிலை ஆலோசனை",
                    "clear": "தெளிவான வானம். அறுவடைக்கு ஏற்ற நேரம்.",
                    "rain": "விரைவில் மழை எதிர்பார்க்கப்படுகிறது. வெளி பயிர்களை பாதுகாக்கவும்.",
                    "cloudy": "மேகமூட்டமான வானிலை. பயிரின் ஈரப்பதத்தை கண்காணிக்கவும்.",
                    "default": "வானிலை சீராக உள்ளது. அன்றாட பணிகளைத் தொடரவும்.",
                    "market_demand_title": "சந்தை தேவை",
                    "market_demand_desc": "உங்கள் பகுதியில் அரிசிக்கு அதிக தேவை உள்ளது. இருப்பு நிலையை புதுப்பிக்கவும்."
                },
                "advisory": {
                    "pro_tip_title": "இன்றைய சிறப்பு குறிப்பு",
                    "pro_tip_desc": "\"அதிகாலை அறுவடை காய்கறிகளில் 12% சேதத்தை குறைக்கிறது.\"",
                    "blog": "ஆலோசனை வலைப்பதிவு",
                    "read_more": "மேலும் படிக்க"
                },
                "pricing": {
                    "market": "சந்தை",
                    "yours": "உங்கள்",
                    "no_produce": "விலை எச்சரிக்கைகளைக் காண விளைபொருட்களைச் சேர்க்கவும்"
                },
                "forecaster": {
                    "seven_day": "7 நாள் கணிப்பு",
                    "advice": "சிறப்பு ஆலோசனை: சனிக்கிழமைக்குள் விலை 15% உயரும் என AI கணிக்கிறது. அதுவரை இருப்பு வைக்கலாம்."
                },
                "benchmarks": {
                    "delhi": "ஆசாத்பூர் (டெல்லி)",
                    "tomato": "தக்காளி",
                    "mumbai": "வஷி (மும்பை)",
                    "rice": "அரிசி",
                    "chennai": "கோயம்பேடு (சென்னை)",
                    "onion": "வெங்காயம்"
                },
                "niche": {
                    "poultry": "கோழி",
                    "eggs": "முட்டை",
                    "urea": "யூரியா",
                    "stable": "நிலையான",
                    "view_full": "முழுமையான முக்கிய குறியீட்டைக் காண்க"
                },
                "orders": {
                    "view_all": "அனைத்தையும் காண்க",
                    "buyer": "வாங்குபவர்",
                    "no_recent": "சமீபத்திய ஆர்டர்கள் எதுவும் இல்லை."
                }
            },
            "listings": {
                "title": "எனது பட்டியல்கள்",
                "subtitle": "உங்கள் விளைபொருட்களை நிர்வகிக்கவும்",
                "add": "பட்டியலைச் சேர்",
                "search": "பயிர்களைத் தேடுங்கள்...",
                "crop": "பயிர்",
                "price": "விலை",
                "grade": "தரம்",
                "location": "இடம்",
                "status": "நிலை",
                "actions": "செயல்கள்",
                "edit": "திருத்து",
                "delete": "நீக்கு",
                "form": {
                    "new_title": "புதிய பட்டியலைச் சேர்",
                    "edit_title": "பட்டியலைத் திருத்து",
                    "crop_name": "பயிர் பெயர்",
                    "category": "வகை",
                    "price_per_unit": "ஒரு யூனிட் விலை",
                    "quantity": "அளவு",
                    "unit": "யூனிட் (எ.கா. கிலோ)",
                    "quality": "தர வகை",
                    "submit": "பட்டியலைச் சேமி",
                    "cancel": "ரத்துசெய்",
                    "photo": "தயாரிப்பு புகைப்படம்",
                    "upload_tip": "சிறந்த தெரிவுநிலைக்கு உங்கள் விளைபொருட்களின் தெளிவான புகைப்படத்தைப் பதிவேற்றவும்."
                }
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
