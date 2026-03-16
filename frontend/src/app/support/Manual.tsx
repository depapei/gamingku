import React from 'react';
import { Typography, List, Input, Button } from 'antd';
import { Search, Download, FileText, Monitor, Mouse, Keyboard } from 'lucide-react';

const { Title, Paragraph } = Typography;

const manuals = [
  {
    category: 'Keyboards',
    icon: <Keyboard className="w-6 h-6 text-zinc-600" />,
    items: [
      { title: 'Mechanical Keyboard Setup Guide', size: '2.4 MB PDF' },
      { title: 'RGB Lighting Configuration Manual', size: '1.8 MB PDF' },
      { title: 'Wireless Keyboard Pairing Instructions', size: '1.2 MB PDF' },
    ]
  },
  {
    category: 'Mice',
    icon: <Mouse className="w-6 h-6 text-zinc-600" />,
    items: [
      { title: 'Gaming Mouse DPI Setup', size: '1.5 MB PDF' },
      { title: 'Wireless Mouse Troubleshooting', size: '0.9 MB PDF' },
      { title: 'Macro Configuration Guide', size: '3.1 MB PDF' },
    ]
  },
  {
    category: 'Monitors',
    icon: <Monitor className="w-6 h-6 text-zinc-600" />,
    items: [
      { title: '144Hz/240Hz Refresh Rate Setup', size: '4.2 MB PDF' },
      { title: 'Ultrawide Monitor Mounting Guide', size: '2.8 MB PDF' },
      { title: 'Color Calibration Manual', size: '5.0 MB PDF' },
    ]
  }
];

export const Manual = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <Title level={1} className="!text-4xl !font-bold !tracking-tight !mb-4">Manuals & Guides</Title>
        <Paragraph className="text-lg text-zinc-600 max-w-2xl mx-auto mb-8">
          Find setup instructions, troubleshooting guides, and detailed manuals for all your GamingKu gear.
        </Paragraph>
        
        <div className="max-w-xl mx-auto">
          <Input 
            size="large" 
            placeholder="Search for a product manual..." 
            prefix={<Search className="w-5 h-5 text-zinc-400" />} 
            className="rounded-full shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {manuals.map((section, index) => (
          <div key={index} className="border border-zinc-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-zinc-100 rounded-lg">
                {section.icon}
              </div>
              <Title level={3} className="!mb-0 !text-xl">{section.category}</Title>
            </div>
            
            <List
              itemLayout="horizontal"
              dataSource={section.items}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="text" icon={<Download className="w-4 h-4" />} className="text-zinc-600 hover:text-zinc-900" />
                  ]}
                  className="px-0 py-4 border-b border-zinc-100 last:border-0"
                >
                  <List.Item.Meta
                    avatar={<FileText className="w-5 h-5 text-zinc-400 mt-1" />}
                    title={<a href="#" className="text-zinc-900 hover:text-zinc-600 font-medium transition-colors">{item.title}</a>}
                    description={<span className="text-xs text-zinc-500">{item.size}</span>}
                  />
                </List.Item>
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
