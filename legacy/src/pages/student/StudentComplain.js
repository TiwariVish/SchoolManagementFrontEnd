import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../redux/userRelated/userHandle';
import Popup from '../../components/Popup';
import { Card, Form, Input, Button, Typography } from 'antd';
import { EditOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

const StudentComplain = () => {
    const dispatch = useDispatch();
    const { status, currentUser, error } = useSelector(state => state.user);

    const user = currentUser._id;
    const school = currentUser.school._id;
    const address = "Complain";

    const [loader, setLoader] = useState(false);
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [form] = Form.useForm();

    const onFinish = (values) => {
        const { date, complaint } = values;
        const fields = {
            user,
            date,
            complaint,
            school,
        };
        setLoader(true);
        dispatch(addStuff(fields, address));
    };

    useEffect(() => {
        if (status === "added") {
            setLoader(false);
            setShowPopup(true);
            setMessage("Done Successfully");
            form.resetFields();
        }
        else if (error) {
            setLoader(false);
            setShowPopup(true);
            setMessage("Network Error");
        }
    }, [status, error, form]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
            <Card style={{ width: '100%', maxWidth: '600px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Title level={3}>Submit Complain</Title>
                </div>

                <Form
                    form={form}
                    name="student_complain"
                    layout="vertical"
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="date"
                        label="Select Date"
                        rules={[{ required: true, message: 'Please select a date!' }]}
                    >
                        <Input type="date" prefix={<CalendarOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="complaint"
                        label="Write your complain"
                        rules={[{ required: true, message: 'Please input your complain!' }]}
                    >
                        <TextArea rows={4} placeholder="Describe your issue here..." />
                    </Form.Item>

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            style={{ width: '100%' }}
                            loading={loader}
                            icon={<EditOutlined />}
                        >
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
};

export default StudentComplain;