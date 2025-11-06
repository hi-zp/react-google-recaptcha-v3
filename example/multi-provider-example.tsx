import React, { useState, FC, useCallback } from 'react';
import { useGoogleReCaptcha } from '../src/use-google-recaptcha';

interface MultiProviderExampleProps {
  providerName: string;
  providerKey: string;
}

export const MultiProviderExample: FC<MultiProviderExampleProps> = ({
  providerName,
  providerKey
}) => {
  const { executeRecaptcha, isLoaded } = useGoogleReCaptcha();
  const [token, setToken] = useState('');
  const [verificationCount, setVerificationCount] = useState(0);
  const [action, setAction] = useState('homepage');
  const [customAction, setCustomAction] = useState('');

  const handleVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      console.warn(`${providerName}: executeRecaptcha is not available`);
      return;
    }

    try {
      const result = await executeRecaptcha(action);
      setToken(result);
      setVerificationCount(count => count + 1);
    } catch (error) {
      console.error(`${providerName}: Error executing recaptcha:`, error);
    }
  }, [executeRecaptcha, action, providerName]);

  const handleChangeAction = useCallback(() => {
    if (customAction.trim()) {
      setAction(customAction.trim());
      setCustomAction('');
    }
  }, [customAction]);

  return (
    <div style={{
      border: '2px solid #007bff',
      borderRadius: '8px',
      padding: '20px',
      margin: '20px 0',
      backgroundColor: '#f8f9fa'
    }}>
      <h3 style={{ marginTop: 0, color: '#007bff' }}>
        Provider: {providerName}
      </h3>
      <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
        Key: {providerKey.substring(0, 20)}...
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Current Action: <strong>{action}</strong>
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={customAction}
              onChange={(e) => setCustomAction(e.target.value)}
              placeholder="Enter new action"
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                flex: 1
              }}
            />
            <button
              onClick={handleChangeAction}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Change Action
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={handleVerify}
          disabled={!isLoaded}
          style={{
            padding: '10px 20px',
            backgroundColor: isLoaded ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoaded ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isLoaded ? 'Execute ReCaptcha' : 'Loading ReCaptcha...'}
        </button>
      </div>

      {token && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#e7f3ff',
          borderRadius: '4px',
          wordBreak: 'break-all'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Token:</div>
          <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
            {token}
          </div>
        </div>
      )}

      <div style={{ marginTop: '15px', color: '#666' }}>
        Verification Count: <strong>{verificationCount}</strong>
      </div>

      <div style={{
        marginTop: '10px',
        padding: '8px',
        backgroundColor: isLoaded ? '#d4edda' : '#fff3cd',
        borderRadius: '4px',
        fontSize: '12px',
        color: isLoaded ? '#155724' : '#856404'
      }}>
        Status: {isLoaded ? '✓ Ready' : '⏳ Loading...'}
      </div>
    </div>
  );
};

