import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { Form, Input, Button, Card, Typography } from 'antd';
import { NotificationOutlined, InfoCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import Popup from '../../../components/Popup';

const { Title } = Typography;
const { TextArea } = Input;

const AddNotice = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, response, error, currentUser } = useSelector(state => state.user);

  const adminID = currentUser._id;

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const address = "Notice";

  const onFinish = (values) => {
    const { title, details, date } = values;
    const fields = { title, details, date, adminID };
    setLoader(true);
    dispatch(addStuff(fields, address));
  };

  useEffect(() => {
    if (status === 'added') {
      navigate('/Admin/notices');
      dispatch(underControl());
    } else if (status === 'error') {
      setMessage("Network Error");
      setShowPopup(true);
      setLoader(false);
    }
  }, [status, navigate, error, response, dispatch]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
      <Card style={{ width: '100%', maxWidth: '600px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3}>Add Notice</Title>
        </div>

        <Form
          name="add_notice"
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input the notice title!' }]}
          >
            <Input prefix={<NotificationOutlined />} placeholder="Enter notice title..." />
          </Form.Item>

          <Form.Item
            name="details"
            label="Details"
            rules={[{ required: true, message: 'Please input the notice details!' }]}
          >
            <TextArea rows={4} placeholder="Enter notice details..." />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select the date!' }]}
          >
            <Input type="date" prefix={<CalendarOutlined />} placeholder="Enter notice date..." />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ width: '100%' }}
              loading={loader}
            >
              Add Notice
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </div>
  );
};

export default AddNotice;