import React, { useRef } from 'react';

const ComponentRenderer = ({ code }) => {
    const iframeRef = useRef(null);

    return (
        <div className="w-full h-full bg-white">
            <iframe
                ref={iframeRef}
                src={`/preview.html?component=${code}`}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                title="Component Preview"
            ></iframe>
        </div>
    );
};

export default ComponentRenderer;
