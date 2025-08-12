import React, { useState, useRef, useEffect } from 'react';
import { Eye, Code, Save, Upload, Edit3, Type, Palette, Bold, Italic } from 'lucide-react';
import { mockAPI } from '../services/api';
import Button from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ComponentRenderer from './ComponentRenderer';
import PropertyEditor from './PropertyEditor';

const WebsiteEditor = ({ component, onSave }) => {
    const [selectedComponentPath, setSelectedComponentPath] = useState('src/components/ui/button.jsx'); // Default to button
    const [code, setCode] = useState(component || '');
    const [userCode, setUserCode] = useState('');
    const [view, setView] = useState('preview');
    const [selectedElement, setSelectedElement] = useState(null);
    const [componentId, setComponentId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [files, setFiles] = useState([]);
    const [selectedFileContent, setSelectedFileContent] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('');

    const rendererRef = useRef(null);

    const handleSaveFileContent = async () => {
        if (!selectedFileName || !selectedFileContent) {
            setSaveStatus('No file selected or content to save.');
            return;
        }
        setIsSaving(true);
        try {
            // Assuming write_file is exposed via mockAPI or a similar service
            // The absolute path needs to be constructed correctly
            const absolutePath = `/Users/ajay/works/Runable assignment/assignment/runable-assignment/public/preview-standalone/${selectedFileName}`;
            await mockAPI.saveFileContent(selectedFileName, selectedFileContent);
            setSaveStatus('File saved successfully!');
            // Re-fetch the file content to ensure the preview updates
            handleFileSelect(selectedFileName);
        } catch (error) {
            console.error("Failed to save file content:", error);
            setSaveStatus('Failed to save file.');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    useEffect(() => {
        // In a real application, you would fetch the list of files from an API endpoint.
        // For this example, we are hardcoding the list of files.
        const fetchFiles = async () => {
            try {
                const response = await new Promise(resolve => setTimeout(() => resolve([
                    'AboutSection.tsx',
                    'FeaturesSection.tsx',
                    'HeroSection.tsx',
                    'ServicesSection.tsx',
                    'TestimonialsSection.tsx'
                ]), 500));
                setFiles(response);
            } catch (error) {
                console.error("Failed to fetch files:", error);
            }
        };
        fetchFiles();
    }, []);

    const handleFileSelect = async (fileName) => {
        try {
            const response = await fetch(`/preview-standalone/${fileName}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            setSelectedFileContent(text);
            setSelectedFileName(fileName);
        } catch (error) {
            console.error("Failed to fetch file content:", error);
            setSelectedFileContent("Failed to load file content. Make sure the file exists in the public/preview-standalone directory and your server is configured to serve static files.");
        }
    };


    const handleElementUpdate = (pathIndices, property, value) => {
        if (rendererRef.current && typeof rendererRef.current.applyUpdate === 'function') {
            rendererRef.current.applyUpdate(pathIndices, property, value);
            setSaveStatus('Auto-saved');
            setTimeout(() => setSaveStatus(''), 2000);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // This save logic might need to be re-evaluated based on how you want to save component *definitions*
            // For now, it's saving the 'code' which will be the component path.
            if (componentId) {
                await mockAPI.updateComponent(componentId, selectedComponentPath);
                setSaveStatus('Updated successfully');
            } else {
                const result = await mockAPI.saveComponent(selectedComponentPath);
                setComponentId(result.id);
                setSaveStatus('Saved successfully');
            }

            if (onSave) {
                onSave(selectedComponentPath);
            }
        } catch (error) {
            setSaveStatus('Save failed');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    const handleUpload = async () => {
        try {
            const result = await mockAPI.saveComponent(selectedComponentPath);
            setComponentId(result.id);
            setSaveStatus(`Component uploaded with ID: ${result.id}`);
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            setSaveStatus('Upload failed');
        }
    };

    return (
        <div className="bg-gray-950 min-h-screen text-gray-50">
            {/* Top Navbar */}
            <div className="bg-gray-900/50 backdrop-blur-lg px-6 py-4 flex justify-end items-center border-b border-gray-800">
                <div className="flex items-center gap-3">
                    {saveStatus && (
                        <span className="text-sm text-green-500 font-medium">{saveStatus}</span>
                    )}
                    <Button
                        onClick={handleUpload}
                        variant="secondary"
                        size="sm"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        variant="secondary"
                        size="sm"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-3">
                <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 lg:col-span-4">
                        <Card className="bg-gray-900 border border-gray-800 text-gray-50">
                            <CardHeader>
                                <CardTitle>Element Properties</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PropertyEditor
                                    selectedElement={selectedElement}
                                    onUpdate={handleElementUpdate}
                                />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="col-span-12 lg:col-span-8">
                        <Card className="bg-gray-900 border border-gray-800 text-gray-50 gap-0 p-0">
                            <div className="flex justify-between items-center p-2">
                                <Tabs value={view} onValueChange={setView} className="w-auto">
                                    <TabsList className="bg-gray-800/50 border border-gray-700">
                                        <TabsTrigger value="preview" className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-50">
                                            <Eye className="w-4 h-4" />
                                        </TabsTrigger>
                                        <TabsTrigger value="code" className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-50">
                                            <Code className="w-4 h-4" />
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                            <CardContent className="p-0 h-screen"> {/* Removed padding here */}
                                {view === 'preview' ? (
                                    <ComponentRenderer
                                        ref={rendererRef}
                                        code={userCode}
                                        onElementSelect={(el) => setSelectedElement(el)}
                                    />
                                ) : (
                                    <div className='flex flex-col gap-2 h-full'>
                                        <div className="p-3 border-b border-gray-800 bg-gray-900">
                                            <div className="text-sm text-gray-300 mb-2">Paste a React component (JSX). It should export a default component or return JSX.</div>
                                            <textarea
                                                value={userCode}
                                                onChange={(e) => setUserCode(e.target.value)}
                                                className="w-full h-56 p-3 font-mono text-sm bg-gray-950 text-gray-50 border border-gray-800 resize-none focus:outline-none"
                                                placeholder={`Example:\nexport default function Demo(){\n  return (<div className=\"p-4 text-xl font-bold text-blue-600\">Hello Tailwind</div>);\n}`}
                                            />
                                            <div className="flex justify-end mt-2">
                                                <Button onClick={() => setView('preview')} variant="secondary" size="sm">Render</Button>
                                            </div>
                                        </div>
                                        <div className='flex-1 flex flex-wrap'>
                                            <Card className="bg-gray-900 border border-gray-800 text-gray-50 w-3/12 rounded-none">
                                                <CardHeader>
                                                    <CardTitle>Files</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <ul>
                                                        {files.map(file => (
                                                            <li key={file} onClick={() => handleFileSelect(file)} className="cursor-pointer hover:text-blue-400">
                                                                {file}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                            <div className="w-9/12">
                                                <div className="flex justify-end p-2 bg-gray-800 border-b border-gray-700">
                                                    <Button
                                                        onClick={handleSaveFileContent}
                                                        disabled={!selectedFileName}
                                                        variant="secondary"
                                                        size="sm"
                                                    >
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save File
                                                    </Button>
                                                </div>
                                                <textarea
                                                    value={selectedFileContent}
                                                    onChange={(e) => setSelectedFileContent(e.target.value)}
                                                    className="w-full h-[calc(100vh-250px)] p-4 font-mono text-sm bg-gray-950 text-gray-50 border border-gray-800 resize-none focus:outline-none"
                                                    placeholder="Select a file to see its code..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Component ID Display */}
                {componentId && (
                    <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                        <div className="text-sm text-gray-300">
                            <strong>Component ID:</strong> {componentId}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                            Preview URL: /preview/{componentId}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WebsiteEditor;

