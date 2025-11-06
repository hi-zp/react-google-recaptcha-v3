interface IInjectGoogleReCaptchaScriptParams {
  render: string;
  onLoadCallbackName: string;
  useRecaptchaNet: boolean;
  useEnterprise: boolean;
  onLoad: () => void;
  onError: () => void;
  language?: string;
  scriptProps?: {
    nonce?: string;
    defer?: boolean;
    async?: boolean;
    appendTo?: 'head' | 'body';
    id?: string;
  };
}

/**
 * Function to generate the src for the script tag
 *
 * @param param0
 * @returns
 */
const generateGoogleRecaptchaSrc = ({
  useRecaptchaNet,
  useEnterprise
}: {
  useRecaptchaNet: boolean;
  useEnterprise: boolean;
}) => {
  const hostName = useRecaptchaNet ? 'recaptcha.net' : 'google.com';
  const script = useEnterprise ? 'enterprise.js' : 'api.js';

  return `https://www.${hostName}/recaptcha/${script}`;
};

/**
 * Function to clean the recaptcha_[language] script injected by the recaptcha.js
 */
const cleanGstaticRecaptchaScript = () => {
  const script = document.querySelector(
    'script[src^="https://www.gstatic.com/recaptcha/releases"]'
  );

  if (script) {
    script.remove();
  }
};

/**
 * Reference counter for script instances
 * Key: scriptId, Value: reference count
 */
const scriptRefCounts: Map<string, number> = new Map();

/**
 * Global reference counter for grecaptcha instances
 * This tracks all providers using grecaptcha, regardless of scriptId
 * Used to determine when to clean up ___grecaptcha_cfg
 */
let globalGrecaptchaRefCount = 0;

/**
 * Function to check if script has already been injected
 *
 * @param scriptId
 * @returns
 */
export const isScriptInjected = (scriptId: string) =>
  !!document.querySelector(`#${scriptId}`);

/**
 * Function to increment reference count for a script
 *
 * @param scriptId
 * @returns current reference count
 */
const incrementScriptRefCount = (scriptId: string): number => {
  const currentCount = scriptRefCounts.get(scriptId) || 0;
  const newCount = currentCount + 1;
  scriptRefCounts.set(scriptId, newCount);
  return newCount;
};

/**
 * Function to decrement reference count for a script
 *
 * @param scriptId
 * @returns current reference count after decrement
 */
const decrementScriptRefCount = (scriptId: string): number => {
  const currentCount = scriptRefCounts.get(scriptId) || 0;
  const newCount = Math.max(0, currentCount - 1);
  if (newCount === 0) {
    scriptRefCounts.delete(scriptId);
  } else {
    scriptRefCounts.set(scriptId, newCount);
  }
  return newCount;
};

/**
 * Function to remove default badge
 *
 * @returns
 */
const removeDefaultBadge = () => {
  const nodeBadge = document.querySelector('.grecaptcha-badge');
  if (nodeBadge && nodeBadge.parentNode) {
    document.body.removeChild(nodeBadge.parentNode);
  }
};

/**
 * Function to clear custom badge
 *
 * @returns
 */
const cleanCustomBadge = (customBadge: HTMLElement | null) => {
  if (!customBadge) {
    return;
  }

  while (customBadge.lastChild) {
    customBadge.lastChild.remove();
  }
};

/**
 * Function to clean node of badge element
 *
 * @param container
 * @returns
 */
export const cleanBadge = (container?: HTMLElement | string) => {
  if (!container) {
    removeDefaultBadge();

    return;
  }

  const customBadge = typeof container === 'string' ? document.getElementById(container) : container;

  cleanCustomBadge(customBadge);
};

/**
 * Function to clean google recaptcha script
 * Only cleans shared resources (script, global config) when ref count reaches 0
 * Always cleans provider-specific resources (badge, clientId)
 *
 * @param scriptId
 * @param container
 * @param clientId - The clientId returned from grecaptcha.render() (only for explicit render mode)
 * @param useEnterprise - Whether using enterprise version
 */
export const cleanGoogleRecaptcha = (
  scriptId: string,
  container?: HTMLElement | string,
  clientId?: number | string,
  useEnterprise?: boolean
) => {
  // Always remove badge for this specific provider
  cleanBadge(container);

  // Reset grecaptcha clientId if provided (explicit render mode)
  // This is important to clean up grecaptcha internal state
  if (clientId !== undefined && typeof window !== 'undefined') {
    try {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const grecaptchaGlobal = (window as any).grecaptcha;
      
      if (grecaptchaGlobal) {
        const grecaptcha = useEnterprise
          ? grecaptchaGlobal?.enterprise
          : grecaptchaGlobal;

        if (grecaptcha && typeof grecaptcha.reset === 'function') {
          grecaptcha.reset(clientId);
        }
      }
      // If grecaptcha not loaded yet, skip reset (but continue with other cleanup)
    } catch (error) {
      // Silently fail if reset fails (e.g., clientId already cleaned)
      // This can happen if grecaptcha was already cleaned or clientId is invalid
    }
  }

  // Decrement reference count
  const remainingRefs = decrementScriptRefCount(scriptId);
  
  // Decrement global grecaptcha reference count
  globalGrecaptchaRefCount = Math.max(0, globalGrecaptchaRefCount - 1);

  // Only clean shared resources if no other providers are using this script
  if (remainingRefs === 0) {
    // remove script
    const script = document.querySelector(`#${scriptId}`);
    if (script) {
      script.remove();
    }
  }

  // Clean up global grecaptcha config only when no providers are using it
  if (globalGrecaptchaRefCount === 0) {
    // Clean up ___grecaptcha_cfg as no providers are using grecaptcha anymore
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (window as any).___grecaptcha_cfg = undefined;

    // Only clean gstatic script if no other scripts are using grecaptcha
    // Check if there are any other recaptcha scripts still in the DOM
    const otherRecaptchaScripts = document.querySelectorAll('script[id^="google-recaptcha"]');
    if (otherRecaptchaScripts.length === 0) {
      cleanGstaticRecaptchaScript();
    }
  }
};

/**
 * Function to inject the google recaptcha script
 *
 * @param param0
 * @returns
 */
export const injectGoogleReCaptchaScript = ({
  render,
  onLoadCallbackName,
  language,
  onLoad,
  useRecaptchaNet,
  useEnterprise,
  scriptProps: {
    nonce = '',
    defer = false,
    async = false,
    id = '',
    appendTo
  } = {}
}: IInjectGoogleReCaptchaScriptParams) => {
  const scriptId = id || 'google-recaptcha-v3';

  // Script has already been injected, just call onLoad and increment ref count
  if (isScriptInjected(scriptId)) {
    incrementScriptRefCount(scriptId);
    globalGrecaptchaRefCount++;
    onLoad();

    return;
  }

  // Increment ref count for new script
  incrementScriptRefCount(scriptId);
  globalGrecaptchaRefCount++;

  /**
   * Generate the js script
   */
  const googleRecaptchaSrc = generateGoogleRecaptchaSrc({
    useEnterprise,
    useRecaptchaNet
  });
  const js = document.createElement('script');
  js.id = scriptId;
  js.src = `${googleRecaptchaSrc}?render=${render}${
    render === 'explicit' ? `&onload=${onLoadCallbackName}` : ''
  }${
    language ? `&hl=${language}` : ''
  }`;

  if (!!nonce) {
    js.nonce = nonce;
  }

  js.defer = !!defer;
  js.async = !!async;
  js.onload = onLoad;

  /**
   * Append it to the body // head
   */
  const elementToInjectScript =
    appendTo === 'body'
      ? document.body
      : document.getElementsByTagName('head')[0];

  elementToInjectScript.appendChild(js);
};

/**
 * Function to log warning message if it's not in production mode
 *
 * @param message String
 * @returns
 */
export const logWarningMessage = (message: string) => {
  const isDevelopmentMode =
    typeof process !== 'undefined' && !!process.env && process.env.NODE_ENV !== 'production';

  if (isDevelopmentMode) {
    return;
  }

  console.warn(message);
};
