import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Button, Row, Col, Space } from "antd";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';

const SubjectForm = () => {
    const [subjects, setSubjects] = useState([{ subName: "", subCode: "", sessions: 0 }]);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const userState = useSelector(state => state.user);
    const { status, currentUser, response } = userState;

    const sclassName = params.id;
    const adminID = currentUser._id;
    const address = "Subject";

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    const handleFieldChange = (index, field, value) => {
        const newSubjects = [...subjects];
        newSubjects[index][field] = value;
        setSubjects(newSubjects);
    };

    const handleAddSubject = () => setSubjects([...subjects, { subName: "", subCode: "", sessions: 0 }]);

    const handleRemoveSubject = (index) => () => {
        const newSubjects = [...subjects];
        newSubjects.splice(index, 1);
        setSubjects(newSubjects);
    };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);
        const fields = {
            sclassName,
            subjects,
            adminID,
        };
        dispatch(addStuff(fields, address));
    };

    useEffect(() => {
        if (status === 'added') {
            navigate("/Admin/subjects");
            dispatch(underControl());
            setLoader(false);
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage("Network Error");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, response, dispatch]);

    return (
        <Form layout="vertical" onSubmitCapture={submitHandler} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3>Add Subjects</h3>
            <div style={{ flex: 1, overflowY: "auto" }}>
                {subjects.map((subject, index) => (
                    <div key={index} style={{ marginBottom: 20 }}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Subject Name" required>
                                    <Input
                                        value={subject.subName}
                                        onChange={(e) => handleFieldChange(index, 'subName', e.target.value)}
                                        placeholder="Enter Subject Name"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Subject Code" required>
                                    <Input
                                        value={subject.subCode}
                                        onChange={(e) => handleFieldChange(index, 'subCode', e.target.value)}
                                        placeholder="Enter Subject Code"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16} align="middle">
                            <Col span={12}>
                                <Form.Item label="Sessions" required>
                                    <InputNumber
                                        min={0}
                                        style={{ width: "100%" }}
                                        value={subject.sessions}
                                        onChange={(value) => handleFieldChange(index, 'sessions', value)}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                                <Space>
                                    {index === 0 ? (
                                        <Button type="dashed" onClick={handleAddSubject}>Add</Button>
                                    ) : (
                                        <Button type="dashed" danger onClick={handleRemoveSubject(index)}>Remove</Button>
                                    )}
                                </Space>
                            </Col>
                        </Row>
                    </div>
                ))}
            </div>

            {/* Footer Save Button */}
            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 12, textAlign: "right" }}>
                <Button type="primary" htmlType="submit" loading={loader}>
                    Save
                </Button>
            </div>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Form>
    );
};

export default SubjectForm;
