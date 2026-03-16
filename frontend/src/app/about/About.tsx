import React from 'react';
import { Typography, Divider, Row, Col } from 'antd';
import { Target, Users, Zap } from 'lucide-react';

const { Title, Paragraph } = Typography;

export const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <Title level={1} className="!text-4xl !font-bold !tracking-tight !mb-6">About GamingKu</Title>
        <Paragraph className="text-lg text-zinc-600 max-w-3xl mx-auto">
          We are passionate about providing the ultimate gaming experience through premium gear and accessories.
        </Paragraph>
      </div>

      <Row gutter={[32, 32]} className="mb-16">
        <Col xs={24} md={12}>
          <img 
            src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Gaming Setup" 
            className="w-full h-auto rounded-xl shadow-lg object-cover aspect-video"
            referrerPolicy="no-referrer"
          />
        </Col>
        <Col xs={24} md={12} className="flex flex-col justify-center">
          <Title level={2} className="!text-3xl !font-semibold !tracking-tight">Our Story</Title>
          <Paragraph className="text-base text-zinc-600 leading-relaxed">
            Founded in 2026, GamingKu started with a simple mission: to make high-quality gaming gear accessible to everyone. We understand that the right equipment can make the difference between winning and losing, between comfort and strain.
          </Paragraph>
          <Paragraph className="text-base text-zinc-600 leading-relaxed">
            What began as a small online store has grown into a community of passionate gamers. We carefully curate our selection, testing every keyboard, mouse, and monitor to ensure they meet our strict standards for performance and durability.
          </Paragraph>
        </Col>
      </Row>

      <Divider className="my-16" />

      <div className="text-center mb-12">
        <Title level={2} className="!text-3xl !font-semibold !tracking-tight">Our Core Values</Title>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <div className="h-full text-center border border-zinc-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-zinc-100 rounded-full text-zinc-900">
                <Target className="w-8 h-8" />
              </div>
            </div>
            <Title level={4} className="!mb-4">Precision & Quality</Title>
            <Paragraph className="text-zinc-600">
              We believe in gear that responds exactly when you need it. Quality is never compromised.
            </Paragraph>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div className="h-full text-center border border-zinc-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-zinc-100 rounded-full text-zinc-900">
                <Users className="w-8 h-8" />
              </div>
            </div>
            <Title level={4} className="!mb-4">Community First</Title>
            <Paragraph className="text-zinc-600">
              We listen to our customers and build our catalog based on what the gaming community actually wants.
            </Paragraph>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div className="h-full text-center border border-zinc-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-zinc-100 rounded-full text-zinc-900">
                <Zap className="w-8 h-8" />
              </div>
            </div>
            <Title level={4} className="!mb-4">Innovation</Title>
            <Paragraph className="text-zinc-600">
              We stay ahead of the curve, constantly searching for the latest technologies to enhance your setup.
            </Paragraph>
          </div>
        </Col>
      </Row>
    </div>
  );
};
