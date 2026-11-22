import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { Button, Card, Typography, Spin, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllNotices } from '../../../redux/noticeRelated/noticeHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import TableTemplate from '../../../components/TableTemplate';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';

const { Title, Text } = Typography;

const ShowNotices = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { noticesList, loading, error, response } = useSelector((state) => state.notice);
    const { currentUser } = useSelector(state => state.user);

    useEffect(() => {
        dispatch(getAllNotices(currentUser._id, "Notice"));
    }, [currentUser._id, dispatch]);

    if (error) {
        console.log(error);
    }

    const deleteHandler = (deleteID, address) => {
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch(getAllNotices(currentUser._id, "Notice"));
            });
    };

    const noticeColumns = [
        { id: 'title', label: 'Title', minWidth: 170 },
        { id: 'details', label: 'Details', minWidth: 100 },
        { id: 'date', label: 'Date', minWidth: 170 },
    ];

    const noticeRows = noticesList && noticesList.length > 0 && noticesList.map((notice) => {
        const date = new Date(notice.date);
        const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
        return {
            title: notice.title,
            details: notice.details,
            date: dateString,
            id: notice._id,
        };
    });

    const NoticeButtonHaver = ({ row }) => {
        return (
            <Tooltip title="Delete">
                <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => deleteHandler(row.id, "Notice")} 
                />
            </Tooltip>
        );
    };

    const actions = [
        {
            icon: <PlusOutlined />, name: 'Add New Notice',
            action: () => navigate("/Admin/addnotice")
        },
        {
            icon: <DeleteOutlined style={{ color: 'red' }} />, name: 'Delete All Notices',
            action: () => deleteHandler(currentUser._id, "Notices")
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : response ? (
                <Card style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '20px' }}>No notices found.</Text>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => navigate("/Admin/addnotice")}
                    >
                        Add Notice
                    </Button>
                </Card>
            ) : (
                <>
                    <Card 
                        title={<Title level={3} style={{ margin: 0 }}>Notices List</Title>}
                        extra={
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />} 
                                onClick={() => navigate("/Admin/addnotice")}
                            >
                                Add Notice
                            </Button>
                        }
                    >
                        {Array.isArray(noticesList) && noticesList.length > 0 &&
                            <TableTemplate buttonHaver={NoticeButtonHaver} columns={noticeColumns} rows={noticeRows} />
                        }
                    </Card>
                    <SpeedDialTemplate actions={actions} />
                </>
            )}
        </div>
    );
};

export default ShowNotices;