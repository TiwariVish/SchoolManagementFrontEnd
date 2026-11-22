import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Button, Checkbox, Typography, Spin, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, BankOutlined } from '@ant-design/icons';
import { registerUser } from '../../redux/userRelated/userHandle';
import Popup from '../../components/Popup';

const { Title, Text } = Typography;

const AdminRegisterPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, currentUser, response, error, currentRole } = useSelector(state => state.user);

    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const role = "Admin";

    const onFinish = (values) => {
        const { adminName, schoolName, email, password } = values;
        const fields = { name: adminName, email, password, role, schoolName };
        setLoader(true);
        dispatch(registerUser(fields, role));
    };

    useEffect(() => {
        if (status === 'success' || (currentUser !== null && currentRole === 'Admin')) {
            navigate('/Admin/dashboard');
        }
        else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        }
        else if (status === 'error') {
            console.log(error);
            setLoader(false);
        }
    }, [status, currentUser, currentRole, navigate, error, response]);

    return (
        <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex', width: '100%' }}>
            <Row style={{ width: '100%', background: '#fff' }}>
                <Col xs={24} sm={24} md={10} lg={8} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '40px 20px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    zIndex: 2,
                    boxShadow: '10px 0 30px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ width: '100%', maxWidth: '400px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ 
                                background: 'var(--color-light-bg)', 
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                margin: '0 auto 1rem' 
                            }}>
                                <BankOutlined style={{ fontSize: '28px', color: 'var(--color-primary)' }} />
                            </div>
                            <Title level={2} style={{ margin: 0, color: 'var(--text-dark)' }}>Admin Register</Title>
                            <Text style={{ color: 'var(--text-light)' }}>
                                Create your school and start managing.
                            </Text>
                        </div>

                        <Form
                            name="admin_register"
                            layout="vertical"
                            onFinish={onFinish}
                            size="large"
                        >
                            <Form.Item
                                name="adminName"
                                rules={[{ required: true, message: 'Please input your name!' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Enter your name" />
                            </Form.Item>

                            <Form.Item
                                name="schoolName"
                                rules={[{ required: true, message: 'Please input your school name!' }]}
                            >
                                <Input prefix={<BankOutlined />} placeholder="Create your school name" />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: 'Please input your email!' },
                                    { type: 'email', message: 'Please enter a valid email!' }
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="Enter your email" />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Please input your password!' }]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                            </Form.Item>

                            <Form.Item name="remember" valuePropName="checked">
                                <Checkbox style={{ color: 'var(--text-light)' }}>Remember me</Checkbox>
                            </Form.Item>

                            <Form.Item>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    style={{ width: '100%' }}
                                    loading={loader}
                                >
                                    Register
                                </Button>
                            </Form.Item>

                            <div style={{ textAlign: 'center' }}>
                                <Text style={{ color: 'var(--text-light)' }}>Already have an account? </Text>
                                <Link to="/Adminlogin" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Log in</Link>
                            </div>
                        </Form>
                    </div>
                </Col>

                <Col xs={0} sm={0} md={14} lg={16} style={{ 
                    backgroundImage: 'url(https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }} />
            </Row>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
}

export default AdminRegisterPage;
