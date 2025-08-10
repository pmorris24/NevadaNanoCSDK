// src/components/EmbedWidget.tsx
import React from 'react';
import DOMPurify from 'dompurify';
import './EmbedWidget.css';

interface EmbedWidgetProps {
  embedCode: string;
}

const EmbedWidget: React.FC<EmbedWidgetProps> = ({ embedCode }) => {
  // Sanitize HTML to prevent XSS attacks, while allowing iframes and necessary attributes.
  const sanitizedHtml = DOMPurify.sanitize(embedCode, {
      ADD_TAGS: ["iframe"],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'width', 'height', 'title'],
  });

  return (
    <div className="embed-widget-container" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
  );
};

export default EmbedWidget;