import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { Button, Space, Dropdown, Table, Spin, Typography, Card, Tooltip } from 'antd';
import { 
    UserDeleteOutlined, 
    EyeOutlined, 
    DownOutlined,
    UserAddOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import TableTemplate from '../../../components/TableTemplate';

const { Title } = Typography;

const ShowStudents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { studentsList, loading, error, response } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        dispatch(getAllStudents(currentUser._id));
    }, [currentUser._id, dispatch]);

    if (error) {
        console.log(error);
    }

    const deleteHandler = (deleteID, address) => {
        setMessage("Sorry the delete function has been disabled for now.");
        setShowPopup(true);
    }

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
        { id: 'sclassName', label: 'Class', minWidth: 170 },
    ];

    const studentRows = studentsList && studentsList.length > 0 && studentsList.map((student) => {
        return {
            name: student.name,
            rollNum: student.rollNum,
            sclassName: student.sclassName.sclassName,
            id: student._id,
        };
    });

    const StudentButtonHaver = ({ row }) => {
        const handleAttendance = () => {
            navigate("/Admin/students/student/attendance/" + row.id);
        }
        const handleMarks = () => {
            navigate("/Admin/students/student/marks/" + row.id);
        };

        const items = [
            {
                key: '1',
                label: 'Take Attendance',
                onClick: handleAttendance,
            },
            {
                key: '2',
                label: 'Provide Marks',
                onClick: handleMarks,
            },
        ];

        return (
            <Space size="middle">
                <Tooltip title="Delete">
                    <Button 
                        danger 
                        icon={<UserDeleteOutlined />} 
                        onClick={() => deleteHandler(row.id, "Student")} 
                    />
                </Tooltip>
                <Button 
                    type="primary" 
                    icon={<EyeOutlined />} 
                    onClick={() => navigate("/Admin/students/student/" + row.id)}
                >
                    View
                </Button>
                <Dropdown menu={{ items }} trigger={['click']}>
                    <Button>
                        Actions <DownOutlined />
                    </Button>
                </Dropdown>
            </Space>
        );
    };

    const actions = [
        {
            icon: <UserAddOutlined />, name: 'Add New Student',
            action: () => navigate("/Admin/addstudents")
        },
        {
            icon: <DeleteOutlined style={{ color: 'red' }} />, name: 'Delete All Students',
            action: () => deleteHandler(currentUser._id, "Students")
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    <Card 
                        title={<Title level={3} style={{ margin: 0 }}>Students List</Title>}
                        extra={
                            <Button 
                                type="primary" 
                                icon={<UserAddOutlined />} 
                                onClick={() => navigate("/Admin/addstudents")}
                            >
                                Add Student
                            </Button>
                        }
                    >
                        {response ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <Typography.Text type="secondary">No students found.</Typography.Text>
                            </div>
                        ) : (
                            <TableTemplate 
                                buttonHaver={StudentButtonHaver} 
                                columns={studentColumns} 
                                rows={studentRows} 
                            />
                        )}
                    </Card>
                    <SpeedDialTemplate actions={actions} />
                </>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
};

export default ShowStudents;