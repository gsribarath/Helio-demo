import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateText } from '../services/translate';

/**
 * TransText: translates arbitrary dynamic text at runtime using an external API with caching.
 * Props:
 *  - text: string (required) dynamic source text (assumed English if sourceLang not provided)
 *  - sourceLang: string (optional) source code (default 'auto')
 *  - as: string or component (optional) wrapper element, default 'span'
 *  - className: string (optional)
 */
const TransText = ({ text, sourceLang = 'auto', as: Tag = 'span', className, ...rest }) => {
  const { i18n } = useTranslation();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const result = await translateText(text, i18n.language, sourceLang);
        if (mounted) setTranslated(result);
      } catch {
        if (mounted) setTranslated(text);
      }
    };
    run();
    return () => { mounted = false; };
  }, [text, sourceLang, i18n.language]);

  return <Tag className={className} {...rest}>{translated}</Tag>;
};

export default TransText;
