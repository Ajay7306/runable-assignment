import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';

const mountId = 'mount-root';

function getPathIndices(fromRoot, element) {
  const indices = [];
  let current = element;
  while (current && current !== fromRoot) {
    const parent = current.parentElement;
    if (!parent) break;
    const index = Array.from(parent.children).indexOf(current);
    indices.unshift(index);
    current = parent;
  }
  return indices;
}

function getElementByIndices(fromRoot, indices) {
  let current = fromRoot;
  for (const idx of indices) {
    if (!current || !current.children || !current.children[idx]) return null;
    current = current.children[idx];
  }
  return current;
}

const Preview = () => {
  const [error, setError] = useState('');
  const containerRef = useRef(null);
  const selectedRef = useRef(null);

  useEffect(() => {
    window.parent.postMessage({ type: 'ready' }, '*');

    const handleClick = (e) => {
      const mount = containerRef.current;
      if (!mount) return;
      if (!mount.contains(e.target)) return;

      e.preventDefault();
      e.stopPropagation();

      if (selectedRef.current && selectedRef.current !== e.target) {
        selectedRef.current.style.outline = '';
      }
      selectedRef.current = e.target;
      selectedRef.current.style.outline = '2px dashed #3b82f6';

      const indices = getPathIndices(mount, e.target);
      const styles = window.getComputedStyle(e.target);

      const payload = {
        tagName: e.target.tagName,
        pathIndices: indices,
        textContent: e.target.textContent,
        styles: {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          fontStyle: styles.fontStyle,
          fontFamily: styles.fontFamily,
        },
        className: e.target.className || ''
      };

      window.parent.postMessage({ type: 'selected', payload }, '*');
    };

    const handleMessage = (event) => {
      const { type, code, pathIndices, property, value } = event.data || {};
      if (type === 'render') {
        setError('');
        try {
          renderCode(code);
        } catch (err) {
          console.error(err);
          setError(String(err));
        }
      }
      if (type === 'update') {
        const mount = containerRef.current;
        if (!mount) return;
        const el = getElementByIndices(mount, pathIndices || []);
        if (!el) return;

        if (property === 'textContent') {
          el.textContent = value;
        } else if (property === 'color') {
          el.style.color = value;
        } else if (property === 'backgroundColor') {
          el.style.backgroundColor = value;
        } else if (property === 'fontWeight') {
          // Remove existing font-* classes
          el.className = (el.className || '').split(' ').filter(c => !c.startsWith('font-')).join(' ');
          if (value) el.classList.add(value);
        } else if (property === 'fontSize') {
          // Remove existing text-* classes
          el.className = (el.className || '').split(' ').filter(c => !c.startsWith('text-')).join(' ');
          if (value) el.classList.add(value);
        } else if (property === 'fontFamily') {
          el.className = (el.className || '').split(' ').filter(c => !(c === 'font-sans' || c === 'font-serif' || c === 'font-mono')).join(' ');
          if (value) el.classList.add(value);
        } else if (property === 'padding') {
          el.className = (el.className || '').split(' ').filter(c => !(c.startsWith('p-') || c.startsWith('px-') || c.startsWith('py-') || c.startsWith('pt-') || c.startsWith('pr-') || c.startsWith('pb-') || c.startsWith('pl-'))).join(' ');
          if (value) el.classList.add(value);
        } else if (property === 'margin') {
          el.className = (el.className || '').split(' ').filter(c => !(c.startsWith('m-') || c.startsWith('mx-') || c.startsWith('my-') || c.startsWith('mt-') || c.startsWith('mr-') || c.startsWith('mb-') || c.startsWith('ml-'))).join(' ');
          if (value) el.classList.add(value);
        }
      }
    };

    window.addEventListener('click', handleClick, true);
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('click', handleClick, true);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const renderCode = (code) => {
    const mount = containerRef.current;
    if (!mount) return;

    // Reset selection outline
    if (selectedRef.current) {
      selectedRef.current.style.outline = '';
      selectedRef.current = null;
    }

    // Clear current content
    mount.innerHTML = '';

    if (!code || !code.trim()) return;

    // Provide a friendly wrapper if user pasted only JSX return or function
    let source = code;
    // If there's no export default, try to wrap
    if (!/export\s+default/.test(source)) {
      source = `export default function PastedComponent(){\n${source.includes('return') ? '' : '  return ('}\n${source}\n${source.includes('return') ? '' : '  );'}\n}`;
    }

    // Transform with Babel Standalone
    // eslint-disable-next-line no-undef
    const transformed = Babel.transform(source, {
      presets: ['react']
    }).code;

    const exportsObj = {};
    // eslint-disable-next-line no-new-func
    const fn = new Function('React', 'exports', transformed);
    fn(React, exportsObj);

    const Component = exportsObj.default;
    if (!Component) throw new Error('No default export found in the pasted component.');

    const reactRoot = ReactDOM.createRoot(mount);
    reactRoot.render(React.createElement(Component));
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {error ? (
        <div style={{ color: 'red', padding: 12 }}>{error}</div>
      ) : null}
      <div id={mountId} ref={containerRef} />
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Preview />
    </React.StrictMode>
  );
}
