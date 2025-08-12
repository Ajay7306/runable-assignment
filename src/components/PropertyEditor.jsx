import React, { useState, useRef, useEffect } from 'react';
import { Eye, Code, Save, Upload, Edit3, Type, Palette, Bold, Italic } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PropertyEditor = ({ selectedElement, onUpdate }) => {
    const [textContent, setTextContent] = useState('');
    const [fontSize, setFontSize] = useState('16');
    const [color, setColor] = useState('#000000');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [fontWeight, setFontWeight] = useState('normal');
    const [fontStyle, setFontStyle] = useState('normal');
    const [fontFamily, setFontFamily] = useState('sans'); // 'sans', 'serif', 'mono'
    const [padding, setPadding] = useState('p-0'); // Tailwind padding class
    const [margin, setMargin] = useState('m-0'); // Tailwind margin class
    const [className, setClassName] = useState(''); // For editing Tailwind classes
  
    useEffect(() => {
      if (selectedElement) {
        setTextContent(selectedElement.textContent || '');
        setClassName(selectedElement.element.className || '');
        
        // Initialize fontSize from element's className or computed style
        const classNameString = selectedElement.className || '';
        const currentClasses = classNameString.split(' ').filter(Boolean);
        const currentFontSizeClass = currentClasses.find(cls => cls.startsWith('text-'));
        if (currentFontSizeClass) {
          setFontSize(currentFontSizeClass);
        } else {
          // Fallback to default if no Tailwind class found
          setFontSize('text-base');
        }

        setColor(rgbToHex(selectedElement.styles.color) || '#000000');
        setBackgroundColor(rgbToHex(selectedElement.styles.backgroundColor) || '#ffffff');
        
        // Initialize fontWeight from element's className or computed style
        const currentFontWeightClass = currentClasses.find(cls => cls.startsWith('font-') && !cls.startsWith('font-family'));
        if (currentFontWeightClass) {
          setFontWeight(currentFontWeightClass);
        } else {
          setFontWeight('font-normal');
        }

        setFontStyle(selectedElement.styles.fontStyle || 'normal');
        
        // Determine current font family from element's computed style or className
        const computedFontFamily = selectedElement.styles.fontFamily || '';
        const lowerFontFamily = computedFontFamily.toLowerCase();
        if (lowerFontFamily.includes('monospace')) {
          setFontFamily('mono');
        } else if (lowerFontFamily.includes('serif')) {
          setFontFamily('serif');
        } else {
          setFontFamily('sans');
        }

        // Initialize padding and margin from element's className
        const currentPaddingClass = currentClasses.find(cls => cls.startsWith('p-') || cls.startsWith('px-') || cls.startsWith('py-') || cls.startsWith('pt-') || cls.startsWith('pr-') || cls.startsWith('pb-') || cls.startsWith('pl-'));
        setPadding(currentPaddingClass || 'p-0');

        const currentMarginClass = currentClasses.find(cls => cls.startsWith('m-') || cls.startsWith('mx-') || cls.startsWith('my-') || cls.startsWith('mt-') || cls.startsWith('mr-') || cls.startsWith('mb-') || cls.startsWith('ml-'));
        setMargin(currentMarginClass || 'm-0');
      }
    }, [selectedElement]);
  
    const rgbToHex = (rgb) => {
      if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
      const result = rgb.match(/\d+/g);
      if (!result) return '#000000';
      return '#' + result.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
    };
  
    const handleUpdate = (property, value) => {
      if (onUpdate && selectedElement) {
        onUpdate(selectedElement.pathIndices, property, value);
      }
    };
  
    if (!selectedElement) {
      return (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-center text-gray-500">
            <Edit3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Select an element to edit its properties</p>
          </div>
        </div>
      );
    }
  
    return (
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="font-medium text-blue-900">Selected: {selectedElement.tagName}</div>
          <div className="text-sm text-blue-700">Path: {Array.isArray(selectedElement.pathIndices) ? selectedElement.pathIndices.join(' > ') : selectedElement.path}</div>
        </div>
  
        {/* Text Content */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Type className="w-4 h-4" />
            Text Content
          </label>
          <textarea
            value={textContent}
            onChange={(e) => {
              setTextContent(e.target.value);
              handleUpdate('textContent', e.target.value);
            }}
            className="w-full p-2 border border-gray-300 rounded-md resize-none"
            rows="3"
            placeholder="Enter text content..."
          />
        </div>

        {/* Class Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Code className="w-4 h-4" />
            Tailwind Classes (className)
          </label>
          <input
            type="text"
            value={className}
            onChange={(e) => {
              setClassName(e.target.value);
              handleUpdate('className', e.target.value);
            }}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., flex items-center bg-blue-500"
          />
        </div>
  
        
  
        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Palette className="w-4 h-4" />
              Text Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                handleUpdate('color', e.target.value);
              }}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Background</label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => {
                setBackgroundColor(e.target.value);
                handleUpdate('backgroundColor', e.target.value);
              }}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>
        </div>
  
        

        {/* Font Family */}
        <div>
          <label className="block text-sm font-medium mb-2">Typography</label>
          <Select
            value={fontFamily}
            onValueChange={(value) => {
              setFontFamily(value);
              handleUpdate('fontFamily', `font-${value}`);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sans">Sans-serif</SelectItem>
              <SelectItem value="serif">Serif</SelectItem>
              <SelectItem value="mono">Monospace</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Font Weight and Font Size */}
        <div className="flex gap-2">
          <Select
            value={fontWeight}
            onValueChange={(value) => {
              setFontWeight(value);
              handleUpdate('fontWeight', value); // value is now a Tailwind class like 'font-bold'
            }}
          >
            <SelectTrigger className="w-1/2">
              <SelectValue placeholder="Weight" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="font-normal">Normal</SelectItem>
              <SelectItem value="font-bold">Bold</SelectItem>
              <SelectItem value="font-semibold">Semibold</SelectItem>
              <SelectItem value="font-light">Light</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={fontSize} // fontSize state will now store Tailwind class
            onValueChange={(value) => {
              setFontSize(value);
              handleUpdate('fontSize', value); // value is now a Tailwind class like 'text-base'
            }}
          >
            <SelectTrigger className="w-1/2">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text-xs">12px</SelectItem>
              <SelectItem value="text-sm">14px</SelectItem>
              <SelectItem value="text-base">16px</SelectItem>
              <SelectItem value="text-lg">18px</SelectItem>
              <SelectItem value="text-xl">20px</SelectItem>
              <SelectItem value="text-2xl">24px</SelectItem>
              <SelectItem value="text-3xl">28px</SelectItem>
              <SelectItem value="text-4xl">32px</SelectItem>
              <SelectItem value="text-5xl">36px</SelectItem>
              <SelectItem value="text-6xl">40px</SelectItem>
              <SelectItem value="text-7xl">48px</SelectItem>
              <SelectItem value="text-8xl">64px</SelectItem>
              <SelectItem value="text-9xl">72px</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Padding and Margin */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Padding</label>
            <Select
              value={padding}
              onValueChange={(value) => {
                setPadding(value);
                handleUpdate('padding', value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Padding" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="p-0">0</SelectItem>
                <SelectItem value="p-1">4px</SelectItem>
                <SelectItem value="p-2">8px</SelectItem>
                <SelectItem value="p-3">12px</SelectItem>
                <SelectItem value="p-4">16px</SelectItem>
                <SelectItem value="p-5">20px</SelectItem>
                <SelectItem value="p-6">24px</SelectItem>
                <SelectItem value="p-8">32px</SelectItem>
                <SelectItem value="p-10">40px</SelectItem>
                <SelectItem value="p-12">48px</SelectItem>
                <SelectItem value="p-16">64px</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Margin</label>
            <Select
              value={margin}
              onValueChange={(value) => {
                setMargin(value);
                handleUpdate('margin', value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Margin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="m-0">0</SelectItem>
                <SelectItem value="m-1">4px</SelectItem>
                <SelectItem value="m-2">8px</SelectItem>
                <SelectItem value="m-3">12px</SelectItem>
                <SelectItem value="m-4">16px</SelectItem>
                <SelectItem value="m-5">20px</SelectItem>
                <SelectItem value="m-6">24px</SelectItem>
                <SelectItem value="m-8">32px</SelectItem>
                <SelectItem value="m-10">40px</SelectItem>
                <SelectItem value="m-12">48px</SelectItem>
                <SelectItem value="m-16">64px</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  };

export default PropertyEditor;