
# Chatbot Embedding Guide

## Overview

This chatbot can be embedded as a micro frontend in other applications using iframe integration with dynamic height adjustment.

## Embedding Methods

### 1. Basic Iframe Embedding

```html
<iframe 
  src="https://your-chatbot-url.replit.dev"
  width="100%"
  height="600px"
  frameborder="0"
  id="chatbot-iframe"
></iframe>
```

### 2. Dynamic Height Adjustment

```javascript
// Listen for height updates from the chatbot
window.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'chatbot-height-update') {
    const iframe = document.getElementById('chatbot-iframe');
    iframe.style.height = event.data.chatbotHeight + 'px';
  }
});
```

### 3. Configuration Parameters

Add URL parameters to customize the chatbot:

- `theme=light|dark` - Set the theme
- `hideSidebar=true|false` - Hide/show the sidebar
- `hideHeader=true|false` - Hide/show the header

Example:
```
https://your-chatbot-url.replit.dev?theme=dark&hideSidebar=true&hideHeader=false
```

## React Integration

```jsx
import React, { useEffect, useRef } from 'react';

const ChatbotEmbed = ({ theme = 'light', hideSidebar = false, hideHeader = false }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'chatbot-height-update') {
        if (iframeRef.current) {
          iframeRef.current.style.height = event.data.chatbotHeight + 'px';
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const src = `https://your-chatbot-url.replit.dev?theme=${theme}&hideSidebar=${hideSidebar}&hideHeader=${hideHeader}`;

  return (
    <iframe
      ref={iframeRef}
      src={src}
      width="100%"
      height="600px"
      frameBorder="0"
      title="AI Chatbot"
    />
  );
};

export default ChatbotEmbed;
```

## Angular Integration

```typescript
import { Component, ElementRef, ViewChild, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-chatbot-embed',
  template: `
    <iframe 
      #chatbotIframe
      [src]="iframeSrc"
      width="100%"
      height="600px"
      frameborder="0"
      title="AI Chatbot">
    </iframe>
  `
})
export class ChatbotEmbedComponent implements OnInit, OnDestroy {
  @ViewChild('chatbotIframe') iframeRef!: ElementRef;
  @Input() theme: 'light' | 'dark' = 'light';
  @Input() hideSidebar: boolean = false;
  @Input() hideHeader: boolean = false;

  iframeSrc: string = '';
  private messageListener?: (event: MessageEvent) => void;

  ngOnInit() {
    this.updateIframeSrc();
    this.setupMessageListener();
  }

  ngOnDestroy() {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }
  }

  private updateIframeSrc() {
    const params = new URLSearchParams({
      theme: this.theme,
      hideSidebar: this.hideSidebar.toString(),
      hideHeader: this.hideHeader.toString()
    });
    this.iframeSrc = `https://your-chatbot-url.replit.dev?${params.toString()}`;
  }

  private setupMessageListener() {
    this.messageListener = (event: MessageEvent) => {
      if (event.data && event.data.type === 'chatbot-height-update') {
        if (this.iframeRef && this.iframeRef.nativeElement) {
          this.iframeRef.nativeElement.style.height = event.data.chatbotHeight + 'px';
        }
      }
    };
    window.addEventListener('message', this.messageListener);
  }
}
```

## Features

- **Dynamic Height**: Automatically adjusts to content size
- **Theme Support**: Light and dark themes
- **Responsive Design**: Works on mobile and desktop
- **Customizable UI**: Hide/show components as needed
- **Cross-Origin Communication**: Secure postMessage API
- **Multiple Framework Support**: Works with React, Angular, Vue, or plain HTML

## Security Considerations

- The chatbot uses `postMessage` with `"*"` origin for maximum compatibility
- In production, consider restricting to specific origins for security
- Ensure your embedding domain is trusted

## Troubleshooting

- If height adjustment isn't working, check browser console for errors
- Ensure the parent window can receive messages
- Verify iframe sandbox restrictions don't block postMessage
