import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TransText from '../components/TransText';

const Medicines = () => {
  const { t } = useTranslation();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [prescriptions, setPrescriptions] = useState([]); // flattened patient prescriptions for display
  // TODO: Replace hardcoded patient identity with authenticated user context when available
  const PATIENT_ID = 'patient-demo-1';
  const PATIENT_NAME = 'Gurpreet Singh';
  const [showMyMedicines, setShowMyMedicines] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);

  // Dummy data for demonstration
  const dummyMedicines = [
    { id: 'Ph01', name: 'Paracetamol 500mg', generic_name: 'Acetaminophen', manufacturer: 'Cipla Ltd', price: 25.50, stock_quantity: 150, expiry_date: '2025-12-31', category: 'Pain Relief', description: 'Pain reliever and fever reducer', requires_prescription: false },
    { id: 'Ph02', name: 'Amoxicillin 250mg', generic_name: 'Amoxicillin', manufacturer: 'Sun Pharma', price: 85.00, stock_quantity: 12, expiry_date: '2024-08-15', category: 'Antibiotics', description: 'Antibiotic for bacterial infections', requires_prescription: true },
    { id: 'Ph03', name: 'Cetirizine 10mg', generic_name: 'Cetirizine HCl', manufacturer: 'Dr. Reddy\'s', price: 45.00, stock_quantity: 0, expiry_date: '2025-03-20', category: 'Antihistamines', description: 'Allergy relief medication', requires_prescription: false },
    { id: 'Ph04', name: 'Metformin 500mg', generic_name: 'Metformin HCl', manufacturer: 'Lupin', price: 120.00, stock_quantity: 75, expiry_date: '2025-11-10', category: 'Diabetes', description: 'Type 2 diabetes management', requires_prescription: true },
    { id: 'Ph05', name: 'Omeprazole 20mg', generic_name: 'Omeprazole', manufacturer: 'Ranbaxy', price: 65.00, stock_quantity: 18, expiry_date: '2024-12-05', category: 'Gastric', description: 'Proton pump inhibitor for acid reflux', requires_prescription: true },
    { id: 'Ph06', name: 'Vitamin D3 60000 IU', generic_name: 'Cholecalciferol', manufacturer: 'Abbott', price: 95.00, stock_quantity: 200, expiry_date: '2026-01-15', category: 'Vitamins', description: 'Vitamin D supplement', requires_prescription: false },
    // Added essential medicines to reach Ph26
    { id: 'Ph07', name: 'Amlodipine 5mg', generic_name: 'Amlodipine', manufacturer: 'Cipla', price: 45.00, stock_quantity: 110, expiry_date: '2026-04-30', category: 'Antihypertensives', description: 'Blood pressure control', requires_prescription: true },
    { id: 'Ph08', name: 'Losartan 50mg', generic_name: 'Losartan Potassium', manufacturer: 'Torrent', price: 55.00, stock_quantity: 95, expiry_date: '2025-10-31', category: 'Antihypertensives', description: 'Blood pressure control', requires_prescription: true },
    { id: 'Ph09', name: 'Atorvastatin 10mg', generic_name: 'Atorvastatin', manufacturer: 'Zydus', price: 70.00, stock_quantity: 80, expiry_date: '2026-02-28', category: 'Lipid Lowering', description: 'Cholesterol management', requires_prescription: true },
    { id: 'Ph10', name: 'Aspirin 75mg', generic_name: 'Acetylsalicylic Acid', manufacturer: 'USV', price: 30.00, stock_quantity: 140, expiry_date: '2025-08-31', category: 'Antiplatelet', description: 'Cardiovascular protection', requires_prescription: true },
    { id: 'Ph11', name: 'Clopidogrel 75mg', generic_name: 'Clopidogrel', manufacturer: 'Dr. Reddy\'s', price: 95.00, stock_quantity: 60, expiry_date: '2026-03-31', category: 'Antiplatelet', description: 'Prevents clot formation', requires_prescription: true },
    { id: 'Ph12', name: 'Levothyroxine 50mcg', generic_name: 'Thyroxine', manufacturer: 'Abbott', price: 40.00, stock_quantity: 160, expiry_date: '2026-05-31', category: 'Thyroid', description: 'Hypothyroidism management', requires_prescription: true },
    { id: 'Ph13', name: 'Salbutamol Inhaler 100mcg', generic_name: 'Albuterol', manufacturer: 'Cipla', price: 180.00, stock_quantity: 35, expiry_date: '2025-09-30', category: 'Respiratory', description: 'Bronchodilator for asthma', requires_prescription: true },
    { id: 'Ph14', name: 'Budesonide Inhaler 200mcg', generic_name: 'Budesonide', manufacturer: 'Cipla', price: 250.00, stock_quantity: 25, expiry_date: '2025-12-31', category: 'Respiratory', description: 'Inhaled corticosteroid', requires_prescription: true },
    { id: 'Ph15', name: 'Doxycycline 100mg', generic_name: 'Doxycycline', manufacturer: 'Pfizer', price: 60.00, stock_quantity: 50, expiry_date: '2025-06-30', category: 'Antibiotics', description: 'Broad-spectrum antibiotic', requires_prescription: true },
    { id: 'Ph16', name: 'Metronidazole 400mg', generic_name: 'Metronidazole', manufacturer: 'Jubilant', price: 35.00, stock_quantity: 65, expiry_date: '2025-07-31', category: 'Antibiotics', description: 'Anaerobic infections', requires_prescription: true },
    { id: 'Ph17', name: 'ORS Sachet', generic_name: 'Oral Rehydration Salts', manufacturer: 'WHO Formula', price: 12.00, stock_quantity: 300, expiry_date: '2026-08-31', category: 'Electrolytes', description: 'Dehydration treatment', requires_prescription: false },
    { id: 'Ph18', name: 'Zinc Sulphate 20mg', generic_name: 'Zinc', manufacturer: 'Cadila', price: 20.00, stock_quantity: 220, expiry_date: '2026-01-31', category: 'Supplements', description: 'Adjunct in diarrhea', requires_prescription: false },
    { id: 'Ph19', name: 'Iron Folic Acid', generic_name: 'Ferrous Sulphate + Folic Acid', manufacturer: 'Intas', price: 28.00, stock_quantity: 180, expiry_date: '2026-02-28', category: 'Supplements', description: 'Anemia prevention', requires_prescription: false },
    { id: 'Ph20', name: 'Calcium + Vitamin D3', generic_name: 'Calcium Carbonate + Cholecalciferol', manufacturer: 'Abbott', price: 85.00, stock_quantity: 130, expiry_date: '2026-04-30', category: 'Supplements', description: 'Bone health', requires_prescription: false },
    { id: 'Ph21', name: 'Ibuprofen 400mg', generic_name: 'Ibuprofen', manufacturer: 'GSK', price: 30.00, stock_quantity: 95, expiry_date: '2025-09-30', category: 'Pain Relief', description: 'NSAID for pain and fever', requires_prescription: false },
    { id: 'Ph22', name: 'Diclofenac 50mg', generic_name: 'Diclofenac Sodium', manufacturer: 'Torrent', price: 32.00, stock_quantity: 70, expiry_date: '2025-10-31', category: 'Pain Relief', description: 'NSAID for pain and inflammation', requires_prescription: true },
    { id: 'Ph23', name: 'Loratadine 10mg', generic_name: 'Loratadine', manufacturer: 'J&J', price: 40.00, stock_quantity: 85, expiry_date: '2026-03-31', category: 'Antihistamines', description: 'Allergy relief', requires_prescription: false },
    { id: 'Ph24', name: 'Ondansetron 4mg', generic_name: 'Ondansetron', manufacturer: 'Sun Pharma', price: 50.00, stock_quantity: 60, expiry_date: '2025-07-31', category: 'Antiemetic', description: 'Controls nausea/vomiting', requires_prescription: true },
    { id: 'Ph25', name: 'Loperamide 2mg', generic_name: 'Loperamide', manufacturer: 'Cipla', price: 25.00, stock_quantity: 90, expiry_date: '2025-08-31', category: 'Antidiarrheal', description: 'Controls diarrhea', requires_prescription: false },
    { id: 'Ph26', name: 'Pantoprazole 40mg', generic_name: 'Pantoprazole', manufacturer: 'Alkem', price: 70.00, stock_quantity: 100, expiry_date: '2026-06-30', category: 'Gastric', description: 'Proton pump inhibitor', requires_prescription: true },
    { id: 'Ph27', name: 'Furosemide 40mg', generic_name: 'Furosemide', manufacturer: 'Sanofi', price: 22.00, stock_quantity: 85, expiry_date: '2026-01-31', category: 'Diuretics', description: 'Edema management', requires_prescription: true },
    { id: 'Ph28', name: 'Hydrochlorothiazide 12.5mg', generic_name: 'HCTZ', manufacturer: 'Cipla', price: 18.00, stock_quantity: 90, expiry_date: '2025-12-31', category: 'Diuretics', description: 'Hypertension adjunct', requires_prescription: true },
    { id: 'Ph29', name: 'Spironolactone 25mg', generic_name: 'Spironolactone', manufacturer: 'Pfizer', price: 40.00, stock_quantity: 70, expiry_date: '2026-02-28', category: 'Diuretics', description: 'Aldosterone antagonist', requires_prescription: true },
    { id: 'Ph30', name: 'Glibenclamide 5mg', generic_name: 'Glyburide', manufacturer: 'Sun Pharma', price: 25.00, stock_quantity: 55, expiry_date: '2025-11-30', category: 'Diabetes', description: 'Blood glucose control', requires_prescription: true },
    { id: 'Ph31', name: 'Insulin Regular', generic_name: 'Human Insulin', manufacturer: 'Novo Nordisk', price: 350.00, stock_quantity: 20, expiry_date: '2025-10-31', category: 'Diabetes', description: 'Short-acting insulin', requires_prescription: true },
    { id: 'Ph32', name: 'Insulin NPH', generic_name: 'Human Insulin', manufacturer: 'Novo Nordisk', price: 360.00, stock_quantity: 18, expiry_date: '2025-10-31', category: 'Diabetes', description: 'Intermediate insulin', requires_prescription: true },
    { id: 'Ph33', name: 'Azithromycin 500mg', generic_name: 'Azithromycin', manufacturer: 'Pfizer', price: 90.00, stock_quantity: 62, expiry_date: '2025-07-31', category: 'Antibiotics', description: 'Macrolide antibiotic', requires_prescription: true },
    { id: 'Ph34', name: 'Ciprofloxacin 500mg', generic_name: 'Ciprofloxacin', manufacturer: 'Bayer', price: 75.00, stock_quantity: 66, expiry_date: '2025-08-31', category: 'Antibiotics', description: 'Fluoroquinolone antibiotic', requires_prescription: true },
    { id: 'Ph35', name: 'Trimethoprim/Sulfamethoxazole', generic_name: 'Co-trimoxazole', manufacturer: 'Cipla', price: 50.00, stock_quantity: 88, expiry_date: '2026-03-31', category: 'Antibiotics', description: 'Broad spectrum', requires_prescription: true },
    { id: 'Ph36', name: 'Fluconazole 150mg', generic_name: 'Fluconazole', manufacturer: 'Cipla', price: 42.00, stock_quantity: 77, expiry_date: '2026-02-28', category: 'Antifungal', description: 'Antifungal agent', requires_prescription: true },
    { id: 'Ph37', name: 'Albendazole 400mg', generic_name: 'Albendazole', manufacturer: 'GSK', price: 20.00, stock_quantity: 120, expiry_date: '2026-05-31', category: 'Anthelmintic', description: 'Deworming', requires_prescription: false },
    { id: 'Ph38', name: 'Ivermectin 12mg', generic_name: 'Ivermectin', manufacturer: 'Sun Pharma', price: 28.00, stock_quantity: 75, expiry_date: '2026-04-30', category: 'Antiparasitic', description: 'Parasitic infections', requires_prescription: true },
    { id: 'Ph39', name: 'Acyclovir 400mg', generic_name: 'Acyclovir', manufacturer: 'Cipla', price: 85.00, stock_quantity: 32, expiry_date: '2025-12-31', category: 'Antiviral', description: 'HSV treatment', requires_prescription: true },
  { id: 'Ph40', name: 'Prednisolone 10mg', generic_name: 'Prednisolone', manufacturer: 'Pfizer', price: 30.00, stock_quantity: 60, expiry_date: '2026-01-31', category: 'Steroids', description: 'Anti-inflammatory', requires_prescription: true },
    { id: 'Ph41', name: 'Hydrocortisone 1% Cream', generic_name: 'Hydrocortisone', manufacturer: 'GSK', price: 35.00, stock_quantity: 44, expiry_date: '2025-12-31', category: 'Dermatology', description: 'Topical steroid', requires_prescription: false },
    { id: 'Ph42', name: 'Clotrimazole 1% Cream', generic_name: 'Clotrimazole', manufacturer: 'Bayer', price: 30.00, stock_quantity: 52, expiry_date: '2026-04-30', category: 'Dermatology', description: 'Topical antifungal', requires_prescription: false },
    { id: 'Ph43', name: 'Miconazole Powder', generic_name: 'Miconazole', manufacturer: 'J&J', price: 40.00, stock_quantity: 46, expiry_date: '2026-06-30', category: 'Dermatology', description: 'Antifungal powder', requires_prescription: false },
    { id: 'Ph44', name: 'Povidone Iodine 10%', generic_name: 'Povidone Iodine', manufacturer: 'Win-Medicare', price: 60.00, stock_quantity: 72, expiry_date: '2026-03-31', category: 'Antiseptic', description: 'Topical antiseptic', requires_prescription: false },
    { id: 'Ph45', name: 'Chlorhexidine Solution', generic_name: 'Chlorhexidine', manufacturer: '3M', price: 65.00, stock_quantity: 40, expiry_date: '2026-02-28', category: 'Antiseptic', description: 'Skin antiseptic', requires_prescription: false },
    { id: 'Ph46', name: 'Lidocaine 2% Gel', generic_name: 'Lidocaine', manufacturer: 'Neon', price: 55.00, stock_quantity: 34, expiry_date: '2025-12-31', category: 'Anesthetic', description: 'Topical anesthetic', requires_prescription: true },
    { id: 'Ph47', name: 'ORS Low Osmolarity', generic_name: 'WHO Formula', manufacturer: 'WHO', price: 12.00, stock_quantity: 250, expiry_date: '2026-07-31', category: 'Electrolytes', description: 'Rehydration', requires_prescription: false },
    { id: 'Ph48', name: 'Magnesium Sulphate', generic_name: 'MgSO4', manufacturer: 'Intas', price: 28.00, stock_quantity: 38, expiry_date: '2026-05-31', category: 'Minerals', description: 'Electrolyte therapy', requires_prescription: true },
    { id: 'Ph49', name: 'Folic Acid 5mg', generic_name: 'Folic Acid', manufacturer: 'Cipla', price: 14.00, stock_quantity: 180, expiry_date: '2026-04-30', category: 'Supplements', description: 'Anemia support', requires_prescription: false },
    { id: 'Ph50', name: 'Vitamin B Complex', generic_name: 'B1 B6 B12', manufacturer: 'Piramal', price: 22.00, stock_quantity: 140, expiry_date: '2026-02-28', category: 'Vitamins', description: 'Nutritional supplement', requires_prescription: false },
    { id: 'Ph51', name: 'Multivitamin Syrup', generic_name: 'Multivitamins', manufacturer: 'Wockhardt', price: 60.00, stock_quantity: 65, expiry_date: '2025-11-30', category: 'Vitamins', description: 'Pediatric supplement', requires_prescription: false },
    { id: 'Ph52', name: 'Sodium Chloride 0.9%', generic_name: 'Normal Saline', manufacturer: 'Baxter', price: 85.00, stock_quantity: 30, expiry_date: '2025-09-30', category: 'IV Fluids', description: 'IV infusion', requires_prescription: true },
    { id: 'Ph53', name: 'Ringer\'s Lactate', generic_name: 'RL', manufacturer: 'Baxter', price: 90.00, stock_quantity: 28, expiry_date: '2025-08-31', category: 'IV Fluids', description: 'IV infusion', requires_prescription: true },
    { id: 'Ph54', name: 'Dextrose 5%', generic_name: 'D5', manufacturer: 'Baxter', price: 80.00, stock_quantity: 33, expiry_date: '2025-07-31', category: 'IV Fluids', description: 'IV infusion', requires_prescription: true },
    { id: 'Ph55', name: 'Adrenaline 1mg/ml', generic_name: 'Epinephrine', manufacturer: 'Neon', price: 55.00, stock_quantity: 26, expiry_date: '2025-12-31', category: 'Emergency', description: 'Anaphylaxis treatment', requires_prescription: true },
    { id: 'Ph56', name: 'Atropine 0.6mg/ml', generic_name: 'Atropine', manufacturer: 'Neon', price: 50.00, stock_quantity: 22, expiry_date: '2025-12-31', category: 'Emergency', description: 'Bradycardia treatment', requires_prescription: true },
    { id: 'Ph57', name: 'Diazepam 5mg', generic_name: 'Diazepam', manufacturer: 'Ranbaxy', price: 25.00, stock_quantity: 42, expiry_date: '2026-01-31', category: 'Sedative', description: 'Anxiolytic/anticonvulsant', requires_prescription: true },
    { id: 'Ph58', name: 'Amitriptyline 25mg', generic_name: 'Amitriptyline', manufacturer: 'Sun Pharma', price: 30.00, stock_quantity: 58, expiry_date: '2026-03-31', category: 'Antidepressant', description: 'Neuropathic pain', requires_prescription: true },
    { id: 'Ph59', name: 'Sertraline 50mg', generic_name: 'Sertraline', manufacturer: 'Pfizer', price: 75.00, stock_quantity: 35, expiry_date: '2026-05-31', category: 'Antidepressant', description: 'SSRI', requires_prescription: true },
    { id: 'Ph60', name: 'Olanzapine 5mg', generic_name: 'Olanzapine', manufacturer: 'Sun Pharma', price: 80.00, stock_quantity: 29, expiry_date: '2026-04-30', category: 'Antipsychotic', description: 'Atypical antipsychotic', requires_prescription: true },
    { id: 'Ph61', name: 'Sodium Valproate 200mg', generic_name: 'Valproate', manufacturer: 'Sun Pharma', price: 65.00, stock_quantity: 40, expiry_date: '2026-02-28', category: 'Antiepileptic', description: 'Seizure control', requires_prescription: true },
    { id: 'Ph62', name: 'Carbamazepine 200mg', generic_name: 'Carbamazepine', manufacturer: 'Novartis', price: 70.00, stock_quantity: 39, expiry_date: '2026-03-31', category: 'Antiepileptic', description: 'Seizure control', requires_prescription: true },
    { id: 'Ph63', name: 'Amoxicillin-Clavulanate 625mg', generic_name: 'Co-amoxiclav', manufacturer: 'GSK', price: 120.00, stock_quantity: 48, expiry_date: '2025-09-30', category: 'Antibiotics', description: 'Broad-spectrum', requires_prescription: true },
    { id: 'Ph64', name: 'Cefixime 200mg', generic_name: 'Cefixime', manufacturer: 'Dr. Reddy\'s', price: 95.00, stock_quantity: 52, expiry_date: '2025-10-31', category: 'Antibiotics', description: 'Cephalosporin', requires_prescription: true },
    { id: 'Ph65', name: 'Ceftriaxone 1g', generic_name: 'Ceftriaxone', manufacturer: 'Roche', price: 140.00, stock_quantity: 36, expiry_date: '2025-12-31', category: 'Antibiotics', description: 'Injectable antibiotic', requires_prescription: true },
    { id: 'Ph66', name: 'Ranitidine 150mg', generic_name: 'Ranitidine', manufacturer: 'Zydus', price: 28.00, stock_quantity: 75, expiry_date: '2025-11-30', category: 'Gastric', description: 'H2 blocker', requires_prescription: true },
    { id: 'Ph67', name: 'Sucralfate Suspension', generic_name: 'Sucralfate', manufacturer: 'Dr. Reddy\'s', price: 110.00, stock_quantity: 38, expiry_date: '2026-04-30', category: 'Gastric', description: 'Ulcer protectant', requires_prescription: true },
    { id: 'Ph68', name: 'Montelukast 10mg', generic_name: 'Montelukast', manufacturer: 'Cipla', price: 65.00, stock_quantity: 62, expiry_date: '2026-01-31', category: 'Respiratory', description: 'Leukotriene antagonist', requires_prescription: true },
    { id: 'Ph69', name: 'Beclomethasone Inhaler', generic_name: 'Beclomethasone', manufacturer: 'Cipla', price: 220.00, stock_quantity: 22, expiry_date: '2025-12-31', category: 'Respiratory', description: 'Inhaled steroid', requires_prescription: true },
    { id: 'Ph70', name: 'Guaifenesin Syrup', generic_name: 'Guaifenesin', manufacturer: 'Piramal', price: 55.00, stock_quantity: 68, expiry_date: '2026-03-31', category: 'Cough/Cold', description: 'Expectorant', requires_prescription: false },
    { id: 'Ph71', name: 'Dextromethorphan Syrup', generic_name: 'Dextromethorphan', manufacturer: 'Wockhardt', price: 60.00, stock_quantity: 70, expiry_date: '2026-04-30', category: 'Cough/Cold', description: 'Antitussive', requires_prescription: false },
    { id: 'Ph72', name: 'Chlorpheniramine 4mg', generic_name: 'Chlorpheniramine', manufacturer: 'GSK', price: 18.00, stock_quantity: 88, expiry_date: '2026-02-28', category: 'Antihistamines', description: 'Allergy relief', requires_prescription: false },
    { id: 'Ph73', name: 'Meclizine 25mg', generic_name: 'Meclizine', manufacturer: 'Pfizer', price: 35.00, stock_quantity: 50, expiry_date: '2026-05-31', category: 'Antiemetic', description: 'Motion sickness', requires_prescription: false },
    { id: 'Ph74', name: 'Domperidone 10mg', generic_name: 'Domperidone', manufacturer: 'Sun Pharma', price: 40.00, stock_quantity: 64, expiry_date: '2025-11-30', category: 'Antiemetic', description: 'Nausea control', requires_prescription: true },
    { id: 'Ph75', name: 'Clotrimazole Vaginal Tablet', generic_name: 'Clotrimazole', manufacturer: 'Bayer', price: 70.00, stock_quantity: 30, expiry_date: '2026-03-31', category: 'Gynecology', description: 'Antifungal', requires_prescription: true },
    { id: 'Ph76', name: 'Tranexamic Acid 500mg', generic_name: 'Tranexamic Acid', manufacturer: 'Cipla', price: 90.00, stock_quantity: 28, expiry_date: '2026-01-31', category: 'Gynecology', description: 'Antifibrinolytic', requires_prescription: true },
    { id: 'Ph77', name: 'Mefenamic Acid 250mg', generic_name: 'Mefenamic Acid', manufacturer: 'Dr. Reddy\'s', price: 32.00, stock_quantity: 72, expiry_date: '2026-02-28', category: 'Pain Relief', description: 'Dysmenorrhea/pain', requires_prescription: true },
    { id: 'Ph78', name: 'Hyoscine Butylbromide 10mg', generic_name: 'Hyoscine Butylbromide', manufacturer: 'Boehringer', price: 40.00, stock_quantity: 65, expiry_date: '2026-04-30', category: 'Antispasmodic', description: 'Abdominal cramps', requires_prescription: true },
    { id: 'Ph79', name: 'Cyclopentolate Eye Drops', generic_name: 'Cyclopentolate', manufacturer: 'Sun Pharma', price: 85.00, stock_quantity: 18, expiry_date: '2026-03-31', category: 'Ophthalmic', description: 'Mydriatic', requires_prescription: true },
    { id: 'Ph80', name: 'Timolol Eye Drops', generic_name: 'Timolol', manufacturer: 'Allergan', price: 95.00, stock_quantity: 16, expiry_date: '2026-02-28', category: 'Ophthalmic', description: 'Antiglaucoma', requires_prescription: true },
    { id: 'Ph81', name: 'Sodium Bicarbonate', generic_name: 'Sodium Bicarbonate', manufacturer: 'Merck', price: 20.00, stock_quantity: 75, expiry_date: '2026-04-30', category: 'Antacid', description: 'Acid neutralizer', requires_prescription: false },
    { id: 'Ph82', name: 'Bisacodyl 5mg', generic_name: 'Bisacodyl', manufacturer: 'Piramal', price: 25.00, stock_quantity: 62, expiry_date: '2026-01-31', category: 'Laxative', description: 'Constipation relief', requires_prescription: false },
    { id: 'Ph83', name: 'Sennosides Tablets', generic_name: 'Senna', manufacturer: 'Himalaya', price: 22.00, stock_quantity: 58, expiry_date: '2026-03-31', category: 'Laxative', description: 'Herbal laxative', requires_prescription: false },
    { id: 'Ph84', name: 'Oral Contraceptive Pill', generic_name: 'Levonorgestrel + Ethinyl Estradiol', manufacturer: 'Pfizer', price: 120.00, stock_quantity: 40, expiry_date: '2026-05-31', category: 'Family Planning', description: 'Contraception', requires_prescription: true },
    { id: 'Ph85', name: 'Emergency Contraceptive', generic_name: 'Levonorgestrel', manufacturer: 'HLL', price: 80.00, stock_quantity: 44, expiry_date: '2026-02-28', category: 'Family Planning', description: 'Post-coital contraception', requires_prescription: false },
  { id: 'Ph86', name: 'Tetanus Toxoid Vaccine', generic_name: 'TT Vaccine', manufacturer: 'Serum Institute', price: 150.00, stock_quantity: 24, expiry_date: '2026-06-30', category: 'Vaccines', description: 'Tetanus prevention', requires_prescription: true },
    { id: 'Ph87', name: 'Hepatitis B Vaccine', generic_name: 'HepB', manufacturer: 'Serum Institute', price: 280.00, stock_quantity: 22, expiry_date: '2026-05-31', category: 'Vaccines', description: 'Hep B prevention', requires_prescription: true },
    { id: 'Ph88', name: 'Rabies Vaccine', generic_name: 'Rabies', manufacturer: 'Bharat Biotech', price: 320.00, stock_quantity: 18, expiry_date: '2026-04-30', category: 'Vaccines', description: 'Post-exposure prophylaxis', requires_prescription: true },
    { id: 'Ph89', name: 'ORS with Zinc Pack', generic_name: 'ORS + Zinc', manufacturer: 'WHO', price: 30.00, stock_quantity: 210, expiry_date: '2026-06-30', category: 'Pediatric', description: 'Diarrhea management', requires_prescription: false },
    { id: 'Ph90', name: 'Paracetamol Syrup', generic_name: 'Acetaminophen', manufacturer: 'Cipla', price: 35.00, stock_quantity: 120, expiry_date: '2026-02-28', category: 'Pediatric', description: 'Fever relief', requires_prescription: false },
    { id: 'Ph91', name: 'Amoxicillin Syrup', generic_name: 'Amoxicillin', manufacturer: 'Sun Pharma', price: 55.00, stock_quantity: 68, expiry_date: '2025-12-31', category: 'Pediatric', description: 'Antibiotic', requires_prescription: true },
    { id: 'Ph92', name: 'ORS Flavored', generic_name: 'Oral Rehydration', manufacturer: 'WHO', price: 14.00, stock_quantity: 260, expiry_date: '2026-04-30', category: 'Pediatric', description: 'Dehydration treatment', requires_prescription: false },
    { id: 'Ph93', name: 'Silver Sulfadiazine Cream', generic_name: 'Silver Sulfadiazine', manufacturer: 'Wockhardt', price: 85.00, stock_quantity: 28, expiry_date: '2026-06-30', category: 'Burns', description: 'Burn wound care', requires_prescription: true },
    { id: 'Ph94', name: 'Metoclopramide 10mg', generic_name: 'Metoclopramide', manufacturer: 'Intas', price: 22.00, stock_quantity: 70, expiry_date: '2026-01-31', category: 'Antiemetic', description: 'Nausea control', requires_prescription: true },
    { id: 'Ph95', name: 'Propranolol 40mg', generic_name: 'Propranolol', manufacturer: 'Abbott', price: 50.00, stock_quantity: 52, expiry_date: '2026-03-31', category: 'Beta Blocker', description: 'Hypertension/anxiety', requires_prescription: true },
    { id: 'Ph96', name: 'Gabapentin 300mg', generic_name: 'Gabapentin', manufacturer: 'Pfizer', price: 110.00, stock_quantity: 36, expiry_date: '2026-04-30', category: 'Neurology', description: 'Neuropathic pain', requires_prescription: true },
    { id: 'Ph97', name: 'Clindamycin 300mg', generic_name: 'Clindamycin', manufacturer: 'Pfizer', price: 85.00, stock_quantity: 44, expiry_date: '2025-12-31', category: 'Antibiotics', description: 'Lincosamide antibiotic', requires_prescription: true },
    { id: 'Ph98', name: 'Nitrofurantoin 100mg', generic_name: 'Nitrofurantoin', manufacturer: 'MacLeods', price: 60.00, stock_quantity: 47, expiry_date: '2026-05-31', category: 'Urinary Antiseptic', description: 'UTI treatment', requires_prescription: true },
    { id: 'Ph99', name: 'Isotonic Saline Nasal Spray', generic_name: 'Sodium Chloride', manufacturer: 'Cipla', price: 70.00, stock_quantity: 54, expiry_date: '2026-04-30', category: 'ENT', description: 'Nasal irrigation', requires_prescription: false },
    { id: 'Ph100', name: 'Acetylcysteine 600mg', generic_name: 'NAC', manufacturer: 'Zydus', price: 95.00, stock_quantity: 33, expiry_date: '2026-06-30', category: 'Respiratory', description: 'Mucolytic', requires_prescription: true }
  ];

  // Base list of pharmacies in Nabha Village
  const nabhaPharmacies = [
    { name: 'Sanjivni Medicos', address: 'Nabha Village' },
    { name: 'Shree Ram Medicos', address: 'Nabha Village' },
    { name: 'City Care Pharmacy', address: 'Nabha Village' },
    { name: 'Gurunanak Pharmacy', address: 'Nabha Village' },
    { name: 'Wellness Medical Hall', address: 'Nabha Village' },
    { name: 'AyuPlus Medicos', address: 'Nabha Village' },
    { name: 'HealthFirst Chemist', address: 'Nabha Village' },
    { name: 'Care & Cure Pharmacy', address: 'Nabha Village' }
  ];

  useEffect(() => {
    fetchMedicines();
    loadPrescriptions();
    const onStorage = (e) => {
      if(e.key === 'helio_prescriptions') loadPrescriptions();
    };
    window.addEventListener('storage', onStorage);
    return ()=> window.removeEventListener('storage', onStorage);
  }, []);

  const loadPrescriptions = () => {
    try {
      const raw = localStorage.getItem('helio_prescriptions');
      if(!raw){ setPrescriptions([]); return; }
      const arr = JSON.parse(raw);
      if(Array.isArray(arr)){
        const mine = arr.filter(r => r.patientId === PATIENT_ID || r.patientName === PATIENT_NAME);
        // Flatten medicines into display list with record metadata
        const flat = mine.flatMap(rec => (rec.medicines||[]).map(m => ({
          rxId: rec.id,
          name: m.name,
          dosage: m.dosage || m.dose || '-',
          frequency: m.frequency || '—',
          duration: m.duration || (m.days? m.days + ' days':'—'),
          createdAt: rec.createdAt
        })));
        setPrescriptions(flat);
      } else setPrescriptions([]);
    } catch(e){ console.error('Failed to load prescriptions', e); setPrescriptions([]); }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      // For demo purposes, we'll use dummy data
      // In production, uncomment the API call below
      // const response = await medicineAPI.getAll();
      // setMedicines(response.data);
      
      // Simulate API delay
      setTimeout(() => {
        setMedicines(dummyMedicines);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setError('load_error');
      setMedicines(dummyMedicines); // Fallback to dummy data
      setLoading(false);
    }
  };

  // Icons removed: text-only indicators will be used

  const filteredMedicines = medicines.filter(medicine => {
    const term = searchTerm.toLowerCase();
    return (
      medicine.name.toLowerCase().includes(term) ||
      (medicine.generic_name || '').toLowerCase().includes(term) ||
      (medicine.id || '').toLowerCase().includes(term)
    );
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  // No icons or badges; keep text-only presentation

  const formatCode = (code) => {
    if (typeof code === 'string' && code.startsWith('Ph')) return code;
    const n = parseInt(code, 10);
    if (Number.isNaN(n)) return String(code ?? '');
    return `Ph${String(n).padStart(2, '0')}`;
  };

  const handleMedicineClick = (medicine) => {
    setSelectedMedicine(medicine);
    setShowPharmacyModal(true);
  };

  const closePharmacyModal = () => {
    setShowPharmacyModal(false);
    setSelectedMedicine(null);
  };

  // Deterministic pseudo-random generator based on medicine id for variety
  const seeded = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    return Math.abs(h);
  };

  const getPharmacyList = (medicineId) => {
    const base = nabhaPharmacies;
    const seed = seeded(medicineId);
    // Rotate base list differently per id
    const rotated = base.map((_, i) => base[(i + (seed % base.length)) % base.length]);
    // Decide availability count between 2 and base.length, based on seed
    const count = 2 + (seed % (base.length - 1));
    // Generate stock numbers (>0) and prices with slight variations
    const list = rotated.slice(0, count).map((p, idx) => ({
      name: p.name,
      address: p.address,
      stock: 3 + ((seed >> (idx % 5)) % 20),
      price: 20 + ((seed % 700) / 10) // ₹20.0 - ₹90.0
    }));
    return list;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="loading"></div>
          <span className="ml-2">{t('loading_medicines')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header - Match Home theme */}
      <div className="bg-gradient-to-r from-primary-color to-primary-dark text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-black mb-2 tracking-tight">
            {t('medicines')} <span className="text-primary-light">{t('inventory')}</span>
          </h1>
          <p className="text-primary-light">{t('realtime_medicine_stock')}</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 pb-40">
        {/* My Medicines toggle button */}
        <div className="flex flex-col items-center mb-10">
          <button
            type="button"
            onClick={()=> setShowMyMedicines(v=>!v)}
            className="my-appointments-btn w-full sm:w-auto max-w-xs mb-4"
            aria-expanded={showMyMedicines}
            aria-controls="my-medicines-panel"
          >
            My Medicines {showMyMedicines ? '▲' : '▼'}
          </button>
          {showMyMedicines && (
            <div id="my-medicines-panel" className="w-full max-w-5xl animate-fade-in">
              <div className="card-elevated mb-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-text-primary m-0">My Medicines</h2>
                  <div className="text-xs text-text-secondary font-medium">{prescriptions.length} item{prescriptions.length!==1?'s':''}</div>
                </div>
                {prescriptions.length === 0 && (
                  <div className="text-text-secondary text-sm">No prescribed medicines yet.</div>
                )}
                {prescriptions.length > 0 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-80 overflow-auto pr-1" role="list" aria-label="Prescribed medicines list">
                    {prescriptions.map((p,i)=>(
                      <div key={i} className="border border-border-light rounded-xl p-3 bg-white shadow-sm flex flex-col">
                        <div className="font-semibold text-text-primary mb-1 leading-snug" title={p.name}>{p.name}</div>
                        <div className="text-[11px] text-text-secondary space-y-1">
                          <div><span className="font-medium text-text-primary">Dosage:</span> {p.dosage}</div>
                          <div><span className="font-medium text-text-primary">Frequency:</span> {p.frequency}</div>
                          <div><span className="font-medium text-text-primary">Duration:</span> {p.duration}</div>
                          <div className="text-[10px] mt-1 opacity-70">{new Date(p.createdAt).toLocaleString()}</div>
                          <div className="text-[10px] opacity-60">Rx: {p.rxId}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
  {/* Search only (text-only, no icons) */}
        <div className="card-elevated mb-6 max-w-3xl mx-auto">
          <label htmlFor="medicine-search" className="block text-sm font-semibold text-text-primary mb-1">{t('search_medicines')}</label>
          <div className="input-wrapper">
            <input
              id="medicine-search"
              type="text"
              placeholder={t('search_medicines_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              autoComplete="off"
            />
            {searchTerm && (
              <button
                type="button"
                aria-label={t('clear_search')}
                className="input-clear-btn"
                onClick={() => setSearchTerm('')}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6">
            {t('failed_to_load_medicines')}
          </div>
        )}

        {/* Medicines Table - Text-only columns */}
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="inventory-table sticky-header w-full table-fixed text-sm">
              <colgroup>
                <col className="col-name" />
                <col className="col-id" />
                <col className="col-stock" />
                <col className="col-expiry" />
              </colgroup>
              <thead>
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-text-primary">{t('medicine_name')}</th>
                  <th className="text-center p-3 text-sm font-semibold text-text-primary nowrap">{t('id')}</th>
                  <th className="text-center p-3 text-sm font-semibold text-text-primary nowrap">{t('stock')}</th>
                  <th className="text-center p-3 text-sm font-semibold text-text-primary nowrap">{t('expiry')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-gray-50">
                    <td className="p-3 align-top break-words" data-label={t('medicine_name')}>
                      <div
                        className="font-medium clickable-name leading-snug"
                        onClick={() => handleMedicineClick(medicine)}
                        title={t('view_pharmacy_availability')}
                      >
                        <TransText text={medicine.name} />
                      </div>
                      {/* Show only medicine name; generic/chemistry name removed as requested */}
                    </td>
                    <td className="p-3 align-top text-center" data-label={t('id')}>
                      <div className="text-text-primary inline-block min-w-[2.75rem] tabular-nums nowrap">{formatCode(medicine.id)}</div>
                    </td>
                    <td className="p-3 text-center align-top" data-label={t('stock')}>
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: medicine.stock_quantity > 0 ? '#16a34a' : '#ef4444'
                        }}
                      >
                        {medicine.stock_quantity > 0 ? t('in_stock') : t('out_of_stock')}
                      </span>
                    </td>
                    <td className="p-3 text-center align-top" data-label={t('expiry')}>
                      <span className="expiry-date text-text-secondary tabular-nums">{formatDate(medicine.expiry_date)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Summary / Empty State */}
        {filteredMedicines.length === 0 && (
          <div className="text-center py-12 text-text-secondary">{t('no_medicines_found')}</div>
        )}
        {filteredMedicines.length > 0 && (
          <div className="mt-6 text-center text-text-secondary text-sm">
            {t('showing_count_of_total', { shown: filteredMedicines.length, total: medicines.length })}
          </div>
        )}
      </div>

      {/* Pharmacy Availability Modal */}
      {showPharmacyModal && selectedMedicine && (
        <div className="modal-overlay animate-modal-appear" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3 className="text-lg font-semibold text-text-primary"><TransText text={selectedMedicine.name} /></h3>
                {selectedMedicine.generic_name && (
                  <p className="text-sm text-text-secondary"><TransText text={selectedMedicine.generic_name} /></p>
                )}
              </div>
              <button
                onClick={closePharmacyModal}
                className="modal-close-btn"
                aria-label={t('close_modal')}
                title={t('close')}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <h4 className="font-medium text-text-primary mb-3">{t('available_at_location', { location: 'Nabha Village' })}</h4>

              {(() => {
                const available = getPharmacyList(selectedMedicine.id).filter(p => (p.stock ?? 0) > 0);
                if (available.length === 0) {
                  return <div className="text-sm text-text-secondary">{t('currently_unavailable_nearby')}</div>;
                }
                return (
                  <ul className="space-y-2">
                    {available.map((pharmacy, index) => (
                      <li key={index} className="font-medium text-text-primary"><TransText text={pharmacy.name} /></li>
                    ))}
                  </ul>
                );
              })()}
            </div>

            <div className="modal-footer">
              <button onClick={closePharmacyModal} className="btn btn-primary w-100">{t('close')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicines;