import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Spin, Divider } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { calculateOverallAttendancePercentage } from '../../components/attendanceCalculator';
import CustomPieChart from '../../components/CustomPieChart';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import SeeNotice from '../../components/SeeNotice';
import CountUp from 'react-countup';
import SubjectIcon from "../../assets/subjects.svg";
import AssignmentIcon from "../../assets/assignment.svg";
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';

const { Title, Text } = Typography;

const StudentHomePage = () => {
    const dispatch = useDispatch();

    const { userDetails, currentUser, loading, response } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);

    const [subjectAttendance, setSubjectAttendance] = useState([]);

    const classID = currentUser.sclassName._id;

    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
        dispatch(getSubjectList(classID, "ClassSubjects"));
    }, [dispatch, currentUser._id, classID]);

    const numberOfSubjects = subjectsList?.length || 0;

    useEffect(() => {
        if (userDetails) {
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails]);

    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: overallAbsentPercentage }
    ];

    return (
  
            <Row gutter={[24, 24]}>
                {/* Total Subjects */}
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card hoverable style={{ textAlign: 'center' }}>
                        <img src={SubjectIcon} alt="Subjects" style={{ height: 60, marginBottom: 16 }} />
                        <Title level={5}>Total Subjects</Title>
                        <Text style={{ fontSize: 28, color: '#52c41a' }}>
                            <CountUp start={0} end={numberOfSubjects} duration={2.5} />
                        </Text>
                    </Card>
                </Col>

                {/* Total Assignments */}
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card hoverable style={{ textAlign: 'center' }}>
                        <img src={AssignmentIcon} alt="Assignments" style={{ height: 60, marginBottom: 16 }} />
                        <Title level={5}>Total Assignments</Title>
                        <Text style={{ fontSize: 28, color: '#1890ff' }}>
                            <CountUp start={0} end={15} duration={4} />
                        </Text>
                    </Card>
                </Col>

                {/* Attendance Chart */}
                <Col xs={24} sm={24} md={8} lg={12}>
                    <Card hoverable style={{ textAlign: 'center', height: '100%' }}>
                        <Title level={5}>Overall Attendance</Title>
                        <Divider />
                        {loading ? (
                            <Spin tip="Loading..." size="large" />
                        ) : response || !subjectAttendance.length ? (
                            <Text>No Attendance Found</Text>
                        ) : (
                            <CustomPieChart data={chartData} />
                        )}
                    </Card>
                </Col>

                {/* Notices */}
                <Col xs={24}>
                    <Card hoverable>
                        <SeeNotice />
                    </Card>
                </Col>
            </Row>
      
    );
};

export default StudentHomePage;
