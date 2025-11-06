import React, { Component } from 'react';
import {
  IWithGoogleReCaptchaProps,
  withGoogleReCaptcha
} from '../src/with-google-recaptcha';

interface ReCaptchaHOCComponentOwnProps {
  providerName: string;
  providerKey: string;
}

type ReCaptchaHOCComponentProps = ReCaptchaHOCComponentOwnProps & Partial<IWithGoogleReCaptchaProps>;

class ReCaptchaHOCComponent extends Component<ReCaptchaHOCComponentProps> {
  state = { token: undefined as string | undefined };

  handleVerifyRecaptcha = async () => {
    const { googleReCaptchaProps, providerName } = this.props;
    const executeRecaptcha = googleReCaptchaProps?.executeRecaptcha;

    if (!executeRecaptcha) {
      console.log(`${providerName}: Recaptcha has not been loaded`);
      return;
    }

    try {
      const token = await executeRecaptcha('homepage');
      this.setState({ token });
    } catch (error) {
      console.error(`${providerName}: Error executing recaptcha:`, error);
    }
  };

  render() {
    const { token } = this.state;
    const { googleReCaptchaProps, providerName, providerKey } = this.props;
    const isLoaded = googleReCaptchaProps?.isLoaded ?? false;

    return (
      <div style={{
        border: '2px solid #28a745',
        borderRadius: '8px',
        padding: '20px',
        margin: '20px 0',
        backgroundColor: '#f8f9fa'
      }}>
        <h3 style={{ marginTop: 0, color: '#28a745' }}>
          HOC Example - Provider: {providerName}
        </h3>
        <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
          Key: {providerKey.substring(0, 20)}...
        </div>
        
        <button
          onClick={this.handleVerifyRecaptcha}
          disabled={!isLoaded}
          style={{
            padding: '10px 20px',
            backgroundColor: isLoaded ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoaded ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '15px'
          }}
        >
          {isLoaded ? 'Verify Recaptcha (HOC)' : 'Loading Recaptcha...'}
        </button>

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
  }
}

export const MultiProviderHOCExample = withGoogleReCaptcha(ReCaptchaHOCComponent);

