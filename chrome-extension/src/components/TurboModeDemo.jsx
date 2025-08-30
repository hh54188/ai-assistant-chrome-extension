import React from 'react';
import { Button, Card, Typography, Space, Divider } from 'antd';
import { ThunderboltFilled, CheckOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const TurboModeDemo = ({ onStartDemo }) => {
    const demoSteps = [
        {
            step: 1,
            title: "Select Multiple Models",
            description: "Click the thunderbolt icon and select 2+ AI models",
            icon: "⚡"
        },
        {
            step: 2,
            title: "Send Your Message",
            description: "Type your question and send it to all models simultaneously",
            icon: "💬"
        },
        {
            step: 3,
            title: "Compare Responses",
            description: "Review responses from all AI models side by side",
            icon: "🔍"
        },
        {
            step: 4,
            title: "Choose Your Model",
            description: "Click 'Continue with this model' to proceed with your preferred AI",
            icon: "✅"
        }
    ];

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <ThunderboltFilled style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                <Title level={2} style={{ margin: '0 0 8px 0' }}>
                    Turbo Mode Demo
                </Title>
                <Paragraph style={{ fontSize: '16px', color: '#666', margin: 0 }}>
                    Experience the power of multi-AI conversations
                </Paragraph>
            </div>

            <Card style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <InfoCircleOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                    <Title level={4} style={{ margin: 0 }}>
                        What is Turbo Mode?
                    </Title>
                </div>
                <Paragraph style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                    Turbo Mode allows you to send the same message to multiple AI models simultaneously, 
                    enabling you to compare responses and choose the best one. Perfect for research, 
                    content creation, and getting diverse perspectives on complex topics.
                </Paragraph>
            </Card>

            <div style={{ marginBottom: '32px' }}>
                <Title level={3} style={{ marginBottom: '20px' }}>
                    How It Works
                </Title>
                <div style={{ display: 'grid', gap: '16px' }}>
                    {demoSteps.map((step, index) => (
                        <Card 
                            key={step.step} 
                            size="small"
                            style={{ borderLeft: '4px solid #1890ff' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: '#1890ff',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    fontWeight: 'bold'
                                }}>
                                    {step.step}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '20px' }}>{step.icon}</span>
                                        <Title level={5} style={{ margin: 0 }}>
                                            {step.title}
                                        </Title>
                                    </div>
                                    <Text type="secondary" style={{ fontSize: '14px' }}>
                                        {step.description}
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <Divider />

            <div style={{ textAlign: 'center' }}>
                <Space direction="vertical" size="large">
                    <div>
                        <Title level={4} style={{ margin: '0 0 8px 0' }}>
                            Ready to Try Turbo Mode?
                        </Title>
                        <Paragraph style={{ color: '#666', margin: 0 }}>
                            Click the button below to start the demo
                        </Paragraph>
                    </div>
                    <Button 
                        type="primary" 
                        size="large"
                        icon={<ThunderboltFilled />}
                        onClick={onStartDemo}
                        style={{ 
                            height: '48px', 
                            padding: '0 32px',
                            fontSize: '16px',
                            borderRadius: '8px'
                        }}
                    >
                        Start Turbo Mode Demo
                    </Button>
                </Space>
            </div>

            <div style={{ 
                marginTop: '32px', 
                padding: '16px', 
                backgroundColor: '#f6f8fa', 
                borderRadius: '8px',
                border: '1px solid #e1e4e8'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CheckOutlined style={{ color: '#52c41a' }} />
                    <Text strong style={{ fontSize: '14px' }}>
                        Demo Features
                    </Text>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#666' }}>
                    <li>Simulated responses from multiple AI models</li>
                    <li>Interactive model selection interface</li>
                    <li>Session management and persistence</li>
                    <li>Responsive design for Chrome extension</li>
                </ul>
            </div>
        </div>
    );
};

export default TurboModeDemo;
