import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  cleanGoogleRecaptcha,
  injectGoogleReCaptchaScript,
  logWarningMessage
} from './utils';

enum GoogleRecaptchaError {
  SCRIPT_NOT_AVAILABLE = 'Recaptcha script is not available'
}

interface IGoogleReCaptchaProviderProps {
  reCaptchaKey: string;
  language?: string;
  useRecaptchaNet?: boolean;
  useEnterprise?: boolean;
  scriptProps?: {
    nonce?: string;
    defer?: boolean;
    async?: boolean;
    appendTo?: 'head' | 'body';
    id?: string;
    onLoadCallbackName?: string;
  };
  container?: {
    element?: string | HTMLElement;
    parameters: {
      badge?: 'inline' | 'bottomleft' | 'bottomright';
      theme?: 'dark' | 'light';
      tabindex?: number;
      callback?: () => void;
      expiredCallback?: () => void;
      errorCallback?: () => void;
    }
  };
  children: ReactNode;
}

export interface IGoogleReCaptchaConsumerProps {
  executeRecaptcha?: (action?: string) => Promise<string>;
  container?: string | HTMLElement;
  isLoaded: boolean;
}

const GoogleReCaptchaContext = createContext<IGoogleReCaptchaConsumerProps>({
  executeRecaptcha: () => {
    // This default context function is not supposed to be called
    throw Error(
      'GoogleReCaptcha Context has not yet been implemented, if you are using useGoogleReCaptcha hook, make sure the hook is called inside component wrapped by GoogleRecaptchaProvider'
    );
  },
  isLoaded: false
});

const { Consumer: GoogleReCaptchaConsumer } = GoogleReCaptchaContext;

export function GoogleReCaptchaProvider({
  reCaptchaKey,
  useEnterprise = false,
  useRecaptchaNet = false,
  scriptProps,
  language,
  container,
  children
}: IGoogleReCaptchaProviderProps) {
  const [greCaptchaInstance, setGreCaptchaInstance] = useState<null | {
    execute: Function;
  }>(null);
  const clientId = useRef<number | string>(reCaptchaKey);
  const isMountedRef = useRef(true);
  const onLoadCallbackRef = useRef<(() => void) | null>(null);
  const onLoadCallbackNameRef = useRef<string | null>(null);

  const scriptPropsJson = JSON.stringify(scriptProps);
  const parametersJson = JSON.stringify(container?.parameters);

  useEffect(() => {
    if (!reCaptchaKey) {
      logWarningMessage(
        '<GoogleReCaptchaProvider /> recaptcha key not provided'
      );

      return;
    }

    isMountedRef.current = true;
    const scriptId = scriptProps?.id || 'google-recaptcha-v3';
    // Generate unique callback name for each provider instance to avoid conflicts
    // Use scriptId to ensure uniqueness per provider instance
    const onLoadCallbackName = scriptProps?.onLoadCallbackName || `onRecaptchaLoadCallback_${scriptId}`;

    // Create a unique callback for this provider instance
    const onLoadCallback = () => {
      // Check if provider is still mounted before executing
      if (!isMountedRef.current) {
        return;
      }

      /* eslint-disable @typescript-eslint/no-explicit-any */
      if (!window || !(window as any).grecaptcha) {
        return;
      }

      const grecaptcha = useEnterprise
        ? (window as any).grecaptcha?.enterprise
        : (window as any).grecaptcha;

      if (!grecaptcha) {
        return;
      }

      // Validate required parameters
      if (!reCaptchaKey) {
        logWarningMessage('Missing required parameters: sitekey');
        return;
      }

      // Only render if container is provided (explicit render mode)
      if (!container?.element) {
        // For default render mode, no need to call grecaptcha.render()
        // The script is loaded with render=sitekey, so grecaptcha is ready to use
        return;
      }

      try {
        // Validate required parameters before calling grecaptcha.render()
        if (!reCaptchaKey) {
          logWarningMessage('Missing required parameters: sitekey');
          return;
        }

        const params = {
          badge: 'inline',
          size: 'invisible',
          sitekey: reCaptchaKey,
          ...(container?.parameters || {})
        };
        
        // Ensure sitekey is present
        if (!params.sitekey) {
          logWarningMessage('Missing required parameters: sitekey');
          return;
        }

        // Only call grecaptcha.render() if grecaptcha is ready
        if (typeof grecaptcha.render !== 'function') {
          logWarningMessage('grecaptcha.render is not available');
          return;
        }

        clientId.current = grecaptcha.render(container.element, params);
      } catch (error) {
        // Silently fail if render fails (e.g., provider already unmounted)
        logWarningMessage(`Failed to render recaptcha: ${error}`);
      }
    };

    // Store callback reference and name for cleanup
    onLoadCallbackRef.current = onLoadCallback;
    onLoadCallbackNameRef.current = onLoadCallbackName;
    ((window as unknown) as {[key: string]: () => void})[onLoadCallbackName] = onLoadCallback;

    const onLoad = () => {
      // Check if provider is still mounted before executing
      if (!isMountedRef.current) {
        return;
      }

      if (!window || !(window as any).grecaptcha) {
        logWarningMessage(
          `<GoogleRecaptchaProvider /> ${GoogleRecaptchaError.SCRIPT_NOT_AVAILABLE}`
        );

        return;
      }

      const grecaptcha = useEnterprise
        ? (window as any).grecaptcha.enterprise
        : (window as any).grecaptcha;

      if (!grecaptcha) {
        return;
      }

      grecaptcha.ready(() => {
        // Check if provider is still mounted before updating state
        // This prevents React warning about state update on unmounted component
        if (!isMountedRef.current) {
          return;
        }

        setGreCaptchaInstance(grecaptcha);
      });
    };

    const onError = () => {
      logWarningMessage('Error loading google recaptcha script');
    };

    injectGoogleReCaptchaScript({
      render: container?.element ? 'explicit' : reCaptchaKey,
      onLoadCallbackName,
      useEnterprise,
      useRecaptchaNet,
      scriptProps,
      language,
      onLoad,
      onError
    });

    return () => {
      // Mark as unmounted to prevent callbacks from executing
      isMountedRef.current = false;

      // Clean up the global callback using stored name
      if (onLoadCallbackNameRef.current && onLoadCallbackRef.current) {
        if ((window as any)[onLoadCallbackNameRef.current] === onLoadCallbackRef.current) {
          delete ((window as any)[onLoadCallbackNameRef.current]);
        }
      }

      // Only pass clientId if it's a number (explicit render mode)
      // If it's a string (reCaptchaKey), it means we're using default render mode
      const clientIdToClean = typeof clientId.current === 'number' ? clientId.current : undefined;
      cleanGoogleRecaptcha(scriptId, container?.element, clientIdToClean, useEnterprise);
    };
  }, [
    useEnterprise,
    useRecaptchaNet,
    scriptPropsJson,
    parametersJson,
    language,
    reCaptchaKey,
    container?.element,
  ]);

  const executeRecaptcha = useCallback(
    (action?: string) => {
      if (!greCaptchaInstance || !greCaptchaInstance.execute) {
        throw new Error(
          '<GoogleReCaptchaProvider /> Google Recaptcha has not been loaded'
        );
      }

      // For explicit render mode (with container), use the numeric clientId
      // The clientId must be a number returned from grecaptcha.render()
      if (container?.element) {
        // Wait for clientId to be set (from grecaptcha.render())
        if (typeof clientId.current !== 'number') {
          throw new Error(
            '<GoogleReCaptchaProvider /> Recaptcha clientId not ready. Please wait for recaptcha to load.'
          );
        }
        return greCaptchaInstance.execute(clientId.current, { action });
      }

      // For default render mode (without container), use the sitekey directly
      return greCaptchaInstance.execute(reCaptchaKey, { action });
    },
    [greCaptchaInstance, clientId, container?.element, reCaptchaKey]
  );

  const googleReCaptchaContextValue = useMemo(
    () => ({
      executeRecaptcha: greCaptchaInstance ? executeRecaptcha : undefined,
      container: container?.element,
      isLoaded: !!greCaptchaInstance,
    }),
    [executeRecaptcha, greCaptchaInstance, container?.element]
  );

  return (
    <GoogleReCaptchaContext.Provider value={googleReCaptchaContextValue}>
      {children}
    </GoogleReCaptchaContext.Provider>
  );
}

export { GoogleReCaptchaConsumer, GoogleReCaptchaContext };
