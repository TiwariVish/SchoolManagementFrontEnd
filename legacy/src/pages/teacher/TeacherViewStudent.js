import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Table, Typography, Button, Spin, Collapse, Row, Col, Space } from 'antd';
import { calculateOverallAttendancePercentage, calculateSubjectAttendancePercentage, groupAttendanceBySubject } from '../../components/attendanceCalculator';
import CustomPieChart from '../../components/CustomPieChart';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const TeacherViewStudent = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { currentUser, userDetails, response, loading, error } = useSelector((state) => state.user);

    const address = "Student";
    const studentID = params.id;
    const teachSubject = currentUser.teachSubject?.subName;
    const teachSubjectID = currentUser.teachSubject?._id;

    useEffect(() => {
        dispatch(getUserDetails(studentID, address));
    }, [dispatch, studentID]);

    if (error) { console.log(error); }

    const [sclassName, setSclassName] = useState('');
    const [studentSchool, setStudentSchool] = useState('');
    const [subjectMarks, setSubjectMarks] = useState('');
    const [subjectAttendance, setSubjectAttendance] = useState([]);

    useEffect(() => {
        if (userDetails) {
            setSclassName(userDetails.sclassName || '');
            setStudentSchool(userDetails.school || '');
            setSubjectMarks(userDetails.examResult || '');
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
        <div style={{ padding: '24px' }}>
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Card title={<Title level={3} style={{ margin: 0 }}>Student Profile</Title>}>
                        <Row gutter={[16, 16]}>
                            <Col span={12}><Text strong>Name:</Text> <Text>{userDetails?.name}</Text></Col>
                            <Col span={12}><Text strong>Roll Number:</Text> <Text>{userDetails?.rollNum}</Text></Col>
                            <Col span={12}><Text strong>Class:</Text> <Text>{sclassName?.sclassName}</Text></Col>
                            <Col span={12}><Text strong>School:</Text> <Text>{studentSchool?.schoolName}</Text></Col>
                        </Row>
                    </Card>

                    <Card title={<Title level={4} style={{ margin: 0 }}>Attendance</Title>}>
                        {subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0 &&
                            <>
                                {Object.entries(groupAttendanceBySubject(subjectAttendance)).map(([subName, { present, allData, subId, sessions }], index) => {
                                    if (subName === teachSubject) {
                                        const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, sessions);
                                        
                                        const columns = [
                                            { title: 'Subject', dataIndex: 'subject', key: 'subject' },
                                            { title: 'Present', dataIndex: 'present', key: 'present' },
                                            { title: 'Total Sessions', dataIndex: 'sessions', key: 'sessions' },
                                            { title: 'Attendance Percentage', dataIndex: 'percentage', key: 'percentage' },
                                        ];

                                        const dataSource = [{
                                            key: index,
                                            subject: subName,
                                            present: present,
                                            sessions: sessions,
                                            percentage: `${subjectAttendancePercentage}%`
                                        }];

                                        const detailsColumns = [
                                            { title: 'Date', dataIndex: 'date', key: 'date' },
                                            { title: 'Status', dataIndex: 'status', key: 'status', align: 'right' }
                                        ];
                                        
                                        const detailsDataSource = allData.map((data, i) => {
                                            const date = new Date(data.date);
                                            const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
                                            return { key: i, date: dateString, status: data.status };
                                        });

                                        return (
                                            <div key={index} style={{ marginBottom: '20px' }}>
                                                <Table 
                                                    columns={columns} 
                                                    dataSource={dataSource} 
                                                    pagination={false} 
                                                    bordered
                                                    style={{ marginBottom: '10px' }}
                                                />
                                                <Collapse>
                                                    <Panel header="Attendance Details" key="1">
                                                        <Table 
                                                            columns={detailsColumns} 
                                                            dataSource={detailsDataSource} 
                                                            pagination={{ pageSize: 5 }} 
                                                            size="small"
                                                        />
                                                    </Panel>
                                                </Collapse>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                                
                                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                                    <Text strong>Overall Attendance Percentage: </Text>
                                    <Text>{overallAttendancePercentage.toFixed(2)}%</Text>
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <CustomPieChart data={chartData} />
                                </div>
                            </>
                        }
                        
                        <div style={{ marginTop: '20px' }}>
                            <Button
                                type="primary"
                                onClick={() => navigate(`/Teacher/class/student/attendance/${studentID}/${teachSubjectID}`)}
                            >
                                Add Attendance
                            </Button>
                        </div>
                    </Card>

                    <Card title={<Title level={4} style={{ margin: 0 }}>Subject Marks</Title>}>
                        {subjectMarks && Array.isArray(subjectMarks) && subjectMarks.length > 0 &&
                            <>
                                {subjectMarks.map((result, index) => {
                                    if (result.subName.subName === teachSubject) {
                                        const marksColumns = [
                                            { title: 'Subject', dataIndex: 'subject', key: 'subject' },
                                            { title: 'Marks', dataIndex: 'marks', key: 'marks' },
                                        ];
                                        
                                        const marksDataSource = [{
                                            key: index,
                                            subject: result.subName.subName,
                                            marks: result.marksObtained
                                        }];

                                        return (
                                            <Table 
                                                key={index}
                                                columns={marksColumns} 
                                                dataSource={marksDataSource} 
                                                pagination={false} 
                                                bordered
                                                style={{ marginBottom: '20px' }}
                                            />
                                        );
                                    }
                                    return null;
                                })}
                            </>
                        }
                        <Button 
                            type="primary"
                            style={{ backgroundColor: '#7b1fa2' }}
                            onClick={() => navigate(`/Teacher/class/student/marks/${studentID}/${teachSubjectID}`)}
                        >
                            Add Marks
                        </Button>
                    </Card>
                </Space>
            )}
        </div>
    );
};

export default TeacherViewStudent;