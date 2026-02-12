"use client";
import React from "react";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";

const ModelsPage = () => {
    // Data for the cards that will be displayed on the page
    const cards = [
        {
          imageUrl: "https://media.weavy.ai/image/upload/f_auto,q_auto/v1/uploads/gclnmopestmtomr4wk9k?_a=BAMAMiWO0",
          title: "Weavy Welcome"
        },
        {
          imageUrl: "https://media.weavy.ai/image/upload/f_auto,q_auto/v1/uploads/1VzevvFzYnfcuq7FDIhlJFZtZW73/q346rdjtgnoljav8ofwi?_a=BAMAMiWO0",
          title: "Weavy Iterators"
        },
        {
          imageUrl: "https://media.weavy.ai/image/upload/f_auto,q_auto/v1/uploads/D13KHjm958bJaWyp8KGYlyWGlIj2/nyfxshgadqckp8y3xftr?_a=BAMAMiWO0",
          title: "Multiple Image Models"
        },
        {
          imageUrl: "https://media.weavy.ai/image/upload/f_auto,q_auto/v1/uploads/9MzfwEZkPeWMhA20uRTNGSJA4wx2/vlxuswgdgeqxuhgfurfs?_a=BAMAMiWO0",
          title: "Editing Images"
        },
        {
            imageUrl: "https://media.weavy.ai/image/upload/f_auto,q_auto/v1/uploads/D13KHjm958bJaWyp8KGYlyWGlIj2/aak3ssgcgmo9nw2obolo?_a=BAMAMiWO0",
            title: "Compositor Node"
        },
        {
            imageUrl: "https://media.weavy.ai/image/upload/f_auto,q_auto/v1/uploads/tycelzmnejahr8svztrb?_a=BAMAMiWO0",
            title: "Image to Video"
        },
        {
            imageUrl: "https://media.weavy.ai/image/upload/f_auto,q_auto/v1/uploads/D13KHjm958bJaWyp8KGYlyWGlIj2/aa6lo32y9qozccggmvll?_a=BAMAMiWO0",
            title: "Camera Angle Ideation"
        },
        {
            imageUrl: "https://media.weavy.ai/image/upload/f_auto,q_auto/v1/uploads/D13KHjm958bJaWyp8KGYlyWGlIj2/nrmmib8busacc8wi3z61?_a=BAMAMiWO0",
            title: "Illustration Machine"
        },
        {
            imageUrl: "https://media.weavy.ai/image/upload/f_auto,q_auto/v1/uploads/D13KHjm958bJaWyp8KGYlyWGlIj2/py5swzybl1rocaaodomm?_a=BAMAMiWO0",
            title: "Change Face"
        },
        {
            imageUrl: "https://media.weavy.ai/image/upload/f_auto,q_auto/v1/uploads/D13KHjm958bJaWyp8KGYlyWGlIj2/dltbrtkgwtrci2hi6uy2?_a=BAMAMiWO0",
            title: "Image Describer"
        },
        {
            imageUrl: "https://media.weavy.ai/image/upload/f_auto,q_auto/v1/uploads/D13KHjm958bJaWyp8KGYlyWGlIj2/o1fjg3v7sjke44vfku6d?_a=BAMAMiWO0",
            title: "Image to 3D"
        },
        {
            imageUrl: "https://media.weavy.ai/image/upload/f_auto,q_auto/v1/uploads/D13KHjm958bJaWyp8KGYlyWGlIj2/az21erdrztx2gsedthyy?_a=BAMAMiWO0",
            title: "Weavy Products"
        },
    ];
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Sidebar */}
      <nav style={{ width: '280px', backgroundColor: 'white', borderRight: '1px solid #e0e0e0', padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
            <UserButton afterSignOutUrl="/signin" />
            <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>Armaan Ahuja</span>
        </div>
        <button style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: '#1976d2', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            marginBottom: '16px',
            cursor: 'pointer'
        }}>
            Create New File
        </button>
        <ul>
            <li style={{ marginBottom: '12px' }}><a href="#" style={{ textDecoration: 'none', color: '#333' }}>My Files</a></li>
            <li style={{ marginBottom: '12px' }}><a href="#" style={{ textDecoration: 'none', color: '#333' }}>Shared with me</a></li>
            <li style={{ marginBottom: '12px' }}><a href="#" style={{ textDecoration: 'none', color: '#333' }}>Apps</a></li>
        </ul>
        <div style={{ marginTop: 'auto' }}>
            <a href="#" style={{ textDecoration: 'none', color: '#333' }}>Discord</a>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Armaan Ahuja&apos;s Workspace</h1>
          <button style={{ 
            padding: '12px 24px', 
            backgroundColor: '#1976d2', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
        }}>
            Create New File
        </button>
        </div>

        <div>
          <button style={{ marginRight: '8px', padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: '#1976d2', color: 'white' }}>Workflow library</button>
          <button style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}>Tutorials</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
          {cards.map(card => (
            <div key={card.title} style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <Image src={card.imageUrl} alt={card.title} width={200} height={120} style={{ width: '100%', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }} />
              <div style={{ padding: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>{card.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ModelsPage;
