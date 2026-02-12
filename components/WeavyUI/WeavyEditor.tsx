"use client";

import React, { useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

interface WeavyEditorProps {
  flowId: string;
}

export default function WeavyEditor({ flowId }: WeavyEditorProps) {
  // State for sidebar tabs
  const [activeTab, setActiveTab] = useState('recent');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div id="weavy-main" className="css-1955dkx" style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <main className="MuiBox-root css-oa138a" style={{ height: '100%' }}>
        <div className="MuiBox-root css-x1mpn6" style={{ height: '100%' }}>
          <div className="css-1fpvvd2" style={{ display: 'flex', height: '100%' }}>
            
            {/* Main Canvas Area */}
            <div className="MuiBox-root css-3562iz" id="canvas" style={{ flexGrow: 1, position: 'relative' }}>
              <div className="MuiBox-root css-uwwqev" id="react-flow-container" style={{ width: '100%', height: '100%' }}>
                <ReactFlow
                  defaultNodes={[]}
                  defaultEdges={[]}
                  fitView
                  className="react-flow"
                  style={{ background: 'rgb(14, 14, 19)' }}
                >
                  <Background color="#65616b" gap={20} size={1} />
                  
                  {/* Top Left Logo/Title */}
                  <div className="react-flow__panel top left" style={{ left: 56, top: 0, pointerEvents: 'all' }}>
                    <div className="MuiBox-root css-iiwjyn" style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
                       <div className="css-15sdndl">
                         <span className="MuiTypography-root MuiTypography-body-std-md MuiTypography-noWrap css-1svzycf" style={{ color: 'white' }}>
                           untitled
                         </span>
                       </div>
                    </div>
                  </div>

                  {/* Top Right Controls */}
                  <div className="react-flow__panel top right" style={{ pointerEvents: 'all', padding: '16px' }}>
                    <div className="MuiBox-root css-p7zuiw" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div className="css-1f38ru9" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#1E1E24', padding: '4px 12px', borderRadius: '8px' }}>
                        <div aria-label="Get more credits" className="css-k8boi7" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3.75V20.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M4.5 7.5L19.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M4.5 16.5L19.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                          <span className="MuiTypography-root MuiTypography-body-sm-rg css-1kwyr79">150 credits</span>
                        </div>
                        <button className="MuiButtonBase-root css-14w6evs" style={{ background: '#6F42C1', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                          <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 14.25L21 9.75L16.5 5.25" stroke="currentColor" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"></path><path d="M18 20.25H3V8.25" stroke="currentColor" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"></path><path d="M6.75 16.5C7.24901 14.5673 8.37634 12.8554 9.95465 11.6335C11.533 10.4116 13.4727 9.74899 15.4688 9.75H21" stroke="currentColor" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"></path></svg></span>
                          Share
                        </button>
                      </div>
                      <div className="MuiBox-root css-0">
                         <button className="MuiButtonBase-root css-1pdtap5" style={{ background: '#1E1E24', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            Tasks
                         </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Center Controls */}
                  <div className="react-flow__panel bottom center" style={{ margin: '0px 0px 16px', pointerEvents: 'all' }}>
                     <div className="css-1fypuux" style={{ background: '#1E1E24', padding: '8px', borderRadius: '8px', display: 'flex', gap: '8px' }}>
                        {/* Placeholder for Pan/Select/Zoom */}
                        <div style={{color:'white'}}>Controls</div>
                     </div>
                  </div>

                </ReactFlow>
              </div>
            </div>

            {/* Sidebar (Overlay or Flex) */}
             {/* Note: In the original HTML, the sidebar seems to be absolute or fixed over the canvas, or flexed. 
                 The HTML shows `react-flow__panel slide-left-exit left` which suggests it's inside React Flow or layered on top. 
                 Since I am inside `css-1fpvvd2` which is flex, I'll put it outside or absolute.
                 The original HTML structure puts the sidebar PANELS inside `react-flow` div? No, let's look closer.
                 Yes, `react-flow__panel left` contains the sidebar. */}
            
            {/* We recreate the Sidebar Structure here, absolutely positioned or using React Flow Panel */}
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', display: 'flex', zIndex: 10, pointerEvents: 'none' }}>
                
                {/* Narrow Toolbar */}
                <div className="react-flow__panel left" style={{ height: '100%', width: '56px', pointerEvents: 'all', background: '#0E0E13', borderRight: '1px solid #2A2A2F', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0' }}>
                    <img src="/icons/logo.svg" alt="Logo" width="24" style={{ marginBottom: '24px' }} />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button onClick={() => { setActiveTab('search'); setIsSidebarOpen(true); }} style={{ background: 'transparent', border: 'none', color: activeTab === 'search' ? '#fff' : '#888', cursor: 'pointer' }}>
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z" stroke="currentColor" strokeWidth="1.125"></path><path d="M15.8035 15.8035L21 21" stroke="currentColor" strokeWidth="1.125"></path></svg>
                        </button>
                        <button onClick={() => { setActiveTab('recent'); setIsSidebarOpen(true); }} style={{ background: 'transparent', border: 'none', color: activeTab === 'recent' ? '#fff' : '#888', cursor: 'pointer' }}>
                           {/* Recent Icon */}
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 7.5V12L15.75 14.25" stroke="currentColor" strokeWidth="1.125"></path><path d="M6.75 9.75H3V6" stroke="currentColor" strokeWidth="1.125"></path><path d="M6.3375 18.0004C7.51685 19.1132 8.99798 19.8538 10.5958 20.1297C12.1937 20.4056 13.8374 20.2045 15.3217 19.5515C16.8059 18.8986 18.0648 17.8227 18.9411 16.4584C19.8173 15.0941 20.2721 13.5017 20.2486 11.8804C20.2251 10.2591 19.7244 8.68062 18.8089 7.34226C17.8934 6.0039 16.6039 4.96499 15.1014 4.35533C13.5988 3.74568 11.95 3.59231 10.3608 3.9144C8.77157 4.23648 7.31253 5.01974 6.16594 6.1663C5.0625 7.2838 4.15125 8.33755 3 9.75036" stroke="currentColor" strokeWidth="1.125"></path></svg>
                        </button>
                         {/* More icons... */}
                    </div>
                </div>

                {/* Expanded Sidebar Panel */}
                {isSidebarOpen && (
                    <div className="react-flow__panel left" style={{ height: '100%', width: '240px', marginLeft: '0px', pointerEvents: 'all', background: '#131318', borderRight: '1px solid #2A2A2F', display: 'flex', flexDirection: 'column' }}>
                       <div className="css-vtlo46" style={{ padding: '16px', color: 'white' }}>
                          <h3 style={{ fontSize: '14px', marginBottom: '16px', fontWeight: 600, color: '#E1E1E3' }}>
                            {activeTab === 'recent' ? 'Quick access' : activeTab === 'search' ? 'Search' : 'Toolbox'}
                          </h3>
                          
                          {/* Search Input */}
                          <div className="css-9ta03j" style={{ marginBottom: '16px' }}>
                             <div style={{ background: '#1E1E24', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z" stroke="#888" strokeWidth="1.125"></path></svg>
                                <input type="text" placeholder="Search" style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }} />
                             </div>
                          </div>

                          {/* Items List */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', height: 'calc(100vh - 120px)' }}>
                             
                             {activeTab === 'recent' && (
                               <>
                                 <div className="css-1ypgrp" draggable style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', cursor: 'grab', background: '#1E1E24' }}>
                                    <div className="css-1vvukmh" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#E1E1E3' }}>
                                         <path d="M12 5.25V18.75" stroke="currentColor" strokeWidth="1.125"></path><path d="M5.25 8.25V5.25H18.75V8.25" stroke="currentColor" strokeWidth="1.125"></path><path d="M9 18.75H15" stroke="currentColor" strokeWidth="1.125"></path>
                                       </svg>
                                       <span className="css-aynwex" style={{ fontSize: '13px', color: '#E1E1E3' }}>Prompt</span>
                                    </div>
                                 </div>
                                 <div className="css-1ypgrp" draggable style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', cursor: 'grab', background: '#1E1E24' }}>
                                    <div className="css-1vvukmh" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                       <img src="/menu-images/flux100x100.png" width="20" height="20" alt="flux" style={{ borderRadius: '4px' }} />
                                       <span className="css-aynwex" style={{ fontSize: '13px', color: '#E1E1E3' }}>Flux Pro 1.1</span>
                                    </div>
                                 </div>
                               </>
                             )}

                             {activeTab === 'toolbox' && (
                               <>
                                 <div className="MuiTypography-root MuiTypography-label-sm-rg css-1rrsxh3" style={{color: '#888', fontSize: '11px', marginTop: '16px', marginBottom: '8px'}}>Editing</div>
                                 <div className="css-1ypgrp" draggable style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', cursor: 'grab', background: '#1E1E24' }}>
                                    <span className="css-aynwex" style={{ fontSize: '13px', color: '#E1E1E3' }}>Levels</span>
                                 </div>
                                 <div className="css-1ypgrp" draggable style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', cursor: 'grab', background: '#1E1E24' }}>
                                    <span className="css-aynwex" style={{ fontSize: '13px', color: '#E1E1E3' }}>Compositor</span>
                                 </div>
                                 <div className="css-1ypgrp" draggable style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', cursor: 'grab', background: '#1E1E24' }}>
                                    <span className="css-aynwex" style={{ fontSize: '13px', color: '#E1E1E3' }}>Painter</span>
                                 </div>
                               </>
                             )}
                          </div>
                       </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
