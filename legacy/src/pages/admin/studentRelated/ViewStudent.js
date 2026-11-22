import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails, updateUser } from '../../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { Tabs, Card, Typography, Spin, Button, Row, Col, Table, Collapse, Space } from 'antd';
import { 
    DeleteOutlined, 
    EditOutlined, 
    BarChartOutlined, 
    TableOutlined 
} from '@ant-design/icons';
import { removeStuff, updateStudentFields } from '../../../redux/studentRelated/studentHandle';
import { calculateOverallAttendancePercentage, calculateSubjectAttendancePercentage, groupAttendanceBySubject } from '../../../components/attendanceCalculator';
import CustomBarChart from '../../../components/CustomBarChart';
import CustomPieChart from '../../../components/CustomPieChart';
import Popup from '../../../components/Popup';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const ViewStudent = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { userDetails, response, loading, error } = useSelector((state) => state.user);

    const studentID = params.id;
    const address = "Student";

    useEffect(() => {
        dispatch(getUserDetails(studentID, address));
    }, [dispatch, studentID]);

    useEffect(() => {
        if (userDetails && userDetails.sclassName && userDetails.sclassName._id !== undefined) {
            dispatch(getSubjectList(userDetails.sclassName._id, "ClassSubjects"));
        }
    }, [dispatch, userDetails]);

    if (error) { console.log(error); }

    const [name, setName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [password, setPassword] = useState('');
    const [sclassName, setSclassName] = useState('');
    const [studentSchool, setStudentSchool] = useState('');
    const [subjectMarks, setSubjectMarks] = useState([]);
    const [subjectAttendance, setSubjectAttendance] = useState([]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const [activeTab, setActiveTab] = useState('1');

    useEffect(() => {
        if (userDetails) {
            setName(userDetails.name || '');
            setRollNum(userDetails.rollNum || '');
            setSclassName(userDetails.sclassName || '');
            setStudentSchool(userDetails.school || '');
            setSubjectMarks(userDetails.examResult || []);
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails]);

    const deleteHandler = () => {
        setMessage("Sorry the delete function has been disabled for now.");
        setShowPopup(true);
    };

    const removeHandler = (id, deladdress) => {
        dispatch(removeStuff(id, deladdress))
            .then(() => {
                dispatch(getUserDetails(studentID, address));
            });
    };

    const removeSubAttendance = (subId) => {
        dispatch(updateStudentFields(studentID, { subId }, "RemoveStudentSubAtten"))
            .then(() => {
                dispatch(getUserDetails(studentID, address));
            });
    };

    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: overallAbsentPercentage }
    ];

    const subjectData = Object.entries(groupAttendanceBySubject(subjectAttendance)).map(([subName, { subCode, present, sessions }]) => {
        const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, sessions);
        return {
            subject: subName,
            attendancePercentage: subjectAttendancePercentage,
            totalClasses: sessions,
            attendedClasses: present
        };
    });

    const StudentDetailsSection = () => (
        <Card>
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Title level={4}>Personal Details</Title>
                    <p><Text strong>Name:</Text> {name}</p>
                    <p><Text strong>Roll Number:</Text> {rollNum}</p>
                    <p><Text strong>Class:</Text> {sclassName.sclassName}</p>
                    <p><Text strong>School:</Text> {studentSchool.schoolName}</p>
                    
                    <Space style={{ marginTop: '20px' }}>
                        <Button type="primary" danger icon={<DeleteOutlined />} onClick={deleteHandler}>
                            Delete Student
                        </Button>
                    </Space>
                </Col>
                <Col xs={24} md={12}>
                    {subjectAttendance && subjectAttendance.length > 0 && (
                        <div style={{ textAlign: 'center' }}>
                            <Title level={5}>Overall Attendance</Title>
                            <CustomPieChart data={chartData} />
                        </div>
                    )}
                </Col>
            </Row>
        </Card>
    );

    const StudentAttendanceSection = () => {
        const columns = [
            { title: 'Subject', dataIndex: 'subject', key: 'subject' },
            { title: 'Present', dataIndex: 'present', key: 'present' },
            { title: 'Total Sessions', dataIndex: 'sessions', key: 'sessions' },
            { title: 'Attendance %', dataIndex: 'percentage', key: 'percentage', render: text => `${text}%` },
            {
                title: 'Actions',
                key: 'actions',
                render: (_, record) => (
                    <Space>
                        <Button 
                            type="primary" 
                            ghost
                            onClick={() => navigate(`/Admin/subject/student/attendance/${studentID}/${record.subId}`)}
                        >
                            Change
                        </Button>
                        <Button 
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={() => removeSubAttendance(record.subId)}
                        />
                    </Space>
                ),
            },
        ];

        const data = Object.entries(groupAttendanceBySubject(subjectAttendance)).map(([subName, { present, allData, subId, sessions }], index) => ({
            key: index,
            subject: subName,
            present,
            sessions,
            percentage: calculateSubjectAttendancePercentage(present, sessions),
            subId,
            allData
        }));

        return (
            <Card 
                title="Attendance Details" 
                extra={
                    <Button type="primary" onClick={() => navigate("/Admin/students/student/attendance/" + studentID)}>
                        Add Attendance
                    </Button>
                }
            >
                {subjectAttendance && subjectAttendance.length > 0 ? (
                    <>
                        <Table 
                            columns={columns} 
                            dataSource={data} 
                            pagination={false} 
                            expandable={{
                                expandedRowRender: record => (
                                    <Table 
                                        size="small"
                                        columns={[
                                            { title: 'Date', dataIndex: 'date', key: 'date' },
                                            { title: 'Status', dataIndex: 'status', key: 'status' }
                                        ]}
                                        dataSource={record.allData.map((d, i) => {
                                            const date = new Date(d.date);
                                            return {
                                                key: i,
                                                date: date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date",
                                                status: d.status
                                            };
                                        })}
                                        pagination={{ pageSize: 5 }}
                                    />
                                )
                            }}
                        />
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong style={{ fontSize: '16px' }}>
                                Overall Attendance: {overallAttendancePercentage.toFixed(2)}%
                            </Text>
                            <Button danger icon={<DeleteOutlined />} onClick={() => removeHandler(studentID, "RemoveStudentAtten")}>
                                Delete All Attendance
                            </Button>
                        </div>
                        <div style={{ marginTop: '30px' }}>
                            <CustomBarChart chartData={subjectData} dataKey="attendancePercentage" />
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Text type="secondary">No attendance records found.</Text>
                    </div>
                )}
            </Card>
        );
    };

    const StudentMarksSection = () => {
        const columns = [
            { title: 'Subject', dataIndex: 'subject', key: 'subject' },
            { title: 'Marks', dataIndex: 'marks', key: 'marks' },
        ];

        const data = subjectMarks.filter(res => res.subName && res.marksObtained).map((result, index) => ({
            key: index,
            subject: result.subName.subName,
            marks: result.marksObtained
        }));

        return (
            <Card 
                title="Subject Marks"
                extra={
                    <Button type="primary" onClick={() => navigate("/Admin/students/student/marks/" + studentID)}>
                        Add Marks
                    </Button>
                }
            >
                {subjectMarks && subjectMarks.length > 0 ? (
                    <>
                        <Row gutter={[24, 24]}>
                            <Col xs={24} md={12}>
                                <Table columns={columns} dataSource={data} pagination={false} />
                            </Col>
                            <Col xs={24} md={12}>
                                <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
                            </Col>
                        </Row>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Text type="secondary">No marks records found.</Text>
                    </div>
                )}
            </Card>
        );
    };

    return (
        <div style={{ padding: '24px' }}>
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        type="card"
                        items={[
                            { label: 'Details', key: '1', children: <StudentDetailsSection /> },
                            { label: 'Attendance', key: '2', children: <StudentAttendanceSection /> },
                            { label: 'Marks', key: '3', children: <StudentMarksSection /> }
                        ]}
                    />
                </>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
};

export default ViewStudent;