import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
    en: {
        translation: {
            "nav": {
                "browse": "Browse",
                "orders": "Orders",
                "transactions": "Transactions",
                "logout": "Logout",
                "hi": "Hi"
            },
            "hero": {
                "title": "Browse Fresh Produce",
                "subtitle": "Fresh from farm to you",
                "search_placeholder": "Search crops, vegetables, fruits...",
                "filters": "Filters"
            },
            "common": {
                "loading": "Searching Mandi Network...",
                "no_results": "No listings found",
                "no_results_sub": "Try adjusting your filters or search",
                "listings_found": "listings found"
            },
            "product": {
                "back": "Back",
                "available": "Available Quantity",
                "order_qty": "Order Quantity",
                "total": "Total Amount",
                "place_order": "Place Order",
                "placing": "Placing Order...",
                "confirmed": "Order Confirmed!",
                "view_orders": "View Orders",
                "continue": "Continue Shopping",
                "quality_premium": "Premium",
                "quality_standard": "Standard",
                "quality_economy": "Economy"
            },
            "orders": {
                "title": "My Orders",
                "no_orders": "No orders yet",
                "no_orders_sub": "Start browsing to place your first order",
                "back": "Back to Orders",
                "order_not_found": "Order not found",
                "cancelled_msg": "This order has been cancelled.",
                "cancel_btn": "Cancel Order",
                "cancel_confirm": "Order cancelled",
                "quantity": "Quantity",
                "total": "Total Amount",
                "payment": "Payment",
                "placed": "Placed",
                "status": {
                    "pending": "Pending",
                    "accepted": "Accepted",
                    "completed": "Completed",
                    "cancelled": "Cancelled"
                },
                "payment_status": {
                    "paid": "Paid",
                    "unpaid": "Unpaid",
                    "refunded": "Refunded"
                }
            }
        }
    },
    hi: {
        translation: {
            "nav": {
                "browse": "ब्राउज़ करें",
                "orders": "ऑर्डर",
                "transactions": "लेनदेन",
                "logout": "लॉग आउट",
                "hi": "नमस्ते"
            },
            "hero": {
                "title": "ताज़ी उपज ब्राउज़ करें",
                "subtitle": "खेत से सीधे आप तक",
                "search_placeholder": "फसलें, सब्जियां, फल खोजें...",
                "filters": "फ़िल्टर"
            },
            "common": {
                "loading": "मंडी नेटवर्क खोजा जा रहा है...",
                "no_results": "कोई लिस्टिंग नहीं मिली",
                "no_results_sub": "अपने फ़िल्टर या खोज को समायोजित करने का प्रयास करें",
                "listings_found": "लिस्टिंग मिली"
            },
            "product": {
                "back": "पीछे",
                "available": "उपलब्ध मात्रा",
                "order_qty": "ऑर्डर मात्रा",
                "total": "कुल राशि",
                "place_order": "ऑर्डर दें",
                "placing": "ऑर्डर दिया जा रहा है...",
                "confirmed": "ऑर्डर की पुष्टि हो गई!",
                "view_orders": "ऑर्डर देखें",
                "continue": "खरीददारी जारी रखें",
                "quality_premium": "प्रीमियम",
                "quality_standard": "मानक",
                "quality_economy": "किफायती"
            },
            "orders": {
                "title": "मेरे ऑर्डर",
                "no_orders": "अभी तक कोई ऑर्डर नहीं",
                "no_orders_sub": "अपना पहला ऑर्डर देने के लिए ब्राउज़ करना शुरू करें",
                "back": "ऑर्डर पर वापस जाएं",
                "order_not_found": "ऑर्डर नहीं मिला",
                "cancelled_msg": "यह ऑर्डर रद्द कर दिया गया है।",
                "cancel_btn": "ऑर्डर रद्द करें",
                "cancel_confirm": "ऑर्डर रद्द कर दिया गया",
                "quantity": "मात्रा",
                "total": "कुल राशि",
                "payment": "भुगतान",
                "placed": "दिनांक",
                "status": {
                    "pending": "लंबित",
                    "accepted": "स्वीकृत",
                    "completed": "पूरा हुआ",
                    "cancelled": "रद्द"
                },
                "payment_status": {
                    "paid": "भुगतान किया गया",
                    "unpaid": "बकाया",
                    "refunded": "वापस किया गया"
                }
            }
        }
    },
    ta: {
        translation: {
            "nav": {
                "browse": "உலாவுக",
                "orders": "ஆர்டர்கள்",
                "transactions": "பரிவர்த்தனைகள்",
                "logout": "வெளியேறு",
                "hi": "வணக்கம்"
            },
            "hero": {
                "title": "புதிய விளைபொருட்களைத் தேடுக",
                "subtitle": "பண்ணையிலிருந்து நேரடியாக உங்களுக்கே",
                "search_placeholder": "பயிர்கள், காய்கறிகள், பழங்களைத் தேடுங்கள்...",
                "filters": "வடிப்பான்கள்"
            },
            "common": {
                "loading": "மண்டி நெட்வொர்க் தேடப்படுகிறது...",
                "no_results": "பட்டியல்கள் எதுவும் இல்லை",
                "no_results_sub": "உங்கள் வடிப்பான்கள் அல்லது தேடலை மாற்ற முயற்சிக்கவும்",
                "listings_found": "பட்டியல்கள் உள்ளன"
            },
            "product": {
                "back": "பின்னால்",
                "available": "கிடைக்கக்கூடிய அளவு",
                "order_qty": "ஆர்டர் அளவு",
                "total": "மொத்த தொகை",
                "place_order": "ஆர்டர் செய்ய",
                "placing": "ஆர்டர் செய்யப்படுகிறது...",
                "confirmed": "ஆர்டர் உறுதி செய்யப்பட்டது!",
                "view_orders": "ஆர்டர்களைப் பார்க்க",
                "continue": "தொடர்ந்து வாங்க",
                "quality_premium": "பிரீமியம்",
                "quality_standard": "தரமானது",
                "quality_economy": "சிக்கனமானது"
            },
            "orders": {
                "title": "எனது ஆர்டர்கள்",
                "no_orders": "ஆர்டர்கள் இன்னும் இல்லை",
                "no_orders_sub": "உங்கள் முதல் ஆர்டரைச் செய்ய உலாவத் தொடங்குங்கள்",
                "back": "ஆர்டர்களுக்குத் திரும்பு",
                "order_not_found": "ஆர்டர் கிடைக்கவில்லை",
                "cancelled_msg": "இந்த ஆர்டர் ரத்து செய்யப்பட்டுள்ளது.",
                "cancel_btn": "ஆர்டரை ரத்துசெய்",
                "cancel_confirm": "ஆர்டர் ரத்து செய்யப்பட்டது",
                "quantity": "அளவு",
                "total": "மொத்த தொகை",
                "payment": "பணம் செலுத்துதல்",
                "placed": "தேதி",
                "status": {
                    "pending": "நிலுவையில் உள்ளது",
                    "accepted": "ஏற்றுக்கொள்ளப்பட்டது",
                    "completed": "முடிந்தது",
                    "cancelled": "ரத்து செய்யப்பட்டது"
                },
                "payment_status": {
                    "paid": "செலுத்தப்பட்டது",
                    "unpaid": "செலுத்தப்படவில்லை",
                    "refunded": "திரும்பப் பெறப்பட்டது"
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
