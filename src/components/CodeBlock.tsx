// src/components/CodeBlock.tsx
import React, { useEffect, useRef } from 'react';
import { WidgetById, type DashboardWidgetStyleOptions } from '@sisense/sdk-ui';
import './CodeBlock.css';

interface CodeBlockProps {
  code: string;
  styleOptions?: DashboardWidgetStyleOptions;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, styleOptions }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const isUrl = (str: string) => {
    try {
      // Use a simple regex to check for a URL pattern, as new URL() can be too strict for some cases.
      return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(str);
    } catch (_) {
      return false;
    }
  };

  const getProps = (codeString: string, propName: string) => {
    const regex = new RegExp(`${propName}="([^"]*)"`);
    const match = codeString.match(regex);
    return match ? match[1] : undefined;
  };

  const widgetOid = getProps(code, 'widgetOid');
  const dashboardOid = getProps(code, 'dashboardOid');

  useEffect(() => {
    if (!code || !containerRef.current || widgetOid) return;
    
    // Clear previous content
    const container = containerRef.current;
    container.innerHTML = '';

    const fragment = document.createRange().createContextualFragment(code);
    const scripts = Array.from(fragment.querySelectorAll('script'));

    container.appendChild(fragment);

    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        container.appendChild(newScript);
    });

  }, [code, widgetOid]);

  if (widgetOid && dashboardOid) {
    return (
      <WidgetById
        widgetOid={widgetOid}
        dashboardOid={dashboardOid}
        styleOptions={styleOptions}
        includeDashboardFilters={getProps(code, 'includeDashboardFilters') === 'true'}
      />
    );
  }

  if (isUrl(code)) {
    return <iframe title="embedded-content" src={code} className="code-block-iframe" />;
  }

  return <div ref={containerRef} className="code-block-container" />;
};

export default CodeBlock;