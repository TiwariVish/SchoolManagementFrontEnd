import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { Button, Space, Table, Spin, Typography, Card, Tooltip } from 'antd';
import { 
    UserDeleteOutlined, 
    EyeOutlined, 
    UserAddOutlined,
    PlusOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';

const { Title, Text } = Typography;

const ShowTeachers = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { teachersList, loading, error, response } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getAllTeachers(currentUser._id));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const deleteHandler = (deleteID, address) => {
        setMessage("Sorry the delete function has been disabled for now.");
        setShowPopup(true);
    };

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { 
            title: 'Subject', 
            dataIndex: 'teachSubject', 
            key: 'teachSubject',
            render: (text, record) => text ? text : (
                <Button 
                    type="primary" 
                    ghost 
                    icon={<PlusOutlined />}
                    onClick={() => navigate(`/Admin/teachers/choosesubject/${record.teachSclassID}/${record.id}`)}
                >
                    Add Subject
                </Button>
            )
        },
        { title: 'Class', dataIndex: 'teachSclass', key: 'teachSclass' },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Delete">
                        <Button 
                            danger 
                            icon={<UserDeleteOutlined />} 
                            onClick={() => deleteHandler(record.id, "Teacher")} 
                        />
                    </Tooltip>
                    <Button 
                        type="primary" 
                        icon={<EyeOutlined />} 
                        onClick={() => navigate("/Admin/teachers/teacher/" + record.id)}
                    >
                        View
                    </Button>
                </Space>
            )
        }
    ];

    const rows = teachersList.map((teacher) => {
        return {
            key: teacher._id,
            name: teacher.name,
            teachSubject: teacher.teachSubject?.subName || null,
            teachSclass: teacher.teachSclass.sclassName,
            teachSclassID: teacher.teachSclass._id,
            id: teacher._id,
        };
    });

    const actions = [
        {
            icon: <UserAddOutlined />, name: 'Add New Teacher',
            action: () => navigate("/Admin/teachers/chooseclass")
        },
        {
            icon: <DeleteOutlined style={{ color: 'red' }} />, name: 'Delete All Teachers',
            action: () => deleteHandler(currentUser._id, "Teachers")
        },
    ];

    if (error) {
        console.log(error);
    }

    return (
        <div style={{ padding: '24px' }}>
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : response ? (
                <Card style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '20px' }}>No teachers found.</Text>
                    <Button 
                        type="primary" 
                        icon={<UserAddOutlined />} 
                        onClick={() => navigate("/Admin/teachers/chooseclass")}
                    >
                        Add Teacher
                    </Button>
                </Card>
            ) : (
                <>
                    <Card 
                        title={<Title level={3} style={{ margin: 0 }}>Teachers List</Title>}
                        extra={
                            <Button 
                                type="primary" 
                                icon={<UserAddOutlined />} 
                                onClick={() => navigate("/Admin/teachers/chooseclass")}
                            >
                                Add Teacher
                            </Button>
                        }
                    >
                        <Table 
                            columns={columns} 
                            dataSource={rows} 
                            pagination={{
                                defaultPageSize: 5,
                                showSizeChanger: true,
                                pageSizeOptions: ['5', '10', '25', '100']
                            }}
                            scroll={{ x: 'max-content' }}
                        />
                    </Card>
                    <SpeedDialTemplate actions={actions} />
                </>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
};

export default ShowTeachers;