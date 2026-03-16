import React from 'react';
import { Typography, Form, Input, Button, Row, Col } from 'antd';
import { Mail, Phone, MapPin, MessageSquare, Twitter, Facebook, Instagram } from 'lucide-react';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

export const Contact = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Success:', values);
    // Handle form submission here
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <Title level={1} className="!text-4xl !font-bold !tracking-tight !mb-4">Contact Us</Title>
        <Paragraph className="text-lg text-zinc-600 max-w-2xl mx-auto">
          We're here to help! Whether you have a question about our products, need technical support, or just want to say hello.
        </Paragraph>
      </div>

      <Row gutter={[48, 48]}>
        <Col xs={24} md={10}>
          <div className="space-y-8">
            <div className="border border-zinc-200 rounded-lg p-6 bg-white shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-zinc-100 rounded-full text-zinc-900">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <Title level={4} className="!mb-1">Email Us</Title>
                  <Paragraph className="text-zinc-600 mb-0">support@gamingku.com</Paragraph>
                  <Paragraph className="text-zinc-500 text-sm">We aim to reply within 24 hours.</Paragraph>
                </div>
              </div>
            </div>

            <div className="border border-zinc-200 rounded-lg p-6 bg-white shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-zinc-100 rounded-full text-zinc-900">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <Title level={4} className="!mb-1">Call Us</Title>
                  <Paragraph className="text-zinc-600 mb-0">+1 (555) 123-4567</Paragraph>
                  <Paragraph className="text-zinc-500 text-sm">Mon-Fri, 9am - 6pm PST</Paragraph>
                </div>
              </div>
            </div>

            <div className="border border-zinc-200 rounded-lg p-6 bg-white shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-zinc-100 rounded-full text-zinc-900">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <Title level={4} className="!mb-1">Visit Us</Title>
                  <Paragraph className="text-zinc-600 mb-0">123 Gaming Street, Suite 404</Paragraph>
                  <Paragraph className="text-zinc-500 text-sm">San Francisco, CA 94103</Paragraph>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-200">
              <Title level={4} className="!mb-4">Follow Us</Title>
              <div className="flex space-x-4">
                <a href="#" className="p-3 bg-zinc-100 rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="p-3 bg-zinc-100 rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="p-3 bg-zinc-100 rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} md={14}>
          <div className="border border-zinc-200 rounded-lg bg-white shadow-md p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-8">
              <MessageSquare className="w-6 h-6 text-zinc-900" />
              <Title level={3} className="!mb-0">Send a Message</Title>
            </div>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="firstName"
                    label={<span className="font-medium text-zinc-700">First Name</span>}
                    rules={[{ required: true, message: 'Please enter your first name' }]}
                  >
                    <Input size="large" className="rounded-md" placeholder="John" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="lastName"
                    label={<span className="font-medium text-zinc-700">Last Name</span>}
                    rules={[{ required: true, message: 'Please enter your last name' }]}
                  >
                    <Input size="large" className="rounded-md" placeholder="Doe" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="email"
                label={<span className="font-medium text-zinc-700">Email Address</span>}
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input size="large" className="rounded-md" placeholder="john@example.com" />
              </Form.Item>

              <Form.Item
                name="subject"
                label={<span className="font-medium text-zinc-700">Subject</span>}
                rules={[{ required: true, message: 'Please enter a subject' }]}
              >
                <Input size="large" className="rounded-md" placeholder="How can we help?" />
              </Form.Item>

              <Form.Item
                name="message"
                label={<span className="font-medium text-zinc-700">Message</span>}
                rules={[{ required: true, message: 'Please enter your message' }]}
              >
                <TextArea rows={6} className="rounded-md" placeholder="Write your message here..." />
              </Form.Item>

              <Form.Item className="mb-0 mt-8">
                <Button type="primary" htmlType="submit" size="large" className="w-full bg-zinc-900 hover:bg-zinc-800 h-12 text-base font-medium rounded-md">
                  Send Message
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};
