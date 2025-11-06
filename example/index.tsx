import * as React from 'react';
import * as ReactDom from 'react-dom';
import { ProviderSection } from './provider-section';
import { GoogleRecaptchaExample } from './google-recaptcha-example';
import { WithGoogleRecaptchaExample } from './with-google-recaptcha-example';

// Get reCaptcha keys from environment variables
// You can set different keys for different providers to test multi-provider scenarios
const PRIMARY_RECAPTCHA_KEY = process.env.RECAPTCHA_KEY || process.env.PRIMARY_RECAPTCHA_KEY || '';
const SECONDARY_RECAPTCHA_KEY = process.env.SECONDARY_RECAPTCHA_KEY || process.env.RECAPTCHA_KEY || '';

const App: React.FC = () => {
  const [showPrimaryProvider, setShowPrimaryProvider] = React.useState(true);
  const [showSecondaryProvider, setShowSecondaryProvider] = React.useState(true);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        React Google reCAPTCHA v3 - Multi Provider Example
      </h1>
      
      <div style={{
        padding: '15px',
        marginBottom: '30px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '4px'
      }}>
        <strong>⚠️ Multi Provider Test:</strong> This example demonstrates the usage of{' '}
        <strong>two independent GoogleReCaptchaProvider instances</strong>.
        Each provider maintains its own context and can be used independently.
        Make sure to set PRIMARY_RECAPTCHA_KEY and SECONDARY_RECAPTCHA_KEY environment variables
        if you want to test with different keys.
      </div>

      {/* Toggle Controls */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <input
            type="checkbox"
            checked={showPrimaryProvider}
            onChange={(e) => setShowPrimaryProvider(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ fontWeight: 500 }}>显示 Primary Provider</span>
        </label>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <input
            type="checkbox"
            checked={showSecondaryProvider}
            onChange={(e) => setShowSecondaryProvider(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ fontWeight: 500 }}>显示 Secondary Provider</span>
        </label>
      </div>

      {/* First Provider Section */}
      {showPrimaryProvider && (
        <ProviderSection
          providerName="Primary Provider"
          providerKey={PRIMARY_RECAPTCHA_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
          useRecaptchaNet={false}
        >
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#e7f3ff',
            borderRadius: '4px'
          }}>
            <h4>Legacy Hook Example (within Primary Provider):</h4>
            <GoogleRecaptchaExample />
          </div>
        </ProviderSection>
      )}

      {/* Second Provider Section */}
      {showSecondaryProvider && (
        <ProviderSection
          providerName="Secondary Provider"
          providerKey={SECONDARY_RECAPTCHA_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
          useRecaptchaNet={false}
        >
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#e7f3ff',
            borderRadius: '4px'
          }}>
            <h4>Legacy HOC Example (within Secondary Provider):</h4>
            <WithGoogleRecaptchaExample />
          </div>
        </ProviderSection>
      )}

      {/* Comparison Section */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3>Key Observations:</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>
            <strong>Independent Contexts:</strong> Each ProviderSection maintains its own
            GoogleReCaptchaContext, so components within each section only access their
            respective provider's recaptcha instance.
          </li>
          <li>
            <strong>Script Isolation:</strong> Each provider can have its own script ID,
            allowing for better script management and cleanup.
          </li>
          <li>
            <strong>Token Generation:</strong> Tokens generated from one provider are
            independent of tokens from another provider, even if they use the same site key.
          </li>
          <li>
            <strong>Use Cases:</strong> This pattern is useful when you need to:
            <ul>
              <li>Use different reCAPTCHA keys for different parts of your application</li>
              <li>Test different configurations side by side</li>
              <li>Support multiple tenants with different keys</li>
              <li>Isolate reCAPTCHA functionality in different modules</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};

ReactDom.render(<App />, document.getElementById('app'));
