import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUser, updateUser } from '../../redux/userRelated/userHandle';
import { useNavigate } from 'react-router-dom';
import { authLogout } from '../../redux/userRelated/userSlice';
import { Card, Button, Form, Input, Typography, Space, Popconfirm, Collapse } from 'antd';
import { 
    UserOutlined, 
    MailOutlined, 
    BankOutlined, 
    LockOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const AdminProfile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const address = "Admin";

    const [form] = Form.useForm();

    const onFinish = (values) => {
        const { name, email, schoolName, password } = values;
        const fields = password ? { name, email, schoolName, password } : { name, email, schoolName };
        dispatch(updateUser(fields, currentUser._id, address));
    };

    const deleteHandler = () => {
        try {
            dispatch(deleteUser(currentUser._id, "Students"));
            dispatch(deleteUser(currentUser._id, address));
            dispatch(authLogout());
            navigate('/');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
            <Card 
                style={{ width: '100%', maxWidth: '600px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                title={<Title level={3} style={{ margin: 0, textAlign: 'center' }}>Admin Profile</Title>}
            >
                <div style={{ marginBottom: '24px', fontSize: '16px' }}>
                    <p><Text strong>Name: </Text> <Text>{currentUser.name}</Text></p>
                    <p><Text strong>Email: </Text> <Text>{currentUser.email}</Text></p>
                    <p><Text strong>School: </Text> <Text>{currentUser.schoolName}</Text></p>
                    
                    <div style={{ marginTop: '20px' }}>
                        <Popconfirm
                            title="Delete Account"
                            description="Are you sure you want to delete your account? This action cannot be undone."
                            onConfirm={deleteHandler}
                            okText="Yes, Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                        >
                            <Button danger icon={<DeleteOutlined />}>Delete Account</Button>
                        </Popconfirm>
                    </div>
                </div>

                <Collapse accordion>
                    <Panel header={<span><EditOutlined /> Edit Profile</span>} key="1">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            initialValues={{
                                name: currentUser.name,
                                email: currentUser.email,
                                schoolName: currentUser.schoolName,
                            }}
                            size="large"
                        >
                            <Form.Item
                                name="name"
                                label="Name"
                                rules={[{ required: true, message: 'Please input your name!' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Enter your name..." />
                            </Form.Item>

                            <Form.Item
                                name="schoolName"
                                label="School Name"
                                rules={[{ required: true, message: 'Please input your school name!' }]}
                            >
                                <Input prefix={<BankOutlined />} placeholder="Enter your school name..." />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Please input your email!' },
                                    { type: 'email', message: 'Please enter a valid email!' }
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="Enter your email..." />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="New Password (optional)"
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Enter new password to change..." />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                    Update Profile
                                </Button>
                            </Form.Item>
                        </Form>
                    </Panel>
                </Collapse>
            </Card>
        </div>
    );
};

export default AdminProfile;