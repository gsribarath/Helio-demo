import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      home: "Home",
      doctors: "Doctors",
  appointments: "Appointments",
  reports: "Reports",
  prescriptions: "Prescriptions",
      medicines: "Medicines",
      availability: "Availability",
      schedule: "Schedule",
      profile: "Profile",
      settings: "Settings",
      
      // Common
      search: "Search",
      filter: "Filter",
      available: "Available",
      unavailable: "Unavailable",
      book_appointment: "Book Appointment",
      consult_now: "Consult Now",
      view_details: "View Details",
      
      // Doctor related
      specialty: "Specialty",
      experience: "Experience",
      consultation_fee: "Consultation Fee",
      rating: "Rating",
      languages: "Languages",
      qualifications: "Qualifications",
      
      // Medicine related
      medicine_name: "Medicine Name",
      price: "Price",
      stock: "Stock",
      expiry_date: "Expiry Date",
      low_stock: "Low Stock",
      in_stock: "In Stock",
      out_of_stock: "Out of Stock",
      
      // Patient profile
      name: "Name",
      age: "Age",
      gender: "Gender",
      phone: "Phone",
      address: "Address",
      medical_history: "Medical History",
  // prescriptions label moved to navigation keys above to avoid duplication
      
      // Appointment booking
      book_appointment_title: "Book Appointment",
      patient_name: "Patient Name",
      health_issue: "Health Issue / Symptoms",
      specialist_required: "Specialist Required",
      preferred_date: "Preferred Date",
      preferred_time: "Preferred Time",
      hospital_name: "Hospital Name",
      appointment_booked: "Appointment Booked Successfully!",
      appointment_details: "Appointment Details",
      appointment_id: "Appointment ID",
      booking: "Booking...",
      cancel: "Cancel",
      done: "Done",
      enter_patient_name: "Enter patient's full name",
      enter_age: "Enter patient's age",
      describe_symptoms: "Describe the health issue or symptoms in detail...",
      select_specialist: "Select Specialist",
      select_time: "Select Time",
      sms_confirmation: "You will receive an SMS confirmation shortly.",
      email_confirmation: "Check your email for appointment details.",
      
      // Authentication
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      confirm_password: "Confirm Password",
      user_type: "User Type",
      patient: "Patient",
      doctor: "Doctor",
      pharmacist: "Pharmacist",
      
      // Login page
      welcome_subtitle: "Bringing Healthcare Closer to You",
      select_role: "Choose Your Role",
      healthcare_access: "Healthcare Access",
      patient_desc: "Access medical consultations and health records",
      doctor_desc: "Manage appointments and patient consultations", 
      pharmacist_desc: "Manage prescriptions and medicine inventory",
      
      // Notifications
      login_success: "Login successful",
      login_failed: "Login failed",
      registration_success: "Registration successful",
      registration_failed: "Registration failed",
      
      // App title and descriptions
      app_title: "Helio - Rural Healthcare",
      app_description: "Connecting rural patients with doctors through telemedicine",
      welcome_message: "Welcome to Helio",
      tagline: "Healthcare at your fingertips"
    }
  },
  hi: {
    translation: {
      // Navigation
      home: "होम",
      doctors: "डॉक्टर",
  appointments: "अपॉइंटमेंट",
  reports: "रिपोर्ट्स",
  prescriptions: "प्रिस्क्रिप्शन",
      medicines: "दवाइयां",
      availability: "उपलब्धता",
      schedule: "समय सारणी",
      profile: "प्रोफाइल",
      settings: "सेटिंग्स",
      
      // Common
      search: "खोजें",
      filter: "फिल्टर",
      available: "उपलब्ध",
      unavailable: "अनुपलब्ध",
      book_appointment: "अपॉइंटमेंट बुक करें",
      consult_now: "अभी सलाह लें",
      view_details: "विवरण देखें",
      
      // Doctor related
      specialty: "विशेषज्ञता",
      experience: "अनुभव",
      consultation_fee: "परामर्श शुल्क",
      rating: "रेटिंग",
      languages: "भाषाएं",
      qualifications: "योग्यताएं",
      
      // Medicine related
      medicine_name: "दवा का नाम",
      price: "कीमत",
      stock: "स्टॉक",
      expiry_date: "समाप्ति तिथि",
      low_stock: "कम स्टॉक",
      in_stock: "स्टॉक में",
      out_of_stock: "स्टॉक खत्म",
      
      // Patient profile
      name: "नाम",
      age: "उम्र",
      gender: "लिंग",
      phone: "फोन",
      address: "पता",
      medical_history: "चिकित्सा इतिहास",
  // prescriptions label moved to navigation keys above to avoid duplication
      
      // Appointment booking
      book_appointment_title: "अपॉइंटमेंट बुक करें",
      patient_name: "मरीज़ का नाम",
      health_issue: "स्वास्थ्य समस्या / लक्षण",
      specialist_required: "आवश्यक विशेषज्ञ",
      preferred_date: "पसंदीदा तारीख",
      preferred_time: "पसंदीदा समय",
      hospital_name: "अस्पताल का नाम",
      appointment_booked: "अपॉइंटमेंट सफलतापूर्वक बुक हो गया!",
      appointment_details: "अपॉइंटमेंट विवरण",
      appointment_id: "अपॉइंटमेंट आईडी",
      booking: "बुकिंग...",
      cancel: "रद्द करें",
      done: "पूर्ण",
      enter_patient_name: "मरीज़ का पूरा नाम दर्ज करें",
      enter_age: "मरीज़ की उम्र दर्ज करें",
      describe_symptoms: "स्वास्थ्य समस्या या लक्षणों का विस्तार से वर्णन करें...",
      select_specialist: "विशेषज्ञ चुनें",
      select_time: "समय चुनें",
      sms_confirmation: "आपको जल्द ही एसएमएस पुष्टि मिल जाएगी।",
      email_confirmation: "अपॉइंटमेंट विवरण के लिए अपना ईमेल चेक करें।",
      
      // Authentication
      login: "लॉगिन",
      register: "रजिस्टर",
      email: "ईमेल",
      password: "पासवर्ड",
      confirm_password: "पासवर्ड की पुष्टि करें",
      user_type: "उपयोगकर्ता प्रकार",
      patient: "मरीज़",
      doctor: "डॉक्टर",
      pharmacist: "फार्मासिस्ट",
      
      // Login page
      welcome_subtitle: "स्वास्थ्य सेवा को आप तक लाना",
      select_role: "अपनी भूमिका चुनें",
      healthcare_access: "स्वास्थ्य सेवा पहुंच",
      patient_desc: "चिकित्सा परामर्श और स्वास्थ्य रिकॉर्ड तक पहुंच",
      doctor_desc: "अपॉइंटमेंट और रोगी परामर्श का प्रबंधन",
      pharmacist_desc: "प्रिस्क्रिप्शन और दवा इन्वेंटरी का प्रबंधन",
      
      // Notifications
      login_success: "लॉगिन सफल",
      login_failed: "लॉगिन असफल",
      registration_success: "पंजीकरण सफल",
      registration_failed: "पंजीकरण असफल",
      
      // App title and descriptions
      app_title: "हेलियो - ग्रामीण स्वास्थ्य सेवा",
      app_description: "टेलीमेडिसिन के माध्यम से ग्रामीण मरीजों को डॉक्टरों से जोड़ना",
      welcome_message: "हेलियो में आपका स्वागत है",
      tagline: "आपकी उंगलियों पर स्वास्थ्य सेवा"
    }
  },
  pa: {
    translation: {
      // Navigation
      home: "ਘਰ",
      doctors: "ਡਾਕਟਰ",
  appointments: "ਮੁਲਾਕਾਤਾਂ",
  reports: "ਰਿਪੋਰਟਾਂ",
  prescriptions: "ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ",
      medicines: "ਦਵਾਈਆਂ",
      schedule: "ਸਮਾਂ ਸਾਰਣੀ",
      profile: "ਪ੍ਰੋਫਾਈਲ",
      settings: "ਸੈਟਿੰਗਜ਼",
      
      // Common
      search: "ਖੋਜੋ",
      filter: "ਫਿਲਟਰ",
      available: "ਉਪਲਬਧ",
      unavailable: "ਅਣਉਪਲਬਧ",
      book_appointment: "ਮੁਲਾਕਾਤ ਬੁੱਕ ਕਰੋ",
      consult_now: "ਹੁਣੇ ਸਲਾਹ ਲਓ",
      view_details: "ਵੇਰਵੇ ਵੇਖੋ",
      
      // Doctor related
      specialty: "ਵਿਸ਼ੇਸ਼ਤਾ",
      experience: "ਤਜਰਬਾ",
      consultation_fee: "ਸਲਾਹ ਫੀਸ",
      rating: "ਰੇਟਿੰਗ",
      languages: "ਭਾਸ਼ਾਵਾਂ",
      qualifications: "ਯੋਗਤਾਵਾਂ",
      
      // Medicine related
      medicine_name: "ਦਵਾਈ ਦਾ ਨਾਮ",
      price: "ਕੀਮਤ",
      stock: "ਸਟਾਕ",
      expiry_date: "ਮਿਆਦ ਦੀ ਮਿਤੀ",
      low_stock: "ਘੱਟ ਸਟਾਕ",
      in_stock: "ਸਟਾਕ ਵਿੱਚ",
      out_of_stock: "ਸਟਾਕ ਖਤਮ",
      
      // Patient profile
      name: "ਨਾਮ",
      age: "ਉਮਰ",
      gender: "ਲਿੰਗ",
      phone: "ਫੋਨ",
      address: "ਪਤਾ",
      medical_history: "ਮੈਡੀਕਲ ਇਤਿਹਾਸ",
  // prescriptions label moved to navigation keys above to avoid duplication
      
      // Authentication
      login: "ਲਾਗਇਨ",
      register: "ਰਜਿਸਟਰ",
      email: "ਈਮੇਲ",
      password: "ਪਾਸਵਰਡ",
      confirm_password: "ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
      user_type: "ਯੂਜ਼ਰ ਦੀ ਕਿਸਮ",
      patient: "ਮਰੀਜ਼",
      doctor: "ਡਾਕਟਰ",
      pharmacist: "ਫਾਰਮਾਸਿਸਟ",
      
      // Login page
      welcome_subtitle: "ਸਿਹਤ ਸੇਵਾ ਨੂੰ ਤੁਹਾਡੇ ਨੇੜੇ ਲਿਆਉਣਾ",
      select_role: "ਆਪਣੀ ਭੂਮਿਕਾ ਚੁਣੋ",
      healthcare_access: "ਸਿਹਤ ਸੇਵਾ ਪਹੁੰਚ",
      patient_desc: "ਮੈਡੀਕਲ ਸਲਾਹ ਅਤੇ ਸਿਹਤ ਰਿਕਾਰਡ ਤੱਕ ਪਹੁੰਚ",
      doctor_desc: "ਮੁਲਾਕਾਤਾਂ ਅਤੇ ਮਰੀਜ਼ ਸਲਾਹ ਦਾ ਪ੍ਰਬੰਧਨ",
      pharmacist_desc: "ਨੁਸਖੇ ਅਤੇ ਦਵਾਈ ਸੂਚੀ ਦਾ ਪ੍ਰਬੰਧਨ",
      
      // Notifications
      login_success: "ਲਾਗਇਨ ਸਫਲ",
      login_failed: "ਲਾਗਇਨ ਅਸਫਲ",
      registration_success: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਫਲ",
      registration_failed: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਸਫਲ",
      
      // App title and descriptions
      app_title: "ਹੇਲੀਓ - ਪਿੰਡੀ ਸਿਹਤ ਸੇਵਾ",
      app_description: "ਟੈਲੀਮੈਡਸਿਨ ਰਾਹੀਂ ਪਿੰਡੀ ਮਰੀਜ਼ਾਂ ਨੂੰ ਡਾਕਟਰਾਂ ਨਾਲ ਜੋੜਨਾ",
      welcome_message: "ਹੇਲੀਓ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ",
      tagline: "ਤੁਹਾਡੀਆਂ ਉਂਗਲਾਂ 'ਤੇ ਸਿਹਤ ਸੇਵਾ"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;