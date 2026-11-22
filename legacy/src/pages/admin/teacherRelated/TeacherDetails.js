import React, { useEffect } from 'react';
import { getTeacherDetails } from '../../../redux/teacherRelated/teacherHandle';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Typography, Spin, Space, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const TeacherDetails = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { loading, teacherDetails, error } = useSelector((state) => state.teacher);

    const teacherID = params.id;

    useEffect(() => {
        dispatch(getTeacherDetails(teacherID));
    }, [dispatch, teacherID]);

    if (error) {
        console.log(error);
    }

    const isSubjectNamePresent = teacherDetails?.teachSubject?.subName;

    const handleAddSubject = () => {
        navigate(`/Admin/teachers/choosesubject/${teacherDetails?.teachSclass?._id}/${teacherDetails?._id}`);
    };

    return (
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Card 
                    title={<Title level={3} style={{ margin: 0, textAlign: 'center' }}>Teacher Details</Title>}
                    style={{ width: '100%', maxWidth: '600px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                >
                    <Row gutter={[16, 16]} style={{ fontSize: '16px' }}>
                        <Col span={24}>
                            <Text strong>Teacher Name: </Text>
                            <Text>{teacherDetails?.name}</Text>
                        </Col>
                        <Col span={24}>
                            <Text strong>Class Name: </Text>
                            <Text>{teacherDetails?.teachSclass?.sclassName}</Text>
                        </Col>
                        {isSubjectNamePresent ? (
                            <>
                                <Col span={24}>
                                    <Text strong>Subject Name: </Text>
                                    <Text>{teacherDetails?.teachSubject?.subName}</Text>
                                </Col>
                                <Col span={24}>
                                    <Text strong>Subject Sessions: </Text>
                                    <Text>{teacherDetails?.teachSubject?.sessions}</Text>
                                </Col>
                            </>
                        ) : (
                            <Col span={24} style={{ textAlign: 'center', marginTop: '20px' }}>
                                <Button 
                                    type="primary" 
                                    icon={<PlusOutlined />} 
                                    onClick={handleAddSubject}
                                >
                                    Add Subject
                                </Button>
                            </Col>
                        )}
                    </Row>
                </Card>
            )}
        </div>
    );
};

export default TeacherDetails;