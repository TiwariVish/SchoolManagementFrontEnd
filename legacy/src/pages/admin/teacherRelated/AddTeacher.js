import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import Popup from '../../../components/Popup';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { Form, Input, Button, Card, Typography, Spin } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const AddTeacher = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const subjectID = params.id;

    const { status, response, error } = useSelector(state => state.user);
    const { subjectDetails } = useSelector((state) => state.sclass);

    useEffect(() => {
        dispatch(getSubjectDetails(subjectID, "Subject"));
    }, [dispatch, subjectID]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    const role = "Teacher";
    const school = subjectDetails && subjectDetails.school;
    const teachSubject = subjectDetails && subjectDetails._id;
    const teachSclass = subjectDetails && subjectDetails.sclassName && subjectDetails.sclassName._id;

    const onFinish = (values) => {
        const { name, email, password } = values;
        const fields = { name, email, password, role, school, teachSubject, teachSclass };
        setLoader(true);
        dispatch(registerUser(fields, role));
    };

    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl());
            navigate("/Admin/teachers");
        }
        else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        }
        else if (status === 'error') {
            setMessage("Network Error");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, error, response, dispatch]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
            <Card style={{ width: '100%', maxWidth: '500px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Title level={3}>Add Teacher</Title>
                    {subjectDetails && (
                        <div>
                            <Text strong>Subject:</Text> <Text type="secondary">{subjectDetails.subName}</Text>
                            <br />
                            <Text strong>Class:</Text> <Text type="secondary">{subjectDetails.sclassName && subjectDetails.sclassName.sclassName}</Text>
                        </div>
                    )}
                </div>

                <Form
                    name="add_teacher"
                    layout="vertical"
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: 'Please input the teacher\'s name!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Enter teacher's name..." />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input the teacher\'s email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Enter teacher's email..." />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input the password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Enter teacher's password..." />
                    </Form.Item>

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            style={{ width: '100%' }}
                            loading={loader}
                        >
                            Register Teacher
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
};

export default AddTeacher;