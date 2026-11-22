import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/userRelated/userHandle';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { updateStudentFields } from '../../../redux/studentRelated/studentHandle';
import { Card, Form, Select, Button, Typography, Spin, Input } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import Popup from '../../../components/Popup';

const { Title, Text } = Typography;
const { Option } = Select;

const StudentAttendance = ({ situation, studentId, subjectId, onClose }) => {
    const dispatch = useDispatch();
    const { currentUser, userDetails, loading } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);
    const { response, error, statestatus } = useSelector((state) => state.student);

    const [studentID, setStudentID] = useState(studentId || "");
    const [chosenSubName, setChosenSubName] = useState(subjectId || "");
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [form] = Form.useForm();

    useEffect(() => {
        if (studentId) {
            setStudentID(studentId);
            dispatch(getUserDetails(studentId, "Student"));
        }
    }, [studentId, dispatch]);

    useEffect(() => {
        if (userDetails?.sclassName && situation === "Student") {
            dispatch(getSubjectList(userDetails.sclassName._id, "ClassSubjects"));
        }
    }, [dispatch, userDetails, situation]);

    const handleSubjectChange = (value) => {
        setChosenSubName(value);
    };

    const onFinish = (values) => {
        const { status, date } = values;
        const fields = { subName: chosenSubName, status, date };
        setLoader(true);
        dispatch(updateStudentFields(studentID, fields, "StudentAttendance"));
    };

    useEffect(() => {
        if (response || statestatus === "added") {
            setLoader(false);
            setShowPopup(true);
            setMessage(response || "Attendance saved successfully!");
            form.resetFields();
            if (onClose) setTimeout(onClose, 2000); 
        } else if (error) {
            setLoader(false);
            setShowPopup(true);
            setMessage("Error saving attendance");
        }
    }, [response, statestatus, error, onClose, form]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Card style={{ width: '100%', maxWidth: '600px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Title level={3}>Provide Student Attendance</Title>
                        <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                            Student Name: {userDetails?.name}
                        </Text>
                        {currentUser.teachSubject && (
                            <Text strong style={{ fontSize: '16px', display: 'block' }}>
                                Subject Name: {currentUser.teachSubject?.subName}
                            </Text>
                        )}
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        size="large"
                    >
                        {situation === "Student" && (
                            <Form.Item
                                name="subject"
                                label="Select Subject"
                                rules={[{ required: true, message: 'Please select a subject!' }]}
                            >
                                <Select
                                    placeholder="Choose Subject"
                                    onChange={handleSubjectChange}
                                >
                                    {subjectsList?.length > 0 ? (
                                        subjectsList.map((subject) => (
                                            <Option key={subject._id} value={subject._id}>
                                                {subject.subName}
                                            </Option>
                                        ))
                                    ) : (
                                        <Option value="" disabled>
                                            No Subjects Available
                                        </Option>
                                    )}
                                </Select>
                            </Form.Item>
                        )}

                        <Form.Item
                            name="status"
                            label="Attendance Status"
                            rules={[{ required: true, message: 'Please select an attendance status!' }]}
                        >
                            <Select placeholder="Select Status">
                                <Option value="Present">Present</Option>
                                <Option value="Absent">Absent</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="date"
                            label="Select Date"
                            rules={[{ required: true, message: 'Please select a date!' }]}
                        >
                            <Input type="date" prefix={<CalendarOutlined />} />
                        </Form.Item>

                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                style={{ width: '100%', backgroundColor: '#7b1fa2' }}
                                loading={loader}
                            >
                                Submit Attendance
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
};

export default StudentAttendance;
