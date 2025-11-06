import React, { FC, ReactNode } from 'react';
import { GoogleReCaptchaProvider } from '../src/google-recaptcha-provider';
import { MultiProviderExample } from './multi-provider-example';
import { MultiProviderHOCExample } from './multi-provider-hoc-example';

interface ProviderSectionProps {
  providerName: string;
  providerKey: string;
  useRecaptchaNet?: boolean;
  useEnterprise?: boolean;
  children?: ReactNode;
}

export const ProviderSection: FC<ProviderSectionProps> = ({
  providerName,
  providerKey,
  useRecaptchaNet = false,
  useEnterprise = false,
  children
}) => {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={providerKey}
      useRecaptchaNet={useRecaptchaNet}
      useEnterprise={useEnterprise}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'body',
        id: `google-recaptcha-${providerName.toLowerCase().replace(/\s+/g, '-')}`
      }}
    >
      <div style={{
        border: '3px solid #333',
        borderRadius: '12px',
        padding: '30px',
        margin: '30px 0',
        backgroundColor: '#fff',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          marginTop: 0,
          paddingBottom: '15px',
          borderBottom: '2px solid #333',
          color: '#333'
        }}>
          {providerName} Section
        </h2>
        
        <MultiProviderExample
          providerName={providerName}
          providerKey={providerKey}
        />
        
        <MultiProviderHOCExample
          providerName={providerName}
          providerKey={providerKey}
        />

        {children}
      </div>
    </GoogleReCaptchaProvider>
  );
};

