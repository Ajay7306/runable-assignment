import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

const ComponentRenderer = forwardRef(function ComponentRenderer({ code, onElementSelect }, ref) {
    const iframeRef = useRef(null);
    const iframeReadyRef = useRef(false);

    useImperativeHandle(ref, () => ({
        applyUpdate(pathIndices, property, value) {
            if (!iframeRef.current || !iframeRef.current.contentWindow) return;
            iframeRef.current.contentWindow.postMessage({ type: 'update', pathIndices, property, value }, '*');
        }
    }), []);

    useEffect(() => {
        const handleMessage = (event) => {
            if (!iframeRef.current) return;
            if (event.source !== iframeRef.current.contentWindow) return;
            const { type, payload } = event.data || {};
            if (type === 'ready') {
                iframeReadyRef.current = true;
                if (code) {
                    iframeRef.current.contentWindow.postMessage({ type: 'render', code }, '*');
                }
            }
            if (type === 'selected' && onElementSelect) {
                onElementSelect(payload);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onElementSelect, code]);

    useEffect(() => {
        if (!iframeRef.current || !iframeReadyRef.current) return;
        iframeRef.current.contentWindow.postMessage({ type: 'render', code }, '*');
    }, [code]);

    return (
        <div className="w-full h-full bg-white">
            <iframe
                ref={iframeRef}
                src={`/preview.html`}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                title="Component Preview"
            ></iframe>
        </div>
    );
});

export default ComponentRenderer;
