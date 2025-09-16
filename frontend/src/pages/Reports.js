import React from 'react';
import { useTranslation } from 'react-i18next';

const Reports = () => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="card-elevated">
        <h1 className="text-2xl font-bold mb-2">{t('reports')}</h1>
        <p className="text-text-secondary">{t('reports_description')}</p>
      </div>
    </div>
  );
};

export default Reports;
