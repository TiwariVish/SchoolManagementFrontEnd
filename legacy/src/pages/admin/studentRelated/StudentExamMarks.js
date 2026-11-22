import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getUserDetails } from '../../../redux/userRelated/userHandle';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { updateStudentFields } from '../../../redux/studentRelated/studentHandle';
import Popup from '../../../components/Popup';
import { Card, Form, InputNumber, Select, Button, Typography, Spin } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const StudentExamMarks = ({ situation }) => {
    const dispatch = useDispatch();
    const { currentUser, userDetails, loading } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);
    const { response, error, statestatus } = useSelector((state) => state.student);
    const params = useParams();

    const [studentID, setStudentID] = useState("");
    const [chosenSubName, setChosenSubName] = useState("");
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [form] = Form.useForm();

    useEffect(() => {
        if (situation === "Student") {
            setStudentID(params.id);
            const stdID = params.id;
            dispatch(getUserDetails(stdID, "Student"));
        }
        else if (situation === "Subject") {
            const { studentID, subjectID } = params;
            setStudentID(studentID);
            dispatch(getUserDetails(studentID, "Student"));
            setChosenSubName(subjectID);
        }
    }, [situation, params, dispatch]);

    useEffect(() => {
        if (userDetails && userDetails.sclassName && situation === "Student") {
            dispatch(getSubjectList(userDetails.sclassName._id, "ClassSubjects"));
        }
    }, [dispatch, userDetails, situation]);

    const handleSubjectChange = (value) => {
        setChosenSubName(value);
    };

    const onFinish = (values) => {
        const { marksObtained } = values;
        const fields = { subName: chosenSubName, marksObtained };
        setLoader(true);
        dispatch(updateStudentFields(studentID, fields, "UpdateExamResult"));
    };

    useEffect(() => {
        if (response) {
            setLoader(false);
            setShowPopup(true);
            setMessage(response);
            form.resetFields();
        }
        else if (error) {
            setLoader(false);
            setShowPopup(true);
            setMessage("Error saving marks");
        }
        else if (statestatus === "added") {
            setLoader(false);
            setShowPopup(true);
            setMessage("Marks added successfully!");
            form.resetFields();
        }
    }, [response, statestatus, error, form]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Card style={{ width: '100%', maxWidth: '600px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Title level={3}>Provide Exam Marks</Title>
                        <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                            Student Name: {userDetails?.name}
                        </Text>
                        {currentUser.teachSubject &&
                            <Text strong style={{ fontSize: '16px', display: 'block' }}>
                                Subject Name: {currentUser.teachSubject?.subName}
                            </Text>
                        }
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
                                            Add Subjects For Marks
                                        </Option>
                                    )}
                                </Select>
                            </Form.Item>
                        )}

                        <Form.Item
                            name="marksObtained"
                            label="Enter marks"
                            rules={[{ required: true, message: 'Please enter marks!' }]}
                        >
                            <InputNumber style={{ width: '100%' }} min={0} max={100} />
                        </Form.Item>

                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                style={{ width: '100%' }}
                                loading={loader}
                            >
                                Submit Marks
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
};

export default StudentExamMarks;