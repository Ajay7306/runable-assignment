import React from 'react';
import ReactDOM from 'react-dom/client';
import HeroSection from '../public/preview-standalone/HeroSection'
import FeaturesSection from '../public/preview-standalone/FeaturesSection'
import ServicesSection from '../public/preview-standalone/ServicesSection'
import AboutSection from '../public/preview-standalone/AboutSection'
console.log('preview.jsx loaded');

const Preview = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const componentPath = urlParams.get('component');

  console.log('Component Path:', componentPath);

  if (!componentPath) {
    return <div>No component specified.</div>;
  }

  const Component = React.lazy(() => {
    console.log('Attempting to import:', componentPath);
    return import(/* @vite-ignore */ componentPath).catch(err => {
      console.error('Error importing component:', err);
      return { default: () => <div>Error loading component. Check console for details.</div> };
    });
  });

  return (
    <div style={{minHeight: '100vh' }}>
      <React.Suspense fallback={<div>Loading...</div>}>
        <>
          <HeroSection />
          <FeaturesSection />
          <ServicesSection />
          <AboutSection />
        </>
      </React.Suspense>
    </div>
  );
};

const rootElement = document.getElementById('root');
console.log('Root Element:', rootElement);

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Preview />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found!');
}
